const pool = require("../config/database");

const rolePermissions = {
  Admin: ["*"],
  Manager: ["inventory:manage", "customers:manage", "orders:manage", "billing:manage", "purchases:manage", "reports:view", "staff:view", "audit:view"],
  Sales: ["customers:manage", "orders:manage", "reports:view"],
  "Inventory Clerk": ["inventory:manage", "purchases:manage", "reports:view"],
  Accountant: ["billing:manage", "reports:view"],
};

const requirePermission = (permission) => {
  return async (req, res, next) => {
    try {
      const roleResult = await pool.query(
        `SELECT name
         FROM roles
         WHERE id = $1 AND company_id = $2`,
        [req.user.role_id, req.user.company_id]
      );

      if (roleResult.rows.length === 0) {
        return res.status(403).json({ message: "Role not found for this user" });
      }

      const roleName = roleResult.rows[0].name;
      const permissions = rolePermissions[roleName] || [];

      if (!permissions.includes("*") && !permissions.includes(permission)) {
        return res.status(403).json({ message: "You do not have permission to perform this action" });
      }

      req.user.role_name = roleName;
      return next();
    } catch (error) {
      console.error("Permission check error:", error);
      return res.status(500).json({ message: "Failed to verify permissions" });
    }
  };
};

module.exports = {
  requirePermission,
  rolePermissions,
};
