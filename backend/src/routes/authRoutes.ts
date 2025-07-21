import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();

// User data structure
interface User {
  id: string;
  username: string;
  email: string;
  password: string; // hashed
  role: 'admin' | 'manager' | 'staff' | 'security';
  full_name: string;
  phone?: string;
  is_active: boolean;
  created_date: string;
  last_login?: string;
  permissions: string[];
}

interface LoginSession {
  user_id: string;
  token: string;
  created_at: string;
  expires_at: string;
  ip_address?: string;
  user_agent?: string;
}

// Mock data storage
let users: User[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@shivshiva.com',
    password: '$2a$10$.0nJ9HDQsz3ArxU/dqnD2e5Y8EbnIM38W0NqpdKxXcvDX1Hh99sWK', // password: 'admin123'
    role: 'admin',
    full_name: 'Administrator',
    phone: '9999999999',
    is_active: true,
    created_date: '2025-01-01',
    permissions: ['all']
  },
  {
    id: '2',
    username: 'manager',
    email: 'manager@shivshiva.com',
    password: '$2a$10$1k06PryUYb66WTkcbIFP1euKucmHR50eBv5/PfbUd2ho8iG/iN5Xy', // password: 'manager123'
    role: 'manager',
    full_name: 'Property Manager',
    phone: '8888888888',
    is_active: true,
    created_date: '2025-01-01',
    permissions: ['tenants:read', 'tenants:write', 'rooms:read', 'rooms:write', 'payments:read', 'maintenance:read', 'maintenance:write']
  },
  {
    id: '3',
    username: 'security',
    email: 'security@shivshiva.com',
    password: '$2a$10$UCB40tf80.Zmn.hW0v5TsOFhTAxT3e7o/0wUm.qUQ72Ok.fBsU23e', // password: 'security123'
    role: 'security',
    full_name: 'Security Guard',
    phone: '7777777777',
    is_active: true,
    created_date: '2025-01-01',
    permissions: ['visitors:read', 'visitors:write', 'tenants:read']
  }
];

let sessions: LoginSession[] = [];

const JWT_SECRET = process.env.JWT_SECRET || 'shiv-shiva-residency-secret-key-2025';
const JWT_EXPIRES_IN = '24h';

// Validation middleware
const validateLogin = [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
];

const validateRegister = [
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('full_name').notEmpty().withMessage('Full name is required'),
  body('role').isIn(['admin', 'manager', 'staff', 'security']).withMessage('Invalid role')
];

// Middleware to verify JWT token
export const authenticateToken = (req: any, res: Response, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Middleware to check permissions
export const requirePermission = (permission: string) => {
  return (req: any, res: Response, next: any) => {
    const userPermissions = req.user?.permissions || [];
    
    if (userPermissions.includes('all') || userPermissions.includes(permission)) {
      next();
    } else {
      res.status(403).json({ error: 'Insufficient permissions' });
    }
  };
};

// POST /api/auth/login - User login
router.post('/login', validateLogin, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    // Find user
    const user = users.find(u => u.username === username || u.email === username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.is_active) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const tokenPayload = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      permissions: user.permissions
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    // Update last login
    const userIndex = users.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
      users[userIndex].last_login = new Date().toISOString();
    }

    // Store session
    const session: LoginSession = {
      user_id: user.id,
      token,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    };
    sessions.push(session);

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      message: 'Login successful',
      token,
      user: userWithoutPassword,
      expires_in: JWT_EXPIRES_IN
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /api/auth/register - User registration (admin only)
router.post('/register', authenticateToken, requirePermission('all'), validateRegister, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, full_name, role, phone } = req.body;

    // Check if user already exists
    const existingUser = users.find(u => u.username === username || u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Define permissions based on role
    let permissions: string[] = [];
    switch (role) {
      case 'admin':
        permissions = ['all'];
        break;
      case 'manager':
        permissions = ['tenants:read', 'tenants:write', 'rooms:read', 'rooms:write', 'payments:read', 'maintenance:read', 'maintenance:write'];
        break;
      case 'staff':
        permissions = ['tenants:read', 'rooms:read', 'payments:read', 'maintenance:read'];
        break;
      case 'security':
        permissions = ['visitors:read', 'visitors:write', 'tenants:read'];
        break;
    }

    // Create new user
    const newUser: User = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      username,
      email,
      password: hashedPassword,
      role,
      full_name,
      phone: phone || '',
      is_active: true,
      created_date: new Date().toISOString().split('T')[0],
      permissions
    };

    users.push(newUser);

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = newUser;
    
    res.status(201).json({
      message: 'User registered successfully',
      user: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/auth/logout - User logout
router.post('/logout', authenticateToken, async (req: any, res: Response) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    // Remove session
    sessions = sessions.filter(s => s.token !== token);

    res.json({ message: 'Logout successful' });
  } catch (error) {
    res.status(500).json({ error: 'Logout failed' });
  }
});

// GET /api/auth/profile - Get current user profile
router.get('/profile', authenticateToken, async (req: any, res: Response) => {
  try {
    const user = users.find(u => u.id === req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// PUT /api/auth/profile - Update user profile
router.put('/profile', authenticateToken, async (req: any, res: Response) => {
  try {
    const userIndex = users.findIndex(u => u.id === req.user.id);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { full_name, email, phone } = req.body;

    // Check if new email is already taken by another user
    if (email && email !== users[userIndex].email) {
      const emailExists = users.find(u => u.email === email && u.id !== req.user.id);
      if (emailExists) {
        return res.status(400).json({ error: 'Email already exists' });
      }
    }

    // Update profile
    if (full_name) users[userIndex].full_name = full_name;
    if (email) users[userIndex].email = email;
    if (phone) users[userIndex].phone = phone;

    const { password, ...userWithoutPassword } = users[userIndex];
    res.json({
      message: 'Profile updated successfully',
      user: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// PUT /api/auth/change-password - Change password
router.put('/change-password', authenticateToken, async (req: any, res: Response) => {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (new_password.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const userIndex = users.findIndex(u => u.id === req.user.id);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(current_password, users[userIndex].password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(new_password, saltRounds);

    // Update password
    users[userIndex].password = hashedNewPassword;

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// GET /api/auth/users - Get all users (admin only)
router.get('/users', authenticateToken, requirePermission('all'), async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, role = '', is_active = '' } = req.query;

    let filteredUsers = users;

    if (role) {
      filteredUsers = filteredUsers.filter(u => u.role === role);
    }

    if (is_active !== '') {
      filteredUsers = filteredUsers.filter(u => u.is_active === (is_active === 'true'));
    }

    // Remove passwords from response
    const usersWithoutPasswords = filteredUsers.map(({ password, ...user }) => user);

    // Pagination
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const paginatedUsers = usersWithoutPasswords.slice(startIndex, endIndex);

    res.json({
      users: paginatedUsers,
      totalCount: usersWithoutPasswords.length,
      totalPages: Math.ceil(usersWithoutPasswords.length / Number(limit)),
      currentPage: Number(page)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// PUT /api/auth/users/:id/toggle-status - Toggle user active status (admin only)
router.put('/users/:id/toggle-status', authenticateToken, requirePermission('all'), async (req: Request, res: Response) => {
  try {
    const userIndex = users.findIndex(u => u.id === req.params.id);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    users[userIndex].is_active = !users[userIndex].is_active;

    // If deactivating user, remove their sessions
    if (!users[userIndex].is_active) {
      sessions = sessions.filter(s => s.user_id !== req.params.id);
    }

    const { password, ...userWithoutPassword } = users[userIndex];
    res.json({
      message: `User ${users[userIndex].is_active ? 'activated' : 'deactivated'} successfully`,
      user: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle user status' });
  }
});

// GET /api/auth/sessions - Get active sessions (admin only)
router.get('/sessions', authenticateToken, requirePermission('all'), async (req: Request, res: Response) => {
  try {
    const activeSessions = sessions.filter(s => new Date(s.expires_at) > new Date());
    
    // Add user info to sessions
    const sessionsWithUserInfo = activeSessions.map(session => {
      const user = users.find(u => u.id === session.user_id);
      return {
        ...session,
        user_info: user ? {
          username: user.username,
          full_name: user.full_name,
          role: user.role
        } : null
      };
    });

    res.json(sessionsWithUserInfo);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// DELETE /api/auth/sessions/:userId - Terminate user sessions (admin only)
router.delete('/sessions/:userId', authenticateToken, requirePermission('all'), async (req: Request, res: Response) => {
  try {
    const removedSessions = sessions.filter(s => s.user_id === req.params.userId);
    sessions = sessions.filter(s => s.user_id !== req.params.userId);

    res.json({ 
      message: 'User sessions terminated successfully',
      terminated_sessions: removedSessions.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to terminate sessions' });
  }
});

// GET /api/auth/verify - Verify token validity
router.get('/verify', authenticateToken, async (req: any, res: Response) => {
  try {
    const user = users.find(u => u.id === req.user.id);
    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'Invalid user' });
    }

    const { password, ...userWithoutPassword } = user;
    res.json({
      valid: true,
      user: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({ error: 'Token verification failed' });
  }
});

export default router; 