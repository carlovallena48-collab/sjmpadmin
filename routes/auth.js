  const express = require("express");
 const bcrypt = require("bcryptjs");
  const AdminAccount = require("../models/AdminAccount"); // FIXED PATH
  const WebsiteAdmin = require("../models/WebsiteAdmin"); // FIXED PATH
  const { logActivity } = require("../utils/helpers"); // FIXED PATH

  const router = express.Router();

  // REGISTER
  router.post("/register", async (req, res) => {
    const { name, username, password, role, address, contact } = req.body;
    if (!name || !username || !password) return res.status(400).json({ success: false, message: "Name, username, and password are required" });

    try {
      const existingAdmin = await AdminAccount.findOne({ username: username.trim().toLowerCase() });
      const existingWebsiteAdmin = await WebsiteAdmin.findOne({ username: username.trim().toLowerCase() });
      
      if (existingAdmin || existingWebsiteAdmin) {
        return res.status(409).json({ success: false, message: "Username taken" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      
      let newUser;
      if (role === 'staff') {
        newUser = await WebsiteAdmin.create({
          name: name.trim(),
          username: username.trim().toLowerCase(),
          password: hashedPassword,
          role: "Website Manager",
          permissions: ["announcements", "events"],
          address,
          contact,
        });
        await logActivity("CREATE", "websiteadmins", name, username);
      } else {
        newUser = await AdminAccount.create({
          name: name.trim(),
          username: username.trim().toLowerCase(),
          password: hashedPassword,
          role: role || "Admin",
          address,
          contact,
        });
        await logActivity("CREATE", "adminaccount", name, username);
      }

      res.json({ 
        success: true, 
        message: "Account registered successfully", 
        user: newUser,
        userType: role === 'staff' ? 'staff' : 'admin'
      });
    } catch (err) {
      console.error("❌ Error in /register:", err.message);
      res.status(500).json({ success: false, message: "Server error" });
    }
  });

  // SUPER ADMIN LOGIN
  router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ success: false, message: "Username and password required" });

    try {
      const admin = await AdminAccount.findOne({ username: username.trim().toLowerCase() });
      if (!admin) return res.status(401).json({ success: false, message: "Invalid credentials" });

      const match = admin.password.startsWith("$2")
        ? await bcrypt.compare(password, admin.password)
        : password === admin.password;

      if (!match) return res.status(401).json({ success: false, message: "Invalid credentials" });

      res.json({ 
        success: true, 
        user: admin,
        userType: 'admin'
      });
    } catch (err) {
      console.error("❌ Error in /login:", err.message);
      res.status(500).json({ success: false, message: "Server error" });
    }
  });

  // WEBSITE STAFF LOGIN
  router.post("/website/login", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ success: false, message: "Username and password required" });

    try {
      const admin = await WebsiteAdmin.findOne({ username: username.trim().toLowerCase() });
      if (!admin) return res.status(401).json({ success: false, message: "Invalid credentials" });

      const match = admin.password.startsWith("$2")
        ? await bcrypt.compare(password, admin.password)
        : password === admin.password;

      if (!match) return res.status(401).json({ success: false, message: "Invalid credentials" });

      res.json({ 
        success: true, 
        user: admin,
        userType: 'staff'
      });
    } catch (err) {
      console.error("❌ Error in /website/login:", err.message);
      res.status(500).json({ success: false, message: "Server error" });
    }
  });

  module.exports = router;