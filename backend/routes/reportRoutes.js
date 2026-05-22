const express = require("express");
const { getSummaryReport } = require("../controllers/reportController");
const authMiddleware = require("../middleware/authMiddleware");
const { requirePermission } = require("../middleware/permissionMiddleware");

const router = express.Router();

router.use(authMiddleware);
router.use(requirePermission("reports:view"));

router.get("/summary", getSummaryReport);

module.exports = router;
