const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/database");
const {
  sendCompanyNewOrderEmail,
  sendCustomerOrderConfirmationEmail,
  sendCustomerWelcomeEmail,
} = require("../utils/emailService");

const SALT_ROUNDS = 10;

const createCustomerToken = (account) => {
  return jwt.sign(
    {
      type: "customer",
      id: account.id,
      company_id: account.company_id,
      customer_id: account.customer_id,
      email: account.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

const registerCustomer = async (req, res) => {
  const client = await pool.connect();

  try {
    const { companyEmail, companyId, name, email, phone, address, password } = req.body;

    if ((!companyEmail && !companyId) || !name || !email || !password) {
      return res.status(400).json({
        message: "Company email or company ID, name, email, and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
      });
    }

    await client.query("BEGIN");

    const companyResult = await client.query(
      `SELECT id, name, email
       FROM companies
       WHERE id = COALESCE($1, id) AND ($2::varchar IS NULL OR email = $2)
       LIMIT 1`,
      [companyId ? Number(companyId) : null, companyEmail || null]
    );

    if (companyResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        message: "Company not found. Ask the company for its registered company email.",
      });
    }

    const company = companyResult.rows[0];

    const existingAccount = await client.query(
      "SELECT id FROM customer_accounts WHERE company_id = $1 AND email = $2",
      [company.id, email]
    );

    if (existingAccount.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(409).json({
        message: "A customer account with this email already exists for this company",
      });
    }

    let customer;
    const existingCustomer = await client.query(
      "SELECT id, company_id, name, email, phone, address FROM customers WHERE company_id = $1 AND email = $2",
      [company.id, email]
    );

    if (existingCustomer.rows.length > 0) {
      customer = existingCustomer.rows[0];
    } else {
      const customerResult = await client.query(
        `INSERT INTO customers (company_id, name, email, phone, address)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, company_id, name, email, phone, address, created_at`,
        [company.id, name, email, phone || null, address || null]
      );
      customer = customerResult.rows[0];
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const accountResult = await client.query(
      `INSERT INTO customer_accounts (company_id, customer_id, name, email, password_hash)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, company_id, customer_id, name, email, is_active, created_at`,
      [company.id, customer.id, name, email, passwordHash]
    );

    const account = accountResult.rows[0];
    const token = createCustomerToken(account);

    await client.query("COMMIT");

    await sendCustomerWelcomeEmail({
      customerEmail: account.email,
      customerName: account.name,
      companyName: company.name,
    });

    return res.status(201).json({
      message: "Customer account registered successfully",
      token,
      company,
      customer,
      account,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Customer registration error:", error);
    return res.status(500).json({ message: "Failed to register customer account" });
  } finally {
    client.release();
  }
};

const loginCustomer = async (req, res) => {
  try {
    const { companyEmail, companyId, email, password } = req.body;

    if ((!companyEmail && !companyId) || !email || !password) {
      return res.status(400).json({
        message: "Company email or company ID, email, and password are required",
      });
    }

    const accountResult = await pool.query(
      `SELECT customer_accounts.id,
              customer_accounts.company_id,
              customer_accounts.customer_id,
              customer_accounts.name,
              customer_accounts.email,
              customer_accounts.password_hash,
              customer_accounts.is_active,
              companies.name AS company_name,
              companies.email AS company_email
       FROM customer_accounts
       JOIN companies ON companies.id = customer_accounts.company_id
       WHERE customer_accounts.email = $1
         AND companies.id = COALESCE($2, companies.id)
         AND ($3::varchar IS NULL OR companies.email = $3)
       LIMIT 1`,
      [email, companyId ? Number(companyId) : null, companyEmail || null]
    );

    if (accountResult.rows.length === 0) {
      return res.status(401).json({ message: "Invalid customer login details" });
    }

    const account = accountResult.rows[0];

    if (!account.is_active) {
      return res.status(403).json({ message: "Customer account is inactive" });
    }

    const passwordMatches = await bcrypt.compare(password, account.password_hash);

    if (!passwordMatches) {
      return res.status(401).json({ message: "Invalid customer login details" });
    }

    delete account.password_hash;
    const token = createCustomerToken(account);

    return res.status(200).json({
      message: "Customer login successful",
      token,
      account,
      company: {
        id: account.company_id,
        name: account.company_name,
        email: account.company_email,
      },
    });
  } catch (error) {
    console.error("Customer login error:", error);
    return res.status(500).json({ message: "Failed to login customer" });
  }
};

const getCustomerProducts = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, sku, description, price, stock_quantity
       FROM products
       WHERE company_id = $1 AND is_active = TRUE AND stock_quantity > 0
       ORDER BY name ASC`,
      [req.customer.company_id]
    );

    return res.status(200).json({ products: result.rows });
  } catch (error) {
    console.error("Get customer products error:", error);
    return res.status(500).json({ message: "Failed to load products" });
  }
};

const getCustomerOrders = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, order_number, status, total_amount, order_date, created_at
       FROM orders
       WHERE company_id = $1 AND customer_id = $2
       ORDER BY id DESC`,
      [req.customer.company_id, req.customer.customer_id]
    );

    return res.status(200).json({ orders: result.rows });
  } catch (error) {
    console.error("Get customer orders error:", error);
    return res.status(500).json({ message: "Failed to load customer orders" });
  }
};

const createCustomerOrder = async (req, res) => {
  const client = await pool.connect();

  try {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "At least one order item is required" });
    }

    await client.query("BEGIN");

    let totalAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      if (!item.product_id || !item.quantity || Number(item.quantity) <= 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({ message: "Each item must include product and quantity" });
      }

      const productResult = await client.query(
        `SELECT id, name, price, stock_quantity
         FROM products
         WHERE id = $1 AND company_id = $2 AND is_active = TRUE
         FOR UPDATE`,
        [item.product_id, req.customer.company_id]
      );

      if (productResult.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({ message: `Product ${item.product_id} not found` });
      }

      const product = productResult.rows[0];
      const quantity = Number(item.quantity);

      if (Number(product.stock_quantity) < quantity) {
        await client.query("ROLLBACK");
        return res.status(409).json({ message: `${product.name} does not have enough stock` });
      }

      const unitPrice = Number(product.price);
      const lineTotal = unitPrice * quantity;
      totalAmount += lineTotal;

      validatedItems.push({
        product_id: product.id,
        quantity,
        unit_price: unitPrice,
        line_total: lineTotal,
      });
    }

    const orderResult = await client.query(
      `INSERT INTO orders (company_id, customer_id, order_number, status, total_amount)
       VALUES ($1, $2, $3, 'pending', $4)
       RETURNING id, company_id, customer_id, order_number, status, total_amount, order_date, created_at`,
      [req.customer.company_id, req.customer.customer_id, `WEB-${Date.now()}`, totalAmount]
    );

    const order = orderResult.rows[0];
    const createdItems = [];

    for (const item of validatedItems) {
      const itemResult = await client.query(
        `INSERT INTO order_items (company_id, order_id, product_id, quantity, unit_price, line_total)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, product_id, quantity, unit_price, line_total`,
        [req.customer.company_id, order.id, item.product_id, item.quantity, item.unit_price, item.line_total]
      );

      await client.query(
        `UPDATE products
         SET stock_quantity = stock_quantity - $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $2 AND company_id = $3`,
        [item.quantity, item.product_id, req.customer.company_id]
      );

      createdItems.push(itemResult.rows[0]);
    }

    await client.query("COMMIT");

    const notificationResult = await pool.query(
      `SELECT customers.name AS customer_name,
              customers.email AS customer_email,
              companies.name AS company_name,
              companies.email AS company_email
       FROM customers
       JOIN companies ON companies.id = customers.company_id
       WHERE customers.id = $1 AND customers.company_id = $2`,
      [req.customer.customer_id, req.customer.company_id]
    );

    if (notificationResult.rows.length > 0) {
      const notification = notificationResult.rows[0];

      await sendCustomerOrderConfirmationEmail({
        customerEmail: notification.customer_email,
        customerName: notification.customer_name,
        order,
      });

      await sendCompanyNewOrderEmail({
        companyEmail: notification.company_email,
        companyName: notification.company_name,
        customerName: notification.customer_name,
        order,
      });
    }

    return res.status(201).json({
      message: "Order placed successfully",
      order: {
        ...order,
        items: createdItems,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Create customer order error:", error);
    return res.status(500).json({ message: "Failed to place order" });
  } finally {
    client.release();
  }
};

module.exports = {
  registerCustomer,
  loginCustomer,
  getCustomerProducts,
  getCustomerOrders,
  createCustomerOrder,
};
