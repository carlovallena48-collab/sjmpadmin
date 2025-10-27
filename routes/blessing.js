const express = require("express");
const BlessingRequest = require("../models/BlessingRequest");
const { logActivity, generateRequestNumber, formatTimeForDisplay } = require("../utils/helpers");

const router = express.Router();

// GET all blessing requests
router.get("/", async (req, res) => {
  try {
    console.log("📤 Fetching all blessing requests...");
    const requests = await BlessingRequest.find().sort({ createdAt: -1 }).lean();
    console.log(`✅ Found ${requests.length} blessing requests`);
    res.json(requests);
  } catch (err) {
    console.error("❌ Failed to fetch blessing requests:", err.message);
    res.status(500).json({ message: "Failed to fetch blessing requests: " + err.message });
  }
});

// POST - Create blessing request
router.post("/", async (req, res) => {
  try {
    console.log("📥 Received blessing request:", req.body);
    
    const requestNumber = generateRequestNumber("BLESS");
    
    const blessingFees = {
      'BUSINESS': 1000,
      'HOUSE': 800,
      'VEHICLE': 500,
      'OTHER': 600
    };
    
    const formatDateForDB = (dateString) => {
      if (!dateString) return '';
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()}`;
      } catch (e) {
        return dateString;
      }
    };

    const formatTimeForDB = (timeString) => {
      if (!timeString) return '';
      try {
        if (timeString.includes(':')) {
          const [hours, minutes] = timeString.split(':');
          const hour = parseInt(hours);
          const minute = parseInt(minutes);
          const period = hour >= 12 ? 'PM' : 'AM';
          const displayHour = hour % 12 || 12;
          return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
        }
        return timeString;
      } catch (e) {
        return timeString;
      }
    };

    const requestData = {
      sacrament: "Blessing",
      name: req.body.name,
      blessingType: req.body.blessingType,
      requestForDetails: req.body.requestForDetails || '',
      address: req.body.address,
      contactNumber: req.body.contactNumber,
      date: formatDateForDB(req.body.date),
      time: formatTimeForDB(req.body.time),
      displayDate: req.body.displayDate || new Date(req.body.date).toLocaleDateString('en-US'),
      displayTime: req.body.displayTime || formatTimeForDB(req.body.time),
      donationNote: req.body.donationNote || 'Cash donation to be given during the blessing ceremony',
      status: 'pending',
      paymentStatus: 'pending',
      fee: blessingFees[req.body.blessingType] || 500,
      requestNumber: requestNumber,
      createdAt: new Date(),
      lastUpdated: new Date()
    };
    
    console.log("📝 Processed request data:", requestData);
    
    const newRequest = await BlessingRequest.create(requestData);
    await logActivity("CREATE", "blessingrequests", newRequest.name, newRequest.contactNumber);
    console.log("✅ Blessing request created:", newRequest);
    res.status(201).json(newRequest);
  } catch (err) {
    console.error("❌ Failed to create blessing request:", err.message);
    res.status(400).json({ message: "Failed to create blessing request: " + err.message });
  }
});

// PUT - Update blessing request
router.put("/:id", async (req, res) => {
  try {
    console.log("🔄 Updating blessing request:", req.params.id, req.body);
    
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
    
    const updatedRequest = await BlessingRequest.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true }
    );
    
    if (!updatedRequest) {
      console.log("❌ Blessing request not found:", req.params.id);
      return res.status(404).json({ message: "Request not found" });
    }
    
    await logActivity("UPDATE", "blessingrequests", updatedRequest.name, updatedRequest.contactNumber);
    console.log("✅ Blessing request updated:", updatedRequest);
    res.json(updatedRequest);
  } catch (err) {
    console.error("❌ Failed to update blessing request:", err.message);
    res.status(400).json({ message: "Failed to update request: " + err.message });
  }
});

// PUT - Update payment
router.put("/:id/payment", async (req, res) => {
  try {
    console.log("💰 Updating payment for blessing request:", req.params.id, req.body);
    
    const paymentData = {
      paymentStatus: 'paid',
      paymentDate: req.body.paymentDate,
      paymentMethod: req.body.paymentMethod,
      paymentReference: req.body.paymentReference,
      paymentNotes: req.body.paymentNotes,
      lastUpdated: new Date()
    };
    
    const updatedRequest = await BlessingRequest.findByIdAndUpdate(
      req.params.id,
      paymentData,
      { new: true }
    );
    
    if (!updatedRequest) {
      console.log("❌ Blessing request not found:", req.params.id);
      return res.status(404).json({ message: "Request not found" });
    }
    
    await logActivity("PAYMENT_UPDATE", "blessingrequests", updatedRequest.name, updatedRequest.contactNumber);
    console.log("✅ Payment updated for blessing request:", updatedRequest);
    res.json(updatedRequest);
  } catch (err) {
    console.error("❌ Failed to update payment for blessing:", err.message);
    res.status(400).json({ message: "Failed to update payment: " + err.message });
  }
});

// DELETE - Remove blessing request
router.delete("/:id", async (req, res) => {
  try {
    const deletedRequest = await BlessingRequest.findByIdAndDelete(req.params.id);
    if (!deletedRequest) return res.status(404).json({ message: "Request not found" });
    await logActivity("DELETE", "blessingrequests", deletedRequest.name, deletedRequest.contactNumber);
    res.json({ message: "Request deleted" });
  } catch (err) {
    console.error("❌ Failed to delete blessing request:", err.message);
    res.status(400).json({ message: "Failed to delete request" });
  }
});

module.exports = router;