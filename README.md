# 💖 Matching App - Modern Dating Application

A full-stack, Tinder-inspired matching application built with React, Node.js, Express, and SQLite.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.2.0-blue.svg)

---

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Security](#-security)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### Core Features
- 🔐 **Secure Authentication** - JWT-based authentication with bcrypt password hashing
- 💖 **Swipe Mechanism** - Tinder-like swipe interface for user matching
- 💬 **Real-time Chat** - Message exchange between matched users
- 👤 **Profile Management** - Customizable user profiles with photo upload
- 🎟️ **Invite System** - Closed beta with invite code system
- 🔒 **Admin Dashboard** - User management and invite code generation

### Security Features
- Password hashing with bcrypt (12 salt rounds)
- JWT token-based authentication with expiration
- CORS protection with origin whitelisting
- Input validation and sanitization
- SQL injection prevention with parameterized queries
- File upload restrictions (type, size)

### Performance Features
- Database indexing for optimized queries
- Pagination support for large datasets
- Efficient SQL queries with JOINs
- Graceful server shutdown

---

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js 14+
- **Framework:** Express.js
- **Database:** SQLite3
- **Authentication:** JWT (jsonwebtoken), bcrypt
- **File Upload:** Multer
- **Security:** CORS, express-validator

### Frontend
- **Framework:** React 18.2
- **Routing:** React Router DOM v6
- **HTTP Client:** Axios
- **Styling:** Custom CSS with Tinder-inspired design
- **Build Tool:** React Scripts

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14.0.0 or higher)
- **npm** (v6.0.0 or higher)
- **Git** (for version control)

Check your versions:
```bash
node --version
npm --version
git --version
```

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/s1f102300638/matching-app.git
cd matching-app
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copy the output and paste it into .env as JWT_SECRET

# Generate admin setup secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copy the output and paste it into .env as ADMIN_SETUP_SECRET
```

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Edit .env.local if needed (default uses http://localhost:5000)
```

---

## ⚙️ Configuration

### Backend Configuration (backend/.env)

**Required Variables:**
```env
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your-generated-secret-key-here
ADMIN_SETUP_SECRET=your-generated-admin-secret-here

# Server configuration
PORT=5000
NODE_ENV=development

# CORS origins (comma-separated)
ALLOWED_ORIGINS=http://localhost:3000
```

**Optional Variables:**
```env
# Feature flags
DISABLE_INVITE_CODE=false

# Logging
LOG_LEVEL=info

# Email configuration (for future features)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Frontend Configuration (frontend/.env.local)

```env
REACT_APP_API_URL=http://localhost:5000

# Optional
REACT_APP_GA_TRACKING_ID=G-XXXXXXXXXX
REACT_APP_DEBUG_MODE=false
```

---

## 🏃 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
# App runs on http://localhost:3000
```

### Production Mode

**Backend:**
```bash
cd backend
NODE_ENV=production npm start
```

**Frontend:**
```bash
cd frontend
npm run build
# Serve the build folder with a static server
npx serve -s build
```

---

## 📁 Project Structure

```
matching-app/
├── backend/
│   ├── config/           # Configuration files
│   ├── uploads/          # User uploaded files
│   ├── .env.example      # Environment template
│   ├── server.js         # Main server file
│   ├── matching.db       # SQLite database (auto-generated)
│   └── package.json
│
├── frontend/
│   ├── public/           # Static files
│   ├── src/
│   │   ├── components/   # React components
│   │   │   ├── Admin.js
│   │   │   ├── Chat.js
│   │   │   ├── Home.js
│   │   │   ├── Login.js
│   │   │   ├── Matches.js
│   │   │   ├── Profile.js
│   │   │   ├── Register.js
│   │   │   └── Swipe.js
│   │   ├── config/       # API configuration
│   │   ├── contexts/     # React contexts (Auth)
│   │   ├── App.js        # Main app component
│   │   ├── App.css       # Global styles
│   │   └── index.js      # Entry point
│   ├── .env.example      # Environment template
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 📡 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe",
  "age": 25,
  "bio": "Hello world",
  "inviteCode": "ABC12345"
}

Response: 201 Created
{
  "token": "jwt-token-here",
  "user": { "id": 1, "email": "...", "name": "...", "age": 25 }
}
```

#### Login
```http
POST /api/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}

Response: 200 OK
{
  "token": "jwt-token-here",
  "user": { ... }
}
```

### User Endpoints

#### Get Profile
```http
GET /api/profile
Authorization: Bearer <token>

Response: 200 OK
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "age": 25,
  "bio": "Hello world",
  "photo": "/uploads/...",
  "is_admin": false
}
```

#### Update Profile
```http
PUT /api/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Smith",
  "age": 26,
  "bio": "Updated bio"
}

Response: 200 OK
{
  "success": true,
  "message": "Profile updated successfully"
}
```

#### Upload Photo
```http
POST /api/upload-photo
Authorization: Bearer <token>
Content-Type: multipart/form-data

photo: <file>

Response: 200 OK
{
  "photoUrl": "/uploads/12345-photo.jpg",
  "message": "Photo uploaded successfully"
}
```

### Matching Endpoints

#### Get Candidates
```http
GET /api/candidates?limit=10&offset=0
Authorization: Bearer <token>

Response: 200 OK
{
  "users": [
    {
      "id": 2,
      "name": "Jane Doe",
      "age": 24,
      "bio": "...",
      "photo": "/uploads/..."
    }
  ],
  "limit": 10,
  "offset": 0,
  "count": 10
}
```

#### Swipe (Like/Pass)
```http
POST /api/swipes
Authorization: Bearer <token>
Content-Type: application/json

{
  "targetUserId": 2,
  "isLike": true
}

Response: 200 OK
{
  "matched": true,
  "message": "It's a match!"
}
```

#### Get Matches
```http
GET /api/matches?limit=20&offset=0
Authorization: Bearer <token>

Response: 200 OK
{
  "matches": [
    {
      "match_id": 1,
      "user_id": 2,
      "name": "Jane Doe",
      "age": 24,
      "photo": "/uploads/...",
      "created_at": 1234567890
    }
  ],
  "limit": 20,
  "offset": 0,
  "count": 1
}
```

### Messaging Endpoints

#### Send Message
```http
POST /api/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "matchId": 1,
  "content": "Hello!"
}

Response: 201 Created
{
  "id": 1,
  "matchId": 1,
  "senderId": 1,
  "content": "Hello!",
  "createdAt": 1234567890
}
```

#### Get Messages
```http
GET /api/messages/1?limit=50&offset=0
Authorization: Bearer <token>

Response: 200 OK
{
  "messages": [
    {
      "id": 1,
      "sender_id": 1,
      "content": "Hello!",
      "is_read": false,
      "created_at": 1234567890
    }
  ],
  "limit": 50,
  "offset": 0,
  "count": 1
}
```

### Admin Endpoints

All admin endpoints require an admin token.

#### Generate Invite Code
```http
POST /api/admin/invite-codes
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "maxUses": 1,
  "expiresInDays": 7
}

Response: 201 Created
{
  "id": 1,
  "code": "ABC12345",
  "maxUses": 1,
  "expiresAt": 1234567890,
  "message": "Invite code generated successfully"
}
```

#### Get All Invite Codes
```http
GET /api/admin/invite-codes
Authorization: Bearer <admin-token>

Response: 200 OK
[
  {
    "id": 1,
    "code": "ABC12345",
    "max_uses": 1,
    "current_uses": 0,
    "expires_at": 1234567890,
    "created_by_name": "Admin User"
  }
]
```

#### Get All Users
```http
GET /api/admin/users
Authorization: Bearer <admin-token>

Response: 200 OK
[
  {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "age": 25,
    "is_admin": false,
    "created_at": 1234567890
  }
]
```

#### Get Statistics
```http
GET /api/admin/stats
Authorization: Bearer <admin-token>

Response: 200 OK
{
  "totalUsers": 100,
  "totalMatches": 50,
  "totalMessages": 500,
  "totalInviteCodes": 20,
  "usedInviteCodes": 15
}
```

---

## 🚢 Deployment

### Backend Deployment (Render.com)

1. Push your code to GitHub
2. Create a new Web Service on Render
3. Connect your GitHub repository
4. Configure:
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && npm start`
   - **Environment Variables:**
     - `JWT_SECRET`: Your generated secret
     - `NODE_ENV`: `production`
     - `ALLOWED_ORIGINS`: `https://your-frontend.vercel.app`
5. Deploy

### Frontend Deployment (Vercel)

1. Push your code to GitHub
2. Import project on Vercel
3. Configure:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Create React App
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`
   - **Environment Variables:**
     - `REACT_APP_API_URL`: `https://your-backend.onrender.com`
4. Deploy

### Database Migration (Production)

For production, consider migrating from SQLite to PostgreSQL:

1. Install pg: `npm install pg`
2. Update database connection in `server.js`
3. Create migration scripts
4. Use a service like Supabase or Railway for PostgreSQL hosting

---

## 🔐 Security

### Best Practices Implemented

✅ **Password Security**
- Passwords hashed with bcrypt (12 salt rounds)
- No plain text password storage
- Minimum password length enforced

✅ **Authentication**
- JWT with expiration (7 days)
- Token refresh mechanism ready
- Secure token storage (use HTTPOnly cookies in production)

✅ **Input Validation**
- All inputs validated on server-side
- SQL injection prevented with parameterized queries
- File upload restrictions (type, size)

✅ **CORS Protection**
- Origin whitelisting
- Credentials support
- No unauthorized cross-origin requests

✅ **Error Handling**
- Detailed errors only in development
- Generic errors in production
- No sensitive data in error messages

### Security Recommendations

⚠️ **TODO for Production:**

1. **Use HTTPS everywhere**
   ```javascript
   // Force HTTPS redirect
   app.use((req, res, next) => {
     if (req.header('x-forwarded-proto') !== 'https') {
       res.redirect(`https://${req.header('host')}${req.url}`);
     } else {
       next();
     }
   });
   ```

2. **Implement Rate Limiting**
   ```bash
   npm install express-rate-limit
   ```

3. **Use HTTPOnly Cookies for tokens**
   - Prevents XSS attacks
   - More secure than localStorage

4. **Add Helmet.js for security headers**
   ```bash
   npm install helmet
   ```

5. **Implement Content Security Policy (CSP)**

6. **Set up monitoring and logging**
   - Use Sentry for error tracking
   - Implement structured logging

---

## 🧪 Testing

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Test Coverage

```bash
# Generate coverage report
npm test -- --coverage
```

**Current Status:** ⚠️ Tests need to be implemented

**Priority:**
1. Unit tests for API endpoints
2. Authentication flow tests
3. Matching logic tests
4. E2E tests with Playwright/Cypress

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Use ESLint and Prettier
- Follow Airbnb JavaScript Style Guide
- Write meaningful commit messages
- Add comments for complex logic

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👥 Authors

- **Your Name** - [GitHub](https://github.com/s1f102300638)

---

## 🙏 Acknowledgments

- Inspired by Tinder's UI/UX
- Built with modern web technologies
- Community feedback and contributions

---

## 📞 Support

For support, email support@example.com or open an issue on GitHub.

---

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Basic authentication
- ✅ Swipe mechanism
- ✅ Matching system
- ✅ Chat functionality
- ✅ Admin dashboard

### Phase 2 (Next)
- [ ] Real-time messaging with WebSocket
- [ ] Push notifications
- [ ] Advanced filtering
- [ ] Photo verification
- [ ] Video profiles

### Phase 3 (Future)
- [ ] Machine learning recommendations
- [ ] Social media integration
- [ ] Premium features
- [ ] Mobile apps (React Native)
- [ ] Multi-language support

---

## ⚡ Performance Tips

### Backend Optimization
- Use connection pooling for database
- Implement caching (Redis)
- Optimize SQL queries
- Use CDN for static assets

### Frontend Optimization
- Code splitting with React.lazy()
- Image optimization (WebP)
- Implement service workers
- Use production build

---

## 🐛 Known Issues

1. LocalStorage security (migrate to HTTPOnly cookies)
2. No real-time updates (implement WebSocket)
3. Limited file upload validation
4. No email verification system

See [Issues](https://github.com/s1f102300638/matching-app/issues) for more.

---

## 📚 Resources

- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://reactjs.org/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [JWT Best Practices](https://jwt.io/introduction/)

---

**Made with ❤️ by the Matching App Team**
