import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, MoreVertical, Edit, Trash2, Building, Users, DoorOpen, IndianRupee, Layers, User, UserPlus, Wrench, CheckCircle, Circle, AlertTriangle, Calendar, Camera, Settings, Eye, X, ArrowUpRight, Bell, ChevronDown } from 'lucide-react';
import axios from 'axios';
import RoomForm from '../components/RoomForm';
import RoomAllocationModal from '../components/RoomAllocationModal';
import MaintenanceModal from '../components/MaintenanceModal';
import { roomsQueries } from '../lib/supabaseQueries';

const apiUrl = import.meta.env.VITE_API_URL || '';
const USE_SUPABASE = true;

interface Room {
  id: string;
  room_number: string;
  floor: 0 | 1 | 2 | 3 | 4 | 5;
  type: 'single' | 'double' | 'triple' | 'quad';
  capacity: number;
  current_occupancy: number;
  monthly_rent: number;
  security_deposit: number;
  amenities: string[];
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  description?: string;
  images?: { id: string; url: string; caption?: string }[];
  tenants: { id: string; name: string; allocated_date: string; monthly_rent: number; security_deposit: number }[];
  created_date: string;
  updated_date: string;
  maintenance_status?: 'none' | 'scheduled' | 'in_progress' | 'completed';
  maintenance_type?: string;
  maintenance_description?: string;
  maintenance_scheduled_date?: string;
  maintenance_completed_date?: string;
  maintenance_cost?: number;
  last_maintenance_date?: string;
}

interface RoomStats {
  total: number;
  occupied: number;
  available: number;
  maintenance: number;
  reserved: number;
  totalCapacity: number;
  currentOccupancy: number;
  totalRevenue: number;
  floorStats: {
    [key: number]: {
      total: number;
      occupied: number;
      available: number;
      maintenance: number;
    };
  };
  typeStats: {
    [key: string]: {
      total: number;
      occupied: number;
      available: number;
    };
  };
  maintenanceStats: {
    none: number;
    scheduled: number;
    in_progress: number;
    completed: number;
  };
}

// Helper functions (moved outside component for accessibility)
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(amount);
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'available':
      return 'text-green-400 bg-green-400/10 border-green-400/30';
    case 'occupied':
      return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
    case 'maintenance':
      return 'text-orange-400 bg-orange-400/10 border-orange-400/30';
    case 'reserved':
      return 'text-purple-400 bg-purple-400/10 border-purple-400/30';
    default:
      return 'text-golden-400 bg-golden-400/10 border-golden-400/30';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'available':
      return <CheckCircle className="h-4 w-4" />;
    case 'occupied':
      return <Users className="h-4 w-4" />;
    case 'maintenance':
      return <Wrench className="h-4 w-4" />;
    case 'reserved':
      return <Circle className="h-4 w-4" />;
    default:
      return <DoorOpen className="h-4 w-4" />;
  }
};

const getMaintenanceStatusColor = (status?: string) => {
  switch (status) {
    case 'scheduled':
      return 'text-blue-400';
    case 'in_progress':
      return 'text-orange-400';
    case 'completed':
      return 'text-green-400';
    default:
      return 'text-gray-400';
  }
};

const getRoomTypeIcon = (type: string) => {
  switch (type) {
    case 'single':
      return <User className="h-4 w-4" />;
    case 'double':
      return <Users className="h-4 w-4" />;
    case 'triple':
      return <UserPlus className="h-4 w-4" />;
    case 'quad':
      return <Users className="h-4 w-4" />;
    default:
      return <DoorOpen className="h-4 w-4" />;
  }
};

const getRoomTypeColor = (type: string) => {
  switch (type) {
    case 'single':
      return 'text-blue-400 bg-blue-400/10';
    case 'double':
      return 'text-green-400 bg-green-400/10';
    case 'triple':
      return 'text-orange-400 bg-orange-400/10';
    case 'quad':
      return 'text-purple-400 bg-purple-400/10';
    default:
      return 'text-golden-400 bg-golden-400/10';
  }
};

const Rooms = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [floorFilter, setFloorFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [maintenanceFilter, setMaintenanceFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAllocationModal, setShowAllocationModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [actionDropdown, setActionDropdown] = useState<string | null>(null);
  const [stats, setStats] = useState<RoomStats>({
    total: 0,
    occupied: 0,
    available: 0,
    maintenance: 0,
    reserved: 0,
    totalCapacity: 0,
    currentOccupancy: 0,
    totalRevenue: 0,
    floorStats: {},
    typeStats: {},
    maintenanceStats: { none: 0, scheduled: 0, in_progress: 0, completed: 0 }
  });

  useEffect(() => {
    fetchRooms();
    fetchStats();
  }, [searchTerm, floorFilter, typeFilter, statusFilter, maintenanceFilter]);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      
      if (USE_SUPABASE) {
        const data = await roomsQueries.getAll();
        let filteredRooms = data || [];
        
        // Apply filters
        if (searchTerm) {
          filteredRooms = filteredRooms.filter(room => 
            room.room_number.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        if (floorFilter) {
          filteredRooms = filteredRooms.filter(room => (room.floor || 0).toString() === floorFilter);
        }
        if (typeFilter) {
          filteredRooms = filteredRooms.filter(room => room.type === typeFilter);
        }
        if (statusFilter) {
          filteredRooms = filteredRooms.filter(room => room.status === statusFilter);
        }
        
        setRooms(filteredRooms);
      } else {
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (floorFilter) params.append('floor', floorFilter);
        if (typeFilter) params.append('type', typeFilter);
        if (statusFilter) params.append('status', statusFilter);
        if (maintenanceFilter) params.append('maintenance_status', maintenanceFilter);
        
        const response = await axios.get(`${apiUrl}/rooms?${params}`);
        setRooms(response.data.rooms || []);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      if (USE_SUPABASE) {
        // Calculate stats from rooms data
        const roomsData = await roomsQueries.getAll();
        const rooms = roomsData || [];
        
        const stats: RoomStats = {
          total: rooms.length,
          occupied: rooms.filter(r => r.status === 'occupied').length,
          available: rooms.filter(r => r.status === 'available').length,
          maintenance: rooms.filter(r => r.status === 'maintenance').length,
          reserved: rooms.filter(r => r.status === 'reserved').length,
          totalCapacity: rooms.reduce((sum, r) => sum + (r.capacity || 0), 0),
          currentOccupancy: rooms.reduce((sum, r) => sum + (r.current_occupancy || 0), 0),
          totalRevenue: rooms.reduce((sum, r) => sum + (r.monthly_rent || 0), 0), // This comes from roomsQueries.getAll() which only includes active tenants
          floorStats: {},
          typeStats: {},
          maintenanceStats: {
            none: rooms.filter(r => !r.maintenance_status || r.maintenance_status === 'none').length,
            scheduled: rooms.filter(r => r.maintenance_status === 'scheduled').length,
            in_progress: rooms.filter(r => r.maintenance_status === 'in_progress').length,
            completed: rooms.filter(r => r.maintenance_status === 'completed').length
          }
        };
        
        // Calculate floor stats
        rooms.forEach(room => {
          const floor = room.floor || 0;
          if (!stats.floorStats[floor]) {
            stats.floorStats[floor] = { total: 0, occupied: 0, available: 0, maintenance: 0 };
          }
          stats.floorStats[floor].total++;
          if (room.status === 'occupied') stats.floorStats[floor].occupied++;
          else if (room.status === 'available') stats.floorStats[floor].available++;
          else if (room.status === 'maintenance') stats.floorStats[floor].maintenance++;
        });
        
        // Calculate type stats
        rooms.forEach(room => {
          const type = room.type || 'single';
          if (!stats.typeStats[type]) {
            stats.typeStats[type] = { total: 0, occupied: 0, available: 0 };
          }
          stats.typeStats[type].total++;
          if (room.status === 'occupied') stats.typeStats[type].occupied++;
          else if (room.status === 'available') stats.typeStats[type].available++;
        });
        
        setStats(stats);
      } else {
        const response = await axios.get(`${apiUrl}/rooms/stats`);
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleRoomSubmit = async (roomData: Partial<Room>) => {
    try {
      if (USE_SUPABASE) {
        if (selectedRoom) {
          await roomsQueries.update(selectedRoom.id, roomData);
        } else {
          await roomsQueries.create(roomData);
        }
      } else {
        if (selectedRoom) {
          await axios.put(`${apiUrl}/rooms/${selectedRoom.id}`, roomData);
        } else {
          await axios.post(`${apiUrl}/rooms`, roomData);
        }
      }
      
      fetchRooms();
      fetchStats();
      setShowAddModal(false);
      setSelectedRoom(null);
    } catch (error: any) {
      console.error('Error saving room:', error);
      alert(error.response?.data?.error || 'Failed to save room');
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm('Are you sure you want to delete this room?')) return;
    
    try {
      if (USE_SUPABASE) {
        await roomsQueries.delete(roomId);
      } else {
        await axios.delete(`${apiUrl}/rooms/${roomId}`);
      }
      fetchRooms();
      fetchStats();
    } catch (error: any) {
      console.error('Error deleting room:', error);
      alert(error.response?.data?.error || 'Failed to delete room');
    }
  };


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Custom CSS for scrollbar hide */}
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* Mobile Header with Search */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search Room 101"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Room Type Carousel */}
        <div className="px-4 pb-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            <button 
              onClick={() => {
                setStatusFilter('');
                setTypeFilter('');
              }}
              className="flex flex-col items-center gap-1 px-4 py-2 bg-black text-white rounded-full text-sm font-medium whitespace-nowrap"
            >
              <span>All</span>
              <span className="text-xs">{stats.total}</span>
            </button>
            <button 
              onClick={() => {
                setStatusFilter('available');
                setTypeFilter('');
              }}
              className="flex flex-col items-center gap-1 px-4 py-2 bg-white text-black border border-gray-200 rounded-full text-sm font-medium whitespace-nowrap"
            >
              <span>Vacant beds</span>
              <span className="text-xs">{stats.available}</span>
            </button>
            <button 
              onClick={() => {
                setStatusFilter('');
                setTypeFilter('single');
              }}
              className="flex flex-col items-center gap-1 px-4 py-2 bg-white text-black border border-gray-200 rounded-full text-sm font-medium whitespace-nowrap"
            >
              <span>1 Bed</span>
              <span className="text-xs">{stats.typeStats.single?.total || 0}</span>
            </button>
            <button 
              onClick={() => {
                setStatusFilter('');
                setTypeFilter('double');
              }}
              className="flex flex-col items-center gap-1 px-4 py-2 bg-white text-black border border-gray-200 rounded-full text-sm font-medium whitespace-nowrap"
            >
              <span>2 Bed</span>
              <span className="text-xs">{stats.typeStats.double?.total || 0}</span>
            </button>
            <button 
              onClick={() => {
                setStatusFilter('');
                setTypeFilter('triple');
              }}
              className="flex flex-col items-center gap-1 px-4 py-2 bg-white text-black border border-gray-200 rounded-full text-sm font-medium whitespace-nowrap"
            >
              <span>3 Bed</span>
              <span className="text-xs">{stats.typeStats.triple?.total || 0}</span>
            </button>
            <button 
              onClick={() => {
                setStatusFilter('');
                setTypeFilter('quad');
              }}
              className="flex flex-col items-center gap-1 px-4 py-2 bg-white text-black border border-gray-200 rounded-full text-sm font-medium whitespace-nowrap"
            >
              <span>4 Bed</span>
              <span className="text-xs">{stats.typeStats.quad?.total || 0}</span>
            </button>
            <div className="flex items-center gap-1 px-2">
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Room List */}
      <div className="px-4 py-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading rooms...</p>
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-8">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No rooms found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {rooms.map((room) => (
              <div key={room.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-gray-600" />
                    <h3 className="font-semibold text-gray-900">Room {room.room_number}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      room.status === 'available' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {room.status === 'available' ? 'Available' : 'Full'}
                    </span>
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-4 h-4 bg-gray-200 rounded flex items-center justify-center">
                      <span className="text-xs font-medium">🛏️</span>
                    </div>
                    <span>Bed: {room.capacity}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-4 h-4 bg-gray-200 rounded flex items-center justify-center">
                      <span className="text-xs font-medium">🔔</span>
                    </div>
                    <span>Under Notice: {room.tenants.filter(t => t.name.includes('Notice')).length}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-4 h-4 bg-gray-200 rounded flex items-center justify-center">
                      <span className="text-xs font-medium">💰</span>
                    </div>
                    <span>Rent Due: {room.tenants.length > 0 ? room.tenants.length : 0}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-4 h-4 bg-gray-200 rounded flex items-center justify-center">
                      <span className="text-xs font-medium">🎫</span>
                    </div>
                    <span>Active Ticket: {room.maintenance_status === 'in_progress' ? 1 : 0}</span>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    setSelectedRoom(room);
                    setShowAllocationModal(true);
                  }}
                  className="w-full py-2 bg-gray-100 text-gray-800 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  ADD TENANT
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button 
        onClick={() => {
          setSelectedRoom(null);
          setShowAddModal(true);
        }}
        className="fixed bottom-20 right-4 w-14 h-14 bg-black text-white rounded-full shadow-lg hover:bg-gray-800 transition-colors flex items-center justify-center"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around items-center">
          <button className="flex flex-col items-center gap-1 py-2">
            <div className="w-5 h-5 bg-gray-400 rounded"></div>
            <span className="text-xs text-gray-600">Dashboard</span>
          </button>
          <button className="flex flex-col items-center gap-1 py-2">
            <div className="w-5 h-5 bg-yellow-500 rounded"></div>
            <span className="text-xs text-yellow-500 font-medium">Rooms</span>
            <div className="w-6 h-0.5 bg-yellow-500 rounded"></div>
          </button>
          <button className="flex flex-col items-center gap-1 py-2">
            <div className="w-5 h-5 bg-gray-400 rounded"></div>
            <span className="text-xs text-gray-600">Tenants</span>
          </button>
          <button className="flex flex-col items-center gap-1 py-2">
            <div className="w-5 h-5 bg-gray-400 rounded"></div>
            <span className="text-xs text-gray-600">Tickets</span>
          </button>
        </div>
      </div>

      {/* Add some bottom padding to account for fixed navigation */}
      <div className="h-20"></div>

      {/* Modals */}
      <RoomForm
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setSelectedRoom(null);
        }}
        onSubmit={handleRoomSubmit}
        room={selectedRoom}
      />

      <RoomAllocationModal
        isOpen={showAllocationModal}
        onClose={() => {
          setShowAllocationModal(false);
          setSelectedRoom(null);
        }}
        room={selectedRoom}
        onAllocationUpdate={() => {
          fetchRooms();
          fetchStats();
        }}
      />

      <MaintenanceModal
        isOpen={showMaintenanceModal}
        onClose={() => {
          setShowMaintenanceModal(false);
          setSelectedRoom(null);
        }}
        room={selectedRoom}
        onMaintenanceUpdate={() => {
          fetchRooms();
          fetchStats();
        }}
      />

      {/* Room Details Modal */}
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
  room: Room;
  onClose: () => void;
}

const RoomDetailsModal = ({ isOpen, room, onClose }: RoomDetailsModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-dark-900 border border-golden-600/20 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-golden-600/20">
          <div>
            <h2 className="text-xl font-semibold text-golden-400">Room Details</h2>
            <p className="text-golden-300 text-sm">Complete information about Room {room.room_number}</p>
          </div>
          <button
            onClick={onClose}
            className="text-golden-300 hover:text-golden-100 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Room Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-dark-800 border border-golden-600/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                {getStatusIcon(room.status)}
                <span className="text-sm font-medium text-golden-300">Status</span>
              </div>
              <div className={`text-lg font-semibold capitalize ${getStatusColor(room.status).split(' ')[0]}`}>
                {room.status}
              </div>
            </div>

            <div className="bg-dark-800 border border-golden-600/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-golden-400" />
                <span className="text-sm font-medium text-golden-300">Occupancy</span>
              </div>
              <div className="text-lg font-semibold text-golden-100">
                {room.current_occupancy}/{room.capacity}
              </div>
            </div>

            <div className="bg-dark-800 border border-golden-600/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <IndianRupee className="h-4 w-4 text-golden-400" />
                <span className="text-sm font-medium text-golden-300">Total Monthly Rent</span>
              </div>
              <div className="text-lg font-semibold text-golden-100">
                {formatCurrency(room.monthly_rent)}
              </div>
              <div className="text-xs text-golden-400 mt-1">
                Auto-calculated from tenants
              </div>
            </div>
          </div>

          {/* Room Information */}
          <div className="bg-dark-800 border border-golden-600/30 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-golden-400 mb-4 flex items-center gap-2">
              <Building className="h-5 w-5" />
              Room Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-golden-300">Room Number</label>
                <div className="text-golden-100 font-medium mt-1">{room.room_number}</div>
              </div>

              <div>
                <label className="text-sm font-medium text-golden-300">Floor</label>
                <div className="text-golden-100 font-medium mt-1">Floor {room.floor} {room.floor === 0 ? '(Ground)' : ''}</div>
              </div>

              <div>
                <label className="text-sm font-medium text-golden-300">Room Type</label>
                <div className="text-golden-100 font-medium mt-1 capitalize">{room.type}</div>
              </div>

              <div>
                <label className="text-sm font-medium text-golden-300">Capacity</label>
                <div className="text-golden-100 font-medium mt-1">{room.capacity} person(s)</div>
              </div>

              <div>
                <label className="text-sm font-medium text-golden-300">Total Security Deposit</label>
                <div className="text-golden-100 font-medium mt-1">{formatCurrency(room.security_deposit)}</div>
                <div className="text-xs text-golden-400 mt-1">Auto-calculated from tenants</div>
              </div>

              <div>
                <label className="text-sm font-medium text-golden-300">Created Date</label>
                <div className="text-golden-100 font-medium mt-1">
                  {new Date(room.created_date).toLocaleDateString()}
                </div>
              </div>
            </div>

            {room.description && (
              <div className="mt-4">
                <label className="text-sm font-medium text-golden-300">Description</label>
                <div className="text-golden-100 mt-1">{room.description}</div>
              </div>
            )}
          </div>

          {/* Amenities */}
          <div className="bg-dark-800 border border-golden-600/30 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-golden-400 mb-4 flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Amenities
            </h3>
            
            {room.amenities && room.amenities.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {room.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center gap-2 text-golden-100">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    {amenity}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-golden-400">No amenities listed</div>
            )}
          </div>

          {/* Current Tenants */}
          <div className="bg-dark-800 border border-golden-600/30 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-golden-400 mb-4 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Current Tenants
            </h3>
            
            {room.tenants && room.tenants.length > 0 ? (
              <div className="space-y-3">
                {room.tenants.map((tenant, index) => (
                  <div key={index} className="bg-dark-700 rounded-lg p-4 border border-golden-600/20">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <div className="text-golden-100 font-medium text-lg">{tenant.name}</div>
                      </div>
                      <div className="text-golden-400 text-sm">ID: {tenant.id}</div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-golden-400">Allocated Date:</span>
                        <span className="text-golden-100 ml-2">
                          {new Date(tenant.allocated_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-golden-400">Status:</span>
                        <span className="text-green-400 ml-2">Active</span>
                      </div>
                      <div>
                        <span className="text-golden-400">Monthly Rent:</span>
                        <span className="text-golden-100 ml-2 font-medium">
                          {formatCurrency(tenant.monthly_rent)}
                        </span>
                      </div>
                      <div>
                        <span className="text-golden-400">Security Deposit:</span>
                        <span className="text-golden-100 ml-2 font-medium">
                          {formatCurrency(tenant.security_deposit)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-golden-600/20">
                      <div className="flex items-center gap-2 text-golden-300 text-sm">
                        <Users className="h-4 w-4" />
                        <span>Tenant #{index + 1} in Room {room.room_number}</span>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="mt-4 p-3 bg-dark-700/50 rounded-lg border border-golden-600/20">
                  <div className="text-center text-golden-400 text-sm">
                    <div className="font-medium mb-1">Occupancy Summary</div>
                    <div className="text-golden-100">
                      {room.tenants.length} of {room.capacity} spots occupied
                    </div>
                    {room.capacity > room.tenants.length && (
                      <div className="text-green-400 text-xs mt-1">
                        {room.capacity - room.tenants.length} spot(s) available
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Financial Summary */}
                <div className="mt-4 p-4 bg-gradient-to-r from-golden-600/10 to-golden-500/10 rounded-lg border border-golden-600/30">
                  <div className="text-center text-golden-400 text-sm mb-3">
                    <div className="font-medium text-lg">Room Financial Summary</div>
                    <div className="text-golden-300 text-xs">Automatically calculated from tenant data</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-golden-300 text-xs">Total Monthly Rent</div>
                      <div className="text-golden-100 font-bold text-lg">
                        {formatCurrency(room.monthly_rent)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-golden-300 text-xs">Total Security Deposit</div>
                      <div className="text-golden-100 font-bold text-lg">
                        {formatCurrency(room.security_deposit)}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-golden-600/20 text-center">
                    <div className="text-golden-400 text-xs">
                      Based on {room.tenants.length} active tenant{room.tenants.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-golden-400 mb-2">No tenants currently allocated</div>
                <div className="text-golden-600 text-sm">
                  This room is available for new tenants
                </div>
                {room.status === 'occupied' && room.current_occupancy > 0 && (
                  <div className="text-orange-400 text-sm mt-2">
                    ⚠️ Data inconsistency: Room shows occupied but no tenant details found
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Maintenance Information */}
          <div className="bg-dark-800 border border-golden-600/30 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-golden-400 mb-4 flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Maintenance Status
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-golden-300">Status</label>
                <div className={`font-medium mt-1 ${getMaintenanceStatusColor(room.maintenance_status)}`}>
                  {room.maintenance_status === 'none' ? 'No maintenance' : room.maintenance_status?.replace('_', ' ')}
                </div>
              </div>

              {room.maintenance_type && (
                <div>
                  <label className="text-sm font-medium text-golden-300">Type</label>
                  <div className="text-golden-100 font-medium mt-1 capitalize">{room.maintenance_type}</div>
                </div>
              )}

              {room.maintenance_scheduled_date && (
                <div>
                  <label className="text-sm font-medium text-golden-300">Scheduled Date</label>
                  <div className="text-golden-100 font-medium mt-1">
                    {new Date(room.maintenance_scheduled_date).toLocaleDateString()}
                  </div>
                </div>
              )}

              {room.maintenance_completed_date && (
                <div>
                  <label className="text-sm font-medium text-golden-300">Completed Date</label>
                  <div className="text-golden-100 font-medium mt-1">
                    {new Date(room.maintenance_completed_date).toLocaleDateString()}
                  </div>
                </div>
              )}

              {room.maintenance_cost && (
                <div>
                  <label className="text-sm font-medium text-golden-300">Cost</label>
                  <div className="text-golden-100 font-medium mt-1">{formatCurrency(room.maintenance_cost)}</div>
                </div>
              )}
            </div>

            {room.maintenance_description && (
              <div className="mt-4">
                <label className="text-sm font-medium text-golden-300">Description</label>
                <div className="text-golden-100 mt-1">{room.maintenance_description}</div>
              </div>
            )}
          </div>

          {/* Images */}
          {room.images && room.images.length > 0 && (
            <div className="bg-dark-800 border border-golden-600/30 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-golden-400 mb-4 flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Room Photos ({room.images.length})
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {room.images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image.url}
                      alt={image.caption || `Room ${room.room_number} photo ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    {image.caption && (
                      <div className="text-xs text-golden-400 mt-1">{image.caption}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Rooms; 