const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const rescueTeamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  teamType: {
    type: String,
    enum: ['police', 'ambulance', 'fire_brigade'],
    required: [true, 'Team type is required']
  },
  vehicleNumber: {
    type: String,
    trim: true,
    default: ''
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    }
  },
  currentLocation: {
    type: String,
    default: ''
  },
  latitude: {
    type: Number,
    default: 0
  },
  longitude: {
    type: Number,
    default: 0
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for geospatial queries
rescueTeamSchema.index({ location: '2dsphere' });
rescueTeamSchema.index({ teamType: 1 });
rescueTeamSchema.index({ isAvailable: 1 });

// Hash password before saving
rescueTeamSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
rescueTeamSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update location coordinates when latitude/longitude changes
rescueTeamSchema.pre('save', function(next) {
  if (this.isModified('latitude') || this.isModified('longitude')) {
    this.location.coordinates = [this.longitude, this.latitude];
  }
  next();
});

module.exports = mongoose.model('RescueTeam', rescueTeamSchema);
