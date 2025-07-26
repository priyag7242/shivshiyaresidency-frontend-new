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
  Settings,
  FileSpreadsheet
} from 'lucide-react';
import axios from 'axios';
import * as XLSX from 'xlsx';
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
  electricity_joining_reading?: number;
  last_electricity_reading?: number;
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
  const [billsSearchTerm, setBillsSearchTerm] = useState('');
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
  const [currentReadings, setCurrentReadings] = useState<{ [key: string]: string }>({});
  const [billElectricityInputs, setBillElectricityInputs] = useState<{ [key: string]: string }>({});
  const [joiningReadings, setJoiningReadings] = useState<{ [roomNumber: string]: string }>({});
  const [currentMonthReadings, setCurrentMonthReadings] = useState<{ [roomNumber: string]: string }>({});
  const [readingDates, setReadingDates] = useState<{ [roomNumber: string]: string }>({});
  const [selectedExportMonth, setSelectedExportMonth] = useState(new Date().toISOString().slice(0, 7));
  const [generating, setGenerating] = useState(false);
  const [allTenants, setAllTenants] = useState<any[]>([]);

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

  // Populate electricity readings when bills are loaded
  useEffect(() => {
    if (bills.length > 0) {
      const newJoiningReadings: { [roomNumber: string]: string } = {};
      const newCurrentReadings: { [roomNumber: string]: string } = {};
      
      bills.forEach(bill => {
        if (bill.electricity_joining_reading) {
          newJoiningReadings[bill.room_number] = bill.electricity_joining_reading.toString();
        }
        if (bill.last_electricity_reading) {
          newCurrentReadings[bill.room_number] = bill.last_electricity_reading.toString();
        }
      });
      
      setJoiningReadings(prev => ({ ...prev, ...newJoiningReadings }));
      setCurrentMonthReadings(prev => ({ ...prev, ...newCurrentReadings }));
      
      console.log('Populated electricity readings:', { newJoiningReadings, newCurrentReadings });
    }
  }, [bills]);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchPayments(),
        fetchBills(),
        fetchStats(),
        fetchAllTenants()
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

  const fetchAllTenants = async () => {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('id, name, room_number, electricity_joining_reading, last_electricity_reading, monthly_rent, status');
      if (error) throw error;
      setAllTenants(data || []);
      console.log('Fetched all tenants:', data);
    } catch (error) {
      console.error('Error fetching all tenants:', error);
    }
  };

  const fetchRooms = async () => {
    try {
      console.log('Fetching rooms...');
      
      if (USE_SUPABASE) {
        // First get all tenants with their room numbers
        const { data: allTenants, error: tenantsError } = await supabase
          .from('tenants')
          .select('*')
          .eq('status', 'active');
        
        if (tenantsError) {
          console.error('Error fetching tenants:', tenantsError);
        }
        
        console.log('Active tenants:', allTenants);
        
        // Get all rooms
        const { data: allRooms, error: roomsError } = await supabase
          .from('rooms')
          .select('*');
        
        if (roomsError) {
          console.error('Error fetching rooms:', roomsError);
          return;
        }
        
        console.log('All rooms:', allRooms);
        
        // Create a map of room_number to tenant
        const tenantMap = new Map();
        allTenants?.forEach(tenant => {
          tenantMap.set(tenant.room_number, tenant);
        });
        
        // Transform rooms to include tenant info
        const transformedRooms = allRooms?.map(room => {
          const tenant = tenantMap.get(room.room_number);
          return {
            ...room,
            current_tenant: tenant?.name || 'No tenant',
            tenant_id: tenant?.id || null,
            last_electricity_reading: tenant?.last_electricity_reading || 0,
            electricity_joining_reading: tenant?.electricity_joining_reading || 0,
            monthly_rent: tenant?.monthly_rent || 0
          };
        }) || [];
        
        console.log('Transformed rooms:', transformedRooms);
        setRooms(transformedRooms);
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

  // Comprehensive function to create and fetch bills for all tenants
  const createAndFetchBillsForAllTenants = async () => {
    try {
      setGenerating(true);
      console.log('🔄 Starting comprehensive bill creation and fetching...');
      
      // Step 1: Check if tenants exist
      const { data: existingTenants, error: tenantsError } = await supabase
        .from('tenants')
        .select('*');
      
      if (tenantsError) throw tenantsError;
      
      console.log(`📊 Found ${existingTenants?.length || 0} existing tenants`);
      
      // Step 2: If no tenants exist, create sample tenants
      if (!existingTenants || existingTenants.length === 0) {
        console.log('📝 No tenants found, creating sample tenants...');
        await createSampleTenants();
        
        // Fetch tenants again after creation
        const { data: newTenants, error: newTenantsError } = await supabase
          .from('tenants')
          .select('*');
        
        if (newTenantsError) throw newTenantsError;
        console.log(`✅ Created and found ${newTenants?.length || 0} tenants`);
      }
      
      // Step 3: Generate bills for all tenants
      console.log('💰 Generating bills for all tenants...');
      await generateBills();
      
      // Step 4: Fetch all data
      console.log('📥 Fetching all data...');
      await fetchData();
      
      // Step 5: Show success message
      const { data: finalBills } = await supabase
        .from('payments')
        .select('*');
      
      alert(`✅ Successfully created and fetched bills!\n\n📊 Summary:\n- Tenants: ${existingTenants?.length || 0}\n- Bills Generated: ${finalBills?.length || 0}\n- Current Month: ${billGeneration.billing_month}`);
      
    } catch (error) {
      console.error('❌ Error in comprehensive bill creation:', error);
      alert('Failed to create and fetch bills: ' + (error as Error).message);
    } finally {
      setGenerating(false);
    }
  };

  // Enhanced generateBills function with better error handling
  const generateBills = async () => {
    try {
      console.log('🔄 Generating bills...');
      
      // Get all tenants (not just active ones)
      const { data: allTenants, error: allTenantsError } = await supabase
        .from('tenants')
        .select('*');
      
      if (allTenantsError) throw allTenantsError;
      
      console.log(`📊 Found ${allTenants?.length || 0} total tenants`);
      
      if (!allTenants || allTenants.length === 0) {
        alert('No tenants found in database. Please add tenants first.');
        return;
      }
      
      // Check if bills already exist for this month
      const { data: existingBills, error: existingBillsError } = await supabase
        .from('payments')
        .select('*')
        .eq('billing_month', billGeneration.billing_month);
      
      if (existingBillsError) throw existingBillsError;
      
      if (existingBills && existingBills.length > 0) {
        const overwrite = confirm(`Bills for ${billGeneration.billing_month} already exist (${existingBills.length} bills). Do you want to overwrite them?`);
        if (!overwrite) {
          console.log('Bill generation cancelled by user');
          return;
        }
        
        // Delete existing bills for this month
        const { error: deleteError } = await supabase
          .from('payments')
          .delete()
          .eq('billing_month', billGeneration.billing_month);
        
        if (deleteError) throw deleteError;
        console.log(`🗑️ Deleted ${existingBills.length} existing bills for ${billGeneration.billing_month}`);
      }
      
      let generatedCount = 0;
      const errors: string[] = [];
      
      for (const tenant of allTenants) {
        try {
          console.log(`📝 Processing tenant: ${tenant.name} (Room ${tenant.room_number})`);
          
          // Calculate electricity
          const joiningReading = tenant.electricity_joining_reading || 0;
          const currentReading = tenant.last_electricity_reading || joiningReading;
          const electricityUnits = Math.max(0, currentReading - joiningReading);
          const electricityAmount = electricityUnits * parseFloat(billGeneration.electricity_rate);
          const totalAmount = (tenant.monthly_rent || 0) + electricityAmount;

          const billData = {
            tenant_id: tenant.id,
            tenant_name: tenant.name,
            room_number: tenant.room_number,
            billing_month: billGeneration.billing_month,
            amount: totalAmount,
            rent_amount: tenant.monthly_rent || 0,
            electricity_units: electricityUnits,
            electricity_rate: parseFloat(billGeneration.electricity_rate),
            electricity_amount: electricityAmount,
            electricity_joining_reading: joiningReading,
            last_electricity_reading: currentReading,
            other_charges: 0,
            adjustments: 0,
            total_amount: totalAmount,
            amount_paid: 0,
            balance_due: totalAmount,
            due_date: new Date().toISOString().split('T')[0],
            status: 'pending' as const,
            created_date: new Date().toISOString(),
            created_by: 'system',
            generated_date: new Date().toISOString().split('T')[0]
          };

          console.log(`💾 Inserting bill for ${tenant.name}:`, {
            totalAmount,
            electricityUnits,
            electricityAmount,
            joiningReading,
            currentReading
          });

          const { error: insertError } = await supabase
            .from('payments')
            .insert(billData);

          if (insertError) {
            console.error(`❌ Error generating bill for ${tenant.name}:`, insertError);
            errors.push(`${tenant.name}: ${insertError.message}`);
          } else {
            generatedCount++;
            console.log(`✅ Successfully generated bill for ${tenant.name}`);
          }
        } catch (error) {
          console.error(`❌ Error processing tenant ${tenant.name}:`, error);
          errors.push(`${tenant.name}: ${(error as Error).message}`);
        }
      }
      
      // Show detailed results
      if (errors.length > 0) {
        alert(`⚠️ Bill generation completed with some errors:\n\n✅ Generated: ${generatedCount} bills\n❌ Errors: ${errors.length}\n\nErrors:\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? '\n... and more' : ''}`);
      } else {
        alert(`✅ Successfully generated ${generatedCount} bills for ${billGeneration.billing_month}!`);
      }
      
      // Refresh data
      await fetchData();
      
    } catch (error) {
      console.error('❌ Error generating bills:', error);
      alert('Failed to generate bills: ' + (error as Error).message);
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
    bill.tenant_name.toLowerCase().includes(billsSearchTerm.toLowerCase()) ||
    bill.room_number.includes(billsSearchTerm)
  );

  const createSampleTenants = async () => {
    try {
      console.log('Creating sample tenants...');
      
      // First check if tenants already exist
      const { data: existingTenants } = await supabase
        .from('tenants')
        .select('name, room_number');
      
      console.log('Existing tenants:', existingTenants);
      
      // First ensure rooms exist
      const sampleRooms = ['101', '102', '105', '113', '217'];
      for (const roomNumber of sampleRooms) {
        const { data: existingRoom } = await supabase
          .from('rooms')
          .select('room_number')
          .eq('room_number', roomNumber)
          .single();
        
        if (!existingRoom) {
          console.log(`Creating room ${roomNumber}...`);
          await supabase
            .from('rooms')
            .insert({ room_number: roomNumber, status: 'occupied' });
        }
      }
      
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
      let skippedCount = 0;
      
      for (const tenant of sampleTenants) {
        // Check if tenant already exists
        const exists = existingTenants?.some(t => 
          t.name === tenant.name || t.room_number === tenant.room_number
        );
        
        if (exists) {
          console.log(`Tenant ${tenant.name} already exists, skipping...`);
          skippedCount++;
          continue;
        }
        
        console.log('Creating tenant:', tenant);
        
        const { error } = await supabase
          .from('tenants')
          .insert(tenant);
        
        if (error) {
          console.error(`Error creating tenant ${tenant.name}:`, error);
        } else {
          createdCount++;
          console.log(`Sample tenant ${tenant.name} created successfully`);
        }
      }
      
      const message = `Created ${createdCount} new tenants, skipped ${skippedCount} existing ones.`;
      alert(message);
      console.log(message);
      
      // Refresh data after creating tenants
      fetchRooms();
      fetchData();
      
    } catch (error) {
      console.error('Error creating sample tenants:', error);
      alert('Failed to create sample tenants: ' + (error as Error).message);
    }
  };

  const checkDatabaseData = async () => {
    try {
      console.log('=== DATABASE CHECK START ===');
      
      // Check all tenants
      const { data: allTenants, error: tenantsError } = await supabase
        .from('tenants')
        .select('*');
      
      if (tenantsError) {
        console.error('Error fetching tenants:', tenantsError);
      } else {
        console.log('All tenants in database:', allTenants);
      }
      
      // Check active tenants
      const { data: activeTenants, error: activeError } = await supabase
        .from('tenants')
        .select('*')
        .eq('status', 'active');
      
      if (activeError) {
        console.error('Error fetching active tenants:', activeError);
      } else {
        console.log('Active tenants:', activeTenants);
      }
      
      // Check rooms
      const { data: allRooms, error: roomsError } = await supabase
        .from('rooms')
        .select('*');
      
      if (roomsError) {
        console.error('Error fetching rooms:', roomsError);
      } else {
        console.log('All rooms:', allRooms);
      }
      
      // Check payments
      const { data: allPayments, error: paymentsError } = await supabase
        .from('payments')
        .select('*');
      
      if (paymentsError) {
        console.error('Error fetching payments:', paymentsError);
      } else {
        console.log('All payments:', allPayments);
      }
      
      console.log('=== DATABASE CHECK END ===');
      
      alert('Database check complete! Check browser console for details.');
      
    } catch (error) {
      console.error('Error in database check:', error);
      alert('Error checking database: ' + (error as Error).message);
    }
  };

  const quickDatabaseCheck = async () => {
    try {
      console.log('=== QUICK DATABASE CHECK ===');
      
      // Check tenants
      const { data: tenants, error: tenantsError } = await supabase
        .from('tenants')
        .select('name, room_number, status, monthly_rent, last_electricity_reading');
      
      if (tenantsError) {
        console.error('Error fetching tenants:', tenantsError);
      } else {
        console.log('Current tenants:', tenants);
        alert(`Found ${tenants?.length || 0} tenants in database`);
      }
      
      // Check rooms
      const { data: rooms, error: roomsError } = await supabase
        .from('rooms')
        .select('room_number, status');
      
      if (roomsError) {
        console.error('Error fetching rooms:', roomsError);
      } else {
        console.log('Current rooms:', rooms);
      }
      
      // Check if any tenants are active
      const activeTenants = tenants?.filter(t => t.status === 'active') || [];
      console.log('Active tenants:', activeTenants);
      
      if (activeTenants.length === 0) {
        alert('No active tenants found! Click "Add Sample Tenants" to create some.');
      } else {
        alert(`Found ${activeTenants.length} active tenants. You can now generate bills!`);
      }
      
    } catch (error) {
      console.error('Error in quick database check:', error);
      alert('Error checking database: ' + (error as Error).message);
    }
  };

  // Generate sequential serial number for bills
  const generateSerialNumber = (billId: string) => {
    // Extract numeric part from bill ID and format as 2-digit number
    const numericPart = billId.replace(/\D/g, '');
    const serialNum = parseInt(numericPart) || 1;
    return serialNum.toString().padStart(2, '0');
  };

  // Update electricity for individual bill
  const updateBillElectricity = async (billId: string, units: string) => {
    try {
      const unitsNum = parseInt(units) || 0;
      const electricityAmount = unitsNum * 12; // ₹12 per unit
      
      // Update the bill in database
      const { error } = await supabase
        .from('payments')
        .update({
          electricity_units: unitsNum,
          electricity_amount: electricityAmount,
          total_amount: (selectedBill?.rent_amount || 0) + electricityAmount
        })
        .eq('id', billId);
      
      if (error) {
        console.error('Error updating bill electricity:', error);
        alert('Failed to update electricity reading');
        return;
      }
      
      // Update local state
      setBillElectricityInputs(prev => ({
        ...prev,
        [billId]: units
      }));
      
      // Refresh data
      fetchData();
      
      console.log(`Updated bill ${billId} with ${units} units = ₹${electricityAmount}`);
      
    } catch (error) {
      console.error('Error updating bill electricity:', error);
      alert('Failed to update electricity reading');
    }
  };

  // Calculate electricity amount for display
  const calculateElectricityAmount = (units: string) => {
    const unitsNum = parseInt(units) || 0;
    return unitsNum * 12;
  };

  // Calculate electricity consumption based on joining and current readings
  const calculateElectricityConsumption = (roomNumber: string) => {
    const joiningReading = parseInt(joiningReadings[roomNumber] || '0');
    const currentReading = parseInt(currentMonthReadings[roomNumber] || '0');
    const consumption = currentReading - joiningReading;
    return Math.max(0, consumption); // Don't allow negative consumption
  };

  // Update electricity reading for a room
  const updateElectricityReading = async (roomNumber: string, reading: string, readingDate: string) => {
    try {
      const readingNum = parseInt(reading) || 0;
      const consumption = calculateElectricityConsumption(roomNumber);
      const electricityAmount = consumption * 12;

      console.log(`Room ${roomNumber}: Joining=${joiningReadings[roomNumber]}, Current=${reading}, Consumption=${consumption}, Amount=₹${electricityAmount}`);

      // Update tenant's last electricity reading
      const { error: tenantError } = await supabase
        .from('tenants')
        .update({ 
          last_electricity_reading: readingNum,
          electricity_joining_reading: parseInt(joiningReadings[roomNumber] || '0')
        })
        .eq('room_number', roomNumber);

      if (tenantError) {
        console.error('Error updating tenant electricity reading:', tenantError);
        alert('Failed to update electricity reading');
        return;
      }

      // Update all bills for this room with new electricity calculation
      const { data: roomBills, error: billsError } = await supabase
        .from('payments')
        .select('*')
        .eq('room_number', roomNumber)
        .eq('status', 'pending');

      if (billsError) {
        console.error('Error fetching room bills:', billsError);
        return;
      }

      // Update each bill with new electricity calculation
      for (const bill of roomBills || []) {
        const { error: updateError } = await supabase
          .from('payments')
          .update({
            electricity_units: consumption,
            electricity_amount: electricityAmount,
            total_amount: (bill.rent_amount || 0) + electricityAmount
          })
          .eq('id', bill.id);

        if (updateError) {
          console.error(`Error updating bill ${bill.id}:`, updateError);
        }
      }

      // Update local state
      setCurrentMonthReadings(prev => ({
        ...prev,
        [roomNumber]: reading
      }));
      setReadingDates(prev => ({
        ...prev,
        [roomNumber]: readingDate
      }));

      alert(`Electricity reading updated for Room ${roomNumber}!\nConsumption: ${consumption} units\nAmount: ₹${electricityAmount}`);
      fetchData();

    } catch (error) {
      console.error('Error updating electricity reading:', error);
      alert('Failed to update electricity reading');
    }
  };

  // Export monthly data to Excel
  const exportMonthlyData = async () => {
    try {
      // Get all payments for selected month
      const { data: monthlyPayments, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .eq('billing_month', selectedExportMonth);

      if (paymentsError) throw paymentsError;

      // Get all tenants
      const { data: allTenants, error: tenantsError } = await supabase
        .from('tenants')
        .select('*')
        .eq('status', 'active');

      if (tenantsError) throw tenantsError;

      // Get all rooms
      const { data: allRooms, error: roomsError } = await supabase
        .from('rooms')
        .select('*');

      if (roomsError) throw roomsError;

      const workbook = XLSX.utils.book_new();

      // 1. Monthly Bills Summary Sheet
      const billsData = (monthlyPayments || []).map(bill => ({
        'Bill ID': bill.id,
        'Tenant Name': bill.tenant_name,
        'Room Number': bill.room_number,
        'Billing Month': bill.billing_month,
        'Rent Amount': bill.rent_amount || 0,
        'Electricity Units': bill.electricity_units || 0,
        'Electricity Rate': bill.electricity_rate || 12,
        'Electricity Amount': bill.electricity_amount || 0,
        'Other Charges': bill.other_charges || 0,
        'Adjustments': bill.adjustments || 0,
        'Total Amount': bill.total_amount || 0,
        'Amount Paid': bill.amount_paid || 0,
        'Balance Due': bill.balance_due || 0,
        'Status': bill.status,
        'Due Date': bill.due_date,
        'Generated Date': bill.generated_date,
        'Created Date': bill.created_at
      }));

      const billsWorksheet = XLSX.utils.json_to_sheet(billsData);
      XLSX.utils.book_append_sheet(workbook, billsWorksheet, 'Monthly Bills');

      // 2. Tenants Summary Sheet
      const tenantsData = (allTenants || []).map(tenant => ({
        'Tenant ID': tenant.id,
        'Name': tenant.name,
        'Mobile': tenant.mobile,
        'Room Number': tenant.room_number,
        'Status': tenant.status,
        'Monthly Rent': tenant.monthly_rent || 0,
        'Security Deposit': tenant.security_deposit || 0,
        'Joining Date': tenant.joining_date,
        'Last Electricity Reading': tenant.last_electricity_reading || 0,
        'Joining Electricity Reading': tenant.electricity_joining_reading || 0,
        'Created Date': tenant.created_at
      }));

      const tenantsWorksheet = XLSX.utils.json_to_sheet(tenantsData);
      XLSX.utils.book_append_sheet(workbook, tenantsWorksheet, 'Tenants');

      // 3. Rooms Summary Sheet
      const roomsData = (allRooms || []).map(room => ({
        'Room ID': room.id,
        'Room Number': room.room_number,
        'Status': room.status,
        'Floor': room.floor || '',
        'Type': room.type || '',
        'Created Date': room.created_at
      }));

      const roomsWorksheet = XLSX.utils.json_to_sheet(roomsData);
      XLSX.utils.book_append_sheet(workbook, roomsWorksheet, 'Rooms');

      // 4. Monthly Summary Sheet
      const totalBills = billsData.length;
      const totalRent = billsData.reduce((sum, bill) => sum + (bill['Rent Amount'] || 0), 0);
      const totalElectricity = billsData.reduce((sum, bill) => sum + (bill['Electricity Amount'] || 0), 0);
      const totalAmount = billsData.reduce((sum, bill) => sum + (bill['Total Amount'] || 0), 0);
      const totalPaid = billsData.reduce((sum, bill) => sum + (bill['Amount Paid'] || 0), 0);
      const totalDue = billsData.reduce((sum, bill) => sum + (bill['Balance Due'] || 0), 0);
      const pendingBills = billsData.filter(bill => bill.Status === 'pending').length;
      const paidBills = billsData.filter(bill => bill.Status === 'paid').length;

      const summaryData = [
        { 'Metric': 'Total Bills', 'Value': totalBills },
        { 'Metric': 'Pending Bills', 'Value': pendingBills },
        { 'Metric': 'Paid Bills', 'Value': paidBills },
        { 'Metric': 'Total Rent Amount', 'Value': totalRent },
        { 'Metric': 'Total Electricity Amount', 'Value': totalElectricity },
        { 'Metric': 'Total Bill Amount', 'Value': totalAmount },
        { 'Metric': 'Total Amount Paid', 'Value': totalPaid },
        { 'Metric': 'Total Balance Due', 'Value': totalDue },
        { 'Metric': 'Collection Rate (%)', 'Value': totalAmount > 0 ? ((totalPaid / totalAmount) * 100).toFixed(2) : 0 }
      ];

      const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Monthly Summary');

      // Auto-size columns for better readability
      workbook.Sheets['Monthly Bills'] && XLSX.utils.sheet_add_aoa(workbook.Sheets['Monthly Bills'], [['']], { origin: 'A1' });
      workbook.Sheets['Tenants'] && XLSX.utils.sheet_add_aoa(workbook.Sheets['Tenants'], [['']], { origin: 'A1' });
      workbook.Sheets['Rooms'] && XLSX.utils.sheet_add_aoa(workbook.Sheets['Rooms'], [['']], { origin: 'A1' });
      workbook.Sheets['Monthly Summary'] && XLSX.utils.sheet_add_aoa(workbook.Sheets['Monthly Summary'], [['']], { origin: 'A1' });

      const fileName = `Shiv_Shiva_Residency_${selectedExportMonth}_Complete_Data.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
      alert(`Monthly data exported successfully!\n\nFile: ${fileName}\n\nSheets included:\n- Monthly Bills\n- Tenants\n- Rooms\n- Monthly Summary`);
      
    } catch (error) {
      console.error('Error exporting monthly data:', error);
      alert('Failed to export monthly data: ' + (error as Error).message);
    }
  };

  const debugTenantsData = () => {
    console.log('=== DEBUG: All Tenants Data ===');
    console.log('allTenants:', allTenants);
    console.log('allTenants length:', allTenants.length);
    
    // Check for Sheetal specifically
    const sheetal = allTenants.find(t => t.name?.toLowerCase().includes('sheetal'));
    console.log('Sheetal found:', sheetal);
    
    // Check all tenants with their joining readings
    allTenants.forEach(tenant => {
      console.log(`Tenant: ${tenant.name}, Room: ${tenant.room_number}, Joining Reading: ${tenant.last_electricity_reading}, ID: ${tenant.id}`);
    });
    
    console.log('=== DEBUG END ===');
  };

  // Serial number generator: start from 1001
  const getBillSerialNumber = (billId: string) => {
    // Check if billId is a very large number that might cause scientific notation
    const billIdNum = parseInt(billId);
    if (billIdNum > 1000000000) {
      console.log('Warning: Large bill ID detected:', billId, 'This might cause display issues');
    }
    
    // Find the index of the bill in the filteredBills array
    const sortedBills = [...filteredBills].sort((a, b) => {
      const dateA = a.generated_date ? new Date(a.generated_date).getTime() : 0;
      const dateB = b.generated_date ? new Date(b.generated_date).getTime() : 0;
      return dateA - dateB;
    });
    const index = sortedBills.findIndex(b => b.id === billId);
    const serialNumber = 1001 + (index >= 0 ? index : 0);
    
    // Debug logging
    console.log('getBillSerialNumber Debug:', {
      billId,
      billIdAsNumber: billIdNum,
      filteredBillsLength: filteredBills.length,
      sortedBillsLength: sortedBills.length,
      index,
      serialNumber
    });
    
    return serialNumber;
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
          <div className="mt-4 lg:mt-0 flex flex-col sm:flex-row gap-3">
            <button
              onClick={createAndFetchBillsForAllTenants}
              disabled={generating}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base font-semibold"
              title="Create tenants and generate bills for all"
            >
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">{generating ? 'Creating...' : 'Create & Generate Bills'}</span>
              <span className="sm:hidden">{generating ? 'Creating...' : 'Create Bills'}</span>
            </button>
            
            <button
              onClick={() => setShowPaymentModal(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors text-sm sm:text-base"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Record Payment</span>
              <span className="sm:hidden">Add Payment</span>
            </button>
            
            <button
              onClick={exportMonthlyData}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors text-sm sm:text-base"
              title="Download monthly data in Excel format"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span className="hidden sm:inline">Download Excel</span>
              <span className="sm:hidden">Excel</span>
            </button>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <label className="text-sm text-golden-300 whitespace-nowrap">Month:</label>
              <input
                type="month"
                value={selectedExportMonth}
                onChange={(e) => setSelectedExportMonth(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 bg-dark-600 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500 text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Auto Reminder System */}
      <AutoReminderSystem onRefresh={fetchData} />

      {/* Quick Status */}
      <div className="bg-dark-900 border border-golden-600/20 rounded-lg p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="text-golden-300">Tenants: </span>
              <span className="text-golden-100 font-semibold">{allTenants.length}</span>
            </div>
            <div className="text-sm">
              <span className="text-golden-300">Bills: </span>
              <span className="text-golden-100 font-semibold">{bills.length}</span>
            </div>
            <div className="text-sm">
              <span className="text-golden-300">Current Month: </span>
              <span className="text-golden-100 font-semibold">{billGeneration.billing_month}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchData}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-500 transition-colors"
            >
              Refresh
            </button>
            <button
              onClick={debugTenantsData}
              className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-500 transition-colors"
            >
              Debug
            </button>
          </div>
        </div>
      </div>

      {/* Bill Generation Section */}
      <div className="bg-dark-900 border border-golden-600/20 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-golden-400 flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Bill Generation & Electricity Management
          </h3>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Electricity Readings */}
          <div className="space-y-4">
            <h4 className="text-golden-300 font-medium">Current Electricity Readings</h4>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {rooms.map((room: any) => (
                <div key={room.room_number} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 bg-dark-800 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="text-golden-100 font-medium text-sm sm:text-base">Room {room.room_number}</div>
                    <div className="text-golden-300 text-xs sm:text-sm truncate">
                      {room.current_tenant ? `Tenant: ${room.current_tenant}` : 'No tenant'}
                    </div>
                  </div>
                  <div className="w-full sm:w-32">
                    <input
                      type="number"
                      placeholder="Reading"
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

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={createAndFetchBillsForAllTenants}
                  disabled={generating}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  {generating ? 'Generating...' : 'Generate Bills'}
                </button>
                
                <button
                  onClick={createSampleTenants}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors text-sm sm:text-base"
                  title="Create sample tenants for testing"
                >
                  <span className="hidden sm:inline">Add Sample Tenants</span>
                  <span className="sm:hidden">Sample Data</span>
                </button>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => {
                    console.log('Current rooms:', rooms);
                    console.log('Current bills:', bills);
                    console.log('Current payments:', payments);
                    alert('Check browser console for data details');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors text-sm sm:text-base"
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
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors text-sm sm:text-base"
                  title="Refresh all data"
                >
                  Refresh Data
                </button>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={checkDatabaseData}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors"
                  title="Check database directly"
                >
                  Check Database
                </button>
                
                <button
                  onClick={quickDatabaseCheck}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-500 transition-colors"
                  title="Quick database check"
                >
                  Quick Check
                </button>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    console.log('=== CURRENT STATE ===');
                    console.log('Rooms state:', rooms);
                    console.log('Bills state:', bills);
                    console.log('Payments state:', payments);
                    console.log('Stats state:', stats);
                    console.log('Current readings:', currentReadings);
                    console.log('Bill generation:', billGeneration);
                    console.log('===================');
                    alert('Current state logged to console');
                  }}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-500 transition-colors"
                  title="Log current state"
                >
                  Log State
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
              <h3 className="text-lg font-semibold text-golden-400">All Bills</h3>
              <button
                onClick={async () => {
                  const updates = Object.entries(currentMonthReadings).map(([roomNumber, reading]) => {
                    const date = readingDates[roomNumber] || new Date().toISOString().slice(0, 10);
                    return updateElectricityReading(roomNumber, reading, date);
                  });
                  await Promise.all(updates);
                  alert('All electricity readings updated successfully!');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors text-sm sm:text-base"
                title="Save all electricity readings"
              >
                <span className="hidden sm:inline">Save All Electricity</span>
                <span className="sm:hidden">Save All</span>
              </button>
            </div>
            
            {/* Search Filter for Bills */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-golden-400" />
                <input
                  type="text"
                  placeholder="Search bills by tenant name or room number..."
                  value={billsSearchTerm}
                  onChange={(e) => setBillsSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 placeholder-golden-400/50 focus:outline-none focus:border-golden-500"
                />
              </div>
              {billsSearchTerm && (
                <div className="mt-2 text-sm text-golden-300">
                  Showing {filteredBills.length} of {bills.length} bills
                </div>
              )}
            </div>
            {loading ? (
              <div className="text-center py-8 text-golden-400">Loading...</div>
            ) : filteredBills.length === 0 ? (
              <div className="text-center py-8 text-golden-400/60">No bills found</div>
            ) : (
              <div className="space-y-4">
                {filteredBills.map((bill) => (
                  <div key={bill.id} className="p-4 bg-dark-800 rounded-lg">
                    {/* Bill Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                      <div className="min-w-0 flex-1">
                        <h4 className="text-golden-100 font-medium text-sm sm:text-base truncate">{bill.tenant_name}</h4>
                        <p className="text-golden-300 text-xs sm:text-sm">Room {bill.room_number} • {bill.billing_month}</p>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        <div className="text-right">
                          <p className="text-base sm:text-lg font-bold text-golden-400">{formatCurrency(bill.total_amount)}</p>
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${getStatusColor(bill.status)}`}>
                            {getStatusIcon(bill.status)}
                            <span className="hidden sm:inline">{bill.status}</span>
                            <span className="sm:hidden">{bill.status.charAt(0).toUpperCase()}</span>
                          </span>
                        </div>
                        <div className="flex gap-1 sm:gap-2">
                          <button
                            onClick={() => openWhatsAppBill(bill)}
                            className="p-1.5 sm:p-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                            title="Send WhatsApp"
                          >
                            <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                          </button>
                          <button
                            onClick={() => viewBillTemplate(bill)}
                            className="p-1.5 sm:p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            title="View Bill"
                          >
                            <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                          </button>
                          <button
                            onClick={() => printBill(bill)}
                            className="p-1.5 sm:p-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                            title="Print Bill"
                          >
                            <Printer className="h-3 w-3 sm:h-4 sm:w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Electricity Input Section */}
                    <div className="bg-dark-700 p-3 rounded-lg border border-golden-600/20">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
                        {/* Joining Reading */}
                        <div>
                          <label className="block text-sm font-medium text-golden-300 mb-1">
                            Joining Reading
                          </label>
                          <input
                            type="text"
                            value={(() => {
                              // Try to find tenant by tenant_id
                              let tenant = allTenants.find(t => t.id === bill.tenant_id);
                              // Fallback: try to match by name and room number if not found
                              if (!tenant) {
                                tenant = allTenants.find(t => t.name?.toLowerCase() === bill.tenant_name?.toLowerCase() && t.room_number === bill.room_number);
                              }
                              // Debug log for Sheetal
                              if (bill.tenant_name?.toLowerCase() === 'sheetal') {
                                console.log('Sheetal bill:', bill);
                                console.log('Sheetal tenant found:', tenant);
                              }
                              if (tenant && tenant.electricity_joining_reading !== undefined && tenant.electricity_joining_reading !== null) {
                                return tenant.electricity_joining_reading.toString();
                              }
                              return 'Not set';
                            })()}
                            readOnly
                            className="w-full px-3 py-2 bg-dark-600 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500 opacity-70 cursor-not-allowed"
                            style={{ backgroundColor: '#222', color: '#FFD700', fontWeight: 'bold' }}
                          />
                        </div>

                        {/* Current Reading */}
                        <div>
                          <label className="block text-sm font-medium text-golden-300 mb-1">
                            Current Reading
                          </label>
                          <input
                            type="number"
                            value={currentMonthReadings[bill.room_number] || (bill.last_electricity_reading?.toString() || '')}
                            onChange={(e) => {
                              setCurrentMonthReadings(prev => ({
                                ...prev,
                                [bill.room_number]: e.target.value
                              }));
                            }}
                            placeholder="Current units"
                            className="w-full px-3 py-2 bg-dark-600 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
                          />
                        </div>

                        {/* Reading Date */}
                        <div>
                          <label className="block text-sm font-medium text-golden-300 mb-1">
                            Reading Date
                          </label>
                          <input
                            type="date"
                            value={readingDates[bill.room_number] || new Date().toISOString().slice(0, 10)}
                            onChange={(e) => {
                              setReadingDates(prev => ({
                                ...prev,
                                [bill.room_number]: e.target.value
                              }));
                            }}
                            className="w-full px-3 py-2 bg-dark-600 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
                          />
                        </div>

                        {/* Consumption */}
                        <div className="text-center">
                          <p className="text-sm text-golden-300">Consumption</p>
                          <p className="text-lg font-bold text-blue-400">
                            {calculateElectricityConsumption(bill.room_number)} units
                          </p>
                        </div>

                        {/* Rate */}
                        <div className="text-center">
                          <p className="text-sm text-golden-300">Rate</p>
                          <p className="text-lg font-bold text-golden-400">₹12/unit</p>
                        </div>

                        {/* Electricity Amount */}
                        <div className="text-center">
                          <p className="text-sm text-golden-300">Electricity Amount</p>
                          <p className="text-lg font-bold text-green-400">
                            ₹{calculateElectricityConsumption(bill.room_number) * 12}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => {
                            const joining = joiningReadings[bill.room_number] || (bill.electricity_joining_reading?.toString() || '0');
                            const current = currentMonthReadings[bill.room_number] || (bill.last_electricity_reading?.toString() || '0');
                            const date = readingDates[bill.room_number] || new Date().toISOString().slice(0, 10);
                            
                            if (!current || current === '0') {
                              alert('Please enter current reading first');
                              return;
                            }
                            
                            updateElectricityReading(bill.room_number, current, date);
                          }}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors"
                        >
                          Update Reading
                        </button>
                        
                        <div className="flex-1 text-right">
                          <p className="text-sm text-golden-300">Rent: ₹{bill.rent_amount || 0}</p>
                          <p className="text-xl font-bold text-golden-400">
                            Total: ₹{(bill.rent_amount || 0) + (calculateElectricityConsumption(bill.room_number) * 12)}
                          </p>
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
            {(() => {
              const serialNum = getBillSerialNumber(selectedBill.id).toString();
              console.log('BillTemplate Debug:', {
                billId: selectedBill.id,
                serialNumber: serialNum,
                bill: selectedBill
              });
              
              // Get electricity readings from UI state
              const joiningReading = joiningReadings[selectedBill.room_number] || selectedBill.electricity_joining_reading || 0;
              const currentReading = currentMonthReadings[selectedBill.room_number] || selectedBill.last_electricity_reading || 0;
              
              // Create a clean bill object with electricity reading data
              const cleanBill = {
                ...selectedBill,
                id: '1001', // Force the ID to be a simple number
                electricity_joining_reading: parseInt(joiningReading.toString()),
                last_electricity_reading: parseInt(currentReading.toString()),
                electricity_units: parseInt(currentReading.toString()) - parseInt(joiningReading.toString()),
                electricity_amount: (parseInt(currentReading.toString()) - parseInt(joiningReading.toString())) * 12
              };
              
              console.log('Clean bill with electricity data:', cleanBill);
              
              return (
                <BillTemplate 
                  bill={cleanBill} 
                  serialNumber="1001" 
                  receiptNumber="TEST-1001"
                  key={`bill-template-${Date.now()}-${Math.random()}`}
                />
              );
            })()}
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
                {`🏠 *Shiv Shiva Residency - Bill*\n\nDear ${whatsAppBill.tenant_name},\n\nYour bill for Room ${whatsAppBill.room_number} is ready.\n\n💰 Total Amount: ₹${formatCurrency(whatsAppBill.total_amount)}\n\nPlease make the payment on time.\n\nThank you,\nShiv Shiva Residency Team`}
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  const message = `🏠 *Shiv Shiva Residency - Bill*\n\nDear ${whatsAppBill.tenant_name},\n\nYour bill for Room ${whatsAppBill.room_number} is ready.\n\n💰 Total Amount: ₹${formatCurrency(whatsAppBill.total_amount)}\n\nPlease make the payment on time.\n\nThank you,\nShiv Shiva Residency Team`;
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
                  const message = `🏠 *Shiv Shiva Residency - Bill*\n\nDear ${whatsAppBill.tenant_name},\n\nYour bill for Room ${whatsAppBill.room_number} is ready.\n\n💰 Total Amount: ₹${formatCurrency(whatsAppBill.total_amount)}\n\nPlease make the payment on time.\n\nThank you,\nShiv Shiva Residency Team`;
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

      {/* Add debug buttons in the UI */}
      <div className="flex flex-col sm:flex-row gap-2 mt-4">
        <button
          onClick={debugTenantsData}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors text-sm sm:text-base"
          title="Debug tenants data"
        >
          Debug Tenants
        </button>
        
        <button 
          onClick={() => {
            if (selectedBill) {
              console.log('Selected Bill Debug:', selectedBill);
              console.log('Serial Number for selected bill:', getBillSerialNumber(selectedBill.id));
            } else {
              console.log('No bill selected');
            }
          }} 
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors text-sm sm:text-base" 
          title="Debug selected bill"
        >
          Debug Selected Bill
        </button>
      </div>
    </div>
  );
};

export default Payments; 