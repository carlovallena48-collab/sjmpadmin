const express = require("express");
const bcrypt = require("bcrypt");
const WebsiteAdmin = require("../models/WebsiteAdmin");
const { logActivity } = require("../utils/helpers");

const router = express.Router();

// GET all staff
router.get("/", async (req, res) => {
  try {
    console.log("📤 Fetching all staff members...");
    const staff = await WebsiteAdmin.find().sort({ createdAt: -1 });
    console.log(`✅ Found ${staff.length} staff members`);
    
    const formattedStaff = staff.map(staffMember => ({
      _id: staffMember._id,
      name: staffMember.name,
      username: staffMember.username,
      role: staffMember.role,
      address: staffMember.address,
      contact: staffMember.contact,
      position: staffMember.position || "Staff",
      department: staffMember.department || "Administration",
      notes: staffMember.notes || "",
      isActive: staffMember.isActive !== undefined ? staffMember.isActive : true,
      createdAt: staffMember.createdAt,
      lastUpdated: staffMember.lastUpdated
    }));
    
    res.json(formattedStaff);
  } catch (err) {
    console.error("❌ Failed to fetch staff:", err.message);
    res.status(500).json({ message: "Failed to fetch staff" });
  }
});

// POST - Add new staff
router.post("/", async (req, res) => {
  const { name, username, password, address, contact, notes, position, department } = req.body;
  
  if (!name || !username || !password) {
    return res.status(400).json({ message: "Name, username, and password are required" });
  }

  try {
    const existingUser = await WebsiteAdmin.findOne({ username: username.trim().toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newStaff = await WebsiteAdmin.create({
      name: name.trim(),
      username: username.trim().toLowerCase(),
      password: hashedPassword,
      role: "Website Manager",
      address: address || "",
      contact: contact || "",
      position: position || "Staff",
      department: department || "Administration",
      notes: notes || "",
      isActive: true,
      createdAt: new Date(),
      lastUpdated: new Date()
    });

    await logActivity("CREATE", "websiteadmins", name, username);
    
    console.log("✅ Staff member created:", newStaff);
    
    const formattedResponse = {
      _id: newStaff._id,
      name: newStaff.name,
      username: newStaff.username,
      role: newStaff.role,
      address: newStaff.address,
      contact: newStaff.contact,
      position: newStaff.position,
      department: newStaff.department,
      notes: newStaff.notes,
      isActive: newStaff.isActive,
      createdAt: newStaff.createdAt,
      lastUpdated: newStaff.lastUpdated
    };
    
    res.status(201).json(formattedResponse);
    
  } catch (err) {
    console.error("❌ Failed to add staff:", err.message);
    res.status(400).json({ message: "Failed to add staff: " + err.message });
  }
});

// PUT - Update staff
router.put("/:id", async (req, res) => {
  try {
    const { name, username, address, contact, notes, position, department, isActive } = req.body;
    
    const updateData = {
      name: name?.trim(),
      username: username?.trim().toLowerCase(),
      address: address || "",
      contact: contact || "",
      notes: notes || "",
      position: position || "Staff",
      department: department || "Administration",
      isActive: isActive !== undefined ? isActive : true,
      lastUpdated: new Date()
    };

    if (username) {
      const existingUser = await WebsiteAdmin.findOne({ 
        username: username.trim().toLowerCase(),
        _id: { $ne: req.params.id }
      });
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }
    }

    const updatedStaff = await WebsiteAdmin.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true }
    );

    if (!updatedStaff) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    await logActivity("UPDATE", "websiteadmins", updatedStaff.name, updatedStaff.username);
    console.log("✅ Staff member updated:", updatedStaff);
    
    const formattedResponse = {
      _id: updatedStaff._id,
      name: updatedStaff.name,
      username: updatedStaff.username,
      role: updatedStaff.role,
      address: updatedStaff.address,
      contact: updatedStaff.contact,
      position: updatedStaff.position,
      department: updatedStaff.department,
      notes: updatedStaff.notes,
      isActive: updatedStaff.isActive,
      createdAt: updatedStaff.createdAt,
      lastUpdated: updatedStaff.lastUpdated
    };
    
    res.json(formattedResponse);

  } catch (err) {
    console.error("❌ Failed to update staff:", err.message);
    res.status(400).json({ message: "Failed to update staff: " + err.message });
  }
});

// PUT - Toggle staff active status
router.put("/:id/toggle-status", async (req, res) => {
  try {
    const staffMember = await WebsiteAdmin.findById(req.params.id);
    
    if (!staffMember) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    const newStatus = !staffMember.isActive;
    
    const updatedStaff = await WebsiteAdmin.findByIdAndUpdate(
      req.params.id, 
      { 
        isActive: newStatus,
        lastUpdated: new Date()
      }, 
      { new: true }
    );

    const action = newStatus ? "ACTIVATED" : "DEACTIVATED";
    await logActivity(action, "websiteadmins", updatedStaff.name, updatedStaff.username);
    
    console.log(`✅ Staff member ${newStatus ? 'activated' : 'deactivated'}:`, updatedStaff.name);
    
    const formattedResponse = {
      _id: updatedStaff._id,
      name: updatedStaff.name,
      username: updatedStaff.username,
      role: updatedStaff.role,
      address: updatedStaff.address,
      contact: updatedStaff.contact,
      position: updatedStaff.position,
      department: updatedStaff.department,
      notes: updatedStaff.notes,
      isActive: updatedStaff.isActive,
      createdAt: updatedStaff.createdAt,
      lastUpdated: updatedStaff.lastUpdated
    };
    
    res.json(formattedResponse);

  } catch (err) {
    console.error("❌ Failed to toggle staff status:", err.message);
    res.status(400).json({ message: "Failed to toggle staff status" });
  }
});

// DELETE - Remove staff
router.delete("/:id", async (req, res) => {
  try {
    const deletedStaff = await WebsiteAdmin.findByIdAndDelete(req.params.id);
    
    if (!deletedStaff) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    await logActivity("DELETE", "websiteadmins", deletedStaff.name, deletedStaff.username);
    console.log("✅ Staff member deleted:", deletedStaff.name);
    res.json({ message: "Staff member deleted successfully" });

  } catch (err) {
    console.error("❌ Failed to delete staff:", err.message);
    res.status(400).json({ message: "Failed to delete staff" });
  }
});

module.exports = router;