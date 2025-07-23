// Mock authentication endpoint for demo purposes
export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST' && req.url.includes('/auth/login')) {
    const { username, password } = req.body;
    
    // Mock user data
    if (username === 'admin' && password === 'admin123') {
      res.status(200).json({
        message: 'Login successful',
        token: 'mock-jwt-token-' + Date.now(),
        user: {
          id: '1',
          username: 'admin',
          email: 'admin@shivshiva.com',
          role: 'admin',
          full_name: 'Administrator',
          phone: '9999999999',
          is_active: true,
          created_date: '2025-01-01',
          permissions: ['all']
        },
        expires_in: '24h'
      });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } else {
    res.status(404).json({ error: 'Not found' });
  }
}