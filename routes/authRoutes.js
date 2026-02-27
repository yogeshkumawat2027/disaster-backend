const express = require('express');
const router = express.Router();
const { register, login, updateLocation, logout, getCurrentUser } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getCurrentUser);
router.put('/update-location', protect, updateLocation);
router.post('/logout', protect, logout);

module.exports = router;
