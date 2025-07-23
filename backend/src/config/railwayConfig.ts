// Railway-specific configuration
export const railwayConfig = {
  // List of allowed origins for CORS
  allowedOrigins: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://shivshiyaresidency-frontend-new.vercel.app',
    // Allow all Vercel preview deployments
    /^https:\/\/shivshiyaresidency-frontend-new-[a-zA-Z0-9-]+\.vercel\.app$/,
    // Allow all Vercel deployments from your projects
    /^https:\/\/.*\.vercel\.app$/
  ],
  
  // Check if origin is allowed
  isOriginAllowed: (origin: string | undefined): boolean => {
    if (!origin) return true; // Allow requests with no origin (Postman, curl, etc.)
    
    return railwayConfig.allowedOrigins.some(allowed => {
      if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return allowed === origin;
    });
  }
};