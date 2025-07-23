import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/config';
import { connectDatabase } from './database/connection';
import tenantRoutes from './routes/tenantRoutes';
import roomRoutes from './routes/roomRoutes';
import paymentRoutes from './routes/paymentRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import maintenanceRoutes from './routes/maintenanceRoutes';
import visitorRoutes from './routes/visitorRoutes';
import authRoutes from './routes/authRoutes';

const app = express();

// Connect to MongoDB
connectDatabase();

// First, intercept all requests and strip any existing CORS headers
app.use((req, res, next) => {
  // Store the original res.setHeader
  const originalSetHeader = res.setHeader;
  
  // Override setHeader to intercept CORS headers
  res.setHeader = function(name: string, value: string | number | string[]) {
    // If it's a CORS header being set, ignore it unless it's our own
    if (name.toLowerCase().startsWith('access-control-') && value !== '*') {
      console.log(`Intercepted CORS header: ${name} = ${value}`);
      return res;
    }
    return originalSetHeader.call(this, name, value);
  };
  
  next();
});

// CORS must be first - before any other middleware
// Handle CORS preflight requests immediately
app.options('*', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.sendStatus(204);
});

// Apply CORS to all routes
app.use((req, res, next) => {
  // Force set our CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
});

// Now apply other middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
  // Disable HSTS as it might interfere
  hsts: false
}));

app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Shiv Shiva Residency Management API is running',
    timestamp: new Date().toISOString()
  });
});

// CORS test endpoint
app.get('/api/cors-test', (req, res) => {
  res.json({
    message: 'CORS test successful',
    headers: {
      origin: req.headers.origin || 'No origin header',
      'access-control-allow-origin': res.getHeaders()['access-control-allow-origin'] || 'Not set',
      'access-control-allow-credentials': res.getHeaders()['access-control-allow-credentials'] || 'Not set'
    },
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/visitors', visitorRoutes);

// Final CORS enforcement - this runs after all routes
app.use((req, res, next) => {
  // Force CORS headers on all responses
  if (!res.headersSent) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  next();
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: config.nodeEnv === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req: express.Request, res: express.Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found'
  });
});

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🏠 Shiv Shiva Residency Management API`);
  console.log(`🌍 Environment: ${config.nodeEnv}`);
  console.log(`🔧 CORS: Manual headers - accepting all origins (*)`);
  console.log(`📝 Test CORS at: /api/cors-test`);
});
