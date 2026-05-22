const bcrypt = require("bcrypt");
const pool = require("../config/database");
const { writeAuditLog } = require("../utils/auditLogger");

const SALT_ROUNDS = 10;

const getRoles = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, description
       FROM roles
       WHERE company_id = $1
       ORDER BY
         CASE name
           WHEN 'Admin' THEN 1
           WHEN 'Manager' THEN 2
           WHEN 'Sales' THEN 3
           WHEN 'Inventory Clerk' THEN 4
           WHEN 'Accountant' THEN 5
           ELSE 6
         END`,
      [req.user.company_id]
    );

    return res.status(200).json({ roles: result.rows });
  } catch (error) {
    console.error("Get roles error:", error);
    return res.status(500).json({ message: "Failed to load roles" });
  }
};

const getStaffUsers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT users.id,
              users.company_id,
              users.role_id,
              roles.name AS role_name,
              users.name,
              users.email,
              users.is_active,
              users.created_at,
              users.updated_at
       FROM users
       LEFT JOIN roles ON roles.id = users.role_id
       WHERE users.company_id = $1
       ORDER BY users.id DESC`,
      [req.user.company_id]
    );

    return res.status(200).json({ users: result.rows });
  } catch (error) {
    console.error("Get staff users error:", error);
    return res.status(500).json({ message: "Failed to load staff users" });
  }
};

const createStaffUser = async (req, res) => {
  try {
    const { name, email, password, role_id } = req.body;

    const roleResult = await pool.query(
      "SELECT id FROM roles WHERE id = $1 AND company_id = $2",
      [role_id, req.user.company_id]
    );

    if (roleResult.rows.length === 0) {
      return res.status(404).json({ message: "Role not found" });
    }

    const existingUser = await pool.query("SELECT id FROM users WHERE email = $1", [email]);

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: "A staff user with this email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const result = await pool.query(
      `INSERT INTO users (company_id, role_id, name, email, password_hash)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, company_id, role_id, name, email, is_active, created_at`,
      [req.user.company_id, role_id, name, email, passwordHash]
    );

    await writeAuditLog({
      req,
      companyId: req.user.company_id,
      actorId: req.user.id,
      actorEmail: req.user.email,
      action: "staff.created",
      entityType: "user",
      entityId: result.rows[0].id,
      details: { email: result.rows[0].email, role_id },
    });

    return res.status(201).json({
      message: "Staff user created successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Create staff user error:", error);
    return res.status(500).json({ message: "Failed to create staff user" });
  }
};

const updateStaffUser = async (req, res) => {
  try {
    const { name, role_id, is_active } = req.body;

    const roleResult = await pool.query(
      "SELECT id FROM roles WHERE id = $1 AND company_id = $2",
      [role_id, req.user.company_id]
    );

    if (roleResult.rows.length === 0) {
      return res.status(404).json({ message: "Role not found" });
    }

    const result = await pool.query(
      `UPDATE users
       SET name = $1,
           role_id = $2,
           is_active = $3,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 AND company_id = $5
       RETURNING id, company_id, role_id, name, email, is_active, created_at, updated_at`,
      [name, role_id, Boolean(is_active), req.params.id, req.user.company_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Staff user not found" });
    }

    await writeAuditLog({
      req,
      companyId: req.user.company_id,
      actorId: req.user.id,
      actorEmail: req.user.email,
      action: "staff.updated",
      entityType: "user",
      entityId: result.rows[0].id,
      details: { email: result.rows[0].email, role_id, is_active },
    });

    return res.status(200).json({
      message: "Staff user updated successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Update staff user error:", error);
    return res.status(500).json({ message: "Failed to update staff user" });
  }
};

module.exports = {
  getRoles,
  getStaffUsers,
  createStaffUser,
  updateStaffUser,
};
