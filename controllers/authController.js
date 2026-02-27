const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// Register User
exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, latitude, longitude, currentLocation } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      phone,
      password,
      latitude: latitude || 0,
      longitude: longitude || 0,
      currentLocation: currentLocation || ''
    });

    // Generate token - auto login after register
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered and logged in successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        latitude: user.latitude,
        longitude: user.longitude,
        currentLocation: user.currentLocation
      }
    });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message
    });
  }
};

// Login User
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

    // Find user and include password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        latitude: user.latitude,
        longitude: user.longitude,
        currentLocation: user.currentLocation
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

// Update User Location
exports.updateLocation = async (req, res) => {
  try {
    const { latitude, longitude, currentLocation } = req.body;
    const userId = req.user.id; // From auth middleware

    const user = await User.findByIdAndUpdate(
      userId,
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
      user: {
        id: user._id,
        name: user.name,
        latitude: user.latitude,
        longitude: user.longitude,
        currentLocation: user.currentLocation
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
