import { useState } from 'react';
import { Eye, EyeOff, Lock, User, AlertCircle, CheckCircle, Building2 } from 'lucide-react';
import axios from 'axios';
import { supabaseAuth } from '../lib/supabase';

const apiUrl = import.meta.env.VITE_API_URL || '';
const USE_SUPABASE = true; // Toggle this to switch between backends

interface LoginResponse {
  message: string;
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: 'admin' | 'manager' | 'staff' | 'security';
    full_name: string;
    phone?: string;
    is_active: boolean;
    permissions: string[];
  };
  expires_in: string;
}

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Use the full API URL
      console.log('Attempting login with URL:', `${apiUrl}/auth/login`);
      console.log('Form data:', formData);
      
      const response = await axios.post(
        `${apiUrl}/auth/login`,
        formData
      );

      // Store token and user data
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      setSuccess('Login successful! Redirecting...');
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } catch (error: any) {
      console.error('Login error:', error);
      setError(
        error.response?.data?.error || 'Login failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const demoCredentials = [
    { username: 'admin', password: 'admin123', role: 'Administrator', description: 'Full system access' },
    { username: 'manager', password: 'manager123', role: 'Manager', description: 'Tenant & payment management' },
    { username: 'security', password: 'security123', role: 'Security', description: 'Visitor management' }
  ];

  const fillDemoCredentials = (username: string, password: string) => {
    setFormData({ username, password });
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-br from-golden-500 to-golden-600 rounded-2xl shadow-lg">
              <Building2 className="h-12 w-12 text-dark-900" />
            </div>
          </div>
          <h2 className="text-4xl font-bold text-golden-400 mb-2">
            Shiv Shiva Residency
          </h2>
          <p className="text-golden-300 text-lg">Management System</p>
          <p className="text-golden-400/70 text-sm mt-2">
            Sign in to access your dashboard
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-dark-900 border border-golden-600/20 rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-golden-300 mb-2">
                Username or Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-golden-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="block w-full pl-10 pr-3 py-3 border border-golden-600/30 rounded-lg bg-dark-800 text-golden-100 placeholder-golden-400/50 focus:outline-none focus:ring-2 focus:ring-golden-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your username"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-golden-300 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-golden-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="block w-full pl-10 pr-10 py-3 border border-golden-600/30 rounded-lg bg-dark-800 text-golden-100 placeholder-golden-400/50 focus:outline-none focus:ring-2 focus:ring-golden-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-golden-400 hover:text-golden-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                <span className="text-red-300 text-sm">{error}</span>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                <span className="text-green-300 text-sm">{success}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-dark-900 bg-gradient-to-r from-golden-500 to-golden-600 hover:from-golden-600 hover:to-golden-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-golden-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-dark-900"></div>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-8 pt-6 border-t border-golden-600/20">
            <h3 className="text-sm font-medium text-golden-400 mb-4 text-center">
              Demo Credentials
            </h3>
            <div className="space-y-3">
              {demoCredentials.map((cred, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => fillDemoCredentials(cred.username, cred.password)}
                  className="w-full p-3 bg-dark-800 border border-golden-600/30 rounded-lg hover:bg-dark-700 hover:border-golden-500/50 transition-all duration-200 text-left group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-golden-100 font-medium">{cred.role}</div>
                      <div className="text-golden-400 text-xs">{cred.description}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-golden-300 text-sm font-mono">{cred.username}</div>
                      <div className="text-golden-400/70 text-xs">Click to use</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            
            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-blue-300 text-xs text-center">
                Click any demo credential above to auto-fill login form
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-golden-400/60 text-sm">
            © 2025 Shiv Shiva Residency. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login; 