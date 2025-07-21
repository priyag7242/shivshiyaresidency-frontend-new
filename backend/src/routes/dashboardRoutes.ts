import express, { Request, Response } from 'express';

const router = express.Router();

// Mock data storage references (in real app, these would be database queries)
// For now, we'll fetch data from the other route files
let tenants: any[] = [];
let rooms: any[] = [];
let payments: any[] = [];
let bills: any[] = [];

// This would normally import from a shared data store or database
// For demo purposes, we'll create some sample data aggregation

// GET /api/dashboard/overview - Get comprehensive dashboard data
router.get('/overview', async (req: Request, res: Response) => {
  try {
    const currentDate = new Date();
    const currentMonth = currentDate.toISOString().slice(0, 7);
    const currentYear = currentDate.getFullYear().toString();
    const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1).toISOString().slice(0, 7);

    // Mock data for demonstration (in real app, fetch from database)
    const mockTenants = [
      { id: '1', status: 'active', monthly_rent: 8500, joining_date: '2024-05-01' },
      { id: '2', status: 'active', monthly_rent: 15900, joining_date: '2022-11-12' },
      { id: '3', status: 'adjust', monthly_rent: 16200, joining_date: '2025-01-07' },
    ];

    const mockRooms = [
      { id: '1', status: 'occupied', capacity: 1, current_occupancy: 1, monthly_rent: 8500, maintenance_status: 'none' },
      { id: '2', status: 'available', capacity: 2, current_occupancy: 0, monthly_rent: 15900, maintenance_status: 'none' },
      { id: '3', status: 'maintenance', capacity: 1, current_occupancy: 0, monthly_rent: 16200, maintenance_status: 'in_progress' },
    ];

    const mockPayments = [
      { id: '1', amount_paid: 8500, billing_month: currentMonth, payment_date: currentDate.toISOString().split('T')[0], payment_method: 'upi' },
      { id: '2', amount_paid: 15900, billing_month: lastMonth, payment_date: '2025-01-15', payment_method: 'cash' },
    ];

    const mockBills = [
      { id: '1', total_amount: 8500, amount_paid: 8500, balance_due: 0, status: 'paid', billing_month: currentMonth },
      { id: '2', total_amount: 16200, amount_paid: 0, balance_due: 16200, status: 'pending', billing_month: currentMonth },
    ];

    // Calculate overview metrics
    const overview = {
      // Tenant metrics
      total_tenants: mockTenants.length,
      active_tenants: mockTenants.filter(t => t.status === 'active').length,
      new_tenants_this_month: mockTenants.filter(t => t.joining_date.startsWith(currentMonth)).length,
      
      // Room metrics
      total_rooms: mockRooms.length,
      occupied_rooms: mockRooms.filter(r => r.status === 'occupied').length,
      available_rooms: mockRooms.filter(r => r.status === 'available').length,
      maintenance_rooms: mockRooms.filter(r => r.status === 'maintenance').length,
      occupancy_rate: Math.round((mockRooms.filter(r => r.status === 'occupied').length / mockRooms.length) * 100),
      
      // Financial metrics
      total_revenue_potential: mockRooms.reduce((sum, r) => sum + r.monthly_rent, 0),
      actual_revenue_this_month: mockPayments.filter(p => p.billing_month === currentMonth).reduce((sum, p) => sum + p.amount_paid, 0),
      pending_collections: mockBills.reduce((sum, b) => sum + b.balance_due, 0),
      collection_rate: Math.round((mockPayments.filter(p => p.billing_month === currentMonth).reduce((sum, p) => sum + p.amount_paid, 0) / mockBills.reduce((sum, b) => sum + b.total_amount, 0)) * 100),
      
      // Recent activity
      recent_payments: mockPayments.slice(-5).map(p => ({
        ...p,
        type: 'payment',
        description: `Payment of ₹${p.amount_paid} received via ${p.payment_method}`,
        date: p.payment_date
      })),
      
      // Maintenance alerts
      maintenance_alerts: mockRooms.filter(r => r.maintenance_status === 'in_progress').length,
      
      // Monthly trends (simplified)
      monthly_revenue_trend: [
        { month: '2025-01', revenue: 45000 },
        { month: '2025-02', revenue: 48000 },
        { month: '2025-03', revenue: 52000 },
        { month: '2025-04', revenue: 49000 },
        { month: '2025-05', revenue: 51000 },
        { month: '2025-06', revenue: 54000 },
        { month: currentMonth, revenue: mockPayments.filter(p => p.billing_month === currentMonth).reduce((sum, p) => sum + p.amount_paid, 0) }
      ],
      
      // Occupancy trend
      occupancy_trend: [
        { month: '2025-01', occupancy: 85 },
        { month: '2025-02', occupancy: 88 },
        { month: '2025-03', occupancy: 92 },
        { month: '2025-04', occupancy: 89 },
        { month: '2025-05', occupancy: 91 },
        { month: '2025-06', occupancy: 94 },
        { month: currentMonth, occupancy: Math.round((mockRooms.filter(r => r.status === 'occupied').length / mockRooms.length) * 100) }
      ],
      
      // Payment method distribution
      payment_method_distribution: {
        cash: mockPayments.filter(p => p.payment_method === 'cash').length,
        upi: mockPayments.filter(p => p.payment_method === 'upi').length,
        bank_transfer: mockPayments.filter(p => p.payment_method === 'bank_transfer').length,
        card: mockPayments.filter(p => p.payment_method === 'card').length,
      },
      
      // Quick stats for current month
      current_month_stats: {
        month: currentMonth,
        total_bills: mockBills.filter(b => b.billing_month === currentMonth).length,
        paid_bills: mockBills.filter(b => b.billing_month === currentMonth && b.status === 'paid').length,
        pending_bills: mockBills.filter(b => b.billing_month === currentMonth && b.status === 'pending').length,
        collection_amount: mockPayments.filter(p => p.billing_month === currentMonth).reduce((sum, p) => sum + p.amount_paid, 0),
        pending_amount: mockBills.filter(b => b.billing_month === currentMonth).reduce((sum, b) => sum + b.balance_due, 0)
      }
    };

    res.json(overview);
  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard overview' });
  }
});

// GET /api/dashboard/recent-activities - Get recent activities across all modules
router.get('/recent-activities', async (req: Request, res: Response) => {
  try {
    const activities = [
      {
        id: '1',
        type: 'payment',
        title: 'Payment Received',
        description: 'PRADYUM paid ₹8,500 for Room 303',
        amount: 8500,
        date: new Date().toISOString(),
        icon: 'payment',
        color: 'green'
      },
      {
        id: '2',
        type: 'tenant',
        title: 'New Tenant',
        description: 'ANISH KUMAR joined Room 114',
        date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        icon: 'user',
        color: 'blue'
      },
      {
        id: '3',
        type: 'maintenance',
        title: 'Maintenance Started',
        description: 'AC repair scheduled for Room 201',
        date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        icon: 'wrench',
        color: 'orange'
      },
      {
        id: '4',
        type: 'room',
        title: 'Room Available',
        description: 'Room 105 is now available for booking',
        date: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
        icon: 'home',
        color: 'purple'
      },
      {
        id: '5',
        type: 'payment',
        title: 'Overdue Alert',
        description: 'SUMAN DAS has pending payment for Room 108',
        date: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
        icon: 'alert',
        color: 'red'
      }
    ];

    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recent activities' });
  }
});

// GET /api/dashboard/alerts - Get important alerts and notifications
router.get('/alerts', async (req: Request, res: Response) => {
  try {
    const alerts = [
      {
        id: '1',
        type: 'payment',
        priority: 'high',
        title: 'Overdue Payments',
        message: '3 tenants have pending payments for this month',
        count: 3,
        action: 'View Payments',
        link: '/payments'
      },
      {
        id: '2',
        type: 'maintenance',
        priority: 'medium',
        title: 'Maintenance Due',
        message: '2 rooms require scheduled maintenance',
        count: 2,
        action: 'View Rooms',
        link: '/rooms'
      },
      {
        id: '3',
        type: 'tenant',
        priority: 'low',
        title: 'Move-out Notices',
        message: '1 tenant has given move-out notice',
        count: 1,
        action: 'View Tenants',
        link: '/tenants'
      }
    ];

    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// GET /api/dashboard/quick-stats - Get quick statistics for widgets
router.get('/quick-stats', async (req: Request, res: Response) => {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    const stats = {
      today: {
        new_tenants: 0,
        payments_received: 1,
        maintenance_requests: 0,
        visitors: 2
      },
      this_week: {
        new_tenants: 1,
        payments_received: 3,
        maintenance_completed: 1,
        room_allocations: 1
      },
      this_month: {
        collection_target: 150000,
        collection_achieved: 45000,
        occupancy_target: 95,
        occupancy_achieved: 89,
        maintenance_completed: 5,
        new_tenants: 2
      },
      pending_tasks: {
        overdue_payments: 3,
        maintenance_pending: 2,
        security_deposits: 1,
        document_verification: 1
      }
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch quick statistics' });
  }
});

export default router; 