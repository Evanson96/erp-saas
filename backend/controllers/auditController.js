const pool = require("../config/database");

const getAuditLogs = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id,
              actor_type,
              actor_id,
              actor_email,
              action,
              entity_type,
              entity_id,
              details,
              ip_address,
              created_at
       FROM audit_logs
       WHERE company_id = $1
       ORDER BY id DESC
       LIMIT 200`,
      [req.user.company_id]
    );

    return res.status(200).json({ auditLogs: result.rows });
  } catch (error) {
    console.error("Get audit logs error:", error);
    return res.status(500).json({ message: "Failed to load audit logs" });
  }
};

module.exports = {
  getAuditLogs,
};
