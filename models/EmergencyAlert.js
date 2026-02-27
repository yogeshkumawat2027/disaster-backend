const mongoose = require('mongoose');

const emergencyAlertSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: [true, 'Alert type is required'],
    enum: ['FIRE', 'FLOOD', 'EARTHQUAKE', 'ACCIDENT', 'MEDICAL', 'BRIDGE_COLLAPSE', 'BUILDING_COLLAPSE', 'LANDSLIDE', 'TORNADO', 'HURRICANE', 'OTHER'],
    default: 'OTHER'
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  address: {
    type: String,
    default: ''
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  range: {
    type: Number,
    default: 5, // Range in kilometers
    min: 1,
    max: 100
  },
  severity: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'MEDIUM'
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'RESOLVED', 'CANCELLED'],
    default: 'ACTIVE'
  },
  affectedCount: {
    type: Number,
    default: 0
  },
  images: [{
    type: String
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedAt: {
    type: Date
  },
  notifiedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

// Index for geospatial queries
emergencyAlertSchema.index({ location: '2dsphere' });
emergencyAlertSchema.index({ createdAt: -1 });
emergencyAlertSchema.index({ status: 1 });
emergencyAlertSchema.index({ type: 1 });

// Update location coordinates before saving
emergencyAlertSchema.pre('save', async function() {
  if (this.isModified('latitude') || this.isModified('longitude')) {
    this.location.coordinates = [this.longitude, this.latitude];
  }
});

module.exports = mongoose.model('EmergencyAlert', emergencyAlertSchema);
