const EmergencyAlert = require('../models/EmergencyAlert');
const User = require('../models/User');
const notificationService = require('../services/notificationService');

class EmergencyController {
  // Create emergency alert
  async createAlert(req, res) {
    try {
      const { userId, type, message, latitude, longitude, address, range, severity, images } = req.body;

      console.log('📢 Creating emergency alert:', { userId, type, message, latitude, longitude, range });

      // Validate required fields
      if (!userId || !message || !latitude || !longitude) {
        return res.status(400).json({
          success: false,
          message: 'Please provide userId, message, latitude, and longitude'
        });
      }

      // Find user
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Create emergency alert
      const alert = new EmergencyAlert({
        user: userId,
        type: type || 'OTHER',
        message,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        location: {
          type: 'Point',
          coordinates: [parseFloat(longitude), parseFloat(latitude)]
        },
        address: address || '',
        range: range || 5,
        severity: severity || 'MEDIUM',
        status: 'ACTIVE',
        images: images || []
      });

      await alert.save();

      console.log('✅ Emergency alert created:', alert._id);

      // Find nearby users within range (wrapped in try/catch to avoid crashing if geo index not ready)
      let nearbyUsers = [];
      try {
        nearbyUsers = await User.find({
          _id: { $ne: userId },
          location: {
            $near: {
              $geometry: {
                type: 'Point',
                coordinates: [longitude, latitude]
              },
              $maxDistance: range * 1000
            }
          }
        }).limit(100);
        console.log(`📍 Found ${nearbyUsers.length} nearby users within ${range}km`);
      } catch (geoErr) {
        console.warn('⚠️ Geospatial query failed (no 2dsphere index or invalid coords), skipping notifications:', geoErr.message);
      }

      // Send notifications to nearby users
      if (nearbyUsers.length > 0) {
        try {
          await notificationService.sendNotificationToNearbyUsers(nearbyUsers, alert, user);
          alert.notifiedUsers = nearbyUsers.map(u => u._id);
          alert.affectedCount = nearbyUsers.length;
          await alert.save();
          console.log(`📲 Notifications sent to ${nearbyUsers.length} users`);
        } catch (notifErr) {
          console.warn('⚠️ Notification send failed:', notifErr.message);
        }
      }

      // Populate user data
      await alert.populate('user', 'name phone email');

      res.status(201).json({
        success: true,
        message: 'Emergency alert created successfully',
        data: alert,
        notifiedCount: nearbyUsers.length
      });
    } catch (error) {
      console.error('❌ Create alert error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating emergency alert',
        error: error.message
      });
    }
  }

  // Get all alerts
  async getAllAlerts(req, res) {
    try {
      const { status, type, userId, limit = 100 } = req.query;
      const query = {};

      if (status) query.status = status;
      if (type) query.type = type;
      if (userId) query.user = userId;

      const alerts = await EmergencyAlert.find(query)
        .populate('user', 'name phone email latitude longitude')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit));

      res.json({
        success: true,
        count: alerts.length,
        data: alerts
      });
    } catch (error) {
      console.error('Get alerts error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching alerts',
        error: error.message
      });
    }
  }

  // Get alert by ID
  async getAlertById(req, res) {
    try {
      const { id } = req.params;

      const alert = await EmergencyAlert.findById(id)
        .populate('user', 'name phone email latitude longitude')
        .populate('verifiedBy', 'name email');

      if (!alert) {
        return res.status(404).json({
          success: false,
          message: 'Alert not found'
        });
      }

      res.json({
        success: true,
        data: alert
      });
    } catch (error) {
      console.error('Get alert by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching alert',
        error: error.message
      });
    }
  }

  // Get nearby alerts
  async getNearbyAlerts(req, res) {
    try {
      const { latitude, longitude, range = 10, status = 'ACTIVE' } = req.query;

      if (!latitude || !longitude) {
        return res.status(400).json({
          success: false,
          message: 'Please provide latitude and longitude'
        });
      }

      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      const maxDistance = parseFloat(range) * 1000; // Convert km to meters

      const alerts = await EmergencyAlert.find({
        status: status,
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [lng, lat]
            },
            $maxDistance: maxDistance
          }
        }
      })
      .populate('user', 'name phone email latitude longitude')
      .limit(50);

      res.json({
        success: true,
        count: alerts.length,
        data: alerts
      });
    } catch (error) {
      console.error('Get nearby alerts error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching nearby alerts',
        error: error.message
      });
    }
  }

  // Update alert status
  async updateAlertStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, verifiedBy } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Please provide status'
        });
      }

      const updateData = { status };

      if (status === 'RESOLVED') {
        updateData.resolvedAt = new Date();
      }

      if (verifiedBy && status === 'ACTIVE') {
        updateData.isVerified = true;
        updateData.verifiedBy = verifiedBy;
      }

      const alert = await EmergencyAlert.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      ).populate('user', 'name phone email');

      if (!alert) {
        return res.status(404).json({
          success: false,
          message: 'Alert not found'
        });
      }

      res.json({
        success: true,
        message: 'Alert status updated successfully',
        data: alert
      });
    } catch (error) {
      console.error('Update alert status error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating alert status',
        error: error.message
      });
    }
  }

  // Delete alert
  async deleteAlert(req, res) {
    try {
      const { id } = req.params;

      const alert = await EmergencyAlert.findByIdAndDelete(id);

      if (!alert) {
        return res.status(404).json({
          success: false,
          message: 'Alert not found'
        });
      }

      res.json({
        success: true,
        message: 'Alert deleted successfully'
      });
    } catch (error) {
      console.error('Delete alert error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting alert',
        error: error.message
      });
    }
  }

  // Get alert statistics
  async getStatistics(req, res) {
    try {
      const totalAlerts = await EmergencyAlert.countDocuments();
      const activeAlerts = await EmergencyAlert.countDocuments({ status: 'ACTIVE' });
      const resolvedAlerts = await EmergencyAlert.countDocuments({ status: 'RESOLVED' });
      const criticalAlerts = await EmergencyAlert.countDocuments({ 
        status: 'ACTIVE', 
        severity: 'CRITICAL' 
      });

      const alertsByType = await EmergencyAlert.aggregate([
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 }
          }
        }
      ]);

      res.json({
        success: true,
        data: {
          total: totalAlerts,
          active: activeAlerts,
          resolved: resolvedAlerts,
          critical: criticalAlerts,
          byType: alertsByType
        }
      });
    } catch (error) {
      console.error('Get statistics error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching statistics',
        error: error.message
      });
    }
  }
}

module.exports = new EmergencyController();
