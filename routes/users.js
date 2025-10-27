const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const { logActivity } = require("../utils/helpers");

const router = express.Router();

// GET all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error("❌ Failed to fetch users:", err.message);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// POST - Create new user
router.post("/", async (req, res) => {
  const { password, fullName, email, address, contact } = req.body;
  if (!password || !fullName || !email) return res.status(400).json({ message: "Missing required fields" });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ fullName, email: email.toLowerCase(), password: hashedPassword, address, contact });
    await logActivity("CREATE", "users", fullName, email);
    res.status(201).json(newUser);
  } catch (err) {
    console.error("❌ Failed to add user:", err.message);
    res.status(400).json({ message: "Failed to add user" });
  }
});

// PUT - Update user
router.put("/:id", async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (updateData.password) updateData.password = await bcrypt.hash(updateData.password, 10);
    const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updatedUser) return res.status(404).json({ message: "User not found" });
    await logActivity("UPDATE", "users", updatedUser.fullName, updatedUser.email);
    res.json(updatedUser);
  } catch (err) {
    console.error("❌ Failed to update user:", err.message);
    res.status(400).json({ message: "Failed to update user" });
  }
});

// DELETE - Remove user
router.delete("/:id", async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ message: "User not found" });
    await logActivity("DELETE", "users", deletedUser.fullName, deletedUser.email);
    res.json({ message: "User deleted" });
  } catch (err) {
    console.error("❌ Failed to delete user:", err.message);
    res.status(400).json({ message: "Failed to delete user" });
  }
});

module.exports = router;