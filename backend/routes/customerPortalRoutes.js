const express = require("express");
const {
  createCustomerOrder,
  getCustomerOrders,
  getCustomerProducts,
  loginCustomer,
  registerCustomer,
} = require("../controllers/customerPortalController");
const customerAuthMiddleware = require("../middleware/customerAuthMiddleware");
const validate = require("../middleware/validate");

const router = express.Router();

router.post(
  "/register",
  validate({
    name: { required: true, type: "string" },
    email: { required: true, type: "string" },
    password: { required: true, type: "string", minLength: 6 },
  }),
  registerCustomer
);

router.post(
  "/login",
  validate({
    email: { required: true, type: "string" },
    password: { required: true, type: "string" },
  }),
  loginCustomer
);

router.get("/products", customerAuthMiddleware, getCustomerProducts);
router.get("/orders", customerAuthMiddleware, getCustomerOrders);
router.post(
  "/orders",
  customerAuthMiddleware,
  validate({
    items: { required: true, type: "array" },
  }),
  createCustomerOrder
);

module.exports = router;
