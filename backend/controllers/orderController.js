const pool = require("../config/database");

const generateOrderNumber = () => {
  return `ORD-${Date.now()}`;
};

const getOrders = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT orders.id,
              orders.company_id,
              orders.customer_id,
              customers.name AS customer_name,
              orders.order_number,
              orders.status,
              orders.total_amount,
              orders.order_date,
              orders.created_at,
              orders.updated_at
       FROM orders
       JOIN customers ON customers.id = orders.customer_id
       WHERE orders.company_id = $1
       ORDER BY orders.id DESC`,
      [req.user.company_id]
    );

    return res.status(200).json({ orders: result.rows });
  } catch (error) {
    console.error("Get orders error:", error);
    return res.status(500).json({ message: "Failed to get orders" });
  }
};

const getOrderById = async (req, res) => {
  try {
    const orderResult = await pool.query(
      `SELECT orders.id,
              orders.company_id,
              orders.customer_id,
              customers.name AS customer_name,
              orders.order_number,
              orders.status,
              orders.total_amount,
              orders.order_date,
              orders.created_at,
              orders.updated_at
       FROM orders
       JOIN customers ON customers.id = orders.customer_id
       WHERE orders.id = $1 AND orders.company_id = $2`,
      [req.params.id, req.user.company_id]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    const itemsResult = await pool.query(
      `SELECT order_items.id,
              order_items.product_id,
              products.name AS product_name,
              products.sku,
              order_items.quantity,
              order_items.unit_price,
              order_items.line_total
       FROM order_items
       JOIN products ON products.id = order_items.product_id
       WHERE order_items.order_id = $1 AND order_items.company_id = $2
       ORDER BY order_items.id ASC`,
      [req.params.id, req.user.company_id]
    );

    return res.status(200).json({
      order: {
        ...orderResult.rows[0],
        items: itemsResult.rows,
      },
    });
  } catch (error) {
    console.error("Get order error:", error);
    return res.status(500).json({ message: "Failed to get order" });
  }
};

const createOrder = async (req, res) => {
  const client = await pool.connect();

  try {
    const { customer_id, items } = req.body;

    if (!customer_id || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Customer ID and at least one order item are required" });
    }

    await client.query("BEGIN");

    const customerResult = await client.query(
      "SELECT id FROM customers WHERE id = $1 AND company_id = $2",
      [customer_id, req.user.company_id]
    );

    if (customerResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Customer not found" });
    }

    let totalAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      if (!item.product_id || !item.quantity || item.quantity <= 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({ message: "Each item must include product_id and quantity greater than 0" });
      }

      const productResult = await client.query(
        `SELECT id, name, price, stock_quantity
         FROM products
         WHERE id = $1 AND company_id = $2 AND is_active = TRUE
         FOR UPDATE`,
        [item.product_id, req.user.company_id]
      );

      if (productResult.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({ message: `Product ${item.product_id} not found` });
      }

      const product = productResult.rows[0];

      if (product.stock_quantity < item.quantity) {
        await client.query("ROLLBACK");
        return res.status(409).json({ message: `${product.name} does not have enough stock` });
      }

      const unitPrice = Number(product.price);
      const lineTotal = unitPrice * Number(item.quantity);
      totalAmount += lineTotal;

      validatedItems.push({
        product_id: product.id,
        quantity: Number(item.quantity),
        unit_price: unitPrice,
        line_total: lineTotal,
      });
    }

    const orderResult = await client.query(
      `INSERT INTO orders (company_id, customer_id, order_number, status, total_amount)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, company_id, customer_id, order_number, status, total_amount, order_date, created_at, updated_at`,
      [req.user.company_id, customer_id, generateOrderNumber(), "pending", totalAmount]
    );

    const order = orderResult.rows[0];
    const createdItems = [];

    for (const item of validatedItems) {
      const itemResult = await client.query(
        `INSERT INTO order_items (company_id, order_id, product_id, quantity, unit_price, line_total)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, company_id, order_id, product_id, quantity, unit_price, line_total`,
        [req.user.company_id, order.id, item.product_id, item.quantity, item.unit_price, item.line_total]
      );

      await client.query(
        `UPDATE products
         SET stock_quantity = stock_quantity - $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $2 AND company_id = $3`,
        [item.quantity, item.product_id, req.user.company_id]
      );

      createdItems.push(itemResult.rows[0]);
    }

    await client.query("COMMIT");

    return res.status(201).json({
      message: "Order created successfully",
      order: {
        ...order,
        items: createdItems,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Create order error:", error);
    return res.status(500).json({ message: "Failed to create order" });
  } finally {
    client.release();
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ["pending", "paid", "shipped", "completed", "cancelled"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid order status" });
    }

    const result = await pool.query(
      `UPDATE orders
       SET status = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND company_id = $3
       RETURNING id, company_id, customer_id, order_number, status, total_amount, order_date, created_at, updated_at`,
      [status, req.params.id, req.user.company_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.status(200).json({
      message: "Order status updated successfully",
      order: result.rows[0],
    });
  } catch (error) {
    console.error("Update order status error:", error);
    return res.status(500).json({ message: "Failed to update order status" });
  }
};

module.exports = {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
};
