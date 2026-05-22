const express = require("express");
const {
  createInvoiceFromOrder,
  getInvoiceById,
  getInvoices,
  getPayments,
  recordPayment,
} = require("../controllers/billingController");
const authMiddleware = require("../middleware/authMiddleware");
const { requirePermission } = require("../middleware/permissionMiddleware");
const validate = require("../middleware/validate");

const router = express.Router();

router.use(authMiddleware);
router.use(requirePermission("billing:manage"));

router.get("/invoices", getInvoices);
router.get("/invoices/:id", getInvoiceById);
router.post(
  "/invoices",
  validate({
    order_id: { required: true, type: "number" },
  }),
  createInvoiceFromOrder
);
router.get("/payments", getPayments);
router.post(
  "/payments",
  validate({
    invoice_id: { required: true, type: "number" },
    amount: { required: true, type: "number", min: 1 },
    method: { required: true, type: "string" },
  }),
  recordPayment
);

module.exports = router;
