import express from "express";
import cors from "cors";

import { notFound } from "./middleware/notFound.middleware";
import { errorHandler } from "./middleware/error.middleware";

import authRoutes from "./routes/auth.routes";
import customerRoutes from "./routes/customer.routes";
import productRoutes from "./routes/product.routes";
import stockRoutes from "./routes/stock.routes";
import challanRoutes from "./routes/challan.routes";
import dashboardRoutes from "./routes/dashboard.routes";

const app = express();

// ===============================
// Global Middleware
// ===============================

app.use(cors());
app.use(express.json());

// ===============================
// Health Check
// ===============================

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Fundstrom ERP API is running",
    timestamp: new Date().toISOString(),
  });
});

// ===============================
// API Routes
// ===============================

// Authentication
app.use("/api/auth", authRoutes);

// Customer CRM
app.use("/api/customers", customerRoutes);

// Products
app.use("/api/products", productRoutes);

// Stock & Inventory
app.use("/api/stock", stockRoutes);

// Sales Challans
app.use("/api/challans", challanRoutes);

// Dashboard
app.use("/api/dashboard", dashboardRoutes);

// ===============================
// Error Handling
// ===============================

// 404 handler — must be after all routes
app.use(notFound);

// Global error handler — must be last
app.use(errorHandler);

export default app;