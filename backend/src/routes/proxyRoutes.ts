import * as express from 'express';
import { Request, Response } from 'express';
import axios from 'axios';

const router = express.Router();

// Proxy endpoint to bypass CORS issues
router.all('/proxy/*', async (req: Request, res: Response) => {
  try {
    const targetPath = req.params[0];
    const targetUrl = `http://localhost:${process.env.PORT || 8080}/api/${targetPath}`;
    
    const response = await axios({
      method: req.method,
      url: targetUrl,
      data: req.body,
      headers: {
        ...req.headers,
        host: undefined,
        'content-length': undefined
      },
      validateStatus: () => true
    });
    
    // Copy response headers
    Object.entries(response.headers).forEach(([key, value]) => {
      if (key.toLowerCase() !== 'access-control-allow-origin') {
        res.setHeader(key, value as string);
      }
    });
    
    // Set our own CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Proxy request failed' });
  }
});

export default router;