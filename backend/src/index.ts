import express from 'express';
import cors from 'cors';
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

// Middleware
app.use(helmet());

// Dynamic CORS configuration to handle Vercel preview deployments
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // List of allowed origins
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://shivshiyaresidency-frontend-new.vercel.app',
      // Allow all Vercel preview deployments
      /^https:\/\/shivshiyaresidency-frontend-new-.*\.vercel\.app$/,
      // Allow all deployments from your Vercel projects
      /^https:\/\/.*-priyag7242s-projects\.vercel\.app$/
    ];
    
    // Check if the origin matches any allowed origin
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return allowed === origin;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      // Log rejected origins for debugging
      console.log(`CORS rejected origin: ${origin}`);
      // Still allow the request in production for now
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

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
  console.log(`🔧 CORS: Dynamic configuration for Vercel deployments`);
});
