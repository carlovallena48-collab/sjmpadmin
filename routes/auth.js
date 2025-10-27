const express = require("express");
const bcrypt = require("bcryptjs");
const AdminAccount = require("../models/AdminAccount");
const WebsiteAdmin = require("../models/WebsiteAdmin");
const { logActivity } = require("../utils/helpers");

const router = express.Router();

// SIMPLE PASSWORD COMPARISON WITH FALLBACK
const comparePassword = async (inputPassword, storedPassword) => {
  try {
    // If password looks like bcrypt hash
    if (storedPassword.startsWith("$2a$") || storedPassword.startsWith("$2b$") || storedPassword.startsWith("$2")) {
      return await bcrypt.compare(inputPassword, storedPassword);
    }
    // Plain text fallback (temporary)
    console.log("⚠️ Using plain text password comparison");
    return inputPassword === storedPassword;
  } catch (error) {
    console.log("⚠️ Bcrypt failed, using plain text fallback");
    return inputPassword === storedPassword;
  }
};

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

// SUPER ADMIN LOGIN (FIXED)
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ success: false, message: "Username and password required" });
    }

    console.log(`🔐 Login attempt for: ${username}`);

    // Find admin
    const admin = await AdminAccount.findOne({ username: username.trim().toLowerCase() });
    if (!admin) {
      console.log("❌ Admin not found");
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    console.log(`✅ Admin found: ${admin.name}`);

    // Compare password
    const isMatch = await comparePassword(password, admin.password);
    
    if (!isMatch) {
      console.log("❌ Password mismatch");
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    console.log("✅ Login successful");

    res.json({ 
      success: true, 
      user: {
        id: admin._id,
        username: admin.username,
        name: admin.name,
        role: admin.role,
        address: admin.address,
        contact: admin.contact
      },
      userType: 'admin'
    });

  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ success: false, message: "Server error during login" });
  }
});

// WEBSITE STAFF LOGIN (FIXED)
router.post("/website/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ success: false, message: "Username and password required" });
    }

    console.log(`🔐 Staff login attempt for: ${username}`);

    // Find staff
    const staff = await WebsiteAdmin.findOne({ username: username.trim().toLowerCase() });
    if (!staff) {
      console.log("❌ Staff not found");
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    console.log(`✅ Staff found: ${staff.name}`);

    // Compare password
    const isMatch = await comparePassword(password, staff.password);
    
    if (!isMatch) {
      console.log("❌ Password mismatch");
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    console.log("✅ Staff login successful");

    res.json({ 
      success: true, 
      user: {
        id: staff._id,
        username: staff.username,
        name: staff.name,
        role: staff.role,
        address: staff.address,
        contact: staff.contact
      },
      userType: 'staff'
    });

  } catch (error) {
    console.error("❌ Staff login error:", error);
    res.status(500).json({ success: false, message: "Server error during login" });
  }
});

// EMERGENCY LOGIN (IF EVERYTHING FAILS)
router.post("/emergency-login", async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ success: false, message: "Username and password required" });
    }

    console.log(`🚨 EMERGENCY LOGIN for: ${username}`);

    // Try AdminAccount first
    let user = await AdminAccount.findOne({ username: username.trim().toLowerCase() });
    let userType = 'admin';
    
    // If not found, try WebsiteAdmin
    if (!user) {
      user = await WebsiteAdmin.findOne({ username: username.trim().toLowerCase() });
      userType = 'staff';
    }

    if (!user) {
      console.log("❌ User not found in any collection");
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    console.log(`✅ User found: ${user.name}, Type: ${userType}`);

    // SIMPLE PASSWORD CHECK - NO BCRYPT
    if (password === user.password) {
      console.log("✅ Emergency login successful (plain text match)");
      
      res.json({ 
        success: true, 
        user: {
          id: user._id,
          username: user.username,
          name: user.name,
          role: user.role,
          address: user.address,
          contact: user.contact
        },
        userType: userType
      });
    } else {
      console.log("❌ Password mismatch in emergency login");
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

  } catch (error) {
    console.error("❌ Emergency login error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;