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
  Settings
} from 'lucide-react';
import axios from 'axios';

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
  recent_payments: Array<any>;
  maintenance_alerts: number;
  monthly_revenue_trend: Array<{ month: string; revenue: number }>;
  occupancy_trend: Array<{ month: string; occupancy: number }>;
  payment_method_distribution: { [key: string]: number };
  current_month_stats: {
    month: string;
    total_bills: number;
    paid_bills: number;
    pending_bills: number;
    collection_amount: number;
    pending_amount: number;
  };
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

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    total_tenants: 0,
    active_tenants: 0,
    new_tenants_this_month: 0,
    total_rooms: 0,
    occupied_rooms: 0,
    available_rooms: 0,
    maintenance_rooms: 0,
    occupancy_rate: 0,
    total_revenue_potential: 0,
    actual_revenue_this_month: 0,
    pending_collections: 0,
    collection_rate: 0,
    recent_payments: [],
    maintenance_alerts: 0,
    monthly_revenue_trend: [],
    occupancy_trend: [],
    payment_method_distribution: {},
    current_month_stats: {
      month: '',
      total_bills: 0,
      paid_bills: 0,
      pending_bills: 0,
      collection_amount: 0,
      pending_amount: 0
    }
  });

  const [activities, setActivities] = useState<Activity[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showReportsModal, setShowReportsModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    fetchRecentActivities();
    fetchAlerts();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [overviewRes, activitiesRes, alertsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/api/dashboard/overview`),
        axios.get(`${import.meta.env.VITE_API_URL}/api/dashboard/recent-activities`),
        axios.get(`${import.meta.env.VITE_API_URL}/api/dashboard/alerts`)
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

  const fetchRecentActivities = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/dashboard/recent-activities`);
      const data = response.data;
      setActivities(data);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/dashboard/alerts`);
      const data = response.data;
      setAlerts(data);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return <CreditCard className="h-4 w-4" />;
      case 'tenant':
        return <Users className="h-4 w-4" />;
      case 'maintenance':
        return <AlertTriangle className="h-4 w-4" />;
      case 'room':
        return <Building className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-golden-500"></div>
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
            <TrendingUp className="h-5 w-5" />
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
            <Clock className="h-5 w-5" />
            Recent Activities
          </h3>
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-center gap-4 p-3 bg-dark-800 rounded-lg">
                <div className={`p-2 rounded-full ${getActivityColor(activity.color)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-golden-100">{activity.title}</h4>
                  <p className="text-golden-300 text-sm">{activity.description}</p>
                  <p className="text-golden-400 text-xs">{new Date(activity.date).toLocaleDateString()}</p>
                </div>
                {activity.amount && (
                  <div className="text-golden-400 font-semibold">
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

      {/* Reports Modal */}
      {showReportsModal && (
        <ReportsModal 
          isOpen={showReportsModal}
          onClose={() => setShowReportsModal(false)}
        />
      )}

      {/* Notifications Modal */}
      {showNotificationsModal && (
        <NotificationsModal 
          isOpen={showNotificationsModal}
          onClose={() => setShowNotificationsModal(false)}
        />
      )}
    </div>
  );
};

// Reports Modal Component
interface ReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ReportsModal = ({ isOpen, onClose }: ReportsModalProps) => {
  const [selectedReport, setSelectedReport] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [generating, setGenerating] = useState(false);

  const reportTypes = [
    { id: 'tenant-summary', name: 'Tenant Summary Report', description: 'Complete list of all tenants with details' },
    { id: 'payment-report', name: 'Payment Report', description: 'Payment history and pending collections' },
    { id: 'occupancy-report', name: 'Occupancy Report', description: 'Room occupancy and availability trends' },
    { id: 'maintenance-report', name: 'Maintenance Report', description: 'Maintenance requests and completion status' },
    { id: 'financial-summary', name: 'Financial Summary', description: 'Revenue, expenses, and profit analysis' },
    { id: 'visitor-report', name: 'Visitor Report', description: 'Visitor logs and statistics' }
  ];

  const generateReport = async () => {
    if (!selectedReport) {
      alert('Please select a report type');
      return;
    }

    setGenerating(true);
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, this would call the backend API
      console.log('Generating report:', selectedReport, dateRange);
      
      // For demo, we'll show a success message
      alert(`${reportTypes.find(r => r.id === selectedReport)?.name} has been generated successfully!`);
      
      onClose();
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-dark-900 border border-golden-600/20 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-golden-600/20">
          <h2 className="text-xl font-semibold text-golden-400">Generate Reports</h2>
          <button onClick={onClose} className="text-golden-300 hover:text-golden-100">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Report Type Selection */}
          <div>
            <label className="block text-sm font-medium text-golden-300 mb-3">Select Report Type</label>
            <div className="space-y-2">
              {reportTypes.map((report) => (
                <label key={report.id} className="flex items-start gap-3 p-3 border border-golden-600/30 rounded-lg hover:bg-dark-800 cursor-pointer">
                  <input
                    type="radio"
                    name="reportType"
                    value={report.id}
                    checked={selectedReport === report.id}
                    onChange={(e) => setSelectedReport(e.target.value)}
                    className="mt-1 text-golden-500 focus:ring-golden-500"
                  />
                  <div>
                    <div className="font-medium text-golden-100">{report.name}</div>
                    <div className="text-golden-300 text-sm">{report.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-golden-300 mb-2">Start Date</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-golden-300 mb-2">End Date</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 focus:outline-none focus:border-golden-500"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-golden-600/20">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-golden-600/30 text-golden-300 rounded-lg hover:bg-golden-600/10 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={generateReport}
              disabled={generating || !selectedReport}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-golden-500 to-golden-600 text-dark-900 rounded-lg hover:from-golden-600 hover:to-golden-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generating ? (
                <>
                  <div className="w-4 h-4 border-2 border-dark-900/30 border-t-dark-900 rounded-full animate-spin"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Generate Report
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Notifications Modal Component
interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationsModal = ({ isOpen, onClose }: NotificationsModalProps) => {
  const [notificationType, setNotificationType] = useState('');
  const [recipients, setRecipients] = useState('all');
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [sending, setSending] = useState(false);

  const notificationTypes = [
    { id: 'payment-reminder', name: 'Payment Reminder', description: 'Remind tenants about pending payments' },
    { id: 'maintenance-update', name: 'Maintenance Update', description: 'Updates about maintenance activities' },
    { id: 'general-announcement', name: 'General Announcement', description: 'General announcements to residents' },
    { id: 'emergency-alert', name: 'Emergency Alert', description: 'Urgent notifications for emergencies' }
  ];

  const recipientOptions = [
    { id: 'all', name: 'All Tenants', description: 'Send to all active tenants' },
    { id: 'overdue', name: 'Overdue Payments', description: 'Only tenants with pending payments' },
    { id: 'specific', name: 'Specific Tenants', description: 'Select specific tenants' }
  ];

  const sendNotification = async () => {
    if (!notificationType || !message || !subject) {
      alert('Please fill in all required fields');
      return;
    }

    setSending(true);
    try {
      // Simulate sending notification
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, this would call the backend API
      console.log('Sending notification:', { notificationType, recipients, subject, message });
      
      // For demo, we'll show a success message
      alert('Notification sent successfully!');
      
      onClose();
      setNotificationType('');
      setRecipients('all');
      setMessage('');
      setSubject('');
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('Failed to send notification. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-dark-900 border border-golden-600/20 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-golden-600/20">
          <h2 className="text-xl font-semibold text-golden-400">Send Notifications</h2>
          <button onClick={onClose} className="text-golden-300 hover:text-golden-100">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Notification Type */}
          <div>
            <label className="block text-sm font-medium text-golden-300 mb-3">Notification Type</label>
            <div className="space-y-2">
              {notificationTypes.map((type) => (
                <label key={type.id} className="flex items-start gap-3 p-3 border border-golden-600/30 rounded-lg hover:bg-dark-800 cursor-pointer">
                  <input
                    type="radio"
                    name="notificationType"
                    value={type.id}
                    checked={notificationType === type.id}
                    onChange={(e) => setNotificationType(e.target.value)}
                    className="mt-1 text-golden-500 focus:ring-golden-500"
                  />
                  <div>
                    <div className="font-medium text-golden-100">{type.name}</div>
                    <div className="text-golden-300 text-sm">{type.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Recipients */}
          <div>
            <label className="block text-sm font-medium text-golden-300 mb-3">Recipients</label>
            <div className="space-y-2">
              {recipientOptions.map((option) => (
                <label key={option.id} className="flex items-start gap-3 p-3 border border-golden-600/30 rounded-lg hover:bg-dark-800 cursor-pointer">
                  <input
                    type="radio"
                    name="recipients"
                    value={option.id}
                    checked={recipients === option.id}
                    onChange={(e) => setRecipients(e.target.value)}
                    className="mt-1 text-golden-500 focus:ring-golden-500"
                  />
                  <div>
                    <div className="font-medium text-golden-100">{option.name}</div>
                    <div className="text-golden-300 text-sm">{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-golden-300 mb-2">Subject *</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter notification subject"
              className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 placeholder-golden-400/50 focus:outline-none focus:border-golden-500"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-golden-300 mb-2">Message *</label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your message here..."
              className="w-full px-3 py-2 bg-dark-800 border border-golden-600/30 rounded-lg text-golden-100 placeholder-golden-400/50 focus:outline-none focus:border-golden-500"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-golden-600/20">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-golden-600/30 text-golden-300 rounded-lg hover:bg-golden-600/10 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={sendNotification}
              disabled={sending || !notificationType || !message || !subject}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-golden-500 to-golden-600 text-dark-900 rounded-lg hover:from-golden-600 hover:to-golden-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? (
                <>
                  <div className="w-4 h-4 border-2 border-dark-900/30 border-t-dark-900 rounded-full animate-spin"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send Notification
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 