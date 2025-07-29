import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  MoreVertical,
  Edit,
  Trash2,
  Phone,
  DoorOpen,
  Calendar,
  IndianRupee,
  Users,
  UserCheck,
  Clock,
  FileText,
  Layers,
  UserMinus,
  ArrowUpRight,
  X,
  Building,
  Home,
  Activity,
  TrendingUp,
  Settings,
  Bell,
  User,
  ChevronDown,
  Eye,
  Mail,
  MapPin,
  Wifi,
  Zap,
  Shield,
  Star,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import TenantForm from '../components/TenantForm';
import { completeTenantsData } from '../data/completeTenantsData';

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

interface TenantStats {
  total: number;
  active: number;
  inactive: number;
  adjusting: number;
  withFood: number;
  newTenants: number;
  totalRent: number;
  totalDeposits: number;
  activeRent: number;
  inactiveRent: number;
  noticeGiven: number;
  pendingSecurity: number;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'inactive':
      return 'bg-red-100 text-red-800';
    case 'adjust':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'new':
      return 'bg-blue-100 text-blue-800';
    case 'existing':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const Tenants = () => {
  console.log('Tenants component rendering');
  
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [stats, setStats] = useState<TenantStats>({
    total: 0,
    active: 0,
    inactive: 0,
    adjusting: 0,
    withFood: 0,
    newTenants: 0,
    totalRent: 0,
    totalDeposits: 0,
    activeRent: 0,
    inactiveRent: 0,
    noticeGiven: 0,
    pendingSecurity: 0
  });

  useEffect(() => {
    initializeData();
  }, []);

  useEffect(() => {
    fetchTenants();
    fetchStats();
  }, [searchTerm, statusFilter, categoryFilter]);

  const initializeData = async () => {
    try {
      console.log('🚀 Initializing tenant data...');
      setLoading(true);
      // First, check if data already exists
      const { data, error } = await supabase.from('tenants').select('*');
      if (error) throw error;
      const existingData = data || [];
      
      console.log('📊 Found existing tenants:', existingData.length);
      
      // If no tenants exist, automatically load the complete data
      if (!existingData || existingData.length === 0) {
        console.log('📥 No tenants found, importing data...');
        await autoImportData();
      } else {
        console.log('✅ Using existing tenant data');
        setTenants(existingData);
      }
    } catch (error) {
      console.error('❌ Error initializing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const autoImportData = async () => {
    try {
      console.log('📥 Starting auto-import of tenant data...');
      
      // Import the complete data
      const { data, error } = await supabase
        .from('tenants')
        .insert(completeTenantsData)
        .select();
      
      if (error) {
        console.error('❌ Error importing data:', error);
        throw error;
      }
      
      console.log('✅ Successfully imported', data?.length, 'tenants');
      setTenants(data || []);
      
    } catch (error) {
      console.error('❌ Error in auto-import:', error);
    }
  };

  const fetchTenants = async () => {
    try {
      let query = supabase.from('tenants').select('*');
      
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,mobile.ilike.%${searchTerm}%,room_number.ilike.%${searchTerm}%`);
      }
      
      if (statusFilter) {
        query = query.eq('status', statusFilter);
      }
      
      if (categoryFilter) {
        query = query.eq('category', categoryFilter);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      setTenants(data || []);
    } catch (error) {
      console.error('Error fetching tenants:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase.from('tenants').select('*');
      if (error) throw error;
      
      const tenantsData = data || [];
      const total = tenantsData.length;
      const active = tenantsData.filter(t => t.status === 'active').length;
      const inactive = tenantsData.filter(t => t.status === 'inactive').length;
      const adjusting = tenantsData.filter(t => t.status === 'adjust').length;
      const withFood = tenantsData.filter(t => t.has_food).length;
      const newTenants = tenantsData.filter(t => t.category === 'new').length;
      const totalRent = tenantsData.reduce((sum, t) => sum + (t.monthly_rent || 0), 0);
      const totalDeposits = tenantsData.reduce((sum, t) => sum + (t.security_deposit || 0), 0);
      const activeRent = tenantsData.filter(t => t.status === 'active').reduce((sum, t) => sum + (t.monthly_rent || 0), 0);
      const inactiveRent = tenantsData.filter(t => t.status === 'inactive').reduce((sum, t) => sum + (t.monthly_rent || 0), 0);
      const noticeGiven = tenantsData.filter(t => t.notice_given).length;
      const pendingSecurity = tenantsData.filter(t => t.security_deposit_balance > 0).length;

      setStats({
        total,
        active,
        inactive,
        adjusting,
        withFood,
        newTenants,
        totalRent,
        totalDeposits,
        activeRent,
        inactiveRent,
        noticeGiven,
        pendingSecurity
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const deleteTenant = async (tenantId: string, tenantName: string) => {
    if (window.confirm(`Are you sure you want to delete tenant "${tenantName}"?`)) {
      try {
        const { error } = await supabase
          .from('tenants')
          .delete()
          .eq('id', tenantId);
        
        if (error) throw error;
        
        console.log('✅ Tenant deleted successfully');
        fetchTenants();
        fetchStats();
      } catch (error) {
        console.error('Error deleting tenant:', error);
        alert('Failed to delete tenant');
      }
    }
  };

  const markTenantInactive = async (tenantId: string, tenantName: string) => {
    if (window.confirm(`Are you sure you want to mark tenant "${tenantName}" as inactive?`)) {
      try {
        const { error } = await supabase
          .from('tenants')
          .update({ 
            status: 'inactive',
            departure_date: new Date().toISOString().split('T')[0]
          })
          .eq('id', tenantId);
        
        if (error) throw error;
        
        console.log('✅ Tenant marked as inactive');
        fetchTenants();
        fetchStats();
      } catch (error) {
        console.error('Error updating tenant status:', error);
        alert('Failed to update tenant status');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'adjust':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'existing':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getFloorFromRoomNumber = (roomNumber: string): number => {
    if (roomNumber.startsWith('G')) return 0;
    const firstChar = roomNumber.charAt(0);
    return parseInt(firstChar) || 0;
  };

  const getTenantStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <UserCheck className="h-4 w-4 text-green-500" />;
      case 'inactive':
        return <UserMinus className="h-4 w-4 text-red-500" />;
      case 'adjust':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTenantPriorityIcon = (tenant: Tenant) => {
    if (tenant.notice_given) return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    if (tenant.security_deposit_balance > 0) return <Shield className="h-4 w-4 text-red-500" />;
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  const isVacatingThisMonth = (tenant: Tenant) => {
    if (!tenant.notice_given || !tenant.notice_date) return false;
    
    const noticeDate = new Date(tenant.notice_date);
    const currentDate = new Date();
    
    return noticeDate.getMonth() === currentDate.getMonth() && 
           noticeDate.getFullYear() === currentDate.getFullYear();
  };

  const getBedCount = (roomType: string) => {
    switch (roomType) {
      case 'Single': return 1;
      case 'Double': return 2;
      case 'Triple': return 3;
      default: return 1;
    }
  };

  const getCurrentTenantsCount = (roomNumber: string) => {
    return tenants.filter(t => t.room_number === roomNumber && t.status === 'active').length;
  };

  const getRoomType = (roomNumber: string) => {
    // Determine room type based on room number pattern or tenant data
    const room = tenants.find(t => t.room_number === roomNumber);
    if (room) {
      // You might need to add room_type field to your tenant data
      // For now, we'll estimate based on room number
      if (roomNumber.includes('G') || roomNumber.includes('1')) return 'Triple';
      if (roomNumber.includes('2') || roomNumber.includes('3')) return 'Double';
      return 'Single';
    }
    return 'Triple'; // Default
  };

  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tenant.mobile.includes(searchTerm) ||
                         tenant.room_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || tenant.status === statusFilter;
    const matchesCategory = !categoryFilter || tenant.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tenants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Custom Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounceIn {
          0% { opacity: 0; transform: scale(0.3); }
          50% { opacity: 1; transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes drawPath {
          from { stroke-dashoffset: 1000; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes countUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.6s ease-out; }
        .animate-slideUp { animation: slideUp 0.8s ease-out; }
        .animate-bounceIn { animation: bounceIn 0.8s ease-out; }
        .animate-drawPath { animation: drawPath 2s ease-out forwards; }
        .animate-countUp { animation: countUp 0.5s ease-out; }
      `}</style>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-8">
            {/* Tenant Overview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-fadeIn">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Tenant Overview</h2>
                  <p className="text-gray-600 mt-1">Complete overview of all tenants and their status</p>
                </div>
                <div className="flex items-center gap-4">
                  {/* View Mode Toggle */}
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('cards')}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        viewMode === 'cards' 
                          ? 'bg-white text-gray-900 shadow-sm' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Cards
                    </button>
                    <button
                      onClick={() => setViewMode('table')}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        viewMode === 'table' 
                          ? 'bg-white text-gray-900 shadow-sm' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Table
                    </button>
                  </div>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 hover:scale-105"
                  >
                    <Plus className="h-4 w-4" />
                    Add Tenant
                  </button>
                </div>
              </div>

              {/* Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Total Tenants</p>
                      <p className="text-2xl font-bold">{stats.total}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-200" />
                  </div>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">Active</p>
                      <p className="text-2xl font-bold">{stats.active}</p>
                    </div>
                    <UserCheck className="h-8 w-8 text-green-200" />
                  </div>
                </div>
                <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-100 text-sm">Monthly Revenue</p>
                      <p className="text-2xl font-bold">{formatCurrency(stats.totalRent)}</p>
                    </div>
                    <IndianRupee className="h-8 w-8 text-yellow-200" />
                  </div>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">Security Deposits</p>
                      <p className="text-2xl font-bold">{formatCurrency(stats.totalDeposits)}</p>
                    </div>
                    <Shield className="h-8 w-8 text-purple-200" />
                  </div>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search tenants..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="adjust">Adjusting</option>
                </select>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  <option value="new">New</option>
                  <option value="existing">Existing</option>
                </select>
              </div>
            </div>

            {/* Content Based on View Mode */}
            {viewMode === 'cards' ? (
              /* Tenant List Cards View */
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-slideUp">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Tenant List</h3>
                  <p className="text-gray-600">{filteredTenants.length} tenants found</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTenants.map((tenant, index) => (
                    <div 
                      key={tenant.id} 
                      className={`bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 animate-bounceIn ${
                        isVacatingThisMonth(tenant) ? 'border-red-500 bg-red-50' : ''
                      }`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-yellow-600" />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900">{tenant.name}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tenant.status)}`}>
                              {tenant.status}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getTenantPriorityIcon(tenant)}
                          <button className="p-1 text-gray-400 hover:text-gray-600">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Tenant Details */}
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-4 h-4 bg-gray-200 rounded flex items-center justify-center">
                            <span className="text-xs font-medium">🏠</span>
                          </div>
                          <span>Room: {tenant.room_number}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-4 h-4 bg-gray-200 rounded flex items-center justify-center">
                            <span className="text-xs font-medium">📱</span>
                          </div>
                          <span>Phone: {tenant.mobile}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-4 h-4 bg-gray-200 rounded flex items-center justify-center">
                            <span className="text-xs font-medium">💰</span>
                          </div>
                          <span>Rent: <span className="text-orange-600 font-medium">{formatCurrency(tenant.monthly_rent)}</span></span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-4 h-4 bg-gray-200 rounded flex items-center justify-center">
                            <span className="text-xs font-medium">🛡️</span>
                          </div>
                          <span>Security: <span className="text-orange-600 font-medium">{formatCurrency(tenant.security_deposit)}</span></span>
                        </div>
                      </div>

                      {/* Additional Info */}
                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Joining Date:</span>
                          <span className="font-semibold text-gray-900">{tenant.joining_date}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm mt-1">
                          <span className="text-gray-600">Category:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(tenant.category || '')}`}>
                            {tenant.category || 'N/A'}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedTenant(tenant);
                            setShowDetailsModal(true);
                          }}
                          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          View Details
                        </button>
                        <button className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                          EDIT
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Tenant Table View */
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-slideUp">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Tenant Table View</h3>
                  <p className="text-gray-600">{filteredTenants.length} tenants found</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Room No</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Tenant Names</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Date of Joining</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Room Type</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Max Occupancy</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Current Tenants</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Current Electricity Reading</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Last Reading</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Vacating On</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTenants.map((tenant, index) => {
                        const roomType = getRoomType(tenant.room_number);
                        const maxOccupancy = getBedCount(roomType);
                        const currentTenants = getCurrentTenantsCount(tenant.room_number);
                        const isVacating = isVacatingThisMonth(tenant);
                        
                        return (
                          <tr 
                            key={tenant.id} 
                            className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                              isVacating ? 'bg-red-50 border-red-200' : ''
                            }`}
                          >
                            <td className={`py-3 px-4 ${isVacating ? 'text-red-700 font-semibold' : 'text-gray-900'}`}>
                              {tenant.room_number}
                            </td>
                            <td className={`py-3 px-4 ${isVacating ? 'text-red-700 font-semibold' : 'text-gray-900'}`}>
                              {tenant.name}
                            </td>
                            <td className={`py-3 px-4 ${isVacating ? 'text-red-700' : 'text-gray-600'}`}>
                              {tenant.joining_date}
                            </td>
                            <td className={`py-3 px-4 ${isVacating ? 'text-red-700' : 'text-gray-600'}`}>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                roomType === 'Single' ? 'bg-blue-100 text-blue-800' :
                                roomType === 'Double' ? 'bg-green-100 text-green-800' :
                                'bg-purple-100 text-purple-800'
                              }`}>
                                {roomType}
                              </span>
                            </td>
                            <td className={`py-3 px-4 ${isVacating ? 'text-red-700' : 'text-gray-600'}`}>
                              {maxOccupancy}
                            </td>
                            <td className={`py-3 px-4 ${isVacating ? 'text-red-700' : 'text-gray-600'}`}>
                              {currentTenants}
                            </td>
                            <td className={`py-3 px-4 ${isVacating ? 'text-red-700' : 'text-gray-600'}`}>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tenant.status)}`}>
                                {tenant.status}
                              </span>
                            </td>
                            <td className={`py-3 px-4 ${isVacating ? 'text-red-700' : 'text-gray-600'}`}>
                              {tenant.last_electricity_reading || tenant.electricity_joining_reading || 'N/A'}
                            </td>
                            <td className={`py-3 px-4 ${isVacating ? 'text-red-700' : 'text-gray-600'}`}>
                              {tenant.electricity_joining_reading || 'N/A'}
                            </td>
                            <td className={`py-3 px-4 ${isVacating ? 'text-red-700 font-semibold' : 'text-gray-600'}`}>
                              {tenant.notice_given ? 'Yes' : 'No'}
                            </td>
                            <td className={`py-3 px-4 ${isVacating ? 'text-red-700 font-semibold' : 'text-gray-600'}`}>
                              {tenant.notice_date || tenant.departure_date || 'N/A'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Table Summary */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Total Tenants:</span>
                      <span className="font-semibold ml-2">{filteredTenants.length}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Vacating This Month:</span>
                      <span className="font-semibold text-red-600 ml-2">
                        {filteredTenants.filter(t => isVacatingThisMonth(t)).length}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Active Tenants:</span>
                      <span className="font-semibold text-green-600 ml-2">
                        {filteredTenants.filter(t => t.status === 'active').length}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Revenue:</span>
                      <span className="font-semibold ml-2">
                        {formatCurrency(filteredTenants.reduce((sum, t) => sum + (t.monthly_rent || 0), 0))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5 text-yellow-600" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button className="w-full bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-3 rounded-lg flex items-center gap-3 transition-all duration-300 hover:scale-105">
                  <Plus className="h-4 w-4" />
                  Add New Tenant
                </button>
                <button className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg flex items-center gap-3 transition-all duration-300 hover:scale-105">
                  <FileText className="h-4 w-4" />
                  Generate Report
                </button>
                <button className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg flex items-center gap-3 transition-all duration-300 hover:scale-105">
                  <Bell className="h-4 w-4" />
                  Send Notifications
                </button>
                <button className="w-full bg-purple-500 hover:bg-purple-600 text-white px-4 py-3 rounded-lg flex items-center gap-3 transition-all duration-300 hover:scale-105">
                  <Calendar className="h-4 w-4" />
                  Schedule Viewing
                </button>
              </div>
            </div>

            {/* Tenant Statistics */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-yellow-600" />
                Tenant Statistics
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Active Tenants</span>
                  <span className="font-semibold text-green-600">{stats.active}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Inactive Tenants</span>
                  <span className="font-semibold text-red-600">{stats.inactive}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Adjusting</span>
                  <span className="font-semibold text-yellow-600">{stats.adjusting}</span>
                </div>
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Categories</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">New Tenants</span>
                      <span className="font-semibold">{stats.newTenants}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">With Food</span>
                      <span className="font-semibold">{stats.withFood}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Overview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Settings className="h-5 w-5 text-yellow-600" />
                Status Overview
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600">Active</span>
                  </div>
                  <span className="font-semibold">{stats.active}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-gray-600">Inactive</span>
                  </div>
                  <span className="font-semibold">{stats.inactive}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-gray-600">Adjusting</span>
                  </div>
                  <span className="font-semibold">{stats.adjusting}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span className="text-gray-600">Notice Given</span>
                  </div>
                  <span className="font-semibold">{stats.noticeGiven}</span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                Recent Activity
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">New tenant registered</p>
                    <p className="text-xs text-gray-500">Room 101 - 2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Rent payment received</p>
                    <p className="text-xs text-gray-500">Room 205 - 4 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Notice period started</p>
                    <p className="text-xs text-gray-500">Room 312 - 6 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Security deposit paid</p>
                    <p className="text-xs text-gray-500">Room 118 - 1 day ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAddModal && (
        <TenantForm
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={() => {
            setShowAddModal(false);
            fetchTenants();
            fetchStats();
          }}
        />
      )}

      {showDetailsModal && selectedTenant && (
        <TenantDetailsModal
          isOpen={showDetailsModal}
          tenant={selectedTenant}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedTenant(null);
          }}
        />
      )}
    </div>
  );
};

// Tenant Details Modal Component
interface TenantDetailsModalProps {
  isOpen: boolean;
  tenant: Tenant;
  onClose: () => void;
}

const TenantDetailsModal = ({ isOpen, tenant, onClose }: TenantDetailsModalProps) => {
  if (!isOpen || !tenant) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gray-900 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Tenant Details</h2>
              <p className="text-gray-300 mt-1">Complete information about {tenant.name}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Overview */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{tenant.room_number}</div>
                <div className="text-gray-600">Room Number</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{formatCurrency(tenant.monthly_rent)}</div>
                <div className="text-gray-600">Monthly Rent</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{formatCurrency(tenant.security_deposit)}</div>
                <div className="text-gray-600">Security Deposit</div>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-600">Full Name</label>
                <div className="text-gray-900 font-medium mt-1">{tenant.name}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Mobile Number</label>
                <div className="text-gray-900 font-medium mt-1">{tenant.mobile}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Room Number</label>
                <div className="text-gray-900 font-medium mt-1">{tenant.room_number}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <div className="mt-1">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(tenant.status)}`}>
                    {tenant.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-600">Monthly Rent</label>
                <div className="text-gray-900 font-medium mt-1">{formatCurrency(tenant.monthly_rent)}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Security Deposit</label>
                <div className="text-gray-900 font-medium mt-1">{formatCurrency(tenant.security_deposit)}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Joining Date</label>
                <div className="text-gray-900 font-medium mt-1">{tenant.joining_date}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Category</label>
                <div className="mt-1">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(tenant.category || '')}`}>
                    {tenant.category || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-600">Food Service</label>
                <div className="text-gray-900 font-medium mt-1">{tenant.has_food ? 'Yes' : 'No'}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Notice Given</label>
                <div className="text-gray-900 font-medium mt-1">{tenant.notice_given ? 'Yes' : 'No'}</div>
              </div>
              {tenant.notice_date && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Notice Date</label>
                  <div className="text-gray-900 font-medium mt-1">{tenant.notice_date}</div>
                </div>
              )}
              {tenant.departure_date && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Departure Date</label>
                  <div className="text-gray-900 font-medium mt-1">{tenant.departure_date}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tenants; 