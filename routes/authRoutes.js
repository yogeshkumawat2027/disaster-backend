const express = require('express');
const router = express.Router();
const { register, login, updateLocation } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.put('/update-location', protect, updateLocation);

module.exports = router;
