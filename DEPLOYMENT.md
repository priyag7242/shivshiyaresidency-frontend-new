# 🚀 Shiv Shiva Residency - Live Deployment Guide

## 🎯 Quick Deploy Commands

### Step 1: Deploy Backend to Railway

```bash
# Login to Railway (this will open browser)
cd backend
railway login

# Create new Railway project
railway new

# Set environment variables
railway variables set NODE_ENV=production
railway variables set MONGODB_URI="mongodb+srv://priyag7242:admin01@shivshivaresidency.9q8bcs.mongodb.net/tenantsdb?retryWrites=true&w=majority"
railway variables set JWT_SECRET="shiv-shiva-residency-secret-key-2025-production"
railway variables set CORS_ORIGIN="*"

# Deploy backend
railway up
```

### Step 2: Deploy Frontend to Vercel

```bash
# Login to Vercel
cd ../frontend
vercel login

# Deploy frontend (will auto-detect settings)
vercel --prod

# Set environment variable with your Railway backend URL
vercel env add VITE_API_BASE_URL production
# Enter: https://YOUR-RAILWAY-URL.railway.app/api
```

## 🔧 Manual Deployment Steps

### Backend (Railway)

1. **Create Railway Project**: 
   - Go to https://railway.app/new
   - Connect your GitHub repo
   - Select the `backend` folder

2. **Set Environment Variables**:
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://priyag7242:admin01@shivshivaresidency.9q8bcs.mongodb.net/tenantsdb?retryWrites=true&w=majority
   JWT_SECRET=shiv-shiva-residency-secret-key-2025-production
   CORS_ORIGIN=*
   PORT=$PORT
   ```

3. **Build & Deploy Settings**:
   - Root Directory: `/backend`
   - Build Command: `npm ci && npm run build`
   - Start Command: `npm start`

### Frontend (Vercel)

1. **Create Vercel Project**:
   - Go to https://vercel.com/new
   - Import your GitHub repo
   - Framework: Vite
   - Root Directory: `/frontend`

2. **Build Settings**:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Environment Variables**:
   ```
   VITE_API_BASE_URL=https://YOUR-RAILWAY-URL.railway.app/api
   ```

## 🌐 Expected Live URLs

- **Backend API**: `https://your-app-name.railway.app`
- **Frontend**: `https://your-app-name.vercel.app`
- **Login**: admin / admin123

## 📊 What's Included in Your Live Site

✅ **100 Tenants** loaded from MongoDB Atlas  
✅ **100 Rooms** with floor-wise organization  
✅ **Payment & Billing System** with electricity calculation  
✅ **Visitor Management** with check-in/check-out  
✅ **Maintenance Requests** tracking  
✅ **Dashboard & Analytics** with real-time data  
✅ **WhatsApp Bill Sharing** feature  
✅ **Professional UI** with golden/black theme  

## 🔄 Quick Test Commands

After deployment, test your live system:

```bash
# Test backend health
curl https://YOUR-RAILWAY-URL.railway.app/api/health

# Test tenant data
curl https://YOUR-RAILWAY-URL.railway.app/api/tenants

# Test frontend
open https://YOUR-VERCEL-URL.vercel.app
```

## 🎉 Your Complete PG Management System is Ready!

Total Monthly Revenue: **₹9,69,800**  
Annual Revenue: **₹1,16,37,600**  
Security Deposits: **₹6,96,350**  

Ready to manage Shiv Shiva Residency efficiently! 🏠✨ 