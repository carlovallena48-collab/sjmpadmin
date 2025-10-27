const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  username: { type: String, unique: true, required: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, default: "Admin" },
  address: String,
  contact: String,
}, { 
  suppressReservedKeysWarning: true,
  collection: "adminaccount" 
});

module.exports = mongoose.model("AdminAccount", adminSchema);