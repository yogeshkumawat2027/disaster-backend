const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Import Routes
const authRoutes = require('./routes/authRoutes');
const rescueTeamRoutes = require('./routes/rescueTeamRoutes');

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
app.post('/create-user', async (req, res) => {
    try {
        const { name, email, phone, password, latitude, longitude, currentLocation } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                message: 'User with this email already exists' 
            });
        }

        // Create new user
        const user = new User({
            name,
            email,
            phone,
            password,
            latitude: latitude || 0,
            longitude: longitude || 0,
            currentLocation: currentLocation || ''
        });

        await user.save();

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                latitude: user.latitude,
                longitude: user.longitude,
                currentLocation: user.currentLocation,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating user',
            error: error.message
        });
    }
});

// Test API - Get All Users
app.get('/get-users', async (req, res) => {
    try {
        const users = await User.find().select('-password');
        
        res.status(200).json({
            success: true,
            count: users.length,
            users: users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: error.message
        });
    }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/rescue-team', rescueTeamRoutes);

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
