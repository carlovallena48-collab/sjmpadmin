const express = require("express");
const ConfirmationRequest = require("../models/ConfirmationRequest");
const { logActivity } = require("../utils/helpers");

const router = express.Router();

// POST - Create confirmation request
router.post("/", async (req, res) => {
  try {
    console.log("📥 Received confirmation request:", req.body);
    
    const confirmationFees = {
      'solo': 500,
      'common': 300
    };
    
    const requestData = {
      ...req.body,
      fee: confirmationFees[req.body.confirmationType] || 500,
      paymentStatus: 'pending',
      status: 'pending'
    };
    
    const newRequest = await ConfirmationRequest.create(requestData);
    await logActivity("CREATE", "kumpilrequests", newRequest.confirmandName, newRequest.contactNo);
    console.log("✅ Confirmation request created:", newRequest);
    res.status(201).json(newRequest);
  } catch (err) {
    console.error("❌ Failed to create confirmation request:", err.message);
    res.status(400).json({ message: "Failed to create confirmation request: " + err.message });
  }
});

// GET all confirmation requests
router.get("/", async (req, res) => {
  try {
    console.log("📤 Fetching all confirmation requests...");
    const requests = await ConfirmationRequest.find().sort({ createdAt: -1 }).lean();
    console.log(`✅ Found ${requests.length} confirmation requests`);
    res.json(requests);
  } catch (err) {
    console.error("❌ Failed to fetch confirmation requests:", err.message);
    res.status(500).json({ message: "Failed to fetch confirmation requests: " + err.message });
  }
});

// PUT - Update confirmation request
router.put("/:id", async (req, res) => {
  try {
    console.log("🔄 Updating confirmation request:", req.params.id, req.body);
    
    const updateData = { ...req.body };
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
    
    const updatedRequest = await ConfirmationRequest.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true }
    );
    
    if (!updatedRequest) {
      console.log("❌ Confirmation request not found:", req.params.id);
      return res.status(404).json({ message: "Request not found" });
    }
    
    await logActivity("UPDATE", "kumpilrequests", updatedRequest.confirmandName, updatedRequest.contactNo);
    console.log("✅ Confirmation request updated:", updatedRequest);
    res.json(updatedRequest);
  } catch (err) {
    console.error("❌ Failed to update confirmation request:", err.message);
    res.status(400).json({ message: "Failed to update request: " + err.message });
  }
});

// PUT - Update payment
router.put("/:id/payment", async (req, res) => {
  try {
    console.log("💰 Updating payment for confirmation request:", req.params.id, req.body);
    
    const paymentData = {
      paymentStatus: 'paid',
      paymentDate: req.body.paymentDate,
      paymentMethod: req.body.paymentMethod,
      paymentReference: req.body.paymentReference,
      paymentNotes: req.body.paymentNotes
    };
    
    const updatedRequest = await ConfirmationRequest.findByIdAndUpdate(
      req.params.id,
      paymentData,
      { new: true }
    );
    
    if (!updatedRequest) return res.status(404).json({ message: "Request not found" });
    
    await logActivity("PAYMENT_UPDATE", "kumpilrequests", updatedRequest.confirmandName, updatedRequest.contactNo);
    console.log("✅ Payment updated:", updatedRequest);
    res.json(updatedRequest);
  } catch (err) {
    console.error("❌ Failed to update payment:", err.message);
    res.status(400).json({ message: "Failed to update payment" });
  }
});

// DELETE - Remove confirmation request
router.delete("/:id", async (req, res) => {
  try {
    const deletedRequest = await ConfirmationRequest.findByIdAndDelete(req.params.id);
    if (!deletedRequest) return res.status(404).json({ message: "Request not found" });
    await logActivity("DELETE", "kumpilrequests", deletedRequest.confirmandName, deletedRequest.contactNo);
    res.json({ message: "Request deleted" });
  } catch (err) {
    console.error("❌ Failed to delete confirmation request:", err.message);
    res.status(400).json({ message: "Failed to delete request" });
  }
});

module.exports = router;