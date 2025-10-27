const mongoose = require("mongoose");

const pamisaSchema = new mongoose.Schema({
  sacrament: { type: String, default: "Pamisa" },
  names: [String],
  intention: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  displayDate: String,
  displayTime: String,
  massSponsor: String,
  donation: String,
  status: { type: String, default: "pending" },
  paymentStatus: { type: String, default: "pending" },
  fee: { type: Number, default: 500 },
  cancellation_reason: String,
  rejection_reason: String,
  cancelled_by: String,
  rejected_by: String,
  cancelled_at: Date,
  rejected_at: Date,
  paymentDate: String,
  paymentMethod: String,
  paymentReference: String,
  paymentNotes: String,
  submittedByEmail: String,
  requestNumber: String,
  createdAt: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now }
}, { suppressReservedKeysWarning: true });

module.exports = mongoose.model("PamisaRequest", pamisaSchema, "pamisarequests");