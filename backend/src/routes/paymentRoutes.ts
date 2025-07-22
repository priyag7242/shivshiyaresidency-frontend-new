import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { tenants } from './tenantRoutes';

const router = express.Router();

// Payment data structure
interface PaymentData {
  id: string;
  tenant_id: string;
  tenant_name: string;
  room_number: string;
  payment_date: string;
  billing_month: string; // YYYY-MM format
  rent_amount: number;
  electricity_amount: number;
  other_charges: number;
  adjustments: number; // positive or negative
  total_amount: number;
  amount_paid: number;
  payment_method: 'cash' | 'upi' | 'bank_transfer' | 'card';
  transaction_id?: string;
  notes?: string;
  status: 'paid' | 'partial' | 'pending' | 'overdue';
  due_date: string;
  created_date: string;
  created_by: string;
}

interface BillData {
  id: string;
  tenant_id: string;
  tenant_name: string;
  room_number: string;
  billing_month: string;
  rent_amount: number;
  electricity_units: number;
  electricity_rate: number;
  electricity_amount: number;
  other_charges: number;
  adjustments: number;
  total_amount: number;
  amount_paid: number;
  balance_due: number;
  due_date: string;
  status: 'paid' | 'partial' | 'pending' | 'overdue';
  generated_date: string;
  payments: PaymentData[];
}

// Mock data storage
let payments: PaymentData[] = [];
let bills: BillData[] = [];

// Validation middleware
const validatePayment = [
  body('tenant_id').notEmpty().withMessage('Tenant ID is required'),
  body('billing_month').matches(/^\d{4}-\d{2}$/).withMessage('Billing month must be in YYYY-MM format'),
  body('amount_paid').isNumeric().withMessage('Amount paid must be a number'),
  body('payment_method').isIn(['cash', 'upi', 'bank_transfer', 'card']).withMessage('Invalid payment method'),
];

const validateBill = [
  body('tenant_id').notEmpty().withMessage('Tenant ID is required'),
  body('billing_month').matches(/^\d{4}-\d{2}$/).withMessage('Billing month must be in YYYY-MM format'),
  body('rent_amount').isNumeric().withMessage('Rent amount must be a number'),
  body('electricity_units').isNumeric().withMessage('Electricity units must be a number'),
];

// GET /api/payments - Get all payments with filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      tenant_id = '', 
      billing_month = '',
      status = '',
      payment_method = ''
    } = req.query;

    let filteredPayments = payments;

    // Apply filters
    if (tenant_id) {
      filteredPayments = filteredPayments.filter(p => p.tenant_id === tenant_id);
    }

    if (billing_month) {
      filteredPayments = filteredPayments.filter(p => p.billing_month === billing_month);
    }

    if (status) {
      filteredPayments = filteredPayments.filter(p => p.status === status);
    }

    if (payment_method) {
      filteredPayments = filteredPayments.filter(p => p.payment_method === payment_method);
    }

    // Sort by payment date (newest first)
    filteredPayments.sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime());

    // Pagination
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const paginatedPayments = filteredPayments.slice(startIndex, endIndex);

    res.json({
      payments: paginatedPayments,
      totalCount: filteredPayments.length,
      totalPages: Math.ceil(filteredPayments.length / Number(limit)),
      currentPage: Number(page),
      hasNextPage: endIndex < filteredPayments.length,
      hasPrevPage: startIndex > 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// GET /api/payments/stats - Get payment statistics
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const currentYear = new Date().getFullYear().toString();

    const stats = {
      total_collected: payments.reduce((sum, p) => sum + p.amount_paid, 0),
      this_month_collected: payments
        .filter(p => p.billing_month === currentMonth)
        .reduce((sum, p) => sum + p.amount_paid, 0),
      this_year_collected: payments
        .filter(p => p.billing_month.startsWith(currentYear))
        .reduce((sum, p) => sum + p.amount_paid, 0),
      pending_amount: bills.reduce((sum, b) => sum + b.balance_due, 0),
      overdue_amount: bills
        .filter(b => b.status === 'overdue')
        .reduce((sum, b) => sum + b.balance_due, 0),
      total_bills: bills.length,
      paid_bills: bills.filter(b => b.status === 'paid').length,
      pending_bills: bills.filter(b => b.status === 'pending').length,
      overdue_bills: bills.filter(b => b.status === 'overdue').length,
      payment_methods: {
        cash: payments.filter(p => p.payment_method === 'cash').length,
        upi: payments.filter(p => p.payment_method === 'upi').length,
        bank_transfer: payments.filter(p => p.payment_method === 'bank_transfer').length,
        card: payments.filter(p => p.payment_method === 'card').length,
      },
      monthly_collection: {} as any
    };

    // Calculate monthly collection for the current year
    for (let month = 1; month <= 12; month++) {
      const monthStr = `${currentYear}-${month.toString().padStart(2, '0')}`;
      stats.monthly_collection[monthStr] = payments
        .filter(p => p.billing_month === monthStr)
        .reduce((sum, p) => sum + p.amount_paid, 0);
    }

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payment statistics' });
  }
});

// GET /api/payments/bills - Get all bills
router.get('/bills', async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      tenant_id = '', 
      billing_month = '',
      status = ''
    } = req.query;

    let filteredBills = bills;

    // Apply filters
    if (tenant_id) {
      filteredBills = filteredBills.filter(b => b.tenant_id === tenant_id);
    }

    if (billing_month) {
      filteredBills = filteredBills.filter(b => b.billing_month === billing_month);
    }

    if (status) {
      filteredBills = filteredBills.filter(b => b.status === status);
    }

    // Sort by billing month (newest first)
    filteredBills.sort((a, b) => b.billing_month.localeCompare(a.billing_month));

    // Pagination
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const paginatedBills = filteredBills.slice(startIndex, endIndex);

    res.json({
      bills: paginatedBills,
      totalCount: filteredBills.length,
      totalPages: Math.ceil(filteredBills.length / Number(limit)),
      currentPage: Number(page),
      hasNextPage: endIndex < filteredBills.length,
      hasPrevPage: startIndex > 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bills' });
  }
});

// POST /api/payments/electricity/update - Update current electricity readings for rooms
router.post('/electricity/update', async (req: Request, res: Response) => {
  try {
    const { room_readings } = req.body; // { "303": 1250, "108": 3150, ... }

    if (!room_readings || typeof room_readings !== 'object') {
      return res.status(400).json({ error: 'Room readings object is required' });
    }

    const updates: any[] = [];
    
    // Update electricity readings for each room using directly imported tenant data
    for (const [roomNumber, currentReading] of Object.entries(room_readings)) {
      const roomTenants = tenants.filter((t: any) => t.room_number === roomNumber && t.status === 'active');
      
      for (const tenant of roomTenants) {
        // Find and update the tenant directly
        const tenantIndex = tenants.findIndex((t: any) => t.id === tenant.id);
        
        if (tenantIndex !== -1) {
          const previousReading = tenants[tenantIndex].last_electricity_reading || tenants[tenantIndex].electricity_joining_reading;
          
          // Update the tenant's electricity reading directly
          tenants[tenantIndex].last_electricity_reading = Number(currentReading);
          
          updates.push({
            tenant_id: tenant.id,
            tenant_name: tenant.name,
            room_number: roomNumber,
            previous_reading: previousReading,
            current_reading: Number(currentReading),
            units_consumed: Math.max(0, Number(currentReading) - previousReading)
          });
        }
      }
    }

    res.json({
      message: `Updated electricity readings for ${Object.keys(room_readings).length} rooms`,
      updates,
      total_tenants_updated: updates.length
    });
  } catch (error) {
    console.error('Error updating electricity readings:', error);
    res.status(500).json({ error: 'Failed to update electricity readings' });
  }
});

// GET /api/payments/electricity/rooms - Get electricity consumption summary by room
router.get('/electricity/rooms', async (req: Request, res: Response) => {
  try {
    const roomSummary: { [roomNumber: string]: any } = {};

    // Group tenants by room and calculate consumption using directly imported tenant data
    tenants.forEach((tenant: any) => {
      if (tenant.status === 'active') {
        const roomNumber = tenant.room_number;
        
        if (!roomSummary[roomNumber]) {
          roomSummary[roomNumber] = {
            room_number: roomNumber,
            tenants: [],
            total_consumption: 0,
            joining_reading: 0,
            current_reading: 0,
            sharing_count: 0
          };
        }

        const consumption = Math.max(0, 
          (tenant.last_electricity_reading || tenant.electricity_joining_reading) - 
          tenant.electricity_joining_reading
        );

        roomSummary[roomNumber].tenants.push({
          id: tenant.id,
          name: tenant.name,
          joining_reading: tenant.electricity_joining_reading || 0,
          last_reading: tenant.last_electricity_reading || tenant.electricity_joining_reading || 0,
          consumption
        });

        roomSummary[roomNumber].joining_reading = Math.max(
          roomSummary[roomNumber].joining_reading, 
          tenant.electricity_joining_reading || 0
        );
        
        roomSummary[roomNumber].current_reading = Math.max(
          roomSummary[roomNumber].current_reading,
          tenant.last_electricity_reading || tenant.electricity_joining_reading || 0
        );

        roomSummary[roomNumber].sharing_count = roomSummary[roomNumber].tenants.length;
      }
    });

    // Calculate total consumption for each room
    Object.keys(roomSummary).forEach(roomNumber => {
      const room = roomSummary[roomNumber];
      room.total_consumption = Math.max(0, room.current_reading - room.joining_reading);
    });

    res.json({
      rooms: Object.values(roomSummary),
      total_rooms: Object.keys(roomSummary).length
    });
  } catch (error) {
    console.error('Error fetching room electricity data:', error);
    res.status(500).json({ error: 'Failed to fetch room electricity data' });
  }
});

// POST /api/payments/bills/generate - Generate bills for a month
router.post('/bills/generate', async (req: Request, res: Response) => {
  try {
    const { billing_month, electricity_rate = 12, current_readings = {} } = req.body;

    if (!billing_month) {
      return res.status(400).json({ error: 'Billing month is required' });
    }

    console.log(`🔍 Bill Generation Debug for ${billing_month}:`);
    console.log(`📊 Total tenants in system: ${tenants.length}`);

    // Use directly imported tenant data
    if (tenants.length === 0) {
      return res.status(400).json({ error: 'No tenants found. Please add tenants first.' });
    }

    const generatedBills: BillData[] = [];

    // Group tenants by room for electricity sharing calculation
    const roomGroups: { [roomNumber: string]: any[] } = {};
    tenants.forEach((tenant: any) => {
      if (tenant.status === 'active') {
        if (!roomGroups[tenant.room_number]) {
          roomGroups[tenant.room_number] = [];
        }
        roomGroups[tenant.room_number].push(tenant);
      }
    });

    console.log(`🏠 Active tenants by room:`, Object.keys(roomGroups).map(room => `${room}: ${roomGroups[room].length} tenants`));
    console.log(`📋 Existing bills count: ${bills.length}`);
    console.log(`🔍 Existing bills for ${billing_month}:`, bills.filter(b => b.billing_month === billing_month).length);

    // Process each room
    for (const [roomNumber, roomTenants] of Object.entries(roomGroups)) {
      console.log(`\n🏠 Processing Room ${roomNumber} with ${roomTenants.length} tenants`);
      
      // Check if bill already exists for any tenant in this room
      const existingBill = bills.find(b => 
        roomTenants.some(t => t.id === b.tenant_id) && b.billing_month === billing_month
      );
      
      if (existingBill) {
        console.log(`⚠️ Bills already exist for Room ${roomNumber} in ${billing_month} - skipping`);
        continue;
      }

      // Get current meter reading for this room (from request or use default)
      const currentReading = current_readings[roomNumber] || 
        (roomTenants[0].last_electricity_reading || roomTenants[0].electricity_joining_reading) + Math.floor(Math.random() * 100) + 50;

      // Calculate total consumption for the room
      // Use the highest joining reading among tenants (represents room's base reading)
      const roomJoiningReading = Math.max(...roomTenants.map(t => t.electricity_joining_reading || 0));
      const totalUnitsConsumed = Math.max(0, currentReading - roomJoiningReading);
      
      // Calculate total electricity cost for the room
      const totalElectricityCost = totalUnitsConsumed * Number(electricity_rate);

      // Split electricity cost among tenants in the room
      const unitsPerTenant = Math.floor(totalUnitsConsumed / roomTenants.length);
      const costPerTenant = Math.floor(totalElectricityCost / roomTenants.length);

      // Generate bill for each tenant in the room
      roomTenants.forEach((tenant: any, index: number) => {
        // Handle remainder for last tenant
        const isLastTenant = index === roomTenants.length - 1;
        const tenantUnits = isLastTenant ? 
          totalUnitsConsumed - (unitsPerTenant * (roomTenants.length - 1)) : 
          unitsPerTenant;
        const tenantElectricityCost = isLastTenant ? 
          totalElectricityCost - (costPerTenant * (roomTenants.length - 1)) : 
          costPerTenant;

        const other_charges = 0;
        const adjustments = 0;
        const total_amount = tenant.monthly_rent + tenantElectricityCost + other_charges + adjustments;

        const newBill: BillData = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          tenant_id: tenant.id,
          tenant_name: tenant.name,
          room_number: tenant.room_number,
          billing_month,
          rent_amount: tenant.monthly_rent,
          electricity_units: tenantUnits,
          electricity_rate: Number(electricity_rate),
          electricity_amount: tenantElectricityCost,
          other_charges,
          adjustments,
          total_amount,
          amount_paid: 0,
          balance_due: total_amount,
          due_date: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString().split('T')[0],
          status: 'pending',
          generated_date: new Date().toISOString().split('T')[0],
          payments: []
        };

        bills.push(newBill);
        generatedBills.push(newBill);
      });

      // Update last electricity reading for all tenants in the room
      roomTenants.forEach((tenant: any) => {
        const tenantIndex = tenants.findIndex((t: any) => t.id === tenant.id);
        if (tenantIndex !== -1) {
          // Update the tenant's last electricity reading directly
          tenants[tenantIndex].last_electricity_reading = currentReading;
        }
      });
    }

    console.log(`\n✅ Bill Generation Complete:`);
    console.log(`📊 Generated ${generatedBills.length} bills for ${billing_month}`);
    console.log(`🏠 Processed ${Object.keys(roomGroups).length} rooms`);

    res.json({
      message: `Generated ${generatedBills.length} bills for ${billing_month}`,
      bills: generatedBills,
      electricity_details: {
        rate_per_unit: electricity_rate,
        rooms_processed: Object.keys(roomGroups).length,
        sharing_method: 'equal_split_per_room'
      }
    });
  } catch (error) {
    console.error('Error generating bills:', error);
    res.status(500).json({ error: 'Failed to generate bills' });
  }
});

// DELETE /api/payments/bills/clear/:month - Clear bills for a specific month (for testing)
router.delete('/bills/clear/:month', async (req: Request, res: Response) => {
  try {
    const month = req.params.month;
    const billsToDelete = bills.filter(b => b.billing_month === month);
    
    // Remove bills for the specified month
    for (let i = bills.length - 1; i >= 0; i--) {
      if (bills[i].billing_month === month) {
        bills.splice(i, 1);
      }
    }

    console.log(`🗑️ Cleared ${billsToDelete.length} bills for ${month}`);
    
    res.json({
      message: `Cleared ${billsToDelete.length} bills for ${month}`,
      cleared_bills: billsToDelete.length
    });
  } catch (error) {
    console.error('Error clearing bills:', error);
    res.status(500).json({ error: 'Failed to clear bills' });
  }
});

// POST /api/payments - Record a new payment
router.post('/', validatePayment, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const newPayment: PaymentData = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      tenant_id: req.body.tenant_id,
      tenant_name: req.body.tenant_name,
      room_number: req.body.room_number,
      payment_date: req.body.payment_date || new Date().toISOString().split('T')[0],
      billing_month: req.body.billing_month,
      rent_amount: Number(req.body.rent_amount || 0),
      electricity_amount: Number(req.body.electricity_amount || 0),
      other_charges: Number(req.body.other_charges || 0),
      adjustments: Number(req.body.adjustments || 0),
      total_amount: Number(req.body.total_amount),
      amount_paid: Number(req.body.amount_paid),
      payment_method: req.body.payment_method,
      transaction_id: req.body.transaction_id || '',
      notes: req.body.notes || '',
      status: req.body.status || 'paid',
      due_date: req.body.due_date || new Date().toISOString().split('T')[0],
      created_date: new Date().toISOString().split('T')[0],
      created_by: req.body.created_by || 'admin'
    };

    payments.push(newPayment);

    // Update corresponding bill
    const bill = bills.find(b => b.tenant_id === newPayment.tenant_id && b.billing_month === newPayment.billing_month);
    if (bill) {
      bill.amount_paid += newPayment.amount_paid;
      bill.balance_due = bill.total_amount - bill.amount_paid;
      bill.payments.push(newPayment);
      
      if (bill.balance_due <= 0) {
        bill.status = 'paid';
      } else if (bill.amount_paid > 0) {
        bill.status = 'partial';
      }
    }

    res.status(201).json(newPayment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to record payment' });
  }
});

// GET /api/payments/tenant/:tenantId - Get payments for specific tenant
router.get('/tenant/:tenantId', async (req: Request, res: Response) => {
  try {
    const tenantPayments = payments.filter(p => p.tenant_id === req.params.tenantId);
    const tenantBills = bills.filter(b => b.tenant_id === req.params.tenantId);

    const summary = {
      total_paid: tenantPayments.reduce((sum, p) => sum + p.amount_paid, 0),
      total_due: tenantBills.reduce((sum, b) => sum + b.balance_due, 0),
      last_payment_date: tenantPayments.length > 0 
        ? tenantPayments.sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime())[0].payment_date
        : null,
      payments: tenantPayments.sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime()),
      bills: tenantBills.sort((a, b) => b.billing_month.localeCompare(a.billing_month))
    };

    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tenant payments' });
  }
});

// GET /api/payments/receipt/:paymentId - Generate payment receipt
router.get('/receipt/:paymentId', async (req: Request, res: Response) => {
  try {
    const payment = payments.find(p => p.id === req.params.paymentId);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const receipt = {
      payment,
      receipt_number: `SSR-${payment.id.slice(-8).toUpperCase()}`,
      generated_date: new Date().toISOString(),
      pg_details: {
        name: 'Shiv Shiva Residency',
        address: 'Your PG Address',
        phone: 'Your Phone Number',
        email: 'your@email.com'
      }
    };

    res.json(receipt);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate receipt' });
  }
});

// PUT /api/payments/:id - Update payment
router.put('/:id', validatePayment, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const paymentIndex = payments.findIndex(p => p.id === req.params.id);
    if (paymentIndex === -1) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    payments[paymentIndex] = {
      ...payments[paymentIndex],
      ...req.body,
      amount_paid: Number(req.body.amount_paid),
      total_amount: Number(req.body.total_amount)
    };

    res.json(payments[paymentIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update payment' });
  }
});

// DELETE /api/payments/:id - Delete payment
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const paymentIndex = payments.findIndex(p => p.id === req.params.id);
    if (paymentIndex === -1) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const deletedPayment = payments.splice(paymentIndex, 1)[0];

    // Update corresponding bill
    const bill = bills.find(b => b.tenant_id === deletedPayment.tenant_id && b.billing_month === deletedPayment.billing_month);
    if (bill) {
      bill.amount_paid -= deletedPayment.amount_paid;
      bill.balance_due = bill.total_amount - bill.amount_paid;
      bill.payments = bill.payments.filter(p => p.id !== deletedPayment.id);
      
      if (bill.balance_due > 0) {
        bill.status = bill.amount_paid > 0 ? 'partial' : 'pending';
      }
    }

    res.json({ message: 'Payment deleted successfully', payment: deletedPayment });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete payment' });
  }
});

export default router;