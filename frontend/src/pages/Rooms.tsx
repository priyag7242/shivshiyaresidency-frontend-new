import { useState, useEffect } from 'react';
import { Search, Plus, Filter, MoreVertical, Edit, Trash2, Building, Users, DoorOpen, IndianRupee, Layers, User, UserPlus, Wrench, CheckCircle, Circle, AlertTriangle, Calendar, Camera, Settings, Eye, X } from 'lucide-react';
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
            {Object.entries(stats.floorStats || {}).map(([floor, floorData]) => (
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
            {Object.entries(stats.typeStats || {}).map(([type, typeData]) => (
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
                          <button
                            onClick={() => {
                              setSelectedRoom(room);
                              setShowDetailsModal(true);
                            }}
                            className="text-golden-400 hover:text-golden-100 text-xs underline transition-colors mt-1"
                          >
                            Click to view details
                          </button>
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