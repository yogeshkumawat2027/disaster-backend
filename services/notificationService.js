const { admin, isInitialized } = require('../config/firebase');

class NotificationService {
  // Send notification to a single user
  async sendNotification(fcmToken, title, body, data = {}) {
    if (!isInitialized || !admin) {
      console.log('⚠️ Firebase not initialized - skipping notification');
      return { success: false, error: 'Firebase not configured' };
    }
    if (!fcmToken) {
      console.log('⚠️ No FCM token provided');
      return { success: false, error: 'No FCM token' };
    }

    const message = {
      notification: {
        title,
        body
      },
      data: {
        ...data,
        timestamp: Date.now().toString()
      },
      token: fcmToken,
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          priority: 'high',
          channelId: 'emergency_alerts'
        }
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
            alert: {
              title,
              body
            }
          }
        }
      }
    };

    try {
      const response = await admin.messaging().send(message);
      console.log('✅ Notification sent:', response);
      return { success: true, messageId: response };
    } catch (error) {
      console.error('❌ Notification error:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Send notification to multiple users
  async sendMultipleNotifications(tokens, title, body, data = {}) {
    if (!isInitialized || !admin) {
      console.log('⚠️ Firebase not initialized - skipping notifications');
      return { success: false, error: 'Firebase not configured' };
    }
    if (!tokens || tokens.length === 0) {
      console.log('⚠️ No tokens provided');
      return { success: false, error: 'No tokens' };
    }

    const validTokens = tokens.filter(token => token && token.trim() !== '');
    
    if (validTokens.length === 0) {
      return { success: false, error: 'No valid tokens' };
    }

    const message = {
      notification: {
        title,
        body
      },
      data: {
        ...data,
        timestamp: Date.now().toString()
      },
      tokens: validTokens,
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          priority: 'high',
          channelId: 'emergency_alerts'
        }
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1
          }
        }
      }
    };

    try {
      const response = await admin.messaging().sendEachForMulticast(message);
      console.log(`✅ Sent ${response.successCount}/${validTokens.length} notifications`);
      
      if (response.failureCount > 0) {
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            console.error(`Failed to send to token ${idx}:`, resp.error?.message);
          }
        });
      }
      
      return { 
        success: true, 
        successCount: response.successCount,
        failureCount: response.failureCount 
      };
    } catch (error) {
      console.error('❌ Multiple notifications error:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Send emergency alert to nearby users
  async sendNotificationToNearbyUsers(users, alert, creator) {
    const tokens = users
      .map(user => user.fcmToken)
      .filter(token => token);

    if (tokens.length === 0) {
      console.log('⚠️ No users with valid FCM tokens');
      return { success: false, error: 'No tokens' };
    }

    const alertTypeEmoji = {
      'FIRE': '🔥',
      'FLOOD': '🌊',
      'EARTHQUAKE': '🌍',
      'ACCIDENT': '🚗',
      'MEDICAL': '🏥',
      'BRIDGE_COLLAPSE': '🌉',
      'BUILDING_COLLAPSE': '🏢',
      'LANDSLIDE': '⛰️',
      'TORNADO': '🌪️',
      'HURRICANE': '🌀',
      'OTHER': '⚠️'
    };

    const emoji = alertTypeEmoji[alert.type] || '⚠️';
    const title = `${emoji} Emergency Alert: ${alert.type.replace('_', ' ')}`;
    const body = `${alert.message.substring(0, 100)}... - ${creator.name}`;
    
    const data = {
      type: 'EMERGENCY_ALERT',
      alertId: alert._id.toString(),
      alertType: alert.type,
      severity: alert.severity,
      latitude: alert.latitude.toString(),
      longitude: alert.longitude.toString(),
      range: alert.range.toString(),
      creatorName: creator.name,
      creatorPhone: creator.phone || ''
    };

    return await this.sendMultipleNotifications(tokens, title, body, data);
  }

  // Send emergency notification (for rescue teams)
  async sendEmergencyNotification(user, alert, creator) {
    if (!user.fcmToken) {
      return { success: false, error: 'No FCM token' };
    }

    const title = `🚨 Emergency: ${alert.type.replace('_', ' ')}`;
    const body = `${creator.name}: ${alert.message}`;
    
    const data = {
      type: 'EMERGENCY_ALERT',
      alertId: alert._id.toString(),
      alertType: alert.type,
      severity: alert.severity,
      latitude: alert.latitude.toString(),
      longitude: alert.longitude.toString()
    };

    return await this.sendNotification(user.fcmToken, title, body, data);
  }
}

module.exports = new NotificationService();
