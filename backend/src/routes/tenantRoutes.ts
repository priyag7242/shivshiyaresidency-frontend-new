import express, { Request, Response } from 'express';
import { body, validationResult } from "../utils/validation";
import SimpleTenant, { ISimpleTenant } from '../models/SimpleTenant';

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

// Keep mock data storage as fallback (in production, this would be MongoDB)
let tenants: TenantData[] = [];

// Export tenants array for use in other modules
export { tenants };

// Validation middleware
const validateTenant = [
  body('name').notEmpty().withMessage('Name is required'),
  body('mobile').isMobilePhone('any').withMessage('Valid mobile number is required'),
  body('room_number').notEmpty().withMessage('Room number is required'),
  body('monthly_rent').isNumeric().withMessage('Monthly rent must be a number'),
  body('security_deposit').isNumeric().withMessage('Security deposit must be a number'),
];

// GET /api/tenants - Get all tenants
router.get('/', async (req: Request, res: Response) => {
  try {
    // Try to fetch from MongoDB first
    const mongoTenants = await SimpleTenant.find({}).sort({ room_number: 1 });
    
    if (mongoTenants && mongoTenants.length > 0) {
      // Convert MongoDB documents to the expected format
      const formattedTenants = mongoTenants.map(tenant => ({
        id: tenant.id,
        name: tenant.name,
        mobile: tenant.mobile ? tenant.mobile.toString() : '',
        room_number: tenant.room_number,
        joining_date: tenant.joining_date.toISOString().split('T')[0],
        monthly_rent: tenant.monthly_rent,
        security_deposit: tenant.security_deposit,
        electricity_joining_reading: tenant.electricity_joining_reading,
        last_electricity_reading: tenant.last_electricity_reading,
        status: tenant.status,
        created_date: tenant.created_date.toISOString().split('T')[0],
        has_food: tenant.has_food,
        category: tenant.category,
        departure_date: tenant.departure_date || null,
        stay_duration: tenant.stay_duration || null,
        notice_given: tenant.notice_given,
        notice_date: tenant.notice_date || null,
        security_adjustment: tenant.security_adjustment
      }));

      console.log(`🎉 Successfully loaded ${formattedTenants.length} tenants from MongoDB Atlas`);
      
      res.json({
        tenants: formattedTenants,
        count: formattedTenants.length,
        message: `Found ${formattedTenants.length} tenants in MongoDB Atlas`,
        source: 'mongodb'
      });
    } else {
      // Fallback to in-memory storage
      console.log('⚠️  No tenants found in MongoDB, using fallback data');
      res.json({
        tenants,
        count: tenants.length,
        message: tenants.length > 0 ? `Found ${tenants.length} tenants (fallback)` : 'No tenants found',
        source: 'memory'
      });
    }
  } catch (error) {
    console.error('❌ Error fetching tenants from MongoDB:', error);
    // Fallback to in-memory storage on error
    res.json({
      tenants,
      count: tenants.length,
      message: tenants.length > 0 ? `Found ${tenants.length} tenants (fallback)` : 'No tenants found',
      source: 'memory',
      error: 'MongoDB connection failed'
    });
  }
});

// GET /api/tenants/stats - Get tenant statistics
router.get('/stats', async (req: Request, res: Response) => {
  try {
    // Try to get stats from MongoDB first
    const mongoTenants = await SimpleTenant.find({});
    
    if (mongoTenants && mongoTenants.length > 0) {
      const stats = {
        total: mongoTenants.length,
        active: mongoTenants.filter(t => t.status === 'active').length,
        adjust: mongoTenants.filter(t => t.status === 'adjust').length,
        inactive: mongoTenants.filter(t => t.status === 'inactive').length,
        with_food: mongoTenants.filter(t => t.has_food).length,
        without_food: mongoTenants.filter(t => !t.has_food).length,
        total_rent: mongoTenants.reduce((sum, t) => sum + t.monthly_rent, 0),
        total_deposits: mongoTenants.reduce((sum, t) => sum + t.security_deposit, 0),
        source: 'mongodb'
      };

      res.json(stats);
    } else {
      // Fallback to in-memory storage
      const stats = {
        total: tenants.length,
        active: tenants.filter(t => t.status === 'active').length,
        adjust: tenants.filter(t => t.status === 'adjust').length,
        inactive: tenants.filter(t => t.status === 'inactive').length,
        with_food: tenants.filter(t => t.has_food).length,
        without_food: tenants.filter(t => !t.has_food).length,
        total_rent: tenants.reduce((sum, t) => sum + t.monthly_rent, 0),
        total_deposits: tenants.reduce((sum, t) => sum + t.security_deposit, 0),
        source: 'memory'
      };

      res.json(stats);
    }
  } catch (error) {
    console.error('❌ Error fetching tenant stats:', error);
    res.status(500).json({
      error: 'Failed to fetch tenant statistics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/tenants/:id - Get tenant by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Try MongoDB first
    const mongoTenant = await SimpleTenant.findOne({ id: id });
    
    if (mongoTenant) {
      const formattedTenant = {
        id: mongoTenant.id,
        name: mongoTenant.name,
        mobile: mongoTenant.mobile.toString(),
        room_number: mongoTenant.room_number,
        joining_date: mongoTenant.joining_date.toISOString().split('T')[0],
        monthly_rent: mongoTenant.monthly_rent,
        security_deposit: mongoTenant.security_deposit,
        electricity_joining_reading: mongoTenant.electricity_joining_reading,
        last_electricity_reading: mongoTenant.last_electricity_reading,
        status: mongoTenant.status,
        created_date: mongoTenant.created_date.toISOString().split('T')[0],
        has_food: mongoTenant.has_food,
        category: mongoTenant.category,
        departure_date: null,
        stay_duration: mongoTenant.stay_duration || null,
        notice_given: mongoTenant.notice_given,
        notice_date: null,
        security_adjustment: mongoTenant.security_adjustment
      };

      res.json({
        tenant: formattedTenant,
        source: 'mongodb'
      });
    } else {
      // Fallback to in-memory storage
      const tenant = tenants.find(t => t.id === id);
      if (!tenant) {
        return res.status(404).json({
          error: 'Tenant not found',
          message: `No tenant found with ID: ${id}`
        });
      }

      res.json({
        tenant,
        source: 'memory'
      });
    }
  } catch (error) {
    console.error('❌ Error fetching tenant:', error);
    res.status(500).json({
      error: 'Failed to fetch tenant',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/tenants/room/:roomNumber - Get tenant by room number
router.get('/room/:roomNumber', async (req: Request, res: Response) => {
  try {
    const { roomNumber } = req.params;
    
    // Try MongoDB first
    const mongoTenant = await SimpleTenant.findOne({ room_number: roomNumber, status: 'active' });
    
    if (mongoTenant) {
      const formattedTenant = {
        id: mongoTenant.id,
        name: mongoTenant.name,
        mobile: mongoTenant.mobile.toString(),
        room_number: mongoTenant.room_number,
        joining_date: mongoTenant.joining_date.toISOString().split('T')[0],
        monthly_rent: mongoTenant.monthly_rent,
        security_deposit: mongoTenant.security_deposit,
        electricity_joining_reading: mongoTenant.electricity_joining_reading,
        last_electricity_reading: mongoTenant.last_electricity_reading,
        status: mongoTenant.status,
        created_date: mongoTenant.created_date.toISOString().split('T')[0],
        has_food: mongoTenant.has_food,
        category: mongoTenant.category,
        departure_date: null,
        stay_duration: mongoTenant.stay_duration || null,
        notice_given: mongoTenant.notice_given,
        notice_date: null,
        security_adjustment: mongoTenant.security_adjustment
      };

      res.json({
        tenant: formattedTenant,
        source: 'mongodb'
      });
    } else {
      // Fallback to in-memory storage
      const tenant = tenants.find(t => t.room_number === roomNumber && t.status === 'active');
      if (!tenant) {
        return res.status(404).json({
          error: 'Tenant not found',
          message: `No active tenant found in room: ${roomNumber}`
        });
      }

      res.json({
        tenant,
        source: 'memory'
      });
    }
  } catch (error) {
    console.error('❌ Error fetching tenant by room:', error);
    res.status(500).json({
      error: 'Failed to fetch tenant by room',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
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
      id: `${req.body.name.toLowerCase().replace(/\s+/g, '-')}-${req.body.room_number}`,
      name: req.body.name,
      mobile: req.body.mobile,
      room_number: req.body.room_number,
      joining_date: req.body.joining_date || new Date().toISOString().split('T')[0],
      monthly_rent: Number(req.body.monthly_rent),
      security_deposit: Number(req.body.security_deposit || 0),
      electricity_joining_reading: Number(req.body.electricity_joining_reading || 0),
      last_electricity_reading: Number(req.body.electricity_joining_reading || 0),
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

    // Save to MongoDB
    const mongoTenant = new SimpleTenant(newTenant);
    await mongoTenant.save();

    res.status(201).json({ message: 'Tenant created successfully', tenant: newTenant });
  } catch (error) {
    console.error('❌ Error creating tenant:', error);
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

    const { id } = req.params;
    const originalRoomNumber = req.body.room_number; // This will be updated by the MongoDB query
    const newRoomNumber = req.body.room_number;
    
    // Try MongoDB first
    const mongoTenant = await SimpleTenant.findOne({ id: id });

    if (mongoTenant) {
      // Update tenant data
      mongoTenant.name = req.body.name;
      mongoTenant.mobile = req.body.mobile;
      mongoTenant.room_number = req.body.room_number;
      mongoTenant.joining_date = req.body.joining_date;
      mongoTenant.monthly_rent = Number(req.body.monthly_rent);
      mongoTenant.security_deposit = Number(req.body.security_deposit);
      mongoTenant.electricity_joining_reading = Number(req.body.electricity_joining_reading);
      mongoTenant.status = req.body.status;
      mongoTenant.has_food = Boolean(req.body.has_food);
      mongoTenant.category = req.body.category;
      mongoTenant.departure_date = req.body.departure_date || null;
      mongoTenant.stay_duration = req.body.stay_duration || null;
      mongoTenant.notice_given = Boolean(req.body.notice_given);
      mongoTenant.notice_date = req.body.notice_date || null;
      mongoTenant.security_adjustment = Number(req.body.security_adjustment || 0);

      // If room changed, update electricity joining reading
      if (originalRoomNumber !== newRoomNumber) {
        mongoTenant.last_electricity_reading = mongoTenant.electricity_joining_reading;
        console.log(`🏠 Tenant ${req.body.name} moved from room ${originalRoomNumber} to ${newRoomNumber}`);
        console.log(`⚡ Updated electricity readings for room change`);
      }

      await mongoTenant.save();

      res.json({ 
        message: 'Tenant updated successfully', 
        tenant: mongoTenant,
        roomChanged: originalRoomNumber !== newRoomNumber
      });
    } else {
      // Fallback to in-memory storage
      const tenantIndex = tenants.findIndex(t => t.id === id);
      if (tenantIndex === -1) {
        return res.status(404).json({ error: 'Tenant not found' });
      }

      const originalRoomNumber = tenants[tenantIndex].room_number;
      const newRoomNumber = req.body.room_number;

      // Update tenant data
      tenants[tenantIndex] = {
        ...tenants[tenantIndex],
        name: req.body.name,
        mobile: req.body.mobile,
        room_number: req.body.room_number,
        joining_date: req.body.joining_date,
        monthly_rent: Number(req.body.monthly_rent),
        security_deposit: Number(req.body.security_deposit),
        electricity_joining_reading: Number(req.body.electricity_joining_reading),
        status: req.body.status,
        has_food: Boolean(req.body.has_food),
        category: req.body.category,
        departure_date: req.body.departure_date,
        stay_duration: req.body.stay_duration,
        notice_given: Boolean(req.body.notice_given),
        notice_date: req.body.notice_date,
        security_adjustment: Number(req.body.security_adjustment || 0)
      };

      // If room changed, update electricity joining reading
      if (originalRoomNumber !== newRoomNumber) {
        tenants[tenantIndex].last_electricity_reading = tenants[tenantIndex].electricity_joining_reading;
        console.log(`🏠 Tenant ${req.body.name} moved from room ${originalRoomNumber} to ${newRoomNumber}`);
        console.log(`⚡ Updated electricity readings for room change`);
      }

      res.json({ 
        message: 'Tenant updated successfully', 
        tenant: tenants[tenantIndex],
        roomChanged: originalRoomNumber !== newRoomNumber
      });
    }
  } catch (error) {
    console.error('❌ Error updating tenant:', error);
    res.status(500).json({ error: 'Failed to update tenant' });
  }
});

// DELETE /api/tenants/:id - Delete tenant
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Try MongoDB first
    const deletedMongoTenant = await SimpleTenant.findOneAndDelete({ id: id });

    if (deletedMongoTenant) {
      res.json({ message: 'Tenant deleted successfully', tenant: deletedMongoTenant });
    } else {
      // Fallback to in-memory storage
      const tenantIndex = tenants.findIndex(t => t.id === id);
      if (tenantIndex === -1) {
        return res.status(404).json({ error: 'Tenant not found' });
      }

      const deletedTenant = tenants.splice(tenantIndex, 1)[0];
      res.json({ message: 'Tenant deleted successfully', tenant: deletedTenant });
    }
  } catch (error) {
    console.error('❌ Error deleting tenant:', error);
    res.status(500).json({ error: 'Failed to delete tenant' });
  }
});

export default router;