const express = require("express");
const HolyOrdersRequest = require("../models/HolyOrdersRequest");
const { logActivity, generateRequestNumber } = require("../utils/helpers");

const router = express.Router();

// POST - Create holy orders request
router.post("/", async (req, res) => {
  try {
    console.log("📥 Received holy orders request:", req.body);
    
    const requestNumber = generateRequestNumber("HOLY");
    
    const requestData = {
      ...req.body,
      requestNumber: requestNumber,
      status: 'pending',
      submittedByEmail: req.body.submittedByEmail || 'admin@sjmp.com'
    };
    
    const newRequest = await HolyOrdersRequest.create(requestData);
    await logActivity("CREATE", "holyordersrequests", newRequest.name, newRequest.email);
    console.log("✅ Holy orders request created:", newRequest);
    res.status(201).json(newRequest);
  } catch (err) {
    console.error("❌ Failed to create holy orders request:", err.message);
    res.status(400).json({ message: "Failed to create holy orders request: " + err.message });
  }
});

// GET all holy orders requests
router.get("/", async (req, res) => {
  try {
    console.log("📤 Fetching all holy orders requests...");
    const requests = await HolyOrdersRequest.find().sort({ createdAt: -1 }).lean();
    console.log(`✅ Found ${requests.length} holy orders requests`);
    res.json(requests);
  } catch (err) {
    console.error("❌ Failed to fetch holy orders requests:", err.message);
    res.status(500).json({ message: "Failed to fetch holy orders requests: " + err.message });
  }
});

// PUT - Update holy orders request
router.put("/:id", async (req, res) => {
  try {
    console.log("🔄 Updating holy orders request:", req.params.id, req.body);
    
    const updateData = { 
      ...req.body,
      lastUpdated: new Date()
    };
    const actionBy = 'admin';
    
    if (updateData.status === 'cancelled' && updateData.cancellation_reason) {
      updateData.cancelled_by = actionBy;
      updateData.cancelled_at = new Date();
      updateData.rejection_reason = '';
      updateData.rejected_by = '';
      updateData.rejected_at = null;
    } else if (updateData.status === 'rejected' && updateData.rejection_reason) {
      updateData.rejected_by = actionBy;
      updateData.rejected_at = new Date();
      updateData.cancellation_reason = '';
      updateData.cancelled_by = '';
      updateData.cancelled_at = null;
    } else if (updateData.status === 'pending') {
      updateData.cancellation_reason = '';
      updateData.rejection_reason = '';
      updateData.cancelled_by = '';
      updateData.rejected_by = '';
      updateData.cancelled_at = null;
      updateData.rejected_at = null;
    }
    
    const updatedRequest = await HolyOrdersRequest.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true }
    );
    
    if (!updatedRequest) {
      console.log("❌ Holy orders request not found:", req.params.id);
      return res.status(404).json({ message: "Request not found" });
    }
    
    await logActivity("UPDATE", "holyordersrequests", updatedRequest.name, updatedRequest.email);
    console.log("✅ Holy orders request updated:", updatedRequest);
    res.json(updatedRequest);
  } catch (err) {
    console.error("❌ Failed to update holy orders request:", err.message);
    res.status(400).json({ message: "Failed to update request: " + err.message });
  }
});

// DELETE - Remove holy orders request
router.delete("/:id", async (req, res) => {
  try {
    const deletedRequest = await HolyOrdersRequest.findByIdAndDelete(req.params.id);
    if (!deletedRequest) {
      console.log("❌ Holy orders request not found:", req.params.id);
      return res.status(404).json({ message: "Request not found" });
    }
    await logActivity("DELETE", "holyordersrequests", deletedRequest.name, deletedRequest.email);
    console.log("✅ Holy orders request deleted:", deletedRequest.name);
    res.json({ message: "Request deleted successfully" });
  } catch (err) {
    console.error("❌ Failed to delete holy orders request:", err.message);
    res.status(400).json({ message: "Failed to delete request" });
  }
});

module.exports = router;