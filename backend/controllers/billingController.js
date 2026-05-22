const pool = require("../config/database");
const { writeAuditLog } = require("../utils/auditLogger");
const { sendInvoiceEmail, sendPaymentReceiptEmail } = require("../utils/emailService");

const getInvoiceStatus = (totalAmount, paidAmount) => {
  if (paidAmount <= 0) return "unpaid";
  if (paidAmount >= totalAmount) return "paid";
  return "partial";
};

const getInvoices = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT invoices.id,
              invoices.order_id,
              invoices.customer_id,
              customers.name AS customer_name,
              invoices.invoice_number,
              invoices.status,
              invoices.total_amount,
              invoices.paid_amount,
              invoices.balance_due,
              invoices.due_date,
              invoices.issued_at,
              invoices.created_at
       FROM invoices
       JOIN customers ON customers.id = invoices.customer_id
       WHERE invoices.company_id = $1
       ORDER BY invoices.id DESC`,
      [req.user.company_id]
    );

    return res.status(200).json({ invoices: result.rows });
  } catch (error) {
    console.error("Get invoices error:", error);
    return res.status(500).json({ message: "Failed to load invoices" });
  }
};

const getInvoiceById = async (req, res) => {
  try {
    const invoiceResult = await pool.query(
      `SELECT invoices.id,
              invoices.order_id,
              invoices.customer_id,
              customers.name AS customer_name,
              customers.email AS customer_email,
              customers.phone AS customer_phone,
              customers.address AS customer_address,
              companies.name AS company_name,
              companies.email AS company_email,
              companies.phone AS company_phone,
              companies.address AS company_address,
              invoices.invoice_number,
              invoices.status,
              invoices.total_amount,
              invoices.paid_amount,
              invoices.balance_due,
              invoices.due_date,
              invoices.issued_at
       FROM invoices
       JOIN customers ON customers.id = invoices.customer_id
       JOIN companies ON companies.id = invoices.company_id
       WHERE invoices.id = $1 AND invoices.company_id = $2`,
      [req.params.id, req.user.company_id]
    );

    if (invoiceResult.rows.length === 0) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    const itemsResult = await pool.query(
      `SELECT order_items.id,
              products.name AS product_name,
              products.sku,
              order_items.quantity,
              order_items.unit_price,
              order_items.line_total
       FROM order_items
       JOIN products ON products.id = order_items.product_id
       WHERE order_items.order_id = $1 AND order_items.company_id = $2
       ORDER BY order_items.id ASC`,
      [invoiceResult.rows[0].order_id, req.user.company_id]
    );

    const paymentsResult = await pool.query(
      `SELECT id, amount, method, reference, paid_at
       FROM payments
       WHERE invoice_id = $1 AND company_id = $2
       ORDER BY paid_at DESC`,
      [req.params.id, req.user.company_id]
    );

    return res.status(200).json({
      invoice: {
        ...invoiceResult.rows[0],
        items: itemsResult.rows,
        payments: paymentsResult.rows,
      },
    });
  } catch (error) {
    console.error("Get invoice error:", error);
    return res.status(500).json({ message: "Failed to load invoice" });
  }
};

const createInvoiceFromOrder = async (req, res) => {
  try {
    const { order_id, due_date } = req.body;

    const orderResult = await pool.query(
      `SELECT id, company_id, customer_id, total_amount
       FROM orders
       WHERE id = $1 AND company_id = $2`,
      [order_id, req.user.company_id]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    const order = orderResult.rows[0];
    const invoiceNumber = `INV-${Date.now()}`;

    const result = await pool.query(
      `INSERT INTO invoices (company_id, order_id, customer_id, invoice_number, total_amount, paid_amount, balance_due, due_date)
       VALUES ($1, $2, $3, $4, $5, 0, $5, $6)
       RETURNING id, order_id, customer_id, invoice_number, status, total_amount, paid_amount, balance_due, due_date, issued_at`,
      [req.user.company_id, order.id, order.customer_id, invoiceNumber, order.total_amount, due_date || null]
    );

    await writeAuditLog({
      req,
      companyId: req.user.company_id,
      actorId: req.user.id,
      actorEmail: req.user.email,
      action: "invoice.created",
      entityType: "invoice",
      entityId: result.rows[0].id,
      details: { invoice_number: result.rows[0].invoice_number, order_id },
    });

    const customerResult = await pool.query(
      `SELECT customers.name, customers.email
       FROM customers
       WHERE customers.id = $1 AND customers.company_id = $2`,
      [order.customer_id, req.user.company_id]
    );

    if (customerResult.rows.length > 0) {
      await sendInvoiceEmail({
        customerEmail: customerResult.rows[0].email,
        customerName: customerResult.rows[0].name,
        invoice: result.rows[0],
      });
    }

    return res.status(201).json({
      message: "Invoice created successfully",
      invoice: result.rows[0],
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ message: "An invoice already exists for this order" });
    }

    console.error("Create invoice error:", error);
    return res.status(500).json({ message: "Failed to create invoice" });
  }
};

const getPayments = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT payments.id,
              payments.invoice_id,
              invoices.invoice_number,
              customers.name AS customer_name,
              payments.amount,
              payments.method,
              payments.reference,
              payments.paid_at
       FROM payments
       JOIN invoices ON invoices.id = payments.invoice_id
       JOIN customers ON customers.id = payments.customer_id
       WHERE payments.company_id = $1
       ORDER BY payments.id DESC`,
      [req.user.company_id]
    );

    return res.status(200).json({ payments: result.rows });
  } catch (error) {
    console.error("Get payments error:", error);
    return res.status(500).json({ message: "Failed to load payments" });
  }
};

const recordPayment = async (req, res) => {
  const client = await pool.connect();

  try {
    const { invoice_id, amount, method, reference } = req.body;
    const paymentAmount = Number(amount);

    await client.query("BEGIN");

    const invoiceResult = await client.query(
      `SELECT id, company_id, customer_id, total_amount, paid_amount, balance_due, status
       FROM invoices
       WHERE id = $1 AND company_id = $2
       FOR UPDATE`,
      [invoice_id, req.user.company_id]
    );

    if (invoiceResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Invoice not found" });
    }

    const invoice = invoiceResult.rows[0];

    if (invoice.status === "void") {
      await client.query("ROLLBACK");
      return res.status(409).json({ message: "Cannot record payment on a void invoice" });
    }

    if (paymentAmount > Number(invoice.balance_due)) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Payment amount cannot exceed invoice balance" });
    }

    const paymentResult = await client.query(
      `INSERT INTO payments (company_id, invoice_id, customer_id, amount, method, reference)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, invoice_id, customer_id, amount, method, reference, paid_at`,
      [req.user.company_id, invoice.id, invoice.customer_id, paymentAmount, method || "cash", reference || null]
    );

    const paidAmount = Number(invoice.paid_amount) + paymentAmount;
    const balanceDue = Number(invoice.total_amount) - paidAmount;
    const status = getInvoiceStatus(Number(invoice.total_amount), paidAmount);

    const updatedInvoiceResult = await client.query(
      `UPDATE invoices
       SET paid_amount = $1,
           balance_due = $2,
           status = $3,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 AND company_id = $5
       RETURNING id, invoice_number, status, total_amount, paid_amount, balance_due`,
      [paidAmount, balanceDue, status, invoice.id, req.user.company_id]
    );

    await client.query("COMMIT");

    await writeAuditLog({
      req,
      companyId: req.user.company_id,
      actorId: req.user.id,
      actorEmail: req.user.email,
      action: "payment.recorded",
      entityType: "payment",
      entityId: paymentResult.rows[0].id,
      details: {
        invoice_id: invoice.id,
        amount: paymentAmount,
        method: method || "cash",
      },
    });

    const customerResult = await pool.query(
      `SELECT customers.name, customers.email
       FROM customers
       WHERE customers.id = $1 AND customers.company_id = $2`,
      [invoice.customer_id, req.user.company_id]
    );

    if (customerResult.rows.length > 0) {
      await sendPaymentReceiptEmail({
        customerEmail: customerResult.rows[0].email,
        customerName: customerResult.rows[0].name,
        payment: paymentResult.rows[0],
        invoice: updatedInvoiceResult.rows[0],
      });
    }

    return res.status(201).json({
      message: "Payment recorded successfully",
      payment: paymentResult.rows[0],
      invoice: updatedInvoiceResult.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Record payment error:", error);
    return res.status(500).json({ message: "Failed to record payment" });
  } finally {
    client.release();
  }
};

module.exports = {
  getInvoices,
  getInvoiceById,
  createInvoiceFromOrder,
  getPayments,
  recordPayment,
};
