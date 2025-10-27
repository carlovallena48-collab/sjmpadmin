const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, default: "Member" },
  address: String,
  contact: String,
  createdAt: { type: Date, default: Date.now },
}, { 
  collection: "users",
  timestamps: true 
});

module.exports = mongoose.model("User", userSchema);