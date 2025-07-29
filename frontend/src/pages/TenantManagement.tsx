import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download,
  Eye,
  AlertTriangle,
  Calendar,
  Zap,
  Users,
  Building,
  IndianRupee,
  FileText,
  ChevronDown,
  ChevronUp,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { tenantData } from '../data/tenantData';

interface TenantManagementData {
  roomNo: string;
  tenantNames: string[];
  dateOfJoining: string[];
  roomType: string;
  maxOccupancy: number;
  currentTenants: number;
  status: string;
  currentElectricityReading: number;
  lastReading: number;
  vacatingOn: string[];
  date: string;
  unitsUsed: number;
  electricityBill: number;
  isVacatingThisMonth: boolean;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const TenantManagement = () => {
  const [tenantData, setTenantData] = useState<TenantManagementData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  useEffect(() => {
    processTenantData();
  }, []);

  const processTenantData = () => {
    try {
      setLoading(true);
      
      // Group tenants by room
      const roomGroups = new Map<string, any[]>();
      
      // Use the tenant data from the imported file
      tenantData.forEach((tenant: any) => {
        if (!roomGroups.has(tenant.roomNumber)) {
          roomGroups.set(tenant.roomNumber, []);
        }
        roomGroups.get(tenant.roomNumber)!.push(tenant);
      });

      const processedData: TenantManagementData[] = [];

      roomGroups.forEach((tenants, roomNo) => {
        const activeTenants = tenants.filter(t => t.name !== 'Vacant');
        const roomType = tenants[0].roomType;
        const maxOccupancy = getMaxOccupancy(roomType);
        const currentTenants = activeTenants.length;
        
        // Get electricity readings (use the highest reading for the room)
        const currentReading = Math.max(...tenants.map(t => t.currentReading || 0));
        const lastReading = Math.max(...tenants.map(t => t.lastReading || 0));
        
        // Calculate electricity bill based on sharing logic
        const unitsUsed = currentReading - lastReading;
        const electricityBill = calculateElectricityBill(unitsUsed, roomType, currentTenants);
        
        // Check if any tenant is vacating this month
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const isVacatingThisMonth = tenants.some(t => {
          if (!t.vacantDate) return false;
          const vacantDate = new Date(t.vacantDate.split('-').reverse().join('-'));
          return vacantDate.getMonth() === currentMonth && vacantDate.getFullYear() === currentYear;
        });

        const tenantManagementData: TenantManagementData = {
          roomNo,
          tenantNames: activeTenants.map(t => t.name),
          dateOfJoining: activeTenants.map(t => t.joiningDate),
          roomType,
          maxOccupancy,
          currentTenants,
          status: currentTenants === 0 ? 'Vacant' : currentTenants === maxOccupancy ? 'Full' : 'Partially Occupied',
          currentElectricityReading: currentReading,
          lastReading,
          vacatingOn: tenants.filter(t => t.vacantDate).map(t => t.vacantDate),
          date: new Date().toLocaleDateString('en-IN'),
          unitsUsed,
          electricityBill,
          isVacatingThisMonth
        };

        processedData.push(tenantManagementData);
      });

      setTenantData(processedData);
    } catch (error) {
      console.error('Error processing tenant data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMaxOccupancy = (roomType: string): number => {
    switch (roomType) {
      case 'Single': return 1;
      case 'Double': return 2;
      case 'Triple': return 3;
      default: return 1;
    }
  };

  const calculateElectricityBill = (unitsUsed: number, roomType: string, currentTenants: number): number => {
    const ratePerUnit = 12;
    
    if (unitsUsed <= 0) return 0;

    switch (roomType) {
      case 'Single':
        return unitsUsed * ratePerUnit;
      
      case 'Double':
        if (currentTenants === 1) {
          return unitsUsed * ratePerUnit; // Full charge to one tenant
        } else {
          return (unitsUsed * ratePerUnit) / 2; // Split between 2 tenants
        }
      
      case 'Triple':
        if (currentTenants === 1) {
          return unitsUsed * ratePerUnit; // Full charge to one tenant
        } else if (currentTenants === 2) {
          return (unitsUsed * ratePerUnit) / 2; // Split between 2 tenants
        } else {
          return (unitsUsed * ratePerUnit) / 3; // Split between 3 tenants
        }
      
      default:
        return unitsUsed * ratePerUnit;
    }
  };

  const toggleRowExpansion = (roomNo: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(roomNo)) {
      newExpandedRows.delete(roomNo);
    } else {
      newExpandedRows.add(roomNo);
    }
    setExpandedRows(newExpandedRows);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const filteredAndSortedData = tenantData
    .filter(room => {
      const matchesSearch = room.roomNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           room.tenantNames.some(name => name.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesType = !filterType || room.roomType.toLowerCase() === filterType.toLowerCase();
      const matchesStatus = !filterStatus || room.status.toLowerCase() === filterStatus.toLowerCase();
      
      return matchesSearch && matchesType && matchesStatus;
    })
    .sort((a, b) => {
      if (!sortBy) return 0;
      
      let aValue: any = a[sortBy as keyof TenantManagementData];
      let bValue: any = b[sortBy as keyof TenantManagementData];
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return <SortAsc className="h-4 w-4 text-gray-400" />;
    return sortOrder === 'asc' ? <SortAsc className="h-4 w-4 text-blue-500" /> : <SortDesc className="h-4 w-4 text-blue-500" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tenant management data...</p>
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
        .animate-fadeIn { animation: fadeIn 0.6s ease-out; }
        .animate-slideUp { animation: slideUp 0.8s ease-out; }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8 animate-fadeIn">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tenant Management</h1>
              <p className="text-gray-600 mt-2">Comprehensive tenant and room management with electricity billing</p>
            </div>
            <div className="flex gap-3">
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                <Download className="h-4 w-4" />
                Export Data
              </button>
              <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                <FileText className="h-4 w-4" />
                Generate Report
              </button>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8 animate-slideUp">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by room number or tenant name..."
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
              <option value="">All Room Types</option>
              <option value="single">Single</option>
              <option value="double">Double</option>
              <option value="triple">Triple</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="vacant">Vacant</option>
              <option value="partially occupied">Partially Occupied</option>
              <option value="full">Full</option>
            </select>
          </div>
        </div>

        {/* Main Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-slideUp">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button 
                      onClick={() => handleSort('roomNo')}
                      className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                    >
                      Room No
                      {getSortIcon('roomNo')}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button 
                      onClick={() => handleSort('tenantNames')}
                      className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                    >
                      Tenant Names
                      {getSortIcon('tenantNames')}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date of Joining
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button 
                      onClick={() => handleSort('roomType')}
                      className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                    >
                      Room Type
                      {getSortIcon('roomType')}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Max Occupancy
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Tenants
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button 
                      onClick={() => handleSort('status')}
                      className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                    >
                      Status
                      {getSortIcon('status')}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Electricity Reading
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Reading
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Units Used
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Electricity Bill
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vacating On
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedData.map((room, index) => (
                  <React.Fragment key={room.roomNo}>
                    <tr 
                      className={`hover:bg-gray-50 transition-colors ${
                        room.isVacatingThisMonth ? 'bg-red-50 border-l-4 border-l-red-500' : ''
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Building className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="font-medium text-gray-900">{room.roomNo}</span>
                                                     {room.isVacatingThisMonth && (
                             <div className="relative group">
                               <AlertTriangle className="h-4 w-4 text-red-500 ml-2" />
                               <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                 Vacating this month
                               </div>
                             </div>
                           )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <div>
                            {room.tenantNames.length > 0 ? (
                              <div className="text-sm text-gray-900">
                                {room.tenantNames.slice(0, 2).join(', ')}
                                {room.tenantNames.length > 2 && (
                                  <span className="text-gray-500"> +{room.tenantNames.length - 2} more</span>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-500 italic">No tenants</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {room.dateOfJoining.length > 0 ? (
                          <div>
                            {room.dateOfJoining.slice(0, 2).join(', ')}
                            {room.dateOfJoining.length > 2 && (
                              <span className="text-gray-500"> +{room.dateOfJoining.length - 2} more</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          room.roomType === 'Single' ? 'bg-blue-100 text-blue-800' :
                          room.roomType === 'Double' ? 'bg-green-100 text-green-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {room.roomType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{room.maxOccupancy}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{room.currentTenants}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          room.status === 'Vacant' ? 'bg-red-100 text-red-800' :
                          room.status === 'Full' ? 'bg-green-100 text-green-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {room.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="flex items-center gap-1">
                          <Zap className="h-4 w-4 text-yellow-500" />
                          {room.currentElectricityReading}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{room.lastReading}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{room.unitsUsed}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        <div className="flex items-center gap-1">
                          <IndianRupee className="h-3 w-3" />
                          {formatCurrency(room.electricityBill)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {room.vacatingOn.length > 0 ? (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-red-500" />
                            <span className="text-red-600 font-medium">
                              {room.vacatingOn.slice(0, 2).join(', ')}
                              {room.vacatingOn.length > 2 && (
                                <span> +{room.vacatingOn.length - 2} more</span>
                              )}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleRowExpansion(room.roomNo)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                          >
                            {expandedRows.has(room.roomNo) ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </button>
                          <button className="text-gray-600 hover:text-gray-900 transition-colors">
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Expanded Row Details */}
                    {expandedRows.has(room.roomNo) && (
                      <tr className="bg-gray-50">
                        <td colSpan={13} className="px-6 py-4">
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <h4 className="font-semibold text-gray-900 mb-3">Detailed Information for Room {room.roomNo}</h4>
                            
                            {/* Tenant Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                              {room.tenantNames.map((name, index) => (
                                <div key={index} className="bg-gray-50 rounded-lg p-3">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium text-gray-900">{name}</span>
                                    <span className="text-xs text-gray-500">Tenant {index + 1}</span>
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    <div>Joining: {room.dateOfJoining[index]}</div>
                                    {room.vacatingOn[index] && (
                                      <div className="text-red-600">Vacating: {room.vacatingOn[index]}</div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Electricity Billing Details */}
                            <div className="bg-blue-50 rounded-lg p-4">
                              <h5 className="font-semibold text-blue-900 mb-2">Electricity Billing Calculation</h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-600">Room Type:</span>
                                  <span className="ml-2 font-medium">{room.roomType}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Current Tenants:</span>
                                  <span className="ml-2 font-medium">{room.currentTenants}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Units Used:</span>
                                  <span className="ml-2 font-medium">{room.unitsUsed}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Rate per Unit:</span>
                                  <span className="ml-2 font-medium">₹12</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Calculation:</span>
                                  <span className="ml-2 font-medium">
                                    {room.currentTenants === 1 ? 
                                      `${room.unitsUsed} × ₹12 = ${formatCurrency(room.electricityBill)}` :
                                      `${room.unitsUsed} × ₹12 ÷ ${room.currentTenants} = ${formatCurrency(room.electricityBill)}`
                                    }
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Total Bill:</span>
                                  <span className="ml-2 font-bold text-blue-900">{formatCurrency(room.electricityBill)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-8 animate-slideUp">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{filteredAndSortedData.length}</div>
              <div className="text-gray-600">Total Rooms</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {filteredAndSortedData.filter(r => r.status === 'Full').length}
              </div>
              <div className="text-gray-600">Fully Occupied</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {filteredAndSortedData.filter(r => r.isVacatingThisMonth).length}
              </div>
              <div className="text-gray-600">Vacating This Month</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(filteredAndSortedData.reduce((sum, r) => sum + r.electricityBill, 0))}
              </div>
              <div className="text-gray-600">Total Electricity Bill</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantManagement; 