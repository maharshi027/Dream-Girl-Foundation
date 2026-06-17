# Dream Girl Foundation

An NGO platform dedicated to protecting children and providing educational knowledge to help underprivileged girls. This application includes donation management, payment integration, and certificate generation.

## 🎯 Overview

Dream Girl Foundation is a full-stack web application that enables:

- ✅ Secure JWT-based authentication with token refresh
- ✅ Donation management (online and cash)
- ✅ Razorpay payment integration
- ✅ Certificate generation for donors
- ✅ Admin verification system with secure login
- ✅ Comprehensive donation tracking and reporting
- ✅ Automatic token refresh mechanism
- ✅ Centralized error handling

## 🛠 Tech Stack

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Payment Gateway**: Razorpay
- **PDF Generation**: PDFKit
- **Environment Management**: dotenv
- **Form Data**: Multer

### Frontend

- **Build Tool**: Vite
- **Framework**: React
- **Styling**: CSS
- **HTTP Client**: Axios
- **Linter**: ESLint

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **MongoDB** (local or cloud instance like MongoDB Atlas)
- **Git**

## 📁 Project Structure

```
Dream Girl Foundation/
├── backend/
│   ├── src/
│   │   ├── app.js                    # Main application with all routes
│   │   ├── config/
│   │   │   └── db.js                 # MongoDB connection
│   │   ├── models/
│   │   │   └── donation.models.js    # Donation schema
│   │   ├── controllers/
│   │   │   ├── admin.controller.js   # Login & JWT endpoints
│   │   │   ├── donation.controller.js# Donation CRUD operations
│   │   │   └── certificate.controller.js # PDF generation
│   │   ├── middleware/
│   │   │   └── authMiddleware.js     # JWT verification middleware
│   │   └── utils/
│   │       ├── jwtUtils.js           # JWT token generation/verification
│   │       └── errorHandler.js       # Centralized error handling
│   ├── server.js                     # Server entry point
│   ├── package.json
│   ├── .env                          # Environment variables (not in git)
│   ├── JWT_AUTHENTICATION.md         # JWT API documentation
│   ├── QUICK_JWT_GUIDE.md            # Quick JWT reference
│   └── .gitignore
├── frontend/
│   ├── src/
│   │   ├── utils/
│   │   │   └── axiosConfig.js        # JWT interceptors & token management
│   │   ├── components/               # React components
│   │   ├── admin/
│   │   │   ├── AdminLogin.jsx        # Secure JWT login
│   │   │   ├── AdminDashboard.jsx    # Admin panel
│   │   │   └── AdminCashEntry.jsx    # Cash donation form
│   │   ├── donar/
│   │   │   └── DonarList.jsx         # Donor records list
│   │   ├── assets/                   # Static assets
│   │   ├── App.jsx                   # JWT initialization
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js                # Proxy to backend
│   ├── JWT_INTEGRATION_GUIDE.md      # Frontend JWT setup
│   └── .gitignore
├── .gitignore                        # Root-level git ignore
├── SETUP_COMPLETE.md                 # Complete setup guide
└── README.md                         # This file
```

### 2. Backend Setup

Navigate to the backend directory:

```bash
cd backend
npm install
```

### 3. Frontend Setup

Navigate to the frontend directory:

```bash
cd ../frontend
npm install
```

**⚠️ Important Security Notes:**

- Never commit `.env` file to Git
- Keep credentials private and secure
- Use strong passwords for production
- **CHANGE JWT secrets to strong random values in production**
- Rotate API keys regularly
- Use MongoDB Atlas for production databases
- Use HTTPS only in production
- Store tokens in httpOnly cookies in production (not localStorage)

### Backend Server

```bash
cd backend

# Development mode (with auto-reload)
npm run dev

# Production mode
npm start

# Server will run on http://localhost:XXXX
```

### Frontend Application

```bash
cd frontend

# Development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Frontend will typically run on http://localhost:5173
```

## 📡 API Endpoints

### Authentication Routes

```
POST /api/auth/verify-password
Body: { password: "string" }
Response: { success: boolean, message: string }
```

### Donation Routes

### Certificate Generate Routes

```
GET /api/certificate/download-certificate/:id
Headers: { Authorization: "Bearer <accessToken>" }
Response: PDF file (binary)
Note: Only works for donations with paymentStatus = "SUCCESS"
```

## 🔐 JWT Authentication Guide

### How JWT Authentication Works

1. **Login**: Send admin password to `/api/auth/login`
   - Backend verifies password
   - Backend returns `accessToken` and `refreshToken`
   - Frontend stores both tokens in localStorage

2. **Authenticated Requests**: Include token in Authorization header
   - Format: `Authorization: Bearer <accessToken>`
   - Axios automatically injects token via interceptor
   - Backend validates token before processing request

3. **Token Expiry**: Access token expires after 15 minutes
   - Frontend detects 401 Unauthorized response
   - Axios interceptor automatically calls `/api/auth/.....`
   - Backend returns new access token
   - Axios retries original request with new token
   - **No manual intervention needed!**

4. **Logout**: Clear stored tokens
   - Remove tokens from localStorage
   - Clear Authorization header
   - User redirected to login

### Token Details

**Access Token**:

- Valid for 15 minutes
- Used for all API requests
- Short-lived for security
- Automatically refreshed when expired

**Refresh Token**:

- Valid for 7 days
- Used to get new access tokens
- Stored safely and not sent with every request
- User must re-login after 7 days

### Using JWT in Requests

**Frontend (Automatic)**:

```javascript
// No manual token handling needed!
// Axios interceptor automatically adds token
const response = await axios.get("/api/donations/all-records");
```

**Postman (Manual)**:

1. Get access token from `/api/auth/login`
2. Go to Headers tab
3. Add: `Authorization: Bearer <accessToken>`
4. Make request

**cURL (Manual)**:

```bash
curl -X GET http://localhost:5000/api/donations/all-records \
  -H "Authorization: Bearer <accessToken>"
```

## ✨ Features

- ✅ **JWT Authentication**: Secure token-based authentication with automatic refresh
- ✅ **Access Control**: Separate access tokens (15m) and refresh tokens (7d)
- ✅ **Donation Management**: Record and manage donations (online & cash)
- ✅ **Payment Integration**: Secure Razorpay payment processing
- ✅ **Certificate Generation**: Auto-generate PDF certificates for donors
- ✅ **Admin Dashboard**: Secure admin panel with JWT protection
- ✅ **Donor Tracking**: Complete donation history and records
- ✅ **Responsive Design**: Works on desktop and mobile devices
- ✅ **Error Handling**: Comprehensive error messages and logging with centralized error handler
- ✅ **Security**: JWT-based authentication, input validation, environment-based configuration

## 🔐 Security Best Practices

1. **JWT Security**:
   - Generate strong random JWT secrets: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   - Change `JWT_ACCESS_TOKEN_SECRET` and `JWT_REFRESH_TOKEN_SECRET` in production
   - Use HTTPS to prevent token interception
   - Store tokens in httpOnly cookies in production (not localStorage)
   - Implement token rotation strategy

2. **Environment Variables**: Store all sensitive data in `.env`

3. **API Keys**: Never commit API keys to version control

4. **Database**: Use MongoDB Atlas with IP whitelisting in production

5. **CORS**: Configure CORS properly for your domain

6. **Validation**: Always validate user inputs on both frontend and backend

7. **HTTPS**: Use HTTPS in production (required for httpOnly cookies)

8. **.gitignore**: Ensure sensitive files are in `.gitignore`

9. **Rate Limiting**: Implement rate limiting on authentication endpoints

10. **Monitoring**: Monitor failed login attempts and suspicious activity

## 📝 Available Scripts

### Backend

```bash
npm start    # Production mode
npm run dev  # Development mode with nodemon
```

### Frontend

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 🐛 Troubleshooting

### JWT Authentication Issues

**Cannot login / "Invalid credentials" error**:

- Verify admin password in `.env`
- Check backend server is running on port XXXX
- Verify request is going to `/api/auth/login` endpoint

**401 Unauthorized on API calls**:

- Check if access token exists: Open browser DevTools → Application → localStorage
- Verify token is in valid JWT format
- If expired , refresh token should auto-refresh
- Check JWT secrets are configured in `.env`

**Token refresh not working**:

- Verify `refreshToken` exists in localStorage
- Check `JWT_REFRESH_TOKEN_SECRET` is configured in `.env`
- If refresh token older than 7 days, must re-login
- Check backend is returning valid refresh token response

**ECONNREFUSED error**:

- Ensure backend is running: `npm run dev` in backend folder
- Verify backend is on port XXXX (check `.env` PORT setting)
- Check Vite proxy config in `frontend/vite.config.js`

### MongoDB Connection Issues

- Ensure MongoDB is running locally or MongoDB Atlas is accessible
- Check `MONGODB_URI` in `.env`
- Verify network access for MongoDB Atlas

### Port Already in Use

- Backend default: XXXX - Change `PORT` in `.env`
- Frontend default: XXXX - Vite will use next available port

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Razorpay Documentation](https://razorpay.com/docs/)
- [Vite Documentation](https://vitejs.dev/)
- [JWT (JSON Web Tokens) Guide](https://jwt.io/)
- [JWT.io Debugger](https://jwt.io/#debugger) - Inspect your tokens
- [Node.js Crypto Module](https://nodejs.org/api/crypto.html) - For generating secrets
- [Backend JWT Documentation](./backend/JWT_AUTHENTICATION.md)
- [Frontend JWT Integration Guide](./frontend/JWT_INTEGRATION_GUIDE.md)
- [Complete Setup Guide](./SETUP_COMPLETE.md)

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👥 Authors

- **Harshit** - Initial development

## 📞 Support

For questions or support, please contact the development team or create an issue in the repository.

---

**Last Updated**: May 24, 2026

**Status**: Active Development
