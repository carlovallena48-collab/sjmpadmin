const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const websiteAdminSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  username: { 
    type: String, 
    unique: true, 
    required: true, 
    trim: true, 
    lowercase: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    default: "staff"
  },
  address: {
    type: String,
    default: ""
  },
  contact: {
    type: String, 
    default: ""
  },
  position: {
    type: String,
    default: "Staff"
  },
  department: {
    type: String,
    default: "Administration"
  },
  notes: {
    type: String,
    default: ""
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  lastUpdated: { 
    type: Date, 
    default: Date.now 
  }
}, { 
  suppressReservedKeysWarning: true,
  collection: "adminaccount"
});

// Pre-save middleware to hash password
websiteAdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
websiteAdminSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile (without password)
websiteAdminSchema.methods.toJSON = function () {
  const admin = this.toObject();
  delete admin.password;
  return admin;
};

module.exports = mongoose.model("WebsiteAdmin", websiteAdminSchema);