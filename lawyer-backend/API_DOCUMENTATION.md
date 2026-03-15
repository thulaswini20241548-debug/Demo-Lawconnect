# LawConnect Lawyer Backend API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most endpoints require authentication using JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### 1. Register Lawyer
**POST** `/auth/register`

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "phoneNumber": "+94771234567",
  "dateOfBirth": "1985-05-15",
  "gender": "Male",
  "barCouncilId": "BAR123456",
  "licenseNumber": "LIC789012",
  "yearsOfExperience": 10,
  "specializations": ["Family Law", "Criminal Law"],
  "languagesSpoken": ["Sinhala", "English"],
  "district": "Colombo",
  "city": "Colombo",
  "consultationFee": 5000
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Lawyer registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "lawyer": { ... }
}
```

### 2. Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "lawyer": { ... }
}
```

### 3. Get Current Lawyer
**GET** `/auth/me`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "lawyer": { ... }
}
```

### 4. Update Password
**PUT** `/auth/updatepassword`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "currentPassword": "OldPass123",
  "newPassword": "NewPass123"
}
```

**Response:** `200 OK`

### 5. Forgot Password
**POST** `/auth/forgotpassword`

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response:** `200 OK`

---

## Lawyer Endpoints

### 1. Get All Lawyers
**GET** `/lawyers`

**Query Parameters:**
- `specialization` - Filter by specialization
- `district` - Filter by district
- `city` - Filter by city
- `minFee` - Minimum consultation fee
- `maxFee` - Maximum consultation fee
- `rating` - Minimum rating
- `language` - Filter by language
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `sort` - Sort field (default: -averageRating)

**Example:**
```
GET /lawyers?specialization=Family Law&district=Colombo&page=1&limit=10
```

**Response:** `200 OK`
```json
{
  "success": true,
  "count": 10,
  "total": 45,
  "totalPages": 5,
  "currentPage": 1,
  "lawyers": [...]
}
```

### 2. Get Single Lawyer
**GET** `/lawyers/:id`

**Response:** `200 OK`
```json
{
  "success": true,
  "lawyer": { ... },
  "ratingBreakdown": {
    "5": 20,
    "4": 10,
    "3": 5,
    "2": 1,
    "1": 0
  }
}
```

### 3. Update Profile
**PUT** `/lawyers/profile`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "bio": "Experienced family law attorney...",
  "phoneNumber": "+94771234567",
  "consultationFee": 6000,
  "acceptsProBono": true
}
```

**Response:** `200 OK`

### 4. Submit Verification Documents
**POST** `/lawyers/verification/submit`

**Headers:** 
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Form Data:**
- `nic` - NIC document (file)
- `supremeCourtId` - Supreme Court ID (file)
- `barCouncilCertificate` - Bar Council Certificate (file)
- `educationCertificates` - Education certificates (multiple files)

**Response:** `200 OK`

### 5. Get Dashboard Stats
**GET** `/lawyers/dashboard/stats`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "stats": {
    "totalAppointments": 150,
    "pendingAppointments": 5,
    "upcomingAppointments": 8,
    "completedAppointments": 137,
    "monthlyRevenue": 75000,
    "recentReviews": [...]
  }
}
```

---

## Appointment Endpoints

### 1. Get All Appointments
**GET** `/appointments`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status` - Filter by status (pending, confirmed, completed, cancelled)
- `page` - Page number
- `limit` - Items per page

**Response:** `200 OK`

### 2. Confirm Appointment
**PUT** `/appointments/:id/confirm`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "meetingLink": "https://meet.google.com/abc-defg-hij"
}
```

**Response:** `200 OK`

### 3. Cancel Appointment
**PUT** `/appointments/:id/cancel`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "cancelReason": "Emergency came up"
}
```

**Response:** `200 OK`

### 4. Complete Appointment
**PUT** `/appointments/:id/complete`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

### 5. Update Notes
**PUT** `/appointments/:id/notes`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "lawyerNotes": "Client discussed property dispute..."
}
```

**Response:** `200 OK`

### 6. Get Today's Appointments
**GET** `/appointments/today`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

---

## Chat Endpoints

### 1. Get All Chats
**GET** `/chat`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "chats": [...]
}
```

### 2. Send Message
**POST** `/chat/:chatId/messages`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "message": "Hello, how can I help you?"
}
```

**Response:** `201 Created`

### 3. Mark as Read
**PUT** `/chat/:chatId/read`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

### 4. Get Unread Count
**GET** `/chat/unread/count`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "unreadCount": 5
}
```

---

## Review Endpoints

### 1. Get Lawyer Reviews
**GET** `/reviews/lawyer/:lawyerId`

**Response:** `200 OK`
```json
{
  "success": true,
  "count": 25,
  "reviews": [...]
}
```

### 2. Get My Reviews
**GET** `/reviews/my-reviews`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

### 3. Respond to Review
**POST** `/reviews/:reviewId/respond`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "response": "Thank you for your feedback..."
}
```

**Response:** `200 OK`

### 4. Get Review Statistics
**GET** `/reviews/stats/:lawyerId`

**Response:** `200 OK`
```json
{
  "success": true,
  "stats": {
    "averageRating": 4.5,
    "totalReviews": 25,
    "avgProfessionalism": 4.7,
    "avgCommunication": 4.6,
    "avgExpertise": 4.8,
    "avgResponsiveness": 4.3
  }
}
```

---

## Availability Endpoints

### 1. Get Availability
**GET** `/availability`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

### 2. Update Availability
**PUT** `/availability`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "weeklySchedule": {
    "monday": {
      "isAvailable": true,
      "slots": [
        { "startTime": "09:00", "endTime": "12:00" },
        { "startTime": "14:00", "endTime": "17:00" }
      ]
    },
    "tuesday": { ... }
  },
  "defaultSlotDuration": 60,
  "bufferTime": 15
}
```

**Response:** `200 OK`

### 3. Add Exception
**POST** `/availability/exception`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "date": "2024-12-25",
  "isAvailable": false,
  "reason": "Christmas Holiday"
}
```

**Response:** `201 Created`

### 4. Get Available Slots
**GET** `/availability/slots/:lawyerId?date=2024-03-15`

**Response:** `200 OK`
```json
{
  "success": true,
  "availableSlots": [
    { "startTime": "09:00", "endTime": "10:00" },
    { "startTime": "10:00", "endTime": "11:00" },
    { "startTime": "14:00", "endTime": "15:00" }
  ]
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error (development only)"
}
```

---

## WebSocket Events (Chat)

### Connect
```javascript
const socket = io('http://localhost:5000');
```

### Join Chat Room
```javascript
socket.emit('joinRoom', chatId);
```

### Send Message
```javascript
socket.emit('sendMessage', {
  roomId: chatId,
  message: 'Hello',
  sender: lawyerId
});
```

### Receive Message
```javascript
socket.on('receiveMessage', (data) => {
  console.log('New message:', data);
});
```

---

## Rate Limiting

API requests are rate-limited to prevent abuse. Default limits:
- 100 requests per 15 minutes per IP

Exceeded rate limits return:
```json
{
  "success": false,
  "message": "Too many requests, please try again later"
}
```

---

## Pagination

Paginated endpoints return:
```json
{
  "success": true,
  "count": 10,
  "total": 45,
  "totalPages": 5,
  "currentPage": 1,
  "data": [...]
}
```

---

## File Uploads

### Allowed File Types
- Images: JPEG, PNG
- Documents: PDF, DOC, DOCX

### Maximum File Size
- 5MB per file

### Upload Response
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "fileUrl": "/uploads/file-123456789.pdf"
}
```
