const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Import Routes
const authRoutes = require('./routes/authRoutes');
const rescueTeamRoutes = require('./routes/rescueTeamRoutes');
const emergencyRoutes = require('./routes/emergencyRoutes');

// Import Firebase
require('./config/firebase');

// Import Models for testing
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Basic GET API - Shows backend is working
app.get('/', (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'Database connected' : 'Database not connected';
    res.json({
        message: 'API is running',
        database: dbStatus
    });
});

// Test API - Create User


// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/rescue-team', rescueTeamRoutes);
app.use('/api/emergency', emergencyRoutes);

;

// Local development server
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    
  });
}

// Export for Vercel
module.exports = app;
