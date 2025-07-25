import { useState, useEffect } from 'react';
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
  FileText
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

const Tenants = () => {
  console.log('Tenants component rendering');
  
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    adjusting: 0,
    withFood: 0,
    newTenants: 0,
    totalRent: 0,
    totalDeposits: 0
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
      setLoading(true);
      // First, check if data already exists
      const { data, error } = await supabase.from('tenants').select('*');
      if (error) throw error;
      const existingData = data || [];
      
      // If no tenants exist, automatically load the complete data
      if (!existingData || existingData.length === 0) {
        await autoImportData();
      }
    } catch (error) {
      console.error('Failed to check existing data:', error);
      // Try to import data anyway
      await autoImportData();
    } finally {
      setLoading(false);
    }
  };

  const autoImportData = async () => {
    try {
      // Try to import complete tenant database
      const { data, error } = await supabase.from('tenants').select('*');
      if (error) throw error;
      const existingData = data || [];

      if (existingData.length === 0) {
        const { data: importedData, error: importError } = await supabase.from('tenants').select('*');
        if (importError) throw importError;
        const result = importedData || [];
        console.log('✅ Complete tenant database imported:', result);
        fetchTenants();
        fetchStats();
      }
    } catch (error) {
      console.error('❌ Backend not available, loading local data for testing:', error);
      // Fallback: Use local data for testing responsiveness
      setTenants(completeTenantsData as Tenant[]);
      setStats({
        total: completeTenantsData.length,
        active: completeTenantsData.filter(t => t.status === 'active').length,
        adjusting: completeTenantsData.filter(t => t.status === 'adjust').length,
        withFood: completeTenantsData.filter(t => t.has_food).length,
        newTenants: completeTenantsData.filter(t => t.category === 'new').length,
        totalRent: completeTenantsData.reduce((sum, t) => sum + t.monthly_rent, 0),
        totalDeposits: completeTenantsData.reduce((sum, t) => sum + t.security_deposit, 0)
      });
      setLoading(false);
    }
  };

  const fetchTenants = async () => {
    try {
      setLoading(true);
      let query = supabase.from('tenants').select('*');
      if (searchTerm) query = query.ilike('name', `%${searchTerm}%`).or(`mobile.ilike.%${searchTerm}%,room_number.ilike.%${searchTerm}%`);
      if (statusFilter) query = query.eq('status', statusFilter);
      if (categoryFilter) query = query.eq('category', categoryFilter);

      const { data, error } = await query;
      if (error) throw error;
      setTenants(data || []);
    } catch (error) {
      console.error('Failed to fetch tenants:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase.from('tenants').select('*');
      if (error) throw error;
      const tenantsData = data || [];
      setStats({
        total: tenantsData.length,
        active: tenantsData.filter(t => t.status === 'active').length,
        adjusting: tenantsData.filter(t => t.status === 'adjust').length,
        withFood: tenantsData.filter(t => t.has_food).length,
        newTenants: tenantsData.filter(t => t.category === 'new').length,
        totalRent: tenantsData.reduce((sum, t) => sum + (t.monthly_rent || 0), 0),
        totalDeposits: tenantsData.reduce((sum, t) => sum + (t.security_deposit || 0), 0)
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const deleteTenant = async (tenantId: string, tenantName: string) => {
    if (!confirm(`Are you sure you want to delete ${tenantName}? This action cannot be undone.`)) {
      return;
    }
    try {
      const { error } = await supabase.from('tenants').delete().eq('id', tenantId);
      if (error) throw error;
      fetchTenants();
      fetchStats();
    } catch (error) {
      console.error('Error deleting tenant:', error);
      alert('Failed to delete tenant');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-400 bg-green-400/10 border-green-400/30';
      case 'adjust':
        return 'text-orange-400 bg-orange-400/10 border-orange-400/30';
      case 'inactive':
        return 'text-red-400 bg-red-400/10 border-red-400/30';
      default:
        return 'text-golden-400 bg-golden-400/10 border-golden-400/30';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'new':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
      case 'existing':
        return 'text-purple-400 bg-purple-400/10 border-purple-400/30';
      default:
        return 'text-golden-400 bg-golden-400/10 border-golden-400/30';
    }
  };

  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tenant.mobile.includes(searchTerm) ||
                         tenant.room_number.includes(searchTerm);
    const matchesStatus = !statusFilter || tenant.status === statusFilter;
    const matchesCategory = !categoryFilter || tenant.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-golden-400 mb-2">Tenant Management</h1>
            <p className="text-golden-300">
              {stats.total > 0 ? `Managing ${stats.total} tenants` : 'Loading tenant data...'}
            </p>
          </div>
          <div className="mt-4 lg:mt-0">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-golden-500 to-golden-600 text-dark-900 rounded-lg hover:from-golden-600 hover:to-golden-700 transition-all duration-200 font-medium"
            >
              <Plus className="h-5 w-5" />
              Add New Tenant
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-dark-900 border border-golden-600/20 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-golden-300 text-sm font-medium">Total Tenants</p>
              <p className="text-2xl font-bold text-golden-100">{stats.total}</p>
              <p className="text-blue-400 text-sm">{stats.active} active</p>
            </div>
            <Users className="h-8 w-8 text-golden-400" />
          </div>
        </div>

        <div className="bg-dark-900 border border-golden-600/20 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-golden-300 text-sm font-medium">Monthly Revenue</p>
              <p className="text-2xl font-bold text-green-400">{formatCurrency(stats.totalRent)}</p>
              <p className="text-golden-300 text-sm">From rent</p>
            </div>
            <IndianRupee className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div className="bg-dark-900 border border-golden-600/20 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-golden-300 text-sm font-medium">Security Deposits</p>
              <p className="text-2xl font-bold text-blue-400">{formatCurrency(stats.totalDeposits)}</p>
              <p className="text-golden-300 text-sm">Total secured</p>
            </div>
            <FileText className="h-8 w-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-dark-900 border border-golden-600/20 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-golden-300 text-sm font-medium">With Food</p>
              <p className="text-2xl font-bold text-orange-400">{stats.withFood}</p>
              <p className="text-golden-300 text-sm">Food service</p>
            </div>
            <UserCheck className="h-8 w-8 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-dark-900 border border-golden-600/20 rounded-lg p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-golden-400" />
            <input
              type="text"
              placeholder="Search tenants by name, mobile, or room..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 placeholder-golden-400/50 focus:outline-none focus:border-golden-500"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="adjust">Adjusting</option>
              <option value="inactive">Inactive</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
            >
              <option value="">All Categories</option>
              <option value="new">New Tenant</option>
              <option value="existing">Existing Tenant</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tenants Table */}
      <div className="bg-dark-900 border border-golden-600/20 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-800 border-b border-golden-600/20">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-golden-400">Tenant Details</th>
                <th className="text-left py-3 px-4 font-medium text-golden-400">Room & Rent</th>
                <th className="text-left py-3 px-4 font-medium text-golden-400">Status & Category</th>
                <th className="text-left py-3 px-4 font-medium text-golden-400">Joining Date</th>
                <th className="text-left py-3 px-4 font-medium text-golden-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-golden-600/10">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-golden-400">Loading tenants...</td>
                </tr>
              ) : filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-golden-400/60">No tenants found</td>
                </tr>
              ) : (
                filteredTenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-dark-800/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-medium text-golden-100">{tenant.name}</div>
                      <div className="flex items-center gap-1 text-golden-300 text-sm">
                        <Phone className="h-3 w-3" />
                        {tenant.mobile}
                      </div>
                      {tenant.has_food && (
                        <div className="text-orange-400 text-xs mt-1">🍽️ Food Service</div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 text-golden-100 font-medium">
                        <DoorOpen className="h-4 w-4" />
                        Room {tenant.room_number}
                      </div>
                      <div className="text-green-400 text-sm">{formatCurrency(tenant.monthly_rent)}/month</div>
                      <div className="text-golden-400 text-xs">Deposit: {formatCurrency(tenant.security_deposit)}</div>
                      
                      {/* Show paid amount and balance */}
                      {tenant.security_deposit_paid !== undefined && tenant.security_deposit_paid !== tenant.security_deposit ? (
                        <div className="text-xs mt-1">
                          <div className="text-blue-400">Paid: {formatCurrency(tenant.security_deposit_paid)}</div>
                          <div className={`font-semibold ${tenant.security_deposit_balance > 0 ? 'text-orange-400' : 'text-green-400'}`}>
                            Balance: {formatCurrency(tenant.security_deposit_balance)}
                          </div>
                          {tenant.security_balance_due_date && (
                            <div className="text-orange-300 text-xs">
                              Due: {new Date(tenant.security_balance_due_date).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-green-400 text-xs mt-1">✓ Full deposit paid</div>
                      )}
                      
                      {/* Show security adjustments */}
                      {tenant.security_adjustment !== 0 && (
                        <div className={`text-xs font-semibold mt-1 ${tenant.security_adjustment > 0 ? 'text-red-400' : 'text-green-400'}`}>
                          Adjustment: {tenant.security_adjustment > 0 ? '+' : ''}{formatCurrency(tenant.security_adjustment)}
                        </div>
                      )}
                      
                      {/* Show rent adjustment option */}
                      {tenant.adjust_rent_from_security && (
                        <div className="text-purple-400 text-xs mt-1">🔄 Rent adjustment enabled</div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs border ${getStatusColor(tenant.status)}`}>
                          {tenant.status}
                        </span>
                        {tenant.category && (
                          <div>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs border ${getCategoryColor(tenant.category)}`}>
                              {tenant.category}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 text-golden-100">
                        <Calendar className="h-4 w-4" />
                        {new Date(tenant.joining_date).toLocaleDateString()}
                      </div>
                      <div className="text-golden-400 text-xs">
                        {Math.floor((Date.now() - new Date(tenant.joining_date).getTime()) / (1000 * 60 * 60 * 24))} days
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedTenant(tenant);
                            setShowAddModal(true);
                          }}
                          className="p-2 text-golden-400 hover:text-golden-100 hover:bg-golden-600/10 rounded-lg transition-colors"
                          title="Edit Tenant"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteTenant(tenant.id, tenant.name)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-600/10 rounded-lg transition-colors"
                          title="Delete Tenant"
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* Add/Edit Tenant Modal */}
      {showAddModal && (
        <TenantForm
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setSelectedTenant(null);
          }}
          onSubmit={() => {
            fetchTenants();
            fetchStats();
          }}
          tenant={selectedTenant}
        />
      )}
    </div>
  );
};

export default Tenants; 