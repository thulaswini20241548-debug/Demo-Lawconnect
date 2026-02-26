# LawConnect - Lawyer Backend API

Backend API for the LawConnect platform's lawyer functionality. This Node.js/Express application handles lawyer registration, authentication, profile management, appointments, chat, reviews, and availability scheduling.

##  Features

- **Authentication & Authorization**
  - Lawyer registration with verification
  - JWT-based authentication
  - Password reset functionality
  - Secure session management

- **Lawyer Profile Management**
  - Comprehensive lawyer profiles
  - Verification document upload
  - Specialization and language preferences
  - Rating and review system

- **Appointment Management**
  - Appointment scheduling
  - Confirmation/cancellation workflow
  - Document attachments
  - Real-time notifications

- **Chat System**
  - Real-time messaging with Socket.io
  - File sharing capabilities
  - Read/unread status tracking
  - Chat history

- **Availability Management**
  - Weekly schedule configuration
  - Exception dates (holidays, special hours)
  - Available time slot queries
  - Automatic conflict detection

- **Reviews & Ratings**
  - Client reviews
  - Multi-aspect ratings
  - Lawyer responses
  - Rating statistics

##  Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   cd lawyer-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your configuration:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   CLIENT_URL=http://localhost:3000
   ```

4. **Create uploads directory**
   ```bash
   mkdir uploads
   ```

5. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

##  Project Structure

```
lawyer-backend/
├── controllers/          # Request handlers
│   ├── authController.js
│   ├── lawyerController.js
│   ├── appointmentController.js
│   ├── chatController.js
│   ├── reviewController.js
│   └── availabilityController.js
├── models/              # Database models
│   ├── Lawyer.js
│   ├── Appointment.js
│   ├── Chat.js
│   ├── Review.js
│   └── Availability.js
├── routes/              # API routes
│   ├── authRoutes.js
│   ├── lawyerRoutes.js
│   ├── appointmentRoutes.js
│   ├── chatRoutes.js
│   ├── reviewRoutes.js
│   └── availabilityRoutes.js
├── middleware/          # Custom middleware
│   ├── authMiddleware.js
│   └── uploadMiddleware.js
├── uploads/             # File uploads directory
├── .env.example         # Environment variables template
├── package.json         # Dependencies
└── server.js           # Application entry point
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new lawyer
- `POST /api/auth/login` - Login lawyer
- `GET /api/auth/me` - Get current lawyer
- `PUT /api/auth/updatepassword` - Update password
- `POST /api/auth/forgotpassword` - Request password reset
- `PUT /api/auth/resetpassword/:token` - Reset password
- `POST /api/auth/logout` - Logout

### Lawyers
- `GET /api/lawyers` - Get all lawyers (with filters)
- `GET /api/lawyers/:id` - Get lawyer by ID
- `PUT /api/lawyers/profile` - Update profile
- `PUT /api/lawyers/profile/picture` - Update profile picture
- `POST /api/lawyers/verification/submit` - Submit verification documents
- `GET /api/lawyers/dashboard/stats` - Get dashboard statistics
- `GET /api/lawyers/search` - Search lawyers
- `PUT /api/lawyers/settings` - Update settings
- `DELETE /api/lawyers/account` - Deactivate account

### Appointments
- `GET /api/appointments` - Get all appointments
- `GET /api/appointments/:id` - Get single appointment
- `PUT /api/appointments/:id/confirm` - Confirm appointment
- `PUT /api/appointments/:id/cancel` - Cancel appointment
- `PUT /api/appointments/:id/reschedule` - Reschedule appointment
- `PUT /api/appointments/:id/complete` - Mark as completed
- `PUT /api/appointments/:id/notes` - Update notes
- `POST /api/appointments/:id/attachments` - Upload attachments
- `GET /api/appointments/upcoming` - Get upcoming appointments
- `GET /api/appointments/today` - Get today's appointments
- `GET /api/appointments/stats` - Get statistics

### Chat
- `GET /api/chat` - Get all chats
- `GET /api/chat/:chatId` - Get chat with messages
- `POST /api/chat/:chatId/messages` - Send message
- `POST /api/chat/:chatId/messages/file` - Send file
- `PUT /api/chat/:chatId/read` - Mark as read
- `GET /api/chat/unread/count` - Get unread count
- `DELETE /api/chat/:chatId` - Close chat

### Reviews
- `GET /api/reviews/lawyer/:lawyerId` - Get lawyer reviews
- `GET /api/reviews/my-reviews` - Get my reviews
- `POST /api/reviews/:reviewId/respond` - Respond to review
- `PUT /api/reviews/:reviewId/helpful` - Mark as helpful
- `GET /api/reviews/stats/:lawyerId` - Get review statistics

### Availability
- `GET /api/availability` - Get availability
- `PUT /api/availability` - Update weekly schedule
- `POST /api/availability/exception` - Add exception date
- `DELETE /api/availability/exception/:id` - Remove exception
- `GET /api/availability/slots/:lawyerId` - Get available slots
- `GET /api/availability/check/:lawyerId` - Check availability

##  Authentication

All protected routes require a Bearer token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Example Requests

### Register a Lawyer
```bash
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "SecurePass123",
  "phoneNumber": "+94771234567",
  "dateOfBirth": "1985-05-15",
  "gender": "Male",
  "barCouncilId": "BAR123456",
  "licenseNumber": "LIC789012",
  "yearsOfExperience": 10,
  "specializations": ["Family Law", "Property Rights"],
  "languagesSpoken": ["Sinhala", "English"],
  "district": "Colombo",
  "city": "Colombo",
  "consultationFee": 5000
}
```

### Get Lawyers with Filters
```bash
GET /api/lawyers?specialization=Family Law&district=Colombo&minFee=3000&maxFee=10000&page=1&limit=10
```

### Confirm Appointment
```bash
PUT /api/appointments/:id/confirm
Authorization: Bearer <token>
Content-Type: application/json

{
  "meetingLink": "https://meet.google.com/abc-defg-hij"
}
```

## Testing

Run tests (when implemented):
```bash
npm test
```

## Deployment

1. Set `NODE_ENV=production` in your environment
2. Ensure all environment variables are properly configured
3. Use a process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start server.js --name lawconnect-lawyer-backend
   ```

##  Dependencies

- **express** - Web framework
- **mongoose** - MongoDB ODM
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **socket.io** - Real-time communication
- **multer** - File upload handling
- **cors** - CORS middleware
- **helmet** - Security headers
- **dotenv** - Environment variables
- **morgan** - HTTP request logger
- **express-validator** - Input validation
- **nodemailer** - Email sending

## Configuration

### MongoDB Connection
Update `MONGODB_URI` in `.env` with your MongoDB connection string.

### File Uploads
- Files are stored in the `uploads/` directory
- Maximum file size: 5MB (configurable in `.env`)
- Allowed types: JPEG, PNG, PDF, DOC, DOCX

### JWT
- Token expiration: 7 days (configurable)
- Store `JWT_SECRET` securely

## License

This project is part of the LawConnect platform.

## Contributors

ELLEWELA KANKANAMGE ISHINI UPEKHA ELLEWELA
IIT ID No. - 20230898
UoW No. - 21204591
Email - ishini.20230898@iit.ac.lk

AMUVITA GAMAGE ISURI BHAGYA
IIT ID No - 20231915
UoW No - 21204292
Email -isuri.20231915@iit.ac.lk

KALUARACHCHI
KANKANAMGE PURVI CHAMATHMA
IIT ID No. - 20241022
UoW No. - 21212835
Email - purvi.20241022@iit.ac.lk


Anpuraj Abiyak Agikshan
IIT ID No. - 20241314
UoW No. - 21213496/1
Email - abiyak.20241314@iit.ac.lk


Paripooranan Mekusanathan 
IIT ID No. - 20241278
UoW No. - 21213410
Email - mekusanathan.20241278@iit.ac.lk


Thulaswini Vimalraj 
IIT ID No - 20241548
UoW No - 21213733
Email- thulaswini.20241548@iit.ac.lk