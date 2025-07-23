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

// Trust proxy - important for Railway
app.set('trust proxy', true);
app.enable('trust proxy');

// Add bypass headers for Railway proxy
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Add headers that might bypass Railway's CORS enforcement
  res.setHeader('X-Powered-By', 'Express');
  res.setHeader('X-Railway-Bypass-CORS', 'true');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
});

// CORS middleware - simplified version
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  const origin = req.headers.origin || '*';
  
  // Use setHeader instead of header to ensure headers are set
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-access-token');
  res.setHeader('Access-Control-Max-Age', '3600');
  res.setHeader('Vary', 'Origin');
  
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
    return res.sendStatus(204);
  }
  
  next();
});

// Middleware
<<<<<<< HEAD
app.use(helmet());
app.use(cors({
  origin: true, // Allow all origins for now
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
=======
app.use(helmet({
  crossOriginResourcePolicy: false,
  hsts: false
>>>>>>> eb45687e6e4ddb43fd5b495c70eca26716066f9d
}));

app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/api/health', (req: express.Request, res: express.Response) => {
  res.json({
    status: 'OK',
    message: 'Shiv Shiva Residency Management API is running',
    timestamp: new Date().toISOString()
  });
});

// CORS test endpoint
app.get('/api/cors-test', (req: express.Request, res: express.Response) => {
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
  console.log(`🔧 CORS: Allowing requests from all origins`);
  console.log(`📝 Test CORS at: /api/cors-test`);
});
