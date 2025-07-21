import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  Building, 
  IndianRupee, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Home,
  CreditCard,
  Wrench,
  Bell,
  UserPlus,
  FileText,
  Eye,
  Settings
} from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';

interface DashboardData {
  total_tenants: number;
  active_tenants: number;
  new_tenants_this_month: number;
  total_rooms: number;
  occupied_rooms: number;
  available_rooms: number;
  maintenance_rooms: number;
  occupancy_rate: number;
  total_revenue_potential: number;
  actual_revenue_this_month: number;
  pending_collections: number;
  collection_rate: number;
  maintenance_alerts: number;
  monthly_revenue_trend: { month: string; revenue: number }[];
  occupancy_trend: { month: string; occupancy: number }[];
  payment_method_distribution: { cash: number; upi: number; bank_transfer: number; card: number };
  current_month_stats: {
    month: string;
    total_bills: number;
    paid_bills: number;
    pending_bills: number;
    collection_amount: number;
    pending_amount: number;
  };
}

interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  amount?: number;
  date: string;
  icon: string;
  color: string;
}

interface Alert {
  id: string;
  type: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  count: number;
  action: string;
  link: string;
}

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [overviewRes, activitiesRes, alertsRes] = await Promise.all([
        axios.get('/api/dashboard/overview'),
        axios.get('/api/dashboard/recent-activities'),
        axios.get('/api/dashboard/alerts')
      ]);

      setDashboardData(overviewRes.data);
      setActivities(activitiesRes.data);
      setAlerts(alertsRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getActivityIcon = (iconType: string) => {
    switch (iconType) {
      case 'payment':
        return <CreditCard className="h-4 w-4" />;
      case 'user':
        return <Users className="h-4 w-4" />;
      case 'wrench':
        return <Wrench className="h-4 w-4" />;
      case 'home':
        return <Home className="h-4 w-4" />;
      case 'alert':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityColor = (color: string) => {
    switch (color) {
      case 'green':
        return 'text-green-400 bg-green-400/10';
      case 'blue':
        return 'text-blue-400 bg-blue-400/10';
      case 'orange':
        return 'text-orange-400 bg-orange-400/10';
      case 'purple':
        return 'text-purple-400 bg-purple-400/10';
      case 'red':
        return 'text-red-400 bg-red-400/10';
      default:
        return 'text-golden-400 bg-golden-400/10';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-500/5';
      case 'medium':
        return 'border-l-orange-500 bg-orange-500/5';
      case 'low':
        return 'border-l-blue-500 bg-blue-500/5';
      default:
        return 'border-l-golden-500 bg-golden-500/5';
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-golden-400">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-golden-400">Failed to load dashboard data</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-golden-400 mb-2">Dashboard</h1>
            <p className="text-golden-300">Welcome to Shiv Shiva Residency Management System</p>
          </div>
          <div className="mt-4 lg:mt-0 flex gap-3">
            <Link
              to="/tenants"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <UserPlus className="h-4 w-4" />
              Add Tenant
            </Link>
            <Link
              to="/payments"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-golden-500 to-golden-600 text-dark-900 rounded-lg hover:from-golden-600 hover:to-golden-700 transition-all duration-200 font-medium"
            >
              <Plus className="h-5 w-5" />
              Record Payment
            </Link>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {alerts.map((alert) => (
              <div key={alert.id} className={`border-l-4 rounded-lg p-4 ${getPriorityColor(alert.priority)}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-golden-100">{alert.title}</h3>
                    <p className="text-golden-300 text-sm mt-1">{alert.message}</p>
                  </div>
                  <div className="text-2xl font-bold text-golden-400">{alert.count}</div>
                </div>
                <Link
                  to={alert.link}
                  className="inline-flex items-center gap-1 mt-3 text-sm text-golden-400 hover:text-golden-300 transition-colors"
                >
                  {alert.action}
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-dark-900 border border-golden-600/20 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-golden-300 text-sm font-medium">Total Tenants</p>
              <p className="text-2xl font-bold text-golden-100">{dashboardData.total_tenants}</p>
              <p className="text-green-400 text-sm">+{dashboardData.new_tenants_this_month} this month</p>
            </div>
            <Users className="h-8 w-8 text-golden-400" />
          </div>
        </div>

        <div className="bg-dark-900 border border-golden-600/20 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-golden-300 text-sm font-medium">Occupancy Rate</p>
              <p className="text-2xl font-bold text-golden-100">{dashboardData.occupancy_rate}%</p>
              <p className="text-golden-300 text-sm">{dashboardData.occupied_rooms}/{dashboardData.total_rooms} rooms</p>
            </div>
            <Building className="h-8 w-8 text-golden-400" />
          </div>
        </div>

        <div className="bg-dark-900 border border-golden-600/20 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-golden-300 text-sm font-medium">Monthly Revenue</p>
              <p className="text-2xl font-bold text-green-400">{formatCurrency(dashboardData.actual_revenue_this_month)}</p>
              <p className="text-golden-300 text-sm">{dashboardData.collection_rate}% collected</p>
            </div>
            <IndianRupee className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div className="bg-dark-900 border border-golden-600/20 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-golden-300 text-sm font-medium">Pending Collections</p>
              <p className="text-2xl font-bold text-orange-400">{formatCurrency(dashboardData.pending_collections)}</p>
              <p className="text-golden-300 text-sm">{dashboardData.current_month_stats.pending_bills} bills pending</p>
            </div>
            <Clock className="h-8 w-8 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Trend */}
        <div className="bg-dark-900 border border-golden-600/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-golden-400 mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Revenue Trend (Last 6 Months)
          </h3>
          <div className="space-y-3">
            {dashboardData.monthly_revenue_trend.slice(-6).map((data, index) => {
              const maxRevenue = Math.max(...dashboardData.monthly_revenue_trend.map(d => d.revenue));
              const percentage = (data.revenue / maxRevenue) * 100;
              
              return (
                <div key={data.month} className="flex items-center gap-4">
                  <div className="w-16 text-sm text-golden-300">
                    {new Date(data.month + '-01').toLocaleDateString('en-US', { month: 'short' })}
                  </div>
                  <div className="flex-1">
                    <div className="bg-dark-800 rounded-full h-6 relative overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-golden-500 to-golden-600 h-full rounded-full transition-all duration-1000"
                        style={{ width: `${percentage}%` }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-medium text-white">
                          {formatCurrency(data.revenue)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Occupancy Trend */}
        <div className="bg-dark-900 border border-golden-600/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-golden-400 mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Occupancy Trend (Last 6 Months)
          </h3>
          <div className="space-y-3">
            {dashboardData.occupancy_trend.slice(-6).map((data, index) => (
              <div key={data.month} className="flex items-center gap-4">
                <div className="w-16 text-sm text-golden-300">
                  {new Date(data.month + '-01').toLocaleDateString('en-US', { month: 'short' })}
                </div>
                <div className="flex-1">
                  <div className="bg-dark-800 rounded-full h-6 relative overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-1000"
                      style={{ width: `${data.occupancy}%` }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-medium text-white">
                        {data.occupancy}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Current Month Stats and Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Current Month Performance */}
        <div className="bg-dark-900 border border-golden-600/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-golden-400 mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            This Month Performance
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{dashboardData.current_month_stats.paid_bills}</div>
              <div className="text-sm text-golden-300">Bills Paid</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">{dashboardData.current_month_stats.pending_bills}</div>
              <div className="text-sm text-golden-300">Bills Pending</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-golden-100">{formatCurrency(dashboardData.current_month_stats.collection_amount)}</div>
              <div className="text-sm text-golden-300">Collected</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-400">{formatCurrency(dashboardData.current_month_stats.pending_amount)}</div>
              <div className="text-sm text-golden-300">Pending</div>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-dark-900 border border-golden-600/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-golden-400 mb-4 flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Methods
          </h3>
          <div className="space-y-3">
            {Object.entries(dashboardData.payment_method_distribution).map(([method, count]) => {
              const total = Object.values(dashboardData.payment_method_distribution).reduce((sum, val) => sum + val, 0);
              const percentage = total > 0 ? (count / total) * 100 : 0;
              
              return (
                <div key={method} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-golden-500" />
                    <span className="text-golden-300 capitalize">{method.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-dark-800 rounded-full h-2">
                      <div 
                        className="bg-golden-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-golden-100 text-sm font-medium w-8">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Activities and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2 bg-dark-900 border border-golden-600/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-golden-400 mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activities
          </h3>
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-center gap-4 p-3 bg-dark-800 rounded-lg">
                <div className={`p-2 rounded-full ${getActivityColor(activity.color)}`}>
                  {getActivityIcon(activity.icon)}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-golden-100">{activity.title}</h4>
                  <p className="text-golden-300 text-sm">{activity.description}</p>
                  <p className="text-golden-400 text-xs">{new Date(activity.date).toLocaleDateString()}</p>
                </div>
                {activity.amount && (
                  <div className="text-green-400 font-medium">
                    {formatCurrency(activity.amount)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-dark-900 border border-golden-600/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-golden-400 mb-4 flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Quick Actions
          </h3>
          <div className="space-y-3">
            <Link
              to="/tenants"
              className="flex items-center justify-between p-3 bg-dark-800 rounded-lg hover:bg-dark-700 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-blue-400" />
                <span className="text-golden-100">Manage Tenants</span>
              </div>
              <ArrowUpRight className="h-4 w-4 text-golden-400 group-hover:text-golden-100" />
            </Link>

            <Link
              to="/rooms"
              className="flex items-center justify-between p-3 bg-dark-800 rounded-lg hover:bg-dark-700 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Building className="h-4 w-4 text-purple-400" />
                <span className="text-golden-100">Room Management</span>
              </div>
              <ArrowUpRight className="h-4 w-4 text-golden-400 group-hover:text-golden-100" />
            </Link>

            <Link
              to="/payments"
              className="flex items-center justify-between p-3 bg-dark-800 rounded-lg hover:bg-dark-700 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <CreditCard className="h-4 w-4 text-green-400" />
                <span className="text-golden-100">Payment Tracking</span>
              </div>
              <ArrowUpRight className="h-4 w-4 text-golden-400 group-hover:text-golden-100" />
            </Link>

            <button className="w-full flex items-center justify-between p-3 bg-dark-800 rounded-lg hover:bg-dark-700 transition-colors group">
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-orange-400" />
                <span className="text-golden-100">Generate Reports</span>
              </div>
              <ArrowUpRight className="h-4 w-4 text-golden-400 group-hover:text-golden-100" />
            </button>

            <button className="w-full flex items-center justify-between p-3 bg-dark-800 rounded-lg hover:bg-dark-700 transition-colors group">
              <div className="flex items-center gap-3">
                <Bell className="h-4 w-4 text-red-400" />
                <span className="text-golden-100">Send Notifications</span>
              </div>
              <ArrowUpRight className="h-4 w-4 text-golden-400 group-hover:text-golden-100" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 