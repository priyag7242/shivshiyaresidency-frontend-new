import React, { useState, useEffect } from 'react';
import { X, Search, Phone, Calendar, DollarSign, Info, Download } from 'lucide-react';
import { supabase } from '../lib/supabase';

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

interface Tenant {
  id: string;
  name: string;
  mobile: string;
  room_number: string;
  status: string;
  monthly_rent: number;
  security_deposit: number;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment?: Payment | null;
  onPaymentRecorded: (paymentData: any) => void;
  rooms: Room[];
  isAdmin?: boolean;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(amount);
};

const PaymentModal: React.FC<PaymentModalProps> = ({ 
  isOpen, 
  onClose, 
  payment, 
  onPaymentRecorded, 
  rooms,
  isAdmin = false
}) => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [selectedTenant, setSelectedTenant] = useState<string>('');
  const [selectedBill, setSelectedBill] = useState<Payment | null>(null);
  const [bills, setBills] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Payment form data
  const [paymentData, setPaymentData] = useState({
    payment_amount: '',
    payment_method: 'cash',
    payment_date: new Date().toISOString().split('T')[0],
    transaction_id: '',
    notes: '',
    electricity_units: '',
  });

  useEffect(() => {
    if (isOpen) {
      fetchTenants();
      if (payment) {
        setSelectedBill(payment);
        setSelectedTenant(payment.tenant_id);
        setSelectedRoom(payment.room_number);
        setPaymentData(prev => ({
          ...prev,
          payment_amount: payment.amount.toString()
        }));
      }
    }
  }, [isOpen, payment]);

  const fetchTenants = async () => {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('status', 'active')
        .order('name');

      if (error) throw error;
      setTenants(data || []);
    } catch (error) {
      console.error('Error fetching tenants:', error);
    }
  };

  const handleRoomTenantSelect = async (roomNumber: string, tenantId: string) => {
    try {
      setLoading(true);
      setSelectedRoom(roomNumber);
      setSelectedTenant(tenantId);

      // Get tenant details
      const tenant = tenants.find(t => t.id === tenantId);
      if (!tenant) return;

      // First populate with basic tenant details
      setPaymentData(prev => ({
        ...prev,
        payment_amount: tenant.monthly_rent.toString()
      }));

      // Try to fetch existing bills for this tenant
      try {
        const { data: tenantBills, error } = await supabase
          .from('payments')
          .select('*')
          .eq('tenant_id', tenantId)
          .in('status', ['pending', 'overdue'])
          .order('due_date', { ascending: true });

        if (error) {
          console.log('No bills table or error fetching bills:', error);
          // If bills table doesn't exist, create a dummy bill
          const dummyBill: Payment = {
            id: 'dummy',
            tenant_id: tenantId,
            tenant_name: tenant.name,
            room_number: roomNumber,
            billing_month: new Date().toISOString().slice(0, 7),
            amount: tenant.monthly_rent,
            status: 'pending',
            created_at: new Date().toISOString(),
            remarks: `Monthly rent for ${new Date().toISOString().slice(0, 7)}`
          };
          setBills([dummyBill]);
          setSelectedBill(dummyBill);
        } else {
          setBills(tenantBills || []);
          if (tenantBills && tenantBills.length > 0) {
            setSelectedBill(tenantBills[0]);
            setPaymentData(prev => ({
              ...prev,
              payment_amount: tenantBills[0].amount.toString()
            }));
          }
        }
      } catch (error) {
        console.log('Error fetching bills, using tenant data:', error);
        // Create dummy bill from tenant data
        const dummyBill: Payment = {
          id: 'dummy',
          tenant_id: tenantId,
          tenant_name: tenant.name,
          room_number: roomNumber,
          billing_month: new Date().toISOString().slice(0, 7),
          amount: tenant.monthly_rent,
          status: 'pending',
          created_at: new Date().toISOString(),
          remarks: `Monthly rent for ${new Date().toISOString().slice(0, 7)}`
        };
        setBills([dummyBill]);
        setSelectedBill(dummyBill);
      }
    } catch (error) {
      console.error('Error handling room/tenant selection:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setPaymentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBill) return;

    try {
      setLoading(true);

      const paymentRecord = {
        bill_id: selectedBill.id,
        payment_amount: parseFloat(paymentData.payment_amount),
        payment_method: paymentData.payment_method,
        payment_date: paymentData.payment_date,
        transaction_id: paymentData.transaction_id,
        notes: paymentData.notes,
        electricity_units: paymentData.electricity_units ? parseInt(paymentData.electricity_units) : undefined,
        electricity_amount: paymentData.electricity_units ? parseInt(paymentData.electricity_units) * 12 : undefined,
      };

      await onPaymentRecorded(paymentRecord);
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error recording payment:', error);
      alert('Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedRoom('');
    setSelectedTenant('');
    setSelectedBill(null);
    setBills([]);
    setPaymentData({
      payment_amount: '',
      payment_method: 'cash',
      payment_date: new Date().toISOString().split('T')[0],
      transaction_id: '',
      notes: '',
      electricity_units: '',
    });
  };

  const fetchTenantPhone = async (tenantId: string) => {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('mobile')
        .eq('id', tenantId)
        .single();

      if (error) {
        console.log('Error fetching tenant phone:', error);
        return '';
      }

      return data?.mobile || '';
    } catch (error) {
      console.error('Error fetching tenant phone:', error);
      return '';
    }
  };

  const openWhatsAppBill = async () => {
    if (!selectedBill) return;

    const phone = await fetchTenantPhone(selectedBill.tenant_id);
    if (!phone) {
      alert('Phone number not available for this tenant');
      return;
    }

    const message = `🏠 *Shiv Shiva Residency - Bill Details*\n\n` +
      `Dear ${selectedBill.tenant_name},\n\n` +
      `*Bill Details:*\n` +
      `📅 Month: ${selectedBill.billing_month}\n` +
      `🏠 Room: ${selectedBill.room_number}\n` +
      `💰 Total Amount: ₹${formatCurrency(selectedBill.amount)}\n\n` +
      `📅 Created: ${new Date(selectedBill.created_at).toLocaleDateString()}\n` +
      `📝 Remarks: ${selectedBill.remarks || 'Monthly rent'}\n\n` +
      `Please ensure timely payment to avoid any late fees.\n\n` +
      `Thank you,\nShiv Shiva Residency Team`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/91${phone}?text=${encodedMessage}`, '_blank');
  };

  const filteredTenants = tenants.filter(tenant => 
    tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.room_number.includes(searchTerm)
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-dark-900 border border-golden-600/20 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-golden-600/20">
          <div>
            <h2 className="text-xl font-semibold text-golden-400">
              {payment ? 'Record Payment' : 'Record New Payment'}
            </h2>
            <p className="text-golden-300 text-sm">
              {payment ? 'Update payment details' : 'Select tenant and record payment'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-golden-300 hover:text-golden-100 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="p-6 space-y-6">
            {/* Room/Tenant Selection */}
            {!payment && (
              <div>
                <h3 className="text-lg font-medium text-golden-400 mb-4 flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Select Room & Tenant
                </h3>

                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-golden-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search by tenant name or room number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
                  />
                </div>

                {/* Tenant List */}
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {filteredTenants.map(tenant => (
                    <button
                      key={tenant.id}
                      onClick={() => handleRoomTenantSelect(tenant.room_number, tenant.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedTenant === tenant.id
                          ? 'border-golden-500 bg-golden-500/10'
                          : 'border-golden-600/30 hover:border-golden-500/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-golden-100">{tenant.name}</div>
                          <div className="text-golden-300 text-sm">Room {tenant.room_number}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-golden-100">₹{formatCurrency(tenant.monthly_rent)}</div>
                          <div className="text-golden-300 text-sm">{tenant.mobile}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {filteredTenants.length === 0 && (
                  <div className="text-center py-4 text-golden-400/60">
                    <p>No tenants found</p>
                  </div>
                )}
              </div>
            )}

            {/* Bill Details */}
            {selectedBill && (
              <div>
                <h3 className="text-lg font-medium text-golden-400 mb-4 flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Bill Details
                </h3>

                <div className="bg-dark-800 border border-golden-600/30 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-golden-100 mb-2">{selectedBill.tenant_name}</h4>
                      <p className="text-golden-300 text-sm">Room {selectedBill.room_number}</p>
                      <p className="text-golden-300 text-sm">Month: {selectedBill.billing_month}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-golden-400">
                        ₹{formatCurrency(selectedBill.amount)}
                      </div>
                      <div className="text-golden-300 text-sm">
                        Created: {new Date(selectedBill.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-golden-600/20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-golden-300">Amount:</span>
                        <div className="text-golden-100">₹{formatCurrency(selectedBill.amount)}</div>
                      </div>
                      <div>
                        <span className="text-golden-300">Remarks:</span>
                        <div className="text-golden-100">{selectedBill.remarks || 'Monthly rent'}</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={openWhatsAppBill}
                      className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                    >
                      <Phone className="h-4 w-4" />
                      Send WhatsApp Bill
                    </button>
                    <button
                      onClick={() => {
                        // Download bill functionality
                        alert('Bill download feature will be implemented soon');
                      }}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      Download Bill
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Form */}
            {selectedBill && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-lg font-medium text-golden-400 flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Payment Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-golden-300 text-sm mb-2">Payment Amount</label>
                    <input
                      type="number"
                      value={paymentData.payment_amount}
                      onChange={(e) => handleInputChange('payment_amount', e.target.value)}
                      className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
                      placeholder="Enter amount"
                      required
                    />
                  </div>
                  {isAdmin && (
                    <div>
                      <label className="block text-golden-300 text-sm mb-2">Electricity Units</label>
                      <input
                        type="number"
                        value={paymentData.electricity_units}
                        onChange={(e) => handleInputChange('electricity_units', e.target.value)}
                        className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
                        placeholder="Enter units"
                      />
                      <div className="text-golden-300 text-xs mt-1">
                        Electricity Amount: ₹{paymentData.electricity_units ? parseInt(paymentData.electricity_units) * 12 : 0}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-golden-300 text-sm mb-2">Payment Method</label>
                    <select
                      value={paymentData.payment_method}
                      onChange={(e) => handleInputChange('payment_method', e.target.value)}
                      className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
                    >
                      <option value="cash">Cash</option>
                      <option value="upi">UPI</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="cheque">Cheque</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-golden-300 text-sm mb-2">Payment Date</label>
                    <input
                      type="date"
                      value={paymentData.payment_date}
                      onChange={(e) => handleInputChange('payment_date', e.target.value)}
                      className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-golden-300 text-sm mb-2">Transaction ID (Optional)</label>
                    <input
                      type="text"
                      value={paymentData.transaction_id}
                      onChange={(e) => handleInputChange('transaction_id', e.target.value)}
                      className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
                      placeholder="UPI/Transaction ID"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-golden-300 text-sm mb-2">Notes (Optional)</label>
                  <textarea
                    value={paymentData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
                    rows={3}
                    placeholder="Any additional notes..."
                  />
                </div>

                {/* Helpful Message */}
                <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-blue-400 mt-0.5" />
                    <div>
                      <p className="text-blue-400 font-medium">Payment Recording</p>
                      <p className="text-blue-300 text-sm">
                        You can edit the payment amount if it's different from the balance due. 
                        The system will automatically update the bill status based on the payment amount.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-golden-500 to-golden-600 text-dark-900 rounded-lg hover:from-golden-600 hover:to-golden-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-dark-900/30 border-t-dark-900 rounded-full animate-spin"></div>
                        Recording Payment...
                      </>
                    ) : (
                      <>
                        <DollarSign className="h-4 w-4" />
                        Record Payment
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-3 border border-golden-600/30 text-golden-300 rounded-lg hover:bg-golden-600/10 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal; 