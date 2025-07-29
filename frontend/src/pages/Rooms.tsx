import React, { useState, useEffect } from 'react';
import { 
  Building, 
  Users, 
  IndianRupee, 
  Plus, 
  MoreVertical, 
  X,
  Search,
  Filter,
  Home,
  AlertTriangle,
  Clock,
  CheckCircle,
  Activity,
  TrendingUp,
  BarChart3,
  Settings,
  Bell,
  User,
  ChevronDown,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Wifi,
  Zap,
  Shield,
  Star
} from 'lucide-react';
import { getRoomStats } from '../data/tenantData';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

interface Room {
  roomNumber: string;
  roomType: string;
  tenants: any[];
  totalRent: number;
  totalRentPaid: number;
  totalRentUnpaid: number;
  totalSecurityPaid: number;
  totalSecurityUnpaid: number;
  occupiedBeds: number;
  totalBeds: number;
  hasNotice: boolean;
  hasUnpaidRent: boolean;
  hasUnpaidElectricity: boolean;
  lastReading: number;
  currentReading: number;
}

interface RoomStats {
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
  totalRevenue: number;
  totalCapacity: number;
  currentOccupancy: number;
  occupancyRate: number;
  typeStats: {
    single: number;
    double: number;
    triple: number;
  };
  maintenanceStats: {
    none: number;
    scheduled: number;
    in_progress: number;
    completed: number;
  };
}

const Rooms = () => {
  const [rooms, setRooms] = useState<any[]>([]);
  const [stats, setStats] = useState<RoomStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const USE_SUPABASE = false;

  useEffect(() => {
    fetchRooms();
    fetchStats();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      if (USE_SUPABASE) {
        // Supabase logic here
      } else {
        const roomStats = getRoomStats();
        setRooms(roomStats);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      if (USE_SUPABASE) {
        // Supabase logic here
      } else {
        const roomStats = getRoomStats();
        const totalRooms = roomStats.length;
        const occupiedRooms = roomStats.filter(room => room.occupiedBeds > 0).length;
        const availableRooms = totalRooms - occupiedRooms;
        const totalRevenue = roomStats.reduce((sum, room) => sum + room.totalRent, 0);
        const totalCapacity = roomStats.reduce((sum, room) => sum + room.totalBeds, 0);
        const currentOccupancy = roomStats.reduce((sum, room) => sum + room.occupiedBeds, 0);
        const occupancyRate = totalCapacity > 0 ? Math.round((currentOccupancy / totalCapacity) * 100) : 0;

        const typeStats = {
          single: roomStats.filter(room => room.roomType === 'Single').length,
          double: roomStats.filter(room => room.roomType === 'Double').length,
          triple: roomStats.filter(room => room.roomType === 'Triple').length
        };
        
        const stats: RoomStats = {
          totalRooms,
          occupiedRooms,
          availableRooms,
          totalRevenue,
          totalCapacity,
          currentOccupancy,
          occupancyRate,
          typeStats,
          maintenanceStats: { none: totalRooms, scheduled: 0, in_progress: 0, completed: 0 }
        };
        
        // Debug logging
        console.log('Room Statistics:', {
          totalRooms,
          occupiedRooms,
          availableRooms,
          totalCapacity,
          currentOccupancy,
          totalRevenue,
          typeStats
        });
        
        setStats(stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'occupied':
        return <Users className="h-4 w-4 text-green-500" />;
      case 'vacant':
        return <Home className="h-4 w-4 text-yellow-500" />;
      case 'maintenance':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Building className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoomTypeIcon = (type: string) => {
    switch (type) {
      case 'Single':
        return <User className="h-4 w-4" />;
      case 'Double':
        return <Users className="h-4 w-4" />;
      case 'Triple':
        return <Users className="h-4 w-4" />;
      default:
        return <Building className="h-4 w-4" />;
    }
  };

  const getRoomTypeColor = (type: string) => {
    switch (type) {
      case 'Single':
        return 'bg-blue-100 text-blue-800';
      case 'Double':
        return 'bg-green-100 text-green-800';
      case 'Triple':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTenantsUnderNotice = (room: any) => {
    return room.tenants.filter((t: any) => t.noticeGiven).length;
  };

  const getTenantsWithRentDue = (room: any) => {
    return room.tenants.filter((t: any) => t.rentUnpaid > 0).length;
  };

  const getActiveTickets = (room: any) => {
    return room.tenants.filter((t: any) => !t.electricityPaid).length;
  };

  const getBedIcons = (count: number) => {
    return Array.from({ length: count }, (_, i) => (
      <div key={i} className="w-3 h-3 bg-gray-300 rounded-sm"></div>
    ));
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.roomType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || room.roomType.toLowerCase() === filterType;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'occupied' && room.occupiedBeds > 0) ||
                         (filterStatus === 'vacant' && room.occupiedBeds === 0);
    
    return matchesSearch && matchesType && matchesStatus;
  });

  if (loading) {
  return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading rooms...</p>
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
            {/* Room Overview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-fadeIn">
              <div className="flex items-center justify-between mb-6">
          <div>
                  <h2 className="text-2xl font-bold text-gray-900">Room Overview</h2>
                  <p className="text-gray-600 mt-1">Complete overview of all rooms and their status</p>
          </div>
            <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 hover:scale-105"
                >
                  <Plus className="h-4 w-4" />
                  Add Room
            </button>
      </div>

              {/* Overview Stats */}
              {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
                        <p className="text-blue-100 text-sm">Total Rooms</p>
                        <p className="text-2xl font-bold">{stats.totalRooms}</p>
            </div>
                      <Building className="h-8 w-8 text-blue-200" />
            </div>
          </div>
                  <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
                        <p className="text-green-100 text-sm">Occupied</p>
                        <p className="text-2xl font-bold">{stats.occupiedRooms}</p>
            </div>
                      <Users className="h-8 w-8 text-green-200" />
            </div>
          </div>
                  <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
                        <p className="text-yellow-100 text-sm">Available</p>
                        <p className="text-2xl font-bold">{stats.availableRooms}</p>
            </div>
                      <Home className="h-8 w-8 text-yellow-200" />
            </div>
          </div>
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
                        <p className="text-purple-100 text-sm">Revenue</p>
                        <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
            </div>
                      <IndianRupee className="h-8 w-8 text-purple-200" />
            </div>
          </div>
        </div>
              )}

              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search rooms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
          </div>
            <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
              <option value="single">Single</option>
              <option value="double">Double</option>
              <option value="triple">Triple</option>
            </select>
            <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
              <option value="occupied">Occupied</option>
                  <option value="vacant">Vacant</option>
            </select>
          </div>
        </div>

            {/* Room List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-slideUp">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Room List</h3>
                <p className="text-gray-600">{filteredRooms.length} rooms found</p>
      </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRooms.map((room, index) => (
                  <div 
                    key={room.roomNumber} 
                    className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 animate-bounceIn"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                          <Building className="h-5 w-5 text-yellow-600" />
                              </div>
                              <div>
                          <h4 className="font-bold text-gray-900">Room {room.roomNumber}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoomTypeColor(room.roomType)}`}>
                            {room.roomType}
                          </span>
                              </div>
                            </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          room.occupiedBeds === 0
                            ? 'bg-yellow-100 text-yellow-800'
                            : room.occupiedBeds === room.totalBeds
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {room.occupiedBeds === 0 ? 'Vacant' : room.occupiedBeds === room.totalBeds ? 'Full' : 'Partial'}
                        </span>
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Room Details */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-4 h-4 bg-gray-200 rounded flex items-center justify-center">
                          <span className="text-xs font-medium">🛏️</span>
                                </div>
                        <span>Bed: {room.totalBeds}</span>
                        <div className="flex gap-1 ml-auto">
                          {getBedIcons(room.totalBeds)}
                                    </div>
                                </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-4 h-4 bg-gray-200 rounded flex items-center justify-center">
                          <span className="text-xs font-medium">🔔</span>
                              </div>
                        <span>Under Notice: <span className="text-orange-600 font-medium">{getTenantsUnderNotice(room)}</span></span>
                                </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-4 h-4 bg-gray-200 rounded flex items-center justify-center">
                          <span className="text-xs font-medium">💰</span>
                              </div>
                        <span>Rent Due: <span className="text-orange-600 font-medium">{getTenantsWithRentDue(room)}</span></span>
                                </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-4 h-4 bg-gray-200 rounded flex items-center justify-center">
                          <span className="text-xs font-medium">🎫</span>
                                  </div>
                        <span>Active Ticket: <span className="text-orange-600 font-medium">{getActiveTickets(room)}</span></span>
                              </div>
                    </div>

                    {/* Financial Info */}
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Monthly Rent:</span>
                        <span className="font-semibold text-gray-900">{formatCurrency(room.totalRent)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-1">
                        <span className="text-gray-600">Occupancy:</span>
                        <span className="font-semibold text-gray-900">{room.occupiedBeds}/{room.totalBeds}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                                    <button
                                      onClick={() => {
                                        setSelectedRoom(room);
                          setShowDetailsModal(true);
                                      }}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                                    >
                        View Details
                                    </button>
                      <button className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                        ADD TENANT
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
                  Add New Room
                </button>
                <button className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg flex items-center gap-3 transition-all duration-300 hover:scale-105">
                                      <Users className="h-4 w-4" />
                  Allocate Tenant
                                    </button>
                <button className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg flex items-center gap-3 transition-all duration-300 hover:scale-105">
                  <BarChart3 className="h-4 w-4" />
                  Generate Report
                                    </button>
                <button className="w-full bg-purple-500 hover:bg-purple-600 text-white px-4 py-3 rounded-lg flex items-center gap-3 transition-all duration-300 hover:scale-105">
                  <Bell className="h-4 w-4" />
                  Send Notifications
                                    </button>
                                  </div>
                              </div>

            {/* Room Statistics */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-yellow-600" />
                Room Statistics
              </h3>
              {stats && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Capacity</span>
                    <span className="font-semibold">{stats.totalCapacity}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Current Occupancy</span>
                    <span className="font-semibold">{stats.currentOccupancy}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Occupancy Rate</span>
                    <span className="font-semibold text-green-600">{stats.occupancyRate}%</span>
                  </div>
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Room Types</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Single</span>
                        <span className="font-semibold">{stats.typeStats.single}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Double</span>
                        <span className="font-semibold">{stats.typeStats.double}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Triple</span>
                        <span className="font-semibold">{stats.typeStats.triple}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Maintenance Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Settings className="h-5 w-5 text-yellow-600" />
                Maintenance Status
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600">No Issues</span>
                  </div>
                  <span className="font-semibold">{stats?.maintenanceStats.none || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-gray-600">Scheduled</span>
                  </div>
                  <span className="font-semibold">{stats?.maintenanceStats.scheduled || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span className="text-gray-600">In Progress</span>
                  </div>
                  <span className="font-semibold">{stats?.maintenanceStats.in_progress || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-600">Completed</span>
                  </div>
                  <span className="font-semibold">{stats?.maintenanceStats.completed || 0}</span>
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
                    <p className="text-sm font-medium text-gray-900">New tenant added</p>
                    <p className="text-xs text-gray-500">Room 101 - 2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Payment received</p>
                    <p className="text-xs text-gray-500">Room 205 - 4 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Maintenance request</p>
                    <p className="text-xs text-gray-500">Room 312 - 6 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Notice given</p>
                    <p className="text-xs text-gray-500">Room 118 - 1 day ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showDetailsModal && selectedRoom && (
        <RoomDetailsModal
          isOpen={showDetailsModal}
          room={selectedRoom}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedRoom(null);
          }}
        />
      )}
    </div>
  );
};

// Room Details Modal Component
interface RoomDetailsModalProps {
  isOpen: boolean;
  room: any;
  onClose: () => void;
}

const RoomDetailsModal = ({ isOpen, room, onClose }: RoomDetailsModalProps) => {
  if (!isOpen || !room) return null;

  const totalMonthlyRent = room.totalRent || 0;
  const totalSecurityDeposit = room.totalSecurityPaid || 0;
  const occupancyRate = room.totalBeds > 0 ? Math.round((room.occupiedBeds / room.totalBeds) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gray-900 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
          <div>
              <h2 className="text-2xl font-bold">Room Details</h2>
              <p className="text-gray-300 mt-1">Complete information about Room {room.roomNumber}</p>
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
                <div className="text-2xl font-bold text-blue-600">{room.occupiedBeds}/{room.totalBeds}</div>
                <div className="text-gray-600">Occupancy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{formatCurrency(totalMonthlyRent)}</div>
                <div className="text-gray-600">Total Monthly Rent</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{occupancyRate}%</div>
                <div className="text-gray-600">Occupancy Rate</div>
            </div>
            </div>
          </div>

          {/* Room Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Building className="h-5 w-5" />
              Room Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-600">Room Number</label>
                <div className="text-gray-900 font-medium mt-1">{room.roomNumber}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Room Type</label>
                <div className="text-gray-900 font-medium mt-1 capitalize">{room.roomType}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Capacity</label>
                <div className="text-gray-900 font-medium mt-1">{room.totalBeds} person(s)</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Total Security Deposit</label>
                <div className="text-gray-900 font-medium mt-1">{formatCurrency(totalSecurityDeposit)}</div>
                <div className="text-xs text-gray-500 mt-1">Auto-calculated from tenants</div>
              </div>
              </div>
          </div>

          {/* Current Tenants */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Current Tenants
            </h3>
            {room.tenants && room.tenants.length > 0 ? (
              <div className="space-y-3">
                {room.tenants.map((tenant: any, index: number) => (
                  <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <div className="text-gray-900 font-medium text-lg">{tenant.name}</div>
                      </div>
                      <div className="text-gray-500 text-sm">Tenant #{index + 1} in Room</div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">Phone:</span>
                        <span className="text-gray-900 ml-2">{tenant.phoneNo || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Joining Date:</span>
                        <span className="text-gray-900 ml-2">{tenant.joiningDate || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Monthly Rent:</span>
                        <span className="text-gray-900 ml-2 font-medium">
                          {formatCurrency(tenant.rent)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Security Deposit:</span>
                        <span className="text-gray-900 ml-2 font-medium">
                          {formatCurrency(tenant.securityPaid)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Rent Status:</span>
                        <span className={`ml-2 font-medium ${tenant.rentUnpaid > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {tenant.rentUnpaid > 0 ? 'Unpaid' : 'Paid'}
                        </span>
                    </div>
                      <div>
                        <span className="text-gray-600">Electricity:</span>
                        <span className={`ml-2 font-medium ${tenant.electricityPaid ? 'text-green-600' : 'text-red-600'}`}>
                          {tenant.electricityPaid ? 'Paid' : 'Unpaid'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                    </div>
            ) : (
              <div className="text-gray-500 text-center py-8">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p>No tenants currently allocated to this room</p>
                      </div>
                    )}
                </div>
                
                {/* Financial Summary */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Room Financial Summary</h3>
            <p className="text-gray-600 text-sm mb-4">Automatically calculated from tenant data</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(totalMonthlyRent)}</div>
                <div className="text-gray-600">Total Monthly Rent</div>
                </div>
                <div>
                <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalSecurityDeposit)}</div>
                <div className="text-gray-600">Total Security Deposit</div>
                </div>
                  </div>
            
            <div className="mt-4 text-sm text-gray-500">
              Based on {room.tenants?.length || 0} active tenants
                  </div>
                </div>
                </div>
      </div>
    </div>
  );
};

export default Rooms; 