import express, { Request, Response } from 'express';
import { body, validationResult } from "../utils/validation";

const router = express.Router();

// Maintenance request data structure
interface MaintenanceRequest {
  id: string;
  tenant_id: string;
  tenant_name: string;
  room_number: string;
  request_type: 'electrical' | 'plumbing' | 'ac_repair' | 'furniture' | 'cleaning' | 'appliance' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  requested_date: string;
  assigned_to?: string;
  scheduled_date?: string;
  completed_date?: string;
  estimated_cost?: number;
  actual_cost?: number;
  notes?: string;
  images?: string[];
  created_by: string;
  updated_date: string;
}

// Mock data storage
let maintenanceRequests: MaintenanceRequest[] = [
  {
    id: '1',
    tenant_id: '1',
    tenant_name: 'PRADYUM',
    room_number: '303',
    request_type: 'ac_repair',
    priority: 'high',
    title: 'AC not cooling properly',
    description: 'The air conditioner in room 303 is not cooling properly. It makes noise and the temperature is not getting cool.',
    status: 'in_progress',
    requested_date: '2025-01-20',
    assigned_to: 'Maintenance Team A',
    scheduled_date: '2025-01-22',
    estimated_cost: 2500,
    notes: 'Technician will check on 22nd Jan',
    created_by: 'tenant',
    updated_date: '2025-01-21'
  },
  {
    id: '2',
    tenant_id: '2',
    tenant_name: 'SUMAN DAS',
    room_number: '108',
    request_type: 'plumbing',
    priority: 'medium',
    title: 'Leaking tap in bathroom',
    description: 'The bathroom tap is leaking continuously and wasting water.',
    status: 'pending',
    requested_date: '2025-01-21',
    created_by: 'tenant',
    updated_date: '2025-01-21'
  }
];

// Validation middleware
const validateMaintenanceRequest = [
  body('request_type').isIn(['electrical', 'plumbing', 'ac_repair', 'furniture', 'cleaning', 'appliance', 'general']).withMessage('Invalid request type'),
  body('priority').isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('room_number').notEmpty().withMessage('Room number is required')
];

// GET /api/maintenance - Get all maintenance requests with filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status = '', 
      priority = '', 
      request_type = '', 
      room_number = '',
      tenant_id = ''
    } = req.query;

    let filteredRequests = maintenanceRequests;

    // Apply filters
    if (status) {
      filteredRequests = filteredRequests.filter(r => r.status === status);
    }

    if (priority) {
      filteredRequests = filteredRequests.filter(r => r.priority === priority);
    }

    if (request_type) {
      filteredRequests = filteredRequests.filter(r => r.request_type === request_type);
    }

    if (room_number) {
      filteredRequests = filteredRequests.filter(r => r.room_number.includes(room_number as string));
    }

    if (tenant_id) {
      filteredRequests = filteredRequests.filter(r => r.tenant_id === tenant_id);
    }

    // Sort by requested date (newest first)
    filteredRequests.sort((a, b) => new Date(b.requested_date).getTime() - new Date(a.requested_date).getTime());

    // Pagination
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const paginatedRequests = filteredRequests.slice(startIndex, endIndex);

    res.json({
      requests: paginatedRequests,
      totalCount: filteredRequests.length,
      totalPages: Math.ceil(filteredRequests.length / Number(limit)),
      currentPage: Number(page),
      hasNextPage: endIndex < filteredRequests.length,
      hasPrevPage: startIndex > 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch maintenance requests' });
  }
});

// GET /api/maintenance/stats - Get maintenance statistics
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    const stats = {
      total_requests: maintenanceRequests.length,
      pending_requests: maintenanceRequests.filter(r => r.status === 'pending').length,
      in_progress_requests: maintenanceRequests.filter(r => r.status === 'in_progress').length,
      completed_requests: maintenanceRequests.filter(r => r.status === 'completed').length,
      cancelled_requests: maintenanceRequests.filter(r => r.status === 'cancelled').length,
      this_month_requests: maintenanceRequests.filter(r => r.requested_date.startsWith(currentMonth)).length,
      high_priority_pending: maintenanceRequests.filter(r => r.status === 'pending' && r.priority === 'high').length,
      urgent_priority_pending: maintenanceRequests.filter(r => r.status === 'pending' && r.priority === 'urgent').length,
      average_completion_time: '3.2 days', // Mock data
      total_cost_this_month: maintenanceRequests
        .filter(r => r.completed_date?.startsWith(currentMonth))
        .reduce((sum, r) => sum + (r.actual_cost || 0), 0),
      request_type_breakdown: {
        electrical: maintenanceRequests.filter(r => r.request_type === 'electrical').length,
        plumbing: maintenanceRequests.filter(r => r.request_type === 'plumbing').length,
        ac_repair: maintenanceRequests.filter(r => r.request_type === 'ac_repair').length,
        furniture: maintenanceRequests.filter(r => r.request_type === 'furniture').length,
        cleaning: maintenanceRequests.filter(r => r.request_type === 'cleaning').length,
        appliance: maintenanceRequests.filter(r => r.request_type === 'appliance').length,
        general: maintenanceRequests.filter(r => r.request_type === 'general').length
      },
      priority_breakdown: {
        low: maintenanceRequests.filter(r => r.priority === 'low').length,
        medium: maintenanceRequests.filter(r => r.priority === 'medium').length,
        high: maintenanceRequests.filter(r => r.priority === 'high').length,
        urgent: maintenanceRequests.filter(r => r.priority === 'urgent').length
      }
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch maintenance statistics' });
  }
});

// GET /api/maintenance/:id - Get single maintenance request
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const request = maintenanceRequests.find(r => r.id === req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Maintenance request not found' });
    }
    res.json(request);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch maintenance request' });
  }
});

// POST /api/maintenance - Create new maintenance request
router.post('/', validateMaintenanceRequest, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const newRequest: MaintenanceRequest = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      tenant_id: req.body.tenant_id || '',
      tenant_name: req.body.tenant_name || '',
      room_number: req.body.room_number,
      request_type: req.body.request_type,
      priority: req.body.priority,
      title: req.body.title,
      description: req.body.description,
      status: 'pending',
      requested_date: new Date().toISOString().split('T')[0],
      assigned_to: req.body.assigned_to || '',
      scheduled_date: req.body.scheduled_date || '',
      estimated_cost: Number(req.body.estimated_cost || 0),
      notes: req.body.notes || '',
      images: req.body.images || [],
      created_by: req.body.created_by || 'tenant',
      updated_date: new Date().toISOString().split('T')[0]
    };

    maintenanceRequests.push(newRequest);
    res.status(201).json(newRequest);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create maintenance request' });
  }
});

// PUT /api/maintenance/:id - Update maintenance request
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const requestIndex = maintenanceRequests.findIndex(r => r.id === req.params.id);
    if (requestIndex === -1) {
      return res.status(404).json({ error: 'Maintenance request not found' });
    }

    // Update request
    maintenanceRequests[requestIndex] = {
      ...maintenanceRequests[requestIndex],
      ...req.body,
      updated_date: new Date().toISOString().split('T')[0]
    };

    // If status is being updated to completed, set completed_date
    if (req.body.status === 'completed' && !maintenanceRequests[requestIndex].completed_date) {
      maintenanceRequests[requestIndex].completed_date = new Date().toISOString().split('T')[0];
    }

    res.json(maintenanceRequests[requestIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update maintenance request' });
  }
});

// PUT /api/maintenance/:id/status - Update request status
router.put('/:id/status', async (req: Request, res: Response) => {
  try {
    const { status, assigned_to, scheduled_date, notes } = req.body;
    
    const requestIndex = maintenanceRequests.findIndex(r => r.id === req.params.id);
    if (requestIndex === -1) {
      return res.status(404).json({ error: 'Maintenance request not found' });
    }

    maintenanceRequests[requestIndex].status = status;
    maintenanceRequests[requestIndex].updated_date = new Date().toISOString().split('T')[0];
    
    if (assigned_to) maintenanceRequests[requestIndex].assigned_to = assigned_to;
    if (scheduled_date) maintenanceRequests[requestIndex].scheduled_date = scheduled_date;
    if (notes) maintenanceRequests[requestIndex].notes = notes;
    
    if (status === 'completed') {
      maintenanceRequests[requestIndex].completed_date = new Date().toISOString().split('T')[0];
    }

    res.json(maintenanceRequests[requestIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update request status' });
  }
});

// DELETE /api/maintenance/:id - Delete maintenance request
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const requestIndex = maintenanceRequests.findIndex(r => r.id === req.params.id);
    if (requestIndex === -1) {
      return res.status(404).json({ error: 'Maintenance request not found' });
    }

    const deletedRequest = maintenanceRequests.splice(requestIndex, 1)[0];
    res.json({ message: 'Maintenance request deleted successfully', request: deletedRequest });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete maintenance request' });
  }
});

// GET /api/maintenance/tenant/:tenantId - Get requests for specific tenant
router.get('/tenant/:tenantId', async (req: Request, res: Response) => {
  try {
    const tenantRequests = maintenanceRequests.filter(r => r.tenant_id === req.params.tenantId);
    const summary = {
      total_requests: tenantRequests.length,
      pending_requests: tenantRequests.filter(r => r.status === 'pending').length,
      completed_requests: tenantRequests.filter(r => r.status === 'completed').length,
      requests: tenantRequests.sort((a, b) => new Date(b.requested_date).getTime() - new Date(a.requested_date).getTime())
    };
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tenant maintenance requests' });
  }
});

export default router; 