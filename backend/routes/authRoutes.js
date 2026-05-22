const express = require("express");
const { registerCompany, registerUser, login, getMe } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const { requirePermission } = require("../middleware/permissionMiddleware");
const validate = require("../middleware/validate");

const router = express.Router();

router.post(
  "/register-company",
  validate({
    companyName: { required: true, type: "string" },
    userName: { required: true, type: "string" },
    userEmail: { required: true, type: "string" },
    password: { required: true, type: "string", minLength: 6 },
  }),
  registerCompany
);
router.post(
  "/register-user",
  authMiddleware,
  requirePermission("*"),
  validate({
    company_id: { required: true, type: "number" },
    name: { required: true, type: "string" },
    email: { required: true, type: "string" },
    password: { required: true, type: "string", minLength: 6 },
  }),
  registerUser
);
router.post(
  "/login",
  validate({
    email: { required: true, type: "string" },
    password: { required: true, type: "string" },
  }),
  login
);
router.get("/me", authMiddleware, getMe);

module.exports = router;
