📘 TaskFlow – Task Management System

🧠 Project Overview
TaskFlow is an internal SaaS-based task management system designed to help organizations efficiently assign, track, and manage tasks across teams.
It provides a centralized platform where admins can assign tasks and employees can update and track their progress in real-time.

🎯 Purpose
Improve team productivity
Track task progress in real-time
Maintain accountability across employees
Provide structured task assignment workflow
👥 User Roles
🔹 Admin
Create and assign tasks
Manage employees/users
Monitor task progress
Edit or delete tasks
🔹 Employee
View assigned tasks
Update task status
Add comments or updates
🏗️ Tech Stack
Frontend: React / Next.js
Backend: Node.js + Express
Database: MongoDB
Authentication: JWT (JSON Web Token)
API: REST APIs
Realtime: Socket.io (if enabled)
📁 Folder Structure
/client        → Frontend application (UI)
/server        → Backend API
/routes        → API route definitions
/controllers   → Business logic
/models        → Database schemas
/middleware    → Authentication & error handling
/config        → Database & environment configuration
⚙️ Setup Instructions
1. Clone Repository
git clone <your-repo-url>
cd taskflow
2. Install Dependencies
cd client
npm install

cd ../server
npm install
🔐 Environment Variables

This project requires environment configuration for both backend and frontend.

🖥️ Backend (.env inside /server)
Create a .env file in /server:
PORT=5000
MONGO_URL=your_mongodb_connection_string
MONGO_URL_DIRECT=your_direct_mongo_connection
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
SMTP_HOST=smtp.yourprovider.com
SMTP_PORT=587
SMTP_USER=your_email@example.com
SMTP_PASS=your_email_password
BREVO_API_KEY=your_brevo_api_key
EMAIL_FROM=your_email@example.com
FRONTEND_URL=http://localhost:3000
ALLOW_EMPLOYEE_REGISTER=false
📖 Backend Variables Explanation

Database
MONGO_URL → Primary MongoDB connection
MONGO_URL_DIRECT → Direct DB connection (optional)
Authentication
JWT_SECRET → Token signing key
JWT_EXPIRES_IN → Token expiry (e.g. 7d, 1d)

Email / Notifications
SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS → SMTP config
BREVO_API_KEY → Brevo (Sendinblue) integration
EMAIL_FROM → Sender email

Application Config
FRONTEND_URL → Frontend URL (CORS + redirects)
ALLOW_EMPLOYEE_REGISTER
true → self registration allowed
false → only admin can create users
🌐 Frontend (.env.local inside /client)

Create .env.local file:

NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_BACKEND_ORIGIN=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
📖 Frontend Variables Explanation
NEXT_PUBLIC_API_URL → Backend API base URL
NEXT_PUBLIC_BACKEND_ORIGIN → Backend root (cookies/auth)
NEXT_PUBLIC_SOCKET_URL → WebSocket server (real-time updates)
⚠️ Important Notes
.env and .env.local files should NOT be committed to GitHub
Add them to .gitignore
Use different values for development and production
📦 Recommended: .env.example
# Backend
PORT=
MONGO_URL=
MONGO_URL_DIRECT=
JWT_SECRET=
JWT_EXPIRES_IN=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
BREVO_API_KEY=
EMAIL_FROM=
FRONTEND_URL=
ALLOW_EMPLOYEE_REGISTER=

# Frontend
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_BACKEND_ORIGIN=
NEXT_PUBLIC_SOCKET_URL=
▶️ Run Application
Start Backend
cd server
npm run dev
Start Frontend
cd client
npm start

🔑 Key Features
Task creation & assignment
Role-based access control
Real-time task tracking
Status updates (Pending / In Progress / Completed)
Secure authentication (JWT)
Dashboard for task overview
🔄 Core Modules
📌 Task Module
Task creation
Assignment to users
Status updates
Deadline management

🔐 Authentication Module
Login / Signup
JWT token system
Protected routes
👤 User Module
User management
Role control (Admin / Employee)
Profile handling
🚀 Deployment
Frontend: Vercel / Netlify
Backend: Render / VPS / AWS
Database: MongoDB Atlas
🛠️ Common Issues & Fixes

❌ MongoDB not connecting
✔️ Verify MONGO_URL

❌ JWT authentication error
✔️ Check JWT_SECRET & expiry

❌ Email not sending
✔️ Verify SMTP / Brevo credentials

❌ CORS error
✔️ Ensure FRONTEND_URL is correct

🔒 Security Notes
Never expose .env files
Use strong secrets for JWT
Validate all API inputs
Restrict sensitive routes

🤝 Contribution Guide
Create a new branch
git checkout -b feature-name
Make changes
Test thoroughly
Push changes
git push origin feature-name
Create a Pull Request

📌 Important Notes
Do not modify authentication logic without review
Always test APIs before deployment
Take database backup before major updates

📞 Support
For issues or onboarding, refer to this README or contact the project maintainer.
