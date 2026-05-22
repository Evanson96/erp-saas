const express = require("express");
const { createStaffUser, getRoles, getStaffUsers, updateStaffUser } = require("../controllers/staffController");
const authMiddleware = require("../middleware/authMiddleware");
const { requirePermission } = require("../middleware/permissionMiddleware");
const validate = require("../middleware/validate");

const router = express.Router();

router.use(authMiddleware);

router.get("/roles", requirePermission("staff:view"), getRoles);
router.get("/users", requirePermission("staff:view"), getStaffUsers);
router.post(
  "/users",
  requirePermission("*"),
  validate({
    name: { required: true, type: "string" },
    email: { required: true, type: "string" },
    password: { required: true, type: "string", minLength: 6 },
    role_id: { required: true, type: "number" },
  }),
  createStaffUser
);
router.put(
  "/users/:id",
  requirePermission("*"),
  validate({
    name: { required: true, type: "string" },
    role_id: { required: true, type: "number" },
  }),
  updateStaffUser
);

module.exports = router;
