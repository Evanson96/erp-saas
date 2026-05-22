const express = require("express");
const { getAuditLogs } = require("../controllers/auditController");
const authMiddleware = require("../middleware/authMiddleware");
const { requirePermission } = require("../middleware/permissionMiddleware");

const router = express.Router();

router.use(authMiddleware);
router.use(requirePermission("audit:view"));

router.get("/", getAuditLogs);

module.exports = router;
