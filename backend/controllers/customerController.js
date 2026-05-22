const pool = require("../config/database");
const { writeAuditLog } = require("../utils/auditLogger");

const getCustomers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, company_id, name, email, phone, address, created_at, updated_at
       FROM customers
       WHERE company_id = $1
       ORDER BY id DESC`,
      [req.user.company_id]
    );

    return res.status(200).json({ customers: result.rows });
  } catch (error) {
    console.error("Get customers error:", error);
    return res.status(500).json({ message: "Failed to get customers" });
  }
};

const getCustomerById = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, company_id, name, email, phone, address, created_at, updated_at
       FROM customers
       WHERE id = $1 AND company_id = $2`,
      [req.params.id, req.user.company_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Customer not found" });
    }

    return res.status(200).json({ customer: result.rows[0] });
  } catch (error) {
    console.error("Get customer error:", error);
    return res.status(500).json({ message: "Failed to get customer" });
  }
};

const createCustomer = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Customer name is required" });
    }

    const result = await pool.query(
      `INSERT INTO customers (company_id, name, email, phone, address)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, company_id, name, email, phone, address, created_at, updated_at`,
      [req.user.company_id, name, email || null, phone || null, address || null]
    );

    await writeAuditLog({
      req,
      companyId: req.user.company_id,
      actorId: req.user.id,
      actorEmail: req.user.email,
      action: "customer.created",
      entityType: "customer",
      entityId: result.rows[0].id,
      details: { email: result.rows[0].email, name: result.rows[0].name },
    });

    return res.status(201).json({
      message: "Customer created successfully",
      customer: result.rows[0],
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ message: "A customer with this email already exists" });
    }

    console.error("Create customer error:", error);
    return res.status(500).json({ message: "Failed to create customer" });
  }
};

const updateCustomer = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Customer name is required" });
    }

    const result = await pool.query(
      `UPDATE customers
       SET name = $1,
           email = $2,
           phone = $3,
           address = $4,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5 AND company_id = $6
       RETURNING id, company_id, name, email, phone, address, created_at, updated_at`,
      [name, email || null, phone || null, address || null, req.params.id, req.user.company_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Customer not found" });
    }

    await writeAuditLog({
      req,
      companyId: req.user.company_id,
      actorId: req.user.id,
      actorEmail: req.user.email,
      action: "customer.updated",
      entityType: "customer",
      entityId: result.rows[0].id,
      details: { email: result.rows[0].email, name: result.rows[0].name },
    });

    return res.status(200).json({
      message: "Customer updated successfully",
      customer: result.rows[0],
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ message: "A customer with this email already exists" });
    }

    console.error("Update customer error:", error);
    return res.status(500).json({ message: "Failed to update customer" });
  }
};

const deleteCustomer = async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM customers
       WHERE id = $1 AND company_id = $2
       RETURNING id`,
      [req.params.id, req.user.company_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Customer not found" });
    }

    await writeAuditLog({
      req,
      companyId: req.user.company_id,
      actorId: req.user.id,
      actorEmail: req.user.email,
      action: "customer.deleted",
      entityType: "customer",
      entityId: result.rows[0].id,
    });

    return res.status(200).json({ message: "Customer deleted successfully" });
  } catch (error) {
    if (error.code === "23503") {
      return res.status(409).json({ message: "Customer cannot be deleted because they have orders" });
    }

    console.error("Delete customer error:", error);
    return res.status(500).json({ message: "Failed to delete customer" });
  }
};

module.exports = {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};
