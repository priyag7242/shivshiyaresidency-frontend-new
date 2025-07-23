import { useState, useEffect } from 'react';
import { Search, Plus, Filter, MoreVertical, Edit, Trash2, Building, Users, DoorOpen, IndianRupee, Layers, User, UserPlus, Wrench, CheckCircle, Circle, AlertTriangle, Calendar, Camera, Settings } from 'lucide-react';
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
  tenants: { id: string; name: string; allocated_date: string }[];
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
          filteredRooms = filteredRooms.filter(room => room.floor.toString() === floorFilter);
        }
        if (typeFilter) {
          filteredRooms = filteredRooms.filter(room => room.room_type === typeFilter);
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
      const response = await axios.get(`${apiUrl}/rooms/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleRoomSubmit = async (roomData: Partial<Room>) => {
    try {
      if (selectedRoom) {
        await axios.put(`${apiUrl}/rooms/${selectedRoom.id}`, roomData);
      } else {
        await axios.post(`${apiUrl}/rooms`, roomData);
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
      await axios.delete(`${apiUrl}/rooms/${roomId}`);
      fetchRooms();
      fetchStats();
    } catch (error: any) {
      console.error('Error deleting room:', error);
      alert(error.response?.data?.error || 'Failed to delete room');
    }
  };

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-golden-400 mb-2">Room Management</h1>
            <p className="text-golden-300">Manage rooms, allocations, amenities, and maintenance</p>
          </div>
          <div className="mt-4 lg:mt-0">
            <button
              onClick={() => {
                setSelectedRoom(null);
                setShowAddModal(true);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-golden-500 to-golden-600 text-dark-900 rounded-lg hover:from-golden-600 hover:to-golden-700 transition-all duration-200 font-medium"
            >
              <Plus className="h-5 w-5" />
              Add New Room
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-dark-900 border border-golden-600/20 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-golden-300 text-sm font-medium">Total Rooms</p>
              <p className="text-2xl font-bold text-golden-100">{stats.total}</p>
            </div>
            <Building className="h-8 w-8 text-golden-400" />
          </div>
        </div>

        <div className="bg-dark-900 border border-golden-600/20 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-golden-300 text-sm font-medium">Available</p>
              <p className="text-2xl font-bold text-green-400">{stats.available}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div className="bg-dark-900 border border-golden-600/20 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-golden-300 text-sm font-medium">Occupied</p>
              <p className="text-2xl font-bold text-blue-400">{stats.occupied}</p>
            </div>
            <Users className="h-8 w-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-dark-900 border border-golden-600/20 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-golden-300 text-sm font-medium">Monthly Revenue</p>
              <p className="text-2xl font-bold text-golden-400">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <IndianRupee className="h-8 w-8 text-golden-400" />
          </div>
        </div>
      </div>

      {/* Floor & Type Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Floor Distribution */}
        <div className="bg-dark-900 border border-golden-600/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-golden-400 mb-4 flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Floor Distribution
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.floorStats).map(([floor, floorData]) => (
              <div key={floor} className="flex items-center justify-between">
                <span className="text-golden-300">Floor {floor} {floor === '0' ? '(Ground)' : ''}</span>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-green-400">{floorData.available}</span>
                  <span className="text-golden-400">/</span>
                  <span className="text-golden-100">{floorData.total}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Room Type Stats */}
        <div className="bg-dark-900 border border-golden-600/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-golden-400 mb-4 flex items-center gap-2">
            <DoorOpen className="h-5 w-5" />
            Room Types
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.typeStats).map(([type, typeData]) => (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getRoomTypeIcon(type)}
                  <span className="text-golden-300 capitalize">{type}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-green-400">{typeData.available}</span>
                  <span className="text-golden-400">/</span>
                  <span className="text-golden-100">{typeData.total}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Maintenance Stats */}
      <div className="bg-dark-900 border border-golden-600/20 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-golden-400 mb-4 flex items-center gap-2">
          <Wrench className="h-5 w-5" />
          Maintenance Overview
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-400">{stats.maintenanceStats.none}</div>
            <div className="text-sm text-golden-300">No Maintenance</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{stats.maintenanceStats.scheduled}</div>
            <div className="text-sm text-golden-300">Scheduled</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-400">{stats.maintenanceStats.in_progress}</div>
            <div className="text-sm text-golden-300">In Progress</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{stats.maintenanceStats.completed}</div>
            <div className="text-sm text-golden-300">Completed</div>
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
              placeholder="Search rooms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 placeholder-golden-400/50 focus:outline-none focus:border-golden-500"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <select
              value={floorFilter}
              onChange={(e) => setFloorFilter(e.target.value)}
              className="px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
            >
              <option value="">All Floors</option>
              {[0, 1, 2, 3, 4, 5].map(floor => (
                <option key={floor} value={floor}>Floor {floor}</option>
              ))}
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
            >
              <option value="">All Types</option>
              <option value="single">Single</option>
              <option value="double">Double</option>
              <option value="triple">Triple</option>
              <option value="quad">Quad</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
            >
              <option value="">All Status</option>
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="maintenance">Maintenance</option>
              <option value="reserved">Reserved</option>
            </select>

            <select
              value={maintenanceFilter}
              onChange={(e) => setMaintenanceFilter(e.target.value)}
              className="px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
            >
              <option value="">All Maintenance</option>
              <option value="none">No Maintenance</option>
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Rooms Table */}
      <div className="bg-dark-900 border border-golden-600/20 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-800 border-b border-golden-600/20">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-golden-400">Room</th>
                <th className="text-left py-3 px-4 font-medium text-golden-400">Type & Floor</th>
                <th className="text-left py-3 px-4 font-medium text-golden-400">Occupancy</th>
                <th className="text-left py-3 px-4 font-medium text-golden-400">Rent</th>
                <th className="text-left py-3 px-4 font-medium text-golden-400">Status</th>
                <th className="text-left py-3 px-4 font-medium text-golden-400">Maintenance</th>
                <th className="text-left py-3 px-4 font-medium text-golden-400">Amenities</th>
                <th className="text-left py-3 px-4 font-medium text-golden-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-golden-600/10">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-golden-400">
                    Loading rooms...
                  </td>
                </tr>
              ) : rooms.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-golden-400/60">
                    No rooms found
                  </td>
                </tr>
              ) : (
                rooms.map((room) => (
                  <tr key={room.id} className="hover:bg-dark-800/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${getRoomTypeColor(room.type)}`}>
                          {getRoomTypeIcon(room.type)}
                        </div>
                        <div>
                          <div className="font-medium text-golden-100">{room.room_number}</div>
                          {room.images && room.images.length > 0 && (
                            <div className="flex items-center gap-1 text-xs text-golden-400">
                              <Camera className="h-3 w-3" />
                              {room.images.length} photos
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-golden-100 capitalize">{room.type}</div>
                      <div className="text-golden-300 text-sm">Floor {room.floor}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-golden-100">{room.current_occupancy}/{room.capacity}</div>
                      {room.tenants.length > 0 && (
                        <div className="text-xs text-golden-400">
                          {room.tenants.slice(0, 2).map(t => t.name).join(', ')}
                          {room.tenants.length > 2 && ` +${room.tenants.length - 2} more`}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-golden-100">{formatCurrency(room.monthly_rent)}</div>
                      <div className="text-golden-300 text-sm">Deposit: {formatCurrency(room.security_deposit)}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${getStatusColor(room.status)}`}>
                        {getStatusIcon(room.status)}
                        {room.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className={`text-sm ${getMaintenanceStatusColor(room.maintenance_status)}`}>
                        {room.maintenance_status === 'none' ? 'No maintenance' : room.maintenance_status?.replace('_', ' ')}
                      </div>
                      {room.maintenance_scheduled_date && (
                        <div className="text-xs text-golden-400 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(room.maintenance_scheduled_date).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-golden-300 text-sm">
                        {room.amenities.length > 0 ? (
                          <div>
                            {room.amenities.slice(0, 2).join(', ')}
                            {room.amenities.length > 2 && ` +${room.amenities.length - 2} more`}
                          </div>
                        ) : (
                          'No amenities'
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="relative">
                        <button
                          onClick={() => setActionDropdown(actionDropdown === room.id ? null : room.id)}
                          className="p-1 text-golden-300 hover:text-golden-100 transition-colors"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        
                        {actionDropdown === room.id && (
                          <div className="absolute right-0 mt-1 w-48 bg-dark-800 border border-golden-600/30 rounded-lg shadow-xl z-10">
                            <button
                              onClick={() => {
                                setSelectedRoom(room);
                                setShowAddModal(true);
                                setActionDropdown(null);
                              }}
                              className="w-full text-left px-4 py-2 text-golden-300 hover:bg-dark-700 transition-colors flex items-center gap-2"
                            >
                              <Edit className="h-4 w-4" />
                              Edit Room
                            </button>
                            
                            <button
                              onClick={() => {
                                setSelectedRoom(room);
                                setShowAllocationModal(true);
                                setActionDropdown(null);
                              }}
                              className="w-full text-left px-4 py-2 text-golden-300 hover:bg-dark-700 transition-colors flex items-center gap-2"
                            >
                              <Users className="h-4 w-4" />
                              Manage Allocation
                            </button>
                            
                            <button
                              onClick={() => {
                                setSelectedRoom(room);
                                setShowMaintenanceModal(true);
                                setActionDropdown(null);
                              }}
                              className="w-full text-left px-4 py-2 text-golden-300 hover:bg-dark-700 transition-colors flex items-center gap-2"
                            >
                              <Wrench className="h-4 w-4" />
                              Maintenance
                            </button>
                            
                            <button
                              onClick={() => {
                                handleDeleteRoom(room.id);
                                setActionDropdown(null);
                              }}
                              className="w-full text-left px-4 py-2 text-red-400 hover:bg-dark-700 transition-colors flex items-center gap-2"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete Room
                            </button>
                          </div>
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
    </div>
  );
};

export default Rooms; 