const mongoose = require('mongoose');

const sickCallSchema = new mongoose.Schema({
  sacrament: {
    type: String,
    default: "Sick Call"
  },
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  contactNumber: {
    type: String,
    required: true
  },
  dateOfVisit: {
    type: String,
    required: true
  },
  timeOfVisit: {
    type: String,
    required: true
  },
  sickness: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in-process', 'scheduled', 'completed', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  },
  submittedByEmail: {
    type: String,
    required: true
  },
  requestNumber: {
    type: String,
    unique: true
  },
  priestAssigned: {
    type: String,
    default: null
  },
  visitStatus: {
    type: String,
    enum: ['scheduled', 'visited', 'rescheduled', 'cancelled'],
    default: 'scheduled'
  },
  emergencyLevel: {
    type: String,
    enum: ['low', 'normal', 'high', 'critical'],
    default: 'normal'
  },
  specialInstructions: {
    type: String,
    default: ""
  },
  address: {
    type: String,
    default: ""
  },
  age: {
    type: String,
    default: null
  },
  medicalHistory: {
    type: String,
    default: ""
  },
  // Reason system fields
  cancellation_reason: {
    type: String,
    default: ""
  },
  rejection_reason: {
    type: String,
    default: ""
  },
  cancelled_by: {
    type: String,
    default: ""
  },
  rejected_by: {
    type: String,
    default: ""
  },
  cancelled_at: {
    type: Date,
    default: null
  },
  rejected_at: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  collection: 'sickcallrequests' // ✅ ADD THIS LINE TO MATCH YOUR DATABASE
});

// Generate request number before saving
sickCallSchema.pre('save', function(next) {
  if (!this.requestNumber) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    this.requestNumber = `SICK-${timestamp}-${random}`;
  }
  next();
});

module.exports = mongoose.model('SickCall', sickCallSchema);