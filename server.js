  // ===============================================
  // San Jose Manggagawa Parish System - Server File
  // ===============================================

  const express = require("express");
  const mongoose = require("mongoose");
  const cors = require("cors");
  require("dotenv").config();

  const app = express();

  // ===============================================
  // Middleware
  // ===============================================
  app.use(cors());
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // ===============================================
  // MongoDB Connection
  // ===============================================
  if (!process.env.MONGO_URI) {
    console.error("❌ MONGO_URI is missing in .env file");
    process.exit(1);
  }

  mongoose
    .connect(process.env.MONGO_URI, { dbName: "sjmp" })
    .then(() => console.log("✅ Connected to MongoDB Atlas (sjmp DB)"))
    .catch((err) => {
      console.error("❌ MongoDB connection error:", err.message);
      process.exit(1);
    });

  // ===============================================
  // Safe Route Import Helper
  // ===============================================
  const safeImport = (path) => {
    try {
      const route = require(path);
      if (typeof route === "function") {
        console.log(`✅ Loaded route: ${path}`);
        return route;
      } else {
        console.warn(`⚠️  Skipped route (not exporting a function): ${path}`);
        return (req, res) => res.status(500).send("Invalid route export format");
      }
    } catch (err) {
      console.warn(`⚠️  Failed to load route: ${path}`);
      console.warn(`   → Reason: ${err.message}`);
      return (req, res) => res.status(404).send("Route file missing or invalid");
    }
  };

  // ===============================================
  // Register API Routes
  // ===============================================
  app.use("/api/auth", safeImport("./routes/auth"));
  app.use("/api/staff", safeImport("./routes/staff"));
  app.use("/api/users", safeImport("./routes/users"));
  app.use("/api/baptism", safeImport("./routes/baptism"));
  app.use("/api/confirmation", safeImport("./routes/confirmation"));
  app.use("/api/holy-orders", safeImport("./routes/holy-orders"));
  app.use("/api/pamisa", safeImport("./routes/pamisa"));
  app.use("/api/funeral", safeImport("./routes/funeral"));
  app.use("/api/blessing", safeImport("./routes/blessing"));
  app.use("/api/marriage", safeImport("./routes/marriage"));
  app.use("/api/certificates", safeImport("./routes/certificates"));
  app.use("/api/volunteer", safeImport("./routes/volunteer"));
  app.use("/api/schedules", safeImport("./routes/schedules"));
  app.use("/api/dashboard", safeImport("./routes/dashboard"));
  app.use("/api/reports", safeImport("./routes/reports"));
app.use("/api/sickcall", safeImport("./routes/sickcall"));
  // ===============================================
  // Optional Website Routes
  // ===============================================
  try {
    const websiteRoutes = require("./website-routes.js");
    app.use("/api", websiteRoutes);
    console.log("✅ Website routes loaded successfully");
  } catch (err) {
    console.log("ℹ️  website-routes.js not found, skipping...");
  }

  // ===============================================
  // Health Check Endpoint
  // ===============================================
  app.get("/health", (req, res) => {
    res.json({
      status: "OK",
      database:
        mongoose.connection.readyState === 1 ? "connected" : "disconnected",
      timestamp: new Date().toISOString(),
    });
  });

  // ===============================================
  // Root Endpoint
  // ===============================================
  app.get("/", (req, res) => {
    res.json({
      message: "San Jose Manggagawa Parish Admin System API",
      version: "1.0.0",
      endpoints: {
        auth: "/api/auth",
        dashboard: "/api/dashboard",
        reports: "/api/reports",
        sacraments: "/api/[sacrament-name]",
        health: "/health",
      },
    });
  });

  // ===============================================
  // Start Server
  // ===============================================
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () =>
    console.log(`✅ Server running at: http://localhost:${PORT}`)
  );
