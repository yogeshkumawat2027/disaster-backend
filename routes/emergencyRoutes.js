const express = require('express');
const router = express.Router();
const emergencyController = require('../controllers/emergencyController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/all', emergencyController.getAllAlerts);
router.get('/nearby', emergencyController.getNearbyAlerts);
router.get('/statistics', emergencyController.getStatistics);
router.get('/:id', emergencyController.getAlertById);

// Protected routes
router.post('/', protect, emergencyController.createAlert);
router.put('/:id/status', protect, emergencyController.updateAlertStatus);
router.delete('/:id', protect, emergencyController.deleteAlert);

module.exports = router;
