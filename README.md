# 🏠 Shiv Shiva Residency - PG Management System

A comprehensive **Paying Guest (PG) Management System** built with modern web technologies. Features include tenant management, room allocation, payment tracking, maintenance requests, visitor management, and administrative controls.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.2.0-blue.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.0-blue.svg)

## ✨ Features

### 🏢 **Core Management**
- **Tenant Management**: Add, edit, delete tenants with comprehensive forms
- **Room Management**: Track occupancy, amenities, photos, and maintenance
- **Payment & Billing**: Generate bills, record payments, track collections
- **Dashboard & Analytics**: Real-time insights and key metrics

### 🔧 **Advanced Features**  
- **Maintenance Requests**: Track repairs and maintenance with priority levels
- **Visitor Management**: Check-in/out system with host approval
- **Authentication System**: Role-based access (Admin, Manager, Staff, Security)
- **Data Import/Export**: Bulk operations for tenant data

### 🎨 **Modern UI/UX**
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Golden & Black Theme**: Elegant color scheme matching your brand
- **Real-time Updates**: Live data synchronization
- **Form Validation**: Comprehensive input validation and error handling

## 🚀 Quick Start

### **Prerequisites**
- Node.js 16+ and npm
- MongoDB (local or Atlas)
- Git

### **1. Clone Repository**
```bash
git clone https://github.com/priyag7242/shivshiva.git
cd shivshiva
```

### **2. Install Dependencies**
```bash
# Install all dependencies (frontend + backend)
npm run install:all

# Or install separately
cd backend && npm install
cd ../frontend && npm install
```

### **3. Environment Setup**
```bash
# Backend configuration
cp backend/.env.example backend/.env

# Frontend configuration  
cp frontend/.env.example frontend/.env

# Edit the .env files with your database credentials
```

### **4. Start Development Servers**
```bash
# Start both frontend and backend
npm run dev

# Or start separately
npm run server:dev  # Backend only
npm run client:dev  # Frontend only
```

### **5. Access Application**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001/api
- **Default Credentials**: admin / admin123

## 📁 Project Structure

```
shivshiva/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API endpoints
│   │   ├── database/       # Database connection
│   │   └── index.ts        # Server entry point
│   ├── .env.example        # Environment template
│   └── package.json
├── frontend/               # React + TypeScript UI
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Application pages
│   │   ├── contexts/       # React contexts (auth, etc.)
│   │   ├── utils/          # Utility functions
│   │   └── main.tsx        # React entry point
│   ├── .env.example        # Environment template
│   └── package.json
├── DEPLOYMENT.md           # Detailed deployment guide
└── README.md              # This file
```

## 🔐 Authentication & Roles

| Role | Username | Password | Permissions |
|------|----------|----------|-------------|
| **Administrator** | `admin` | `admin123` | Full system access |
| **Manager** | `manager` | `manager123` | Tenant & payment management |
| **Security** | `security` | `security123` | Visitor management |

## 🛠️ Technology Stack

### **Backend**
- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT + bcrypt
- **Validation**: express-validator
- **Security**: Helmet, CORS, Morgan

### **Frontend**
- **Framework**: React 18 + TypeScript  
- **Build Tool**: Vite
- **Routing**: React Router
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Forms**: React Hook Form
- **HTTP Client**: Axios

## 🚀 Deployment

### **Quick Deploy (15 minutes)**

#### **1. Database Setup**
```bash
# MongoDB Atlas (Recommended)
1. Create account at cloud.mongodb.com
2. Create free cluster
3. Get connection string
4. Update MONGODB_URI in environment
```

#### **2. Backend Deploy (Railway)**
```bash
# 1. Push to GitHub
git add . && git commit -m "Deploy to production"
git push origin main

# 2. Connect Railway to GitHub repo
# 3. Set environment variables in Railway dashboard
# 4. Deploy backend folder
```

#### **3. Frontend Deploy (Vercel)**
```bash
# 1. Import repo to Vercel
# 2. Set root directory to 'frontend'
# 3. Set environment variables
# 4. Deploy
```

### **Environment Variables**

#### **Backend (Railway)**
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/shivshiva
JWT_SECRET=your-super-secure-secret-here
FRONTEND_URL=https://your-app.vercel.app
```

#### **Frontend (Vercel)**
```env
VITE_API_BASE_URL=https://your-backend.railway.app/api
VITE_NODE_ENV=production
```

## 📚 API Documentation

### **Core Endpoints**
```bash
# Authentication
POST /api/auth/login          # User login
POST /api/auth/register       # Create user (admin only)
GET  /api/auth/verify         # Verify token

# Tenants
GET    /api/tenants           # List tenants
POST   /api/tenants           # Create tenant  
PUT    /api/tenants/:id       # Update tenant
DELETE /api/tenants/:id       # Delete tenant
POST   /api/tenants/import    # Bulk import

# Rooms
GET    /api/rooms             # List rooms
POST   /api/rooms             # Create room
POST   /api/rooms/:id/allocate   # Allocate room
POST   /api/rooms/:id/deallocate # Deallocate room

# Payments
GET    /api/payments          # List payments
POST   /api/payments          # Record payment
POST   /api/payments/bills/generate  # Generate bills

# Maintenance
GET    /api/maintenance       # List requests
POST   /api/maintenance       # Create request
PUT    /api/maintenance/:id/status   # Update status

# Visitors
GET    /api/visitors          # List visitors
POST   /api/visitors/checkin  # Check-in visitor
PUT    /api/visitors/:id/checkout    # Check-out visitor
```

## 🔧 Development

### **Available Scripts**
```bash
# Development
npm run dev                   # Start both servers
npm run server:dev            # Backend only
npm run client:dev            # Frontend only

# Building
npm run build                 # Build both
npm run server:build          # Backend only  
npm run client:build          # Frontend only

# Production
npm start                     # Start production servers
```

### **Environment Management**
```bash
# Development
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Production
# Set environment variables in hosting platform
```

## 📊 Features Overview

### **Dashboard**
- Real-time metrics and KPIs
- Recent activity feed
- Financial insights
- Occupancy analytics

### **Tenant Management**
- Comprehensive tenant profiles
- Document management
- Payment history tracking
- Move-in/move-out processing

### **Room Management**
- Floor-wise organization (0-5 floors)
- Room types: Single, Double, Triple, Quad
- Amenity tracking
- Photo galleries
- Maintenance status

### **Payment System**
- Automated bill generation
- Multiple payment methods
- Receipt generation
- Collection tracking
- Overdue management

### **Maintenance Tracking**
- Request categorization
- Priority levels
- Status tracking  
- Cost management
- Photo documentation

### **Visitor Management**
- Digital check-in/out
- Host notifications
- Security protocols
- Visit history

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Role-based Access**: Granular permissions
- **Password Hashing**: bcrypt encryption
- **Input Validation**: Comprehensive validation
- **CORS Protection**: Cross-origin security
- **Helmet Security**: HTTP header protection

## 🐛 Troubleshooting

### **Common Issues**
```bash
# Port conflicts
lsof -ti:5001 | xargs kill -9  # Kill backend port
lsof -ti:3000 | xargs kill -9  # Kill frontend port

# MongoDB connection
# Check MONGODB_URI in .env file
# Ensure MongoDB is running (local) or accessible (Atlas)

# Build issues
rm -rf node_modules package-lock.json
npm install

# Permission errors  
npm cache clean --force
```

## 📝 License

This project is proprietary software for Shiv Shiva Residency.

## 👥 Support

For technical support or feature requests:
- **GitHub Issues**: [Create an issue](https://github.com/priyag7242/shivshiva/issues)
- **Email**: [Support contact]
- **Documentation**: See `DEPLOYMENT.md` for detailed deployment guide

---

**🏠 Shiv Shiva Residency Management System** - Streamlining PG operations with modern technology. 