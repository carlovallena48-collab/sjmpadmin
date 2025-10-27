const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema({
  certificateType: { type: String, required: true },
  fullName: { type: String, required: true },
  dateOfSacrament: String,
  purpose: { type: String, required: true },
  contactNumber: { type: String, required: true },
  address: { type: String, required: true },
  requestedCopies: { type: Number, default: 1 },
  status: { type: String, default: "pending" },
  certificateNumber: String,
  submittedByEmail: { type: String, required: true },
  requestDate: { type: String, required: true },
  scheduledDate: String,
  cancellation_reason: String,
  rejection_reason: String,
  cancelled_by: String,
  rejected_by: String,
  cancelled_at: Date,
  rejected_at: Date,
  approved_by: String,
  approved_at: Date,
  ready_by: String,
  ready_at: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { suppressReservedKeysWarning: true });

module.exports = mongoose.model("CertificateRequest", certificateSchema, "certificaterequests");