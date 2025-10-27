const mongoose = require("mongoose");

const funeralSchema = new mongoose.Schema({
  sacrament: { type: String, default: "Funeral Service" },
  nameOfDeceased: { type: String, required: true },
  birthday: String,
  civilStatus: String,
  nameOfHusbandOrWife: String,
  informant: String,
  relationship: String,
  residence: String,
  dateDied: String,
  age: String,
  causeOfDeath: String,
  receivedLastSacrament: String,
  placeOfBurialCemetery: String,
  scheduleDate: { type: String, required: true },
  scheduleTime: { type: String, required: true },
  contactNumber: String,
  status: { type: String, default: "pending" },
  submittedByEmail: String,
  requestNumber: String,
  cancellation_reason: String,
  rejection_reason: String,
  cancelled_by: String,
  rejected_by: String,
  cancelled_at: Date,
  rejected_at: Date,
  paymentStatus: { type: String, default: "pending" },
  paymentDate: String,
  paymentMethod: String,
  paymentReference: String,
  paymentNotes: String,
  fee: { type: Number, default: 1000 },
  createdAt: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now }
}, { suppressReservedKeysWarning: true });

module.exports = mongoose.model("FuneralRequest", funeralSchema, "funeralrequests");