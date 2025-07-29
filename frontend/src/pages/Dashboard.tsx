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
  Circle
} from 'lucide-react';
import { supabase } from '../lib/supabase';

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
    collectionRate: 0
  });

  const [rooms, setRooms] = useState<Room[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
  const [todayVisitors, setTodayVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
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
  }, []);

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
      collectionRate: monthlyRevenue > 0 ? Math.round((monthlyRevenue / (monthlyRevenue + pendingCollections)) * 100) : 0
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-golden-500 mx-auto mb-4"></div>
          <p className="text-golden-400 text-lg">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

    return (
    <div className="min-h-screen bg-dark-950">
      {/* Header */}
      <div className="bg-dark-900 border-b border-golden-600/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-golden-400 mb-2">Dashboard</h1>
            <p className="text-golden-300">Welcome to Shiv Shiva Residency Management System</p>
          </div>
            <div className="mt-4 lg:mt-0 flex flex-wrap gap-3">
              <button
                onClick={() => setShowTenantModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <UserPlus className="h-4 w-4" />
              Add Tenant
              </button>
              <button
                onClick={() => setShowPaymentModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
              Record Payment
              </button>
              <button
                onClick={() => setShowReportModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <FileText className="h-4 w-4" />
                Generate Report
              </button>
              </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <OverviewCard
            title="Total Tenants"
            value={stats.totalTenants}
            change={`+${stats.newTenantsThisMonth} this month`}
            icon={<Users className="h-6 w-6" />}
            color="blue"
            link="/tenants"
          />
          <OverviewCard
            title="Occupancy Rate"
            value={`${stats.occupancyRate}%`}
            change={`${stats.occupiedRooms}/${stats.totalRooms} rooms`}
            icon={<Building className="h-6 w-6" />}
            color="purple"
            link="/rooms"
          />
          <OverviewCard
            title="Monthly Revenue"
            value={formatCurrency(stats.monthlyRevenue)}
            change={`${stats.collectionRate}% collected`}
            icon={<IndianRupee className="h-6 w-6" />}
            color="green"
            link="/payments"
          />
          <OverviewCard
            title="Pending Collections"
            value={formatCurrency(stats.pendingCollections)}
            change="Requires attention"
            icon={<Clock className="h-6 w-6" />}
            color="orange"
            link="/payments"
          />
            </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <QuickStatCard
            title="Maintenance Requests"
            value={stats.activeMaintenanceRequests}
            icon={<AlertTriangle className="h-5 w-5" />}
            color="red"
            link="/maintenance"
          />
          <QuickStatCard
            title="Today's Visitors"
            value={stats.todayVisitors}
            icon={<Users className="h-5 w-5" />}
            color="purple"
            link="/visitors"
          />
          <QuickStatCard
            title="Available Rooms"
            value={stats.availableRooms}
            icon={<Home className="h-5 w-5" />}
            color="blue"
            link="/rooms"
          />
            </div>

        {/* Main Content Tabs */}
        <div className="bg-dark-900 border border-golden-600/20 rounded-lg overflow-hidden">
          <div className="border-b border-golden-600/20">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', name: 'Overview', icon: <BarChart3 className="h-4 w-4" /> },
                { id: 'rooms', name: 'Room Management', icon: <Building className="h-4 w-4" /> },
                { id: 'tenants', name: 'Tenant Management', icon: <Users className="h-4 w-4" /> },
                { id: 'payments', name: 'Payment Tracking', icon: <CreditCard className="h-4 w-4" /> },
                { id: 'maintenance', name: 'Maintenance', icon: <AlertTriangle className="h-4 w-4" /> },
                { id: 'visitors', name: 'Visitors', icon: <UserCheck className="h-4 w-4" /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-golden-500 text-golden-400'
                      : 'border-transparent text-golden-300 hover:text-golden-400'
                  }`}
                >
                  {tab.icon}
                  {tab.name}
                </button>
              ))}
            </nav>
            </div>

          <div className="p-6">
            {activeTab === 'overview' && <OverviewTab stats={stats} recentPayments={recentPayments} />}
            {activeTab === 'rooms' && <RoomsTab rooms={rooms} onAddRoom={() => setShowRoomModal(true)} />}
            {activeTab === 'tenants' && <TenantsTab tenants={tenants} onAddTenant={() => setShowTenantModal(true)} />}
            {activeTab === 'payments' && <PaymentsTab payments={recentPayments} onAddPayment={() => setShowPaymentModal(true)} />}
            {activeTab === 'maintenance' && <MaintenanceTab requests={maintenanceRequests} onAddRequest={() => setShowMaintenanceModal(true)} />}
            {activeTab === 'visitors' && <VisitorsTab visitors={todayVisitors} onAddVisitor={() => setShowVisitorModal(true)} />}
            </div>
            </div>
          </div>

      {/* Modals */}
      {/* Add your modal components here */}
            </div>
  );
};

// Overview Card Component
interface OverviewCardProps {
  title: string;
  value: string | number;
  change: string;
  icon: React.ReactNode;
  color: string;
  link: string;
}

const OverviewCard = ({ title, value, change, icon, color, link }: OverviewCardProps) => {
  const colorClasses = {
    blue: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
    purple: 'text-purple-400 bg-purple-400/10 border-purple-400/30',
    green: 'text-green-400 bg-green-400/10 border-green-400/30',
    orange: 'text-orange-400 bg-orange-400/10 border-orange-400/30',
    red: 'text-red-400 bg-red-400/10 border-red-400/30'
  };

  return (
        <Link 
      to={link}
      className="bg-dark-900 border border-golden-600/20 rounded-lg p-6 hover:bg-dark-800 hover:border-golden-500 transition-all duration-200 group"
        >
          <div className="flex items-center justify-between">
            <div>
          <p className="text-golden-300 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-golden-100 mt-1">{value}</p>
          <p className="text-golden-300 text-sm mt-1">{change}</p>
            </div>
        <div className={`p-3 rounded-full ${colorClasses[color as keyof typeof colorClasses]} group-hover:scale-110 transition-transform`}>
          {icon}
            </div>
          </div>
        </Link>
  );
};

// Quick Stat Card Component
interface QuickStatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  link: string;
}

const QuickStatCard = ({ title, value, icon, color, link }: QuickStatCardProps) => {
  const colorClasses = {
    blue: 'text-blue-400 bg-blue-400/10',
    purple: 'text-purple-400 bg-purple-400/10',
    green: 'text-green-400 bg-green-400/10',
    orange: 'text-orange-400 bg-orange-400/10',
    red: 'text-red-400 bg-red-400/10'
  };

  return (
        <Link 
      to={link}
      className="bg-dark-900 border border-golden-600/20 rounded-lg p-4 hover:bg-dark-800 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
          <p className="text-golden-300 text-sm">{title}</p>
          <p className="text-xl font-bold text-golden-100">{value}</p>
            </div>
        <div className={`p-2 rounded-full ${colorClasses[color as keyof typeof colorClasses]}`}>
          {icon}
            </div>
          </div>
        </Link>
  );
};

// Tab Components
const OverviewTab = ({ stats, recentPayments }: { stats: DashboardStats; recentPayments: Payment[] }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-dark-800 border border-golden-600/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-golden-400 mb-4">Revenue Trend</h3>
        <div className="h-64 flex items-center justify-center text-golden-300">
          Chart placeholder - Revenue trend over 6 months
            </div>
            </div>
      <div className="bg-dark-800 border border-golden-600/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-golden-400 mb-4">Occupancy Trend</h3>
        <div className="h-64 flex items-center justify-center text-golden-300">
          Chart placeholder - Occupancy trend over 6 months
          </div>
          </div>
        </div>

    <div className="bg-dark-800 border border-golden-600/20 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-golden-400 mb-4">Recent Payments</h3>
      <div className="space-y-3">
        {recentPayments.slice(0, 5).map((payment) => (
          <div key={payment.id} className="flex items-center justify-between p-3 bg-dark-900 rounded-lg">
            <div>
              <p className="text-golden-100 font-medium">{payment.tenant_name}</p>
              <p className="text-golden-300 text-sm">Room {payment.room_number}</p>
            </div>
            <div className="text-right">
              <p className="text-green-400 font-semibold">{formatCurrency(payment.amount)}</p>
              <p className="text-golden-300 text-sm capitalize">{payment.method}</p>
            </div>
          </div>
        ))}
                    </div>
                  </div>
                </div>
              );

const RoomsTab = ({ rooms, onAddRoom }: { rooms: Room[]; onAddRoom: () => void }) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-semibold text-golden-400">Room Management</h3>
      <button
        onClick={onAddRoom}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Plus className="h-4 w-4" />
        Add Room
      </button>
                </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {rooms.map((room) => (
        <RoomCard key={room.id} room={room} />
            ))}
          </div>
        </div>
);

const TenantsTab = ({ tenants, onAddTenant }: { tenants: Tenant[]; onAddTenant: () => void }) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-semibold text-golden-400">Tenant Management</h3>
      <button
        onClick={onAddTenant}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Plus className="h-4 w-4" />
        Add Tenant
      </button>
        </div>

    <div className="bg-dark-800 border border-golden-600/20 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-dark-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-golden-300 uppercase tracking-wider">Tenant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-golden-300 uppercase tracking-wider">Room</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-golden-300 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-golden-300 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-golden-300 uppercase tracking-wider">Rent</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-golden-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-golden-600/20">
            {tenants.map((tenant) => (
              <tr key={tenant.id} className="hover:bg-dark-900">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-golden-100">{tenant.name}</div>
                    <div className="text-sm text-golden-300">Joined {formatDate(tenant.joining_date)}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-golden-300">Room {tenant.room_number}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-golden-300">{tenant.mobile}</div>
                  {tenant.email && <div className="text-sm text-golden-400">{tenant.email}</div>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(tenant.status)}`}>
                    {getStatusIcon(tenant.status)}
                    <span className="ml-1 capitalize">{tenant.status}</span>
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-golden-300">{formatCurrency(tenant.monthly_rent)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-golden-400 hover:text-golden-300 mr-3">Edit</button>
                  <button className="text-red-400 hover:text-red-300">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
                    </div>
                  </div>
                </div>
              );

const PaymentsTab = ({ payments, onAddPayment }: { payments: Payment[]; onAddPayment: () => void }) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-semibold text-golden-400">Payment Tracking</h3>
      <button
        onClick={onAddPayment}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
      >
        <Plus className="h-4 w-4" />
        Record Payment
      </button>
              </div>
    
    <div className="bg-dark-800 border border-golden-600/20 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-dark-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-golden-300 uppercase tracking-wider">Tenant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-golden-300 uppercase tracking-wider">Room</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-golden-300 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-golden-300 uppercase tracking-wider">Method</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-golden-300 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-golden-300 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-golden-600/20">
            {payments.map((payment) => (
              <tr key={payment.id} className="hover:bg-dark-900">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-golden-100">{payment.tenant_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-golden-300">Room {payment.room_number}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400 font-semibold">{formatCurrency(payment.amount)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-golden-300 capitalize">{payment.method}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-golden-300">{formatDate(payment.date)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                    {getStatusIcon(payment.status)}
                    <span className="ml-1 capitalize">{payment.status}</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
              </div>
              </div>
              </div>
);

const MaintenanceTab = ({ requests, onAddRequest }: { requests: MaintenanceRequest[]; onAddRequest: () => void }) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-semibold text-golden-400">Maintenance Requests</h3>
            <button 
        onClick={onAddRequest}
        className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
      >
        <Plus className="h-4 w-4" />
        Add Request
            </button>
      </div>

    <div className="space-y-4">
      {requests.map((request) => (
        <div key={request.id} className="bg-dark-800 border border-golden-600/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
          <div>
              <h4 className="text-golden-100 font-medium">{request.issue}</h4>
              <p className="text-golden-300 text-sm">Room {request.room_number} - {request.tenant_name}</p>
              <p className="text-golden-400 text-sm">Created {formatDate(request.created_date)}</p>
                  </div>
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.priority)}`}>
                {getStatusIcon(request.priority)}
                <span className="ml-1 capitalize">{request.priority}</span>
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                {getStatusIcon(request.status)}
                <span className="ml-1 capitalize">{request.status}</span>
              </span>
            </div>
          </div>
            </div>
      ))}
            </div>
          </div>
);

const VisitorsTab = ({ visitors, onAddVisitor }: { visitors: Visitor[]; onAddVisitor: () => void }) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-semibold text-golden-400">Today's Visitors</h3>
            <button
        onClick={onAddVisitor}
        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
        <Plus className="h-4 w-4" />
        Add Visitor
            </button>
    </div>
    
    <div className="space-y-4">
      {visitors.map((visitor) => (
        <div key={visitor.id} className="bg-dark-800 border border-golden-600/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-golden-100 font-medium">{visitor.name}</h4>
              <p className="text-golden-300 text-sm">Visiting {visitor.visiting_tenant} (Room {visitor.room_number})</p>
              <p className="text-golden-400 text-sm">Purpose: {visitor.purpose}</p>
              <p className="text-golden-400 text-sm">Entry: {new Date(visitor.entry_time).toLocaleTimeString()}</p>
            </div>
            <div className="text-right">
              {visitor.exit_time ? (
                <span className="text-green-400 text-sm">Exited: {new Date(visitor.exit_time).toLocaleTimeString()}</span>
              ) : (
                <span className="text-orange-400 text-sm">Currently Inside</span>
              )}
          </div>
        </div>
        </div>
      ))}
      </div>
    </div>
  );

// Room Card Component
const RoomCard = ({ room }: { room: Room }) => (
  <div className="bg-dark-800 border border-golden-600/20 rounded-lg p-4 hover:bg-dark-900 transition-colors">
    <div className="flex items-center justify-between mb-3">
      <h4 className="text-golden-100 font-medium">Room {room.room_number}</h4>
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(room.status)}`}>
        {getStatusIcon(room.status)}
        <span className="ml-1 capitalize">{room.status}</span>
      </span>
        </div>

    <div className="space-y-2 text-sm">
      <div className="flex justify-between">
        <span className="text-golden-300">Floor:</span>
        <span className="text-golden-100">{room.floor}</span>
                  </div>
      <div className="flex justify-between">
        <span className="text-golden-300">Type:</span>
        <span className="text-golden-100">{room.type}</span>
            </div>
      <div className="flex justify-between">
        <span className="text-golden-300">Rent:</span>
        <span className="text-golden-100">{formatCurrency(room.monthly_rent)}</span>
          </div>
      {room.tenant_name && (
        <div className="flex justify-between">
          <span className="text-golden-300">Tenant:</span>
          <span className="text-golden-100">{room.tenant_name}</span>
                  </div>
      )}
          </div>

    <div className="mt-4 flex gap-2">
      <button className="flex-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors">
        Edit
            </button>
      <button className="flex-1 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors">
        Delete
            </button>
      </div>
    </div>
  );

export default Dashboard; 