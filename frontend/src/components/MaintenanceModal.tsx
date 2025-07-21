import { useState, useEffect } from 'react';
import { X, Wrench, Calendar, IndianRupee, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import axios from 'axios';

interface Room {
  id: string;
  room_number: string;
  floor: number;
  type: string;
  maintenance_status?: 'none' | 'scheduled' | 'in_progress' | 'completed';
  maintenance_type?: string;
  maintenance_description?: string;
  maintenance_scheduled_date?: string;
  maintenance_completed_date?: string;
  maintenance_cost?: number;
  last_maintenance_date?: string;
}

interface MaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: Room | null;
  onMaintenanceUpdate: () => void;
}

const maintenanceTypes = [
  'Electrical', 'Plumbing', 'AC Repair', 'Furniture', 'Painting', 'Cleaning', 'Appliance Repair', 'General'
];

const MaintenanceModal = ({ isOpen, onClose, room, onMaintenanceUpdate }: MaintenanceModalProps) => {
  const [formData, setFormData] = useState({
    maintenance_status: 'none' as 'none' | 'scheduled' | 'in_progress' | 'completed',
    maintenance_type: '',
    maintenance_description: '',
    maintenance_scheduled_date: '',
    maintenance_cost: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (room) {
      setFormData({
        maintenance_status: room.maintenance_status || 'none',
        maintenance_type: room.maintenance_type || '',
        maintenance_description: room.maintenance_description || '',
        maintenance_scheduled_date: room.maintenance_scheduled_date || '',
        maintenance_cost: room.maintenance_cost || 0
      });
    }
  }, [room]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!room) return;

    try {
      setLoading(true);
      await axios.put(`/api/rooms/${room.id}/maintenance`, formData);
      onMaintenanceUpdate();
      onClose();
    } catch (error: any) {
      console.error('Error updating maintenance:', error);
      alert(error.response?.data?.error || 'Failed to update maintenance status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Clock className="h-4 w-4 text-blue-400" />;
      case 'in_progress':
        return <AlertTriangle className="h-4 w-4 text-orange-400" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      default:
        return <Wrench className="h-4 w-4 text-golden-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'text-blue-400 border-blue-400/30 bg-blue-400/10';
      case 'in_progress':
        return 'text-orange-400 border-orange-400/30 bg-orange-400/10';
      case 'completed':
        return 'text-green-400 border-green-400/30 bg-green-400/10';
      default:
        return 'text-golden-400 border-golden-400/30 bg-golden-400/10';
    }
  };

  if (!isOpen || !room) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-dark-900 border border-golden-600/20 rounded-xl w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-golden-600/20">
          <div>
            <h2 className="text-xl font-semibold text-golden-400 flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Maintenance - Room {room.room_number}
            </h2>
            <p className="text-golden-300 text-sm">
              {room.type} • Floor {room.floor}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-golden-300 hover:text-golden-100 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Current Status */}
        {room.maintenance_status && room.maintenance_status !== 'none' && (
          <div className="p-6 border-b border-golden-600/20">
            <h3 className="text-lg font-medium text-golden-400 mb-3">Current Status</h3>
            <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm border ${getStatusColor(room.maintenance_status)}`}>
              {getStatusIcon(room.maintenance_status)}
              {room.maintenance_status.replace('_', ' ').toUpperCase()}
            </div>
            
            {room.last_maintenance_date && (
              <div className="mt-4 text-golden-300 text-sm">
                <span className="font-medium">Last Maintenance:</span> {new Date(room.last_maintenance_date).toLocaleDateString()}
              </div>
            )}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-golden-300 mb-2">
                  Maintenance Status *
                </label>
                <select
                  required
                  value={formData.maintenance_status}
                  onChange={(e) => setFormData({ ...formData, maintenance_status: e.target.value as any })}
                  className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
                >
                  <option value="none">No Maintenance</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-golden-300 mb-2">
                  Maintenance Type *
                </label>
                <select
                  required={formData.maintenance_status !== 'none'}
                  value={formData.maintenance_type}
                  onChange={(e) => setFormData({ ...formData, maintenance_type: e.target.value })}
                  className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
                  disabled={formData.maintenance_status === 'none'}
                >
                  <option value="">Select type...</option>
                  {maintenanceTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-golden-300 mb-2">
                  Scheduled Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-golden-400" />
                  <input
                    type="date"
                    value={formData.maintenance_scheduled_date}
                    onChange={(e) => setFormData({ ...formData, maintenance_scheduled_date: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
                    disabled={formData.maintenance_status === 'none'}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-golden-300 mb-2">
                  Estimated Cost (₹)
                </label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-golden-400" />
                  <input
                    type="number"
                    min="0"
                    value={formData.maintenance_cost}
                    onChange={(e) => setFormData({ ...formData, maintenance_cost: Number(e.target.value) })}
                    className="w-full pl-10 pr-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 placeholder-golden-400/50 focus:outline-none focus:border-golden-500"
                    placeholder="5000"
                    disabled={formData.maintenance_status === 'none'}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-golden-300 mb-2">
                Maintenance Description *
              </label>
              <textarea
                required={formData.maintenance_status !== 'none'}
                rows={4}
                value={formData.maintenance_description}
                onChange={(e) => setFormData({ ...formData, maintenance_description: e.target.value })}
                className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 placeholder-golden-400/50 focus:outline-none focus:border-golden-500"
                placeholder="Describe the maintenance work required..."
                disabled={formData.maintenance_status === 'none'}
              />
            </div>

            {/* Status Help Text */}
            <div className="bg-dark-800 border border-golden-600/30 rounded-lg p-4">
              <h4 className="font-medium text-golden-400 mb-2">Status Guide:</h4>
              <div className="space-y-1 text-sm text-golden-300">
                <div><span className="font-medium">Scheduled:</span> Maintenance is planned for a future date</div>
                <div><span className="font-medium">In Progress:</span> Maintenance work is currently being done (room will be marked unavailable)</div>
                <div><span className="font-medium">Completed:</span> Maintenance work has been finished</div>
                <div><span className="font-medium">None:</span> No maintenance required</div>
              </div>
            </div>
          </div>

          {/* Footer */}
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
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-golden-500 to-golden-600 text-dark-900 rounded-lg hover:from-golden-600 hover:to-golden-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating...' : 'Update Maintenance'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MaintenanceModal; 