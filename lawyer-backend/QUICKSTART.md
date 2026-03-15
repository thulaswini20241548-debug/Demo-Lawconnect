# Quick Start Guide - LawConnect Lawyer Backend

## Prerequisites Check
Before starting, ensure you have:
- ✅ Node.js v14+ installed (`node --version`)
- ✅ MongoDB installed and running (`mongod --version`)
- ✅ npm or yarn installed (`npm --version`)

## Step 1: Install Dependencies
```bash
cd lawyer-backend
npm install
```

This will install all required packages listed in `package.json`.

## Step 2: Configure Environment
```bash
cp .env.example .env
```

Edit the `.env` file with your settings:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/lawconnect
JWT_SECRET=your_very_secure_secret_key_here
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
```

## Step 3: Start MongoDB
Make sure MongoDB is running:
```bash
# On Windows
net start MongoDB

# On macOS/Linux
sudo systemctl start mongod
# or
mongod
```

## Step 4: Start the Server
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

You should see:
```
✅ MongoDB connected successfully
🚀 Server running on port 5000
📝 Environment: development
```

## Step 5: Test the API
Open your browser or Postman and visit:
```
http://localhost:5000/health
```

You should get:
```json
{
  "status": "OK",
  "message": "LawConnect Lawyer Backend is running",
  "timestamp": "2024-03-15T10:30:00.000Z"
}
```

## Step 6: Register Your First Lawyer
Using Postman or curl:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
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
    "specializations": ["Family Law"],
    "languagesSpoken": ["Sinhala", "English"],
    "district": "Colombo",
    "city": "Colombo",
    "consultationFee": 5000
  }'
```

You'll receive a JWT token in the response. Save it for authenticated requests!

## Common Issues & Solutions

### Issue: MongoDB connection error
**Solution:** Make sure MongoDB is running and the URI in `.env` is correct.

### Issue: Port already in use
**Solution:** Change the PORT in `.env` or stop the process using port 5000:
```bash
# Find process
lsof -i :5000
# Kill process
kill -9 <PID>
```

### Issue: Module not found
**Solution:** Delete `node_modules` and reinstall:
```bash
rm -rf node_modules
npm install
```

## Next Steps

1. **Set up file uploads**: Ensure the `uploads/` directory exists and is writable
2. **Configure email**: Add email service credentials for password reset
3. **Set up Firebase**: Configure Firebase for document storage (optional)
4. **Review API docs**: Check `API_DOCUMENTATION.md` for all available endpoints
5. **Connect frontend**: Update frontend to point to `http://localhost:5000`

## Development Tips

- Use Postman collection for easier API testing
- Check server logs for debugging
- Use MongoDB Compass to view database contents
- Enable CORS for your frontend URL in `.env`

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a strong `JWT_SECRET`
3. Use environment-specific MongoDB URI
4. Set up reverse proxy (nginx)
5. Use PM2 for process management
6. Enable HTTPS
7. Set up proper logging
8. Configure rate limiting

## Support

For issues or questions:
- Check the README.md
- Review API_DOCUMENTATION.md
- Contact the development team

Happy coding! 🚀
