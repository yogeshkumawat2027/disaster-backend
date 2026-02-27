const express = require('express');
const router = express.Router();
const emergencyController = require('../controllers/emergencyController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/all', emergencyController.getAllAlerts);
router.get('/nearby', emergencyController.getNearbyAlerts);
router.get('/statistics', emergencyController.getStatistics);
router.get('/:id', emergencyController.getAlertById);

// Create alert - no auth required (userId validated from body)
router.post('/', emergencyController.createAlert);

// Protected routes
router.put('/:id/status', protect, emergencyController.updateAlertStatus);
router.delete('/:id', protect, emergencyController.deleteAlert);

module.exports = router;
