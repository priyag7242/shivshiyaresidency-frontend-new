import express, { Request, Response } from 'express';
import { body, validationResult } from "../utils/validation";

const router = express.Router();

// Visitor data structure
interface Visitor {
  id: string;
  visitor_name: string;
  visitor_phone: string;
  visitor_id_type: 'aadhar' | 'pan' | 'driving_license' | 'passport' | 'voter_id';
  visitor_id_number: string;
  purpose: 'personal' | 'business' | 'delivery' | 'maintenance' | 'other';
  purpose_description?: string;
  host_tenant_id: string;
  host_tenant_name: string;
  host_room_number: string;
  check_in_time: string;
  check_out_time?: string;
  expected_duration?: string; // in hours
  approval_status: 'approved' | 'pending' | 'rejected';
  approved_by?: string;
  status: 'checked_in' | 'checked_out' | 'overstayed';
  vehicle_number?: string;
  emergency_contact?: string;
  notes?: string;
  photo_url?: string;
  created_by: string;
  updated_date: string;
}

interface VisitorLog {
  id: string;
  visitor_id: string;
  action: 'check_in' | 'check_out' | 'approved' | 'rejected';
  timestamp: string;
  performed_by: string;
  notes?: string;
}

// Mock data storage
let visitors: Visitor[] = [
  {
    id: '1',
    visitor_name: 'Raj Kumar',
    visitor_phone: '9876543210',
    visitor_id_type: 'aadhar',
    visitor_id_number: '1234-5678-9012',
    purpose: 'personal',
    purpose_description: 'Meeting friend',
    host_tenant_id: '1',
    host_tenant_name: 'PRADYUM',
    host_room_number: '303',
    check_in_time: new Date().toISOString(),
    expected_duration: '2',
    approval_status: 'approved',
    approved_by: 'admin',
    status: 'checked_in',
    emergency_contact: '9876543211',
    created_by: 'security',
    updated_date: new Date().toISOString().split('T')[0]
  },
  {
    id: '2',
    visitor_name: 'Priya Singh',
    visitor_phone: '8765432109',
    visitor_id_type: 'driving_license',
    visitor_id_number: 'DL-1420110012345',
    purpose: 'delivery',
    purpose_description: 'Amazon package delivery',
    host_tenant_id: '2',
    host_tenant_name: 'SUMAN DAS',
    host_room_number: '108',
    check_in_time: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    check_out_time: new Date().toISOString(),
    approval_status: 'approved',
    status: 'checked_out',
    vehicle_number: 'DL01AB1234',
    created_by: 'security',
    updated_date: new Date().toISOString().split('T')[0]
  }
];

let visitorLogs: VisitorLog[] = [
  {
    id: '1',
    visitor_id: '1',
    action: 'check_in',
    timestamp: new Date().toISOString(),
    performed_by: 'security',
    notes: 'Visitor checked in at main gate'
  },
  {
    id: '2',
    visitor_id: '2',
    action: 'check_out',
    timestamp: new Date().toISOString(),
    performed_by: 'security',
    notes: 'Package delivered successfully'
  }
];

// Validation middleware
const validateVisitor = [
  body('visitor_name').notEmpty().withMessage('Visitor name is required'),
  body('visitor_phone').isMobilePhone('any').withMessage('Valid phone number is required'),
  body('visitor_id_type').isIn(['aadhar', 'pan', 'driving_license', 'passport', 'voter_id']).withMessage('Invalid ID type'),
  body('visitor_id_number').notEmpty().withMessage('ID number is required'),
  body('purpose').isIn(['personal', 'business', 'delivery', 'maintenance', 'other']).withMessage('Invalid purpose'),
  body('host_tenant_id').notEmpty().withMessage('Host tenant ID is required'),
  body('host_room_number').notEmpty().withMessage('Host room number is required')
];

// GET /api/visitors - Get all visitors with filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status = '', 
      purpose = '', 
      approval_status = '', 
      host_room_number = '',
      date_from = '',
      date_to = ''
    } = req.query;

    let filteredVisitors = visitors;

    // Apply filters
    if (status) {
      filteredVisitors = filteredVisitors.filter(v => v.status === status);
    }

    if (purpose) {
      filteredVisitors = filteredVisitors.filter(v => v.purpose === purpose);
    }

    if (approval_status) {
      filteredVisitors = filteredVisitors.filter(v => v.approval_status === approval_status);
    }

    if (host_room_number) {
      filteredVisitors = filteredVisitors.filter(v => v.host_room_number.includes(host_room_number as string));
    }

    if (date_from) {
      filteredVisitors = filteredVisitors.filter(v => v.check_in_time >= date_from);
    }

    if (date_to) {
      filteredVisitors = filteredVisitors.filter(v => v.check_in_time <= date_to);
    }

    // Sort by check-in time (newest first)
    filteredVisitors.sort((a, b) => new Date(b.check_in_time).getTime() - new Date(a.check_in_time).getTime());

    // Pagination
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const paginatedVisitors = filteredVisitors.slice(startIndex, endIndex);

    res.json({
      visitors: paginatedVisitors,
      totalCount: filteredVisitors.length,
      totalPages: Math.ceil(filteredVisitors.length / Number(limit)),
      currentPage: Number(page)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch visitors' });
  }
});

// GET /api/visitors/stats - Get visitor statistics
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    const stats = {
      total_visitors_today: visitors.filter(v => v.check_in_time.startsWith(today)).length,
      currently_inside: visitors.filter(v => v.status === 'checked_in').length,
      total_visitors_this_month: visitors.filter(v => v.check_in_time.startsWith(currentMonth)).length,
      pending_approvals: visitors.filter(v => v.approval_status === 'pending').length,
      overstayed_visitors: visitors.filter(v => v.status === 'overstayed').length,
      average_visit_duration: '1.5 hours', // Mock data
      purpose_breakdown: {
        personal: visitors.filter(v => v.purpose === 'personal').length,
        business: visitors.filter(v => v.purpose === 'business').length,
        delivery: visitors.filter(v => v.purpose === 'delivery').length,
        maintenance: visitors.filter(v => v.purpose === 'maintenance').length,
        other: visitors.filter(v => v.purpose === 'other').length
      },
      approval_breakdown: {
        approved: visitors.filter(v => v.approval_status === 'approved').length,
        pending: visitors.filter(v => v.approval_status === 'pending').length,
        rejected: visitors.filter(v => v.approval_status === 'rejected').length
      },
      hourly_checkins_today: Array.from({ length: 24 }, (_, hour) => {
        const count = visitors.filter(v => {
          const checkinHour = new Date(v.check_in_time).getHours();
          return v.check_in_time.startsWith(today) && checkinHour === hour;
        }).length;
        return { hour, count };
      })
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch visitor statistics' });
  }
});

// GET /api/visitors/active - Get currently checked-in visitors
router.get('/active', async (req: Request, res: Response) => {
  try {
    const activeVisitors = visitors.filter(v => v.status === 'checked_in');
    
    // Check for overstayed visitors (more than expected duration + 1 hour buffer)
    const now = new Date();
    activeVisitors.forEach(visitor => {
      const checkInTime = new Date(visitor.check_in_time);
      const expectedDuration = Number(visitor.expected_duration || 2);
      const bufferTime = 1; // 1 hour buffer
      const maxStayTime = checkInTime.getTime() + (expectedDuration + bufferTime) * 60 * 60 * 1000;
      
      if (now.getTime() > maxStayTime) {
        const visitorIndex = visitors.findIndex(v => v.id === visitor.id);
        if (visitorIndex !== -1) {
          visitors[visitorIndex].status = 'overstayed';
        }
      }
    });

    res.json(activeVisitors.filter(v => v.status === 'checked_in'));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch active visitors' });
  }
});

// GET /api/visitors/:id - Get single visitor
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const visitor = visitors.find(v => v.id === req.params.id);
    if (!visitor) {
      return res.status(404).json({ error: 'Visitor not found' });
    }
    
    // Get visitor logs
    const logs = visitorLogs.filter(l => l.visitor_id === visitor.id);
    
    res.json({ visitor, logs });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch visitor' });
  }
});

// POST /api/visitors/checkin - Check-in a new visitor
router.post('/checkin', validateVisitor, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const newVisitor: Visitor = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      visitor_name: req.body.visitor_name,
      visitor_phone: req.body.visitor_phone,
      visitor_id_type: req.body.visitor_id_type,
      visitor_id_number: req.body.visitor_id_number,
      purpose: req.body.purpose,
      purpose_description: req.body.purpose_description || '',
      host_tenant_id: req.body.host_tenant_id,
      host_tenant_name: req.body.host_tenant_name,
      host_room_number: req.body.host_room_number,
      check_in_time: new Date().toISOString(),
      expected_duration: req.body.expected_duration || '2',
      approval_status: req.body.approval_status || 'approved', // Auto-approve for demo
      approved_by: req.body.approved_by || 'admin',
      status: 'checked_in',
      vehicle_number: req.body.vehicle_number || '',
      emergency_contact: req.body.emergency_contact || '',
      notes: req.body.notes || '',
      photo_url: req.body.photo_url || '',
      created_by: req.body.created_by || 'security',
      updated_date: new Date().toISOString().split('T')[0]
    };

    visitors.push(newVisitor);
    
    // Create log entry
    const logEntry: VisitorLog = {
      id: Date.now().toString(),
      visitor_id: newVisitor.id,
      action: 'check_in',
      timestamp: new Date().toISOString(),
      performed_by: newVisitor.created_by,
      notes: 'Visitor checked in'
    };
    visitorLogs.push(logEntry);

    res.status(201).json(newVisitor);
  } catch (error) {
    res.status(500).json({ error: 'Failed to check-in visitor' });
  }
});

// PUT /api/visitors/:id/checkout - Check-out a visitor
router.put('/:id/checkout', async (req: Request, res: Response) => {
  try {
    const visitorIndex = visitors.findIndex(v => v.id === req.params.id);
    if (visitorIndex === -1) {
      return res.status(404).json({ error: 'Visitor not found' });
    }

    if (visitors[visitorIndex].status === 'checked_out') {
      return res.status(400).json({ error: 'Visitor already checked out' });
    }

    visitors[visitorIndex].check_out_time = new Date().toISOString();
    visitors[visitorIndex].status = 'checked_out';
    visitors[visitorIndex].updated_date = new Date().toISOString().split('T')[0];
    
    if (req.body.notes) {
      visitors[visitorIndex].notes = req.body.notes;
    }

    // Create log entry
    const logEntry: VisitorLog = {
      id: Date.now().toString(),
      visitor_id: visitors[visitorIndex].id,
      action: 'check_out',
      timestamp: new Date().toISOString(),
      performed_by: req.body.performed_by || 'security',
      notes: req.body.notes || 'Visitor checked out'
    };
    visitorLogs.push(logEntry);

    res.json(visitors[visitorIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to check-out visitor' });
  }
});

// PUT /api/visitors/:id/approve - Approve/reject visitor
router.put('/:id/approve', async (req: Request, res: Response) => {
  try {
    const { approval_status, approved_by, notes } = req.body;
    
    const visitorIndex = visitors.findIndex(v => v.id === req.params.id);
    if (visitorIndex === -1) {
      return res.status(404).json({ error: 'Visitor not found' });
    }

    visitors[visitorIndex].approval_status = approval_status;
    visitors[visitorIndex].approved_by = approved_by;
    visitors[visitorIndex].updated_date = new Date().toISOString().split('T')[0];
    
    if (notes) {
      visitors[visitorIndex].notes = notes;
    }

    // Create log entry
    const logEntry: VisitorLog = {
      id: Date.now().toString(),
      visitor_id: visitors[visitorIndex].id,
      action: approval_status === 'approved' ? 'approved' : 'rejected',
      timestamp: new Date().toISOString(),
      performed_by: approved_by,
      notes: notes || `Visitor ${approval_status}`
    };
    visitorLogs.push(logEntry);

    res.json(visitors[visitorIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update visitor approval' });
  }
});

// GET /api/visitors/tenant/:tenantId - Get visitors for specific tenant
router.get('/tenant/:tenantId', async (req: Request, res: Response) => {
  try {
    const tenantVisitors = visitors.filter(v => v.host_tenant_id === req.params.tenantId);
    const summary = {
      total_visitors: tenantVisitors.length,
      current_visitors: tenantVisitors.filter(v => v.status === 'checked_in').length,
      frequent_visitors: {}, // Could implement logic to find frequent visitors
      visitors: tenantVisitors.sort((a, b) => new Date(b.check_in_time).getTime() - new Date(a.check_in_time).getTime())
    };
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tenant visitors' });
  }
});

// GET /api/visitors/logs - Get visitor activity logs
router.get('/logs', async (req: Request, res: Response) => {
  try {
    const { visitor_id = '', date_from = '', date_to = '' } = req.query;
    
    let filteredLogs = visitorLogs;
    
    if (visitor_id) {
      filteredLogs = filteredLogs.filter(l => l.visitor_id === visitor_id);
    }
    
    if (date_from) {
      filteredLogs = filteredLogs.filter(l => l.timestamp >= date_from);
    }
    
    if (date_to) {
      filteredLogs = filteredLogs.filter(l => l.timestamp <= date_to);
    }
    
    filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    res.json(filteredLogs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch visitor logs' });
  }
});

// DELETE /api/visitors/:id - Delete visitor record
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const visitorIndex = visitors.findIndex(v => v.id === req.params.id);
    if (visitorIndex === -1) {
      return res.status(404).json({ error: 'Visitor not found' });
    }

    const deletedVisitor = visitors.splice(visitorIndex, 1)[0];
    
    // Also delete related logs
    visitorLogs = visitorLogs.filter(l => l.visitor_id !== deletedVisitor.id);
    
    res.json({ message: 'Visitor record deleted successfully', visitor: deletedVisitor });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete visitor record' });
  }
});

export default router; 