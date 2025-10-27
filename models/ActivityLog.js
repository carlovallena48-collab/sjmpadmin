const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: ["CREATE", "UPDATE", "DELETE", "ACTIVATED", "DEACTIVATED", "LOGIN", "LOGOUT", "UPDATE_PROFILE_IMAGE"]
  },
  collectionName: { // CHANGED from 'collection' to 'collectionName'
    type: String,
    required: true
  },
  itemName: {
    type: String,
    required: true
  },
  identifier: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  user: {
    type: String,
    default: "system"
  }
}, {
  suppressReservedKeysWarning: true // ADD THIS to suppress warning
});

module.exports = mongoose.model("ActivityLog", activityLogSchema);