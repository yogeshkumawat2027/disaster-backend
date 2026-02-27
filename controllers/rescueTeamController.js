const RescueTeam = require('../models/RescueTeam');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (teamId) => {
  return jwt.sign({ id: teamId, userType: 'rescueTeam' }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// Register Rescue Team
exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, teamType, vehicleNumber, latitude, longitude, currentLocation } = req.body;

    // Check if rescue team already exists
    const existingTeam = await RescueTeam.findOne({ email });
    if (existingTeam) {
      return res.status(400).json({
        success: false,
        message: 'Rescue team already exists with this email'
      });
    }

    // Create new rescue team
    const team = await RescueTeam.create({
      name,
      email,
      phone,
      password,
      teamType,
      vehicleNumber: vehicleNumber || '',
      latitude: latitude || 0,
      longitude: longitude || 0,
      currentLocation: currentLocation || ''
    });

    // Generate token - auto login after register
    const token = generateToken(team._id);

    res.status(201).json({
      success: true,
      message: 'Rescue team registered and logged in successfully',
      token,
      team: {
        id: team._id,
        name: team.name,
        email: team.email,
        phone: team.phone,
        teamType: team.teamType,
        vehicleNumber: team.vehicleNumber,
        latitude: team.latitude,
        longitude: team.longitude,
        currentLocation: team.currentLocation,
        isAvailable: team.isAvailable
      }
    });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering rescue team',
      error: error.message
    });
  }
};

// Login Rescue Team
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find team and include password field
    const team = await RescueTeam.findOne({ email }).select('+password');

    if (!team) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await team.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(team._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      team: {
        id: team._id,
        name: team.name,
        email: team.email,
        phone: team.phone,
        teamType: team.teamType,
        vehicleNumber: team.vehicleNumber,
        latitude: team.latitude,
        longitude: team.longitude,
        currentLocation: team.currentLocation,
        isAvailable: team.isAvailable
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message
    });
  }
};

// Update Rescue Team Location
exports.updateLocation = async (req, res) => {
  try {
    const { latitude, longitude, currentLocation } = req.body;
    const teamId = req.user.id; // From auth middleware

    const team = await RescueTeam.findByIdAndUpdate(
      teamId,
      {
        latitude,
        longitude,
        currentLocation
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Location updated successfully',
      team: {
        id: team._id,
        name: team.name,
        teamType: team.teamType,
        latitude: team.latitude,
        longitude: team.longitude,
        currentLocation: team.currentLocation
      }
    });
  } catch (error) {
    console.error('Update Location Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating location',
      error: error.message
    });
  }
};

// Update Availability Status
exports.updateAvailability = async (req, res) => {
  try {
    const { isAvailable } = req.body;
    const teamId = req.user.id;

    const team = await RescueTeam.findByIdAndUpdate(
      teamId,
      { isAvailable },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Availability status updated successfully',
      team: {
        id: team._id,
        name: team.name,
        teamType: team.teamType,
        isAvailable: team.isAvailable
      }
    });
  } catch (error) {
    console.error('Update Availability Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating availability',
      error: error.message
    });
  }
};
