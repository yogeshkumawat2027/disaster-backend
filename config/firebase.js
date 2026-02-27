const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// Note: You need to download your service account key from Firebase Console
// and place it in the config folder or use environment variables

let firebaseInitialized = false;

try {
  // Option 1: Using service account key file (recommended for production)
  // Download from: Firebase Console > Project Settings > Service Accounts
  if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    firebaseInitialized = true;
    console.log('✅ Firebase initialized with service account');
  }
  // Option 2: Using environment variables
  else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL
      })
    });
    firebaseInitialized = true;
    console.log('✅ Firebase initialized with environment variables');
  }
  // Option 3: Development mode (no notifications)
  else {
    console.log('⚠️ Firebase not configured - notifications will not be sent');
    console.log('To enable notifications, add Firebase credentials to .env file');
  }
} catch (error) {
  console.error('❌ Firebase initialization error:', error.message);
  console.log('Continuing without Firebase - notifications will not be sent');
}

module.exports = { 
  admin: firebaseInitialized ? admin : null,
  isInitialized: firebaseInitialized
};
