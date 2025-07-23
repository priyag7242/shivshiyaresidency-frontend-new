// Mock data API for demo purposes
const mockRooms = [
  {
    id: '1',
    room_number: '101',
    floor: 1,
    type: 'single',
    capacity: 1,
    current_occupancy: 1,
    monthly_rent: 5000,
    security_deposit: 5000,
    amenities: ['Wi-Fi', 'AC', 'Attached Bathroom'],
    status: 'occupied',
    description: 'Comfortable single room with AC'
  },
  {
    id: '2',
    room_number: '102',
    floor: 1,
    type: 'double',
    capacity: 2,
    current_occupancy: 1,
    monthly_rent: 8000,
    security_deposit: 8000,
    amenities: ['Wi-Fi', 'AC', 'Attached Bathroom', 'Balcony'],
    status: 'available',
    description: 'Spacious double room with balcony'
  }
];

const mockTenants = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    mobile: '9876543210',
    room_number: '101',
    monthly_rent: 5000,
    security_deposit: 5000,
    status: 'active',
    category: 'working_professional',
    joining_date: '2024-01-15'
  }
];

export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const url = req.url;

  // Mock endpoints
  if (url.includes('/rooms') && req.method === 'GET') {
    if (url.includes('/stats')) {
      res.status(200).json({
        total: 50,
        occupied: 25,
        available: 20,
        maintenance: 5,
        totalRevenue: 250000
      });
    } else {
      res.status(200).json({
        rooms: mockRooms,
        total: mockRooms.length
      });
    }
  } else if (url.includes('/tenants') && req.method === 'GET') {
    if (url.includes('/stats')) {
      res.status(200).json({
        total: 25,
        active: 23,
        inactive: 2,
        totalRevenue: 250000
      });
    } else {
      res.status(200).json({
        tenants: mockTenants,
        total: mockTenants.length
      });
    }
  } else if (url.includes('/dashboard') && req.method === 'GET') {
    res.status(200).json({
      total_tenants: 25,
      active_tenants: 23,
      total_rooms: 50,
      occupied_rooms: 25,
      monthly_revenue: 250000,
      pending_payments: 5,
      maintenance_requests: 3
    });
  } else if (url.includes('/auth/verify') && req.method === 'GET') {
    res.status(200).json({
      valid: true,
      user: {
        id: '1',
        username: 'admin',
        email: 'admin@shivshiva.com',
        role: 'admin',
        full_name: 'Administrator'
      }
    });
  } else {
    res.status(200).json({ 
      message: 'Mock API endpoint',
      data: [] 
    });
  }
}