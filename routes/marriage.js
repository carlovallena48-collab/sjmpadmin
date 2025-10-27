const express = require("express");
const MarriageRequest = require("../models/MarriageRequest");
const { logActivity, generateRequestNumber } = require("../utils/helpers");

const router = express.Router();

// POST - Create marriage request
router.post("/", async (req, res) => {
  try {
    console.log("📥 Received marriage request:", req.body);
    
    const requestNumber = generateRequestNumber("MARRIAGE");
    
    const requestData = {
      ...req.body,
      requestNumber: requestNumber,
      status: 'pending',
      paymentStatus: 'pending',
      fee: 5000,
      submittedByEmail: req.body.submittedByEmail || 'admin@sjmp.com',
      createdAt: new Date(),
      lastUpdated: new Date()
    };
    
    console.log("📝 Processed marriage request data:", requestData);
    
    const newRequest = await MarriageRequest.create(requestData);
    await logActivity("CREATE", "marriagerequests", `${newRequest.groomName} & ${newRequest.brideName}`, newRequest.submittedByEmail);
    console.log("✅ Marriage request created:", newRequest);
    res.status(201).json(newRequest);
  } catch (err) {
    console.error("❌ Failed to create marriage request:", err.message);
    res.status(400).json({ message: "Failed to create marriage request: " + err.message });
  }
});

// GET all marriage requests
router.get("/", async (req, res) => {
  try {
    console.log("📤 Fetching all marriage requests...");
    const requests = await MarriageRequest.find().sort({ createdAt: -1 }).lean();
    console.log(`✅ Found ${requests.length} marriage requests`);
    res.json(requests);
  } catch (err) {
    console.error("❌ Failed to fetch marriage requests:", err.message);
    res.status(500).json({ message: "Failed to fetch marriage requests: " + err.message });
  }
});

// PUT - Update marriage request
router.put("/:id", async (req, res) => {
  try {
    console.log("🔄 Updating marriage request:", req.params.id, req.body);
    
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
    
    const updatedRequest = await MarriageRequest.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true }
    );
    
    if (!updatedRequest) {
      console.log("❌ Marriage request not found:", req.params.id);
      return res.status(404).json({ message: "Request not found" });
    }
    
    await logActivity("UPDATE", "marriagerequests", `${updatedRequest.groomName} & ${updatedRequest.brideName}`, updatedRequest.submittedByEmail);
    console.log("✅ Marriage request updated:", updatedRequest);
    res.json(updatedRequest);
  } catch (err) {
    console.error("❌ Failed to update marriage request:", err.message);
    res.status(400).json({ message: "Failed to update request: " + err.message });
  }
});

// PUT - Update payment
router.put("/:id/payment", async (req, res) => {
  try {
    console.log("💰 Updating payment for marriage request:", req.params.id, req.body);
    
    const paymentData = {
      paymentStatus: 'paid',
      paymentDate: req.body.paymentDate,
      paymentMethod: req.body.paymentMethod,
      paymentReference: req.body.paymentReference,
      paymentNotes: req.body.paymentNotes,
      lastUpdated: new Date()
    };
    
    const updatedRequest = await MarriageRequest.findByIdAndUpdate(
      req.params.id,
      paymentData,
      { new: true }
    );
    
    if (!updatedRequest) {
      console.log("❌ Marriage request not found:", req.params.id);
      return res.status(404).json({ message: "Request not found" });
    }
    
    await logActivity("PAYMENT_UPDATE", "marriagerequests", `${updatedRequest.groomName} & ${updatedRequest.brideName}`, updatedRequest.submittedByEmail);
    console.log("✅ Payment updated for marriage request:", updatedRequest);
    res.json(updatedRequest);
  } catch (err) {
    console.error("❌ Failed to update payment for marriage:", err.message);
    res.status(400).json({ message: "Failed to update payment: " + err.message });
  }
});

// DELETE - Remove marriage request
router.delete("/:id", async (req, res) => {
  try {
    const deletedRequest = await MarriageRequest.findByIdAndDelete(req.params.id);
    if (!deletedRequest) return res.status(404).json({ message: "Request not found" });
    await logActivity("DELETE", "marriagerequests", `${deletedRequest.groomName} & ${deletedRequest.brideName}`, deletedRequest.submittedByEmail);
    res.json({ message: "Request deleted" });
  } catch (err) {
    console.error("❌ Failed to delete marriage request:", err.message);
    res.status(400).json({ message: "Failed to delete request" });
  }
});

module.exports = router;