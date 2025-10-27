const express = require("express");
const CertificateRequest = require("../models/CertificateRequest");
const { logActivity } = require("../utils/helpers");

const router = express.Router();

// POST - Create certificate request
router.post("/", async (req, res) => {
  try {
    console.log("📥 Received certificate request:", req.body);
    
    const prefixMap = {
      'Baptismal Certificate': 'BAP',
      'Confirmation Certificate': 'CON', 
      'Marriage Certificate': 'MAR',
      'Death Certificate': 'DTH',
      'Good Moral Certificate': 'GMC'
    };
    
    const prefix = prefixMap[req.body.certificateType] || 'CER';
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const certificateNumber = `${prefix}-${year}-${randomNum}`;
    
    const requestData = {
      certificateType: req.body.certificateType,
      fullName: req.body.fullName,
      dateOfSacrament: req.body.dateOfSacrament || '',
      purpose: req.body.purpose,
      contactNumber: req.body.contactNumber,
      address: req.body.address,
      requestedCopies: parseInt(req.body.requestedCopies) || 1,
      status: 'pending',
      certificateNumber: certificateNumber,
      submittedByEmail: req.body.submittedByEmail || 'admin@sjmp.com',
      requestDate: req.body.requestDate,
      scheduledDate: req.body.scheduledDate || req.body.requestDate,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const newRequest = await CertificateRequest.create(requestData);
    await logActivity("CREATE", "certificaterequests", newRequest.fullName, newRequest.submittedByEmail);
    console.log("✅ Certificate request created:", newRequest);
    res.status(201).json(newRequest);
  } catch (err) {
    console.error("❌ Failed to create certificate request:", err.message);
    res.status(400).json({ message: "Failed to create certificate request: " + err.message });
  }
});

// GET all certificate requests
router.get("/", async (req, res) => {
  try {
    console.log("📤 Fetching all certificate requests...");
    const requests = await CertificateRequest.find().sort({ createdAt: -1 }).lean();
    console.log(`✅ Found ${requests.length} certificate requests`);
    res.json(requests);
  } catch (err) {
    console.error("❌ Failed to fetch certificate requests:", err.message);
    res.status(500).json({ message: "Failed to fetch certificate requests: " + err.message });
  }
});

// GET single certificate request
router.get("/:id", async (req, res) => {
  try {
    console.log("📤 Fetching certificate request:", req.params.id);
    const request = await CertificateRequest.findById(req.params.id);
    if (!request) {
      console.log("❌ Certificate request not found:", req.params.id);
      return res.status(404).json({ message: "Certificate request not found" });
    }
    console.log("✅ Certificate request found:", request.fullName);
    res.json(request);
  } catch (err) {
    console.error("❌ Failed to fetch certificate request:", err.message);
    res.status(500).json({ message: "Failed to fetch certificate request: " + err.message });
  }
});

// PUT - Update certificate request
router.put("/:id", async (req, res) => {
  try {
    console.log("🔄 Updating certificate request:", req.params.id, req.body);
    
    const updateData = { 
      ...req.body,
      updatedAt: new Date()
    };
    const actionBy = 'admin';
    
    if (updateData.status === 'cancelled' && updateData.cancellation_reason) {
      updateData.cancelled_by = actionBy;
      updateData.cancelled_at = new Date();
      updateData.rejection_reason = '';
      updateData.rejected_by = '';
      updateData.rejected_at = null;
      updateData.approved_by = '';
      updateData.approved_at = null;
      updateData.ready_by = '';
      updateData.ready_at = null;
    } else if (updateData.status === 'rejected' && updateData.rejection_reason) {
      updateData.rejected_by = actionBy;
      updateData.rejected_at = new Date();
      updateData.cancellation_reason = '';
      updateData.cancelled_by = '';
      updateData.cancelled_at = null;
      updateData.approved_by = '';
      updateData.approved_at = null;
      updateData.ready_by = '';
      updateData.ready_at = null;
    } else if (updateData.status === 'approved') {
      updateData.approved_by = actionBy;
      updateData.approved_at = new Date();
      updateData.cancellation_reason = '';
      updateData.rejection_reason = '';
      updateData.cancelled_by = '';
      updateData.rejected_by = '';
      updateData.cancelled_at = null;
      updateData.rejected_at = null;
      updateData.ready_by = '';
      updateData.ready_at = null;
    } else if (updateData.status === 'ready') {
      updateData.ready_by = actionBy;
      updateData.ready_at = new Date();
      updateData.cancellation_reason = '';
      updateData.rejection_reason = '';
      updateData.cancelled_by = '';
      updateData.rejected_by = '';
      updateData.cancelled_at = null;
      updateData.rejected_at = null;
      if (!updateData.approved_by) {
        updateData.approved_by = actionBy;
        updateData.approved_at = new Date();
      }
    } else if (updateData.status === 'pending') {
      updateData.cancellation_reason = '';
      updateData.rejection_reason = '';
      updateData.cancelled_by = '';
      updateData.rejected_by = '';
      updateData.cancelled_at = null;
      updateData.rejected_at = null;
      updateData.approved_by = '';
      updateData.approved_at = null;
      updateData.ready_by = '';
      updateData.ready_at = null;
    }
    
    const updatedRequest = await CertificateRequest.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true }
    );
    
    if (!updatedRequest) {
      console.log("❌ Certificate request not found:", req.params.id);
      return res.status(404).json({ message: "Certificate request not found" });
    }
    
    await logActivity("UPDATE", "certificaterequests", updatedRequest.fullName, updatedRequest.submittedByEmail);
    console.log("✅ Certificate request updated:", updatedRequest);
    res.json(updatedRequest);
  } catch (err) {
    console.error("❌ Failed to update certificate request:", err.message);
    res.status(400).json({ message: "Failed to update certificate request: " + err.message });
  }
});

// DELETE - Remove certificate request
router.delete("/:id", async (req, res) => {
  try {
    console.log("🗑️ Deleting certificate request:", req.params.id);
    const deletedRequest = await CertificateRequest.findByIdAndDelete(req.params.id);
    if (!deletedRequest) {
      console.log("❌ Certificate request not found:", req.params.id);
      return res.status(404).json({ message: "Certificate request not found" });
    }
    await logActivity("DELETE", "certificaterequests", deletedRequest.fullName, deletedRequest.submittedByEmail);
    console.log("✅ Certificate request deleted:", deletedRequest.fullName);
    res.json({ message: "Certificate request deleted successfully" });
  } catch (err) {
    console.error("❌ Failed to delete certificate request:", err.message);
    res.status(400).json({ message: "Failed to delete certificate request" });
  }
});

module.exports = router;