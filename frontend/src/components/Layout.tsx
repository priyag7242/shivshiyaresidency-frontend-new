import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Building, 
  CreditCard, 
  Wrench, 
  UserCheck, 
  Menu, 
  X, 
  Bell, 
  Settings,
  LogOut,
  User,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout, hasPermission } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home, permission: null },
    { name: 'Tenants', href: '/tenants', icon: Users, permission: 'tenants:read' },
    { name: 'Rooms', href: '/rooms', icon: Building, permission: 'rooms:read' },
    { name: 'Payments', href: '/payments', icon: CreditCard, permission: 'payments:read' },
    { name: 'Maintenance', href: '/maintenance', icon: Wrench, permission: 'maintenance:read' },
    { name: 'Visitors', href: '/visitors', icon: UserCheck, permission: 'visitors:read' },
  ];

  const filteredNavigation = navigation.filter(item => 
    !item.permission || hasPermission(item.permission)
  );

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'text-red-400 bg-red-400/10';
      case 'manager':
        return 'text-blue-400 bg-blue-400/10';
      case 'staff':
        return 'text-green-400 bg-green-400/10';
      case 'security':
        return 'text-purple-400 bg-purple-400/10';
      default:
        return 'text-golden-400 bg-golden-400/10';
    }
  };

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? '' : 'pointer-events-none'}`}>
        <div className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setSidebarOpen(false)} />
        
        <div className={`relative flex-1 flex flex-col max-w-xs w-full bg-dark-900 border-r border-golden-600/20 transform transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <div className="flex items-center">
                <div className="p-2 bg-gradient-to-r from-golden-500 to-golden-600 rounded-lg">
                  <Building className="h-8 w-8 text-dark-900" />
                </div>
                <div className="ml-3">
                  <h1 className="text-xl font-bold text-golden-400">Shiv Shiva</h1>
                  <p className="text-golden-300 text-sm">Residency</p>
                </div>
              </div>
            </div>
            <nav className="mt-8 flex-1 px-2 space-y-1">
              {filteredNavigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-golden-600/20 text-golden-400 border-r-2 border-golden-500'
                        : 'text-golden-300 hover:bg-golden-600/10 hover:text-golden-200'
                    }`
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="mr-3 h-6 w-6" />
                  {item.name}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-dark-900 border-r border-golden-600/20">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <div className="flex items-center">
                <div className="p-2 bg-gradient-to-r from-golden-500 to-golden-600 rounded-lg">
                  <Building className="h-8 w-8 text-dark-900" />
                </div>
                <div className="ml-3">
                  <h1 className="text-xl font-bold text-golden-400">Shiv Shiva</h1>
                  <p className="text-golden-300 text-sm">Residency</p>
                </div>
              </div>
            </div>
            <nav className="mt-8 flex-1 px-2 space-y-1">
              {filteredNavigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-golden-600/20 text-golden-400 border-r-2 border-golden-500'
                        : 'text-golden-300 hover:bg-golden-600/10 hover:text-golden-200'
                    }`
                  }
                >
                  <item.icon className="mr-3 h-6 w-6" />
                  {item.name}
                </NavLink>
              ))}
            </nav>
          </div>
          
          {/* User info section */}
          <div className="flex-shrink-0 flex bg-dark-800 border-t border-golden-600/20 p-4">
            <div className="flex items-center w-full">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-golden-500 to-golden-600 flex items-center justify-center">
                  <User className="h-5 w-5 text-dark-900" />
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-golden-100">{user?.full_name}</p>
                <p className={`text-xs px-2 py-1 rounded ${getRoleColor(user?.role || '')}`}>
                  {user?.role}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-dark-900 border-b border-golden-600/20">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-golden-500 hover:text-golden-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-golden-500"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Top navigation bar */}
        <div className="bg-dark-900 shadow-lg border-b border-golden-600/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <div className="hidden md:block">
                  <h2 className="text-lg font-semibold text-golden-400">
                    Welcome back, {user?.full_name}
                  </h2>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <button className="p-2 rounded-full text-golden-400 hover:text-golden-300 hover:bg-golden-600/10 transition-colors">
                  <Bell className="h-5 w-5" />
                </button>

                {/* User menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-3 p-2 rounded-lg text-golden-300 hover:text-golden-100 hover:bg-golden-600/10 transition-colors"
                  >
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-golden-500 to-golden-600 flex items-center justify-center">
                      <User className="h-4 w-4 text-dark-900" />
                    </div>
                    <span className="hidden md:block text-sm font-medium">{user?.username}</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-dark-800 border border-golden-600/20 z-50">
                      <div className="py-1">
                        <div className="px-4 py-3 border-b border-golden-600/20">
                          <p className="text-sm font-medium text-golden-100">{user?.full_name}</p>
                          <p className="text-xs text-golden-400">{user?.email}</p>
                          <span className={`inline-block mt-1 text-xs px-2 py-1 rounded ${getRoleColor(user?.role || '')}`}>
                            {user?.role}
                          </span>
                        </div>
                        
                        <button
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center w-full px-4 py-2 text-sm text-golden-300 hover:bg-golden-600/10 hover:text-golden-100 transition-colors"
                        >
                          <Settings className="mr-3 h-4 w-4" />
                          Settings
                        </button>
                        
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-red-600/10 hover:text-red-300 transition-colors"
                        >
                          <LogOut className="mr-3 h-4 w-4" />
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 py-6">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default Layout; 