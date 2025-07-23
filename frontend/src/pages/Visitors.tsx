import { useState, useEffect } from 'react';
import { Search, Clock, UserCheck, AlertCircle, Users, Eye, CheckCircle, XCircle, LogIn, LogOut, Car } from 'lucide-react';
import axios from 'axios';

// Utility functions for styling
const getStatusColor = (status: string) => {
  switch (status) {
    case 'checked_in':
      return 'text-green-400 bg-green-400/10 border-green-400/30';
    case 'checked_out':
      return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
    case 'overstayed':
      return 'text-red-400 bg-red-400/10 border-red-400/30';
    default:
      return 'text-golden-400 bg-golden-400/10 border-golden-400/30';
  }
};

const getApprovalColor = (status: string) => {
  switch (status) {
    case 'approved':
      return 'text-green-400 bg-green-400/10 border-green-400/30';
    case 'pending':
      return 'text-orange-400 bg-orange-400/10 border-orange-400/30';
    case 'rejected':
      return 'text-red-400 bg-red-400/10 border-red-400/30';
    default:
      return 'text-golden-400 bg-golden-400/10 border-golden-400/30';
  }
};

interface Visitor {
  id: string;
  visitor_name: string;
  visitor_phone: string;
  visitor_id_type: 'aadhar' | 'pan' | 'passport' | 'driving_license';
  visitor_id_number: string;
  purpose: 'personal' | 'business' | 'delivery' | 'maintenance' | 'official';
  purpose_description: string;
  host_tenant_id: string;
  host_tenant_name: string;
  host_room_number: string;
  check_in_time: string;
  expected_duration: string;
  approval_status: 'pending' | 'approved' | 'rejected';
  approved_by?: string;
  status: 'checked_in' | 'checked_out' | 'overstayed';
  check_out_time?: string;
  actual_duration?: string;
  vehicle_number?: string;
  emergency_contact?: string;
  notes?: string;
  photo_url?: string;
  created_by: string;
  updated_date: string;
}

interface VisitorStats {
  total_visitors: number;
  active_visitors: number;
  checked_out_today: number;
  pending_approval: number;
  overstayed_visitors: number;
  this_week_visitors: number;
  purpose_breakdown: { [key: string]: number };
  avg_visit_duration: string;
}

const Visitors = () => {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [activeVisitors, setActiveVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [purposeFilter, setPurposeFilter] = useState('');
  const [showCheckinModal, setShowCheckinModal] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [stats, setStats] = useState<VisitorStats>({
    total_visitors: 0,
    active_visitors: 0,
    checked_out_today: 0,
    pending_approval: 0,
    overstayed_visitors: 0,
    this_week_visitors: 0,
    purpose_breakdown: {},
    avg_visit_duration: '0 minutes'
  });

  useEffect(() => {
    fetchData();
  }, [statusFilter, purposeFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchVisitors(),
        fetchActiveVisitors(),
        fetchStats()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVisitors = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (purposeFilter) params.append('purpose', purposeFilter);
      
      const response = await axios.get(`/api/visitors?${params}`);
      setVisitors(response.data.visitors || []);
    } catch (error) {
      console.error('Error fetching visitors:', error);
    }
  };

  const fetchActiveVisitors = async () => {
    try {
      const response = await axios.get('/api/visitors/active');
      setActiveVisitors(response.data || []);
    } catch (error) {
      console.error('Error fetching active visitors:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/visitors/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const checkOutVisitor = async (visitorId: string, notes?: string) => {
    try {
      await axios.put(`/api/visitors/${visitorId}/checkout`, {
        notes,
        performed_by: 'security'
      });
      fetchData();
    } catch (error: any) {
      console.error('Error checking out visitor:', error);
      alert(error.response?.data?.error || 'Failed to check out visitor');
    }
  };

  const approveVisitor = async (visitorId: string, approved: boolean) => {
    try {
      await axios.put(`/api/visitors/${visitorId}/approve`, {
        approval_status: approved ? 'approved' : 'rejected',
        approved_by: 'admin'
      });
      fetchData();
    } catch (error: any) {
      console.error('Error updating approval:', error);
      alert(error.response?.data?.error || 'Failed to update approval');
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const filteredVisitors = visitors.filter(visitor =>
    visitor.visitor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visitor.host_tenant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visitor.host_room_number.includes(searchTerm) ||
    visitor.visitor_phone.includes(searchTerm)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-golden-400 mb-2">Visitor Management</h1>
            <p className="text-golden-300">Track and manage visitor entries and exits</p>
          </div>
          <div className="mt-4 lg:mt-0">
            <button
              onClick={() => setShowCheckinModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-golden-500 to-golden-600 text-dark-900 rounded-lg hover:from-golden-600 hover:to-golden-700 transition-all duration-200 font-medium"
            >
              <LogIn className="h-5 w-5" />
              Check-in Visitor
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-dark-900 border border-golden-600/20 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-golden-300 text-sm font-medium">Total Visitors</p>
              <p className="text-2xl font-bold text-golden-100">{stats.total_visitors}</p>
              <p className="text-blue-400 text-sm">+{stats.this_week_visitors} this week</p>
            </div>
            <Users className="h-8 w-8 text-golden-400" />
          </div>
        </div>

        <div className="bg-dark-900 border border-golden-600/20 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-golden-300 text-sm font-medium">Currently Inside</p>
              <p className="text-2xl font-bold text-green-400">{stats.active_visitors}</p>
              <p className="text-golden-300 text-sm">Active now</p>
            </div>
            <UserCheck className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div className="bg-dark-900 border border-golden-600/20 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-golden-300 text-sm font-medium">Checked Out Today</p>
              <p className="text-2xl font-bold text-blue-400">{stats.checked_out_today}</p>
              <p className="text-golden-300 text-sm">Avg: {stats.avg_visit_duration}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-dark-900 border border-golden-600/20 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-golden-300 text-sm font-medium">Pending Approval</p>
              <p className="text-2xl font-bold text-orange-400">{stats.pending_approval}</p>
              <p className="text-red-400 text-sm">{stats.overstayed_visitors} overstayed</p>
            </div>
            <AlertCircle className="h-8 w-8 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Purpose Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-dark-900 border border-golden-600/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-golden-400 mb-4 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Visit Purposes
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.purpose_breakdown).map(([purpose, count]) => (
              <div key={purpose} className="flex items-center justify-between">
                <span className="text-golden-300 capitalize">{purpose.replace('_', ' ')}</span>
                <span className="text-golden-100 font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-dark-900 border border-golden-600/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-golden-400 mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Active Visitors
          </h3>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {activeVisitors.map((visitor) => (
              <div key={visitor.id} className="flex items-center justify-between p-3 bg-dark-800 rounded-lg">
                <div>
                  <div className="text-golden-100 font-medium">{visitor.visitor_name}</div>
                  <div className="text-golden-300 text-sm">
                    Visiting {visitor.host_tenant_name} (Room {visitor.host_room_number})
                  </div>
                  <div className="text-golden-400 text-xs">
                    Since: {formatTime(visitor.check_in_time)}
                  </div>
                </div>
                <button
                  onClick={() => checkOutVisitor(visitor.id)}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-500 transition-colors"
                >
                  Check Out
                </button>
              </div>
            ))}
            {activeVisitors.length === 0 && (
              <div className="text-center py-4 text-golden-400/60">
                No active visitors
              </div>
            )}
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
              placeholder="Search visitors, tenants, or rooms..."
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
              <option value="checked_in">Checked In</option>
              <option value="checked_out">Checked Out</option>
              <option value="overstayed">Overstayed</option>
            </select>

            <select
              value={purposeFilter}
              onChange={(e) => setPurposeFilter(e.target.value)}
              className="px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
            >
              <option value="">All Purposes</option>
              <option value="personal">Personal</option>
              <option value="business">Business</option>
              <option value="delivery">Delivery</option>
              <option value="maintenance">Maintenance</option>
              <option value="official">Official</option>
            </select>
          </div>
        </div>
      </div>

      {/* Visitors Table */}
      <div className="bg-dark-900 border border-golden-600/20 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-800 border-b border-golden-600/20">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-golden-400">Visitor Details</th>
                <th className="text-left py-3 px-4 font-medium text-golden-400">Host & Room</th>
                <th className="text-left py-3 px-4 font-medium text-golden-400">Purpose</th>
                <th className="text-left py-3 px-4 font-medium text-golden-400">Time</th>
                <th className="text-left py-3 px-4 font-medium text-golden-400">Status</th>
                <th className="text-left py-3 px-4 font-medium text-golden-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-golden-600/10">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-golden-400">Loading visitors...</td>
                </tr>
              ) : filteredVisitors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-golden-400/60">No visitors found</td>
                </tr>
              ) : (
                filteredVisitors.map((visitor) => (
                  <tr key={visitor.id} className="hover:bg-dark-800/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-medium text-golden-100">{visitor.visitor_name}</div>
                      <div className="text-golden-300 text-sm">{visitor.visitor_phone}</div>
                      <div className="text-golden-400 text-xs">
                        {visitor.visitor_id_type.toUpperCase()}: {visitor.visitor_id_number}
                      </div>
                      {visitor.vehicle_number && (
                        <div className="text-golden-400 text-xs flex items-center gap-1">
                          <Car className="h-3 w-3" />
                          {visitor.vehicle_number}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-golden-100">{visitor.host_tenant_name}</div>
                      <div className="text-golden-300 text-sm">Room {visitor.host_room_number}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-golden-100 capitalize">
                        {visitor.purpose.replace('_', ' ')}
                      </div>
                      {visitor.purpose_description && (
                        <div className="text-golden-300 text-sm">
                          {visitor.purpose_description.slice(0, 30)}...
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-golden-100">
                        In: {formatTime(visitor.check_in_time)}
                      </div>
                      <div className="text-golden-300 text-sm">
                        {formatDate(visitor.check_in_time)}
                      </div>
                      {visitor.check_out_time && (
                        <div className="text-blue-400 text-sm">
                          Out: {formatTime(visitor.check_out_time)}
                        </div>
                      )}
                      <div className="text-golden-400 text-xs">
                        Expected: {visitor.expected_duration}h
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <div>
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${getStatusColor(visitor.status)}`}>
                            {visitor.status === 'checked_in' && <LogIn className="h-3 w-3" />}
                            {visitor.status === 'checked_out' && <LogOut className="h-3 w-3" />}
                            {visitor.status === 'overstayed' && <AlertCircle className="h-3 w-3" />}
                            {visitor.status.replace('_', ' ')}
                          </span>
                        </div>
                        <div>
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${getApprovalColor(visitor.approval_status)}`}>
                            {visitor.approval_status === 'approved' && <CheckCircle className="h-3 w-3" />}
                            {visitor.approval_status === 'pending' && <Clock className="h-3 w-3" />}
                            {visitor.approval_status === 'rejected' && <XCircle className="h-3 w-3" />}
                            {visitor.approval_status}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedVisitor(visitor);
                            setShowDetailModal(true);
                          }}
                          className="p-1 text-golden-400 hover:text-golden-100 transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        
                        {visitor.approval_status === 'pending' && (
                          <>
                            <button
                              onClick={() => approveVisitor(visitor.id, true)}
                              className="p-1 text-green-400 hover:text-green-300 transition-colors"
                              title="Approve"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => approveVisitor(visitor.id, false)}
                              className="p-1 text-red-400 hover:text-red-300 transition-colors"
                              title="Reject"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        
                        {visitor.status === 'checked_in' && (
                          <button
                            onClick={() => checkOutVisitor(visitor.id)}
                            className="flex items-center gap-1 px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-500 transition-colors"
                          >
                            <LogOut className="h-3 w-3" />
                            Out
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Check-in Modal */}
      {showCheckinModal && (
        <VisitorCheckinModal
          isOpen={showCheckinModal}
          onClose={() => setShowCheckinModal(false)}
          onSubmit={() => {
            fetchData();
            setShowCheckinModal(false);
          }}
        />
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedVisitor && (
        <VisitorDetailModal
          isOpen={showDetailModal}
          visitor={selectedVisitor}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedVisitor(null);
          }}
        />
      )}
    </div>
  );
};

// Components for modals would be defined here...
// For now, using placeholders

interface VisitorCheckinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

const VisitorCheckinModal = ({ isOpen, onClose, onSubmit }: VisitorCheckinModalProps) => {
  const [formData, setFormData] = useState({
    visitor_name: '',
    visitor_phone: '',
    visitor_id_type: 'aadhar' as 'aadhar' | 'pan' | 'driving_license' | 'passport' | 'voter_id',
    visitor_id_number: '',
    purpose: 'personal' as 'personal' | 'business' | 'delivery' | 'maintenance' | 'other',
    purpose_description: '',
    host_tenant_id: '',
    host_tenant_name: '',
    host_room_number: '',
    expected_duration: '2',
    vehicle_number: '',
    emergency_contact: '',
    notes: ''
  });

  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingTenants, setLoadingTenants] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    if (isOpen) {
      fetchTenants();
      // Reset form
      setFormData({
        visitor_name: '',
        visitor_phone: '',
        visitor_id_type: 'aadhar',
        visitor_id_number: '',
        purpose: 'personal',
        purpose_description: '',
        host_tenant_id: '',
        host_tenant_name: '',
        host_room_number: '',
        expected_duration: '2',
        vehicle_number: '',
        emergency_contact: '',
        notes: ''
      });
      setActiveTab('basic');
    }
  }, [isOpen]);

  const fetchTenants = async () => {
    try {
      setLoadingTenants(true);
      const response = await axios.get('/api/tenants');
      setTenants(response.data.tenants || []);
    } catch (error) {
      console.error('Error fetching tenants:', error);
    } finally {
      setLoadingTenants(false);
    }
  };

  const handleHostSelection = (value: string) => {
    if (value) {
      const [roomNumber, tenantId] = value.split('-');
      const tenant = tenants.find(t => t.id === tenantId);
      
      if (tenant) {
        setFormData(prev => ({
          ...prev,
          host_tenant_id: tenant.id,
          host_tenant_name: tenant.name,
          host_room_number: tenant.room_number
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        host_tenant_id: '',
        host_tenant_name: '',
        host_room_number: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.visitor_name.trim()) {
      alert('Visitor name is required');
      return;
    }
    
    if (!formData.visitor_phone.trim() || formData.visitor_phone.length < 10) {
      alert('Valid phone number is required');
      return;
    }
    
    if (!formData.visitor_id_number.trim()) {
      alert('ID number is required');
      return;
    }
    
    if (!formData.host_tenant_id) {
      alert('Please select a host tenant');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post('/api/visitors/checkin', {
        visitor_name: formData.visitor_name.trim(),
        visitor_phone: formData.visitor_phone.trim(),
        visitor_id_type: formData.visitor_id_type,
        visitor_id_number: formData.visitor_id_number.trim(),
        purpose: formData.purpose,
        purpose_description: formData.purpose_description.trim(),
        host_tenant_id: formData.host_tenant_id,
        host_tenant_name: formData.host_tenant_name,
        host_room_number: formData.host_room_number,
        expected_duration: formData.expected_duration,
        vehicle_number: formData.vehicle_number.trim(),
        emergency_contact: formData.emergency_contact.trim(),
        notes: formData.notes.trim(),
        created_by: 'security'
      });

      if (response.status === 201) {
        alert(`✅ Visitor ${formData.visitor_name} checked in successfully!`);
        onSubmit();
        onClose();
      }
    } catch (error: any) {
      console.error('Error checking in visitor:', error);
      alert(error.response?.data?.error || 'Failed to check in visitor');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-dark-900 border border-golden-600/20 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-golden-600/20">
          <div>
            <h2 className="text-xl font-semibold text-golden-400">Check-in Visitor</h2>
            <p className="text-golden-300 text-sm">Register a new visitor to the property</p>
          </div>
          <button onClick={onClose} className="text-golden-300 hover:text-golden-100">
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Tab Navigation */}
          <div className="flex mb-6 border-b border-golden-600/20">
            <button
              type="button"
              onClick={() => setActiveTab('basic')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'basic'
                  ? 'border-golden-400 text-golden-400'
                  : 'border-transparent text-golden-300 hover:text-golden-100'
              }`}
            >
              Basic Info
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('visit')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'visit'
                  ? 'border-golden-400 text-golden-400'
                  : 'border-transparent text-golden-300 hover:text-golden-100'
              }`}
            >
              Visit Details
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('additional')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'additional'
                  ? 'border-golden-400 text-golden-400'
                  : 'border-transparent text-golden-300 hover:text-golden-100'
              }`}
            >
              Additional Info
            </button>
          </div>

          {/* Basic Information Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-golden-300 mb-2">
                    👤 Visitor Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.visitor_name}
                    onChange={(e) => setFormData({ ...formData, visitor_name: e.target.value })}
                    className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 placeholder-golden-400/50 focus:outline-none focus:border-golden-500"
                    placeholder="Enter visitor's full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-golden-300 mb-2">
                    📱 Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.visitor_phone}
                    onChange={(e) => setFormData({ ...formData, visitor_phone: e.target.value })}
                    className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 placeholder-golden-400/50 focus:outline-none focus:border-golden-500"
                    placeholder="Enter 10-digit mobile number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-golden-300 mb-2">
                    🆔 ID Type *
                  </label>
                  <select
                    required
                    value={formData.visitor_id_type}
                    onChange={(e) => setFormData({ ...formData, visitor_id_type: e.target.value as any })}
                    className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
                  >
                    <option value="aadhar">Aadhar Card</option>
                    <option value="pan">PAN Card</option>
                    <option value="driving_license">Driving License</option>
                    <option value="passport">Passport</option>
                    <option value="voter_id">Voter ID</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-golden-300 mb-2">
                    🔢 ID Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.visitor_id_number}
                    onChange={(e) => setFormData({ ...formData, visitor_id_number: e.target.value })}
                    className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 placeholder-golden-400/50 focus:outline-none focus:border-golden-500"
                    placeholder="Enter ID number"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Visit Details Tab */}
          {activeTab === 'visit' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-golden-300 mb-2">
                    🎯 Purpose of Visit *
                  </label>
                  <select
                    required
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value as any })}
                    className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
                  >
                    <option value="personal">Personal Visit</option>
                    <option value="business">Business Meeting</option>
                    <option value="delivery">Delivery</option>
                    <option value="maintenance">Maintenance Work</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-golden-300 mb-2">
                    ⏱️ Expected Duration (hours) *
                  </label>
                  <select
                    required
                    value={formData.expected_duration}
                    onChange={(e) => setFormData({ ...formData, expected_duration: e.target.value })}
                    className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
                  >
                    <option value="0.5">30 minutes</option>
                    <option value="1">1 hour</option>
                    <option value="2">2 hours</option>
                    <option value="4">4 hours</option>
                    <option value="8">8 hours</option>
                    <option value="24">Full day</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-golden-300 mb-2">
                    📝 Purpose Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.purpose_description}
                    onChange={(e) => setFormData({ ...formData, purpose_description: e.target.value })}
                    className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 placeholder-golden-400/50 focus:outline-none focus:border-golden-500"
                    placeholder="Provide more details about the visit purpose"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-golden-300 mb-2">
                    🏠 Host Tenant & Room *
                  </label>
                  <select
                    required
                    value={formData.host_tenant_id ? `${formData.host_room_number}-${formData.host_tenant_id}` : ''}
                    onChange={(e) => handleHostSelection(e.target.value)}
                    disabled={loadingTenants}
                    className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500 disabled:opacity-50"
                  >
                    <option value="">Select host tenant</option>
                    {tenants
                      .filter(tenant => tenant.status === 'active')
                      .map((tenant) => (
                      <option key={tenant.id} value={`${tenant.room_number}-${tenant.id}`}>
                        Room {tenant.room_number} - {tenant.name}
                      </option>
                    ))}
                  </select>
                  {loadingTenants && (
                    <p className="text-golden-400/60 text-xs mt-1">Loading tenants...</p>
                  )}
                  {formData.host_tenant_name && (
                    <div className="mt-2 p-2 bg-green-500/10 border border-green-500/30 rounded text-green-400 text-sm">
                      ✅ Visiting: {formData.host_tenant_name} in Room {formData.host_room_number}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Additional Information Tab */}
          {activeTab === 'additional' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-golden-300 mb-2">
                    🚗 Vehicle Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.vehicle_number}
                    onChange={(e) => setFormData({ ...formData, vehicle_number: e.target.value })}
                    className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 placeholder-golden-400/50 focus:outline-none focus:border-golden-500"
                    placeholder="Enter vehicle number (e.g., DL01AB1234)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-golden-300 mb-2">
                    🆘 Emergency Contact (Optional)
                  </label>
                  <input
                    type="tel"
                    value={formData.emergency_contact}
                    onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                    className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 placeholder-golden-400/50 focus:outline-none focus:border-golden-500"
                    placeholder="Enter emergency contact number"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-golden-300 mb-2">
                    📝 Additional Notes (Optional)
                  </label>
                  <textarea
                    rows={4}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 placeholder-golden-400/50 focus:outline-none focus:border-golden-500"
                    placeholder="Any additional notes about the visitor or visit"
                  />
                </div>
              </div>

              {/* Security Notice */}
              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="text-blue-400 font-medium text-sm">Security Guidelines:</h4>
                    <ul className="text-blue-300 text-xs mt-1 space-y-1">
                      <li>• All visitors must carry valid photo ID</li>
                      <li>• Host tenant will be notified of visitor arrival</li>
                      <li>• Visitor will be auto-checked out after expected duration + 1 hour</li>
                      <li>• Emergency contacts may be contacted if needed</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-golden-600/20">
            <div className="flex gap-2">
              {activeTab !== 'basic' && (
                <button
                  type="button"
                  onClick={() => {
                    if (activeTab === 'visit') setActiveTab('basic');
                    if (activeTab === 'additional') setActiveTab('visit');
                  }}
                  className="px-4 py-2 text-golden-300 border border-golden-600/30 rounded-lg hover:bg-golden-600/10 transition-colors"
                >
                  Previous
                </button>
              )}
              
              {activeTab !== 'additional' && (
                <button
                  type="button"
                  onClick={() => {
                    if (activeTab === 'basic') setActiveTab('visit');
                    if (activeTab === 'visit') setActiveTab('additional');
                  }}
                  className="px-4 py-2 bg-golden-600/20 text-golden-300 border border-golden-600/30 rounded-lg hover:bg-golden-600/30 transition-colors"
                >
                  Next
                </button>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 border border-golden-600/30 text-golden-300 rounded-lg hover:bg-golden-600/10 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !formData.visitor_name || !formData.host_tenant_id}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-golden-500 to-golden-600 text-dark-900 rounded-lg hover:from-golden-600 hover:to-golden-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-dark-900/30 border-t-dark-900 rounded-full animate-spin"></div>
                    Checking In...
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    Check In Visitor
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

interface VisitorDetailModalProps {
  isOpen: boolean;
  visitor: Visitor;
  onClose: () => void;
}

const VisitorDetailModal = ({ isOpen, visitor, onClose }: VisitorDetailModalProps) => {
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'checked_in':
        return <LogIn className="h-4 w-4 text-green-400" />;
      case 'checked_out':
        return <LogOut className="h-4 w-4 text-blue-400" />;
      case 'overstayed':
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      default:
        return <Clock className="h-4 w-4 text-golden-400" />;
    }
  };

  const getApprovalIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-orange-400" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-400" />;
      default:
        return <AlertCircle className="h-4 w-4 text-golden-400" />;
    }
  };

  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-dark-900 border border-golden-600/20 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-golden-600/20">
          <div>
            <h2 className="text-xl font-semibold text-golden-400">Visitor Details</h2>
            <p className="text-golden-300 text-sm">Complete information about the visitor</p>
          </div>
          <button onClick={onClose} className="text-golden-300 hover:text-golden-100">
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-dark-800 border border-golden-600/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                {getStatusIcon(visitor.status)}
                <span className="text-sm font-medium text-golden-300">Visit Status</span>
              </div>
              <div className={`text-lg font-semibold capitalize ${getStatusColor(visitor.status).split(' ')[0]}`}>
                {visitor.status.replace('_', ' ')}
              </div>
            </div>

            <div className="bg-dark-800 border border-golden-600/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                {getApprovalIcon(visitor.approval_status)}
                <span className="text-sm font-medium text-golden-300">Approval</span>
              </div>
              <div className={`text-lg font-semibold capitalize ${getApprovalColor(visitor.approval_status).split(' ')[0]}`}>
                {visitor.approval_status}
              </div>
            </div>

            <div className="bg-dark-800 border border-golden-600/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-golden-400" />
                <span className="text-sm font-medium text-golden-300">Duration</span>
              </div>
              <div className="text-lg font-semibold text-golden-100">
                {visitor.expected_duration}h expected
              </div>
            </div>
          </div>

          {/* Visitor Information */}
          <div className="bg-dark-800 border border-golden-600/30 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-golden-400 mb-4 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Visitor Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-golden-300">Full Name</label>
                <div className="text-golden-100 font-medium mt-1">{visitor.visitor_name}</div>
              </div>

              <div>
                <label className="text-sm font-medium text-golden-300">Phone Number</label>
                <div className="text-golden-100 font-medium mt-1">{visitor.visitor_phone}</div>
              </div>

              <div>
                <label className="text-sm font-medium text-golden-300">ID Type</label>
                <div className="text-golden-100 font-medium mt-1 capitalize">
                  {visitor.visitor_id_type.replace('_', ' ')}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-golden-300">ID Number</label>
                <div className="text-golden-100 font-medium mt-1">{visitor.visitor_id_number}</div>
              </div>

              {visitor.vehicle_number && (
                <div>
                  <label className="text-sm font-medium text-golden-300">Vehicle Number</label>
                  <div className="text-golden-100 font-medium mt-1 flex items-center gap-2">
                    <Car className="h-4 w-4" />
                    {visitor.vehicle_number}
                  </div>
                </div>
              )}

              {visitor.emergency_contact && (
                <div>
                  <label className="text-sm font-medium text-golden-300">Emergency Contact</label>
                  <div className="text-golden-100 font-medium mt-1">{visitor.emergency_contact}</div>
                </div>
              )}
            </div>
          </div>

          {/* Visit Details */}
          <div className="bg-dark-800 border border-golden-600/30 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-golden-400 mb-4 flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Visit Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-golden-300">Purpose</label>
                <div className="text-golden-100 font-medium mt-1 capitalize">
                  {visitor.purpose.replace('_', ' ')}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-golden-300">Host Tenant</label>
                <div className="text-golden-100 font-medium mt-1">
                  {visitor.host_tenant_name} (Room {visitor.host_room_number})
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-golden-300">Check-in Time</label>
                <div className="text-golden-100 font-medium mt-1">
                  {formatDate(visitor.check_in_time)} at {formatTime(visitor.check_in_time)}
                </div>
              </div>

              {visitor.check_out_time && (
                <div>
                  <label className="text-sm font-medium text-golden-300">Check-out Time</label>
                  <div className="text-golden-100 font-medium mt-1">
                    {formatDate(visitor.check_out_time)} at {formatTime(visitor.check_out_time)}
                  </div>
                </div>
              )}

              {visitor.purpose_description && (
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-golden-300">Purpose Description</label>
                  <div className="text-golden-100 mt-1 p-3 bg-dark-700 rounded border border-golden-600/20">
                    {visitor.purpose_description}
                  </div>
                </div>
              )}

              {visitor.notes && (
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-golden-300">Additional Notes</label>
                  <div className="text-golden-100 mt-1 p-3 bg-dark-700 rounded border border-golden-600/20">
                    {visitor.notes}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Approval Information */}
          {visitor.approved_by && (
            <div className="bg-dark-800 border border-golden-600/30 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-golden-400 mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Approval Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-golden-300">Approved By</label>
                  <div className="text-golden-100 font-medium mt-1">{visitor.approved_by}</div>
                </div>

                <div>
                  <label className="text-sm font-medium text-golden-300">Created By</label>
                  <div className="text-golden-100 font-medium mt-1">{visitor.created_by}</div>
                </div>
              </div>
            </div>
          )}

          {/* Visit Duration Analysis */}
          {visitor.check_in_time && (
            <div className="bg-dark-800 border border-golden-600/30 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-golden-400 mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Visit Timeline
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-dark-700 rounded border border-golden-600/20">
                  <div className="flex items-center gap-2">
                    <LogIn className="h-4 w-4 text-green-400" />
                    <span className="text-golden-300">Checked In</span>
                  </div>
                  <span className="text-golden-100 font-medium">
                    {formatDate(visitor.check_in_time)} at {formatTime(visitor.check_in_time)}
                  </span>
                </div>

                {visitor.check_out_time ? (
                  <div className="flex items-center justify-between p-3 bg-dark-700 rounded border border-golden-600/20">
                    <div className="flex items-center gap-2">
                      <LogOut className="h-4 w-4 text-blue-400" />
                      <span className="text-golden-300">Checked Out</span>
                    </div>
                    <span className="text-golden-100 font-medium">
                      {formatDate(visitor.check_out_time)} at {formatTime(visitor.check_out_time)}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-orange-500/10 border border-orange-500/30 rounded">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-orange-400" />
                      <span className="text-orange-300">Expected Checkout</span>
                    </div>
                    <span className="text-orange-100 font-medium">
                      {new Date(new Date(visitor.check_in_time).getTime() + Number(visitor.expected_duration) * 60 * 60 * 1000).toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-golden-600/20">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gradient-to-r from-golden-500 to-golden-600 text-dark-900 rounded-lg hover:from-golden-600 hover:to-golden-700 transition-all duration-200 font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Visitors; 