import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Phone, 
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  Info,
  FileText
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { roomsQueries, paymentsQueries } from '../lib/supabaseQueries';
import { useAuth } from '../contexts/AuthContext';
// import AutoReminderSystem from '../components/AutoReminderSystem';
import PaymentModal from '../components/PaymentModal';
import BillDownload from '../components/BillDownload';

interface Payment {
  id: string;
  tenant_id: string;
  tenant_name: string;
  room_number: string;
  billing_month: string;
  amount: number;
  payment_date?: string;
  payment_method?: string;
  transaction_id?: string;
  status: 'pending' | 'paid' | 'overdue' | 'partial';
  remarks?: string;
  created_at: string;
  created_by?: string;
  due_date?: string;
}

interface PaymentStats {
  total: number;
  pending: number;
  paid: number;
  overdue: number;
  partial: number;
  totalAmount: number;
  collectedAmount: number;
  pendingAmount: number;
  overdueAmount: number;
}

interface Room {
  id: string;
  room_number: string;
  floor: number;
  type: string;
  capacity: number;
  current_occupancy: number;
  monthly_rent: number;
  security_deposit: number;
  status: string;
  tenants: {
    id: string;
    name: string;
    allocated_date: string;
    monthly_rent?: number;
    security_deposit?: number;
  }[];
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(amount);
};

const Payments: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [payments, setPayments] = useState<Payment[]>([]);
  const [bills, setBills] = useState<Payment[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [stats, setStats] = useState<PaymentStats>({
    total: 0,
    pending: 0,
    paid: 0,
    overdue: 0,
    partial: 0,
    totalAmount: 0,
    collectedAmount: 0,
    pendingAmount: 0,
    overdueAmount: 0
  });
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showBillDownload, setShowBillDownload] = useState(false);
  const [selectedBillForDownload, setSelectedBillForDownload] = useState<Payment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [generatingBills, setGeneratingBills] = useState(false);

  useEffect(() => {
    fetchPayments();
    fetchBills();
    fetchStats();
    fetchRooms();
  }, []);

  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  const fetchBills = async () => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .in('status', ['pending', 'overdue'])
        .order('created_at', { ascending: true });

      if (error) throw error;
      setBills(data || []);
    } catch (error) {
      console.error('Error fetching bills:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*');

      if (error) throw error;

      const payments = data || [];
      const total = payments.length;
      const pending = payments.filter(p => p.status === 'pending').length;
      const paid = payments.filter(p => p.status === 'paid').length;
      const overdue = payments.filter(p => p.status === 'overdue').length;
      const partial = payments.filter(p => p.status === 'partial').length;

      const totalAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
      const collectedAmount = payments
        .filter(p => p.status === 'paid')
        .reduce((sum, p) => sum + (p.amount || 0), 0);
      const pendingAmount = payments
        .filter(p => p.status === 'pending')
        .reduce((sum, p) => sum + (p.amount || 0), 0);
      const overdueAmount = payments
        .filter(p => p.status === 'overdue')
        .reduce((sum, p) => sum + (p.amount || 0), 0);

      setStats({
        total,
        pending,
        paid,
        overdue,
        partial,
        totalAmount,
        collectedAmount,
        pendingAmount,
        overdueAmount
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const roomsData = await roomsQueries.getAll();
      setRooms(roomsData || []);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const generateBills = async () => {
    try {
      setGeneratingBills(true);
      console.log('🔧 Starting bill generation...');

      // Get current month and next month
      const now = new Date();
      const currentMonth = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
      const nextMonth = now.getFullYear() + '-' + String(now.getMonth() + 2).padStart(2, '0');

      console.log(`📅 Current month: ${currentMonth}, Next month: ${nextMonth}`);

      // Fetch all active tenants
      const { data: tenants, error: tenantError } = await supabase
        .from('tenants')
        .select('*')
        .eq('status', 'active');

      if (tenantError) throw tenantError;

      console.log(`👥 Found ${tenants?.length || 0} active tenants`);

      if (!tenants || tenants.length === 0) {
        alert('No active tenants found to generate bills for.');
        return;
      }

      // Check if bills already exist for current month
      const { data: existingBills, error: checkError } = await supabase
        .from('payments')
        .select('tenant_id')
        .eq('billing_month', currentMonth);

      if (checkError) throw checkError;

      const existingBillCount = existingBills?.length || 0;
      console.log(`📊 Found ${existingBillCount} existing bills for ${currentMonth}`);

      // If bills exist for current month, ask user what to do
      if (existingBillCount > 0) {
        const userChoice = confirm(
          `Bills already exist for ${currentMonth} (${existingBillCount} bills).\n\n` +
          `Click OK to generate bills for ${nextMonth} (next month)\n` +
          `Click Cancel to regenerate bills for ${currentMonth} (will replace existing)`
        );

        if (userChoice) {
          // Generate for next month
          await generateBillsForMonth(tenants, nextMonth);
        } else {
          // Regenerate for current month
          await generateBillsForMonth(tenants, currentMonth, true);
        }
      } else {
        // No existing bills, generate for current month
        await generateBillsForMonth(tenants, currentMonth);
      }

    } catch (error) {
      console.error('❌ Error generating bills:', error);
      alert('Failed to generate bills. Please check the console for details.');
    } finally {
      setGeneratingBills(false);
    }
  };

  const generateBillsForMonth = async (tenants: any[], month: string, replaceExisting: boolean = false) => {
    try {
      console.log(`🔧 Generating bills for ${month}${replaceExisting ? ' (replacing existing)' : ''}`);

      if (replaceExisting) {
        // Delete existing bills for this month
        const { error: deleteError } = await supabase
          .from('payments')
          .delete()
          .eq('billing_month', month);

        if (deleteError) throw deleteError;
        console.log(`🗑️ Deleted existing bills for ${month}`);
      }

      let successCount = 0;
      let errorCount = 0;

      for (const tenant of tenants) {
        try {
          console.log(`📝 Processing tenant: ${tenant.name} (Room ${tenant.room_number})`);

          // Check if bill already exists for this month (if not replacing)
          if (!replaceExisting) {
            const { data: existingBill, error: checkError } = await supabase
              .from('payments')
              .select('id')
              .eq('tenant_id', tenant.id)
              .eq('billing_month', month)
              .single();

            if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
              throw checkError;
            }

            if (existingBill) {
              console.log(`⏭️ Bill already exists for ${tenant.name} in ${month}, skipping...`);
              continue;
            }
          }

          // Calculate due date based on tenant joining date
          let dueDate;
          if (tenant.joining_date) {
            const joiningDate = new Date(tenant.joining_date);
            const [year, monthStr] = month.split('-');
            const targetMonth = parseInt(monthStr);
            const targetYear = parseInt(year);
            
            // Set due date to same day of month as joining date
            dueDate = new Date(targetYear, targetMonth - 1, joiningDate.getDate());
            
            // Handle edge cases (e.g., 31st in February)
            if (dueDate.getMonth() !== targetMonth - 1) {
              dueDate = new Date(targetYear, targetMonth, 0); // Last day of month
            }
            
            // Format as YYYY-MM-DD in local timezone
            const yearStr = dueDate.getFullYear();
            const monthStr2 = String(dueDate.getMonth() + 1).padStart(2, '0');
            const dayStr = String(dueDate.getDate()).padStart(2, '0');
            dueDate = `${yearStr}-${monthStr2}-${dayStr}`;
          } else {
            // Fallback: use end of month if no joining date
            const [year, monthStr] = month.split('-');
            const lastDay = new Date(parseInt(year), parseInt(monthStr), 0);
            const yearStr = lastDay.getFullYear();
            const monthStr2 = String(lastDay.getMonth() + 1).padStart(2, '0');
            const dayStr = String(lastDay.getDate()).padStart(2, '0');
            dueDate = `${yearStr}-${monthStr2}-${dayStr}`;
          }

          console.log(`📅 Due date for ${tenant.name}: ${dueDate}`);

          // Create bill record with due date
          const billData = {
            tenant_id: tenant.id,
            tenant_name: tenant.name,
            room_number: tenant.room_number,
            billing_month: month,
            amount: tenant.monthly_rent || 0,
            status: 'pending',
            remarks: `Monthly rent for ${month} (Due: ${dueDate})`,
            due_date: dueDate // Store as YYYY-MM-DD
          };

          const { error: insertError } = await supabase
            .from('payments')
            .insert([billData]);

          if (insertError) {
            console.error(`❌ Error creating bill for ${tenant.name}:`, insertError);
            errorCount++;
          } else {
            console.log(`✅ Created bill for ${tenant.name}: ₹${tenant.monthly_rent}`);
            successCount++;
          }
        } catch (error) {
          console.error(`❌ Error processing tenant ${tenant.name}:`, error);
          errorCount++;
        }
      }

      console.log(`📊 Bill generation complete: ${successCount} successful, ${errorCount} failed`);
      
      if (successCount > 0) {
        alert(`Successfully generated ${successCount} bills for ${month}${errorCount > 0 ? ` (${errorCount} failed)` : ''}`);
        handleRefresh(); // Refresh the bills list
      } else {
        alert('No bills were generated. Please check the console for details.');
      }

    } catch (error) {
      console.error('❌ Error in generateBillsForMonth:', error);
      throw error;
    }
  };

  const recordPayment = async (paymentData: any) => {
    try {
      const { error } = await supabase
        .from('payments')
        .update({
          status: 'paid',
          payment_method: paymentData.payment_method,
          payment_date: paymentData.payment_date,
          transaction_id: paymentData.transaction_id,
          remarks: paymentData.notes
        })
        .eq('id', paymentData.bill_id);

      if (error) throw error;

      alert('Payment recorded successfully!');
      fetchPayments();
      fetchBills();
      fetchStats();
    } catch (error) {
      console.error('Error recording payment:', error);
      alert('Failed to record payment');
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.tenant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.room_number.includes(searchTerm);
    const matchesStatus = !statusFilter || payment.status === statusFilter;
    const matchesMonth = !monthFilter || payment.billing_month === monthFilter;
    const matchesMethod = !methodFilter || payment.payment_method === methodFilter;
    
    return matchesSearch && matchesStatus && matchesMonth && matchesMethod;
  });

  const filteredBills = bills.filter(bill => {
    const matchesSearch = bill.tenant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bill.room_number.includes(searchTerm);
    const matchesStatus = !statusFilter || bill.status === statusFilter;
    const matchesMonth = !monthFilter || bill.billing_month === monthFilter;
    
    // Date filtering logic
    let matchesDate = true;
    if (dateFilter) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      let billDueDate;
      if (bill.due_date) {
        billDueDate = new Date(bill.due_date);
      } else {
        // Calculate due date from billing month (end of month)
        const [year, month] = bill.billing_month.split('-');
        billDueDate = new Date(parseInt(year), parseInt(month), 0);
      }
      billDueDate.setHours(0, 0, 0, 0);
      
      switch (dateFilter) {
        case 'today':
          matchesDate = billDueDate.getTime() === today.getTime();
          break;
        case 'tomorrow':
          matchesDate = billDueDate.getTime() === tomorrow.getTime();
          break;
        case 'this-week':
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay());
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          matchesDate = billDueDate >= weekStart && billDueDate <= weekEnd;
          break;
        case 'next-week':
          const nextWeekStart = new Date(today);
          nextWeekStart.setDate(today.getDate() + (7 - today.getDay()));
          const nextWeekEnd = new Date(nextWeekStart);
          nextWeekEnd.setDate(nextWeekStart.getDate() + 6);
          matchesDate = billDueDate >= nextWeekStart && billDueDate <= nextWeekEnd;
          break;
        case 'overdue':
          matchesDate = billDueDate < today;
          break;
        case 'upcoming':
          matchesDate = billDueDate >= today;
          break;
        default:
          // Custom date filter (YYYY-MM-DD format)
          if (dateFilter.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const filterDate = new Date(dateFilter);
            filterDate.setHours(0, 0, 0, 0);
            matchesDate = billDueDate.getTime() === filterDate.getTime();
          }
      }
    }
    
    return matchesSearch && matchesStatus && matchesMonth && matchesDate;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'text-green-400 bg-green-400/10';
      case 'pending':
        return 'text-yellow-400 bg-yellow-400/10';
      case 'overdue':
        return 'text-red-400 bg-red-400/10';
      case 'partial':
        return 'text-orange-400 bg-orange-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'overdue':
        return <AlertCircle className="h-4 w-4" />;
      case 'partial':
        return <DollarSign className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const handleRefresh = () => {
    fetchPayments();
    fetchBills();
    fetchStats();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Automatic Payment Reminder System */}
      {/* <AutoReminderSystem onRefresh={handleRefresh} /> */}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-golden-400">Payments & Billing</h1>
          <p className="text-golden-300">Manage rent payments, generate bills, and track collections</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={generateBills}
            disabled={generatingBills}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {generatingBills ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Generating...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Generate Bills
              </>
            )}
          </button>
          <button
            onClick={() => setShowPaymentModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-golden-600 text-white rounded-lg hover:bg-golden-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Record Payment
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div 
          onClick={() => setStatusFilter('')}
          className="bg-dark-900 border border-golden-600/20 rounded-lg p-6 cursor-pointer hover:border-golden-500 transition-all duration-200 group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-golden-300 text-sm">Total Bills</p>
              <p className="text-2xl font-bold text-golden-400">{stats.total}</p>
            </div>
            <div className="text-golden-400 group-hover:text-golden-300">
              <ArrowUpRight className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div 
          onClick={() => setStatusFilter('pending')}
          className="bg-dark-900 border border-golden-600/20 rounded-lg p-6 cursor-pointer hover:border-golden-500 transition-all duration-200 group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-golden-300 text-sm">Pending</p>
              <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
            </div>
            <div className="text-golden-400 group-hover:text-golden-300">
              <ArrowUpRight className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div 
          onClick={() => setStatusFilter('paid')}
          className="bg-dark-900 border border-golden-600/20 rounded-lg p-6 cursor-pointer hover:border-golden-500 transition-all duration-200 group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-golden-300 text-sm">Collected</p>
              <p className="text-2xl font-bold text-green-400">{formatCurrency(stats.collectedAmount)}</p>
            </div>
            <div className="text-golden-400 group-hover:text-golden-300">
              <ArrowUpRight className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div 
          onClick={() => setStatusFilter('overdue')}
          className="bg-dark-900 border border-golden-600/20 rounded-lg p-6 cursor-pointer hover:border-golden-500 transition-all duration-200 group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-golden-300 text-sm">Overdue</p>
              <p className="text-2xl font-bold text-red-400">{formatCurrency(stats.overdueAmount)}</p>
            </div>
            <div className="text-golden-400 group-hover:text-golden-300">
              <ArrowUpRight className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-dark-900 border border-golden-600/20 rounded-lg p-6 mb-8">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-golden-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by tenant name or room number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
              />
            </div>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="partial">Partial</option>
          </select>

          <select
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
          >
            <option value="">All Months</option>
            <option value="2025-01">January 2025</option>
            <option value="2025-02">February 2025</option>
            <option value="2025-03">March 2025</option>
            <option value="2025-04">April 2025</option>
            <option value="2025-05">May 2025</option>
            <option value="2025-06">June 2025</option>
            <option value="2025-07">July 2025</option>
            <option value="2025-08">August 2025</option>
            <option value="2025-09">September 2025</option>
            <option value="2025-10">October 2025</option>
            <option value="2025-11">November 2025</option>
            <option value="2025-12">December 2025</option>
          </select>

          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
          >
            <option value="">All Methods</option>
            <option value="cash">Cash</option>
            <option value="upi">UPI</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="cheque">Cheque</option>
          </select>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
          >
            <option value="">All Dates</option>
            <option value="today">Today</option>
            <option value="tomorrow">Tomorrow</option>
            <option value="this-week">This Week</option>
            <option value="next-week">Next Week</option>
            <option value="overdue">Overdue</option>
            <option value="upcoming">Upcoming</option>
          </select>

          <input
            type="date"
            value={dateFilter.match(/^\d{4}-\d{2}-\d{2}$/) ? dateFilter : ''}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
            placeholder="Custom Date"
          />

          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('');
              setMonthFilter('');
              setMethodFilter('');
              setDateFilter('');
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Bills Table */}
      <div className="bg-dark-900 border border-golden-600/20 rounded-lg overflow-hidden">
        <div className="p-6 border-b border-golden-600/20">
          <h2 className="text-xl font-semibold text-golden-400">Pending Bills</h2>
          <p className="text-golden-300 text-sm">Bills that need to be paid</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-800 border-b border-golden-600/20">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-golden-400">Room & Tenant</th>
                <th className="text-left py-3 px-4 font-medium text-golden-400">Bill Month</th>
                <th className="text-left py-3 px-4 font-medium text-golden-400">Due Date</th>
                <th className="text-left py-3 px-4 font-medium text-golden-400">Amount</th>
                <th className="text-left py-3 px-4 font-medium text-golden-400">Status</th>
                <th className="text-left py-3 px-4 font-medium text-golden-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-golden-600/10">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-golden-400">
                    Loading bills...
                  </td>
                </tr>
              ) : filteredBills.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-golden-400/60">
                    No pending bills found
                  </td>
                </tr>
              ) : (
                filteredBills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-dark-800/50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-golden-100">Room {bill.room_number}</p>
                        <p className="text-sm text-golden-300">{bill.tenant_name}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-golden-300">{bill.billing_month}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-golden-400" />
                        <span className="text-golden-300">
                          {bill.due_date ? 
                            new Date(bill.due_date).toLocaleDateString('en-IN') :
                            (() => {
                              const [year, month] = bill.billing_month.split('-');
                              const dueDate = new Date(parseInt(year), parseInt(month), 0);
                              return dueDate.toLocaleDateString('en-IN');
                            })()
                          }
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-golden-100">{formatCurrency(bill.amount)}</p>
                        <p className="text-sm text-golden-300">
                          {bill.remarks || 'Monthly rent'}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(bill.status)}`}>
                        {getStatusIcon(bill.status)}
                        {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedPayment(bill);
                            setShowPaymentModal(true);
                          }}
                          className="flex items-center gap-1 px-2 py-1 text-blue-400 border border-blue-600/30 rounded text-sm hover:bg-blue-600/10 transition-colors"
                        >
                          <DollarSign className="h-3 w-3" />
                          Pay
                        </button>
                        <button
                          onClick={async () => {
                            // Fetch tenant mobile number first
                            try {
                              const { data: tenant, error } = await supabase
                                .from('tenants')
                                .select('mobile')
                                .eq('id', bill.tenant_id)
                                .single();

                              if (error) {
                                console.error('Error fetching tenant mobile:', error);
                                alert('Could not fetch tenant mobile number');
                                return;
                              }

                              if (!tenant?.mobile) {
                                alert('Tenant mobile number not found');
                                return;
                              }

                              // Calculate due date (use stored due_date or fallback to end of month)
                              let dueDateStr;
                              if (bill.due_date) {
                                dueDateStr = new Date(bill.due_date).toLocaleDateString('en-IN');
                              } else {
                                const [year, month] = bill.billing_month.split('-');
                                const dueDate = new Date(parseInt(year), parseInt(month), 0);
                                dueDateStr = dueDate.toLocaleDateString('en-IN');
                              }

                              // WhatsApp reminder functionality
                              const message = `🏠 *Shiv Shiva Residency - Payment Reminder*\n\nDear ${bill.tenant_name},\n\nYour rent payment of *₹${formatCurrency(bill.amount)}* for Room ${bill.room_number} for ${bill.billing_month} is pending.\n\n📅 Due Date: ${dueDateStr}\n💰 Amount: ₹${formatCurrency(bill.amount)}\n\nPlease ensure timely payment to avoid any late fees.\n\nThank you,\nShiv Shiva Residency Team`;
                              const encodedMessage = encodeURIComponent(message);
                              window.open(`https://wa.me/91${tenant.mobile}?text=${encodedMessage}`, '_blank');
                            } catch (error) {
                              console.error('Error in WhatsApp reminder:', error);
                              alert('Error sending WhatsApp reminder');
                            }
                          }}
                          className="flex items-center gap-1 px-2 py-1 text-green-400 border border-green-600/30 rounded text-sm hover:bg-green-600/10 transition-colors"
                        >
                          <Phone className="h-3 w-3" />
                          WhatsApp
                        </button>
                        <button
                          onClick={() => {
                            setSelectedBillForDownload(bill);
                            setShowBillDownload(true);
                          }}
                          className="flex items-center gap-1 px-2 py-1 text-purple-400 border border-purple-600/30 rounded text-sm hover:bg-purple-600/10 transition-colors"
                        >
                          <FileText className="h-3 w-3" />
                          Download
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

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        payment={selectedPayment}
        onPaymentRecorded={recordPayment}
        rooms={rooms}
        isAdmin={isAdmin}
      />

      {/* Bill Download Modal */}
      {showBillDownload && selectedBillForDownload && (
        <BillDownload
          bill={selectedBillForDownload}
          onClose={() => {
            setShowBillDownload(false);
            setSelectedBillForDownload(null);
          }}
        />
      )}
    </div>
  );
};

export default Payments;