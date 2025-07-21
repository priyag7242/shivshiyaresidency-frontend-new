import { useState, useEffect } from 'react';
import { Search, Plus, AlertCircle, CheckCircle, Clock, Wrench, Trash2, Eye } from 'lucide-react';
import axios from 'axios';

// Utility functions for styling
const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'text-green-400 bg-green-400/10 border-green-400/30';
    case 'in_progress':
      return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
    case 'pending':
      return 'text-orange-400 bg-orange-400/10 border-orange-400/30';
    case 'cancelled':
      return 'text-red-400 bg-red-400/10 border-red-400/30';
    default:
      return 'text-golden-400 bg-golden-400/10 border-golden-400/30';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'urgent':
      return 'text-red-500 bg-red-500/10 border-red-500/30';
    case 'high':
      return 'text-orange-500 bg-orange-500/10 border-orange-500/30';
    case 'medium':
      return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
    case 'low':
      return 'text-green-500 bg-green-500/10 border-green-500/30';
    default:
      return 'text-golden-400 bg-golden-400/10 border-golden-400/30';
  }
};

interface MaintenanceRequest {
  id: string;
  tenant_id: string;
  tenant_name: string;
  room_number: string;
  request_type: 'electrical' | 'plumbing' | 'ac_repair' | 'furniture' | 'cleaning' | 'appliance' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  requested_date: string;
  assigned_to?: string;
  scheduled_date?: string;
  completed_date?: string;
  estimated_cost?: number;
  actual_cost?: number;
  notes?: string;
  images?: string[];
  created_by: string;
  updated_date: string;
}

interface MaintenanceStats {
  total_requests: number;
  pending_requests: number;
  in_progress_requests: number;
  completed_requests: number;
  cancelled_requests: number;
  this_month_requests: number;
  high_priority_pending: number;
  urgent_priority_pending: number;
  average_completion_time: string;
  total_cost_this_month: number;
  request_type_breakdown: { [key: string]: number };
  priority_breakdown: { [key: string]: number };
}

const Maintenance = () => {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [stats, setStats] = useState<MaintenanceStats>({
    total_requests: 0,
    pending_requests: 0,
    in_progress_requests: 0,
    completed_requests: 0,
    cancelled_requests: 0,
    this_month_requests: 0,
    high_priority_pending: 0,
    urgent_priority_pending: 0,
    average_completion_time: '0 days',
    total_cost_this_month: 0,
    request_type_breakdown: {},
    priority_breakdown: {}
  });

  useEffect(() => {
    fetchRequests();
    fetchStats();
  }, [statusFilter, priorityFilter, typeFilter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (priorityFilter) params.append('priority', priorityFilter);
      if (typeFilter) params.append('request_type', typeFilter);
      
      const response = await axios.get(`/api/maintenance?${params}`);
      setRequests(response.data.requests || []);
    } catch (error) {
      console.error('Error fetching maintenance requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/maintenance/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const updateRequestStatus = async (requestId: string, status: string, data: any = {}) => {
    try {
      await axios.put(`/api/maintenance/${requestId}/status`, { status, ...data });
      fetchRequests();
      fetchStats();
    } catch (error: any) {
      console.error('Error updating request status:', error);
      alert(error.response?.data?.error || 'Failed to update request status');
    }
  };

  const deleteRequest = async (requestId: string) => {
    if (!confirm('Are you sure you want to delete this maintenance request?')) return;
    
    try {
      await axios.delete(`/api/maintenance/${requestId}`);
      fetchRequests();
      fetchStats();
    } catch (error: any) {
      console.error('Error deleting request:', error);
      alert(error.response?.data?.error || 'Failed to delete request');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };



  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'in_progress':
        return <Clock className="h-4 w-4" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4" />;
      case 'cancelled':
        return <Wrench className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const filteredRequests = requests.filter(request =>
    request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.tenant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.room_number.includes(searchTerm) ||
    request.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-golden-400 mb-2">Maintenance Management</h1>
            <p className="text-golden-300">Track and manage maintenance requests</p>
          </div>
          <div className="mt-4 lg:mt-0">
            <button
              onClick={() => setShowRequestModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-golden-500 to-golden-600 text-dark-900 rounded-lg hover:from-golden-600 hover:to-golden-700 transition-all duration-200 font-medium"
            >
              <Plus className="h-5 w-5" />
              New Request
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-dark-900 border border-golden-600/20 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-golden-300 text-sm font-medium">Total Requests</p>
              <p className="text-2xl font-bold text-golden-100">{stats.total_requests}</p>
              <p className="text-blue-400 text-sm">+{stats.this_month_requests} this month</p>
            </div>
            <Wrench className="h-8 w-8 text-golden-400" />
          </div>
        </div>

        <div className="bg-dark-900 border border-golden-600/20 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-golden-300 text-sm font-medium">Pending</p>
              <p className="text-2xl font-bold text-orange-400">{stats.pending_requests}</p>
              <p className="text-red-400 text-sm">{stats.urgent_priority_pending} urgent</p>
            </div>
            <AlertCircle className="h-8 w-8 text-orange-400" />
          </div>
        </div>

        <div className="bg-dark-900 border border-golden-600/20 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-golden-300 text-sm font-medium">In Progress</p>
              <p className="text-2xl font-bold text-blue-400">{stats.in_progress_requests}</p>
              <p className="text-golden-300 text-sm">Active work</p>
            </div>
            <Clock className="h-8 w-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-dark-900 border border-golden-600/20 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-golden-300 text-sm font-medium">Completed</p>
              <p className="text-2xl font-bold text-green-400">{stats.completed_requests}</p>
              <p className="text-golden-300 text-sm">Avg: {stats.average_completion_time}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
        </div>
      </div>

      {/* Request Type Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-dark-900 border border-golden-600/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-golden-400 mb-4 flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Request Types
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.request_type_breakdown).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-golden-300 capitalize">{type.replace('_', ' ')}</span>
                <span className="text-golden-100 font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-dark-900 border border-golden-600/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-golden-400 mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Priority Breakdown
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.priority_breakdown).map(([priority, count]) => (
              <div key={priority} className="flex items-center justify-between">
                <span className={`capitalize px-2 py-1 rounded text-xs ${getPriorityColor(priority)}`}>
                  {priority}
                </span>
                <span className="text-golden-100 font-medium">{count}</span>
              </div>
            ))}
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
              placeholder="Search requests, tenants, or rooms..."
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
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
            >
              <option value="">All Priority</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
            >
              <option value="">All Types</option>
              <option value="electrical">Electrical</option>
              <option value="plumbing">Plumbing</option>
              <option value="ac_repair">AC Repair</option>
              <option value="furniture">Furniture</option>
              <option value="cleaning">Cleaning</option>
              <option value="appliance">Appliance</option>
              <option value="general">General</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-dark-900 border border-golden-600/20 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-800 border-b border-golden-600/20">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-golden-400">Request Details</th>
                <th className="text-left py-3 px-4 font-medium text-golden-400">Tenant & Room</th>
                <th className="text-left py-3 px-4 font-medium text-golden-400">Priority</th>
                <th className="text-left py-3 px-4 font-medium text-golden-400">Status</th>
                <th className="text-left py-3 px-4 font-medium text-golden-400">Assigned To</th>
                <th className="text-left py-3 px-4 font-medium text-golden-400">Date</th>
                <th className="text-left py-3 px-4 font-medium text-golden-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-golden-600/10">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-golden-400">Loading requests...</td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-golden-400/60">No maintenance requests found</td>
                </tr>
              ) : (
                filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-dark-800/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-medium text-golden-100">{request.title}</div>
                      <div className="text-golden-300 text-sm capitalize">{request.request_type.replace('_', ' ')}</div>
                      <div className="text-golden-400 text-xs">{request.description.slice(0, 50)}...</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-golden-100">{request.tenant_name}</div>
                      <div className="text-golden-300 text-sm">Room {request.room_number}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${getPriorityColor(request.priority)}`}>
                        {request.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                        {request.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-golden-100">{request.assigned_to || 'Unassigned'}</div>
                      {request.scheduled_date && (
                        <div className="text-golden-400 text-xs">
                          Scheduled: {new Date(request.scheduled_date).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-golden-100">{new Date(request.requested_date).toLocaleDateString()}</div>
                      {request.completed_date && (
                        <div className="text-green-400 text-xs">
                          Completed: {new Date(request.completed_date).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowDetailModal(true);
                          }}
                          className="p-1 text-golden-400 hover:text-golden-100 transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        
                        {request.status === 'pending' && (
                          <button
                            onClick={() => updateRequestStatus(request.id, 'in_progress', { assigned_to: 'Maintenance Team' })}
                            className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                            title="Start Work"
                          >
                            <Clock className="h-4 w-4" />
                          </button>
                        )}
                        
                        {request.status === 'in_progress' && (
                          <button
                            onClick={() => updateRequestStatus(request.id, 'completed')}
                            className="p-1 text-green-400 hover:text-green-300 transition-colors"
                            title="Mark Complete"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => deleteRequest(request.id)}
                          className="p-1 text-red-400 hover:text-red-300 transition-colors"
                          title="Delete"
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

      {/* Request Form Modal */}
      {showRequestModal && (
        <MaintenanceRequestModal
          isOpen={showRequestModal}
          onClose={() => setShowRequestModal(false)}
          onSubmit={() => {
            fetchRequests();
            fetchStats();
            setShowRequestModal(false);
          }}
        />
      )}

      {/* Request Detail Modal */}
      {showDetailModal && selectedRequest && (
        <MaintenanceDetailModal
          isOpen={showDetailModal}
          request={selectedRequest}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedRequest(null);
          }}
          onUpdate={() => {
            fetchRequests();
            fetchStats();
          }}
        />
      )}
    </div>
  );
};

// Maintenance Request Form Modal Component
interface MaintenanceRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

const MaintenanceRequestModal = ({ isOpen, onClose, onSubmit }: MaintenanceRequestModalProps) => {
  const [formData, setFormData] = useState({
    tenant_name: '',
    room_number: '',
    request_type: 'general',
    priority: 'medium',
    title: '',
    description: '',
    estimated_cost: 0
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/maintenance', formData);
      onSubmit();
    } catch (error: any) {
      console.error('Error creating request:', error);
      alert(error.response?.data?.error || 'Failed to create request');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-dark-900 border border-golden-600/20 rounded-xl w-full max-w-2xl">
        <div className="flex items-center justify-between p-6 border-b border-golden-600/20">
          <h2 className="text-xl font-semibold text-golden-400">New Maintenance Request</h2>
          <button onClick={onClose} className="text-golden-300 hover:text-golden-100">×</button>
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
              <label className="block text-sm font-medium text-golden-300 mb-2">Request Type</label>
              <select
                required
                value={formData.request_type}
                onChange={(e) => setFormData({ ...formData, request_type: e.target.value })}
                className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
              >
                <option value="electrical">Electrical</option>
                <option value="plumbing">Plumbing</option>
                <option value="ac_repair">AC Repair</option>
                <option value="furniture">Furniture</option>
                <option value="cleaning">Cleaning</option>
                <option value="appliance">Appliance</option>
                <option value="general">General</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-golden-300 mb-2">Priority</label>
              <select
                required
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-golden-300 mb-2">Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
              placeholder="Brief description of the issue"
            />
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-golden-300 mb-2">Description</label>
            <textarea
              rows={4}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
              placeholder="Detailed description of the maintenance issue"
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
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Maintenance Detail Modal Component
interface MaintenanceDetailModalProps {
  isOpen: boolean;
  request: MaintenanceRequest;
  onClose: () => void;
  onUpdate: () => void;
}

const MaintenanceDetailModal = ({ isOpen, request, onClose, onUpdate }: MaintenanceDetailModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-dark-900 border border-golden-600/20 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-golden-600/20">
          <h2 className="text-xl font-semibold text-golden-400">Maintenance Request Details</h2>
          <button onClick={onClose} className="text-golden-300 hover:text-golden-100">×</button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-golden-400 mb-4">Request Information</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-golden-300 text-sm">Title:</span>
                  <div className="text-golden-100">{request.title}</div>
                </div>
                <div>
                  <span className="text-golden-300 text-sm">Type:</span>
                  <div className="text-golden-100 capitalize">{request.request_type.replace('_', ' ')}</div>
                </div>
                <div>
                  <span className="text-golden-300 text-sm">Priority:</span>
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${getPriorityColor(request.priority)}`}>
                    {request.priority}
                  </span>
                </div>
                <div>
                  <span className="text-golden-300 text-sm">Status:</span>
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${getStatusColor(request.status)}`}>
                    {request.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-golden-400 mb-4">Tenant & Location</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-golden-300 text-sm">Tenant:</span>
                  <div className="text-golden-100">{request.tenant_name}</div>
                </div>
                <div>
                  <span className="text-golden-300 text-sm">Room:</span>
                  <div className="text-golden-100">{request.room_number}</div>
                </div>
                <div>
                  <span className="text-golden-300 text-sm">Requested Date:</span>
                  <div className="text-golden-100">{new Date(request.requested_date).toLocaleDateString()}</div>
                </div>
                {request.assigned_to && (
                  <div>
                    <span className="text-golden-300 text-sm">Assigned To:</span>
                    <div className="text-golden-100">{request.assigned_to}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-medium text-golden-400 mb-4">Description</h3>
            <div className="bg-dark-800 border border-golden-600/30 rounded-lg p-4">
              <p className="text-golden-100">{request.description}</p>
            </div>
          </div>

          {request.notes && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-golden-400 mb-4">Notes</h3>
              <div className="bg-dark-800 border border-golden-600/30 rounded-lg p-4">
                <p className="text-golden-100">{request.notes}</p>
              </div>
            </div>
          )}

          {(request.estimated_cost || request.actual_cost) && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-golden-400 mb-4">Cost Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {request.estimated_cost && (
                  <div>
                    <span className="text-golden-300 text-sm">Estimated Cost:</span>
                    <div className="text-golden-100">₹{request.estimated_cost}</div>
                  </div>
                )}
                {request.actual_cost && (
                  <div>
                    <span className="text-golden-300 text-sm">Actual Cost:</span>
                    <div className="text-golden-100">₹{request.actual_cost}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-golden-600/20">
          <button
            onClick={onClose}
            className="px-6 py-2 text-golden-300 border border-golden-600/30 rounded-lg hover:bg-golden-600/10 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Maintenance; 