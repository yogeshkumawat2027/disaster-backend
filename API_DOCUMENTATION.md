# Disaster Backend - API Documentation

## Base URL
```
http://localhost:3000/api
```

---

## Authentication APIs

### 1. Register User
**Endpoint:** `POST /api/auth/register`

**Description:** Register a new user and receive authentication token

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "password123",
  "latitude": 34.0522,
  "longitude": -118.2437,
  "currentLocation": "Los Angeles, CA"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered and logged in successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "latitude": 34.0522,
    "longitude": -118.2437,
    "currentLocation": "Los Angeles, CA"
  }
}
```

**Error Responses:**
- `400` - User already exists
- `500` - Server error

---

### 2. Login User
**Endpoint:** `POST /api/auth/login`

**Description:** Login with email and password

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "latitude": 34.0522,
    "longitude": -118.2437,
    "currentLocation": "Los Angeles, CA"
  }
}
```

**Error Responses:**
- `400` - Missing email or password
- `401` - Invalid credentials
- `500` - Server error

---

### 3. Get Current User (Protected)
**Endpoint:** `GET /api/auth/me`

**Description:** Get current logged-in user details

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "latitude": 34.0522,
    "longitude": -118.2437,
    "currentLocation": "Los Angeles, CA",
    "isActive": true,
    "createdAt": "2026-02-27T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `401` - Not authorized / Invalid token
- `404` - User not found
- `500` - Server error

---

### 4. Update User Location (Protected)
**Endpoint:** `PUT /api/auth/update-location`

**Description:** Update user's current location

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "latitude": 34.0522,
  "longitude": -118.2437,
  "currentLocation": "Los Angeles, CA"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Location updated successfully",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "latitude": 34.0522,
    "longitude": -118.2437,
    "currentLocation": "Los Angeles, CA"
  }
}
```

**Error Responses:**
- `401` - Not authorized / Invalid token
- `500` - Server error

---

### 5. Logout User (Protected)
**Endpoint:** `POST /api/auth/logout`

**Description:** Logout user and clear authentication token

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Error Responses:**
- `401` - Not authorized / Invalid token
- `500` - Server error

---

## Usage Examples

### Using cURL

**Register:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "password": "password123",
    "latitude": 34.0522,
    "longitude": -118.2437,
    "currentLocation": "Los Angeles, CA"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Get Current User:**
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Update Location:**
```bash
curl -X PUT http://localhost:3000/api/auth/update-location \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "latitude": 40.7128,
    "longitude": -74.0060,
    "currentLocation": "New York, NY"
  }'
```

**Logout:**
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using JavaScript (Fetch API)

**Register:**
```javascript
const response = await fetch('http://localhost:3000/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    password: 'password123',
    latitude: 34.0522,
    longitude: -118.2437,
    currentLocation: 'Los Angeles, CA'
  })
});

const data = await response.json();
console.log(data);
```

**Login:**
```javascript
const response = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'password123'
  })
});

const data = await response.json();
const token = data.token;
localStorage.setItem('token', token);
```

**Protected Request:**
```javascript
const token = localStorage.getItem('token');

const response = await fetch('http://localhost:3000/api/auth/me', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const data = await response.json();
console.log(data.user);
```

---

## Database Models

### User Schema
```javascript
{
  name: String (required),
  email: String (required, unique),
  phone: String (required),
  password: String (required, hashed, min 6 chars),
  fcmToken: String (for push notifications),
  token: String (JWT authentication token),
  location: {
    type: 'Point',
    coordinates: [longitude, latitude]
  },
  currentLocation: String,
  latitude: Number,
  longitude: Number,
  isActive: Boolean (default: true),
  timestamps: true (createdAt, updatedAt)
}
```

---

## Environment Variables Required

Create a `.env` file in the root directory:

```env
MONGO_URI=mongodb://localhost:27017/disaster-response
JWT_SECRET=your_jwt_secret_key_here
PORT=3000
NODE_ENV=development
```

---

## Error Handling

All API responses follow this structure:

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

---

## Security Features

1. **Password Hashing**: Uses bcryptjs with 10 salt rounds
2. **JWT Tokens**: 30-day expiration
3. **Token Storage**: Stored in user document for validation
4. **Protected Routes**: Middleware validates JWT before accessing protected endpoints
5. **CORS Enabled**: Configured for cross-origin requests

---

## Testing the APIs

1. **Start the server:**
```bash
cd disaster-backend
npm install
npm start
```

2. **Test with Postman or Thunder Client:**
   - Import the endpoints
   - Test register → login → get user flow
   - Save token from login response
   - Use token in Authorization header for protected routes

3. **Verify MongoDB:**
   - Check users collection for registered users
   - Verify password is hashed
   - Confirm token is stored after login

---

## Next Steps

You can now:
1. Integrate these APIs with your frontend application
2. Add more user-related endpoints (update profile, delete account, etc.)
3. Implement password reset functionality
4. Add role-based authorization
5. Integrate FCM token registration for push notifications
