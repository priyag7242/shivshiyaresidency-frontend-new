import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, MoreVertical, Edit, Trash2, Building, Users, DoorOpen, IndianRupee, Layers, User, UserPlus, Wrench, CheckCircle, Circle, AlertTriangle, Calendar, Camera, Settings, Eye, X, ArrowUpRight, Bell, ChevronDown } from 'lucide-react';
import axios from 'axios';
import RoomForm from '../components/RoomForm';
import RoomAllocationModal from '../components/RoomAllocationModal';
import MaintenanceModal from '../components/MaintenanceModal';
import { roomsQueries } from '../lib/supabaseQueries';
import { getRoomStats, tenantData } from '../data/tenantData';

const apiUrl = import.meta.env.VITE_API_URL || '';
const USE_SUPABASE = false; // Using local data for now

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
      return <AlertTriangle className="h-4 w-4" />;
    default:
      return <Circle className="h-4 w-4" />;
  }
};

const getMaintenanceStatusColor = (status?: string) => {
  switch (status) {
    case 'none':
      return 'text-gray-400';
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
      return <Users className="h-4 w-4" />;
    case 'quad':
      return <Users className="h-4 w-4" />;
    default:
      return <Building className="h-4 w-4" />;
  }
};

const getRoomTypeColor = (type: string) => {
  switch (type) {
    case 'single':
      return 'bg-blue-100 text-blue-600';
    case 'double':
      return 'bg-green-100 text-green-600';
    case 'triple':
      return 'bg-purple-100 text-purple-600';
    case 'quad':
      return 'bg-orange-100 text-orange-600';
    default:
      return 'bg-gray-100 text-gray-600';
  }
};

const Rooms = () => {
  const [rooms, setRooms] = useState<any[]>([]);
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
  const [selectedRoom, setSelectedRoom] = useState<any | null>(null);
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
        // Use local data
        const roomStats = getRoomStats();
        let filteredRooms = roomStats;
        
        // Apply filters
        if (searchTerm) {
          filteredRooms = filteredRooms.filter(room => 
            room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        if (typeFilter) {
          filteredRooms = filteredRooms.filter(room => room.roomType.toLowerCase() === typeFilter);
        }
        if (statusFilter) {
          if (statusFilter === 'available') {
            filteredRooms = filteredRooms.filter(room => room.occupiedBeds === 0);
          } else if (statusFilter === 'occupied') {
            filteredRooms = filteredRooms.filter(room => room.occupiedBeds > 0);
          }
        }
        
        setRooms(filteredRooms);
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
          totalRevenue: rooms.reduce((sum, r) => sum + (r.monthly_rent || 0), 0),
          floorStats: {},
          typeStats: {},
          maintenanceStats: {
            none: rooms.filter(r => !r.maintenance_status || r.maintenance_status === 'none').length,
            scheduled: rooms.filter(r => r.maintenance_status === 'scheduled').length,
            in_progress: rooms.filter(r => r.maintenance_status === 'in_progress').length,
            completed: rooms.filter(r => r.maintenance_status === 'completed').length
          }
        };
        
        setStats(stats);
      } else {
        // Use local data
        const roomStats = getRoomStats();
        const totalRooms = roomStats.length;
        const occupiedRooms = roomStats.filter(r => r.occupiedBeds > 0).length;
        const availableRooms = roomStats.filter(r => r.occupiedBeds === 0).length;
        const totalCapacity = roomStats.reduce((sum, r) => sum + r.totalBeds, 0);
        const currentOccupancy = roomStats.reduce((sum, r) => sum + r.occupiedBeds, 0);
        const totalRevenue = roomStats.reduce((sum, r) => sum + r.totalRent, 0);
        
        // Calculate type stats
        const typeStats: { [key: string]: { total: number; occupied: number; available: number } } = {};
        roomStats.forEach(room => {
          const type = room.roomType.toLowerCase();
          if (!typeStats[type]) {
            typeStats[type] = { total: 0, occupied: 0, available: 0 };
          }
          typeStats[type].total += 1;
          if (room.occupiedBeds > 0) {
            typeStats[type].occupied += 1;
          } else {
            typeStats[type].available += 1;
          }
        });
        
        const stats: RoomStats = {
          total: totalRooms,
          occupied: occupiedRooms,
          available: availableRooms,
          maintenance: 0,
          reserved: 0,
          totalCapacity,
          currentOccupancy,
          totalRevenue,
          floorStats: {},
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
    <div className="min-h-screen bg-white">
      {/* Custom CSS for animations */}
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
        
        @keyframes countUp {
          from { opacity: 0; transform: scale(0.5); }
          to { opacity: 1; transform: scale(1); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }
        
        .animate-slideUp {
          animation: slideUp 0.8s ease-out forwards;
        }
        
        .animate-bounceIn {
          animation: bounceIn 0.8s ease-out forwards;
        }
        
        .animate-countUp {
          animation: countUp 0.8s ease-out forwards;
        }
        
        .hover-lift {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .hover-lift:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        }
      `}</style>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Column - Room Overview and Quick Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Room Overview Section */}
            <div className="bg-gray-900 rounded-xl p-4 sm:p-6 relative transition-all duration-500 ease-in-out hover-lift">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4">
                <h2 className="text-white font-bold text-lg sm:text-xl">ROOM OVERVIEW</h2>
                <div className="bg-yellow-500 text-gray-900 px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2">
                  <Building className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Total: {stats.total} Rooms</span>
                  <span className="sm:hidden">{stats.total}</span>
                </div>
              </div>

              <div className="text-white mb-4">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold animate-countUp">{formatCurrency(stats.totalRevenue)}</div>
                <div className="text-sm sm:text-lg opacity-80 animate-fadeIn" style={{ animationDelay: '0.3s' }}>Monthly Revenue from Rooms</div>
              </div>

              {/* Room Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6">
                <div className="text-center p-3 bg-gray-800 rounded-lg">
                  <div className="text-green-400 text-lg sm:text-xl font-bold animate-countUp">{stats.available}</div>
                  <div className="text-gray-300 text-xs sm:text-sm">Available</div>
                </div>
                <div className="text-center p-3 bg-gray-800 rounded-lg">
                  <div className="text-blue-400 text-lg sm:text-xl font-bold animate-countUp">{stats.occupied}</div>
                  <div className="text-gray-300 text-xs sm:text-sm">Occupied</div>
                </div>
                <div className="text-center p-3 bg-gray-800 rounded-lg">
                  <div className="text-orange-400 text-lg sm:text-xl font-bold animate-countUp">{stats.maintenance}</div>
                  <div className="text-gray-300 text-xs sm:text-sm">Maintenance</div>
                </div>
                <div className="text-center p-3 bg-gray-800 rounded-lg">
                  <div className="text-purple-400 text-lg sm:text-xl font-bold animate-countUp">{stats.reserved}</div>
                  <div className="text-gray-300 text-xs sm:text-sm">Reserved</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm hover-lift transition-all duration-300">
              <h2 className="text-gray-900 font-bold text-lg sm:text-xl mb-4 sm:mb-6">Quick Actions</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                <button 
                  onClick={() => {
                    setSelectedRoom(null);
                    setShowAddModal(true);
                  }}
                  className="flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-300 group hover-lift animate-fadeIn"
                  style={{ animationDelay: '0.1s' }}
                >
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-all duration-300 group-hover:scale-110">
                    <Plus className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-gray-700 text-center">Add Room</span>
                </button>
                
                <button 
                  onClick={() => setShowAllocationModal(true)}
                  className="flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-300 group hover-lift animate-fadeIn"
                  style={{ animationDelay: '0.2s' }}
                >
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-all duration-300 group-hover:scale-110">
                    <UserPlus className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-gray-700 text-center">Allocate Room</span>
                </button>
                
                <button 
                  onClick={() => setShowMaintenanceModal(true)}
                  className="flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-300 group hover-lift animate-fadeIn"
                  style={{ animationDelay: '0.3s' }}
                >
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-orange-100 rounded-full flex items-center justify-center group-hover:bg-orange-200 transition-all duration-300 group-hover:scale-110">
                    <Wrench className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-gray-700 text-center">Maintenance</span>
                </button>

                <button 
                  onClick={() => {
                    setStatusFilter('');
                    setFloorFilter('');
                    setTypeFilter('');
                    setMaintenanceFilter('');
                    setSearchTerm('');
                  }}
                  className="flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-300 group hover-lift animate-fadeIn"
                  style={{ animationDelay: '0.4s' }}
                >
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-all duration-300 group-hover:scale-110">
                    <Eye className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-gray-700 text-center">View All</span>
                </button>
              </div>
            </div>

            {/* Room List with Detailed Information */}
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm hover-lift transition-all duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h2 className="text-gray-900 font-bold text-lg sm:text-xl">Room List</h2>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Search rooms..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm"
                  />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm"
                  >
                    <option value="">All Status</option>
                    <option value="available">Available</option>
                    <option value="occupied">Occupied</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="reserved">Reserved</option>
                  </select>
                </div>
              </div>

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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rooms.slice(0, 6).map((room) => (
                    <div key={room.roomNumber} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-300">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-gray-600" />
                          <h3 className="font-semibold text-gray-900">Room {room.roomNumber}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            room.occupiedBeds === 0 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {room.occupiedBeds === 0 ? 'Available' : 'Full'}
                          </span>
                          <button className="p-1 text-gray-400 hover:text-gray-600">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Basic Room Info */}
                      <div className="space-y-2 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>{room.occupiedBeds}/{room.totalBeds} Occupied</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <IndianRupee className="h-4 w-4" />
                          <span>{formatCurrency(room.totalRent)}/month</span>
                        </div>
                      </div>

                      {/* Detailed Room Information */}
                      <div className="space-y-2 mb-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-4 h-4 bg-gray-200 rounded flex items-center justify-center">
                            <span className="text-xs font-medium">🛏️</span>
                          </div>
                          <span>Bed: {room.totalBeds}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-4 h-4 bg-gray-200 rounded flex items-center justify-center">
                            <span className="text-xs font-medium">🔔</span>
                          </div>
                          <span>Under Notice: {room.hasNotice ? room.tenants.filter((t: any) => t.noticeGiven).length : 0}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-4 h-4 bg-gray-200 rounded flex items-center justify-center">
                            <span className="text-xs font-medium">💰</span>
                          </div>
                          <span>Rent Due: {room.hasUnpaidRent ? room.tenants.filter((t: any) => t.rentUnpaid > 0).length : 0}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-4 h-4 bg-gray-200 rounded flex items-center justify-center">
                            <span className="text-xs font-medium">🎫</span>
                          </div>
                          <span>Active Ticket: {room.hasUnpaidElectricity ? 1 : 0}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedRoom(room);
                            setShowDetailsModal(true);
                          }}
                          className="flex-1 px-3 py-2 bg-yellow-500 text-gray-900 rounded-lg text-sm font-medium hover:bg-yellow-600 transition-colors"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => {
                            setSelectedRoom(room);
                            setShowAllocationModal(true);
                          }}
                          className="flex-1 px-3 py-2 bg-gray-100 text-gray-800 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                        >
                          Add Tenant
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Room Stats */}
          <div className="space-y-6">
            {/* Room Statistics */}
            <div className="bg-yellow-500 rounded-xl p-4 sm:p-6 hover-lift transition-all duration-300">
              <h2 className="text-gray-900 font-bold text-lg sm:text-xl mb-4">Room Statistics</h2>
              <div className="bg-white rounded-lg p-4 sm:p-6 hover-lift transition-all duration-300">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm sm:text-base">Total Capacity:</span>
                    <span className="text-blue-600 font-bold text-lg sm:text-xl animate-countUp">{stats.totalCapacity}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm sm:text-base">Current Occupancy:</span>
                    <span className="text-green-600 font-bold text-lg sm:text-xl animate-countUp">{stats.currentOccupancy}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm sm:text-base">Occupancy Rate:</span>
                    <span className="text-purple-600 font-bold text-lg sm:text-xl animate-countUp">
                      {stats.totalCapacity > 0 ? Math.round((stats.currentOccupancy / stats.totalCapacity) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Maintenance Status */}
            <div className="bg-yellow-500 rounded-xl p-4 sm:p-6 hover-lift transition-all duration-300">
              <h2 className="text-gray-900 font-bold text-lg sm:text-xl mb-4">Maintenance Status</h2>
              <div className="bg-white rounded-lg p-4 sm:p-6 hover-lift transition-all duration-300">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm sm:text-base">Scheduled:</span>
                    <span className="text-orange-600 font-bold text-lg sm:text-xl animate-countUp">{stats.maintenanceStats.scheduled}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm sm:text-base">In Progress:</span>
                    <span className="text-red-600 font-bold text-lg sm:text-xl animate-countUp">{stats.maintenanceStats.in_progress}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm sm:text-base">Completed:</span>
                    <span className="text-green-600 font-bold text-lg sm:text-xl animate-countUp">{stats.maintenanceStats.completed}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm hover-lift transition-all duration-300">
              <h2 className="text-gray-900 font-bold text-lg sm:text-xl mb-4">Recent Activity</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">New room added - Room 101</span>
                </div>
                <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Tenant allocated to Room 205</span>
                </div>
                <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Maintenance scheduled for Room 103</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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

      {selectedRoom && (
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
  room: any; // Changed from Room to any to match the new data structure
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