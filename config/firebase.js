const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

let firebaseInitialized = false;

// Prevent duplicate initialization
if (admin.apps.length > 0) {
  firebaseInitialized = true;
  console.log('✅ Firebase already initialized');
} else
try {
  // Option 1: Direct service account JSON file in config folder
  const serviceAccountPath = path.join(__dirname, 'smart-disaster-managemen-a9d01-firebase-adminsdk-fbsvc-fee34ed54b.json');
  const fs = require('fs');

  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    firebaseInitialized = true;
    console.log('✅ Firebase initialized with service account JSON file');
  }
  // Option 2: Using environment variables (for Vercel/production)
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
  } else {
    console.log('⚠️ Firebase not configured - notifications will not be sent');
  }
} catch (error) {
  console.error('❌ Firebase initialization error:', error.message);
  console.log('Continuing without Firebase - notifications will not be sent');
}

module.exports = {
  admin: firebaseInitialized ? admin : null,
  isInitialized: firebaseInitialized
};
