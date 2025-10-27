const express = require("express");
const FuneralRequest = require("../models/FuneralRequest");
const { logActivity, generateRequestNumber } = require("../utils/helpers");

const router = express.Router();

// GET all funeral requests
router.get("/", async (req, res) => {
  try {
    console.log("📤 Fetching all funeral requests...");
    const requests = await FuneralRequest.find().sort({ createdAt: -1 }).lean();
    console.log(`✅ Found ${requests.length} funeral requests`);
    
    // Log first request to see structure
    if (requests.length > 0) {
      console.log("📝 Sample funeral request:", {
        id: requests[0]._id,
        name: requests[0].nameOfDeceased,
        date: requests[0].scheduleDate,
        status: requests[0].status
      });
    }
    
    res.json(requests);
  } catch (err) {
    console.error("❌ Failed to fetch funeral requests:", err.message);
    res.status(500).json({ 
      message: "Failed to fetch funeral requests: " + err.message,
      error: err.toString()
    });
  }
});

// POST - Create funeral request
router.post("/", async (req, res) => {
  try {
    console.log("📥 Received funeral request:", req.body);
    
    const requestNumber = generateRequestNumber("FUNERAL");
    
    const requestData = {
      sacrament: "Funeral Service",
      nameOfDeceased: req.body.nameOfDeceased,
      birthday: req.body.birthday || "N/A",
      civilStatus: req.body.civilStatus || "N/A",
      nameOfHusbandOrWife: req.body.nameOfHusbandOrWife || "N/A",
      informant: req.body.informant || req.body.nameOfDeceased,
      relationship: req.body.relationship || "Family",
      residence: req.body.residence,
      dateDied: req.body.dateDied || "N/A",
      age: req.body.age || "N/A",
      causeOfDeath: req.body.causeOfDeath,
      receivedLastSacrament: req.body.receivedLastSacrament || "No",
      placeOfBurialCemetery: req.body.placeOfBurialCemetery || 'N/A',
      scheduleDate: req.body.scheduleDate,
      scheduleTime: req.body.scheduleTime,
      contactNumber: req.body.contactNumber,
      status: 'pending',
      submittedByEmail: req.body.submittedByEmail || 'admin@sjmp.com',
      requestNumber: requestNumber,
      fee: 1000,
      paymentStatus: 'pending',
      createdAt: new Date(),
      lastUpdated: new Date()
    };
    
    console.log("📝 Creating funeral request with data:", requestData);
    
    const newRequest = await FuneralRequest.create(requestData);
    await logActivity("CREATE", "funeralrequests", newRequest.nameOfDeceased, newRequest.submittedByEmail);
    console.log("✅ Funeral request created:", newRequest._id);
    
    res.status(201).json({
      success: true,
      message: "Funeral request created successfully",
      data: newRequest
    });
    
  } catch (err) {
    console.error("❌ Failed to create funeral request:", err.message);
    console.error("❌ Error stack:", err.stack);
    res.status(400).json({ 
      success: false,
      message: "Failed to create funeral request: " + err.message,
      error: err.toString()
    });
  }
});

// TEST ROUTE - Add sample funeral data
router.post("/sample-data", async (req, res) => {
  try {
    console.log("🧪 Creating sample funeral data...");
    
    const sampleData = [
      {
        sacrament: "Funeral Service",
        nameOfDeceased: "Juan Dela Cruz",
        birthday: "1950-05-15",
        civilStatus: "Married",
        nameOfHusbandOrWife: "Maria Dela Cruz",
        informant: "Pedro Dela Cruz",
        relationship: "Son",
        residence: "123 Main St, Manila",
        dateDied: "2024-01-10",
        age: "73",
        causeOfDeath: "Natural Causes",
        receivedLastSacrament: "Yes",
        placeOfBurialCemetery: "Manila Memorial Park",
        scheduleDate: "2024-01-20",
        scheduleTime: "02:00 PM",
        contactNumber: "09123456789",
        status: 'pending',
        submittedByEmail: 'family@sjmp.com',
        requestNumber: `FUNERAL-${Date.now()}-sample1`,
        fee: 1000,
        paymentStatus: 'pending'
      },
      {
        sacrament: "Funeral Service", 
        nameOfDeceased: "Maria Santos",
        birthday: "1945-08-20",
        civilStatus: "Widowed",
        nameOfHusbandOrWife: "Deceased - Jose Santos",
        informant: "Ana Santos",
        relationship: "Daughter",
        residence: "456 Oak St, Quezon City",
        dateDied: "2024-01-12",
        age: "78",
        causeOfDeath: "Illness",
        receivedLastSacrament: "Yes",
        placeOfBurialCemetery: "Loyola Memorial Park",
        scheduleDate: "2024-01-22",
        scheduleTime: "10:00 AM", 
        contactNumber: "09187654321",
        status: 'approved',
        submittedByEmail: 'family@sjmp.com',
        requestNumber: `FUNERAL-${Date.now()}-sample2`,
        fee: 1000,
        paymentStatus: 'paid'
      },
      {
        sacrament: "Funeral Service",
        nameOfDeceased: "Pedro Reyes",
        birthday: "1960-12-05", 
        civilStatus: "Single",
        nameOfHusbandOrWife: "N/A",
        informant: "Luis Reyes",
        relationship: "Brother",
        residence: "789 Pine St, Makati",
        dateDied: "2024-01-14",
        age: "63",
        causeOfDeath: "Accident",
        receivedLastSacrament: "No",
        placeOfBurialCemetery: "Holy Cross Memorial Park",
        scheduleDate: "2024-01-24",
        scheduleTime: "03:00 PM",
        contactNumber: "09111222333",
        status: 'pending',
        submittedByEmail: 'family@sjmp.com',
        requestNumber: `FUNERAL-${Date.now()}-sample3`,
        fee: 1000,
        paymentStatus: 'pending'
      }
    ];

    const createdData = await FuneralRequest.insertMany(sampleData);
    console.log(`✅ Created ${createdData.length} sample funeral records`);

    res.json({
      success: true,
      message: `Created ${createdData.length} sample funeral records`,
      data: createdData
    });

  } catch (err) {
    console.error("❌ Failed to create sample funeral data:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to create sample funeral data: " + err.message
    });
  }
});

// PUT - Update funeral request
router.put("/:id", async (req, res) => {
  try {
    console.log("🔄 Updating funeral request:", req.params.id, req.body);
    
    const updateData = { 
      ...req.body,
      lastUpdated: new Date()
    };
    const actionBy = 'admin';
    
    if (updateData.status === 'cancelled' && updateData.cancellation_reason) {
      updateData.cancellation_reason = updateData.cancellation_reason;
      updateData.cancelled_by = actionBy;
      updateData.cancelled_at = new Date();
      updateData.rejection_reason = '';
      updateData.rejected_by = '';
      updateData.rejected_at = null;
    } else if (updateData.status === 'rejected' && updateData.rejection_reason) {
      updateData.rejection_reason = updateData.rejection_reason;
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
    
    const updatedRequest = await FuneralRequest.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true }
    );
    
    if (!updatedRequest) {
      console.log("❌ Funeral request not found:", req.params.id);
      return res.status(404).json({ message: "Request not found" });
    }
    
    await logActivity("UPDATE", "funeralrequests", updatedRequest.nameOfDeceased, updatedRequest.submittedByEmail);
    console.log("✅ Funeral request updated:", updatedRequest);
    res.json(updatedRequest);
  } catch (err) {
    console.error("❌ Failed to update funeral request:", err.message);
    res.status(400).json({ message: "Failed to update request: " + err.message });
  }
});

// PUT - Update payment
router.put("/:id/payment", async (req, res) => {
  try {
    console.log("💰 Updating payment for funeral request:", req.params.id, req.body);
    
    const paymentData = {
      paymentStatus: 'paid',
      paymentDate: req.body.paymentDate,
      paymentMethod: req.body.paymentMethod,
      paymentReference: req.body.paymentReference,
      paymentNotes: req.body.paymentNotes,
      lastUpdated: new Date()
    };
    
    const updatedRequest = await FuneralRequest.findByIdAndUpdate(
      req.params.id,
      paymentData,
      { new: true }
    );
    
    if (!updatedRequest) return res.status(404).json({ message: "Request not found" });
    
    await logActivity("PAYMENT_UPDATE", "funeralrequests", updatedRequest.nameOfDeceased, updatedRequest.submittedByEmail);
    console.log("✅ Payment updated:", updatedRequest);
    res.json(updatedRequest);
  } catch (err) {
    console.error("❌ Failed to update payment:", err.message);
    res.status(400).json({ message: "Failed to update payment" });
  }
});

// DELETE - Remove funeral request
router.delete("/:id", async (req, res) => {
  try {
    const deletedRequest = await FuneralRequest.findByIdAndDelete(req.params.id);
    if (!deletedRequest) return res.status(404).json({ message: "Request not found" });
    await logActivity("DELETE", "funeralrequests", deletedRequest.nameOfDeceased, deletedRequest.submittedByEmail);
    res.json({ message: "Request deleted" });
  } catch (err) {
    console.error("❌ Failed to delete funeral request:", err.message);
    res.status(400).json({ message: "Failed to delete request" });
  }
});

// GET single funeral request
router.get("/:id", async (req, res) => {
  try {
    console.log("📤 Fetching funeral request:", req.params.id);
    const request = await FuneralRequest.findById(req.params.id);
    if (!request) {
      console.log("❌ Funeral request not found:", req.params.id);
      return res.status(404).json({ message: "Funeral request not found" });
    }
    console.log("✅ Funeral request found:", request.nameOfDeceased);
    res.json(request);
  } catch (err) {
    console.error("❌ Failed to fetch funeral request:", err.message);
    res.status(500).json({ message: "Failed to fetch funeral request: " + err.message });
  }
});

// DEBUG ROUTE - Check funeral data
router.get("/debug/data", async (req, res) => {
  try {
    console.log("🔍 Debugging funeral data...");
    
    const funeralCount = await FuneralRequest.countDocuments();
    const funeralData = await FuneralRequest.find().lean();
    
    res.json({
      success: true,
      count: funeralCount,
      data: funeralData,
      message: `Found ${funeralCount} funeral records`
    });
    
  } catch (err) {
    console.error("❌ Debug failed:", err.message);
    res.status(500).json({
      success: false,
      error: err.message,
      message: "Debug failed"
    });
  }
});

module.exports = router;