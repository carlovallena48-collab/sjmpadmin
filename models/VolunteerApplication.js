const mongoose = require("mongoose");

const volunteerSchema = new mongoose.Schema({
    ministry: { type: String, required: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    contactNumber: { type: String, required: true },
    submittedByEmail: { type: String, required: true },
    status: { type: String, default: "pending" },
    applicationDate: { type: Date, required: true },
    requestNumber: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    lastUpdated: { type: Date, default: Date.now },
    processedBy: { type: String, default: null },
    processedDate: { type: Date, default: null },
    notes: { type: String, default: "" },
    requirements: {
        orientation: { type: Boolean, default: false },
        training: { type: Boolean, default: false },
        documents: { type: Boolean, default: false }
    },
    rejection_reason: String,
    rejected_by: String,
    rejected_at: Date
}, { suppressReservedKeysWarning: true });

module.exports = mongoose.model("VolunteerApplication", volunteerSchema, "volunteerapplications");