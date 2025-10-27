const mongoose = require("mongoose");

const holyOrdersSchema = new mongoose.Schema({
  sacrament: { type: String, default: "Holy Orders" },
  name: { type: String, required: true },
  email: { type: String, required: true },
  contactNumber: { type: String, required: true },
  status: { type: String, default: "pending" },
  submittedByEmail: { type: String, required: true },
  requestNumber: { type: String, required: true },
  ordinationType: { type: String, default: "deacon" },
  seminaryName: String,
  seminaryYears: Number,
  ordinationDate: String,
  ordinationTime: String,
  ordinationPlace: String,
  sponsorName: String,
  sponsorContact: String,
  cancellation_reason: String,
  rejection_reason: String,
  cancelled_by: String,
  rejected_by: String,
  cancelled_at: Date,
  rejected_at: Date,
  createdAt: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now },
  references: { type: [String], default: [] }
}, { suppressReservedKeysWarning: true });

module.exports = mongoose.model("HolyOrdersRequest", holyOrdersSchema, "holyordersrequests");