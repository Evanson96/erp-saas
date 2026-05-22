const express = require("express");
const cors = require("cors");
const compression = require("compression");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const pool = require("./config/database");
const { validateEnv } = require("./config/env");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const customerRoutes = require("./routes/customerRoutes");
const orderRoutes = require("./routes/orderRoutes");
const customerPortalRoutes = require("./routes/customerPortalRoutes");
const billingRoutes = require("./routes/billingRoutes");
const staffRoutes = require("./routes/staffRoutes");
const purchaseRoutes = require("./routes/purchaseRoutes");
const auditRoutes = require("./routes/auditRoutes");
const reportRoutes = require("./routes/reportRoutes");
const leadRoutes = require("./routes/leadRoutes");
require("dotenv").config();

validateEnv();

const app = express();

const PORT = process.env.PORT || 5000;
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many requests. Please try again later.",
  },
});

app.disable("x-powered-by");
app.use(helmet());
app.use(compression());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(apiLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/customer-portal", customerPortalRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/audit-logs", auditRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/leads", leadRoutes);

app.get("/", (req, res) => {
  res.status(200).send("ERP SaaS API Running");
});

app.get("/health/db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() AS current_time");

    res.status(200).json({
      message: "Database connected",
      currentTime: result.rows[0].current_time,
    });
  } catch (error) {
    console.error("Database health check failed:", error);

    res.status(500).json({
      message: "Database connection failed",
    });
  }
});

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
