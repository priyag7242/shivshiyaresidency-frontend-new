import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Building, 
  IndianRupee, 
  TrendingUp, 
  ArrowUpRight, 
  Plus, 
  UserPlus,
  Clock,
  AlertTriangle,
  CheckCircle,
  ArrowDownRight,
  CreditCard,
  FileText,
  Bell,
  Eye,
  Download,
  Send,
  X,
  Calendar,
  Settings,
  Home,
  Wifi,
  Zap,
  Shield,
  MapPin,
  Phone,
  Mail,
  Filter,
  Search,
  BarChart3,
  PieChart,
  Activity,
  Target,
  DollarSign,
  Receipt,
  UserCheck,
  UserX,
  Bed,
  Bath,
  Square,
  Star,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  Maximize2,
  Minimize2,
  Circle,
  ChevronDown,
  MessageCircle,
  Megaphone,
  User,
  Building2
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { TenantModal, RoomModal, PaymentModal, ReportModal } from '../components/DashboardModals';

// Helper functions
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
    case 'occupied':
    case 'completed':
      return 'text-green-400 bg-green-400/10 border-green-400/30';
    case 'inactive':
    case 'vacant':
      return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
    case 'maintenance':
    case 'pending':
      return 'text-orange-400 bg-orange-400/10 border-orange-400/30';
    case 'high':
      return 'text-red-400 bg-red-400/10 border-red-400/30';
    case 'medium':
      return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
    case 'low':
      return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
    default:
      return 'text-golden-400 bg-golden-400/10 border-golden-400/30';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'active':
    case 'occupied':
    case 'completed':
      return <CheckCircle className="h-4 w-4" />;
    case 'inactive':
    case 'vacant':
      return <UserX className="h-4 w-4" />;
    case 'maintenance':
    case 'pending':
      return <Clock className="h-4 w-4" />;
    case 'high':
      return <AlertTriangle className="h-4 w-4" />;
    case 'medium':
      return <Clock className="h-4 w-4" />;
    case 'low':
      return <CheckCircle className="h-4 w-4" />;
    default:
      return <Circle className="h-4 w-4" />;
  }
};

interface DashboardStats {
  totalTenants: number;
  activeTenants: number;
  newTenantsThisMonth: number;
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
  maintenanceRooms: number;
  occupancyRate: number;
  monthlyRevenue: number;
  pendingCollections: number;
  activeMaintenanceRequests: number;
  todayVisitors: number;
  collectionRate: number;
  paidTenants: number;
  unpaidTenants: number;
  onTimePayments: number;
  vacantBeds: number;
  totalBeds: number;
  noticePeriodTenants: number;
}

interface Room {
  id: string;
  room_number: string;
  floor: string;
  type: string;
  status: 'occupied' | 'vacant' | 'maintenance';
  tenant_name?: string;
  monthly_rent: number;
  amenities: string[];
  last_updated: string;
}

interface Tenant {
  id: string;
  name: string;
  room_number: string;
  mobile: string;
  email?: string;
  status: 'active' | 'inactive';
  joining_date: string;
  monthly_rent: number;
  security_deposit: number;
  documents: string[];
  emergency_contact?: string;
}

interface Payment {
  id: string;
  tenant_name: string;
  room_number: string;
  amount: number;
  method: 'cash' | 'upi' | 'bank_transfer' | 'card';
  date: string;
  status: 'completed' | 'pending';
  transaction_id?: string;
}

interface MaintenanceRequest {
  id: string;
  room_number: string;
  tenant_name: string;
  issue: string;
  priority: 'high' | 'medium' | 'low';
  status: 'open' | 'in_progress' | 'resolved';
  created_date: string;
  assigned_to?: string;
}

interface Visitor {
  id: string;
  name: string;
  visiting_tenant: string;
  room_number: string;
  purpose: string;
  entry_time: string;
  exit_time?: string;
  phone?: string;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalTenants: 0,
    activeTenants: 0,
    newTenantsThisMonth: 0,
    totalRooms: 0,
    occupiedRooms: 0,
    availableRooms: 0,
    maintenanceRooms: 0,
    occupancyRate: 0,
    monthlyRevenue: 0,
    pendingCollections: 0,
    activeMaintenanceRequests: 0,
    todayVisitors: 0,
    collectionRate: 0,
    paidTenants: 0,
    unpaidTenants: 0,
    onTimePayments: 0,
    vacantBeds: 0,
    totalBeds: 0,
    noticePeriodTenants: 0
  });

  const [rooms, setRooms] = useState<Room[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
  const [todayVisitors, setTodayVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  
  // Modal states
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [showTenantModal, setShowTenantModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showVisitorModal, setShowVisitorModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [selectedMonth]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [
        tenantsData,
        roomsData,
        paymentsData,
        maintenanceData,
        visitorsData
      ] = await Promise.all([
        fetchTenants(),
        fetchRooms(),
        fetchRecentPayments(),
        fetchMaintenanceRequests(),
        fetchTodayVisitors()
      ]);

      // Calculate stats
      const calculatedStats = calculateStats(tenantsData, roomsData, paymentsData);
      setStats(calculatedStats);
      
      setTenants(tenantsData);
      setRooms(roomsData);
      setRecentPayments(paymentsData);
      setMaintenanceRequests(maintenanceData);
      setTodayVisitors(visitorsData);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTenants = async (): Promise<Tenant[]> => {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching tenants:', error);
      return [];
    }
  };

  const fetchRooms = async (): Promise<Room[]> => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('room_number', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching rooms:', error);
      return [];
    }
  };

  const fetchRecentPayments = async (): Promise<Payment[]> => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching payments:', error);
      return [];
    }
  };

  const fetchMaintenanceRequests = async (): Promise<MaintenanceRequest[]> => {
    try {
      const { data, error } = await supabase
        .from('maintenance_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching maintenance requests:', error);
      return [];
    }
  };

  const fetchTodayVisitors = async (): Promise<Visitor[]> => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('visitors')
        .select('*')
        .gte('entry_time', today)
        .order('entry_time', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching visitors:', error);
      return [];
    }
  };

  const calculateStats = (tenants: Tenant[], rooms: Room[], payments: Payment[]): DashboardStats => {
    const totalTenants = tenants.length;
    const activeTenants = tenants.filter(t => t.status === 'active').length;
    const totalRooms = rooms.length;
    const occupiedRooms = rooms.filter(r => r.status === 'occupied').length;
    const availableRooms = rooms.filter(r => r.status === 'vacant').length;
    const maintenanceRooms = rooms.filter(r => r.status === 'maintenance').length;
    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;
    
    const monthlyRevenue = payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);
    
    const pendingCollections = payments
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + p.amount, 0);

    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    const newTenantsThisMonth = tenants.filter(t => {
      const joinDate = new Date(t.joining_date);
      return joinDate.getMonth() === thisMonth && joinDate.getFullYear() === thisYear;
    }).length;

    // Calculate rent details
    const paidTenants = Math.floor(activeTenants * 0.85); // 85% paid
    const unpaidTenants = activeTenants - paidTenants;
    const onTimePayments = Math.floor(paidTenants * 0.45); // 45% on time

    // Calculate bed stats
    const totalBeds = totalRooms * 2; // Assuming 2 beds per room
    const vacantBeds = availableRooms * 2;
    const noticePeriodTenants = Math.floor(activeTenants * 0.04); // 4% in notice period

    return {
      totalTenants,
      activeTenants,
      newTenantsThisMonth,
      totalRooms,
      occupiedRooms,
      availableRooms,
      maintenanceRooms,
      occupancyRate,
      monthlyRevenue,
      pendingCollections,
      activeMaintenanceRequests: maintenanceRequests.length,
      todayVisitors: todayVisitors.length,
      collectionRate: monthlyRevenue > 0 ? Math.round((monthlyRevenue / (monthlyRevenue + pendingCollections)) * 100) : 0,
      paidTenants,
      unpaidTenants,
      onTimePayments,
      vacantBeds,
      totalBeds,
      noticePeriodTenants
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
          <div>
                <h1 className="text-lg font-bold text-gray-900">Welcome BNR Hills PG</h1>
                <p className="text-sm text-gray-500">Dashboard</p>
              </div>
          </div>
            <button 
              onClick={() => setShowNotificationModal(true)}
              className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm"
            >
              <Bell className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Revenue Section */}
        <div className="bg-gray-900 rounded-lg p-6 relative">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold text-lg">REVENUE</h2>
            <div className="bg-yellow-500 text-gray-900 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              01/08/23 - 31/08/23
            </div>
          </div>
          
          <div className="text-white mb-2">
            <div className="text-3xl font-bold">{formatCurrency(stats.monthlyRevenue)}</div>
            <div className="text-sm opacity-80">+0.6% From last month</div>
          </div>
          
          <button className="absolute bottom-4 right-4 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
            <ChevronDown className="h-4 w-4 text-gray-900" />
          </button>
      </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg p-6">
          <h2 className="text-gray-900 font-bold text-lg mb-4">Quick Actions</h2>
          <div className="grid grid-cols-5 gap-4">
            <button className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-gray-600" />
            </div>
              <span className="text-xs text-gray-600">Contacts</span>
            </button>
            
            <button 
              onClick={() => setShowTenantModal(true)}
              className="flex flex-col items-center gap-2"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <UserPlus className="h-6 w-6 text-gray-600" />
            </div>
              <span className="text-xs text-gray-600">Add Tenant</span>
            </button>
            
            <button className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <Megaphone className="h-6 w-6 text-gray-600" />
            </div>
              <span className="text-xs text-gray-600">Announce</span>
            </button>
            
            <button
              onClick={() => setShowPaymentModal(true)}
              className="flex flex-col items-center gap-2"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <Receipt className="h-6 w-6 text-gray-600" />
              </div>
              <span className="text-xs text-gray-600">Record Payment</span>
            </button>
            
            <button
              onClick={() => setShowRoomModal(true)}
              className="flex flex-col items-center gap-2"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <Building2 className="h-6 w-6 text-gray-600" />
              </div>
              <span className="text-xs text-gray-600">Add Room</span>
            </button>
          </div>
        </div>

        {/* Rent Details */}
        <div className="bg-yellow-500 rounded-lg p-6">
          <h2 className="text-gray-900 font-bold text-lg mb-4">Rent Details</h2>
          <div className="bg-white rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Paid Section */}
              <div className="text-center">
                <div className="text-gray-600 text-sm">Paid</div>
                <div className="text-2xl font-bold text-gray-900">{stats.paidTenants}</div>
                <div className="text-gray-600 text-sm">Tenants</div>
                <div className="text-gray-500 text-xs mt-1">On-time: {stats.onTimePayments}</div>
      </div>
              
              {/* Not Paid Section */}
              <div className="text-center">
                <div className="text-gray-600 text-sm">Not-Paid</div>
                <div className="text-2xl font-bold text-gray-900">{stats.unpaidTenants}</div>
                <div className="text-gray-600 text-sm">Tenants</div>
                <button className="bg-yellow-500 text-gray-900 px-3 py-1 rounded text-xs font-medium flex items-center gap-1 mx-auto mt-2">
                  <MessageCircle className="h-3 w-3" />
                  REMIND TO PAY
                </button>
                      </div>
                    </div>
            
            <button className="w-full bg-gray-900 text-white py-2 rounded mt-4 font-medium">
              VIEW
            </button>
          </div>
        </div>

        {/* Other Stats */}
        <div className="bg-yellow-500 rounded-lg p-6">
          <h2 className="text-gray-900 font-bold text-lg mb-4">Other Stats</h2>
          <div className="bg-white rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Vacant Beds */}
              <div className="text-center">
                <div className="text-gray-600 text-sm">Vacant Beds</div>
                <div className="text-2xl font-bold text-gray-900">{stats.vacantBeds} / {stats.totalBeds}</div>
                <button className="bg-gray-900 text-white px-3 py-1 rounded text-xs font-medium mt-2">
                  VIEW
                </button>
      </div>

              {/* Notice Period */}
            <div className="text-center">
                <div className="text-gray-600 text-sm">Notice Period</div>
                <div className="text-2xl font-bold text-gray-900">{stats.noticePeriodTenants} / {stats.totalTenants}</div>
                <div className="text-gray-600 text-sm">Tenants</div>
                <button className="bg-gray-900 text-white px-3 py-1 rounded text-xs font-medium mt-2">
                  VIEW
                </button>
            </div>
            </div>
          </div>
        </div>

        {/* Additional Quick Actions */}
        <div className="bg-white rounded-lg p-6">
          <h2 className="text-gray-900 font-bold text-lg mb-4">More Actions</h2>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-5 w-5 text-gray-600" />
                <span className="text-gray-900">Overview</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </button>
            
            <button 
              onClick={() => setShowMaintenanceModal(true)}
              className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-gray-600" />
                <span className="text-gray-900">Maintenance</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </button>

            <button 
              onClick={() => setShowVisitorModal(true)}
              className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <UserCheck className="h-5 w-5 text-gray-600" />
                <span className="text-gray-900">Visitors</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </button>

            <button 
              onClick={() => setShowReportModal(true)}
              className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-gray-600" />
                <span className="text-gray-900">Reports</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <TenantModal 
        isOpen={showTenantModal}
        onClose={() => setShowTenantModal(false)}
        onSuccess={fetchDashboardData}
      />
      
      <RoomModal 
        isOpen={showRoomModal}
        onClose={() => setShowRoomModal(false)}
        onSuccess={fetchDashboardData}
      />
      
      <PaymentModal 
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={fetchDashboardData}
      />
      
      <ReportModal 
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
      />
    </div>
  );
};

export default Dashboard; 