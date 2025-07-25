import { useState, useEffect } from 'react';
import { X, User, Phone, Home, Calendar, IndianRupee, Settings, Utensils } from 'lucide-react';
import axios from 'axios';
import { supabase } from '../lib/supabase';

interface Tenant {
  id: string;
  name: string;
  mobile: string;
  room_number: string;
  joining_date: string;
  monthly_rent: number;
  security_deposit: number;
  electricity_joining_reading: number;
  last_electricity_reading: number | null;
  status: 'active' | 'adjust' | 'inactive';
  created_date: string;
  has_food: boolean;
  category: 'existing' | 'new' | null;
  departure_date: string | null;
  stay_duration: string | null;
  notice_given: boolean;
  notice_date: string | null;
  security_adjustment: number;
  // New fields for security deposit tracking
  security_deposit_total: number;
  security_deposit_paid: number;
  security_deposit_balance: number;
  security_balance_due_date: string | null;
  adjust_rent_from_security: boolean;
}

interface TenantFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  tenant?: Tenant | null;
}

const TenantForm = ({ isOpen, onClose, onSubmit, tenant }: TenantFormProps) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    room_number: '',
    joining_date: new Date().toISOString().split('T')[0],
    monthly_rent: '',
    security_deposit: '',
    electricity_joining_reading: '',
    status: 'active' as 'active' | 'adjust' | 'inactive',
    has_food: false,
    category: 'new' as 'existing' | 'new',
    departure_date: '',
    stay_duration: '',
    notice_given: false,
    notice_date: '',
    security_adjustment: '',
    // New fields for security deposit tracking
    security_deposit_total: '',
    security_deposit_paid: '',
    security_deposit_balance: '',
    security_balance_due_date: '',
    adjust_rent_from_security: false
  });

  const [availableRooms, setAvailableRooms] = useState<any[]>([]);
  const [originalRoomNumber, setOriginalRoomNumber] = useState<string>('');
  const [roomChanged, setRoomChanged] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchAvailableRooms();
      if (tenant) {
        // Populate form for editing
        setOriginalRoomNumber(tenant.room_number);
        setFormData({
          name: tenant.name,
          mobile: tenant.mobile,
          room_number: tenant.room_number,
          joining_date: tenant.joining_date,
          monthly_rent: (tenant.monthly_rent || 0).toString(),
          security_deposit: (tenant.security_deposit || 0).toString(),
          electricity_joining_reading: (tenant.electricity_joining_reading || 0).toString(),
          status: tenant.status,
          has_food: tenant.has_food,
          category: tenant.category || 'new',
          departure_date: tenant.departure_date || '',
          stay_duration: tenant.stay_duration || '',
          notice_given: tenant.notice_given,
          notice_date: tenant.notice_date || '',
          security_adjustment: (tenant.security_adjustment || 0).toString(),
          // New fields for security deposit tracking
          security_deposit_total: (tenant.security_deposit_total || tenant.security_deposit || 0).toString(),
          security_deposit_paid: (tenant.security_deposit_paid || tenant.security_deposit || 0).toString(),
          security_deposit_balance: (tenant.security_deposit_balance || 0).toString(),
          security_balance_due_date: tenant.security_balance_due_date || '',
          adjust_rent_from_security: tenant.adjust_rent_from_security
        });
      } else {
        // Reset form for new tenant
        setOriginalRoomNumber('');
        setFormData({
          name: '',
          mobile: '',
          room_number: '',
          joining_date: new Date().toISOString().split('T')[0],
          monthly_rent: '',
          security_deposit: '',
          electricity_joining_reading: '0',
          status: 'active',
          has_food: false,
          category: 'new',
          departure_date: '',
          stay_duration: '',
          notice_given: false,
          notice_date: '',
          security_adjustment: '0',
          // New fields for security deposit tracking
          security_deposit_total: '',
          security_deposit_paid: '',
          security_deposit_balance: '',
          security_balance_due_date: '',
          adjust_rent_from_security: false
        });
      }
      setActiveTab('basic');
      setRoomChanged(false);
    }
  }, [isOpen, tenant]);

  const fetchAvailableRooms = async () => {
    try {
      const { data, error } = await supabase.from('rooms').select('*').eq('status', 'available');
      if (error) throw error;
      setAvailableRooms(data || []);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const handleRoomChange = (newRoomNumber: string) => {
    setFormData(prev => ({ ...prev, room_number: newRoomNumber }));
    if (tenant && originalRoomNumber && newRoomNumber !== originalRoomNumber) {
      setRoomChanged(true);
      // When room changes, tenant needs to provide new electricity joining reading
      alert('⚠️ Room change detected! Please update the electricity joining reading for the new room.');
    } else {
      setRoomChanged(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation
      if (!formData.name.trim()) {
        throw new Error('Name is required');
      }
      if (!formData.mobile.trim()) {
        throw new Error('Mobile number is required');
      }
      if (!formData.room_number.trim()) {
        throw new Error('Room number is required');
      }
      if (!formData.monthly_rent || Number(formData.monthly_rent) <= 0) {
        throw new Error('Valid monthly rent is required');
      }
      if (!formData.security_deposit || Number(formData.security_deposit) < 0) {
        throw new Error('Valid security deposit is required');
      }

      const submitData = {
        ...formData,
        monthly_rent: Number(formData.monthly_rent),
        security_deposit: Number(formData.security_deposit),
        electricity_joining_reading: Number(formData.electricity_joining_reading),
        security_adjustment: Number(formData.security_adjustment),
        // Handle date fields - convert empty strings to null
        departure_date: formData.departure_date ? formData.departure_date : null,
        notice_date: formData.notice_date ? formData.notice_date : null,
        // New fields for security deposit tracking
        security_deposit_total: Number(formData.security_deposit_total),
        security_deposit_paid: Number(formData.security_deposit_paid),
        security_deposit_balance: Number(formData.security_deposit_balance),
        security_balance_due_date: formData.security_balance_due_date ? formData.security_balance_due_date : null,
        adjust_rent_from_security: formData.adjust_rent_from_security
      };

      if (tenant) {
        // Update existing tenant
        const { error } = await supabase.from('tenants').update(submitData).eq('id', tenant.id);
        if (error) throw error;
      } else {
        // Create new tenant
        const { error } = await supabase.from('tenants').insert([submitData]);
        if (error) throw error;
      }

      onSubmit();
      onClose();
    } catch (error: any) {
      console.error('Error saving tenant:', error);
      alert(error.message || 'Failed to save tenant');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: User },
    { id: 'financial', label: 'Financial', icon: IndianRupee },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-dark-900 border border-golden-600/20 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-golden-600/20">
          <div>
            <h2 className="text-xl font-semibold text-golden-400">
              {tenant ? 'Edit Tenant' : 'Add New Tenant'}
            </h2>
            <p className="text-golden-300 text-sm">
              {tenant ? 'Update tenant information' : 'Enter tenant details to add them to the system'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-golden-300 hover:text-golden-100 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-golden-600/20">
          <div className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-golden-500 text-golden-400'
                    : 'border-transparent text-golden-300 hover:text-golden-200'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          <form onSubmit={handleSubmit} className="p-6">
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-golden-300 mb-2">
                      <User className="inline h-4 w-4 mr-1" />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 placeholder-golden-400/50 focus:outline-none focus:border-golden-500 focus:ring-1 focus:ring-golden-500"
                      placeholder="Enter tenant's full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-golden-300 mb-2">
                      <Phone className="inline h-4 w-4 mr-1" />
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 placeholder-golden-400/50 focus:outline-none focus:border-golden-500 focus:ring-1 focus:ring-golden-500"
                      placeholder="Enter 10-digit mobile number"
                      pattern="[0-9]{10}"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-golden-300 mb-2">
                      <Home className="inline h-4 w-4 mr-1" />
                      Room Number *
                    </label>
                    <select
                      required
                      value={formData.room_number}
                      onChange={(e) => handleRoomChange(e.target.value)}
                      className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500 focus:ring-1 focus:ring-golden-500"
                    >
                      <option value="">Select Room</option>
                      {availableRooms.map((room) => (
                        <option key={room.id} value={room.room_number}>
                          Room {room.room_number} - Floor {room.floor} ({room.type})
                        </option>
                      ))}
                      {/* Allow manual entry for existing tenants */}
                      {tenant && (
                        <option value={formData.room_number}>
                          {formData.room_number} (Current)
                        </option>
                      )}
                    </select>
                    <p className="text-golden-400/60 text-xs mt-1">
                      Available rooms are shown. Contact admin if room not listed.
                    </p>
                    {/* Room Change Warning */}
                    {roomChanged && (
                      <div className="mt-2 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                        <div className="flex items-start gap-2">
                          <div className="text-orange-400 mt-0.5">⚠️</div>
                          <div>
                            <h4 className="text-orange-400 font-medium text-sm">Room Change Detected</h4>
                            <p className="text-orange-300 text-xs mt-1">
                              Moving from Room {originalRoomNumber} to Room {formData.room_number}.
                              <br />
                              The tenant will be automatically deallocated from the old room and allocated to the new room.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-golden-300 mb-2">
                      <Calendar className="inline h-4 w-4 mr-1" />
                      Joining Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.joining_date}
                      onChange={(e) => setFormData({ ...formData, joining_date: e.target.value })}
                      className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500 focus:ring-1 focus:ring-golden-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-golden-300 mb-2">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'adjust' | 'inactive' })}
                      className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
                    >
                      <option value="active">Active</option>
                      <option value="adjust">Adjusting</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-golden-300 mb-2">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as 'existing' | 'new' })}
                      className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
                    >
                      <option value="new">New Tenant</option>
                      <option value="existing">Existing Tenant</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="has_food"
                    checked={formData.has_food}
                    onChange={(e) => setFormData({ ...formData, has_food: e.target.checked })}
                    className="h-4 w-4 text-golden-500 bg-dark-800 border-golden-600/30 rounded focus:ring-golden-500"
                  />
                  <label htmlFor="has_food" className="text-golden-300 flex items-center gap-2">
                    <Utensils className="h-4 w-4" />
                    Food Service Required
                  </label>
                </div>
              </div>
            )}

            {/* Financial Tab */}
            {activeTab === 'financial' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-golden-300 mb-2">
                      <IndianRupee className="inline h-4 w-4 mr-1" />
                      Monthly Rent *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.monthly_rent}
                      onChange={(e) => setFormData({ ...formData, monthly_rent: e.target.value })}
                      className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 placeholder-golden-400/50 focus:outline-none focus:border-golden-500 focus:ring-1 focus:ring-golden-500"
                      placeholder="Enter monthly rent amount"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-golden-300 mb-2">
                      <IndianRupee className="inline h-4 w-4 mr-1" />
                      Security Deposit *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.security_deposit}
                      onChange={(e) => setFormData({ ...formData, security_deposit: e.target.value })}
                      className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 placeholder-golden-400/50 focus:outline-none focus:border-golden-500 focus:ring-1 focus:ring-golden-500"
                      placeholder="Enter security deposit amount"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-golden-300 mb-2">
                      ⚡ Electricity Joining Reading *
                      {roomChanged && (
                        <span className="text-orange-400 ml-2">(Required for room change)</span>
                      )}
                    </label>
                    <input
                      type="number"
                      min="0"
                      required={roomChanged}
                      value={formData.electricity_joining_reading}
                      onChange={(e) => setFormData({ ...formData, electricity_joining_reading: e.target.value })}
                      className={`w-full px-3 py-2 bg-dark-800 border rounded-lg text-golden-100 placeholder-golden-400/50 focus:outline-none focus:ring-1 ${
                        roomChanged 
                          ? 'border-orange-500 focus:border-orange-400 focus:ring-orange-400' 
                          : 'border-golden-600/30 focus:border-golden-500 focus:ring-golden-500'
                      }`}
                      placeholder="Enter current electricity meter reading"
                    />
                    <p className="text-golden-400/60 text-xs mt-1">
                      {roomChanged 
                        ? '⚠️ Room changed! Enter the current meter reading for the new room to track electricity consumption.'
                        : 'Initial electricity meter reading when tenant joins. Used for consumption calculation (₹12/unit, shared in room).'
                      }
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-golden-300 mb-2">
                      Security Adjustment
                    </label>
                    <input
                      type="number"
                      value={formData.security_adjustment}
                      onChange={(e) => setFormData({ ...formData, security_adjustment: e.target.value })}
                      className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 placeholder-golden-400/50 focus:outline-none focus:border-golden-500 focus:ring-1 focus:ring-golden-500"
                      placeholder="Enter any security adjustments (+/-)"
                    />
                    <p className="text-golden-400/60 text-xs mt-1">
                      Positive for additional charges, negative for deductions
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-golden-300 mb-2">
                      <IndianRupee className="inline h-4 w-4 mr-1" />
                      Security Deposit Paid
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.security_deposit_paid}
                      onChange={(e) => {
                        const paid = Number(e.target.value) || 0;
                        const total = Number(formData.security_deposit) || 0;
                        const balance = total - paid;
                        setFormData({ 
                          ...formData, 
                          security_deposit_paid: e.target.value,
                          security_deposit_balance: balance.toString()
                        });
                      }}
                      className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 placeholder-golden-400/50 focus:outline-none focus:border-golden-500 focus:ring-1 focus:ring-golden-500"
                      placeholder="Amount paid so far"
                    />
                    <p className="text-golden-400/60 text-xs mt-1">
                      How much of the security deposit has been paid
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-golden-300 mb-2">
                      <Calendar className="inline h-4 w-4 mr-1" />
                      Balance Due Date
                    </label>
                    <input
                      type="date"
                      value={formData.security_balance_due_date}
                      onChange={(e) => setFormData({ ...formData, security_balance_due_date: e.target.value })}
                      className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500 focus:ring-1 focus:ring-golden-500"
                    />
                    <p className="text-golden-400/60 text-xs mt-1">
                      When the remaining balance should be paid
                    </p>
                  </div>

                  <div className="col-span-2">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="adjust_rent_from_security"
                        checked={formData.adjust_rent_from_security}
                        onChange={(e) => setFormData({ ...formData, adjust_rent_from_security: e.target.checked })}
                        className="h-4 w-4 text-golden-500 bg-dark-800 border-golden-600/30 rounded focus:ring-golden-500"
                      />
                      <label htmlFor="adjust_rent_from_security" className="text-golden-300 flex items-center gap-2">
                        <IndianRupee className="h-4 w-4" />
                        Allow rent adjustment from security deposit
                      </label>
                    </div>
                    <p className="text-golden-400/60 text-xs mt-1 ml-7">
                      Enable this option to allow deducting one month's rent from security deposit when tenant leaves
                    </p>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="bg-dark-800 border border-golden-600/20 rounded-lg p-4">
                  <h4 className="text-golden-400 font-medium mb-3">Financial Summary</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-golden-300">Monthly Rent:</span>
                      <span className="text-golden-100">₹{formData.monthly_rent || '0'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-golden-300">Security Deposit (Total):</span>
                      <span className="text-golden-100">₹{formData.security_deposit || '0'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-golden-300">Security Deposit (Paid):</span>
                      <span className="text-golden-100">₹{formData.security_deposit_paid || '0'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-golden-300">Security Deposit (Balance):</span>
                      <span className={`font-medium ${Number(formData.security_deposit_balance || 0) > 0 ? 'text-orange-400' : 'text-green-400'}`}>
                        ₹{formData.security_deposit_balance || '0'}
                      </span>
                    </div>
                    {Number(formData.security_adjustment || 0) !== 0 && (
                      <div className="flex justify-between">
                        <span className="text-golden-300">Security Adjustment:</span>
                        <span className={`font-medium ${Number(formData.security_adjustment || 0) > 0 ? 'text-red-400' : 'text-green-400'}`}>
                          {Number(formData.security_adjustment || 0) > 0 ? '+' : ''}₹{formData.security_adjustment || '0'}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between col-span-2 border-t border-golden-600/20 pt-2">
                      <span className="text-golden-300 font-medium">Total Initial Payment:</span>
                      <span className="text-golden-100 font-medium">
                        ₹{(Number(formData.monthly_rent || 0) + Number(formData.security_deposit_paid || 0) + Number(formData.security_adjustment || 0)).toLocaleString()}
                      </span>
                    </div>
                    {Number(formData.security_deposit_balance || 0) > 0 && formData.security_balance_due_date && (
                      <div className="flex justify-between col-span-2">
                        <span className="text-golden-300">Balance Due Date:</span>
                        <span className="text-orange-400 font-medium">
                          {new Date(formData.security_balance_due_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-golden-300 mb-2">
                      Departure Date
                    </label>
                    <input
                      type="date"
                      value={formData.departure_date}
                      onChange={(e) => setFormData({ ...formData, departure_date: e.target.value })}
                      className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-golden-300 mb-2">
                      Expected Stay Duration
                    </label>
                    <input
                      type="text"
                      value={formData.stay_duration}
                      onChange={(e) => setFormData({ ...formData, stay_duration: e.target.value })}
                      className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 placeholder-golden-400/50 focus:outline-none focus:border-golden-500"
                      placeholder="e.g., 6 months, 1 year"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-golden-300 mb-2">
                      Notice Date
                    </label>
                    <input
                      type="date"
                      value={formData.notice_date}
                      onChange={(e) => setFormData({ ...formData, notice_date: e.target.value })}
                      className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="notice_given"
                    checked={formData.notice_given}
                    onChange={(e) => setFormData({ ...formData, notice_given: e.target.checked })}
                    className="h-4 w-4 text-golden-500 bg-dark-800 border-golden-600/30 rounded focus:ring-golden-500"
                  />
                  <label htmlFor="notice_given" className="text-golden-300">
                    Notice Given for Departure
                  </label>
                </div>

                {/* Additional Info */}
                <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
                  <h4 className="text-blue-400 font-medium mb-2">Additional Information</h4>
                  <ul className="text-blue-300 text-sm space-y-1">
                    <li>• Notice period is typically 30 days</li>
                    <li>• Security deposit will be refunded after room inspection</li>
                    <li>• Final electricity reading will be taken at departure</li>
                    <li>• All dues must be cleared before departure</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-golden-600/20 mt-8">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-golden-600/30 text-golden-300 rounded-lg hover:bg-golden-600/10 transition-colors"
              >
                Cancel
              </button>
              
              <div className="flex gap-3">
                {activeTab !== 'basic' && (
                  <button
                    type="button"
                    onClick={() => {
                      const currentIndex = tabs.findIndex(t => t.id === activeTab);
                      if (currentIndex > 0) setActiveTab(tabs[currentIndex - 1].id);
                    }}
                    className="px-6 py-2 border border-golden-600/30 text-golden-300 rounded-lg hover:bg-golden-600/10 transition-colors"
                  >
                    Previous
                  </button>
                )}
                
                {activeTab !== 'settings' ? (
                  <button
                    type="button"
                    onClick={() => {
                      const currentIndex = tabs.findIndex(t => t.id === activeTab);
                      if (currentIndex < tabs.length - 1) setActiveTab(tabs[currentIndex + 1].id);
                    }}
                    className="px-6 py-2 bg-golden-600 text-dark-900 rounded-lg hover:bg-golden-700 transition-colors font-medium"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-gradient-to-r from-golden-500 to-golden-600 text-dark-900 rounded-lg hover:from-golden-600 hover:to-golden-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-dark-900/30 border-t-dark-900 rounded-full animate-spin"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        {tenant ? 'Update Tenant' : 'Add Tenant'}
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TenantForm; 