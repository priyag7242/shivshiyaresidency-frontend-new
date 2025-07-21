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
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-dark-900 border border-golden-600/20 rounded-xl w-full max-w-2xl">
        <div className="flex items-center justify-between p-6 border-b border-golden-600/20">
          <h2 className="text-xl font-semibold text-golden-400">Check-in Visitor</h2>
          <button onClick={onClose} className="text-golden-300 hover:text-golden-100">×</button>
        </div>
        <div className="p-6">
          <p className="text-golden-300">Visitor check-in form will be implemented here...</p>
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={onClose} className="px-4 py-2 border border-golden-600/30 text-golden-300 rounded-lg">
              Cancel
            </button>
            <button onClick={onSubmit} className="px-4 py-2 bg-golden-600 text-dark-900 rounded-lg">
              Check In
            </button>
          </div>
        </div>
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
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-dark-900 border border-golden-600/20 rounded-xl w-full max-w-2xl">
        <div className="flex items-center justify-between p-6 border-b border-golden-600/20">
          <h2 className="text-xl font-semibold text-golden-400">Visitor Details</h2>
          <button onClick={onClose} className="text-golden-300 hover:text-golden-100">×</button>
        </div>
        <div className="p-6">
          <p className="text-golden-300">Detailed view for {visitor.visitor_name} will be implemented here...</p>
          <button onClick={onClose} className="mt-6 px-4 py-2 bg-golden-600 text-dark-900 rounded-lg">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Visitors; 