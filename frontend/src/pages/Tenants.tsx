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
import TenantDataImporter from '../components/TenantDataImporter';
import TenantForm from '../components/TenantForm';

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
}

const Tenants = () => {
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
    fetchTenants();
    fetchStats();
  }, [searchTerm, statusFilter, categoryFilter]);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (searchTerm) queryParams.append('search', searchTerm);
      if (statusFilter) queryParams.append('status', statusFilter);
      if (categoryFilter) queryParams.append('category', categoryFilter);

      const response = await fetch(`/api/tenants?${queryParams}`);
      const data = await response.json();
      setTenants(data.tenants || []);
    } catch (error) {
      console.error('Failed to fetch tenants:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/tenants/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const deleteTenant = async (tenantId: string, tenantName: string) => {
    if (!confirm(`Are you sure you want to delete ${tenantName}? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/tenants/${tenantId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete tenant');
      }

      // Refresh the tenant list and stats
      fetchTenants();
      fetchStats();
    } catch (error) {
      console.error('Error deleting tenant:', error);
      alert('Failed to delete tenant. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN');
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
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'adjust': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'inactive': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-golden-400 mb-2">Tenants Management</h1>
        <p className="text-golden-300">Manage all tenant information and details</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-dark-900 border border-golden-600/20 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-golden-300 text-sm">Total Tenants</p>
              <p className="text-2xl font-bold text-golden-400">{stats.total}</p>
            </div>
            <Users className="h-8 w-8 text-golden-500" />
          </div>
        </div>
        
        <div className="bg-dark-900 border border-green-600/20 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-300 text-sm">Active Tenants</p>
              <p className="text-2xl font-bold text-green-400">{stats.active}</p>
            </div>
            <UserCheck className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-dark-900 border border-golden-600/20 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-golden-300 text-sm">Total Monthly Rent</p>
              <p className="text-2xl font-bold text-golden-400">{formatCurrency(stats.totalRent)}</p>
            </div>
            <IndianRupee className="h-8 w-8 text-golden-500" />
          </div>
        </div>

        <div className="bg-dark-900 border border-golden-600/20 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-golden-300 text-sm">With Food Service</p>
              <p className="text-2xl font-bold text-golden-400">{stats.withFood}</p>
            </div>
            <FileText className="h-8 w-8 text-golden-500" />
          </div>
        </div>
      </div>

      {/* Data Importer */}
      <TenantDataImporter onImportComplete={fetchTenants} />

      {/* Controls */}
      <div className="bg-dark-900 border border-golden-600/20 rounded-lg p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-golden-500" />
            <input
              type="text"
              placeholder="Search tenants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-200 placeholder-golden-600 focus:outline-none focus:ring-2 focus:ring-golden-500"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-200 focus:outline-none focus:ring-2 focus:ring-golden-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="adjust">Adjusting</option>
              <option value="inactive">Inactive</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-200 focus:outline-none focus:ring-2 focus:ring-golden-500"
            >
              <option value="">All Categories</option>
              <option value="new">New</option>
              <option value="existing">Existing</option>
            </select>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-golden-500 to-golden-600 text-dark-900 rounded-lg hover:from-golden-600 hover:to-golden-700 transition-all duration-200 font-medium"
            >
              <Plus className="h-4 w-4" />
              Add Tenant
            </button>
          </div>
        </div>
      </div>

      {/* Tenants Table */}
      <div className="bg-dark-900 border border-golden-600/20 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-800 border-b border-golden-600/20">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-golden-400 uppercase tracking-wider">
                  Tenant Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-golden-400 uppercase tracking-wider">
                  Room & Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-golden-400 uppercase tracking-wider">
                  Financial Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-golden-400 uppercase tracking-wider">
                  Joining Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-golden-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-golden-600/10">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-golden-300">
                    Loading tenants...
                  </td>
                </tr>
              ) : tenants.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-golden-300">
                    No tenants found
                  </td>
                </tr>
              ) : (
                tenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-dark-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-golden-200 font-medium">{tenant.name}</div>
                        <div className="flex items-center gap-1 text-golden-400 text-sm">
                          <Phone className="h-3 w-3" />
                          {tenant.mobile}
                        </div>
                        {tenant.has_food && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 mt-1">
                            Food Service
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-golden-200 mb-1">
                        <DoorOpen className="h-4 w-4" />
                        Room {tenant.room_number}
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs border ${getStatusColor(tenant.status)}`}>
                        {tenant.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-golden-200">
                        <div className="font-medium">{formatCurrency(tenant.monthly_rent)}/month</div>
                        <div className="text-sm text-golden-400">
                          Deposit: {formatCurrency(tenant.security_deposit)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-golden-300">
                        <Calendar className="h-4 w-4" />
                        {formatDate(tenant.joining_date)}
                      </div>
                      {tenant.category && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30 mt-1">
                          {tenant.category}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => {
                            setSelectedTenant(tenant);
                            setShowAddModal(true);
                          }}
                          className="p-1 text-golden-400 hover:text-golden-300 transition-colors"
                          title="Edit Tenant"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => deleteTenant(tenant.id, tenant.name)}
                          className="p-1 text-red-400 hover:text-red-300 transition-colors"
                          title="Delete Tenant"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button className="p-1 text-golden-400 hover:text-golden-300 transition-colors">
                          <MoreVertical className="h-4 w-4" />
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
      <TenantForm
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setSelectedTenant(null);
        }}
        onSubmit={() => {
          fetchTenants();
          fetchStats();
          setShowAddModal(false);
          setSelectedTenant(null);
        }}
        tenant={selectedTenant}
      />
    </div>
  );
};

export default Tenants; 