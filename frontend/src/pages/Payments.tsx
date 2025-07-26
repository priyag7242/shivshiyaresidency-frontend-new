import { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  IndianRupee, 
  Calendar, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Download,
  FileText,
  User,
  Home,
  CreditCard,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  XCircle,
  Smartphone,
  Building2,
  DollarSign,
  Zap,
  Receipt,
  MessageCircle,
  Printer,
  Phone,
  Copy,
  Info,
  ArrowUpRight,
  Settings
} from 'lucide-react';
import axios from 'axios';
import BillTemplate from '../components/BillTemplate';
import { paymentsQueries, tenantsQueries, roomsQueries } from '../lib/supabaseQueries';
import { supabase } from '../lib/supabase';
import AutoReminderSystem from '../components/AutoReminderSystem';

const apiUrl = import.meta.env.VITE_API_URL || '';
const USE_SUPABASE = true;

interface Payment {
  id: string;
  tenant_id: string;
  tenant_name: string;
  room_number: string;
  payment_date: string;
  billing_month: string;
  rent_amount: number;
  electricity_amount: number;
  other_charges: number;
  adjustments: number;
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

interface Bill {
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
  payments: Payment[];
}

interface PaymentStats {
  total_collected: number;
  this_month_collected: number;
  this_year_collected: number;
  pending_amount: number;
  overdue_amount: number;
  total_bills: number;
  paid_bills: number;
  pending_bills: number;
  overdue_bills: number;
  payment_methods: {
    cash: number;
    upi: number;
    bank_transfer: number;
    card: number;
  };
  monthly_collection: { [key: string]: number };
}

const Payments = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showBillModal, setShowBillModal] = useState(false);
  const [showWhatsAppBill, setShowWhatsAppBill] = useState(false);
  const [whatsAppBill, setWhatsAppBill] = useState<any>(null);
  const [showBillTemplate, setShowBillTemplate] = useState(false);
  const [selectedBill, setSelectedBill] = useState<any>(null);
  const [stats, setStats] = useState<PaymentStats>({
    total_collected: 0,
    this_month_collected: 0,
    this_year_collected: 0,
    pending_amount: 0,
    overdue_amount: 0,
    total_bills: 0,
    paid_bills: 0,
    pending_bills: 0,
    overdue_bills: 0,
    payment_methods: { cash: 0, upi: 0, bank_transfer: 0, card: 0 },
    monthly_collection: {}
  });

  const [rooms, setRooms] = useState<any[]>([]);
  const [currentReadings, setCurrentReadings] = useState<{ [roomNumber: string]: string }>({});
  const [joiningReadings, setJoiningReadings] = useState<{ [roomNumber: string]: string }>({});
  const [generating, setGenerating] = useState(false);

  const [billGeneration, setBillGeneration] = useState({
    billing_month: new Date().toISOString().slice(0, 7),
    electricity_rate: '12'
  });

  useEffect(() => {
    fetchData();
    fetchRooms();
    
    // Add sample data for testing if no data exists
    setTimeout(() => {
      if (payments.length === 0 && bills.length === 0) {
        console.log('No data found, adding sample data for testing...');
        const sampleBills = [
          {
            id: '1',
            tenant_id: '1',
            tenant_name: 'Sample Tenant',
            room_number: '101',
            billing_month: '2025-07',
            rent_amount: 5000,
            electricity_units: 50,
            electricity_rate: 12,
            electricity_amount: 600,
            other_charges: 0,
            adjustments: 0,
            total_amount: 5600,
            amount_paid: 0,
            balance_due: 5600,
            due_date: '2025-07-31',
            status: 'pending' as const,
            generated_date: '2025-07-01',
            payments: []
          }
        ];
        setBills(sampleBills);
      }
    }, 2000);
  }, [monthFilter, statusFilter, methodFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchPayments(),
        fetchBills(),
        fetchStats()
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPayments = async () => {
    try {
      console.log('Fetching payments...');
      if (USE_SUPABASE) {
        let query = supabase.from('payments').select('*');
        
        if (monthFilter) query = query.eq('billing_month', monthFilter);
        if (statusFilter) query = query.eq('status', statusFilter);
        if (methodFilter) query = query.eq('payment_method', methodFilter);
        
        const { data, error } = await query;
        if (error) throw error;
        console.log('Payments data:', data);
        setPayments(data || []);
      } else {
        const params = new URLSearchParams();
        if (monthFilter) params.append('billing_month', monthFilter);
        if (statusFilter) params.append('status', statusFilter);
        if (methodFilter) params.append('payment_method', methodFilter);
        
        const response = await axios.get(`${apiUrl}/payments?${params}`);
        setPayments(response.data.payments || []);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  const fetchBills = async () => {
    try {
      console.log('Fetching bills...');
      if (USE_SUPABASE) {
        let query = supabase.from('payments').select('*');
        
        if (monthFilter) query = query.eq('billing_month', monthFilter);
        if (statusFilter) query = query.eq('status', statusFilter);
        
        const { data, error } = await query;
        if (error) throw error;
        console.log('Bills data:', data);
        setBills(data || []);
      } else {
        const params = new URLSearchParams();
        if (monthFilter) params.append('billing_month', monthFilter);
        if (statusFilter) params.append('status', statusFilter);
        
        const response = await axios.get(`${apiUrl}/bills?${params}`);
        setBills(response.data.bills || []);
      }
    } catch (error) {
      console.error('Error fetching bills:', error);
    }
  };

  const fetchStats = async () => {
    try {
      if (USE_SUPABASE) {
        const { data: paymentsData, error: paymentsError } = await supabase
          .from('payments')
          .select('*');
        
        if (paymentsError) throw paymentsError;
        
        const payments = paymentsData || [];
        const today = new Date();
        const currentMonth = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0');
        const currentYear = today.getFullYear().toString();
        
        const stats: PaymentStats = {
          total_collected: payments.reduce((sum, p) => sum + (p.amount_paid || 0), 0),
          this_month_collected: payments
            .filter(p => p.billing_month === currentMonth)
            .reduce((sum, p) => sum + (p.amount_paid || 0), 0),
          this_year_collected: payments
            .filter(p => p.billing_month?.startsWith(currentYear))
            .reduce((sum, p) => sum + (p.amount_paid || 0), 0),
          pending_amount: payments
            .filter(p => p.status === 'pending')
            .reduce((sum, p) => sum + (p.total_amount - (p.amount_paid || 0)), 0),
          overdue_amount: payments
            .filter(p => p.status === 'overdue')
            .reduce((sum, p) => sum + (p.total_amount - (p.amount_paid || 0)), 0),
          total_bills: payments.length,
          paid_bills: payments.filter(p => p.status === 'paid').length,
          pending_bills: payments.filter(p => p.status === 'pending').length,
          overdue_bills: payments.filter(p => p.status === 'overdue').length,
          payment_methods: {
            cash: payments.filter(p => p.payment_method === 'cash').length,
            upi: payments.filter(p => p.payment_method === 'upi').length,
            bank_transfer: payments.filter(p => p.payment_method === 'bank_transfer').length,
            card: payments.filter(p => p.payment_method === 'card').length
          },
          monthly_collection: {}
        };
        
        setStats(stats);
      } else {
        const response = await axios.get(`${apiUrl}/payments/stats`);
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchRooms = async () => {
    try {
      console.log('Fetching rooms...');
      
      if (USE_SUPABASE) {
        // First try to get rooms with tenant info
        const { data: roomsWithTenants, error: roomsError } = await supabase
          .from('rooms')
          .select(`
            *,
            tenants:tenants(*)
          `);
        
        if (roomsError) {
          console.error('Error fetching rooms with tenants:', roomsError);
          // Fallback to just rooms
          const data = await roomsQueries.getAll();
          setRooms(data || []);
        } else {
          console.log('Rooms with tenants:', roomsWithTenants);
          
          // Transform data to include current tenant info
          const transformedRooms = roomsWithTenants?.map(room => ({
            ...room,
            current_tenant: room.tenants?.[0]?.name || 'No tenant',
            tenant_id: room.tenants?.[0]?.id || null,
            last_electricity_reading: room.tenants?.[0]?.last_electricity_reading || 0,
            electricity_joining_reading: room.tenants?.[0]?.electricity_joining_reading || 0
          })) || [];
          
          setRooms(transformedRooms);
        }
      } else {
        const response = await axios.get(`${apiUrl}/rooms`);
        setRooms(response.data.rooms || []);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const updateElectricityReadings = async () => {
    try {
      console.log('Updating electricity readings...');
      
      for (const [roomNumber, reading] of Object.entries(currentReadings)) {
        if (reading) {
          const { error } = await supabase
            .from('tenants')
            .update({ last_electricity_reading: parseInt(reading) })
            .eq('room_number', roomNumber);
          
          if (error) {
            console.error(`Error updating reading for room ${roomNumber}:`, error);
          }
        }
      }
      
      alert('Electricity readings updated successfully!');
      setCurrentReadings({});
      fetchRooms();
    } catch (error) {
      console.error('Error updating electricity readings:', error);
      alert('Failed to update electricity readings');
    }
  };

  const generateBills = async () => {
    try {
      setGenerating(true);
      console.log('Generating bills...');
      
      // First, let's check if there are any tenants at all
      const { data: allTenants, error: allTenantsError } = await supabase
        .from('tenants')
        .select('*');
      
      if (allTenantsError) throw allTenantsError;
      
      console.log('All tenants:', allTenants);
      
      // Now get active tenants
      const { data: tenants, error: tenantsError } = await supabase
        .from('tenants')
        .select('*')
        .eq('status', 'active');
      
      if (tenantsError) throw tenantsError;
      
      console.log('Active tenants:', tenants);
      
      // If no active tenants, try to get any tenants
      const tenantsToProcess = tenants && tenants.length > 0 ? tenants : allTenants;
      
      if (!tenantsToProcess || tenantsToProcess.length === 0) {
        alert('No tenants found in database. Please add tenants first.');
        return;
      }
      
      let generatedCount = 0;
      
      for (const tenant of tenantsToProcess) {
        try {
          console.log('Processing tenant:', tenant);
          
          const electricityUnits = (tenant.last_electricity_reading || 0) - (tenant.electricity_joining_reading || 0);
          const electricityAmount = electricityUnits * parseFloat(billGeneration.electricity_rate);
          const totalAmount = (tenant.monthly_rent || 0) + electricityAmount;
          
          const billData = {
            tenant_id: tenant.id,
            tenant_name: tenant.name,
            room_number: tenant.room_number,
            billing_month: billGeneration.billing_month,
            rent_amount: tenant.monthly_rent || 0,
            electricity_units: electricityUnits,
            electricity_rate: parseFloat(billGeneration.electricity_rate),
            electricity_amount: electricityAmount,
            other_charges: 0,
            adjustments: 0,
            total_amount: totalAmount,
            amount_paid: 0,
            balance_due: totalAmount,
            due_date: new Date().toISOString().split('T')[0],
            status: 'pending' as const,
            created_date: new Date().toISOString(),
            created_by: 'system'
          };
          
          console.log('Inserting bill data:', billData);
          
          const { error: insertError } = await supabase
            .from('payments')
            .insert(billData);
          
          if (insertError) {
            console.error(`Error generating bill for ${tenant.name}:`, insertError);
          } else {
            generatedCount++;
            console.log(`Successfully generated bill for ${tenant.name}`);
          }
        } catch (error) {
          console.error(`Error processing tenant ${tenant.name}:`, error);
        }
      }
      
      alert(`Generated ${generatedCount} bills successfully!`);
      fetchData();
      
    } catch (error) {
      console.error('Error generating bills:', error);
      alert('Failed to generate bills: ' + (error as Error).message);
    } finally {
      setGenerating(false);
    }
  };

  const recordPayment = async (paymentData: any) => {
    try {
      const { error } = await supabase
        .from('payments')
        .insert(paymentData);
      
      if (error) throw error;
      
      alert('Payment recorded successfully!');
      setShowPaymentModal(false);
      fetchData();
    } catch (error) {
      console.error('Error recording payment:', error);
      alert('Failed to record payment');
    }
  };

  const openWhatsAppBill = (bill: any) => {
    setWhatsAppBill(bill);
    setShowWhatsAppBill(true);
  };

  const viewBillTemplate = (bill: any) => {
    setSelectedBill(bill);
    setShowBillTemplate(true);
  };

  const printBill = (bill: any) => {
    setSelectedBill(bill);
    setShowBillTemplate(true);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const formatCurrency = (amount: number) => {
    if (!amount || isNaN(amount)) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'text-green-400 bg-green-400/10 border-green-400/30';
      case 'partial':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
      case 'pending':
        return 'text-orange-400 bg-orange-400/10 border-orange-400/30';
      case 'overdue':
        return 'text-red-400 bg-red-400/10 border-red-400/30';
      default:
        return 'text-golden-400 bg-golden-400/10 border-golden-400/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4" />;
      case 'partial':
        return <Clock className="h-4 w-4" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4" />;
      case 'overdue':
        return <XCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'upi':
        return <Smartphone className="h-4 w-4" />;
      case 'bank_transfer':
        return <Building2 className="h-4 w-4" />;
      case 'card':
        return <CreditCard className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const filteredPayments = payments.filter(payment =>
    payment.tenant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.room_number.includes(searchTerm)
  );

  const filteredBills = bills.filter(bill =>
    bill.tenant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bill.room_number.includes(searchTerm)
  );

  const createSampleTenants = async () => {
    try {
      console.log('Creating sample tenants...');
      
      const sampleTenants = [
        {
          name: 'PRACHI',
          mobile: '9876543210',
          room_number: '113',
          status: 'active',
          monthly_rent: 5500,
          security_deposit: 11000,
          last_electricity_reading: 250,
          electricity_joining_reading: 180,
          joining_date: '2025-01-01'
        },
        {
          name: 'SHIVAM VARMA',
          mobile: '9876543211',
          room_number: '217',
          status: 'active',
          monthly_rent: 6000,
          security_deposit: 12000,
          last_electricity_reading: 320,
          electricity_joining_reading: 250,
          joining_date: '2025-01-01'
        },
        {
          name: 'DOLLY',
          mobile: '9876543212',
          room_number: '105',
          status: 'active',
          monthly_rent: 5000,
          security_deposit: 10000,
          last_electricity_reading: 180,
          electricity_joining_reading: 120,
          joining_date: '2025-01-01'
        },
        {
          name: 'VISHAL M',
          mobile: '9876543213',
          room_number: '101',
          status: 'active',
          monthly_rent: 5200,
          security_deposit: 10400,
          last_electricity_reading: 200,
          electricity_joining_reading: 150,
          joining_date: '2025-01-01'
        },
        {
          name: 'AMAN SRIVASTAV',
          mobile: '9876543214',
          room_number: '102',
          status: 'active',
          monthly_rent: 5800,
          security_deposit: 11600,
          last_electricity_reading: 280,
          electricity_joining_reading: 200,
          joining_date: '2025-01-01'
        }
      ];
      
      let createdCount = 0;
      
      for (const tenant of sampleTenants) {
        const { error } = await supabase
          .from('tenants')
          .insert(tenant);
        
        if (error) {
          console.error('Error creating sample tenant:', error);
        } else {
          createdCount++;
          console.log(`Sample tenant ${tenant.name} created successfully`);
        }
      }
      
      alert(`Created ${createdCount} sample tenants successfully!`);
      fetchRooms(); // Refresh rooms to show new tenants
      fetchData(); // Refresh all data
    } catch (error) {
      console.error('Error creating sample tenants:', error);
      alert('Failed to create sample tenants');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-golden-400 mb-2">Payment Management</h1>
            <p className="text-golden-300">Manage billing, payments, and financial tracking</p>
          </div>
          <div className="mt-4 lg:mt-0 flex gap-3">
            <button
              onClick={() => setShowPaymentModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-golden-500 to-golden-600 text-dark-900 rounded-lg hover:from-golden-600 hover:to-golden-700 transition-all duration-200 font-medium"
            >
              <Plus className="h-5 w-5" />
              Record Payment
            </button>
          </div>
        </div>
      </div>

      {/* Auto Reminder System */}
      <AutoReminderSystem onRefresh={fetchData} />

      {/* Bill Generation Section */}
      <div className="bg-dark-900 border border-golden-600/20 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-golden-400 flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Bill Generation & Electricity Management
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Electricity Readings */}
          <div className="space-y-4">
            <h4 className="text-golden-300 font-medium">Current Electricity Readings</h4>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {rooms.map((room: any) => (
                <div key={room.room_number} className="flex items-center gap-3 p-3 bg-dark-800 rounded-lg">
                  <div className="flex-1">
                    <div className="text-golden-100 font-medium">Room {room.room_number}</div>
                    <div className="text-golden-300 text-sm">
                      {room.current_tenant ? `Tenant: ${room.current_tenant}` : 'No tenant'}
                    </div>
                  </div>
                  <div className="w-32">
                    <input
                      type="number"
                      placeholder="Current reading"
                      className="w-full px-2 py-1 bg-dark-700 border border-golden-600/30 rounded text-golden-100 text-sm focus:outline-none focus:border-golden-500"
                      value={currentReadings[room.room_number] || ''}
                      onChange={(e) => setCurrentReadings({
                        ...currentReadings,
                        [room.room_number]: e.target.value
                      })}
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <button
              onClick={updateElectricityReadings}
              disabled={Object.keys(currentReadings).length === 0}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Update Electricity Readings
            </button>
          </div>

          {/* Bill Generation */}
          <div className="space-y-4">
            <h4 className="text-golden-300 font-medium">Generate Monthly Bills</h4>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-golden-300 mb-2">Billing Month</label>
                <input
                  type="month"
                  value={billGeneration.billing_month}
                  onChange={(e) => setBillGeneration({ ...billGeneration, billing_month: e.target.value })}
                  className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-golden-300 mb-2">Electricity Rate (₹/unit)</label>
                <input
                  type="number"
                  step="0.1"
                  value={billGeneration.electricity_rate}
                  onChange={(e) => setBillGeneration({ ...billGeneration, electricity_rate: e.target.value })}
                  className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
                  placeholder="Rate per unit (default: ₹12)"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={generateBills}
                  disabled={generating}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generating ? 'Generating...' : 'Generate Bills'}
                </button>
                
                <button
                  onClick={createSampleTenants}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
                  title="Create sample tenants for testing"
                >
                  Add Sample Tenants
                </button>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    console.log('Current rooms:', rooms);
                    console.log('Current bills:', bills);
                    console.log('Current payments:', payments);
                    alert('Check browser console for data details');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
                  title="Debug current data"
                >
                  Debug Data
                </button>
                
                <button
                  onClick={() => {
                    fetchRooms();
                    fetchData();
                    alert('Data refreshed!');
                  }}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors"
                  title="Refresh all data"
                >
                  Refresh Data
                </button>
              </div>
            </div>

            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <h5 className="text-blue-400 font-medium text-sm mb-2">💡 Electricity Sharing Logic:</h5>
              <ul className="text-blue-300 text-xs space-y-1">
                <li>• Room-wise consumption = Current Reading - Joining Reading</li>
                <li>• Cost splits equally among tenants in same room</li>
                <li>• Rate: ₹{billGeneration.electricity_rate}/unit</li>
                <li>• When tenant changes room, update joining reading</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div 
          className="bg-dark-900 border border-golden-600/20 rounded-lg p-6 hover:bg-dark-800 hover:border-golden-500 transition-all duration-200 cursor-pointer group"
          onClick={() => {
            setStatusFilter('');
            setMonthFilter('');
            setMethodFilter('');
            setSearchTerm('');
            console.log('Clicked Total Collected card - showing all payments');
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-golden-300 text-sm font-medium">Total Collected</p>
              <p className="text-2xl font-bold text-green-400">{formatCurrency(stats.total_collected)}</p>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-8 w-8 text-green-400 group-hover:text-green-300 transition-colors" />
              <ArrowUpRight className="h-4 w-4 text-green-400/60 group-hover:text-green-300 transition-colors" />
            </div>
          </div>
        </div>

        <div 
          className="bg-dark-900 border border-golden-600/20 rounded-lg p-6 hover:bg-dark-800 hover:border-golden-500 transition-all duration-200 cursor-pointer group"
          onClick={() => {
            setStatusFilter('');
            setMonthFilter(new Date().toISOString().slice(0, 7));
            setMethodFilter('');
            setSearchTerm('');
            console.log('Clicked This Month card - filtering to current month');
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-golden-300 text-sm font-medium">This Month</p>
              <p className="text-2xl font-bold text-blue-400">{formatCurrency(stats.this_month_collected)}</p>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-8 w-8 text-blue-400 group-hover:text-blue-300 transition-colors" />
              <ArrowUpRight className="h-4 w-4 text-blue-400/60 group-hover:text-blue-300 transition-colors" />
            </div>
          </div>
        </div>

        <div 
          className="bg-dark-900 border border-golden-600/20 rounded-lg p-6 hover:bg-dark-800 hover:border-golden-500 transition-all duration-200 cursor-pointer group"
          onClick={() => {
            setStatusFilter('pending');
            setMonthFilter('');
            setMethodFilter('');
            setSearchTerm('');
            console.log('Clicked Pending Amount card - filtering to pending payments');
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-golden-300 text-sm font-medium">Pending Amount</p>
              <p className="text-2xl font-bold text-orange-400">{formatCurrency(stats.pending_amount)}</p>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-8 w-8 text-orange-400 group-hover:text-orange-300 transition-colors" />
              <ArrowUpRight className="h-4 w-4 text-orange-400/60 group-hover:text-orange-300 transition-colors" />
            </div>
          </div>
        </div>

        <div 
          className="bg-dark-900 border border-golden-600/20 rounded-lg p-6 hover:bg-dark-800 hover:border-golden-500 transition-all duration-200 cursor-pointer group"
          onClick={() => {
            setStatusFilter('overdue');
            setMonthFilter('');
            setMethodFilter('');
            setSearchTerm('');
            console.log('Clicked Overdue Amount card - filtering to overdue payments');
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-golden-300 text-sm font-medium">Overdue Amount</p>
              <p className="text-2xl font-bold text-red-400">{formatCurrency(stats.overdue_amount)}</p>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-8 w-8 text-red-400 group-hover:text-red-300 transition-colors" />
              <ArrowUpRight className="h-4 w-4 text-red-400/60 group-hover:text-red-300 transition-colors" />
            </div>
          </div>
        </div>
      </div>

      {/* Payment Method Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-dark-900 border border-golden-600/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-golden-400 mb-4 flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Methods
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(stats.payment_methods).map(([method, count]) => (
              <div key={method} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getPaymentMethodIcon(method)}
                  <span className="text-golden-300 capitalize">{method.replace('_', ' ')}</span>
                </div>
                <span className="text-golden-100 font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-dark-900 border border-golden-600/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-golden-400 mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Bill Status
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{stats.paid_bills}</div>
              <div className="text-sm text-golden-300">Paid Bills</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">{stats.pending_bills}</div>
              <div className="text-sm text-golden-300">Pending Bills</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{stats.total_bills - stats.paid_bills - stats.pending_bills - stats.overdue_bills}</div>
              <div className="text-sm text-golden-300">Partial Paid</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{stats.overdue_bills}</div>
              <div className="text-sm text-golden-300">Overdue Bills</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-golden-600/20 mb-6">
        {[
          { id: 'overview', label: 'Overview', icon: TrendingUp },
          { id: 'bills', label: 'Bills', icon: FileText },
          { id: 'payments', label: 'Payment History', icon: Receipt }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${
              activeTab === id
                ? 'border-golden-500 text-golden-400'
                : 'border-transparent text-golden-300 hover:text-golden-400'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-dark-900 border border-golden-600/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-golden-400 mb-4">Recent Payments</h3>
            {loading ? (
              <div className="text-center py-8 text-golden-400">Loading...</div>
            ) : filteredPayments.length === 0 ? (
              <div className="text-center py-8 text-golden-400/60">No payments found</div>
            ) : (
              <div className="space-y-4">
                {filteredPayments.slice(0, 5).map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 bg-dark-800 rounded-lg">
                    <div>
                      <h4 className="text-golden-100 font-medium">{payment.tenant_name}</h4>
                      <p className="text-golden-300 text-sm">Room {payment.room_number}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-400">{formatCurrency(payment.amount_paid)}</p>
                      <p className="text-sm text-golden-300">{payment.payment_date}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'bills' && (
        <div className="space-y-6">
          <div className="bg-dark-900 border border-golden-600/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-golden-400 mb-4">All Bills</h3>
            {loading ? (
              <div className="text-center py-8 text-golden-400">Loading...</div>
            ) : filteredBills.length === 0 ? (
              <div className="text-center py-8 text-golden-400/60">No bills found</div>
            ) : (
              <div className="space-y-4">
                {filteredBills.map((bill) => (
                  <div key={bill.id} className="flex items-center justify-between p-4 bg-dark-800 rounded-lg">
                    <div>
                      <h4 className="text-golden-100 font-medium">{bill.tenant_name}</h4>
                      <p className="text-golden-300 text-sm">Room {bill.room_number} • {bill.billing_month}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="text-lg font-bold text-golden-400">{formatCurrency(bill.total_amount)}</p>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${getStatusColor(bill.status)}`}>
                          {getStatusIcon(bill.status)}
                          {bill.status}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openWhatsAppBill(bill)}
                          className="p-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                          title="Send WhatsApp"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => viewBillTemplate(bill)}
                          className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                          title="View Bill"
                        >
                          <FileText className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => printBill(bill)}
                          className="p-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                          title="Print Bill"
                        >
                          <Printer className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="space-y-6">
          <div className="bg-dark-900 border border-golden-600/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-golden-400 mb-4">Payment History</h3>
            {loading ? (
              <div className="text-center py-8 text-golden-400">Loading...</div>
            ) : filteredPayments.length === 0 ? (
              <div className="text-center py-8 text-golden-400/60">No payments found</div>
            ) : (
              <div className="space-y-4">
                {filteredPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 bg-dark-800 rounded-lg">
                    <div>
                      <h4 className="text-golden-100 font-medium">{payment.tenant_name}</h4>
                      <p className="text-golden-300 text-sm">Room {payment.room_number} • {payment.payment_date}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-400">{formatCurrency(payment.amount_paid)}</p>
                        <div className="flex items-center gap-2">
                          {getPaymentMethodIcon(payment.payment_method)}
                          <span className="text-sm text-golden-300 capitalize">{payment.payment_method.replace('_', ' ')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      {showBillTemplate && selectedBill && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-dark-900 border border-golden-600/20 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-golden-400">Bill Template</h3>
              <button
                onClick={() => setShowBillTemplate(false)}
                className="text-golden-400 hover:text-golden-300"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <BillTemplate bill={selectedBill} />
          </div>
        </div>
      )}

      {showWhatsAppBill && whatsAppBill && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-dark-900 border border-golden-600/20 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-golden-400">WhatsApp Bill Preview</h3>
              <button
                onClick={() => setShowWhatsAppBill(false)}
                className="text-golden-400 hover:text-golden-300"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <div className="bg-green-600 text-white p-4 rounded-lg">
              <h4 className="font-medium mb-2">WhatsApp Message Preview:</h4>
              <div className="text-sm whitespace-pre-wrap">
                {`🏠 *Shiv Shiva Residency - Bill*\n\nDear ${whatsAppBill.tenant_name},\n\nYour bill for Room ${whatsAppBill.room_number} (${whatsAppBill.billing_month}) is ready.\n\n📅 Due Date: ${whatsAppBill.due_date}\n💰 Total Amount: ₹${formatCurrency(whatsAppBill.total_amount)}\n\nPlease make the payment on time.\n\nThank you,\nShiv Shiva Residency Team`}
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  const message = `🏠 *Shiv Shiva Residency - Bill*\n\nDear ${whatsAppBill.tenant_name},\n\nYour bill for Room ${whatsAppBill.room_number} (${whatsAppBill.billing_month}) is ready.\n\n📅 Due Date: ${whatsAppBill.due_date}\n💰 Total Amount: ₹${formatCurrency(whatsAppBill.total_amount)}\n\nPlease make the payment on time.\n\nThank you,\nShiv Shiva Residency Team`;
                  const encodedMessage = encodeURIComponent(message);
                  window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
                }}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                Send WhatsApp
              </button>
              <button
                onClick={() => {
                  const message = `🏠 *Shiv Shiva Residency - Bill*\n\nDear ${whatsAppBill.tenant_name},\n\nYour bill for Room ${whatsAppBill.room_number} (${whatsAppBill.billing_month}) is ready.\n\n📅 Due Date: ${whatsAppBill.due_date}\n💰 Total Amount: ₹${formatCurrency(whatsAppBill.total_amount)}\n\nPlease make the payment on time.\n\nThank you,\nShiv Shiva Residency Team`;
                  navigator.clipboard.writeText(message);
                  alert('Message copied to clipboard!');
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Copy className="h-4 w-4" />
                Copy Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments; 