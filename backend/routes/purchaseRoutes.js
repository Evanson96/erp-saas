const express = require("express");
const {
  createPurchaseOrder,
  createSupplier,
  getPurchaseOrders,
  getSuppliers,
  receivePurchaseOrder,
} = require("../controllers/purchaseController");
const authMiddleware = require("../middleware/authMiddleware");
const { requirePermission } = require("../middleware/permissionMiddleware");
const validate = require("../middleware/validate");

const router = express.Router();

router.use(authMiddleware);
router.use(requirePermission("purchases:manage"));

router.get("/suppliers", getSuppliers);
router.post(
  "/suppliers",
  validate({
    name: { required: true, type: "string" },
  }),
  createSupplier
);
router.get("/purchase-orders", getPurchaseOrders);
router.post(
  "/purchase-orders",
  validate({
    supplier_id: { required: true, type: "number" },
    items: { required: true, type: "array" },
  }),
  createPurchaseOrder
);
router.patch("/purchase-orders/:id/receive", receivePurchaseOrder);

module.exports = router;
