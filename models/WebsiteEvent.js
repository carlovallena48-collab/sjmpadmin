const mongoose = require('mongoose');

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

module.exports = mongoose.model("WebsiteEvent", websiteEventSchema, "websiteevents");