const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { logActivity } = require("../utils/helpers");

const router = express.Router();

// GET all users
router.get("/", async (req, res) => {
  try {
    console.log("📥 Fetching users from database...");
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    console.log(`✅ Found ${users.length} users`);
    res.json(users);
  } catch (err) {
    console.error("❌ Failed to fetch users:", err.message);
    res.status(500).json({
      message: "Failed to fetch users",
      error: err.message,
    });
  }
});

// POST - Create new user
router.post("/", async (req, res) => {
  const { password, fullName, email, address, contact, role } = req.body;

  if (!password || !fullName || !email) {
    return res.status(400).json({ message: "Missing required fields: password, fullName, email" });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      fullName,
      email: email.toLowerCase(),
      password: hashedPassword,
      address,
      contact,
      role: role || "Member",
    });

    await logActivity("CREATE", "users", fullName, email);

    // Return user without password
    const userResponse = { ...newUser._doc };
    delete userResponse.password;

    res.status(201).json(userResponse);
  } catch (err) {
    console.error("❌ Failed to add user:", err.message);
    res.status(400).json({
      message: "Failed to add user",
      error: err.message,
    });
  }
});

// PUT - Update user
router.put("/:id", async (req, res) => {
  try {
    const updateData = { ...req.body };

    // Only hash password if provided
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    } else {
      delete updateData.password;
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    await logActivity("UPDATE", "users", updatedUser.fullName, updatedUser.email);
    res.json(updatedUser);
  } catch (err) {
    console.error("❌ Failed to update user:", err.message);
    res.status(400).json({
      message: "Failed to update user",
      error: err.message,
    });
  }
});

// DELETE - Remove user
router.delete("/:id", async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    await logActivity("DELETE", "users", deletedUser.fullName, deletedUser.email);
    res.json({
      message: "User deleted successfully",
      deletedUser: {
        id: deletedUser._id,
        fullName: deletedUser.fullName,
        email: deletedUser.email,
      },
    });
  } catch (err) {
    console.error("❌ Failed to delete user:", err.message);
    res.status(400).json({
      message: "Failed to delete user",
      error: err.message,
    });
  }
});

// GET user by ID
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error("❌ Failed to fetch user:", err.message);
    res.status(400).json({
      message: "Failed to fetch user",
      error: err.message,
    });
  }
});

module.exports = router;