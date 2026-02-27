const express = require('express');
const router = express.Router();
const { register, login, updateLocation, updateAvailability } = require('../controllers/rescueTeamController');
const { protectRescueTeam } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.put('/update-location', protectRescueTeam, updateLocation);
router.put('/update-availability', protectRescueTeam, updateAvailability);

module.exports = router;
