const express = require("express");
const PamisaRequest = require("../models/PamisaRequest");
const { logActivity, generateRequestNumber, formatTimeForDisplay } = require("../utils/helpers");

const router = express.Router();

// POST - Create pamisa request
router.post("/", async (req, res) => {
  try {
    console.log("📥 Received pamisa request:", req.body);
    
    const requestNumber = generateRequestNumber("MASS");
    
    const requestData = {
      sacrament: "Pamisa",
      names: req.body.names || [req.body.requesterName],
      intention: req.body.intention,
      date: req.body.date || req.body.pamisaDate,
      time: req.body.time || req.body.pamisaTime,
      displayDate: req.body.displayDate || new Date(req.body.date || req.body.pamisaDate).toLocaleDateString('en-US'),
      displayTime: req.body.displayTime || formatTimeForDisplay(req.body.time || req.body.pamisaTime),
      massSponsor: req.body.massSponsor || req.body.specialRequests || '',
      donation: req.body.donation || (req.body.fee ? req.body.fee.toString() : '500'),
      status: 'pending',
      submittedByEmail: req.body.submittedByEmail || 'admin@sjmp.com',
      requestNumber: requestNumber,
      createdAt: new Date(),
      lastUpdated: new Date()
    };
    
    const newRequest = await PamisaRequest.create(requestData);
    await logActivity("CREATE", "pamisarequests", newRequest.names[0], newRequest.submittedByEmail);
    console.log("✅ Pamisa request created:", newRequest);
    res.status(201).json(newRequest);
  } catch (err) {
    console.error("❌ Failed to create pamisa request:", err.message);
    res.status(400).json({ message: "Failed to create pamisa request: " + err.message });
  }
});

// GET all pamisa requests
router.get("/", async (req, res) => {
  try {
    console.log("📤 Fetching all pamisa requests...");
    const requests = await PamisaRequest.find().sort({ createdAt: -1 }).lean();
    console.log(`✅ Found ${requests.length} pamisa requests`);
    res.json(requests);
  } catch (err) {
    console.error("❌ Failed to fetch pamisa requests:", err.message);
    res.status(500).json({ message: "Failed to fetch pamisa requests: " + err.message });
  }
});

// PUT - Update pamisa request
router.put("/:id", async (req, res) => {
  try {
    console.log("🔄 Updating pamisa request:", req.params.id, req.body);
    
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
    
    const updatedRequest = await PamisaRequest.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true }
    );
    
    if (!updatedRequest) {
      console.log("❌ Pamisa request not found:", req.params.id);
      return res.status(404).json({ message: "Request not found" });
    }
    
    await logActivity("UPDATE", "pamisarequests", updatedRequest.names[0], updatedRequest.submittedByEmail);
    console.log("✅ Pamisa request updated:", updatedRequest);
    res.json(updatedRequest);
  } catch (err) {
    console.error("❌ Failed to update pamisa request:", err.message);
    res.status(400).json({ message: "Failed to update request: " + err.message });
  }
});

// PUT - Update payment
router.put("/:id/payment", async (req, res) => {
  try {
    console.log("💰 Updating payment for pamisa request:", req.params.id, req.body);
    
    const paymentData = {
      paymentStatus: 'paid',
      paymentDate: req.body.paymentDate,
      paymentMethod: req.body.paymentMethod,
      paymentReference: req.body.paymentReference,
      paymentNotes: req.body.paymentNotes,
      lastUpdated: new Date()
    };
    
    const updatedRequest = await PamisaRequest.findByIdAndUpdate(
      req.params.id,
      paymentData,
      { new: true }
    );
    
    if (!updatedRequest) return res.status(404).json({ message: "Request not found" });
    
    await logActivity("PAYMENT_UPDATE", "pamisarequests", updatedRequest.names[0], updatedRequest.submittedByEmail);
    console.log("✅ Payment updated:", updatedRequest);
    res.json(updatedRequest);
  } catch (err) {
    console.error("❌ Failed to update payment:", err.message);
    res.status(400).json({ message: "Failed to update payment" });
  }
});

// DELETE - Remove pamisa request
router.delete("/:id", async (req, res) => {
  try {
    const deletedRequest = await PamisaRequest.findByIdAndDelete(req.params.id);
    if (!deletedRequest) return res.status(404).json({ message: "Request not found" });
    await logActivity("DELETE", "pamisarequests", deletedRequest.names[0], deletedRequest.submittedByEmail);
    res.json({ message: "Request deleted" });
  } catch (err) {
    console.error("❌ Failed to delete pamisa request:", err.message);
    res.status(400).json({ message: "Failed to delete request" });
  }
});

module.exports = router;