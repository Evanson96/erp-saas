const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/database");

const SALT_ROUNDS = 10;

const createToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      company_id: user.company_id,
      role_id: user.role_id,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

const registerCompany = async (req, res) => {
  const client = await pool.connect();

  try {
    const { companyName, companyEmail, companyPhone, companyAddress, userName, userEmail, password } = req.body;

    if (!companyName || !userName || !userEmail || !password) {
      return res.status(400).json({
        message: "Company name, user name, user email, and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
      });
    }

    await client.query("BEGIN");

    const existingUser = await client.query("SELECT id FROM users WHERE email = $1", [userEmail]);

    if (existingUser.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(409).json({
        message: "A user with this email already exists",
      });
    }

    if (companyEmail) {
      const existingCompany = await client.query("SELECT id FROM companies WHERE email = $1", [companyEmail]);

      if (existingCompany.rows.length > 0) {
        await client.query("ROLLBACK");
        return res.status(409).json({
          message: "A company with this email already exists",
        });
      }
    }

    const companyResult = await client.query(
      `INSERT INTO companies (name, email, phone, address)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, phone, address, created_at`,
      [companyName, companyEmail || null, companyPhone || null, companyAddress || null]
    );

    const company = companyResult.rows[0];

    await client.query(
      `INSERT INTO roles (company_id, name, description)
       VALUES
         ($1, 'Admin', 'Full access to all company modules'),
         ($1, 'Manager', 'Operational access to sales, inventory, customers, billing, and reports'),
         ($1, 'Sales', 'Access to customers and sales orders'),
         ($1, 'Inventory Clerk', 'Access to inventory management'),
         ($1, 'Accountant', 'Access to billing, payments, and reports')
       ON CONFLICT (company_id, name) DO UPDATE
       SET description = EXCLUDED.description,
           updated_at = CURRENT_TIMESTAMP`,
      [company.id]
    );

    const roleResult = await client.query(
      "SELECT id, company_id, name, description FROM roles WHERE company_id = $1 AND name = 'Admin'",
      [company.id]
    );

    const role = roleResult.rows[0];
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const userResult = await client.query(
      `INSERT INTO users (company_id, role_id, name, email, password_hash)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, company_id, role_id, name, email, is_active, created_at`,
      [company.id, role.id, userName, userEmail, passwordHash]
    );

    const user = userResult.rows[0];
    const token = createToken(user);

    await client.query("COMMIT");

    return res.status(201).json({
      message: "Company registered successfully",
      token,
      company,
      user,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Register company error:", error);

    return res.status(500).json({
      message: "Failed to register company",
    });
  } finally {
    client.release();
  }
};

const registerUser = async (req, res) => {
  try {
    const { company_id, role_id, name, email, password } = req.body;

    if (!company_id || !name || !email || !password) {
      return res.status(400).json({
        message: "Company ID, name, email, and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
      });
    }

    const companyResult = await pool.query("SELECT id FROM companies WHERE id = $1", [company_id]);

    if (companyResult.rows.length === 0) {
      return res.status(404).json({
        message: "Company not found",
      });
    }

    if (role_id) {
      const roleResult = await pool.query("SELECT id FROM roles WHERE id = $1 AND company_id = $2", [role_id, company_id]);

      if (roleResult.rows.length === 0) {
        return res.status(404).json({
          message: "Role not found for this company",
        });
      }
    }

    const existingUser = await pool.query("SELECT id FROM users WHERE email = $1", [email]);

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        message: "A user with this email already exists",
      });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const userResult = await pool.query(
      `INSERT INTO users (company_id, role_id, name, email, password_hash)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, company_id, role_id, name, email, is_active, created_at`,
      [company_id, role_id || null, name, email, passwordHash]
    );

    return res.status(201).json({
      message: "User registered successfully",
      user: userResult.rows[0],
    });
  } catch (error) {
    console.error("Register user error:", error);

    return res.status(500).json({
      message: "Failed to register user",
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const userResult = await pool.query(
      `SELECT users.id,
              users.company_id,
              users.role_id,
              roles.name AS role_name,
              users.name,
              users.email,
              users.password_hash,
              users.is_active
       FROM users
       LEFT JOIN roles ON roles.id = users.role_id
       WHERE users.email = $1`,
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const user = userResult.rows[0];

    if (!user.is_active) {
      return res.status(403).json({
        message: "User account is inactive",
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    delete user.password_hash;

    const token = createToken(user);

    return res.status(200).json({
      message: "Login successful",
      token,
      user,
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Failed to login",
    });
  }
};

const getMe = async (req, res) => {
  try {
    const userResult = await pool.query(
      `SELECT users.id,
              users.company_id,
              users.role_id,
              roles.name AS role_name,
              users.name,
              users.email,
              users.is_active,
              users.created_at
       FROM users
       LEFT JOIN roles ON roles.id = users.role_id
       WHERE users.id = $1 AND users.company_id = $2`,
      [req.user.id, req.user.company_id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      user: userResult.rows[0],
    });
  } catch (error) {
    console.error("Get current user error:", error);

    return res.status(500).json({
      message: "Failed to get current user",
    });
  }
};

module.exports = {
  registerCompany,
  registerUser,
  login,
  getMe,
};
