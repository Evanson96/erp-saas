const express = require("express");
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const authMiddleware = require("../middleware/authMiddleware");
const { requirePermission } = require("../middleware/permissionMiddleware");
const validate = require("../middleware/validate");

const router = express.Router();

router.use(authMiddleware);
router.use(requirePermission("inventory:manage"));

router.get("/", getProducts);
router.get("/:id", getProductById);
router.post(
  "/",
  validate({
    name: { required: true, type: "string" },
    sku: { required: true, type: "string" },
    price: { type: "number", min: 0 },
    stock_quantity: { type: "number", min: 0 },
    reorder_level: { type: "number", min: 0 },
  }),
  createProduct
);
router.put(
  "/:id",
  validate({
    name: { required: true, type: "string" },
    sku: { required: true, type: "string" },
    price: { type: "number", min: 0 },
    stock_quantity: { type: "number", min: 0 },
    reorder_level: { type: "number", min: 0 },
  }),
  updateProduct
);
router.delete("/:id", deleteProduct);

module.exports = router;
