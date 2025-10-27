const mongoose = require("mongoose");

const confirmationSchema = new mongoose.Schema({
  sacrament: { type: String, default: "Kumpil" },
  confirmandName: { type: String, required: true },
  birthDate: String,
  birthPlace: String,
  age: String,
  fatherName: String,
  motherName: String,
  godfatherName: String,
  godmotherName: String,
  currentAddress: String,
  contactNo: String,
  kumpilDate: { type: String, required: true },
  kumpilTime: String,
  baptismDate: String,
  baptismChurch: String,
  confirmationType: { type: String, default: "solo" },
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
  createdAt: { type: Date, default: Date.now }
}, { suppressReservedKeysWarning: true });

module.exports = mongoose.model("ConfirmationRequest", confirmationSchema, "kumpilrequests");