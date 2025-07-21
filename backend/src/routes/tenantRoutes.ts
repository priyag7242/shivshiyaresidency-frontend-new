import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Sample tenant data structure based on provided data
interface TenantData {
  id: string;
  name: string;
  mobile: string;
  room_number: string;
  joining_date: string;
  monthly_rent: number;
  security_deposit: number;
  electricity_joining_reading: number;
  last_electricity_reading: number | null;
  status: 'active' | 'adjust' | 'inactive';
  created_date: string;
  has_food: boolean;
  category: 'existing' | 'new' | null;
  departure_date: string | null;
  stay_duration: string | null;
  notice_given: boolean;
  notice_date: string | null;
  security_adjustment: number;
}

// Mock data storage (in production, this would be MongoDB)
let tenants: TenantData[] = [];

// Validation middleware
const validateTenant = [
  body('name').notEmpty().withMessage('Name is required'),
  body('mobile').isMobilePhone('any').withMessage('Valid mobile number is required'),
  body('room_number').notEmpty().withMessage('Room number is required'),
  body('monthly_rent').isNumeric().withMessage('Monthly rent must be a number'),
  body('security_deposit').isNumeric().withMessage('Security deposit must be a number'),
];

// GET /api/tenants - Get all tenants with pagination and filters
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      status = '', 
      room = '',
      category = ''
    } = req.query;

    let filteredTenants = tenants;

    // Apply filters
    if (search) {
      filteredTenants = filteredTenants.filter(tenant => 
        tenant.name.toLowerCase().includes(search.toString().toLowerCase()) ||
        tenant.mobile.includes(search.toString()) ||
        tenant.room_number.includes(search.toString())
      );
    }

    if (status) {
      filteredTenants = filteredTenants.filter(tenant => tenant.status === status);
    }

    if (room) {
      filteredTenants = filteredTenants.filter(tenant => 
        tenant.room_number.includes(room.toString())
      );
    }

    if (category) {
      filteredTenants = filteredTenants.filter(tenant => tenant.category === category);
    }

    // Pagination
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const paginatedTenants = filteredTenants.slice(startIndex, endIndex);

    res.json({
      tenants: paginatedTenants,
      totalCount: filteredTenants.length,
      totalPages: Math.ceil(filteredTenants.length / Number(limit)),
      currentPage: Number(page),
      hasNextPage: endIndex < filteredTenants.length,
      hasPrevPage: startIndex > 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tenants' });
  }
});

// GET /api/tenants/stats - Get tenant statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = {
      total: tenants.length,
      active: tenants.filter(t => t.status === 'active').length,
      adjusting: tenants.filter(t => t.status === 'adjust').length,
      withFood: tenants.filter(t => t.has_food).length,
      newTenants: tenants.filter(t => t.category === 'new').length,
      totalRent: tenants.reduce((sum, t) => sum + t.monthly_rent, 0),
      totalDeposits: tenants.reduce((sum, t) => sum + t.security_deposit, 0)
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tenant statistics' });
  }
});

// GET /api/tenants/:id - Get single tenant
router.get('/:id', async (req, res) => {
  try {
    const tenant = tenants.find(t => t.id === req.params.id);
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    res.json(tenant);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tenant' });
  }
});

// POST /api/tenants - Create new tenant
router.post('/', validateTenant, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const newTenant: TenantData = {
      id: Date.now().toString(), // In production, use proper UUID
      name: req.body.name,
      mobile: req.body.mobile,
      room_number: req.body.room_number,
      joining_date: req.body.joining_date || new Date().toISOString().split('T')[0],
      monthly_rent: Number(req.body.monthly_rent),
      security_deposit: Number(req.body.security_deposit),
      electricity_joining_reading: Number(req.body.electricity_joining_reading || 0),
      last_electricity_reading: req.body.last_electricity_reading || null,
      status: req.body.status || 'active',
      created_date: new Date().toISOString().split('T')[0],
      has_food: Boolean(req.body.has_food),
      category: req.body.category || 'new',
      departure_date: req.body.departure_date || null,
      stay_duration: req.body.stay_duration || null,
      notice_given: Boolean(req.body.notice_given),
      notice_date: req.body.notice_date || null,
      security_adjustment: Number(req.body.security_adjustment || 0)
    };

    tenants.push(newTenant);
    res.status(201).json(newTenant);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create tenant' });
  }
});

// PUT /api/tenants/:id - Update tenant
router.put('/:id', validateTenant, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const tenantIndex = tenants.findIndex(t => t.id === req.params.id);
    if (tenantIndex === -1) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    tenants[tenantIndex] = {
      ...tenants[tenantIndex],
      ...req.body,
      monthly_rent: Number(req.body.monthly_rent),
      security_deposit: Number(req.body.security_deposit),
      electricity_joining_reading: Number(req.body.electricity_joining_reading || 0),
      has_food: Boolean(req.body.has_food),
      notice_given: Boolean(req.body.notice_given),
      security_adjustment: Number(req.body.security_adjustment || 0)
    };

    res.json(tenants[tenantIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update tenant' });
  }
});

// DELETE /api/tenants/:id - Delete tenant
router.delete('/:id', async (req, res) => {
  try {
    const tenantIndex = tenants.findIndex(t => t.id === req.params.id);
    if (tenantIndex === -1) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    const deletedTenant = tenants.splice(tenantIndex, 1)[0];
    res.json({ message: 'Tenant deleted successfully', tenant: deletedTenant });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete tenant' });
  }
});

// POST /api/tenants/import - Import tenant data
router.post('/import', async (req, res) => {
  try {
    const { tenantsData } = req.body;
    
    if (!Array.isArray(tenantsData)) {
      return res.status(400).json({ error: 'Invalid data format' });
    }

    // Clear existing data and import new data
    tenants = tenantsData;
    
    res.json({ 
      message: 'Tenants imported successfully', 
      count: tenants.length 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to import tenants' });
  }
});

export default router; 