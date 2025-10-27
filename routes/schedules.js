const express = require("express");
const BaptismRequest = require("../models/BaptismRequest");
const ConfirmationRequest = require("../models/ConfirmationRequest");
const HolyOrdersRequest = require("../models/HolyOrdersRequest");
const PamisaRequest = require("../models/PamisaRequest");
const FuneralRequest = require("../models/FuneralRequest");
const BlessingRequest = require("../models/BlessingRequest");
const MarriageRequest = require("../models/MarriageRequest");
const CertificateRequest = require("../models/CertificateRequest");

const router = express.Router();

// TEST ROUTE - Check all collections
router.get("/test-collections", async (req, res) => {
  try {
    console.log("🧪 Testing all collections...");
    
    const counts = {
      baptism: await BaptismRequest.countDocuments(),
      confirmation: await ConfirmationRequest.countDocuments(),
      holyOrders: await HolyOrdersRequest.countDocuments(),
      pamisa: await PamisaRequest.countDocuments(),
      funeral: await FuneralRequest.countDocuments(),
      blessing: await BlessingRequest.countDocuments(),
      marriage: await MarriageRequest.countDocuments(),
      certificates: await CertificateRequest.countDocuments()
    };
    
    console.log("📊 Collection counts:", counts);
    
    res.json({
      success: true,
      message: "Collection test completed",
      counts: counts
    });
    
  } catch (err) {
    console.error("❌ Collection test failed:", err.message);
    res.status(500).json({
      success: false,
      message: "Collection test failed: " + err.message,
      error: err.toString()
    });
  }
});

// 🎯 BAPTISM SCHEDULES
router.get("/baptism", async (req, res) => {
  try {
    console.log("📅 Fetching baptism schedules...");
    const baptismSchedules = await BaptismRequest.find().sort({ baptismDate: 1 }).lean();
    
    const formatted = baptismSchedules.map(req => ({
      id: req._id,
      name: req.name,
      type: "Baptism",
      date: req.baptismDate,
      time: req.baptismTime || "09:00 AM",
      contact: req.contact || "N/A",
      address: req.address || "N/A",
      status: req.status,
      paymentStatus: req.paymentStatus,
      requestNumber: req._id.toString(),
      notes: `Baptism Type: ${req.baptismType || 'solo'}`
    }));

    console.log(`✅ Found ${formatted.length} baptism schedules`);
    res.json(formatted);
  } catch (err) {
    console.error("❌ Failed to fetch baptism schedules:", err.message);
    res.status(500).json({ 
      message: "Failed to fetch baptism schedules",
      error: err.message 
    });
  }
});

// 🎯 CONFIRMATION SCHEDULES
router.get("/confirmation", async (req, res) => {
  try {
    console.log("📅 Fetching confirmation schedules...");
    const confirmationSchedules = await ConfirmationRequest.find().sort({ kumpilDate: 1 }).lean();

    const formatted = confirmationSchedules.map(req => ({
      id: req._id,
      name: req.confirmandName,
      type: "Confirmation",
      date: req.kumpilDate,
      time: req.kumpilTime || "10:00 AM",
      contact: req.contactNo || "N/A",
      address: req.currentAddress || "N/A",
      status: req.status,
      paymentStatus: req.paymentStatus,
      requestNumber: req._id.toString(),
      notes: `Confirmation Type: ${req.confirmationType || 'solo'}`
    }));

    console.log(`✅ Found ${formatted.length} confirmation schedules`);
    res.json(formatted);
  } catch (err) {
    console.error("❌ Failed to fetch confirmation schedules:", err.message);
    res.status(500).json({ 
      message: "Failed to fetch confirmation schedules",
      error: err.message 
    });
  }
});

// 🎯 HOLY ORDERS SCHEDULES
router.get("/holy-orders", async (req, res) => {
  try {
    console.log("📅 Fetching holy orders schedules...");
    const holyOrdersSchedules = await HolyOrdersRequest.find().sort({ ordinationDate: 1 }).lean();

    const formatted = holyOrdersSchedules.map(req => ({
      id: req._id,
      name: req.name,
      type: "Holy Orders",
      date: req.ordinationDate || "TBA",
      time: req.ordinationTime || "TBA",
      contact: req.contactNumber || "N/A",
      address: "N/A",
      status: req.status,
      paymentStatus: "N/A",
      requestNumber: req.requestNumber,
      notes: `Ordination Type: ${req.ordinationType || 'deacon'}`
    }));

    console.log(`✅ Found ${formatted.length} holy orders schedules`);
    res.json(formatted);
  } catch (err) {
    console.error("❌ Failed to fetch holy orders schedules:", err.message);
    res.status(500).json({ 
      message: "Failed to fetch holy orders schedules",
      error: err.message 
    });
  }
});

// 🎯 PAMISA SCHEDULES (REGULAR MASS)
router.get("/pamisa", async (req, res) => {
  try {
    console.log("📅 Fetching pamisa schedules...");
    const pamisaSchedules = await PamisaRequest.find().sort({ date: 1 }).lean();

    const formatted = pamisaSchedules.map(req => ({
      id: req._id,
      name: req.names && req.names.length > 0 ? req.names[0] : 'Unknown',
      type: "Pamisa",
      date: req.date,
      time: req.time || "07:00 AM",
      contact: req.submittedByEmail || "N/A",
      address: "N/A",
      status: req.status,
      paymentStatus: req.paymentStatus,
      requestNumber: req.requestNumber,
      notes: `Intention: ${req.intention ? (req.intention.length > 50 ? req.intention.substring(0, 50) + '...' : req.intention) : 'N/A'}`
    }));

    console.log(`✅ Found ${formatted.length} pamisa schedules`);
    res.json(formatted);
  } catch (err) {
    console.error("❌ Failed to fetch pamisa schedules:", err.message);
    res.status(500).json({ 
      message: "Failed to fetch pamisa schedules",
      error: err.message 
    });
  }
});

// 🎯 FUNERAL SCHEDULES (PAMISA SA PATAY) - FIXED
router.get("/funeral", async (req, res) => {
  try {
    console.log("📅 Fetching funeral schedules...");
    
    // Test connection first
    const funeralCount = await FuneralRequest.countDocuments();
    console.log(`📊 Total funeral records: ${funeralCount}`);
    
    const funeralSchedules = await FuneralRequest.find().sort({ scheduleDate: 1 }).lean();
    console.log(`✅ Found ${funeralSchedules.length} funeral schedules`);
    
    // Log sample data
    if (funeralSchedules.length > 0) {
      console.log("📝 Sample funeral schedule:", {
        name: funeralSchedules[0].nameOfDeceased,
        date: funeralSchedules[0].scheduleDate,
        time: funeralSchedules[0].scheduleTime
      });
    }
    
    const formatted = funeralSchedules.map(req => ({
      id: req._id,
      name: req.nameOfDeceased,
      type: "Funeral Service",
      date: req.scheduleDate,
      time: req.scheduleTime || "02:00 PM",
      contact: req.contactNumber || "N/A",
      address: req.residence || "N/A",
      status: req.status,
      paymentStatus: req.paymentStatus,
      requestNumber: req.requestNumber,
      notes: `Deceased: ${req.nameOfDeceased} - ${req.causeOfDeath || 'N/A'}`
    }));

    console.log(`✅ Sending ${formatted.length} formatted funeral schedules`);
    res.json(formatted);
    
  } catch (err) {
    console.error("❌ Failed to fetch funeral schedules:", err.message);
    console.error("❌ Error stack:", err.stack);
    res.status(500).json({ 
      message: "Failed to fetch funeral schedules: " + err.message,
      error: err.toString()
    });
  }
});

// 🎯 BLESSING SCHEDULES
router.get("/blessing", async (req, res) => {
  try {
    console.log("📅 Fetching blessing schedules...");
    const blessingSchedules = await BlessingRequest.find().sort({ date: 1 }).lean();

    const formatted = blessingSchedules.map(req => ({
      id: req._id,
      name: req.name,
      type: "Blessing",
      date: req.date,
      time: req.time || "03:00 PM",
      contact: req.contactNumber || "N/A",
      address: req.address || "N/A",
      status: req.status,
      paymentStatus: req.paymentStatus,
      requestNumber: req.requestNumber,
      notes: `Blessing Type: ${req.blessingType || 'OTHER'}`
    }));

    console.log(`✅ Found ${formatted.length} blessing schedules`);
    res.json(formatted);
  } catch (err) {
    console.error("❌ Failed to fetch blessing schedules:", err.message);
    res.status(500).json({ 
      message: "Failed to fetch blessing schedules",
      error: err.message 
    });
  }
});

// 🎯 MARRIAGE SCHEDULES
router.get("/marriage", async (req, res) => {
  try {
    console.log("📅 Fetching marriage schedules...");
    const marriageSchedules = await MarriageRequest.find().sort({ dateOfWedding: 1 }).lean();

    const formatted = marriageSchedules.map(req => ({
      id: req._id,
      name: `${req.groomName} & ${req.brideName}`,
      type: "Marriage",
      date: req.dateOfWedding,
      time: req.timeOfWedding || "02:00 PM",
      contact: req.groomCP || req.brideCP || "N/A",
      address: req.groomResidence || "N/A",
      status: req.status,
      paymentStatus: req.paymentStatus,
      requestNumber: req.requestNumber,
      notes: `Wedding: ${req.dateOfWedding}`
    }));

    console.log(`✅ Found ${formatted.length} marriage schedules`);
    res.json(formatted);
  } catch (err) {
    console.error("❌ Failed to fetch marriage schedules:", err.message);
    res.status(500).json({ 
      message: "Failed to fetch marriage schedules",
      error: err.message 
    });
  }
});

// 🎯 CERTIFICATE SCHEDULES
router.get("/certificates", async (req, res) => {
  try {
    console.log("📅 Fetching certificate schedules...");
    const certificateSchedules = await CertificateRequest.find().sort({ scheduledDate: 1 }).lean();

    const formatted = certificateSchedules.map(req => ({
      id: req._id,
      name: req.fullName,
      type: `Certificate - ${req.certificateType}`,
      date: req.scheduledDate || req.requestDate,
      time: "N/A",
      contact: req.contactNumber || "N/A",
      address: req.address || "N/A",
      status: req.status,
      paymentStatus: "N/A",
      requestNumber: req.certificateNumber,
      notes: `Purpose: ${req.purpose ? (req.purpose.length > 50 ? req.purpose.substring(0, 50) + '...' : req.purpose) : 'N/A'}`
    }));

    console.log(`✅ Found ${formatted.length} certificate schedules`);
    res.json(formatted);
  } catch (err) {
    console.error("❌ Failed to fetch certificate schedules:", err.message);
    res.status(500).json({ 
      message: "Failed to fetch certificate schedules",
      error: err.message 
    });
  }
});

// 🎯 ALL SCHEDULES COMBINED
router.get("/all", async (req, res) => {
  try {
    console.log("📅 Fetching all schedules...");
    
    const [
      baptismSchedules,
      confirmationSchedules,
      holyOrdersSchedules,
      pamisaSchedules,
      funeralSchedules,
      blessingSchedules,
      marriageSchedules,
      certificateSchedules
    ] = await Promise.all([
      BaptismRequest.find().sort({ baptismDate: 1 }).lean(),
      ConfirmationRequest.find().sort({ kumpilDate: 1 }).lean(),
      HolyOrdersRequest.find().sort({ ordinationDate: 1 }).lean(),
      PamisaRequest.find().sort({ date: 1 }).lean(),
      FuneralRequest.find().sort({ scheduleDate: 1 }).lean(),
      BlessingRequest.find().sort({ date: 1 }).lean(),
      MarriageRequest.find().sort({ dateOfWedding: 1 }).lean(),
      CertificateRequest.find().sort({ scheduledDate: 1 }).lean()
    ]);

    console.log(`📊 Schedule counts:`, {
      baptism: baptismSchedules.length,
      confirmation: confirmationSchedules.length,
      holyOrders: holyOrdersSchedules.length,
      pamisa: pamisaSchedules.length,
      funeral: funeralSchedules.length,
      blessing: blessingSchedules.length,
      marriage: marriageSchedules.length,
      certificates: certificateSchedules.length
    });

    // Combine all schedules
    const allSchedules = [
      ...baptismSchedules.map(req => ({
        id: req._id,
        name: req.name,
        type: "Baptism",
        date: req.baptismDate,
        time: req.baptismTime || "09:00 AM",
        contact: req.contact || "N/A",
        address: req.address || "N/A",
        status: req.status,
        paymentStatus: req.paymentStatus,
        requestNumber: req._id.toString(),
        notes: `Baptism Type: ${req.baptismType || 'solo'}`,
        sacramentType: 'Baptism'
      })),
      ...confirmationSchedules.map(req => ({
        id: req._id,
        name: req.confirmandName,
        type: "Confirmation",
        date: req.kumpilDate,
        time: req.kumpilTime || "10:00 AM",
        contact: req.contactNo || "N/A",
        address: req.currentAddress || "N/A",
        status: req.status,
        paymentStatus: req.paymentStatus,
        requestNumber: req._id.toString(),
        notes: `Confirmation Type: ${req.confirmationType || 'solo'}`,
        sacramentType: 'Confirmation'
      })),
      ...holyOrdersSchedules.map(req => ({
        id: req._id,
        name: req.name,
        type: "Holy Orders",
        date: req.ordinationDate || "TBA",
        time: req.ordinationTime || "TBA",
        contact: req.contactNumber || "N/A",
        address: "N/A",
        status: req.status,
        paymentStatus: "N/A",
        requestNumber: req.requestNumber,
        notes: `Ordination Type: ${req.ordinationType || 'deacon'}`,
        sacramentType: 'Holy Orders'
      })),
      ...pamisaSchedules.map(req => ({
        id: req._id,
        name: req.names && req.names.length > 0 ? req.names[0] : 'Unknown',
        type: "Pamisa",
        date: req.date,
        time: req.time || "07:00 AM",
        contact: req.submittedByEmail || "N/A",
        address: "N/A",
        status: req.status,
        paymentStatus: req.paymentStatus,
        requestNumber: req.requestNumber,
        notes: `Intention: ${req.intention ? (req.intention.length > 30 ? req.intention.substring(0, 30) + '...' : req.intention) : 'N/A'}`,
        sacramentType: 'Pamisa'
      })),
      ...funeralSchedules.map(req => ({
        id: req._id,
        name: req.nameOfDeceased,
        type: "Funeral Service",
        date: req.scheduleDate,
        time: req.scheduleTime || "02:00 PM",
        contact: req.contactNumber || "N/A",
        address: req.residence || "N/A",
        status: req.status,
        paymentStatus: req.paymentStatus,
        requestNumber: req.requestNumber,
        notes: `Deceased: ${req.nameOfDeceased}`,
        sacramentType: 'Funeral'
      })),
      ...blessingSchedules.map(req => ({
        id: req._id,
        name: req.name,
        type: "Blessing",
        date: req.date,
        time: req.time || "03:00 PM",
        contact: req.contactNumber || "N/A",
        address: req.address || "N/A",
        status: req.status,
        paymentStatus: req.paymentStatus,
        requestNumber: req.requestNumber,
        notes: `Blessing Type: ${req.blessingType || 'OTHER'}`,
        sacramentType: 'Blessing'
      })),
      ...marriageSchedules.map(req => ({
        id: req._id,
        name: `${req.groomName} & ${req.brideName}`,
        type: "Marriage",
        date: req.dateOfWedding,
        time: req.timeOfWedding || "02:00 PM",
        contact: req.groomCP || req.brideCP || "N/A",
        address: req.groomResidence || "N/A",
        status: req.status,
        paymentStatus: req.paymentStatus,
        requestNumber: req.requestNumber,
        notes: `Wedding Ceremony`,
        sacramentType: 'Marriage'
      })),
      ...certificateSchedules.map(req => ({
        id: req._id,
        name: req.fullName,
        type: `Certificate - ${req.certificateType}`,
        date: req.scheduledDate || req.requestDate,
        time: "N/A",
        contact: req.contactNumber || "N/A",
        address: req.address || "N/A",
        status: req.status,
        paymentStatus: "N/A",
        requestNumber: req.certificateNumber,
        notes: `Purpose: ${req.purpose ? (req.purpose.length > 30 ? req.purpose.substring(0, 30) + '...' : req.purpose) : 'N/A'}`,
        sacramentType: 'Certificate'
      }))
    ];

    // Sort all schedules by date
    allSchedules.sort((a, b) => new Date(a.date) - new Date(b.date));

    console.log(`✅ Found ${allSchedules.length} total schedules`);
    res.json(allSchedules);
    
  } catch (err) {
    console.error("❌ Failed to fetch all schedules:", err.message);
    res.status(500).json({ 
      message: "Failed to fetch all schedules",
      error: err.message 
    });
  }
});

// DEBUG ROUTE - Check funeral schedules specifically
router.get("/debug/funeral", async (req, res) => {
  try {
    console.log("🔍 Debugging funeral schedules...");
    
    const funeralCount = await FuneralRequest.countDocuments();
    const funeralData = await FuneralRequest.find().lean();
    
    const formatted = funeralData.map(req => ({
      id: req._id,
      name: req.nameOfDeceased,
      date: req.scheduleDate,
      time: req.scheduleTime,
      status: req.status,
      requestNumber: req.requestNumber
    }));
    
    res.json({
      success: true,
      count: funeralCount,
      rawData: funeralData,
      formattedData: formatted,
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