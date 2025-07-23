import { useState, useEffect } from 'react';
import { X, Users, Calendar, UserPlus, UserMinus, Search } from 'lucide-react';
import axios from 'axios';

interface Room {
  id: string;
  room_number: string;
  floor: number;
  type: string;
  capacity: number;
  current_occupancy: number;
  tenants: { id: string; name: string; allocated_date: string }[];
}

interface Tenant {
  id: string;
  name: string;
  mobile: string;
  room_number: string;
  status: string;
}

interface RoomAllocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: Room | null;
  onAllocationUpdate: () => void;
}

const RoomAllocationModal = ({ isOpen, onClose, room, onAllocationUpdate }: RoomAllocationModalProps) => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      fetchTenants();
    }
  }, [isOpen]);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/tenants`);
      setTenants(response.data.tenants || []);
    } catch (error) {
      console.error('Error fetching tenants:', error);
    } finally {
      setLoading(false);
    }
  };

  const allocateRoom = async () => {
    if (!selectedTenant || !room) return;

    const tenant = tenants.find(t => t.id === selectedTenant);
    if (!tenant) return;

    try {
      setLoading(true);
      await axios.post(`${import.meta.env.VITE_API_URL}/api/rooms/${room.id}/allocate`, {
        tenant_id: tenant.id,
        tenant_name: tenant.name
      });
      
      onAllocationUpdate();
      setSelectedTenant('');
      // Show success message here if you have toast/notification system
    } catch (error: any) {
      console.error('Error allocating room:', error);
      alert(error.response?.data?.error || 'Failed to allocate room');
    } finally {
      setLoading(false);
    }
  };

  const deallocateRoom = async (tenantId: string) => {
    if (!room) return;

    try {
      setLoading(true);
      await axios.post(`${import.meta.env.VITE_API_URL}/api/rooms/${room.id}/deallocate`, {
        tenant_id: tenantId
      });
      
      onAllocationUpdate();
      // Show success message here if you have toast/notification system
    } catch (error: any) {
      console.error('Error deallocating room:', error);
      alert(error.response?.data?.error || 'Failed to deallocate room');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !room) return null;

  // Filter available tenants (not already in this room and not in any room or have status indicating they can move)
  const availableTenants = tenants.filter(tenant => 
    !room.tenants.some(rt => rt.id === tenant.id) &&
    tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (tenant.room_number === '' || tenant.status === 'adjust') // Available or looking to move
  );

  const hasCapacity = room.current_occupancy < room.capacity;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-dark-900 border border-golden-600/20 rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-golden-600/20">
          <div>
            <h2 className="text-xl font-semibold text-golden-400">
              Room Allocation - {room.room_number}
            </h2>
            <p className="text-golden-300 text-sm">
              {room.type} • Floor {room.floor} • {room.current_occupancy}/{room.capacity} occupied
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-golden-300 hover:text-golden-100 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(80vh-120px)]">
          <div className="p-6 space-y-6">
            {/* Current Tenants */}
            <div>
              <h3 className="text-lg font-medium text-golden-400 mb-4 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Current Tenants
              </h3>
              
              {room.tenants.length > 0 ? (
                <div className="space-y-3">
                  {room.tenants.map(tenant => (
                    <div key={tenant.id} className="bg-dark-800 border border-golden-600/30 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-golden-100">{tenant.name}</h4>
                          <p className="text-golden-300 text-sm flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Allocated: {new Date(tenant.allocated_date).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={() => deallocateRoom(tenant.id)}
                          disabled={loading}
                          className="flex items-center gap-1 px-3 py-1 text-red-400 border border-red-600/30 rounded-lg hover:bg-red-600/10 transition-colors disabled:opacity-50"
                        >
                          <UserMinus className="h-4 w-4" />
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-golden-400/60">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No tenants allocated to this room</p>
                </div>
              )}
            </div>

            {/* Add New Tenant */}
            {hasCapacity && (
              <div>
                <h3 className="text-lg font-medium text-golden-400 mb-4 flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Allocate New Tenant
                </h3>

                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-golden-400" />
                  <input
                    type="text"
                    placeholder="Search available tenants..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 placeholder-golden-400/50 focus:outline-none focus:border-golden-500"
                  />
                </div>

                {/* Tenant Selection */}
                <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                  {availableTenants.map(tenant => (
                    <label key={tenant.id} className="flex items-center gap-3 p-3 bg-dark-800 border border-golden-600/30 rounded-lg hover:bg-dark-700 cursor-pointer">
                      <input
                        type="radio"
                        name="selectedTenant"
                        value={tenant.id}
                        checked={selectedTenant === tenant.id}
                        onChange={(e) => setSelectedTenant(e.target.value)}
                        className="text-golden-500 focus:ring-golden-500"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-golden-100">{tenant.name}</div>
                        <div className="text-golden-300 text-sm">{tenant.mobile}</div>
                        {tenant.status === 'adjust' && (
                          <div className="text-orange-400 text-xs">Looking to move</div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>

                {availableTenants.length === 0 && (
                  <div className="text-center py-4 text-golden-400/60">
                    <p>No available tenants found</p>
                  </div>
                )}

                {/* Allocate Button */}
                <button
                  onClick={allocateRoom}
                  disabled={!selectedTenant || loading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-golden-500 to-golden-600 text-dark-900 rounded-lg hover:from-golden-600 hover:to-golden-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <UserPlus className="h-4 w-4" />
                  {loading ? 'Allocating...' : 'Allocate Room'}
                </button>
              </div>
            )}

            {!hasCapacity && (
              <div className="bg-orange-600/10 border border-orange-600/30 rounded-lg p-4">
                <p className="text-orange-400 text-center">
                  Room is at full capacity ({room.capacity} tenants)
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomAllocationModal; 