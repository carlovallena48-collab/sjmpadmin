const mongoose = require("mongoose");

const blessingSchema = new mongoose.Schema({
  sacrament: { type: String, default: "Blessing" },
  name: { type: String, required: true },
  blessingType: { type: String, required: true },
  requestForDetails: String,
  address: { type: String, required: true },
  contactNumber: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  displayDate: String,
  displayTime: String,
  status: { type: String, default: "pending" },
  requestNumber: { type: String, required: true },
  donationNote: String,
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
  fee: Number,
  createdAt: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now }
}, { suppressReservedKeysWarning: true });

module.exports = mongoose.model('BlessingRequest', blessingSchema, 'blessingrequests');