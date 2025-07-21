# 🚀 Deployment Guide - Shiv Shiva Residency PG Management

## 🌟 Live Website Deployment Options

### **Option 1: Quick Deploy (Recommended)**
**Free & Fast deployment in 15 minutes**

#### **Backend → Railway**
1. **Sign up at [Railway.app](https://railway.app)**
2. **Connect GitHub repository**
3. **Deploy backend:**
   ```bash
   # In your backend folder
   git add . && git commit -m "Deploy backend"
   git push origin main
   ```
4. **Set environment variables in Railway dashboard:**
   ```bash
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/shivshiva
   JWT_SECRET=your-super-secure-secret-key
   FRONTEND_URL=https://your-app.vercel.app
   ```

#### **Frontend → Vercel**
1. **Sign up at [Vercel.com](https://vercel.com)**
2. **Import your repository**
3. **Configure:**
   - Framework: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. **Set environment variables:**
   ```bash
   VITE_API_BASE_URL=https://your-backend.railway.app/api
   ```

---

### **Option 2: Professional Deploy**
**Custom domain with SSL certificate**

#### **Database → MongoDB Atlas**
1. **Create free cluster at [MongoDB Atlas](https://cloud.mongodb.com)**
2. **Get connection string**
3. **Whitelist IP addresses (0.0.0.0/0 for global access)**

#### **Backend → Railway/Render/Heroku**
- Railway: Free tier, automatic deployments
- Render: Free tier with 750 hours/month
- Heroku: $7/month basic plan

#### **Frontend → Vercel/Netlify**
- Vercel: Free tier, excellent performance
- Netlify: Free tier, easy configuration

---

## 🛠️ Pre-Deployment Setup

### **1. Update Backend Configuration**
```bash
# backend/src/config/config.ts
export const config = {
  port: process.env.PORT || 5000,
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/shivshiva_residency',
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  jwtSecret: process.env.JWT_SECRET || 'change-this-in-production'
};
```

### **2. Update Frontend Configuration**
```bash
# frontend/src/config/api.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
export { API_BASE_URL };
```

### **3. Build Commands**
```bash
# Test local build
npm run build           # Build both frontend and backend
npm run server:build    # Build only backend
npm run client:build    # Build only frontend
```

---

## 🚀 Step-by-Step Deployment

### **Phase 1: Database Setup (5 minutes)**

1. **Create MongoDB Atlas Account:**
   - Go to [MongoDB Atlas](https://cloud.mongodb.com)
   - Create free account
   - Create new cluster (free tier)
   - Create database user
   - Get connection string

2. **Import Your Data:**
   ```bash
   # Optional: Use MongoDB Compass to import tenant data
   # Or let the app create sample data automatically
   ```

### **Phase 2: Backend Deployment (5 minutes)**

1. **Deploy to Railway:**
   ```bash
   # Push code to GitHub (if not already done)
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   
   # Connect to Railway
   # Import GitHub repository
   # Select backend folder as root
   ```

2. **Set Environment Variables:**
   ```env
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/shivshiva
   JWT_SECRET=your-secure-secret-here
   FRONTEND_URL=https://shivshiva-pg.vercel.app
   ```

3. **Verify Deployment:**
   ```bash
   curl https://your-backend.railway.app/api/health
   # Should return: {"status":"OK","message":"Shiv Shiva Residency Management API is running"}
   ```

### **Phase 3: Frontend Deployment (5 minutes)**

1. **Deploy to Vercel:**
   ```bash
   # Import repository to Vercel
   # Select frontend folder as root directory
   # Framework: Vite
   # Build Command: npm run build
   # Output Directory: dist
   ```

2. **Set Environment Variables:**
   ```env
   VITE_API_BASE_URL=https://your-backend.railway.app/api
   VITE_NODE_ENV=production
   ```

3. **Test Your Live Website:**
   ```bash
   # Visit: https://your-app.vercel.app
   # Login with: admin/admin123
   ```

---

## 🔐 Production Security Checklist

### **✅ Essential Security Steps:**

1. **Change Default Passwords:**
   ```javascript
   // Update in backend/src/routes/authRoutes.ts
   // Generate new bcrypt hashes for production
   ```

2. **Secure JWT Secret:**
   ```bash
   # Generate strong secret
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

3. **Database Security:**
   - ✅ Enable authentication
   - ✅ Whitelist IP addresses
   - ✅ Use strong passwords
   - ✅ Enable SSL/TLS

4. **CORS Configuration:**
   ```javascript
   // Only allow your frontend domain
   cors({
     origin: process.env.FRONTEND_URL,
     credentials: true
   })
   ```

5. **Environment Variables:**
   - ✅ Never commit .env files
   - ✅ Use platform environment settings
   - ✅ Rotate secrets regularly

---

## 🌐 Custom Domain Setup

### **Frontend (Vercel):**
1. Go to Vercel dashboard → Project → Settings → Domains
2. Add your domain (e.g., `pg.shivshivaresidency.com`)
3. Update DNS records as instructed

### **Backend (Railway):**
1. Go to Railway dashboard → Project → Settings → Domains
2. Add custom domain
3. Update DNS records

### **SSL Certificate:**
- Automatic with Vercel and Railway
- Free Let's Encrypt certificates

---

## 📊 Monitoring & Analytics

### **Application Monitoring:**
```javascript
// Add to your deployment
- Health checks: /api/health
- Error logging: Console logs in Railway
- Performance: Vercel Analytics
- Uptime: UptimeRobot (free)
```

### **Database Monitoring:**
- MongoDB Atlas built-in monitoring
- Connection alerts
- Performance insights

---

## 🚀 One-Click Deploy

**Deploy Now with Single Commands:**

```bash
# 1. Setup
git clone https://github.com/priyag7242/shivshiva
cd shivshiva

# 2. Configure
cp backend/.env.example backend/.env.production
cp frontend/.env.example frontend/.env.production
# Edit the .env files with your database credentials

# 3. Deploy Backend
# Push to GitHub and connect Railway

# 4. Deploy Frontend  
# Import to Vercel

# 5. Done! Your PG Management system is live! 🎉
```

---

## 🎯 Live Demo

Once deployed, your application will be accessible at:
- **Frontend:** `https://your-app.vercel.app`
- **Backend API:** `https://your-backend.railway.app/api`

### **Demo Credentials:**
| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |
| Manager | `manager` | `manager123` |
| Security | `security` | `security123` |

---

## 📞 Support

If you need help with deployment:
1. Check deployment logs in Railway/Vercel dashboard
2. Verify environment variables are set correctly
3. Test API endpoints individually
4. Check database connection

**Your Shiv Shiva Residency PG Management System is ready to go live! 🏠✨** 