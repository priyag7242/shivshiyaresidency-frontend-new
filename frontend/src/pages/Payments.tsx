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
  Copy
} from 'lucide-react';
import axios from 'axios';
import BillTemplate from '../components/BillTemplate';
import { paymentsQueries, tenantsQueries, roomsQueries } from '../lib/supabaseQueries';
import { supabase } from '../lib/supabase';

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

  const [rooms, setRooms] = useState<any[]>([]); // State to hold room data
  const [currentReadings, setCurrentReadings] = useState<{ [roomNumber: string]: string }>({}); // State to hold current readings
  const [joiningReadings, setJoiningReadings] = useState<{ [roomNumber: string]: string }>({}); // State to hold joining readings
  const [generating, setGenerating] = useState(false); // State to track bill generation process

  const [billGeneration, setBillGeneration] = useState({
    billing_month: new Date().toISOString().slice(0, 7),
    electricity_rate: '12' // Default rate
  });

  useEffect(() => {
    fetchData();
    fetchRooms(); // Fetch rooms on mount
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
      if (USE_SUPABASE) {
        let query = supabase.from('payments').select('*');
        
        if (monthFilter) query = query.eq('billing_month', monthFilter);
        if (statusFilter) query = query.eq('status', statusFilter);
        if (methodFilter) query = query.eq('payment_method', methodFilter);
        
        const { data, error } = await query;
        if (error) throw error;
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
      if (USE_SUPABASE) {
        let query = supabase.from('payments').select('*');
        
        if (monthFilter) query = query.eq('billing_month', monthFilter);
        if (statusFilter) query = query.eq('status', statusFilter);
        
        const { data, error } = await query;
        if (error) throw error;
        setBills(data || []);
      } else {
        const params = new URLSearchParams();
        if (monthFilter) params.append('billing_month', monthFilter);
        if (statusFilter) params.append('status', statusFilter);
        
        const response = await axios.get(`${apiUrl}/payments/bills?${params}`);
        setBills(response.data.bills || []);
      }
    } catch (error) {
      console.error('Error fetching bills:', error);
    }
  };

  const fetchStats = async () => {
    try {
      if (USE_SUPABASE) {
        // Get all payments data
        const { data: payments, error: paymentsError } = await supabase
          .from('payments')
          .select('*');
        
        if (paymentsError) throw paymentsError;
        
        const paymentsData = payments || [];
        
        // Calculate stats from payments data
        const currentMonth = new Date().toISOString().slice(0, 7);
        const currentYear = new Date().getFullYear();
        
        const stats: PaymentStats = {
          total_collected: paymentsData.reduce((sum, p) => sum + (p.amount_paid || 0), 0),
          this_month_collected: paymentsData
            .filter(p => p.billing_month === currentMonth)
            .reduce((sum, p) => sum + (p.amount_paid || 0), 0),
          this_year_collected: paymentsData
            .filter(p => p.billing_month?.startsWith(currentYear.toString()))
            .reduce((sum, p) => sum + (p.amount_paid || 0), 0),
          pending_amount: paymentsData
            .filter(p => p.status === 'pending')
            .reduce((sum, p) => sum + (p.balance_due || 0), 0),
          overdue_amount: paymentsData
            .filter(p => p.status === 'overdue')
            .reduce((sum, p) => sum + (p.balance_due || 0), 0),
          total_bills: paymentsData.length,
          paid_bills: paymentsData.filter(p => p.status === 'paid').length,
          pending_bills: paymentsData.filter(p => p.status === 'pending').length,
          overdue_bills: paymentsData.filter(p => p.status === 'overdue').length,
          payment_methods: {
            cash: paymentsData.filter(p => p.payment_method === 'cash').length,
            upi: paymentsData.filter(p => p.payment_method === 'upi').length,
            bank_transfer: paymentsData.filter(p => p.payment_method === 'bank_transfer').length,
            card: paymentsData.filter(p => p.payment_method === 'card').length
          },
          monthly_collection: {}
        };
        
        // Calculate monthly collection
        paymentsData.forEach(payment => {
          if (payment.billing_month && payment.amount_paid) {
            if (!stats.monthly_collection[payment.billing_month]) {
              stats.monthly_collection[payment.billing_month] = 0;
            }
            stats.monthly_collection[payment.billing_month] += payment.amount_paid;
          }
        });
        
        setStats(stats);
      } else {
        const response = await axios.get(`${apiUrl}/payments/stats`);
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchRooms = async () => {
    try {
      if (USE_SUPABASE) {
        const { data, error } = await supabase.from('rooms').select('*');
        if (error) throw error;
        setRooms(data || []);
      } else {
        const response = await axios.get(`${apiUrl}/rooms`);
        setRooms(response.data.rooms || []);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const updateElectricityReadings = async () => {
    const readingsToUpdate = Object.entries(currentReadings)
      .filter(([_, reading]) => reading && reading.trim() !== '')
      .reduce((acc, [roomNumber, reading]) => {
        acc[roomNumber] = Number(reading);
        return acc;
      }, {} as { [key: string]: number });

    if (Object.keys(readingsToUpdate).length === 0) {
      alert('Please enter at least one electricity reading');
      return;
    }

    try {
      setGenerating(true);
      const response = await axios.post(`${apiUrl}/payments/electricity/update`, {
        room_readings: readingsToUpdate
      });
      
      alert(`Updated electricity readings for ${response.data.total_tenants_updated} tenants`);
      setCurrentReadings({}); // Clear inputs after successful update
      fetchData(); // Refresh data to reflect updated readings
    } catch (error: any) {
      console.error('Error updating electricity readings:', error);
      alert(error.response?.data?.error || 'Failed to update electricity readings');
    } finally {
      setGenerating(false);
    }
  };

  const generateBills = async () => {
    try {
      setGenerating(true);
      console.log('Starting bill generation...');
      
      if (USE_SUPABASE) {
        console.log('Using Supabase for bill generation');
        
        // Get all active tenants
        const { data: tenants, error: tenantsError } = await supabase
          .from('tenants')
          .select('*')
          .eq('status', 'active');
        
        if (tenantsError) {
          console.error('Error fetching tenants:', tenantsError);
          throw tenantsError;
        }
        
        console.log('Fetched tenants:', tenants?.length || 0);
        
        if (!tenants || tenants.length === 0) {
          alert('No active tenants found. Please add tenants first.');
          return;
        }

        // Check if bills already exist for this month
        const { data: existingBills, error: billsError } = await supabase
          .from('payments')
          .select('*')
          .eq('billing_month', billGeneration.billing_month);
        
        if (billsError) {
          console.error('Error checking existing bills:', billsError);
          throw billsError;
        }
        
        console.log('Existing bills for this month:', existingBills?.length || 0);
        
        if (existingBills && existingBills.length > 0) {
          const confirmed = confirm(`Bills for ${billGeneration.billing_month} already exist. Do you want to generate new bills? This will create duplicates.`);
          if (!confirmed) return;
        }

        const electricityRate = Number(billGeneration.electricity_rate);
        const generatedBills = [];

        // Group tenants by room for electricity sharing
        const roomGroups: { [roomNumber: string]: any[] } = {};
        tenants.forEach((tenant: any) => {
          if (!roomGroups[tenant.room_number]) {
            roomGroups[tenant.room_number] = [];
          }
          roomGroups[tenant.room_number].push(tenant);
        });

        console.log('Room groups:', Object.keys(roomGroups));

        // Generate bills for each room
        for (const [roomNumber, roomTenants] of Object.entries(roomGroups)) {
          console.log(`Processing room ${roomNumber} with ${roomTenants.length} tenants`);
          
          // Get current electricity reading for this room
          const currentReading = currentReadings[roomNumber] || 
            (roomTenants[0].last_electricity_reading || roomTenants[0].electricity_joining_reading) + Math.floor(Math.random() * 100) + 50;

          // Calculate total consumption for the room
          const roomJoiningReading = Math.max(...roomTenants.map((t: any) => t.electricity_joining_reading || 0));
          const totalUnitsConsumed = Math.max(0, currentReading - roomJoiningReading);
          const totalElectricityCost = totalUnitsConsumed * electricityRate;

          console.log(`Room ${roomNumber}: Current=${currentReading}, Joining=${roomJoiningReading}, Units=${totalUnitsConsumed}, Cost=${totalElectricityCost}`);

          // Split electricity cost among tenants in the room
          const unitsPerTenant = Math.floor(totalUnitsConsumed / roomTenants.length);
          const costPerTenant = Math.floor(totalElectricityCost / roomTenants.length);

          // Generate bill for each tenant in the room
          for (let i = 0; i < roomTenants.length; i++) {
            const tenant = roomTenants[i];
            const isLastTenant = i === roomTenants.length - 1;
            
            const tenantUnits = isLastTenant ? 
              totalUnitsConsumed - (unitsPerTenant * (roomTenants.length - 1)) : 
              unitsPerTenant;
            const tenantElectricityCost = isLastTenant ? 
              totalElectricityCost - (costPerTenant * (roomTenants.length - 1)) : 
              costPerTenant;

            const totalAmount = tenant.monthly_rent + tenantElectricityCost;

            const billData = {
              tenant_id: tenant.id,
              tenant_name: tenant.name,
              room_number: tenant.room_number,
              billing_month: billGeneration.billing_month,
              rent_amount: tenant.monthly_rent,
              electricity_units: tenantUnits,
              electricity_rate: electricityRate,
              electricity_amount: tenantElectricityCost,
              other_charges: 0,
              adjustments: 0,
              total_amount: totalAmount,
              amount_paid: 0,
              balance_due: totalAmount,
              due_date: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString().split('T')[0],
              status: 'pending',
              generated_date: new Date().toISOString().split('T')[0],
              payment_method: 'pending',
              payment_date: null,
              transaction_id: null,
              notes: null
            };

            console.log(`Creating bill for tenant ${tenant.name}:`, billData);

            const { data: newBill, error: billError } = await supabase
              .from('payments')
              .insert([billData])
              .select()
              .single();

            if (billError) {
              console.error('Error creating bill:', billError);
              throw billError;
            }
            
            console.log('Bill created successfully:', newBill);
            generatedBills.push(newBill);

            // Update tenant's last electricity reading
            const { error: updateError } = await supabase
              .from('tenants')
              .update({ last_electricity_reading: currentReading })
              .eq('id', tenant.id);
              
            if (updateError) {
              console.error('Error updating tenant electricity reading:', updateError);
            }
          }
        }

        console.log(`Successfully generated ${generatedBills.length} bills`);
        alert(`Generated ${generatedBills.length} bills for ${billGeneration.billing_month}`);
        fetchData();
      } else {
        const response = await axios.post(`${apiUrl}/payments/bills/generate`, {
          billing_month: billGeneration.billing_month,
          electricity_rate: billGeneration.electricity_rate
        });
        
        alert(`Generated ${response.data.bills?.length || 0} bills for ${billGeneration.billing_month}`);
        fetchData();
      }
    } catch (error: any) {
      console.error('Error generating bills:', error);
      alert(error.response?.data?.error || error.message || 'Failed to generate bills');
    } finally {
      setGenerating(false);
    }
  };

  const recordPayment = async (paymentData: any) => {
    try {
      if (USE_SUPABASE) {
        const { error } = await supabase
          .from('payments')
          .insert([paymentData]);
        
        if (error) throw error;
        fetchData();
        setShowPaymentModal(false);
        setSelectedBill(null);
      } else {
        await axios.post(`${apiUrl}/payments`, paymentData);
        fetchData();
        setShowPaymentModal(false);
        setSelectedBill(null);
      }
    } catch (error: any) {
      console.error('Error recording payment:', error);
      alert(error.response?.data?.error || 'Failed to record payment');
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
    // Trigger print after a short delay to ensure modal is rendered
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const formatCurrency = (amount: number) => {
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
        return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
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

                  <button
                    onClick={generateBills}
                    disabled={!billGeneration.billing_month || generating}
                    className="w-full px-4 py-2 bg-gradient-to-r from-golden-500 to-golden-600 text-dark-900 rounded-lg hover:from-golden-600 hover:to-golden-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {generating ? (
                      <div className="flex items-center gap-2 justify-center">
                        <div className="w-4 h-4 border-2 border-dark-900/30 border-t-dark-900 rounded-full animate-spin"></div>
                        Generating Bills...
                      </div>
                    ) : (
                      'Generate Bills'
                    )}
                  </button>
                </div>
              </div>
            </div>
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-dark-900 border border-golden-600/20 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-golden-300 text-sm font-medium">Total Collected</p>
              <p className="text-2xl font-bold text-green-400">{formatCurrency(stats.total_collected)}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div className="bg-dark-900 border border-golden-600/20 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-golden-300 text-sm font-medium">This Month</p>
              <p className="text-2xl font-bold text-blue-400">{formatCurrency(stats.this_month_collected)}</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-dark-900 border border-golden-600/20 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-golden-300 text-sm font-medium">Pending Amount</p>
              <p className="text-2xl font-bold text-orange-400">{formatCurrency(stats.pending_amount)}</p>
            </div>
            <Clock className="h-8 w-8 text-orange-400" />
          </div>
        </div>

        <div className="bg-dark-900 border border-golden-600/20 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-golden-300 text-sm font-medium">Overdue Amount</p>
              <p className="text-2xl font-bold text-red-400">{formatCurrency(stats.overdue_amount)}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-400" />
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
            className={`flex items-center gap-2 px-6 py-3 transition-colors ${
              activeTab === id
                ? 'text-golden-400 border-b-2 border-golden-400'
                : 'text-golden-300 hover:text-golden-100'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="bg-dark-900 border border-golden-600/20 rounded-lg p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-golden-400" />
            <input
              type="text"
              placeholder="Search tenants or rooms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 placeholder-golden-400/50 focus:outline-none focus:border-golden-500"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <input
              type="month"
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
            >
              <option value="">All Status</option>
              <option value="paid">Paid</option>
              <option value="partial">Partial</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>

            {activeTab === 'payments' && (
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
              >
                <option value="">All Methods</option>
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="card">Card</option>
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'overview' && (
        <div className="bg-dark-900 border border-golden-600/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-golden-400 mb-4">Monthly Collection Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(stats.monthly_collection || {}).slice(-12).map(([month, amount]) => (
              <div key={month} className="bg-dark-800 border border-golden-600/30 rounded-lg p-4">
                <div className="text-golden-300 text-sm">{new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</div>
                <div className="text-golden-100 font-bold text-lg">{formatCurrency(amount)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'bills' && (
        <div className="bg-dark-900 border border-golden-600/20 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-800 border-b border-golden-600/20">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-golden-400">Tenant & Room</th>
                  <th className="text-left py-3 px-4 font-medium text-golden-400">Billing Month</th>
                  <th className="text-left py-3 px-4 font-medium text-golden-400">Amount Details</th>
                  <th className="text-left py-3 px-4 font-medium text-golden-400">Total & Paid</th>
                  <th className="text-left py-3 px-4 font-medium text-golden-400">Balance Due</th>
                  <th className="text-left py-3 px-4 font-medium text-golden-400">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-golden-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-golden-600/10">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-golden-400">Loading bills...</td>
                  </tr>
                ) : filteredBills.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-golden-400/60">No bills found</td>
                  </tr>
                ) : (
                  filteredBills.map((bill) => (
                    <tr key={bill.id} className="hover:bg-dark-800/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-medium text-golden-100">{bill.tenant_name}</div>
                        <div className="text-golden-300 text-sm">Room {bill.room_number}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-golden-100">
                          {new Date(bill.billing_month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-golden-100 text-sm">
                          <div>Rent: {formatCurrency(bill.rent_amount)}</div>
                          <div>Electricity: {formatCurrency(bill.electricity_amount)} ({bill.electricity_units} units)</div>
                          {bill.other_charges > 0 && <div>Other: {formatCurrency(bill.other_charges)}</div>}
                          {bill.adjustments !== 0 && <div>Adj: {formatCurrency(bill.adjustments)}</div>}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-golden-100">{formatCurrency(bill.total_amount)}</div>
                        <div className="text-green-400 text-sm">Paid: {formatCurrency(bill.amount_paid)}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className={`font-medium ${bill.balance_due > 0 ? 'text-red-400' : 'text-green-400'}`}>
                          {formatCurrency(bill.balance_due)}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${getStatusColor(bill.status)}`}>
                          {getStatusIcon(bill.status)}
                          {bill.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {bill.balance_due > 0 && (
                            <button
                              onClick={() => {
                                setSelectedBill(bill);
                                setShowPaymentModal(true);
                              }}
                              className="flex items-center gap-1 px-3 py-1 bg-golden-600 text-dark-900 text-sm rounded-lg hover:bg-golden-500 transition-colors"
                            >
                              <Plus className="h-3 w-3" />
                              Pay
                            </button>
                          )}
                          <button
                            onClick={() => openWhatsAppBill(bill)}
                            className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-500 transition-colors"
                            title="Send via WhatsApp"
                          >
                            <MessageCircle className="h-3 w-3" />
                            WhatsApp
                          </button>
                          <button
                            onClick={() => viewBillTemplate(bill)}
                            className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-500 transition-colors"
                            title="View Bill Template"
                          >
                            <FileText className="h-3 w-3" />
                            Template
                          </button>
                          <button
                            onClick={() => printBill(bill)}
                            className="flex items-center gap-1 px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-500 transition-colors"
                            title="Print Bill"
                          >
                            <Printer className="h-3 w-3" />
                            Print
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="bg-dark-900 border border-golden-600/20 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-800 border-b border-golden-600/20">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-golden-400">Tenant & Room</th>
                  <th className="text-left py-3 px-4 font-medium text-golden-400">Payment Date</th>
                  <th className="text-left py-3 px-4 font-medium text-golden-400">Billing Month</th>
                  <th className="text-left py-3 px-4 font-medium text-golden-400">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-golden-400">Method</th>
                  <th className="text-left py-3 px-4 font-medium text-golden-400">Transaction ID</th>
                  <th className="text-left py-3 px-4 font-medium text-golden-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-golden-600/10">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-golden-400">Loading payments...</td>
                  </tr>
                ) : filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-golden-400/60">No payments found</td>
                  </tr>
                ) : (
                  filteredPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-dark-800/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-medium text-golden-100">{payment.tenant_name}</div>
                        <div className="text-golden-300 text-sm">Room {payment.room_number}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-golden-100">
                          {new Date(payment.payment_date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-golden-100">
                          {new Date(payment.billing_month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-golden-100 font-medium">{formatCurrency(payment.amount_paid)}</div>
                        <div className="text-golden-400 text-sm">of {formatCurrency(payment.total_amount)}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {getPaymentMethodIcon(payment.payment_method)}
                          <span className="text-golden-100 capitalize">{payment.payment_method.replace('_', ' ')}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-golden-300 text-sm">
                          {payment.transaction_id || 'N/A'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={async () => {
                            try {
                              const response = await axios.get(`${apiUrl}/payments/receipt/${payment.id}`);
                              // Here you could open a receipt modal or download PDF
                              console.log('Receipt data:', response.data);
                              alert('Receipt feature will be implemented soon!');
                            } catch (error) {
                              console.error('Error generating receipt:', error);
                            }
                          }}
                          className="flex items-center gap-1 px-3 py-1 text-golden-400 border border-golden-600/30 text-sm rounded-lg hover:bg-golden-600/10 transition-colors"
                        >
                          <Receipt className="h-3 w-3" />
                          Receipt
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedBill(null);
          }}
          onSubmit={recordPayment}
          bill={selectedBill}
        />
      )}

      {/* WhatsApp Bill Modal */}
      {showWhatsAppBill && whatsAppBill && (
        <WhatsAppBillModal
          isOpen={showWhatsAppBill}
          onClose={() => {
            setShowWhatsAppBill(false);
            setWhatsAppBill(null);
          }}
          bill={whatsAppBill}
        />
      )}

      {/* Bill Template Modal */}
      {showBillTemplate && selectedBill && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Bill Receipt</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
                >
                  <Printer className="h-4 w-4" />
                  Print
                </button>
                <button
                  onClick={() => {
                    setShowBillTemplate(false);
                    setSelectedBill(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <BillTemplate bill={selectedBill} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Payment Modal Component
interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (paymentData: any) => void;
  bill?: Bill | null;
}

const PaymentModal = ({ isOpen, onClose, onSubmit, bill }: PaymentModalProps) => {
  const [formData, setFormData] = useState({
    tenant_id: '',
    tenant_name: '',
    room_number: '',
    billing_month: new Date().toISOString().slice(0, 7),
    rent_amount: 0,
    electricity_amount: 0,
    other_charges: 0,
    adjustments: 0,
    total_amount: 0,
    amount_paid: 0,
    payment_method: 'cash' as 'cash' | 'upi' | 'bank_transfer' | 'card',
    transaction_id: '',
    notes: '',
    payment_date: new Date().toISOString().split('T')[0]
  });

  const [tenants, setTenants] = useState<any[]>([]);
  const [selectedRoomTenant, setSelectedRoomTenant] = useState('');
  const [loadingTenants, setLoadingTenants] = useState(false);
  const [roomNumberInput, setRoomNumberInput] = useState('');
  const [fetchingFromRoom, setFetchingFromRoom] = useState(false);
  const [roomFetchMessage, setRoomFetchMessage] = useState('');
  const [selectionMethod, setSelectionMethod] = useState<'dropdown' | 'room_input'>('room_input');

  useEffect(() => {
    if (isOpen) {
      fetchTenants();
    }
  }, [isOpen]);

  useEffect(() => {
    if (bill) {
      setFormData({
        tenant_id: bill.tenant_id,
        tenant_name: bill.tenant_name,
        room_number: bill.room_number,
        billing_month: bill.billing_month,
        rent_amount: bill.rent_amount,
        electricity_amount: bill.electricity_amount,
        other_charges: bill.other_charges,
        adjustments: bill.adjustments,
        total_amount: bill.total_amount,
        amount_paid: bill.balance_due,
        payment_method: 'cash',
        transaction_id: '',
        notes: '',
        payment_date: new Date().toISOString().split('T')[0]
      });
      setSelectedRoomTenant(`${bill.room_number}-${bill.tenant_id}`);
      setRoomNumberInput(bill.room_number);
      setRoomFetchMessage(`✅ Bill for: ${bill.tenant_name}`);
    } else {
      // Reset form for new payment
      setFormData({
        tenant_id: '',
        tenant_name: '',
        room_number: '',
        billing_month: new Date().toISOString().slice(0, 7),
        rent_amount: 0,
        electricity_amount: 0,
        other_charges: 0,
        adjustments: 0,
        total_amount: 0,
        amount_paid: 0,
        payment_method: 'cash',
        transaction_id: '',
        notes: '',
        payment_date: new Date().toISOString().split('T')[0]
      });
      setSelectedRoomTenant('');
      setRoomNumberInput('');
      setRoomFetchMessage('');
    }
  }, [bill]);

  const fetchTenants = async () => {
    try {
      setLoadingTenants(true);
      if (USE_SUPABASE) {
        const { data, error } = await supabase.from('tenants').select('*');
        if (error) throw error;
        console.log('Fetched tenants from Supabase:', data?.length || 0);
        console.log('Sample tenant:', data?.[0]);
        setTenants(data || []);
      } else {
        const response = await axios.get(`${apiUrl}/tenants`);
        setTenants(response.data.tenants || []);
      }
    } catch (error) {
      console.error('Error fetching tenants:', error);
    } finally {
      setLoadingTenants(false);
    }
  };

  const fetchTenantByRoom = async (roomNumber: string) => {
    if (!roomNumber.trim()) {
      setRoomFetchMessage('');
      return;
    }

    try {
      setFetchingFromRoom(true);
      setRoomFetchMessage('🔍 Fetching tenant & bill details...');
      
      if (USE_SUPABASE) {
        // Fetch tenant data
        const { data: tenantData, error: tenantError } = await supabase
          .from('tenants')
          .select('*')
          .eq('room_number', roomNumber.trim())
          .eq('status', 'active')
          .single();
        
        if (tenantError) throw tenantError;
        
        if (tenantData) {
          // Fetch current bills for this tenant
          const { data: allBills, error: billsError } = await supabase
            .from('payments')
            .select('*')
            .eq('tenant_id', tenantData.id);
          
          if (billsError) throw billsError;
          
          // Find current month's bill for this tenant
          const currentMonth = new Date().toISOString().slice(0, 7);
          const currentBill = allBills?.find((bill: any) => 
            bill.billing_month === currentMonth &&
            bill.balance_due > 0
          );

          // Find any pending bills
          const pendingBills = allBills?.filter((bill: any) => 
            bill.balance_due > 0
          ) || [];

          const totalPendingDues = pendingBills.reduce((sum: number, bill: any) => sum + bill.balance_due, 0);

          if (currentBill) {
            // Pre-populate with current bill details
            setFormData(prev => ({
              ...prev,
              tenant_id: tenantData.id,
              tenant_name: tenantData.name,
              room_number: tenantData.room_number,
              billing_month: currentBill.billing_month,
              rent_amount: currentBill.rent_amount,
              electricity_amount: currentBill.electricity_amount,
              other_charges: currentBill.other_charges,
              adjustments: currentBill.adjustments,
              total_amount: currentBill.total_amount,
              amount_paid: currentBill.balance_due // Set to balance due as suggested payment
            }));
            
            setRoomFetchMessage(
              `✅ ${tenantData.name} | Current Bill: ₹${currentBill.balance_due}${
                pendingBills.length > 1 ? ` | Total Pending: ₹${totalPendingDues}` : ''
              }`
            );
          } else {
            // No current bill, just populate tenant details with standard rent
            setFormData(prev => ({
              ...prev,
              tenant_id: tenantData.id,
              tenant_name: tenantData.name,
              room_number: tenantData.room_number,
              rent_amount: tenantData.monthly_rent || 0,
              electricity_amount: 0,
              other_charges: 0,
              adjustments: 0,
              total_amount: tenantData.monthly_rent || 0,
              amount_paid: tenantData.monthly_rent || 0
            }));
            
            if (pendingBills.length > 0) {
              setRoomFetchMessage(
                `✅ ${tenantData.name} | No current bill | Pending Dues: ₹${totalPendingDues}`
              );
            } else {
              setRoomFetchMessage(
                `✅ ${tenantData.name} | No pending bills | Standard Rent: ₹${tenantData.monthly_rent || 0}`
              );
            }
          }
        }
      } else {
        // Fetch tenant data
        const tenantResponse = await axios.get(`${apiUrl}/tenants/room/${roomNumber.trim()}`);
        const tenantData = tenantResponse.data.tenant;
        
        if (tenantData) {
          // Fetch current bills for this tenant
          const billsResponse = await axios.get(`${apiUrl}/payments/bills`);
          const allBills = billsResponse.data.bills || [];
          
          // Find current month's bill for this tenant
          const currentMonth = new Date().toISOString().slice(0, 7);
          const currentBill = allBills.find((bill: any) => 
            bill.tenant_id === tenantData.id && 
            bill.billing_month === currentMonth &&
            bill.balance_due > 0
          );

          // Find any pending bills
          const pendingBills = allBills.filter((bill: any) => 
            bill.tenant_id === tenantData.id && 
            bill.balance_due > 0
          );

          const totalPendingDues = pendingBills.reduce((sum: number, bill: any) => sum + bill.balance_due, 0);

          if (currentBill) {
            // Pre-populate with current bill details
            setFormData(prev => ({
              ...prev,
              tenant_id: tenantData.id,
              tenant_name: tenantData.name,
              room_number: tenantData.room_number,
              billing_month: currentBill.billing_month,
              rent_amount: currentBill.rent_amount,
              electricity_amount: currentBill.electricity_amount,
              other_charges: currentBill.other_charges,
              adjustments: currentBill.adjustments,
              total_amount: currentBill.total_amount,
              amount_paid: currentBill.balance_due // Set to balance due as suggested payment
            }));
            
            setRoomFetchMessage(
              `✅ ${tenantData.name} | Current Bill: ₹${currentBill.balance_due}${
                pendingBills.length > 1 ? ` | Total Pending: ₹${totalPendingDues}` : ''
              }`
            );
          } else {
            // No current bill, just populate tenant details with standard rent
            setFormData(prev => ({
              ...prev,
              tenant_id: tenantData.id,
              tenant_name: tenantData.name,
              room_number: tenantData.room_number,
              rent_amount: tenantData.monthly_rent || 0,
              electricity_amount: 0,
              other_charges: 0,
              adjustments: 0,
              total_amount: tenantData.monthly_rent || 0,
              amount_paid: tenantData.monthly_rent || 0
            }));
            
            if (pendingBills.length > 0) {
              setRoomFetchMessage(
                `✅ ${tenantData.name} | No current bill | Pending Dues: ₹${totalPendingDues}`
              );
            } else {
              setRoomFetchMessage(
                `✅ ${tenantData.name} | No pending bills | Standard Rent: ₹${tenantData.monthly_rent || 0}`
              );
            }
          }
        }
      }
    } catch (error: any) {
      console.error('Error fetching tenant by room:', error);
      if (error.response?.status === 404) {
        setRoomFetchMessage(`❌ ${error.response.data.message || 'No active tenant found in this room'}`);
      } else {
        setRoomFetchMessage('❌ Error fetching tenant data');
      }
      
      // Clear tenant data if room not found
      setFormData(prev => ({
        ...prev,
        tenant_id: '',
        tenant_name: '',
        room_number: roomNumber.trim(),
        rent_amount: 0,
        electricity_amount: 0,
        other_charges: 0,
        adjustments: 0,
        total_amount: 0,
        amount_paid: 0
      }));
    } finally {
      setFetchingFromRoom(false);
    }
  };

  const handleRoomNumberChange = (value: string) => {
    setRoomNumberInput(value);
    
    // Auto-fetch when user types room number (with debounce effect)
    if (value.length >= 2) {
      const timeoutId = setTimeout(() => {
        fetchTenantByRoom(value);
      }, 500);
      
      return () => clearTimeout(timeoutId);
    } else {
      setRoomFetchMessage('');
      if (!value.trim()) {
        // Clear form if room number is empty
        setFormData(prev => ({
          ...prev,
          tenant_id: '',
          tenant_name: '',
          room_number: '',
          rent_amount: 0
        }));
      }
    }
  };

  const handleRoomTenantSelect = async (value: string) => {
    setSelectedRoomTenant(value);
    
    if (value) {
      const [roomNumber, tenantId] = value.split('-');
      const tenant = tenants.find(t => t.id === tenantId);
      
      if (tenant) {
        try {
          setFetchingFromRoom(true);
          setRoomFetchMessage('🔍 Loading bill details...');
          
          if (USE_SUPABASE) {
            // Fetch current bills for this tenant from Supabase
            const { data: allBills, error: billsError } = await supabase
              .from('payments')
              .select('*')
              .eq('tenant_id', tenant.id);
            
            if (billsError) throw billsError;
            
            // Find current month's bill for this tenant
            const currentMonth = new Date().toISOString().slice(0, 7);
            const currentBill = allBills?.find((bill: any) => 
              bill.billing_month === currentMonth &&
              bill.balance_due > 0
            );

            // Find any pending bills
            const pendingBills = allBills?.filter((bill: any) => 
              bill.balance_due > 0
            ) || [];

            const totalPendingDues = pendingBills.reduce((sum: number, bill: any) => sum + bill.balance_due, 0);

            if (currentBill) {
              // Pre-populate with current bill details
              setFormData(prev => ({
                ...prev,
                tenant_id: tenant.id,
                tenant_name: tenant.name,
                room_number: tenant.room_number,
                billing_month: currentBill.billing_month,
                rent_amount: currentBill.rent_amount,
                electricity_amount: currentBill.electricity_amount,
                other_charges: currentBill.other_charges,
                adjustments: currentBill.adjustments,
                total_amount: currentBill.total_amount,
                amount_paid: currentBill.balance_due // Set to balance due as suggested payment
              }));
              
              setRoomFetchMessage(
                `✅ Current Bill: ₹${currentBill.balance_due}${
                  pendingBills.length > 1 ? ` | Total Pending: ₹${totalPendingDues}` : ''
                }`
              );
            } else {
              // No current bill, just populate tenant details with standard rent
              setFormData(prev => ({
                ...prev,
                tenant_id: tenant.id,
                tenant_name: tenant.name,
                room_number: tenant.room_number,
                rent_amount: tenant.monthly_rent || 0,
                electricity_amount: 0,
                other_charges: 0,
                adjustments: 0,
                total_amount: tenant.monthly_rent || 0,
                amount_paid: tenant.monthly_rent || 0
              }));
              
              if (pendingBills.length > 0) {
                setRoomFetchMessage(
                  `✅ No current bill | Pending Dues: ₹${totalPendingDues}`
                );
              } else {
                setRoomFetchMessage(
                  `✅ No pending bills | Standard Rent: ₹${tenant.monthly_rent || 0}`
                );
              }
            }
          } else {
            // Fetch current bills for this tenant
            const billsResponse = await axios.get(`${apiUrl}/payments/bills`);
            const allBills = billsResponse.data.bills || [];
            
            // Find current month's bill for this tenant
            const currentMonth = new Date().toISOString().slice(0, 7);
            const currentBill = allBills.find((bill: any) => 
              bill.tenant_id === tenant.id && 
              bill.billing_month === currentMonth &&
              bill.balance_due > 0
            );

            // Find any pending bills
            const pendingBills = allBills.filter((bill: any) => 
              bill.tenant_id === tenant.id && 
              bill.balance_due > 0
            );

            const totalPendingDues = pendingBills.reduce((sum: number, bill: any) => sum + bill.balance_due, 0);

            if (currentBill) {
              // Pre-populate with current bill details
              setFormData(prev => ({
                ...prev,
                tenant_id: tenant.id,
                tenant_name: tenant.name,
                room_number: tenant.room_number,
                billing_month: currentBill.billing_month,
                rent_amount: currentBill.rent_amount,
                electricity_amount: currentBill.electricity_amount,
                other_charges: currentBill.other_charges,
                adjustments: currentBill.adjustments,
                total_amount: currentBill.total_amount,
                amount_paid: currentBill.balance_due // Set to balance due as suggested payment
              }));
              
              setRoomFetchMessage(
                `✅ Current Bill: ₹${currentBill.balance_due}${
                  pendingBills.length > 1 ? ` | Total Pending: ₹${totalPendingDues}` : ''
                }`
              );
            } else {
              // No current bill, just populate tenant details with standard rent
              setFormData(prev => ({
                ...prev,
                tenant_id: tenant.id,
                tenant_name: tenant.name,
                room_number: tenant.room_number,
                rent_amount: tenant.monthly_rent || 0,
                electricity_amount: 0,
                other_charges: 0,
                adjustments: 0,
                total_amount: tenant.monthly_rent || 0,
                amount_paid: tenant.monthly_rent || 0
              }));
              
              if (pendingBills.length > 0) {
                setRoomFetchMessage(
                  `✅ No current bill | Pending Dues: ₹${totalPendingDues}`
                );
              } else {
                setRoomFetchMessage(
                  `✅ No pending bills | Standard Rent: ₹${tenant.monthly_rent || 0}`
                );
              }
            }
          }
        } catch (error) {
          console.error('Error fetching bills:', error);
          // Fallback to basic tenant info
          setFormData(prev => ({
            ...prev,
            tenant_id: tenant.id,
            tenant_name: tenant.name,
            room_number: tenant.room_number,
            rent_amount: tenant.monthly_rent || 0,
            electricity_amount: 0,
            other_charges: 0,
            adjustments: 0,
            total_amount: tenant.monthly_rent || 0,
            amount_paid: tenant.monthly_rent || 0
          }));
          setRoomFetchMessage('⚠️ Bills data unavailable, showing standard rent');
        } finally {
          setFetchingFromRoom(false);
        }
      }
    } else {
      // Clear tenant data if no selection
      setFormData(prev => ({
        ...prev,
        tenant_id: '',
        tenant_name: '',
        room_number: '',
        rent_amount: 0,
        electricity_amount: 0,
        other_charges: 0,
        adjustments: 0,
        total_amount: 0,
        amount_paid: 0
      }));
      setRoomFetchMessage('');
    }
  };

  const calculateTotal = () => {
    const total = formData.rent_amount + formData.electricity_amount + formData.other_charges + formData.adjustments;
    setFormData(prev => ({ ...prev, total_amount: total }));
  };

  useEffect(() => {
    calculateTotal();
  }, [formData.rent_amount, formData.electricity_amount, formData.other_charges, formData.adjustments]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.tenant_id || !formData.tenant_name || !formData.room_number) {
      alert('Please select a tenant/room');
      return;
    }
    
    if (!formData.amount_paid || formData.amount_paid <= 0) {
      alert('Please enter a valid payment amount');
      return;
    }
    
    if (formData.amount_paid > formData.total_amount) {
      alert('Payment amount cannot exceed total amount');
      return;
    }

    onSubmit(formData);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-dark-900 border border-golden-600/20 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-golden-600/20">
          <div>
            <h2 className="text-xl font-semibold text-golden-400">Record Payment</h2>
            <p className="text-golden-300 text-sm">Record rent and other payments from tenants</p>
          </div>
          <button onClick={onClose} className="text-golden-300 hover:text-golden-100">
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Room/Tenant Selection */}
          <div className="mb-6 p-4 bg-dark-800 border border-golden-600/30 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-golden-400 font-medium">Select Tenant & Room</h3>
              {!bill && (
                <div className="flex bg-dark-700 rounded-lg p-1">
                  <button
                    type="button"
                    onClick={() => setSelectionMethod('room_input')}
                    className={`px-3 py-1 text-sm rounded transition-colors ${
                      selectionMethod === 'room_input'
                        ? 'bg-golden-600 text-dark-900'
                        : 'text-golden-300 hover:text-golden-100'
                    }`}
                  >
                    Room Input
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectionMethod('dropdown')}
                    className={`px-3 py-1 text-sm rounded transition-colors ${
                      selectionMethod === 'dropdown'
                        ? 'bg-golden-600 text-dark-900'
                        : 'text-golden-300 hover:text-golden-100'
                    }`}
                  >
                    Dropdown
                  </button>
                </div>
              )}
            </div>

            {/* Room Number Input Method */}
            {selectionMethod === 'room_input' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-golden-300 mb-2">
                    🏠 Room Number *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={roomNumberInput}
                      onChange={(e) => handleRoomNumberChange(e.target.value)}
                      disabled={!!bill}
                      placeholder="Enter room number (e.g., 101, 203)"
                      className="w-full px-3 py-2 bg-dark-700 border border-golden-600/30 rounded-lg text-golden-100 placeholder-golden-400/50 focus:outline-none focus:border-golden-500 disabled:opacity-50"
                    />
                    {fetchingFromRoom && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-golden-400/30 border-t-golden-400 rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                  {roomFetchMessage && (
                    <p className={`text-xs mt-1 ${
                      roomFetchMessage.startsWith('✅') ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {roomFetchMessage}
                    </p>
                  )}
                  <p className="text-golden-400/60 text-xs mt-1">
                    Start typing room number to auto-fetch tenant data
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-golden-300 mb-2">
                    📅 Billing Month *
                  </label>
                  <input
                    type="month"
                    required
                    value={formData.billing_month}
                    onChange={(e) => setFormData({ ...formData, billing_month: e.target.value })}
                    className="w-full px-3 py-2 bg-dark-700 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
                  />
                </div>
              </div>
            )}

            {/* Dropdown Selection Method */}
            {selectionMethod === 'dropdown' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-golden-300 mb-2">
                    👤 Room & Tenant *
                  </label>
                  <select
                    value={selectedRoomTenant}
                    onChange={(e) => handleRoomTenantSelect(e.target.value)}
                    disabled={!!bill || loadingTenants}
                    className="w-full px-3 py-2 bg-dark-700 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500 disabled:opacity-50"
                    required
                  >
                    <option value="">Select Room & Tenant</option>
                    {tenants
                      .filter(tenant => tenant.status === 'active' || !tenant.status)
                      .map((tenant) => (
                      <option key={tenant.id} value={`${tenant.room_number}-${tenant.id}`}>
                        Room {tenant.room_number} - {tenant.name}
                      </option>
                    ))}
                  </select>
                  {loadingTenants && (
                    <p className="text-golden-400/60 text-xs mt-1">Loading tenants...</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-golden-300 mb-2">
                    📅 Billing Month *
                  </label>
                  <input
                    type="month"
                    required
                    value={formData.billing_month}
                    onChange={(e) => setFormData({ ...formData, billing_month: e.target.value })}
                    className="w-full px-3 py-2 bg-dark-700 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
                  />
                </div>
              </div>
            )}

            {bill && (
              <p className="text-golden-400/60 text-xs mt-2">
                💳 Payment for existing bill - tenant selection disabled
              </p>
            )}

            {/* Selected Tenant Info */}
            {formData.tenant_name && (
              <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-medium">Selected Tenant:</span>
                </div>
                <div className="text-green-300 text-sm mt-1">
                  <strong>{formData.tenant_name}</strong> - Room {formData.room_number}
                  <div className="text-green-400/80 text-xs mt-1">
                    Monthly Rent: {formatCurrency(formData.rent_amount)}
                  </div>
                </div>
              </div>
            )}

            {!formData.tenant_name && !fetchingFromRoom && roomNumberInput && (
              <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="flex items-center gap-2 text-blue-400">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-medium">Quick Tips:</span>
                </div>
                <ul className="text-blue-300 text-xs mt-1 space-y-1">
                  <li>• Type room number (e.g., 101, 203, 305)</li>
                  <li>• System will auto-fetch tenant data</li>
                  <li>• Use dropdown method if room input doesn't work</li>
                </ul>
              </div>
            )}
          </div>

          {/* Payment Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-golden-300 mb-2">Room Rent</label>
              <input
                type="number"
                min="0"
                step="1"
                value={formData.rent_amount}
                onChange={(e) => setFormData({ ...formData, rent_amount: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
                placeholder="Enter rent amount"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-golden-300 mb-2">Electricity Amount</label>
              <input
                type="number"
                min="0"
                step="1"
                value={formData.electricity_amount}
                onChange={(e) => setFormData({ ...formData, electricity_amount: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
                placeholder="Enter electricity charges"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-golden-300 mb-2">Other Charges</label>
              <input
                type="number"
                min="0"
                step="1"
                value={formData.other_charges}
                onChange={(e) => setFormData({ ...formData, other_charges: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
                placeholder="Enter other charges"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-golden-300 mb-2">Adjustments</label>
              <input
                type="number"
                step="1"
                value={formData.adjustments}
                onChange={(e) => setFormData({ ...formData, adjustments: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
                placeholder="Enter adjustments (+/-)"
              />
            </div>
          </div>

          {/* Payment Information */}
          <div className="mb-6 p-4 bg-dark-800 border border-golden-600/30 rounded-lg">
            <h3 className="text-golden-400 font-medium mb-3">Payment Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-golden-300 mb-2">
                  Total Amount
                </label>
                <div className="px-3 py-2 bg-dark-700 border border-golden-600/20 rounded-lg text-golden-100 font-medium">
                  {formatCurrency(formData.total_amount)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-golden-300 mb-2">
                  Amount Paid *
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  max={formData.total_amount}
                  required
                  value={formData.amount_paid}
                  onChange={(e) => setFormData({ ...formData, amount_paid: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
                  placeholder="Enter amount received"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-golden-300 mb-2">Payment Method *</label>
                <select
                  required
                  value={formData.payment_method}
                  onChange={(e) => setFormData({ ...formData, payment_method: e.target.value as any })}
                  className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
                >
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="card">Card</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-golden-300 mb-2">Payment Date *</label>
                <input
                  type="date"
                  required
                  value={formData.payment_date}
                  onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                  className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-golden-300 mb-2">
                  Transaction ID (Optional)
                </label>
                <input
                  type="text"
                  value={formData.transaction_id}
                  onChange={(e) => setFormData({ ...formData, transaction_id: e.target.value })}
                  className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
                  placeholder="Enter transaction/reference ID"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-golden-300 mb-2">Notes (Optional)</label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
                  placeholder="Enter any additional notes"
                />
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          {formData.amount_paid > 0 && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <h4 className="text-green-400 font-medium mb-2">Payment Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-green-300">Total Bill:</span>
                  <span className="text-green-100 ml-2 font-medium">{formatCurrency(formData.total_amount)}</span>
                </div>
                <div>
                  <span className="text-green-300">Amount Paid:</span>
                  <span className="text-green-100 ml-2 font-medium">{formatCurrency(formData.amount_paid)}</span>
                </div>
                <div>
                  <span className="text-green-300">Balance:</span>
                  <span className={`ml-2 font-medium ${formData.total_amount - formData.amount_paid > 0 ? 'text-orange-400' : 'text-green-400'}`}>
                    {formatCurrency(formData.total_amount - formData.amount_paid)}
                  </span>
                </div>
                <div>
                  <span className="text-green-300">Status:</span>
                  <span className={`ml-2 font-medium ${formData.amount_paid >= formData.total_amount ? 'text-green-400' : formData.amount_paid > 0 ? 'text-orange-400' : 'text-red-400'}`}>
                    {formData.amount_paid >= formData.total_amount ? 'Fully Paid' : formData.amount_paid > 0 ? 'Partial Payment' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Payment Summary - Show after tenant is selected */}
          {formData.tenant_id && (
            <div className="mt-4 p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/30 rounded-lg">
              <h4 className="text-green-400 font-medium mb-3 flex items-center gap-2">
                📋 Auto-Fetched Payment Details
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                <div className="text-center p-3 bg-dark-700 rounded-lg">
                  <div className="text-xs text-golden-300">Monthly Rent</div>
                  <div className="text-lg font-bold text-golden-100">₹{formData.rent_amount}</div>
                </div>
                
                <div className="text-center p-3 bg-dark-700 rounded-lg">
                  <div className="text-xs text-golden-300">Electricity</div>
                  <div className="text-lg font-bold text-blue-400">₹{formData.electricity_amount}</div>
                </div>
                
                <div className="text-center p-3 bg-dark-700 rounded-lg">
                  <div className="text-xs text-golden-300">Other Charges</div>
                  <div className="text-lg font-bold text-orange-400">₹{formData.other_charges}</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="text-sm text-green-300">
                  ✅ All details auto-loaded. You can modify amounts if needed or record partial payments.
                </div>
                
                {formData.total_amount > 0 && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, amount_paid: prev.total_amount }))}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-500 transition-colors"
                    >
                      Pay Full Amount (₹{formData.total_amount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, amount_paid: prev.rent_amount }))}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-500 transition-colors"
                    >
                      Pay Rent Only (₹{formData.rent_amount})
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-golden-600/30 text-golden-300 rounded-lg hover:bg-golden-600/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.tenant_id || !formData.amount_paid}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-golden-500 to-golden-600 text-dark-900 rounded-lg hover:from-golden-600 hover:to-golden-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4" />
              Record Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Payments;

// WhatsApp Bill Modal Component
interface WhatsAppBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  bill: Bill;
}

const WhatsAppBillModal = ({ isOpen, bill, onClose }: WhatsAppBillModalProps) => {
  const [tenantPhone, setTenantPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingPhone, setFetchingPhone] = useState(false);

  useEffect(() => {
    if (isOpen && bill) {
      // Auto-fetch tenant phone number when modal opens
      fetchTenantPhone();
    }
  }, [isOpen, bill]);

  const fetchTenantPhone = async () => {
    if (!bill?.tenant_id) return;
    
    try {
      setFetchingPhone(true);
      console.log('Fetching phone for tenant:', bill.tenant_id, bill.tenant_name);
      
      if (USE_SUPABASE) {
        // Try to fetch tenant data by ID first
        const { data: tenantData, error: tenantError } = await supabase
          .from('tenants')
          .select('mobile')
          .eq('id', bill.tenant_id)
          .single();
        
        console.log('Tenant data by ID:', tenantData, 'Error:', tenantError);
        
        if (!tenantError && tenantData?.mobile) {
          setTenantPhone(tenantData.mobile);
          console.log('Phone found by ID:', tenantData.mobile);
        } else {
          // Fallback: try to fetch by room number
          const { data: roomTenantData, error: roomError } = await supabase
            .from('tenants')
            .select('mobile')
            .eq('room_number', bill.room_number)
            .eq('status', 'active')
            .single();
          
          console.log('Tenant data by room:', roomTenantData, 'Error:', roomError);
          
          if (!roomError && roomTenantData?.mobile) {
            setTenantPhone(roomTenantData.mobile);
            console.log('Phone found by room:', roomTenantData.mobile);
          } else {
            // Set empty so user can enter manually
            setTenantPhone('');
            console.log('No phone found, user needs to enter manually');
          }
        }
      } else {
        // Try to fetch by tenant ID
        const response = await axios.get(`${apiUrl}/tenants/${bill.tenant_id}`);
        const tenantData = response.data.tenant;
        
        if (tenantData?.mobile) {
          setTenantPhone(tenantData.mobile);
        } else {
          // Fallback: try to fetch by room number
          const roomResponse = await axios.get(`${apiUrl}/tenants/room/${bill.room_number}`);
          if (roomResponse.data.tenant?.mobile) {
            setTenantPhone(roomResponse.data.tenant.mobile);
          } else {
            // Set empty so user can enter manually
            setTenantPhone('');
          }
        }
      }
    } catch (error) {
      console.error('Error fetching tenant phone:', error);
      // Set empty so user can enter manually
      setTenantPhone('');
    } finally {
      setFetchingPhone(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const generateBillText = () => {
    if (!bill) return '';
    
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-IN');
    };

    return `🏠 *SHIV SHIVA RESIDENCY*
📍 Plot No. 373, Sec -70, Basal, Noida - 201301

📄 *PAYMENT RECEIPT*
━━━━━━━━━━━━━━━━━━━━━━━━━

👤 *Tenant:* ${bill.tenant_name}
🏠 *Room:* ${bill.room_number}
📅 *Bill Month:* ${bill.billing_month}

💰 *BILL BREAKDOWN:*
━━━━━━━━━━━━━━━━━━━━━━━━━
🏠 Monthly Rent: ₹${bill.rent_amount}
⚡ Electricity: ${bill.electricity_units} units × ₹${bill.electricity_rate} = ₹${bill.electricity_amount}
${bill.other_charges > 0 ? `📋 Other Charges: ₹${bill.other_charges}\n` : ''}${bill.adjustments !== 0 ? `🔄 Adjustments: ₹${bill.adjustments}\n` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━
💳 *TOTAL AMOUNT: ₹${bill.total_amount}*

📅 *Due Date:* ${formatDate(bill.due_date)}
📄 *Bill ID:* ${bill.id}

⚠️ *IMPORTANT:* Please clear all dues by your rent date to avoid ₹100/day penalty.

📧 For queries, contact management.

*Note: Detailed bill receipt is attached above. Please save it for your records.*

Thanks for choosing Shiv Shiva Residency! 🏠✨`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateBillText());
    alert('Message copied to clipboard!');
  };

  const sendWhatsApp = () => {
    if (!tenantPhone || tenantPhone.trim() === '') {
      alert('❌ Please wait for phone number to load or enter it manually');
      return;
    }

    const phoneNumber = tenantPhone.replace(/\D/g, ''); // Remove non-digits
    
    if (phoneNumber.length < 10) {
      alert('❌ Please enter a valid 10-digit phone number');
      return;
    }

    const message = encodeURIComponent(generateBillText());
    // Add +91 for India if not already present
    const formattedPhone = phoneNumber.startsWith('91') ? phoneNumber : `91${phoneNumber}`;
    const url = `https://wa.me/${formattedPhone}?text=${message}`;
    
    // Show confirmation before opening WhatsApp
    const confirmed = confirm(`📱 Send bill to ${bill?.tenant_name} at +${formattedPhone}?`);
    if (confirmed) {
      window.open(url, '_blank');
    }
  };

  const printBill = () => {
    const printWindow = window.open('', '_blank');
    const billHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Bill - ${bill.tenant_name}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .bill-details { margin-bottom: 20px; }
          .amount-row { display: flex; justify-content: space-between; padding: 5px 0; }
          .total-row { font-weight: bold; border-top: 2px solid #000; padding-top: 10px; }
          .due-amount { color: red; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>SHIV SHIVA RESIDENCY</h1>
          <h3>Monthly Bill - ${new Date(bill.billing_month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
        </div>
        
        <div class="bill-details">
          <p><strong>Tenant:</strong> ${bill.tenant_name}</p>
          <p><strong>Room:</strong> ${bill.room_number}</p>
          <p><strong>Due Date:</strong> ${formatDate(bill.due_date)}</p>
          <p><strong>Generated:</strong> ${formatDate(bill.generated_date)}</p>
        </div>

        <div class="amount-row">
          <span>Room Rent:</span>
          <span>${formatCurrency(bill.rent_amount)}</span>
        </div>
        <div class="amount-row">
          <span>Electricity (${bill.electricity_units} units):</span>
          <span>${formatCurrency(bill.electricity_amount)}</span>
        </div>
        ${bill.other_charges > 0 ? `<div class="amount-row"><span>Other Charges:</span><span>${formatCurrency(bill.other_charges)}</span></div>` : ''}
        ${bill.adjustments !== 0 ? `<div class="amount-row"><span>Adjustments:</span><span>${formatCurrency(bill.adjustments)}</span></div>` : ''}
        
        <div class="amount-row total-row">
          <span>Total Amount:</span>
          <span>${formatCurrency(bill.total_amount)}</span>
        </div>
        <div class="amount-row">
          <span>Amount Paid:</span>
          <span>${formatCurrency(bill.amount_paid)}</span>
        </div>
        <div class="amount-row due-amount">
          <span>Balance Due:</span>
          <span>${formatCurrency(bill.balance_due)}</span>
        </div>
      </body>
      </html>
    `;
    
    printWindow?.document.write(billHTML);
    printWindow?.document.close();
    printWindow?.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-dark-900 border border-golden-600/20 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-golden-600/20">
          <div>
            <h2 className="text-xl font-semibold text-golden-400">WhatsApp Bill</h2>
            <p className="text-golden-300 text-sm">Send bill via WhatsApp to tenant</p>
          </div>
          <button onClick={onClose} className="text-golden-300 hover:text-golden-100">
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bill Preview */}
            <div>
              <h3 className="text-lg font-semibold text-golden-400 mb-4">📄 Bill Preview</h3>
              <div className="border border-golden-600/30 rounded-lg p-4 bg-dark-800 max-h-96 overflow-y-auto">
                <div className="scale-50 origin-top-left">
                  <BillTemplate bill={bill} />
                </div>
              </div>
            </div>

            {/* WhatsApp Message */}
            <div>
              <h3 className="text-lg font-semibold text-golden-400 mb-4">📱 WhatsApp Message</h3>
              <div className="bg-dark-800 border border-golden-600/30 rounded-lg p-4 max-h-96 overflow-y-auto">
                <div className="text-golden-100 text-sm whitespace-pre-wrap">
                  {generateBillText()}
                </div>
              </div>
            </div>
          </div>

          {/* Tenant Phone Input */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-golden-300 mb-2">
              <Phone className="inline h-4 w-4 mr-1" />
              📱 Tenant's WhatsApp Number *
              {fetchingPhone && (
                <span className="ml-2 text-blue-400 text-xs">
                  (Auto-fetching from tenant record...)
                </span>
              )}
              {tenantPhone && !fetchingPhone && (
                <span className="ml-2 text-green-400 text-xs">
                  ✅ Auto-fetched from record
                </span>
              )}
            </label>
            <div className="relative">
              <input
                type="tel"
                value={tenantPhone}
                onChange={(e) => setTenantPhone(e.target.value)}
                disabled={fetchingPhone}
                className={`w-full px-3 py-2 bg-dark-800 border rounded-lg text-golden-100 placeholder-golden-400/50 focus:outline-none focus:ring-1 ${
                  tenantPhone && !fetchingPhone
                    ? 'border-green-500/50 focus:border-green-500 focus:ring-green-500/50'
                    : 'border-golden-600/30 focus:border-golden-500 focus:ring-golden-500'
                } disabled:opacity-50`}
                placeholder="Enter 10-digit WhatsApp number (auto-fetched)"
                required
              />
              {fetchingPhone && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin"></div>
                </div>
              )}
              {tenantPhone && !fetchingPhone && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                </div>
              )}
              <p className="text-golden-400/60 text-xs mt-1">
                {tenantPhone 
                  ? `✅ Ready to send bill to ${bill?.tenant_name} at ${tenantPhone}` 
                  : 'Phone number will be auto-fetched from tenant record. Enter without country code.'
                }
              </p>
              
              {!tenantPhone && !fetchingPhone && (
                <button
                  type="button"
                  onClick={fetchTenantPhone}
                  className="mt-2 text-xs text-blue-400 hover:text-blue-300 underline"
                >
                  🔄 Retry fetching phone number
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={sendWhatsApp}
              disabled={!tenantPhone || tenantPhone.length < 10}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MessageCircle className="h-4 w-4" />
              Send via WhatsApp
            </button>

            <button
              onClick={copyToClipboard}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
            >
              <Copy className="h-4 w-4" />
              Copy Message
            </button>

            <button
              onClick={printBill}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
            >
              <Printer className="h-4 w-4" />
              Print Bill
            </button>
          </div>

          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5" />
              <div>
                <h4 className="text-blue-400 font-medium text-sm">How it works:</h4>
                <ul className="text-blue-300 text-xs mt-1 space-y-1">
                  <li>• Enter tenant's mobile number</li>
                  <li>• Click "Send via WhatsApp" to open WhatsApp with pre-filled message</li>
                  <li>• You can also copy the message and send manually</li>
                  <li>• Print option available for physical records</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 