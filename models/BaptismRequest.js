const mongoose = require("mongoose");

const baptismSchema = new mongoose.Schema({
  name: { type: String, required: true },
  birthDate: String,
  birthPlace: String,
  fatherName: String,
  fatherBirthPlace: String,        
  motherName: String,
  motherBirthPlace: String,        
  marriage: [String],
  godfather: String,
  godfatherAddress: String,
  godmother: String,
  godmotherAddress: String,
  address: String,
  contact: String,
  baptismDate: { type: String, required: true },
  baptismTime: String,
  baptismType: { type: String, default: "solo" },
  status: { type: String, default: "pending" }, 
  paymentStatus: { type: String, default: "pending" },
  fee: { type: Number, default: 500 },
  reason: String,
  cancellationReason: String,
  paymentDate: String,
  paymentMethod: String,
  paymentReference: String,
  paymentNotes: String,
  submittedByEmail: String,
  createdAt: { type: Date, default: Date.now }
}, { suppressReservedKeysWarning: true });

module.exports = mongoose.model("BaptismRequest", baptismSchema, "baptismrequests");