const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

/* =========================================================
  WEBSITE CONTENT SCHEMAS
  ========================================================= */
const websiteAnnouncementSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    image: String,
    status: { type: String, default: "published" },
    views: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { suppressReservedKeysWarning: true });

const websiteEventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    date: { type: Date, required: true },
    description: { type: String, required: true },
    image: String,
    location: String,
    status: { type: String, default: "scheduled" },
    attendees: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { suppressReservedKeysWarning: true });

const WebsiteAnnouncement = mongoose.model("WebsiteAnnouncement", websiteAnnouncementSchema, "websiteannouncements");
const WebsiteEvent = mongoose.model("WebsiteEvent", websiteEventSchema, "websiteevents");

/* =========================================================
  ACTIVITY LOG HELPER (Import from main server or define here)
  ========================================================= */
async function logActivity(action, collectionName, fullName, email) {
    try {
        // You can import this from your main server or define a simple version here
        const ActivityLog = mongoose.model('ActivityLog');
        await ActivityLog.create({ action, collectionName, userFullName: fullName, email });
    } catch (err) {
        console.error("❌ Failed to log activity:", err.message);
    }
}

/* =========================================================
  WEBSITE CONTENT ROUTES
  ========================================================= */

// WEBSITE ANNOUNCEMENTS
router.post("/website/announcements", async (req, res) => {
    try {
        console.log("📥 Creating website announcement:", req.body);
        
        const newAnnouncement = await WebsiteAnnouncement.create(req.body);
        await logActivity("CREATE", "websiteannouncements", "Website Admin", "website@sjmp.com");
        
        console.log("✅ Website announcement created:", newAnnouncement);
        res.status(201).json(newAnnouncement);
    } catch (err) {
        console.error("❌ Failed to create website announcement:", err.message);
        res.status(400).json({ message: "Failed to create announcement: " + err.message });
    }
});

router.get("/website/announcements", async (req, res) => {
    try {
        console.log("📤 Fetching website announcements...");
        const announcements = await WebsiteAnnouncement.find().sort({ createdAt: -1 }).lean();
        console.log(`✅ Found ${announcements.length} website announcements`);
        res.json(announcements);
    } catch (err) {
        console.error("❌ Failed to fetch website announcements:", err.message);
        res.status(500).json({ message: "Failed to fetch announcements: " + err.message });
    }
});

router.put("/website/announcements/:id", async (req, res) => {
    try {
        console.log("🔄 Updating website announcement:", req.params.id);
        
        const updateData = { 
            ...req.body,
            updatedAt: new Date()
        };
        
        const updatedAnnouncement = await WebsiteAnnouncement.findByIdAndUpdate(
            req.params.id, 
            updateData, 
            { new: true }
        );
        
        if (!updatedAnnouncement) {
            return res.status(404).json({ message: "Announcement not found" });
        }
        
        await logActivity("UPDATE", "websiteannouncements", "Website Admin", "website@sjmp.com");
        res.json(updatedAnnouncement);
    } catch (err) {
        console.error("❌ Failed to update website announcement:", err.message);
        res.status(400).json({ message: "Failed to update announcement: " + err.message });
    }
});

router.delete("/website/announcements/:id", async (req, res) => {
    try {
        const deletedAnnouncement = await WebsiteAnnouncement.findByIdAndDelete(req.params.id);
        if (!deletedAnnouncement) return res.status(404).json({ message: "Announcement not found" });
        
        await logActivity("DELETE", "websiteannouncements", "Website Admin", "website@sjmp.com");
        res.json({ message: "Announcement deleted successfully" });
    } catch (err) {
        console.error("❌ Failed to delete website announcement:", err.message);
        res.status(400).json({ message: "Failed to delete announcement" });
    }
});

// WEBSITE EVENTS
router.post("/website/events", async (req, res) => {
    try {
        console.log("📥 Creating website event:", req.body);
        
        const newEvent = await WebsiteEvent.create(req.body);
        await logActivity("CREATE", "websiteevents", "Website Admin", "website@sjmp.com");
        
        console.log("✅ Website event created:", newEvent);
        res.status(201).json(newEvent);
    } catch (err) {
        console.error("❌ Failed to create website event:", err.message);
        res.status(400).json({ message: "Failed to create event: " + err.message });
    }
});

router.get("/website/events", async (req, res) => {
    try {
        console.log("📤 Fetching website events...");
        const events = await WebsiteEvent.find().sort({ date: 1 }).lean();
        console.log(`✅ Found ${events.length} website events`);
        res.json(events);
    } catch (err) {
        console.error("❌ Failed to fetch website events:", err.message);
        res.status(500).json({ message: "Failed to fetch events: " + err.message });
    }
});

router.put("/website/events/:id", async (req, res) => {
    try {
        console.log("🔄 Updating website event:", req.params.id);
        
        const updateData = { 
            ...req.body,
            updatedAt: new Date()
        };
        
        const updatedEvent = await WebsiteEvent.findByIdAndUpdate(
            req.params.id, 
            updateData, 
            { new: true }
        );
        
        if (!updatedEvent) {
            return res.status(404).json({ message: "Event not found" });
        }
        
        await logActivity("UPDATE", "websiteevents", "Website Admin", "website@sjmp.com");
        res.json(updatedEvent);
    } catch (err) {
        console.error("❌ Failed to update website event:", err.message);
        res.status(400).json({ message: "Failed to update event: " + err.message });
    }
});

router.delete("/website/events/:id", async (req, res) => {
    try {
        const deletedEvent = await WebsiteEvent.findByIdAndDelete(req.params.id);
        if (!deletedEvent) return res.status(404).json({ message: "Event not found" });
        
        await logActivity("DELETE", "websiteevents", "Website Admin", "website@sjmp.com");
        res.json({ message: "Event deleted successfully" });
    } catch (err) {
        console.error("❌ Failed to delete website event:", err.message);
        res.status(400).json({ message: "Failed to delete event" });
    }
});

// WEBSITE STATISTICS
router.get("/website/stats", async (req, res) => {
    try {
        console.log("📊 Fetching website statistics...");
        
        const [totalAnnouncements, totalEvents, recentAnnouncements, upcomingEvents] = await Promise.all([
            WebsiteAnnouncement.countDocuments(),
            WebsiteEvent.countDocuments(),
            WebsiteAnnouncement.find().sort({ createdAt: -1 }).limit(5).lean(),
            WebsiteEvent.find({ date: { $gte: new Date() } }).sort({ date: 1 }).limit(5).lean()
        ]);

        const stats = {
            totalAnnouncements,
            totalEvents,
            recentAnnouncements,
            upcomingEvents
        };

        console.log("✅ Website statistics fetched");
        res.json(stats);
    } catch (err) {
        console.error("❌ Failed to fetch website statistics:", err.message);
        res.status(500).json({ message: "Failed to fetch website statistics: " + err.message });
    }
});

module.exports = router;