const pool = require("../config/database");

const writeAuditLog = async ({
  req,
  companyId,
  actorType = "staff",
  actorId,
  actorEmail,
  action,
  entityType,
  entityId,
  details,
}) => {
  try {
    await pool.query(
      `INSERT INTO audit_logs (company_id, actor_type, actor_id, actor_email, action, entity_type, entity_id, details, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        companyId || null,
        actorType,
        actorId || null,
        actorEmail || null,
        action,
        entityType,
        entityId || null,
        details ? JSON.stringify(details) : null,
        req?.ip || null,
        req?.headers?.["user-agent"] || null,
      ]
    );
  } catch (error) {
    console.error("Audit log write failed:", error);
  }
};

module.exports = {
  writeAuditLog,
};
