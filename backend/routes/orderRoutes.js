const express = require("express");
const {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
} = require("../controllers/orderController");
const authMiddleware = require("../middleware/authMiddleware");
const { requirePermission } = require("../middleware/permissionMiddleware");
const validate = require("../middleware/validate");

const router = express.Router();

router.use(authMiddleware);
router.use(requirePermission("orders:manage"));

router.get("/", getOrders);
router.get("/:id", getOrderById);
router.post(
  "/",
  validate({
    customer_id: { required: true, type: "number" },
    items: { required: true, type: "array" },
  }),
  createOrder
);
router.patch(
  "/:id/status",
  validate({
    status: { required: true, type: "string" },
  }),
  updateOrderStatus
);

module.exports = router;
