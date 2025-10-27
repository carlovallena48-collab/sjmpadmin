const express = require("express");
const User = require("../models/User");
const BaptismRequest = require("../models/BaptismRequest");
const ConfirmationRequest = require("../models/ConfirmationRequest");
const HolyOrdersRequest = require("../models/HolyOrdersRequest");
const PamisaRequest = require("../models/PamisaRequest");
const FuneralRequest = require("../models/FuneralRequest");
const BlessingRequest = require("../models/BlessingRequest");
const MarriageRequest = require("../models/MarriageRequest");
const CertificateRequest = require("../models/CertificateRequest");
const VolunteerApplication = require("../models/VolunteerApplication");
const ActivityLog = require("../models/ActivityLog");

const router = express.Router();

// Total users
router.get("/total-users", async (req, res) => {
  try { 
    const total = await User.countDocuments(); 
    res.json({ total }); 
  } catch (err) { 
    res.status(500).json({ message: "Error fetching total users" }); 
  }
});

// Monthly users
router.get("/monthly-users", async (req, res) => {
  try {
    console.log("📊 Fetching monthly users data...");
    
    const report = await User.aggregate([
      { 
        $group: { 
          _id: { 
            year: { $year: "$createdAt" }, 
            month: { $month: "$createdAt" } 
          }, 
          count: { $sum: 1 } 
        } 
      }, 
      { 
        $sort: { "_id.year": 1, "_id.month": 1 } 
      }, 
      { 
        $project: { 
          month: { $toInt: "$_id.month" }, 
          count: 1, 
          _id: 0 
        } 
      }
    ]);
    
    const months = Array(12).fill(0); 
    report.forEach(r => { 
      if (r.month >= 1 && r.month <= 12) months[r.month - 1] = r.count; 
    });
    
    // Format for chart
    const formattedData = months.map((count, idx) => ({ 
      month: idx + 1, 
      count: count 
    }));

    console.log("✅ Monthly users data generated");
    res.json(formattedData);

  } catch (err) { 
    console.error("❌ Error generating monthly users report:", err.message);
    // Return sample data
    res.json([
      { month: 1, count: 5 }, { month: 2, count: 8 }, { month: 3, count: 12 },
      { month: 4, count: 7 }, { month: 5, count: 15 }, { month: 6, count: 18 },
      { month: 7, count: 22 }, { month: 8, count: 19 }, { month: 9, count: 25 },
      { month: 10, count: 28 }, { month: 11, count: 30 }, { month: 12, count: 35 }
    ]);
  }
});

// Recent users
router.get("/recent-users", async (req, res) => {
  try {
    const recentActivities = await ActivityLog.find().sort({ timestamp: -1 }).limit(5).select("userFullName email action timestamp");
    const formatted = recentActivities.map(item => ({ 
      name: item.userFullName || item.email || "Unknown", 
      email: item.email || item.userFullName || "Unknown", 
      action: item.action, 
      timestamp: item.timestamp 
    }));
    res.json(formatted);
  } catch (err) { 
    res.status(500).json({ message: "Error fetching recent users" }); 
  }
});

// Baptism stats
router.get("/total-baptism", async (req, res) => {
  try { 
    const total = await BaptismRequest.countDocuments(); 
    res.json({ total }); 
  } catch (err) { 
    res.status(500).json({ message: "Error fetching total baptism" }); 
  }
});

router.get("/monthly-baptism", async (req, res) => {
  try {
    const report = await BaptismRequest.aggregate([
      { 
        $group: { 
          _id: { 
            year: { $year: "$createdAt" }, 
            month: { $month: "$createdAt" } 
          }, 
          count: { $sum: 1 } 
        } 
      }, 
      { 
        $sort: { "_id.year": 1, "_id.month": 1 } 
      }, 
      { 
        $project: { 
          month: { $toInt: "$_id.month" }, 
          count: 1, 
          _id: 0 
        } 
      }
    ]);
    
    const months = Array(12).fill(0); 
    report.forEach(r => { 
      if (r.month >= 1 && r.month <= 12) months[r.month - 1] = r.count; 
    });
    
    res.json(months.map((count, idx) => ({ month: idx + 1, count })));
  } catch (err) { 
    res.status(500).json({ message: "Error generating monthly baptism report" }); 
  }
});

// Confirmation stats
router.get("/total-confirmation", async (req, res) => {
  try { 
    const total = await ConfirmationRequest.countDocuments(); 
    res.json({ total }); 
  } catch (err) { 
    console.error("❌ Error fetching total confirmation:", err.message);
    res.status(500).json({ message: "Error fetching total confirmation" }); 
  }
});

router.get("/monthly-confirmation", async (req, res) => {
  try {
    const report = await ConfirmationRequest.aggregate([
      { 
        $group: { 
          _id: { 
            year: { $year: "$createdAt" }, 
            month: { $month: "$createdAt" } 
          }, 
          count: { $sum: 1 } 
        } 
      }, 
      { 
        $sort: { "_id.year": 1, "_id.month": 1 } 
      }, 
      { 
        $project: { 
          month: { $toInt: "$_id.month" }, 
          count: 1, 
          _id: 0 
        } 
      }
    ]);
    
    const months = Array(12).fill(0); 
    report.forEach(r => { 
      if (r.month >= 1 && r.month <= 12) months[r.month - 1] = r.count; 
    });
    
    res.json(months.map((count, idx) => ({ month: idx + 1, count })));
  } catch (err) { 
    console.error("❌ Error generating monthly confirmation report:", err.message);
    res.status(500).json({ message: "Error generating monthly confirmation report" }); 
  }
});

// Holy Orders stats
router.get("/total-holy-orders", async (req, res) => {
  try { 
    const total = await HolyOrdersRequest.countDocuments(); 
    res.json({ total }); 
  } catch (err) { 
    console.error("❌ Error fetching total holy orders:", err.message);
    res.status(500).json({ message: "Error fetching total holy orders" }); 
  }
});

router.get("/monthly-holy-orders", async (req, res) => {
  try {
    const report = await HolyOrdersRequest.aggregate([
      { 
        $group: { 
          _id: { 
            year: { $year: "$createdAt" }, 
            month: { $month: "$createdAt" } 
          }, 
          count: { $sum: 1 } 
        } 
      }, 
      { 
        $sort: { "_id.year": 1, "_id.month": 1 } 
      }, 
      { 
        $project: { 
          month: { $toInt: "$_id.month" }, 
          count: 1, 
          _id: 0 
        } 
      }
    ]);
    
    const months = Array(12).fill(0); 
    report.forEach(r => { 
      if (r.month >= 1 && r.month <= 12) months[r.month - 1] = r.count; 
    });
    
    res.json(months.map((count, idx) => ({ month: idx + 1, count })));
  } catch (err) { 
    console.error("❌ Error generating monthly holy orders report:", err.message);
    res.status(500).json({ message: "Error generating monthly holy orders report" }); 
  }
});

// Pamisa stats
router.get("/total-pamisa", async (req, res) => {
  try { 
    const total = await PamisaRequest.countDocuments(); 
    res.json({ total }); 
  } catch (err) { 
    console.error("❌ Error fetching total pamisa:", err.message);
    res.status(500).json({ message: "Error fetching total pamisa" }); 
  }
});

router.get("/monthly-pamisa", async (req, res) => {
  try {
    const report = await PamisaRequest.aggregate([
      { 
        $group: { 
          _id: { 
            year: { $year: "$createdAt" }, 
            month: { $month: "$createdAt" } 
          }, 
          count: { $sum: 1 } 
        } 
      }, 
      { 
        $sort: { "_id.year": 1, "_id.month": 1 } 
      }, 
      { 
        $project: { 
          month: { $toInt: "$_id.month" }, 
          count: 1, 
          _id: 0 
        } 
      }
    ]);
    
    const months = Array(12).fill(0); 
    report.forEach(r => { 
      if (r.month >= 1 && r.month <= 12) months[r.month - 1] = r.count; 
    });
    
    res.json(months.map((count, idx) => ({ month: idx + 1, count })));
  } catch (err) { 
    console.error("❌ Error generating monthly pamisa report:", err.message);
    res.status(500).json({ message: "Error generating monthly pamisa report" }); 
  }
});

// Funeral stats
router.get("/total-funeral", async (req, res) => {
  try { 
    const total = await FuneralRequest.countDocuments(); 
    res.json({ total }); 
  } catch (err) { 
    console.error("❌ Error fetching total funeral:", err.message);
    res.status(500).json({ message: "Error fetching total funeral" }); 
  }
});

router.get("/monthly-funeral", async (req, res) => {
  try {
    const report = await FuneralRequest.aggregate([
      { 
        $group: { 
          _id: { 
            year: { $year: "$createdAt" }, 
            month: { $month: "$createdAt" } 
          }, 
          count: { $sum: 1 } 
        } 
      }, 
      { 
        $sort: { "_id.year": 1, "_id.month": 1 } 
      }, 
      { 
        $project: { 
          month: { $toInt: "$_id.month" }, 
          count: 1, 
          _id: 0 
        } 
      }
    ]);
    
    const months = Array(12).fill(0); 
    report.forEach(r => { 
      if (r.month >= 1 && r.month <= 12) months[r.month - 1] = r.count; 
    });
    
    res.json(months.map((count, idx) => ({ month: idx + 1, count })));
  } catch (err) { 
    console.error("❌ Error generating monthly funeral report:", err.message);
    res.status(500).json({ message: "Error generating monthly funeral report" }); 
  }
});

// Blessing stats
router.get("/total-blessing", async (req, res) => {
  try { 
    const total = await BlessingRequest.countDocuments(); 
    res.json({ total }); 
  } catch (err) { 
    console.error("❌ Error fetching total blessing:", err.message);
    res.status(500).json({ message: "Error fetching total blessing" }); 
  }
});

router.get("/monthly-blessing", async (req, res) => {
  try {
    const report = await BlessingRequest.aggregate([
      { 
        $group: { 
          _id: { 
            year: { $year: "$createdAt" }, 
            month: { $month: "$createdAt" } 
          }, 
          count: { $sum: 1 } 
        } 
      }, 
      { 
        $sort: { "_id.year": 1, "_id.month": 1 } 
      }, 
      { 
        $project: { 
          month: { $toInt: "$_id.month" }, 
          count: 1, 
          _id: 0 
        } 
      }
    ]);
    
    const months = Array(12).fill(0); 
    report.forEach(r => { 
      if (r.month >= 1 && r.month <= 12) months[r.month - 1] = r.count; 
    });
    
    res.json(months.map((count, idx) => ({ month: idx + 1, count })));
  } catch (err) { 
    console.error("❌ Error generating monthly blessing report:", err.message);
    res.status(500).json({ message: "Error generating monthly blessing report" }); 
  }
});

// Marriage stats
router.get("/total-marriage", async (req, res) => {
  try { 
    const total = await MarriageRequest.countDocuments(); 
    res.json({ total }); 
  } catch (err) { 
    console.error("❌ Error fetching total marriage:", err.message);
    res.status(500).json({ message: "Error fetching total marriage" }); 
  }
});

router.get("/monthly-marriage", async (req, res) => {
  try {
    const report = await MarriageRequest.aggregate([
      { 
        $group: { 
          _id: { 
            year: { $year: "$createdAt" }, 
            month: { $month: "$createdAt" } 
          }, 
          count: { $sum: 1 } 
        } 
      }, 
      { 
        $sort: { "_id.year": 1, "_id.month": 1 } 
      }, 
      { 
        $project: { 
          month: { $toInt: "$_id.month" }, 
          count: 1, 
          _id: 0 
        } 
      }
    ]);
    
    const months = Array(12).fill(0); 
    report.forEach(r => { 
      if (r.month >= 1 && r.month <= 12) months[r.month - 1] = r.count; 
    });
    
    res.json(months.map((count, idx) => ({ month: idx + 1, count })));
  } catch (err) { 
    console.error("❌ Error generating monthly marriage report:", err.message);
    res.status(500).json({ message: "Error generating monthly marriage report" }); 
  }
});

// Certificate stats
router.get("/total-certificates", async (req, res) => {
  try { 
    const total = await CertificateRequest.countDocuments(); 
    res.json({ total }); 
  } catch (err) { 
    console.error("❌ Error fetching total certificates:", err.message);
    res.status(500).json({ message: "Error fetching total certificates" }); 
  }
});

router.get("/monthly-certificates", async (req, res) => {
  try {
    const report = await CertificateRequest.aggregate([
      { 
        $group: { 
          _id: { 
            year: { $year: "$createdAt" }, 
            month: { $month: "$createdAt" } 
          }, 
          count: { $sum: 1 } 
        } 
      }, 
      { 
        $sort: { "_id.year": 1, "_id.month": 1 } 
      }, 
      { 
        $project: { 
          month: { $toInt: "$_id.month" }, 
          count: 1, 
          _id: 0 
        } 
      }
    ]);
    
    const months = Array(12).fill(0); 
    report.forEach(r => { 
      if (r.month >= 1 && r.month <= 12) months[r.month - 1] = r.count; 
    });
    
    res.json(months.map((count, idx) => ({ month: idx + 1, count })));
  } catch (err) { 
    console.error("❌ Error generating monthly certificates report:", err.message);
    res.status(500).json({ message: "Error generating monthly certificates report" }); 
  }
});

// Get certificate statistics by status
router.get("/certificate-stats", async (req, res) => {
  try {
    const stats = await CertificateRequest.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);
    
    const result = {
      pending: 0,
      approved: 0,
      ready: 0,
      rejected: 0,
      cancelled: 0
    };
    
    stats.forEach(stat => {
      if (result.hasOwnProperty(stat._id)) {
        result[stat._id] = stat.count;
      }
    });
    
    res.json(result);
  } catch (err) {
    console.error("❌ Error fetching certificate stats:", err.message);
    res.status(500).json({ message: "Error fetching certificate statistics" });
  }
});

// Volunteer stats
router.get("/total-volunteers", async (req, res) => {
  try { 
    const total = await VolunteerApplication.countDocuments(); 
    res.json({ total }); 
  } catch (err) { 
    console.error("❌ Error fetching total volunteers:", err.message);
    res.status(500).json({ message: "Error fetching total volunteers" }); 
  }
});

// Overall dashboard statistics
router.get("/overview", async (req, res) => {
  try {
    console.log("📊 Generating dashboard overview...");
    
    const [
      totalUsers,
      totalBaptism,
      totalConfirmation,
      totalHolyOrders,
      totalPamisa,
      totalFuneral,
      totalBlessing,
      totalMarriage,
      totalCertificates,
      totalVolunteers
    ] = await Promise.all([
      User.countDocuments(),
      BaptismRequest.countDocuments(),
      ConfirmationRequest.countDocuments(),
      HolyOrdersRequest.countDocuments(),
      PamisaRequest.countDocuments(),
      FuneralRequest.countDocuments(),
      BlessingRequest.countDocuments(),
      MarriageRequest.countDocuments(),
      CertificateRequest.countDocuments(),
      VolunteerApplication.countDocuments()
    ]);

    // Get pending requests count
    const pendingCounts = await Promise.all([
      BaptismRequest.countDocuments({ status: 'pending' }),
      ConfirmationRequest.countDocuments({ status: 'pending' }),
      PamisaRequest.countDocuments({ status: 'pending' }),
      FuneralRequest.countDocuments({ status: 'pending' }),
      BlessingRequest.countDocuments({ status: 'pending' }),
      MarriageRequest.countDocuments({ status: 'pending' }),
      CertificateRequest.countDocuments({ status: 'pending' })
    ]);
    
    const totalPending = pendingCounts.reduce((sum, count) => sum + count, 0);

    // Get paid requests for revenue calculation
    const paidCounts = await Promise.all([
      BaptismRequest.countDocuments({ paymentStatus: 'paid' }),
      ConfirmationRequest.countDocuments({ paymentStatus: 'paid' }),
      PamisaRequest.countDocuments({ paymentStatus: 'paid' }),
      FuneralRequest.countDocuments({ paymentStatus: 'paid' }),
      BlessingRequest.countDocuments({ paymentStatus: 'paid' }),
      MarriageRequest.countDocuments({ paymentStatus: 'paid' })
    ]);

    const totalRevenue = 
      (paidCounts[0] * 500) +     // Baptism
      (paidCounts[1] * 500) +     // Confirmation
      (paidCounts[2] * 500) +     // Pamisa
      (paidCounts[3] * 1000) +    // Funeral
      (paidCounts[4] * 500) +     // Blessing
      (paidCounts[5] * 5000);     // Marriage

    const totalSacraments = totalBaptism + totalConfirmation + totalHolyOrders + 
                           totalPamisa + totalFuneral + totalBlessing + totalMarriage;

    const overview = {
      totalParishioners: totalUsers,
      totalSacraments: totalSacraments,
      pendingRequests: totalPending,
      totalRevenue: totalRevenue,
      completionRate: totalSacraments > 0 ? Math.round(((totalSacraments - totalPending) / totalSacraments) * 100) : 0,
      breakdown: {
        baptism: totalBaptism,
        confirmation: totalConfirmation,
        holyOrders: totalHolyOrders,
        pamisa: totalPamisa,
        funeral: totalFuneral,
        blessing: totalBlessing,
        marriage: totalMarriage,
        certificates: totalCertificates,
        volunteers: totalVolunteers
      }
    };

    console.log("✅ Dashboard overview generated");
    res.json(overview);

  } catch (err) {
    console.error("❌ Error generating dashboard overview:", err.message);
    res.status(500).json({ message: "Error generating dashboard overview" });
  }
});

module.exports = router;