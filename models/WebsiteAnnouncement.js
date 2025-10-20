const mongoose = require('mongoose');

const websiteAnnouncementSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    image: String,
    status: { type: String, default: "published" },
    views: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { suppressReservedKeysWarning: true });

module.exports = mongoose.model("WebsiteAnnouncement", websiteAnnouncementSchema, "websiteannouncements");