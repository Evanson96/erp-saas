const express = require("express");
const {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} = require("../controllers/customerController");
const authMiddleware = require("../middleware/authMiddleware");
const { requirePermission } = require("../middleware/permissionMiddleware");
const validate = require("../middleware/validate");

const router = express.Router();

router.use(authMiddleware);
router.use(requirePermission("customers:manage"));

router.get("/", getCustomers);
router.get("/:id", getCustomerById);
router.post(
  "/",
  validate({
    name: { required: true, type: "string" },
  }),
  createCustomer
);
router.put(
  "/:id",
  validate({
    name: { required: true, type: "string" },
  }),
  updateCustomer
);
router.delete("/:id", deleteCustomer);

module.exports = router;
