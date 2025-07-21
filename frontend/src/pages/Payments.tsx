import { useState, useEffect } from 'react';
import { Search, Plus, Filter, Calendar, IndianRupee, FileText, Receipt, CreditCard, Smartphone, Building2, DollarSign, TrendingUp, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import axios from 'axios';

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
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
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

  useEffect(() => {
    fetchData();
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
      const params = new URLSearchParams();
      if (monthFilter) params.append('billing_month', monthFilter);
      if (statusFilter) params.append('status', statusFilter);
      if (methodFilter) params.append('payment_method', methodFilter);
      
      const response = await axios.get(`/api/payments?${params}`);
      setPayments(response.data.payments || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  const fetchBills = async () => {
    try {
      const params = new URLSearchParams();
      if (monthFilter) params.append('billing_month', monthFilter);
      if (statusFilter) params.append('status', statusFilter);
      
      const response = await axios.get(`/api/payments/bills?${params}`);
      setBills(response.data.bills || []);
    } catch (error) {
      console.error('Error fetching bills:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/payments/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const generateBills = async () => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    try {
      const response = await axios.post('/api/payments/bills/generate', {
        billing_month: currentMonth,
        electricity_rate: 8
      });
      
      alert(`Generated ${response.data.bills?.length || 0} bills for ${currentMonth}`);
      fetchData();
    } catch (error: any) {
      console.error('Error generating bills:', error);
      alert(error.response?.data?.error || 'Failed to generate bills');
    }
  };

  const recordPayment = async (paymentData: any) => {
    try {
      await axios.post('/api/payments', paymentData);
      fetchData();
      setShowPaymentModal(false);
      setSelectedBill(null);
    } catch (error: any) {
      console.error('Error recording payment:', error);
      alert(error.response?.data?.error || 'Failed to record payment');
    }
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
            <button
              onClick={generateBills}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FileText className="h-4 w-4" />
              Generate Bills
            </button>
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
            {Object.entries(stats.monthly_collection).slice(-12).map(([month, amount]) => (
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
                              const response = await axios.get(`/api/payments/receipt/${payment.id}`);
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
    }
  }, [bill]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-dark-900 border border-golden-600/20 rounded-xl w-full max-w-2xl">
        <div className="flex items-center justify-between p-6 border-b border-golden-600/20">
          <h2 className="text-xl font-semibold text-golden-400">Record Payment</h2>
          <button onClick={onClose} className="text-golden-300 hover:text-golden-100">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-golden-300 mb-2">Tenant Name</label>
              <input
                type="text"
                required
                value={formData.tenant_name}
                onChange={(e) => setFormData({ ...formData, tenant_name: e.target.value })}
                className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-golden-300 mb-2">Room Number</label>
              <input
                type="text"
                required
                value={formData.room_number}
                onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-golden-300 mb-2">Billing Month</label>
              <input
                type="month"
                required
                value={formData.billing_month}
                onChange={(e) => setFormData({ ...formData, billing_month: e.target.value })}
                className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-golden-300 mb-2">Payment Date</label>
              <input
                type="date"
                required
                value={formData.payment_date}
                onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-golden-300 mb-2">Total Amount</label>
              <input
                type="number"
                required
                value={formData.total_amount}
                onChange={(e) => setFormData({ ...formData, total_amount: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-golden-300 mb-2">Amount Paid</label>
              <input
                type="number"
                required
                value={formData.amount_paid}
                onChange={(e) => setFormData({ ...formData, amount_paid: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-golden-300 mb-2">Payment Method</label>
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
              <label className="block text-sm font-medium text-golden-300 mb-2">Transaction ID (Optional)</label>
              <input
                type="text"
                value={formData.transaction_id}
                onChange={(e) => setFormData({ ...formData, transaction_id: e.target.value })}
                className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-golden-300 mb-2">Notes (Optional)</label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
            />
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-golden-600/20">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-golden-300 border border-golden-600/30 rounded-lg hover:bg-golden-600/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-golden-500 to-golden-600 text-dark-900 rounded-lg hover:from-golden-600 hover:to-golden-700 transition-all duration-200 font-medium"
            >
              Record Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Payments; 