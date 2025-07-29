import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Users, 
  Building, 
  CreditCard, 
  AlertTriangle, 
  UserCheck,
  Calendar,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  FileText,
  Send,
  Download
} from 'lucide-react';
import { supabase } from '../lib/supabase';

// Helper functions
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

// Tenant Modal
interface TenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const TenantModal = ({ isOpen, onClose, onSuccess }: TenantModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    room_number: '',
    mobile: '',
    email: '',
    joining_date: new Date().toISOString().split('T')[0],
    monthly_rent: '',
    security_deposit: '',
    emergency_contact: '',
    status: 'active'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('tenants')
        .insert([{
          ...formData,
          monthly_rent: parseInt(formData.monthly_rent),
          security_deposit: parseInt(formData.security_deposit)
        }]);

      if (error) throw error;
      
      alert('Tenant added successfully!');
      onSuccess();
      onClose();
      setFormData({
        name: '',
        room_number: '',
        mobile: '',
        email: '',
        joining_date: new Date().toISOString().split('T')[0],
        monthly_rent: '',
        security_deposit: '',
        emergency_contact: '',
        status: 'active'
      });
    } catch (error) {
      console.error('Error adding tenant:', error);
      alert('Failed to add tenant. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-dark-900 border border-golden-600/20 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-golden-600/20">
          <h2 className="text-xl font-semibold text-golden-400 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Add New Tenant
          </h2>
          <button onClick={onClose} className="text-golden-300 hover:text-golden-100">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-golden-300 mb-2">Full Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
                placeholder="Enter full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-golden-300 mb-2">Room Number *</label>
              <input
                type="text"
                required
                value={formData.room_number}
                onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
                placeholder="e.g., 101"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-golden-300 mb-2">Mobile Number *</label>
              <input
                type="tel"
                required
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
                placeholder="Enter mobile number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-golden-300 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
                placeholder="Enter email address"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-golden-300 mb-2">Joining Date *</label>
              <input
                type="date"
                required
                value={formData.joining_date}
                onChange={(e) => setFormData({ ...formData, joining_date: e.target.value })}
                className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-golden-300 mb-2">Monthly Rent *</label>
              <input
                type="number"
                required
                value={formData.monthly_rent}
                onChange={(e) => setFormData({ ...formData, monthly_rent: e.target.value })}
                className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
                placeholder="Enter monthly rent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-golden-300 mb-2">Security Deposit</label>
              <input
                type="number"
                value={formData.security_deposit}
                onChange={(e) => setFormData({ ...formData, security_deposit: e.target.value })}
                className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
                placeholder="Enter security deposit"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-golden-300 mb-2">Emergency Contact</label>
              <input
                type="tel"
                value={formData.emergency_contact}
                onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
                placeholder="Emergency contact number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-golden-300 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-golden-600/20">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-golden-600/30 text-golden-300 rounded-lg hover:bg-golden-600/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-golden-500 to-golden-600 text-dark-900 rounded-lg hover:from-golden-600 hover:to-golden-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-dark-900/30 border-t-dark-900 rounded-full animate-spin"></div>
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Add Tenant
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Room Modal
interface RoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const RoomModal = ({ isOpen, onClose, onSuccess }: RoomModalProps) => {
  const [formData, setFormData] = useState({
    room_number: '',
    floor: '',
    type: 'single',
    monthly_rent: '',
    amenities: [] as string[],
    status: 'vacant'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('rooms')
        .insert([{
          ...formData,
          monthly_rent: parseInt(formData.monthly_rent)
        }]);

      if (error) throw error;
      
      alert('Room added successfully!');
      onSuccess();
      onClose();
      setFormData({
        room_number: '',
        floor: '',
        type: 'single',
        monthly_rent: '',
        amenities: [],
        status: 'vacant'
      });
    } catch (error) {
      console.error('Error adding room:', error);
      alert('Failed to add room. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-dark-900 border border-golden-600/20 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-golden-600/20">
          <h2 className="text-xl font-semibold text-golden-400 flex items-center gap-2">
            <Building className="h-5 w-5" />
            Add New Room
          </h2>
          <button onClick={onClose} className="text-golden-300 hover:text-golden-100">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-golden-300 mb-2">Room Number *</label>
              <input
                type="text"
                required
                value={formData.room_number}
                onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
                placeholder="e.g., 101"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-golden-300 mb-2">Floor *</label>
              <input
                type="text"
                required
                value={formData.floor}
                onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
                placeholder="e.g., Ground, 1st, 2nd"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-golden-300 mb-2">Room Type *</label>
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
              >
                <option value="single">Single Room</option>
                <option value="double">Double Room</option>
                <option value="triple">Triple Room</option>
                <option value="deluxe">Deluxe Room</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-golden-300 mb-2">Monthly Rent *</label>
              <input
                type="number"
                required
                value={formData.monthly_rent}
                onChange={(e) => setFormData({ ...formData, monthly_rent: e.target.value })}
                className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
                placeholder="Enter monthly rent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-golden-300 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
              >
                <option value="vacant">Vacant</option>
                <option value="occupied">Occupied</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-golden-600/20">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-golden-600/30 text-golden-300 rounded-lg hover:bg-golden-600/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-golden-500 to-golden-600 text-dark-900 rounded-lg hover:from-golden-600 hover:to-golden-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-dark-900/30 border-t-dark-900 rounded-full animate-spin"></div>
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Add Room
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Payment Modal
interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PaymentModal = ({ isOpen, onClose, onSuccess }: PaymentModalProps) => {
  const [formData, setFormData] = useState({
    tenant_name: '',
    room_number: '',
    amount: '',
    method: 'cash',
    transaction_id: '',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('payments')
        .insert([{
          ...formData,
          amount: parseInt(formData.amount),
          status: 'completed'
        }]);

      if (error) throw error;
      
      alert('Payment recorded successfully!');
      onSuccess();
      onClose();
      setFormData({
        tenant_name: '',
        room_number: '',
        amount: '',
        method: 'cash',
        transaction_id: '',
        notes: '',
        date: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error('Error recording payment:', error);
      alert('Failed to record payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-dark-900 border border-golden-600/20 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-golden-600/20">
          <h2 className="text-xl font-semibold text-golden-400 flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Record Payment
          </h2>
          <button onClick={onClose} className="text-golden-300 hover:text-golden-100">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-golden-300 mb-2">Tenant Name *</label>
              <input
                type="text"
                required
                value={formData.tenant_name}
                onChange={(e) => setFormData({ ...formData, tenant_name: e.target.value })}
                className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
                placeholder="Enter tenant name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-golden-300 mb-2">Room Number *</label>
              <input
                type="text"
                required
                value={formData.room_number}
                onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
                placeholder="e.g., 101"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-golden-300 mb-2">Amount *</label>
              <input
                type="number"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
                placeholder="Enter amount"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-golden-300 mb-2">Payment Method *</label>
              <select
                required
                value={formData.method}
                onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
              >
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="card">Card</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-golden-300 mb-2">Transaction ID</label>
              <input
                type="text"
                value={formData.transaction_id}
                onChange={(e) => setFormData({ ...formData, transaction_id: e.target.value })}
                className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
                placeholder="Transaction ID (optional)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-golden-300 mb-2">Payment Date *</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-golden-300 mb-2">Notes</label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
              placeholder="Additional notes (optional)"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-golden-600/20">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-golden-600/30 text-golden-300 rounded-lg hover:bg-golden-600/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-golden-500 to-golden-600 text-dark-900 rounded-lg hover:from-golden-600 hover:to-golden-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-dark-900/30 border-t-dark-900 rounded-full animate-spin"></div>
                  Recording...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  Record Payment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Report Modal
interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReportModal = ({ isOpen, onClose }: ReportModalProps) => {
  const [selectedReport, setSelectedReport] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [generating, setGenerating] = useState(false);

  const reportTypes = [
    { id: 'monthly-summary', name: 'Monthly Summary Report', description: 'Complete monthly overview with all statistics' },
    { id: 'tenant-list', name: 'Tenant List Report', description: 'List of all tenants with their details' },
    { id: 'payment-report', name: 'Payment Report', description: 'Payment history and pending collections' },
    { id: 'occupancy-report', name: 'Occupancy Report', description: 'Room occupancy and availability status' },
    { id: 'maintenance-report', name: 'Maintenance Report', description: 'Maintenance requests and completion status' },
    { id: 'financial-summary', name: 'Financial Summary', description: 'Revenue, expenses, and profit analysis' }
  ];

  const generateReport = async () => {
    if (!selectedReport) {
      alert('Please select a report type');
      return;
    }

    setGenerating(true);
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const reportName = reportTypes.find(r => r.id === selectedReport)?.name;
      alert(`${reportName} for ${selectedMonth} has been generated successfully!`);
      
      onClose();
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-dark-900 border border-golden-600/20 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-golden-600/20">
          <h2 className="text-xl font-semibold text-golden-400 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate Report
          </h2>
          <button onClick={onClose} className="text-golden-300 hover:text-golden-100">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-golden-300 mb-3">Select Month</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-golden-300 mb-3">Select Report Type</label>
            <div className="space-y-2">
              {reportTypes.map((report) => (
                <label key={report.id} className="flex items-start gap-3 p-3 border border-golden-600/30 rounded-lg hover:bg-dark-800 cursor-pointer">
                  <input
                    type="radio"
                    name="reportType"
                    value={report.id}
                    checked={selectedReport === report.id}
                    onChange={(e) => setSelectedReport(e.target.value)}
                    className="mt-1 text-golden-500 focus:ring-golden-500"
                  />
                  <div>
                    <div className="font-medium text-golden-100">{report.name}</div>
                    <div className="text-golden-300 text-sm">{report.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-golden-600/20">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-golden-600/30 text-golden-300 rounded-lg hover:bg-golden-600/10 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={generateReport}
              disabled={generating || !selectedReport}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-golden-500 to-golden-600 text-dark-900 rounded-lg hover:from-golden-600 hover:to-golden-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generating ? (
                <>
                  <div className="w-4 h-4 border-2 border-dark-900/30 border-t-dark-900 rounded-full animate-spin"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Generate Report
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};