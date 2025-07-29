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
  Building2,
  ChevronUp
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

const formatDisplayDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit'
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

// Animated Revenue Chart Component
const RevenueChart = ({ 
  data, 
  selectedPeriod, 
  selectedYear, 
  onYearChange, 
  yearOptions 
}: { 
  data: { month: string; revenue: number }[]; 
  selectedPeriod: string;
  selectedYear: string;
  onYearChange: (year: string) => void;
  yearOptions: { value: string; label: string }[];
}) => {
  const maxRevenue = Math.max(...data.map(d => d.revenue));
  const minRevenue = Math.min(...data.map(d => d.revenue));
  const range = maxRevenue - minRevenue;
  
  return (
    <div className="mt-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
        <div className="flex gap-2">
          {['Weekly', 'Monthly', 'Yearly'].map((period) => (
            <button
              key={period}
              className={`px-3 py-1 rounded text-sm font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                selectedPeriod === period
                  ? 'bg-yellow-500 text-gray-900 shadow-lg'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:shadow-md'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
        <select 
          value={selectedYear}
          onChange={(e) => onYearChange(e.target.value)}
          className="bg-gray-700 text-gray-300 px-3 py-1 rounded text-sm border-none w-full sm:w-auto transition-all duration-300 hover:bg-gray-600 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
        >
          {yearOptions.map((year) => (
            <option key={year.value} value={year.value}>
              {year.label}
            </option>
          ))}
        </select>
      </div>
      
      <div className="relative h-48 sm:h-64 bg-gray-800 rounded-lg p-4 animate-slideUp">
        <div className="absolute inset-4">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-400">
            <span className="animate-fadeIn" style={{ animationDelay: '0.1s' }}>₹100k</span>
            <span className="animate-fadeIn" style={{ animationDelay: '0.2s' }}>₹80k</span>
            <span className="animate-fadeIn" style={{ animationDelay: '0.3s' }}>₹60k</span>
            <span className="animate-fadeIn" style={{ animationDelay: '0.4s' }}>₹40k</span>
            <span className="animate-fadeIn" style={{ animationDelay: '0.5s' }}>₹20k</span>
            <span className="animate-fadeIn" style={{ animationDelay: '0.6s' }}>₹0</span>
          </div>
          
          {/* Chart area */}
          <div className="absolute left-8 right-0 top-0 bottom-0">
            <svg width="100%" height="100%" className="overflow-visible">
              {/* Grid lines */}
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <line
                  key={i}
                  x1="0"
                  y1={i * 20}
                  x2="100%"
                  y2={i * 20}
                  stroke="#374151"
                  strokeWidth="1"
                  opacity="0.3"
                  className="animate-fadeIn"
                  style={{ animationDelay: `${0.1 * i}s` }}
                />
              ))}
              
              {/* Area chart */}
              <defs>
                <linearGradient id="revenueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.1" />
                </linearGradient>
              </defs>
              
              <path
                d={data.map((point, index) => {
                  const x = (index / (data.length - 1)) * 100;
                  const y = 100 - ((point.revenue - minRevenue) / range) * 80;
                  return `${index === 0 ? 'M' : 'L'} ${x}% ${y}%`;
                }).join(' ')}
                fill="url(#revenueGradient)"
                stroke="#F59E0B"
                strokeWidth="2"
                className="animate-drawPath"
                style={{ animationDelay: '0.5s' }}
              />
              
              {/* Data points */}
              {data.map((point, index) => {
                const x = (index / (data.length - 1)) * 100;
                const y = 100 - ((point.revenue - minRevenue) / range) * 80;
                return (
                  <circle
                    key={index}
                    cx={`${x}%`}
                    cy={`${y}%`}
                    r="3"
                    fill="#F59E0B"
                    className="animate-pulse hover:r-4 transition-all duration-300 cursor-pointer"
                    style={{ animationDelay: `${0.6 + index * 0.1}s` }}
                  />
                );
              })}
            </svg>
            
            {/* X-axis labels */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-400 mt-2">
              {data.map((point, index) => (
                <span key={index} className="animate-fadeIn" style={{ animationDelay: `${0.7 + index * 0.1}s` }}>
                  {point.month}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* September highlight */}
      <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg animate-bounceIn">
        <div className="text-yellow-400 text-sm font-medium">September Highlight</div>
        <div className="text-white text-lg font-bold animate-countUp">₹84,256</div>
      </div>
    </div>
  );
};

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
  const [isRevenueExpanded, setIsRevenueExpanded] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('Monthly');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchDashboardData();
    setTimeout(() => setIsRefreshing(false), 1000);
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

  const handleFullReport = () => {
    // Simulate downloading Excel report with animation
    const button = document.querySelector('.report-button');
    if (button) {
      button.classList.add('animate-pulse');
      setTimeout(() => {
        button.classList.remove('animate-pulse');
        alert('Downloading full revenue report as Excel file...');
      }, 1000);
    }
  };

  // Sample chart data with extended range from 2021
  const chartData = [
    { month: 'Jan', revenue: 42000 },
    { month: 'Feb', revenue: 48000 },
    { month: 'Mar', revenue: 45000 },
    { month: 'Apr', revenue: 52000 },
    { month: 'May', revenue: 55000 },
    { month: 'Jun', revenue: 58000 },
    { month: 'Jul', revenue: 62000 },
    { month: 'Aug', revenue: 68000 },
    { month: 'Sep', revenue: 84256 },
    { month: 'Oct', revenue: 78000 },
    { month: 'Nov', revenue: 82000 },
    { month: 'Dec', revenue: 88000 }
  ];

  // Extended year options starting from 2021
  const yearOptions = [
    { value: '2025', label: '2025' },
    { value: '2024', label: '2024' },
    { value: '2023', label: '2023' },
    { value: '2022', label: '2022' },
    { value: '2021', label: '2021' }
  ];

  const [selectedYear, setSelectedYear] = useState('2023');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState({
    start: '2023-08-01',
    end: '2023-08-31'
  });

  const handleDateRangeClick = () => {
    setShowDatePicker(!showDatePicker);
  };

  const handleDateRangeSelect = (start: string, end: string) => {
    setSelectedDateRange({ start, end });
    setShowDatePicker(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg animate-pulse">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

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
        
        @keyframes drawPath {
          from { stroke-dasharray: 1000; stroke-dashoffset: 1000; }
          to { stroke-dasharray: 1000; stroke-dashoffset: 0; }
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
        
        .animate-drawPath {
          animation: drawPath 2s ease-out forwards;
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
        
        .card-enter {
          animation: fadeIn 0.6s ease-out forwards;
        }
        
        .stat-card {
          animation: fadeIn 0.6s ease-out forwards;
        }
        
        .stat-card:nth-child(1) { animation-delay: 0.1s; }
        .stat-card:nth-child(2) { animation-delay: 0.2s; }
        .stat-card:nth-child(3) { animation-delay: 0.3s; }
        .stat-card:nth-child(4) { animation-delay: 0.4s; }
      `}</style>

      {/* Top Navigation Bar */}
      <div className="bg-gray-900 text-yellow-500 px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-sm sm:text-base font-medium">
            Welcome back, Administrator
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <button className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-500 rounded-full flex items-center justify-center hover:bg-yellow-400 transition-all duration-300">
              <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-gray-900" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-gray-900" />
              </div>
              <span className="text-sm sm:text-base font-medium">admin</span>
              <ChevronDown className="h-4 w-4 text-yellow-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Column - Revenue and Quick Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Revenue Section - Expandable */}
            <div className={`bg-gray-900 rounded-xl p-4 sm:p-6 relative transition-all duration-500 ease-in-out hover-lift ${isRevenueExpanded ? 'min-h-[500px]' : ''}`}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4">
                <h2 className="text-white font-bold text-lg sm:text-xl">REVENUE</h2>
                <button 
                  onClick={handleDateRangeClick}
                  className="bg-yellow-500 text-gray-900 px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2 hover:bg-yellow-400 transition-all duration-300 hover-lift cursor-pointer"
                >
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">{formatDisplayDate(selectedDateRange.start)} - {formatDisplayDate(selectedDateRange.end)}</span>
                  <span className="sm:hidden">{formatDisplayDate(selectedDateRange.start)}</span>
                </button>
              </div>

              <div className="text-white mb-4">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold animate-countUp">{formatCurrency(stats.monthlyRevenue)}</div>
                <div className="text-sm sm:text-lg opacity-80 animate-fadeIn" style={{ animationDelay: '0.3s' }}>+0.6% From last month</div>
              </div>

              {/* Date Picker Modal */}
              {showDatePicker && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeInUp">
                  <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full animate-bounceIn">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900">Select Date Range</h3>
                      <button
                        onClick={() => setShowDatePicker(false)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="h-6 w-6" />
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                        <input
                          type="date"
                          value={selectedDateRange.start}
                          onChange={(e) => setSelectedDateRange(prev => ({ ...prev, start: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                        <input
                          type="date"
                          value={selectedDateRange.end}
                          onChange={(e) => setSelectedDateRange(prev => ({ ...prev, end: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={() => setShowDatePicker(false)}
                        className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => setShowDatePicker(false)}
                        className="flex-1 px-4 py-2 bg-yellow-500 text-gray-900 rounded-lg font-medium hover:bg-yellow-600 transition-colors"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Expanded Content */}
              {isRevenueExpanded && (
                <RevenueChart data={chartData} selectedPeriod={selectedPeriod} selectedYear={selectedYear} onYearChange={setSelectedYear} yearOptions={yearOptions} />
              )}
              
              {/* Action Buttons */}
              {isRevenueExpanded && (
                <div className="mt-6 animate-slideUp">
                  <button
                    onClick={handleFullReport}
                    className="report-button w-full bg-gray-900 text-white py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg hover:bg-gray-800 transition-all duration-300 hover-lift"
                  >
                    FULL REPORT
                  </button>
                </div>
              )}
              
              {/* Toggle Button */}
              <button 
                onClick={() => setIsRevenueExpanded(!isRevenueExpanded)}
                className={`absolute bottom-4 sm:bottom-6 right-4 sm:right-6 w-8 h-8 sm:w-10 sm:h-10 bg-yellow-500 rounded-full flex items-center justify-center transition-all duration-500 ease-in-out hover-lift ${
                  isRevenueExpanded ? 'rotate-180' : ''
                }`}
              >
                {isRevenueExpanded ? (
                  <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5 text-gray-900" />
                ) : (
                  <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-gray-900" />
                )}
              </button>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm hover-lift transition-all duration-300">
              <h2 className="text-gray-900 font-bold text-lg sm:text-xl mb-4 sm:mb-6">Quick Actions</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                <button 
                  onClick={() => setShowTenantModal(true)}
                  className="flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-300 group hover-lift animate-fadeIn"
                  style={{ animationDelay: '0.1s' }}
                >
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-all duration-300 group-hover:scale-110">
                    <UserPlus className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-gray-700 text-center">Add Tenant</span>
                </button>
                
                <button 
                  onClick={() => setShowPaymentModal(true)}
                  className="flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-300 group hover-lift animate-fadeIn"
                  style={{ animationDelay: '0.2s' }}
                >
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-all duration-300 group-hover:scale-110">
                    <Receipt className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-gray-700 text-center">Record Payment</span>
                </button>
                
                <button 
                  onClick={() => setShowRoomModal(true)}
                  className="flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-300 group hover-lift animate-fadeIn"
                  style={{ animationDelay: '0.3s' }}
                >
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-all duration-300 group-hover:scale-110">
                    <Building2 className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-gray-700 text-center">Add Room</span>
                </button>

                <button 
                  onClick={() => setShowMaintenanceModal(true)}
                  className="flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-300 group hover-lift animate-fadeIn"
                  style={{ animationDelay: '0.4s' }}
                >
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-orange-100 rounded-full flex items-center justify-center group-hover:bg-orange-200 transition-all duration-300 group-hover:scale-110">
                    <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-gray-700 text-center">Maintenance</span>
                </button>

                <button 
                  onClick={() => setShowReportModal(true)}
                  className="flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-300 group hover-lift animate-fadeIn col-span-2 sm:col-span-1"
                  style={{ animationDelay: '0.5s' }}
                >
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-indigo-100 rounded-full flex items-center justify-center group-hover:bg-indigo-200 transition-all duration-300 group-hover:scale-110">
                    <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-gray-700 text-center">Overview</span>
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm hover-lift transition-all duration-300 stat-card">
              <h2 className="text-gray-900 font-bold text-lg sm:text-xl mb-4 sm:mb-6">Quick Stats</h2>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-300 group hover-lift animate-fadeIn">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-all duration-300 group-hover:scale-110">
                    <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                  </div>
                  <div className="text-center">
                    <div className="text-xs sm:text-sm font-medium text-gray-700">Total Tenants</div>
                    <div className="text-lg sm:text-xl font-bold text-gray-900 animate-countUp">{stats.totalTenants}</div>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-300 group hover-lift animate-fadeIn">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-all duration-300 group-hover:scale-110">
                    <Building className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
                  </div>
                  <div className="text-center">
                    <div className="text-xs sm:text-sm font-medium text-gray-700">Occupancy Rate</div>
                    <div className="text-lg sm:text-xl font-bold text-gray-900 animate-countUp">{stats.occupancyRate}%</div>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-300 group hover-lift animate-fadeIn">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-orange-100 rounded-full flex items-center justify-center group-hover:bg-orange-200 transition-all duration-300 group-hover:scale-110">
                    <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
                  </div>
                  <div className="text-center">
                    <div className="text-xs sm:text-sm font-medium text-gray-700">Maintenance</div>
                    <div className="text-lg sm:text-xl font-bold text-gray-900 animate-countUp">{stats.activeMaintenanceRequests}</div>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-300 group hover-lift animate-fadeIn">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-all duration-300 group-hover:scale-110">
                    <UserCheck className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                  </div>
                  <div className="text-center">
                    <div className="text-xs sm:text-sm font-medium text-gray-700">Today's Visitors</div>
                    <div className="text-lg sm:text-xl font-bold text-gray-900 animate-countUp">{stats.todayVisitors}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Stats Cards */}
          <div className="space-y-6">
            {/* Rent Details */}
            <div className="bg-yellow-500 rounded-xl p-4 sm:p-6 hover-lift transition-all duration-300 stat-card">
              <h2 className="text-gray-900 font-bold text-lg sm:text-xl mb-4">Rent Details</h2>
              <div className="bg-white rounded-lg p-4 sm:p-6 hover-lift transition-all duration-300">
                <div className="grid grid-cols-2 gap-4 sm:gap-6">
                  {/* Paid Section */}
                  <div className="text-center">
                    <div className="text-gray-600 text-xs sm:text-sm font-medium">Paid</div>
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2 animate-countUp">{stats.paidTenants}</div>
                    <div className="text-gray-600 text-xs sm:text-sm">Tenants</div>
                    <div className="text-gray-500 text-xs mt-1 sm:mt-2">On-time: {stats.onTimePayments}</div>
                  </div>
                  
                  {/* Not Paid Section */}
                  <div className="text-center">
                    <div className="text-gray-600 text-xs sm:text-sm font-medium">Not-Paid</div>
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2 animate-countUp">{stats.unpaidTenants}</div>
                    <div className="text-gray-600 text-xs sm:text-sm">Tenants</div>
                    <button className="bg-yellow-500 text-gray-900 px-2 sm:px-4 py-1 sm:py-2 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-1 mx-auto mt-2 sm:mt-3 hover:bg-yellow-600 transition-all duration-300 hover-lift">
                      <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">REMIND TO PAY</span>
                      <span className="sm:hidden">REMIND</span>
                    </button>
                  </div>
                </div>
                
                <button className="w-full bg-gray-900 text-white py-2 sm:py-3 rounded-lg mt-4 sm:mt-6 font-medium hover:bg-gray-800 transition-all duration-300 text-sm sm:text-base hover-lift">
                  VIEW DETAILS
                </button>
              </div>
            </div>

            {/* Other Stats */}
            <div className="bg-yellow-500 rounded-xl p-4 sm:p-6 hover-lift transition-all duration-300 stat-card">
              <h2 className="text-gray-900 font-bold text-lg sm:text-xl mb-4">Other Stats</h2>
              <div className="bg-white rounded-lg p-4 sm:p-6 hover-lift transition-all duration-300">
                <div className="grid grid-cols-2 gap-4 sm:gap-6">
                  {/* Vacant Beds */}
                  <div className="text-center">
                    <div className="text-gray-600 text-xs sm:text-sm font-medium">Vacant Beds</div>
                    <div className="text-xl sm:text-2xl font-bold text-gray-900 mt-1 sm:mt-2 animate-countUp">{stats.vacantBeds} / {stats.totalBeds}</div>
                    <button className="bg-gray-900 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-lg text-xs sm:text-sm font-medium mt-2 sm:mt-3 hover:bg-gray-800 transition-all duration-300 hover-lift">
                      VIEW
                    </button>
                  </div>
                  
                  {/* Notice Period */}
                  <div className="text-center">
                    <div className="text-gray-600 text-xs sm:text-sm font-medium">Notice Period</div>
                    <div className="text-xl sm:text-2xl font-bold text-gray-900 mt-1 sm:mt-2 animate-countUp">{stats.noticePeriodTenants} / {stats.totalTenants}</div>
                    <div className="text-gray-600 text-xs sm:text-sm">Tenants</div>
                    <button className="bg-gray-900 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-lg text-xs sm:text-sm font-medium mt-2 sm:mt-3 hover:bg-gray-800 transition-all duration-300 hover-lift">
                      VIEW
                    </button>
                  </div>
                </div>
              </div>
            </div>
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