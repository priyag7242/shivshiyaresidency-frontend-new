import express, { Request, Response } from 'express';
import { body, validationResult } from "../utils/validation";
import { tenants } from './tenantRoutes'; // Import tenants array from tenant routes
import SimpleRoom from '../models/SimpleRoom'; // Import SimpleRoom model

const router = express.Router();

// Enhanced room data structure with allocation and maintenance tracking
interface RoomData {
  id: string;
  name: string; // Add name field
  room_number: string;
  floor: 0 | 1 | 2 | 3 | 4 | 5;
  type: 'single' | 'double' | 'triple' | 'quad';
  capacity: number;
  current_occupancy: number;
  monthly_rent: number;
  security_deposit: number;
  amenities: string[];
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  description?: string;
  images?: { id: string; url: string; caption?: string }[];
  tenants: { id: string; name: string; allocated_date: string }[]; // Enhanced tenant tracking
  created_date: string;
  updated_date: string;
  // Maintenance tracking
  maintenance_status?: 'none' | 'scheduled' | 'in_progress' | 'completed';
  maintenance_type?: string;
  maintenance_description?: string;
  maintenance_scheduled_date?: string;
  maintenance_completed_date?: string;
  maintenance_cost?: number;
  last_maintenance_date?: string;
}

// Mock data storage (in production, this would be MongoDB)
let rooms: RoomData[] = [];

// Validation middleware
const validateRoom = [
  body('room_number').notEmpty().withMessage('Room number is required'),
  body('floor').isInt({ min: 0, max: 5 }).withMessage('Floor must be between 0 and 5'),
  body('type').isIn(['single', 'double', 'triple', 'quad']).withMessage('Room type must be single, double, triple, or quad'),
  body('capacity').isInt({ min: 1, max: 4 }).withMessage('Capacity must be between 1 and 4'),
  body('monthly_rent').isNumeric().withMessage('Monthly rent must be a number'),
  body('security_deposit').isNumeric().withMessage('Security deposit must be a number'),
];

// Allocation validation
const validateAllocation = [
  body('tenant_id').notEmpty().withMessage('Tenant ID is required'),
  body('tenant_name').notEmpty().withMessage('Tenant name is required'),
];

// Maintenance validation
const validateMaintenance = [
  body('maintenance_type').notEmpty().withMessage('Maintenance type is required'),
  body('maintenance_description').notEmpty().withMessage('Maintenance description is required'),
];

// GET /api/rooms - Get all rooms with pagination and filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      floor = '', 
      type = '',
      status = '',
      maintenance_status = ''
    } = req.query;

    // Try to fetch from MongoDB first
    const mongoRooms = await SimpleRoom.find({}).sort({ room_number: 1 });
    
    if (mongoRooms && mongoRooms.length > 0) {
      // Convert MongoDB documents to the expected format
      let formattedRooms = mongoRooms.map(room => ({
        id: String(room._id),
        name: room.name || `Room ${room.room_number}`, // Add proper name field
        room_number: room.room_number.toString(),
        floor: Math.floor(room.room_number / 100) as 0 | 1 | 2 | 3 | 4 | 5,
        type: room.type.toLowerCase() as 'single' | 'double' | 'triple' | 'quad',
        capacity: room.occupancy,
        current_occupancy: room.occupancy,
        monthly_rent: room.rent,
        security_deposit: room.rent, // Assuming same as rent for now
        amenities: room.amenities || ['WiFi', 'Fan', 'Light', 'Attached Bathroom'],
        status: room.status as 'available' | 'occupied' | 'maintenance' | 'reserved',
        description: `${room.type} room - ${room.name || `Room ${room.room_number}`}`,
        images: [],
        tenants: [{ id: '1', name: room.name || `Room ${room.room_number}`, allocated_date: new Date().toISOString().split('T')[0] }],
        created_date: new Date().toISOString().split('T')[0],
        updated_date: new Date().toISOString().split('T')[0],
        maintenance_status: 'none' as 'none' | 'scheduled' | 'in_progress' | 'completed'
      }));

      // Apply filters
      if (search) {
        formattedRooms = formattedRooms.filter(room => 
          room.room_number.toLowerCase().includes(search.toString().toLowerCase()) ||
          room.description?.toLowerCase().includes(search.toString().toLowerCase())
        );
      }

      if (floor !== '') {
        formattedRooms = formattedRooms.filter(room => room.floor === Number(floor));
      }

      if (type) {
        formattedRooms = formattedRooms.filter(room => room.type === type);
      }

      if (status) {
        formattedRooms = formattedRooms.filter(room => room.status === status);
      }

      if (maintenance_status) {
        formattedRooms = formattedRooms.filter(room => room.maintenance_status === maintenance_status);
      }

      // Pagination
      const startIndex = (Number(page) - 1) * Number(limit);
      const endIndex = startIndex + Number(limit);
      const paginatedRooms = formattedRooms.slice(startIndex, endIndex);

      console.log(`🎉 Successfully loaded ${formattedRooms.length} rooms from MongoDB Atlas`);
      
      res.json({
        rooms: paginatedRooms,
        totalCount: formattedRooms.length,
        totalPages: Math.ceil(formattedRooms.length / Number(limit)),
        currentPage: Number(page)
      });
    } else {
      // Fallback to in-memory storage
      let filteredRooms = rooms;

      // Apply filters
      if (search) {
        filteredRooms = filteredRooms.filter(room => 
          room.room_number.toLowerCase().includes(search.toString().toLowerCase()) ||
          room.description?.toLowerCase().includes(search.toString().toLowerCase())
        );
      }

      if (floor !== '') {
        filteredRooms = filteredRooms.filter(room => room.floor === Number(floor));
      }

      if (type) {
        filteredRooms = filteredRooms.filter(room => room.type === type);
      }

      if (status) {
        filteredRooms = filteredRooms.filter(room => room.status === status);
      }

      if (maintenance_status) {
        filteredRooms = filteredRooms.filter(room => room.maintenance_status === maintenance_status);
      }

      // Pagination
      const startIndex = (Number(page) - 1) * Number(limit);
      const endIndex = startIndex + Number(limit);
      const paginatedRooms = filteredRooms.slice(startIndex, endIndex);

      res.json({
        rooms: paginatedRooms,
        totalCount: filteredRooms.length,
        totalPages: Math.ceil(filteredRooms.length / Number(limit)),
        currentPage: Number(page)
      });
    }
  } catch (error) {
    console.error('❌ Error fetching rooms from MongoDB:', error);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

// GET /api/rooms/available - Get only available rooms
router.get('/available', async (req: Request, res: Response) => {
  try {
    const availableRooms = rooms.filter(room => 
      room.status === 'available' && 
      room.current_occupancy < room.capacity &&
      room.maintenance_status !== 'in_progress'
    );

    res.json({
      rooms: availableRooms,
      count: availableRooms.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch available rooms' });
  }
});

// GET /api/rooms/stats - Get room statistics
router.get('/stats', async (req: Request, res: Response) => {
  try {
    // Try to fetch from MongoDB first
    const mongoRooms = await SimpleRoom.find({});
    
    let roomsToProcess = [];
    
    if (mongoRooms && mongoRooms.length > 0) {
      // Convert MongoDB documents to expected format for stats calculation
      roomsToProcess = mongoRooms.map(room => ({
        floor: Math.floor(room.room_number / 100),
        type: room.type.toLowerCase(),
        status: room.status,
        maintenance_status: 'none'
      }));
    } else {
      // Fallback to in-memory rooms
      roomsToProcess = rooms;
    }

    const floorStats = {
      0: { total: 0, occupied: 0, available: 0, maintenance: 0 },
      1: { total: 0, occupied: 0, available: 0, maintenance: 0 },
      2: { total: 0, occupied: 0, available: 0, maintenance: 0 },
      3: { total: 0, occupied: 0, available: 0, maintenance: 0 },
      4: { total: 0, occupied: 0, available: 0, maintenance: 0 },
      5: { total: 0, occupied: 0, available: 0, maintenance: 0 }
    };

    const typeStats = {
      single: { total: 0, occupied: 0, available: 0 },
      double: { total: 0, occupied: 0, available: 0 },
      triple: { total: 0, occupied: 0, available: 0 },
      quad: { total: 0, occupied: 0, available: 0 }
    };

    const maintenanceStats = {
      none: 0,
      scheduled: 0,
      in_progress: 0,
      completed: 0
    };

    roomsToProcess.forEach((room: any) => {
      const floor = Math.min(Math.max(room.floor, 0), 5);
      
      // Floor stats
      if (floorStats[floor as keyof typeof floorStats]) {
        floorStats[floor as keyof typeof floorStats].total++;
        if (room.status === 'occupied') floorStats[floor as keyof typeof floorStats].occupied++;
        else if (room.status === 'available') floorStats[floor as keyof typeof floorStats].available++;
        else if (room.status === 'maintenance') floorStats[floor as keyof typeof floorStats].maintenance++;
      }

      // Type stats
      const roomType = room.type.toLowerCase();
      if (typeStats[roomType as keyof typeof typeStats]) {
        typeStats[roomType as keyof typeof typeStats].total++;
        if (room.status === 'occupied') typeStats[roomType as keyof typeof typeStats].occupied++;
        else if (room.status === 'available') typeStats[roomType as keyof typeof typeStats].available++;
      }

      // Maintenance stats
      const maintenanceStatus = room.maintenance_status || 'none';
      if (maintenanceStatus in maintenanceStats) {
        maintenanceStats[maintenanceStatus as keyof typeof maintenanceStats]++;
      }
    });

    const stats = {
      total: roomsToProcess.length,
      occupied: roomsToProcess.filter((r: any) => r.status === 'occupied').length,
      available: roomsToProcess.filter((r: any) => r.status === 'available').length,
      maintenance: roomsToProcess.filter((r: any) => r.status === 'maintenance').length,
      reserved: roomsToProcess.filter((r: any) => r.status === 'reserved').length,
      totalCapacity: roomsToProcess.length * 2, // Estimate
      currentOccupancy: roomsToProcess.filter((r: any) => r.status === 'occupied').length,
      totalRevenue: roomsToProcess.filter((r: any) => r.status === 'occupied').length * 15000, // Estimate
      floorStats,
      typeStats,
      maintenanceStats
    };

    res.json(stats);
  } catch (error) {
    console.error('❌ Error fetching room stats from MongoDB:', error);
    res.status(500).json({ error: 'Failed to fetch room statistics' });
  }
});

// GET /api/rooms/:id - Get single room
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const room = rooms.find(r => r.id === req.params.id);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    res.json(room);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch room' });
  }
});

// POST /api/rooms - Create new room
router.post('/', validateRoom, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Auto-set capacity based on room type
    const typeCapacity = {
      single: 1,
      double: 2,
      triple: 3,
      quad: 4
    };

    const newRoom: RoomData = {
      id: Date.now().toString(), // In production, use proper UUID
      name: req.body.name || `Room ${req.body.room_number}`, // Add name field
      room_number: req.body.room_number,
      floor: Number(req.body.floor) as 0 | 1 | 2 | 3 | 4 | 5,
      type: req.body.type,
      capacity: typeCapacity[req.body.type as keyof typeof typeCapacity],
      current_occupancy: req.body.current_occupancy || 0,
      monthly_rent: Number(req.body.monthly_rent),
      security_deposit: Number(req.body.security_deposit),
      amenities: req.body.amenities || [],
      status: req.body.status || 'available',
      description: req.body.description || '',
      images: req.body.images || [],
      tenants: req.body.tenants || [],
      created_date: new Date().toISOString().split('T')[0],
      updated_date: new Date().toISOString().split('T')[0],
      maintenance_status: 'none'
    };

    rooms.push(newRoom);
    res.status(201).json(newRoom);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create room' });
  }
});

// PUT /api/rooms/:id - Update room
router.put('/:id', validateRoom, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const roomIndex = rooms.findIndex(r => r.id === req.params.id);
    if (roomIndex === -1) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Auto-set capacity based on room type
    const typeCapacity = {
      single: 1,
      double: 2,
      triple: 3,
      quad: 4
    };

    rooms[roomIndex] = {
      ...rooms[roomIndex],
      ...req.body,
      floor: Number(req.body.floor) as 0 | 1 | 2 | 3 | 4 | 5,
      capacity: typeCapacity[req.body.type as keyof typeof typeCapacity],
      monthly_rent: Number(req.body.monthly_rent),
      security_deposit: Number(req.body.security_deposit),
      current_occupancy: Number(req.body.current_occupancy || 0),
      updated_date: new Date().toISOString().split('T')[0]
    };

    res.json(rooms[roomIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update room' });
  }
});

// POST /api/rooms/:id/allocate - Allocate room to tenant
router.post('/:id/allocate', validateAllocation, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const roomIndex = rooms.findIndex(r => r.id === req.params.id);
    if (roomIndex === -1) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const room = rooms[roomIndex];

    // Check if room is available and has capacity
    if (room.current_occupancy >= room.capacity) {
      return res.status(400).json({ error: 'Room is at full capacity' });
    }

    if (room.status === 'maintenance') {
      return res.status(400).json({ error: 'Room is under maintenance' });
    }

    // Check if tenant is already allocated to this room
    const tenantExists = room.tenants.some(t => t.id === req.body.tenant_id);
    if (tenantExists) {
      return res.status(400).json({ error: 'Tenant is already allocated to this room' });
    }

    // Add tenant to room
    room.tenants.push({
      id: req.body.tenant_id,
      name: req.body.tenant_name,
      allocated_date: new Date().toISOString().split('T')[0]
    });

    room.current_occupancy = room.tenants.length;
    room.status = room.current_occupancy >= room.capacity ? 'occupied' : 'available';
    room.updated_date = new Date().toISOString().split('T')[0];

    res.json({
      message: 'Room allocated successfully',
      room: room
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to allocate room' });
  }
});

// POST /api/rooms/:id/deallocate - Remove tenant from room
router.post('/:id/deallocate', async (req: Request, res: Response) => {
  try {
    const { tenant_id } = req.body;
    
    if (!tenant_id) {
      return res.status(400).json({ error: 'Tenant ID is required' });
    }

    const roomIndex = rooms.findIndex(r => r.id === req.params.id);
    if (roomIndex === -1) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const room = rooms[roomIndex];

    // Find and remove tenant
    const tenantIndex = room.tenants.findIndex(t => t.id === tenant_id);
    if (tenantIndex === -1) {
      return res.status(404).json({ error: 'Tenant not found in this room' });
    }

    room.tenants.splice(tenantIndex, 1);
    room.current_occupancy = room.tenants.length;
    room.status = room.current_occupancy === 0 ? 'available' : (room.current_occupancy >= room.capacity ? 'occupied' : 'available');
    room.updated_date = new Date().toISOString().split('T')[0];

    res.json({
      message: 'Tenant deallocated successfully',
      room: room
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to deallocate tenant' });
  }
});

// PUT /api/rooms/:id/maintenance - Update maintenance status
router.put('/:id/maintenance', validateMaintenance, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const roomIndex = rooms.findIndex(r => r.id === req.params.id);
    if (roomIndex === -1) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const { 
      maintenance_status, 
      maintenance_type, 
      maintenance_description, 
      maintenance_scheduled_date,
      maintenance_cost
    } = req.body;

    const room = rooms[roomIndex];

    room.maintenance_status = maintenance_status;
    room.maintenance_type = maintenance_type;
    room.maintenance_description = maintenance_description;
    room.maintenance_scheduled_date = maintenance_scheduled_date;
    room.maintenance_cost = maintenance_cost;

    // Update room status based on maintenance status
    if (maintenance_status === 'in_progress') {
      room.status = 'maintenance';
    } else if (maintenance_status === 'completed') {
      room.maintenance_completed_date = new Date().toISOString().split('T')[0];
      room.last_maintenance_date = new Date().toISOString().split('T')[0];
      room.status = room.current_occupancy > 0 ? 'occupied' : 'available';
    }

    room.updated_date = new Date().toISOString().split('T')[0];

    res.json({
      message: 'Maintenance status updated successfully',
      room: room
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update maintenance status' });
  }
});

// POST /api/rooms/:id/photos - Add photos to room
router.post('/:id/photos', async (req: Request, res: Response) => {
  try {
    const { photos } = req.body; // Array of { url: string, caption?: string }
    
    if (!Array.isArray(photos)) {
      return res.status(400).json({ error: 'Photos must be an array' });
    }

    const roomIndex = rooms.findIndex(r => r.id === req.params.id);
    if (roomIndex === -1) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const room = rooms[roomIndex];

    // Add photos with unique IDs
    const newPhotos = photos.map(photo => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      url: photo.url,
      caption: photo.caption || ''
    }));

    room.images = [...(room.images || []), ...newPhotos];
    room.updated_date = new Date().toISOString().split('T')[0];

    res.json({
      message: 'Photos added successfully',
      photos: newPhotos,
      room: room
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add photos' });
  }
});

// DELETE /api/rooms/:id/photos/:photoId - Remove photo from room
router.delete('/:id/photos/:photoId', async (req: Request, res: Response) => {
  try {
    const roomIndex = rooms.findIndex(r => r.id === req.params.id);
    if (roomIndex === -1) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const room = rooms[roomIndex];
    const photoIndex = room.images?.findIndex(img => img.id === req.params.photoId);

    if (photoIndex === -1 || photoIndex === undefined) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    room.images?.splice(photoIndex, 1);
    room.updated_date = new Date().toISOString().split('T')[0];

    res.json({
      message: 'Photo removed successfully',
      room: room
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove photo' });
  }
});

// DELETE /api/rooms/:id - Delete room
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const roomIndex = rooms.findIndex(r => r.id === req.params.id);
    if (roomIndex === -1) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const deletedRoom = rooms.splice(roomIndex, 1)[0];
    res.json({ message: 'Room deleted successfully', room: deletedRoom });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete room' });
  }
});

// POST /api/rooms/import - Import room data
router.post('/import', async (req: Request, res: Response) => {
  try {
    const { roomsData } = req.body;
    
    if (!Array.isArray(roomsData)) {
      return res.status(400).json({ error: 'Invalid data format' });
    }

    // Clear existing data and import new data
    rooms = roomsData;
    
    res.json({ 
      message: 'Rooms imported successfully', 
      count: rooms.length 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to import rooms' });
  }
});

// GET /api/rooms/floor/:floorNumber - Get rooms by floor
router.get('/floor/:floorNumber', async (req: Request, res: Response) => {
  try {
    const floorNumber = Number(req.params.floorNumber);
    if (floorNumber < 0 || floorNumber > 5) {
      return res.status(400).json({ error: 'Floor must be between 0 and 5' });
    }

    const floorRooms = rooms.filter(room => room.floor === floorNumber);
    res.json({
      floor: floorNumber,
      rooms: floorRooms,
      count: floorRooms.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch floor rooms' });
  }
});

// Initialize rooms from tenant data
router.post('/initialize', async (req: Request, res: Response) => {
  try {
    console.log(`Found ${tenants.length} tenants for room initialization`);
    
    // Extract unique rooms and their details
    const roomMap = new Map();
    
    tenants.forEach((tenant: any) => {
      const roomNumber = tenant.room_number;
      if (!roomMap.has(roomNumber)) {
        // Determine floor from room number
        const floor = parseInt(roomNumber.toString().charAt(0));
        
        // Determine room type based on rent (approximation)
        let type = 'single';
        if (tenant.monthly_rent >= 16000) type = 'double';
        if (tenant.monthly_rent >= 20000) type = 'triple';
        if (tenant.monthly_rent >= 25000) type = 'quad';
        
        // Set capacity based on type
        const capacity = {
          'single': 1,
          'double': 2,
          'triple': 3,
          'quad': 4
        }[type];
        
        roomMap.set(roomNumber, {
          id: `room-${roomNumber}-${Date.now()}`,
          name: `Room ${roomNumber}`, // Add name field
          room_number: roomNumber,
          floor: Math.min(Math.max(floor, 0), 5) as 0 | 1 | 2 | 3 | 4 | 5, // Ensure valid floor
          type: type as 'single' | 'double' | 'triple' | 'quad',
          capacity: capacity,
          current_occupancy: 0,
          monthly_rent: tenant.monthly_rent,
          security_deposit: tenant.security_deposit,
          amenities: ['wifi', 'ac', 'attached_bathroom'],
          status: 'occupied' as 'available' | 'occupied' | 'maintenance' | 'reserved',
          description: `${type.charAt(0).toUpperCase() + type.slice(1)} occupancy room on floor ${floor}`,
          images: [],
          tenants: [],
          maintenance_status: 'none' as 'none' | 'scheduled' | 'in_progress' | 'completed',
          created_date: new Date().toISOString().split('T')[0],
          updated_date: new Date().toISOString().split('T')[0]
        });
      }
    });
    
    // Count tenants per room and populate tenant information
    tenants.forEach((tenant: any) => {
      const room = roomMap.get(tenant.room_number);
      if (room) {
        room.current_occupancy += 1;
        room.tenants.push({
          id: tenant.id,
          name: tenant.name,
          allocated_date: tenant.joining_date || tenant.created_date
        });
        // If room is full, mark as occupied, otherwise available
        room.status = room.current_occupancy >= room.capacity ? 'occupied' : 'available';
      }
    });
    
    // Clear existing rooms and add new ones
    rooms.length = 0;
    const roomsToInsert = Array.from(roomMap.values());
    rooms.push(...roomsToInsert);
    
    // Summary
    const summary = {
      total_rooms: rooms.length,
      floors: [...new Set(roomsToInsert.map((r: any) => r.floor))].sort(),
      room_types: roomsToInsert.reduce((acc: any, room: any) => {
        acc[room.type] = (acc[room.type] || 0) + 1;
        return acc;
      }, {}),
      occupancy_summary: {
        occupied: roomsToInsert.filter((r: any) => r.status === 'occupied').length,
        available: roomsToInsert.filter((r: any) => r.status === 'available').length
      }
    };
    
    console.log('✅ Rooms initialized successfully:', summary);
    
    res.status(201).json({
      message: 'Rooms initialized successfully from tenant data! 🏠',
      summary,
      rooms_created: rooms.length
    });
    
  } catch (error: any) {
    console.error('❌ Error initializing rooms:', error);
    res.status(500).json({
      error: 'Failed to initialize rooms',
      message: error.message
    });
  }
});

export default router; 