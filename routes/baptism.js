const express = require("express");
const BaptismRequest = require("../models/BaptismRequest");
const { logActivity } = require("../utils/helpers");

const router = express.Router();

// POST - Create baptism request
router.post("/", async (req, res) => {
  try {
    const baptismFees = { 'solo': 500, 'common': 300 };
    const requestData = { ...req.body, fee: baptismFees[req.body.baptismType] || 500, paymentStatus: 'pending' };
    const newRequest = await BaptismRequest.create(requestData);
    await logActivity("CREATE", "baptismrequests", newRequest.name, newRequest.contact);
    res.status(201).json(newRequest);
  } catch (err) {
    console.error("❌ Failed to create baptism request:", err.message);
    res.status(400).json({ message: "Failed to create baptism request" });
  }
});

// GET all baptism requests
router.get("/", async (req, res) => {
  try {
    const requests = await BaptismRequest.find().sort({ createdAt: -1 }).lean();
    res.json(requests);
  } catch (err) {
    console.error("❌ Failed to fetch baptism requests:", err.message);
    res.status(500).json({ message: "Failed to fetch baptism requests" });
  }
});

// PUT - Update baptism request
router.put("/:id", async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (updateData.paymentStatus === 'paid') {
      updateData.paymentDate = updateData.paymentDate || new Date().toISOString().split('T')[0];
    }
    const updatedRequest = await BaptismRequest.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updatedRequest) return res.status(404).json({ message: "Request not found" });
    await logActivity("UPDATE", "baptismrequests", updatedRequest.name, updatedRequest.contact);
    res.json(updatedRequest);
  } catch (err) {
    console.error("❌ Failed to update baptism request:", err.message);
    res.status(400).json({ message: "Failed to update request" });
  }
});

// PUT - Update payment
router.put("/:id/payment", async (req, res) => {
  try {
    const paymentData = {
      paymentStatus: 'paid',
      paymentDate: req.body.paymentDate,
      paymentMethod: req.body.paymentMethod,
      paymentReference: req.body.paymentReference,
      paymentNotes: req.body.paymentNotes
    };
    const updatedRequest = await BaptismRequest.findByIdAndUpdate(req.params.id, paymentData, { new: true });
    if (!updatedRequest) return res.status(404).json({ message: "Request not found" });
    await logActivity("PAYMENT_UPDATE", "baptismrequests", updatedRequest.name, updatedRequest.contact);
    res.json(updatedRequest);
  } catch (err) {
    console.error("❌ Failed to update payment:", err.message);
    res.status(400).json({ message: "Failed to update payment" });
  }
});

// DELETE - Remove baptism request
router.delete("/:id", async (req, res) => {
  try {
    const deletedRequest = await BaptismRequest.findByIdAndDelete(req.params.id);
    if (!deletedRequest) return res.status(404).json({ message: "Request not found" });
    await logActivity("DELETE", "baptismrequests", deletedRequest.name, deletedRequest.contact);
    res.json({ message: "Request deleted" });
  } catch (err) {
    console.error("❌ Failed to delete baptism request:", err.message);
    res.status(400).json({ message: "Failed to delete request" });
  }
});

module.exports = router;