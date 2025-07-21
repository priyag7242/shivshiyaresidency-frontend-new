import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Upload, Calendar, IndianRupee, Users, Settings, Camera, Wrench } from 'lucide-react';

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

interface RoomFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (roomData: Partial<Room>) => void;
  room?: Room | null;
  isLoading?: boolean;
}

const commonAmenities = [
  'Wi-Fi', 'AC', 'Heater', 'Attached Bathroom', 'Balcony', 'Study Table', 'Chair', 'Bed', 'Wardrobe', 
  'Fridge', 'TV', 'Washing Machine', 'Geyser', 'Fan', 'Window', 'Curtains', 'Power Backup'
];

const maintenanceTypes = [
  'Electrical', 'Plumbing', 'AC Repair', 'Furniture', 'Painting', 'Cleaning', 'Appliance Repair', 'General'
];

const RoomForm = ({ isOpen, onClose, onSubmit, room, isLoading = false }: RoomFormProps) => {
  const [formData, setFormData] = useState<Partial<Room>>({
    room_number: '',
    floor: 0,
    type: 'single',
    monthly_rent: 0,
    security_deposit: 0,
    amenities: [],
    status: 'available',
    description: '',
    images: [],
    maintenance_status: 'none'
  });

  const [activeTab, setActiveTab] = useState('basic');
  const [newAmenity, setNewAmenity] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageCaption, setNewImageCaption] = useState('');

  useEffect(() => {
    if (room) {
      setFormData(room);
    } else {
      setFormData({
        room_number: '',
        floor: 0,
        type: 'single',
        monthly_rent: 0,
        security_deposit: 0,
        amenities: [],
        status: 'available',
        description: '',
        images: [],
        maintenance_status: 'none'
      });
    }
  }, [room]);

  const handleInputChange = (field: keyof Room, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addAmenity = (amenity: string) => {
    if (amenity && !formData.amenities?.includes(amenity)) {
      setFormData(prev => ({
        ...prev,
        amenities: [...(prev.amenities || []), amenity]
      }));
    }
  };

  const removeAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities?.filter(a => a !== amenity) || []
    }));
  };

  const addImage = () => {
    if (newImageUrl.trim()) {
      const newImage = {
        id: Date.now().toString(),
        url: newImageUrl.trim(),
        caption: newImageCaption.trim()
      };
      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), newImage]
      }));
      setNewImageUrl('');
      setNewImageCaption('');
    }
  };

  const removeImage = (imageId: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images?.filter(img => img.id !== imageId) || []
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-dark-900 border border-golden-600/20 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-golden-600/20">
          <h2 className="text-xl font-semibold text-golden-400">
            {room ? 'Edit Room' : 'Add New Room'}
          </h2>
          <button
            onClick={onClose}
            className="text-golden-300 hover:text-golden-100 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-golden-600/20">
          {[
            { id: 'basic', label: 'Basic Info', icon: Settings },
            { id: 'amenities', label: 'Amenities', icon: Plus },
            { id: 'photos', label: 'Photos', icon: Camera },
            { id: 'maintenance', label: 'Maintenance', icon: Wrench }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-6 py-3 transition-colors ${
                activeTab === id
                  ? 'text-golden-400 border-b-2 border-golden-400'
                  : 'text-golden-300 hover:text-golden-100'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="p-6">
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-golden-300 mb-2">
                      Room Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.room_number}
                      onChange={(e) => handleInputChange('room_number', e.target.value)}
                      className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 placeholder-golden-400/50 focus:outline-none focus:border-golden-500"
                      placeholder="e.g., 101, 205"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-golden-300 mb-2">
                      Floor *
                    </label>
                    <select
                      required
                      value={formData.floor}
                      onChange={(e) => handleInputChange('floor', Number(e.target.value))}
                      className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
                    >
                      {[0, 1, 2, 3, 4, 5].map(floor => (
                        <option key={floor} value={floor}>
                          Floor {floor} {floor === 0 ? '(Ground)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-golden-300 mb-2">
                      Room Type *
                    </label>
                    <select
                      required
                      value={formData.type}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                      className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
                    >
                      <option value="single">Single (1 Person)</option>
                      <option value="double">Double (2 People)</option>
                      <option value="triple">Triple (3 People)</option>
                      <option value="quad">Quad (4 People)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-golden-300 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
                    >
                      <option value="available">Available</option>
                      <option value="occupied">Occupied</option>
                      <option value="maintenance">Under Maintenance</option>
                      <option value="reserved">Reserved</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-golden-300 mb-2">
                      Monthly Rent (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.monthly_rent}
                      onChange={(e) => handleInputChange('monthly_rent', Number(e.target.value))}
                      className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 placeholder-golden-400/50 focus:outline-none focus:border-golden-500"
                      placeholder="15000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-golden-300 mb-2">
                      Security Deposit (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.security_deposit}
                      onChange={(e) => handleInputChange('security_deposit', Number(e.target.value))}
                      className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 placeholder-golden-400/50 focus:outline-none focus:border-golden-500"
                      placeholder="15000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-golden-300 mb-2">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 placeholder-golden-400/50 focus:outline-none focus:border-golden-500"
                    placeholder="Room features, location details, special notes..."
                  />
                </div>
              </div>
            )}

            {/* Amenities Tab */}
            {activeTab === 'amenities' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-golden-400 mb-4">Room Amenities</h3>
                  
                  {/* Quick Add Amenities */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-6">
                    {commonAmenities.map(amenity => (
                      <button
                        key={amenity}
                        type="button"
                        onClick={() => addAmenity(amenity)}
                        disabled={formData.amenities?.includes(amenity)}
                        className={`p-2 text-sm rounded-lg border transition-colors ${
                          formData.amenities?.includes(amenity)
                            ? 'bg-golden-600/20 border-golden-400 text-golden-300 cursor-not-allowed'
                            : 'bg-dark-800 border-golden-600/30 text-golden-100 hover:border-golden-500'
                        }`}
                      >
                        {amenity}
                      </button>
                    ))}
                  </div>

                  {/* Custom Amenity */}
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      value={newAmenity}
                      onChange={(e) => setNewAmenity(e.target.value)}
                      placeholder="Add custom amenity..."
                      className="flex-1 px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 placeholder-golden-400/50 focus:outline-none focus:border-golden-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        addAmenity(newAmenity);
                        setNewAmenity('');
                      }}
                      className="px-4 py-2 bg-golden-600 text-dark-900 rounded-lg hover:bg-golden-500 transition-colors"
                    >
                      Add
                    </button>
                  </div>

                  {/* Selected Amenities */}
                  <div className="flex flex-wrap gap-2">
                    {formData.amenities?.map(amenity => (
                      <span
                        key={amenity}
                        className="flex items-center gap-1 bg-golden-600/20 text-golden-300 px-3 py-1 rounded-full text-sm"
                      >
                        {amenity}
                        <button
                          type="button"
                          onClick={() => removeAmenity(amenity)}
                          className="text-golden-400 hover:text-golden-100"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Photos Tab */}
            {activeTab === 'photos' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-golden-400 mb-4">Room Photos</h3>
                  
                  {/* Add Photo */}
                  <div className="bg-dark-800 border border-golden-600/30 rounded-lg p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-golden-300 mb-2">
                          Image URL
                        </label>
                        <input
                          type="url"
                          value={newImageUrl}
                          onChange={(e) => setNewImageUrl(e.target.value)}
                          placeholder="https://example.com/image.jpg"
                          className="w-full px-3 py-2 bg-dark-700 border border-golden-600/30 rounded-lg text-golden-100 placeholder-golden-400/50 focus:outline-none focus:border-golden-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-golden-300 mb-2">
                          Caption (Optional)
                        </label>
                        <input
                          type="text"
                          value={newImageCaption}
                          onChange={(e) => setNewImageCaption(e.target.value)}
                          placeholder="Photo description..."
                          className="w-full px-3 py-2 bg-dark-700 border border-golden-600/30 rounded-lg text-golden-100 placeholder-golden-400/50 focus:outline-none focus:border-golden-500"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={addImage}
                      disabled={!newImageUrl.trim()}
                      className="mt-4 flex items-center gap-2 px-4 py-2 bg-golden-600 text-dark-900 rounded-lg hover:bg-golden-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Upload className="h-4 w-4" />
                      Add Photo
                    </button>
                  </div>

                  {/* Photo Gallery */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {formData.images?.map(image => (
                      <div key={image.id} className="relative bg-dark-800 border border-golden-600/30 rounded-lg overflow-hidden">
                        <img
                          src={image.url}
                          alt={image.caption || 'Room photo'}
                          className="w-full h-48 object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=';
                          }}
                        />
                        {image.caption && (
                          <div className="p-2">
                            <p className="text-golden-200 text-sm truncate">{image.caption}</p>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(image.id)}
                          className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-500 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {formData.images?.length === 0 && (
                    <div className="text-center py-8 text-golden-400/60">
                      <Camera className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No photos added yet</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Maintenance Tab */}
            {activeTab === 'maintenance' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-golden-400 mb-4">Maintenance Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-golden-300 mb-2">
                        Maintenance Status
                      </label>
                      <select
                        value={formData.maintenance_status}
                        onChange={(e) => handleInputChange('maintenance_status', e.target.value)}
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
                        Maintenance Type
                      </label>
                      <select
                        value={formData.maintenance_type || ''}
                        onChange={(e) => handleInputChange('maintenance_type', e.target.value)}
                        className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
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
                      <input
                        type="date"
                        value={formData.maintenance_scheduled_date || ''}
                        onChange={(e) => handleInputChange('maintenance_scheduled_date', e.target.value)}
                        className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-golden-300 mb-2">
                        Estimated Cost (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.maintenance_cost || ''}
                        onChange={(e) => handleInputChange('maintenance_cost', Number(e.target.value))}
                        className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 placeholder-golden-400/50 focus:outline-none focus:border-golden-500"
                        placeholder="5000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-golden-300 mb-2">
                      Maintenance Description
                    </label>
                    <textarea
                      rows={4}
                      value={formData.maintenance_description || ''}
                      onChange={(e) => handleInputChange('maintenance_description', e.target.value)}
                      className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 placeholder-golden-400/50 focus:outline-none focus:border-golden-500"
                      placeholder="Describe the maintenance work required..."
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-golden-600/20">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-golden-300 border border-golden-600/30 rounded-lg hover:bg-golden-600/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-gradient-to-r from-golden-500 to-golden-600 text-dark-900 rounded-lg hover:from-golden-600 hover:to-golden-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : room ? 'Update Room' : 'Create Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoomForm; 