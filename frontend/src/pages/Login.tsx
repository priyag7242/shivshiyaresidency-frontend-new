import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Eye, 
  EyeOff, 
  Lock, 
  User, 
  AlertCircle, 
  CheckCircle, 
  Building2, 
  Mail,
  Phone,
  Shield,
  Key,
  RefreshCw,
  ArrowRight,
  Zap,
  Star,
  Heart,
  ShieldCheck,
  AlertTriangle,
  Info,
  ExternalLink,
  Github,
  Chrome,
  Smartphone,
  X
} from 'lucide-react';

interface PasswordStrength {
  score: number;
  feedback: string[];
  color: string;
}

const Login = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    feedback: [],
    color: 'text-gray-400'
  });
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState('');
  const [resetError, setResetError] = useState('');
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);

  // Check for remembered credentials on mount
  useEffect(() => {
    const remembered = localStorage.getItem('rememberedCredentials');
    if (remembered) {
      const { username, password } = JSON.parse(remembered);
      setFormData(prev => ({ ...prev, username, password, rememberMe: true }));
    }
  }, []);

  // Validate form
  useEffect(() => {
    setIsFormValid(formData.username.length > 0 && formData.password.length >= 6);
  }, [formData.username, formData.password]);

  // Password strength checker
  const checkPasswordStrength = (password: string): PasswordStrength => {
    let score = 0;
    const feedback: string[] = [];

    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('At least 8 characters');
    }

    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Include lowercase letter');
    }

    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Include uppercase letter');
    }

    if (/[0-9]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Include number');
    }

    if (/[^A-Za-z0-9]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Include special character');
    }

    let color = 'text-red-400';
    if (score >= 4) color = 'text-green-400';
    else if (score >= 3) color = 'text-yellow-400';
    else if (score >= 2) color = 'text-orange-400';

    return { score, feedback, color };
  };

  const handlePasswordChange = (password: string) => {
    setFormData(prev => ({ ...prev, password }));
    if (password.length > 0) {
      setPasswordStrength(checkPasswordStrength(password));
    } else {
      setPasswordStrength({ score: 0, feedback: [], color: 'text-gray-400' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Use the AuthContext login method
      await login(formData.username, formData.password);
      
      // Handle remember me
      if (formData.rememberMe) {
        localStorage.setItem('rememberedCredentials', JSON.stringify({
          username: formData.username,
          password: formData.password
        }));
      } else {
        localStorage.removeItem('rememberedCredentials');
      }
      
      setSuccess('Login successful! Redirecting...');
      
      // Animated success before redirect
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (error: any) {
      setError(error.message || 'Login failed. Please try again.');
      
      // Shake animation for error
      const form = document.querySelector('.login-form');
      if (form) {
        form.classList.add('animate-shake');
        setTimeout(() => form.classList.remove('animate-shake'), 500);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetError('');
    setResetSuccess('');

    try {
      // Simulate password reset
      await new Promise(resolve => setTimeout(resolve, 2000));
      setResetSuccess('Password reset link sent to your email!');
      setTimeout(() => setShowPasswordReset(false), 3000);
    } catch (error: any) {
      setResetError('Failed to send reset link. Please try again.');
    } finally {
      setResetLoading(false);
    }
  };

  const demoCredentials = [
    { 
      username: 'admin', 
      password: 'admin123', 
      role: 'Administrator', 
      description: 'Full system access',
      icon: Shield,
      color: 'from-purple-500 to-purple-600'
    },
    { 
      username: 'manager', 
      password: 'manager123', 
      role: 'Manager', 
      description: 'Tenant & payment management',
      icon: User,
      color: 'from-blue-500 to-blue-600'
    },
    { 
      username: 'security', 
      password: 'security123', 
      role: 'Security', 
      description: 'Visitor management',
      icon: ShieldCheck,
      color: 'from-green-500 to-green-600'
    }
  ];

  const fillDemoCredentials = (username: string, password: string) => {
    setFormData({ username, password, rememberMe: false });
    setError('');
    
    // Animate the form fill
    const inputs = document.querySelectorAll('input');
    inputs.forEach((input, index) => {
      setTimeout(() => {
        input.classList.add('animate-pulse');
        setTimeout(() => input.classList.remove('animate-pulse'), 300);
      }, index * 100);
    });
  };

  const socialLoginOptions = [
    { name: 'Google', icon: Chrome, color: 'from-red-500 to-red-600' },
    { name: 'GitHub', icon: Github, color: 'from-gray-700 to-gray-800' },
    { name: 'Mobile', icon: Smartphone, color: 'from-green-500 to-green-600' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-golden-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-golden-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-golden-400/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes bounceIn {
          0% { opacity: 0; transform: scale(0.3); }
          50% { opacity: 1; transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 5px rgba(245, 158, 11, 0.5); }
          50% { box-shadow: 0 0 20px rgba(245, 158, 11, 0.8); }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        
        .animate-slideInRight {
          animation: slideInRight 0.8s ease-out forwards;
        }
        
        .animate-bounceIn {
          animation: bounceIn 0.8s ease-out forwards;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
        
        .hover-lift {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .hover-lift:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 25px rgba(245, 158, 11, 0.3);
        }
        
        .form-enter {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        
        .form-enter:nth-child(1) { animation-delay: 0.1s; }
        .form-enter:nth-child(2) { animation-delay: 0.2s; }
        .form-enter:nth-child(3) { animation-delay: 0.3s; }
        .form-enter:nth-child(4) { animation-delay: 0.4s; }
      `}</style>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center animate-fadeInUp">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-br from-golden-500 to-golden-600 rounded-2xl shadow-lg hover-lift animate-bounceIn">
              <Building2 className="h-12 w-12 text-dark-900" />
            </div>
          </div>
          <h2 className="text-4xl font-bold text-golden-400 mb-2 animate-glow">
            Shiv Shiva Residency
          </h2>
          <p className="text-golden-300 text-lg">Management System</p>
          <p className="text-golden-400/70 text-sm mt-2">
            Sign in to access your dashboard
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-dark-900 border border-golden-600/20 rounded-2xl shadow-2xl p-8 hover-lift transition-all duration-300 animate-slideInRight">
          <form onSubmit={handleSubmit} className="space-y-6 login-form">
            {/* Username Field */}
            <div className="form-enter">
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
                  className="block w-full pl-10 pr-3 py-3 border border-golden-600/30 rounded-lg bg-dark-800 text-golden-100 placeholder-golden-400/50 focus:outline-none focus:ring-2 focus:ring-golden-500 focus:border-transparent transition-all duration-200 hover:border-golden-500/50"
                  placeholder="Enter your username"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="form-enter">
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
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-golden-600/30 rounded-lg bg-dark-800 text-golden-100 placeholder-golden-400/50 focus:outline-none focus:ring-2 focus:ring-golden-500 focus:border-transparent transition-all duration-200 hover:border-golden-500/50"
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
              
              {/* Password Strength Indicator */}
              {formData.password.length > 0 && (
                <div className="mt-2 animate-fadeInUp">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs ${passwordStrength.color}`}>
                      Password Strength: {passwordStrength.score}/5
                    </span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            level <= passwordStrength.score 
                              ? passwordStrength.color.replace('text-', 'bg-')
                              : 'bg-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {passwordStrength.feedback.length > 0 && (
                    <div className="text-xs text-gray-400">
                      {passwordStrength.feedback[0]}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="form-enter flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                  className="rounded border-golden-600/30 text-golden-500 focus:ring-golden-500 bg-dark-800"
                />
                <span className="ml-2 text-sm text-golden-300">Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => setShowPasswordReset(true)}
                className="text-sm text-golden-400 hover:text-golden-300 transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg animate-fadeInUp">
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                <span className="text-red-300 text-sm">{error}</span>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg animate-fadeInUp">
                <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                <span className="text-green-300 text-sm">{success}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-dark-900 bg-gradient-to-r from-golden-500 to-golden-600 hover:from-golden-600 hover:to-golden-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-golden-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover-lift"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-dark-900"></div>
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  Sign In
                  <ArrowRight className="h-4 w-4" />
                </div>
              )}
            </button>
          </form>

          {/* Social Login */}
          <div className="mt-6 pt-6 border-t border-golden-600/20">
            <p className="text-sm text-golden-400/70 text-center mb-4">Or continue with</p>
            <div className="grid grid-cols-3 gap-3">
              {socialLoginOptions.map((option, index) => (
                <button
                  key={index}
                  type="button"
                  className="flex items-center justify-center p-3 bg-dark-800 border border-golden-600/30 rounded-lg hover:bg-dark-700 hover:border-golden-500/50 transition-all duration-200 hover-lift group"
                >
                  <option.icon className="h-5 w-5 text-golden-400 group-hover:scale-110 transition-transform" />
                </button>
              ))}
            </div>
          </div>

          {/* Demo Credentials */}
          <div className="mt-8 pt-6 border-t border-golden-600/20">
            <h3 className="text-sm font-medium text-golden-400 mb-4 text-center">
              Demo Credentials
            </h3>
            <div className="space-y-3">
              {demoCredentials.map((cred, index) => {
                const IconComponent = cred.icon;
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => fillDemoCredentials(cred.username, cred.password)}
                    className="w-full p-3 bg-dark-800 border border-golden-600/30 rounded-lg hover:bg-dark-700 hover:border-golden-500/50 transition-all duration-200 text-left group hover-lift animate-fadeInUp"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${cred.color}`}>
                          <IconComponent className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <div className="text-golden-100 font-medium">{cred.role}</div>
                          <div className="text-golden-400 text-xs">{cred.description}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-golden-300 text-sm font-mono">{cred.username}</div>
                        <div className="text-golden-400/70 text-xs">Click to use</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            
            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg animate-fadeInUp">
              <p className="text-blue-300 text-xs text-center">
                Click any demo credential above to auto-fill login form
              </p>
            </div>
          </div>
        </div>

        {/* Password Reset Modal */}
        {showPasswordReset && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeInUp">
            <div className="bg-dark-900 border border-golden-600/20 rounded-2xl shadow-2xl p-8 max-w-md w-full animate-bounceIn">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-golden-400">Reset Password</h3>
                <button
                  onClick={() => setShowPasswordReset(false)}
                  className="text-golden-400 hover:text-golden-300 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-golden-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-golden-400" />
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-golden-600/30 rounded-lg bg-dark-800 text-golden-100 placeholder-golden-400/50 focus:outline-none focus:ring-2 focus:ring-golden-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>
                
                {resetError && (
                  <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    <span className="text-red-300 text-sm">{resetError}</span>
                  </div>
                )}
                
                {resetSuccess && (
                  <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <span className="text-green-300 text-sm">{resetSuccess}</span>
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-dark-900 bg-gradient-to-r from-golden-500 to-golden-600 hover:from-golden-600 hover:to-golden-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-golden-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {resetLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-dark-900"></div>
                      Sending...
                    </div>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center animate-fadeInUp">
          <p className="text-golden-400/60 text-sm">
            © 2025 Shiv Shiva Residency. All rights reserved.
          </p>
          <div className="flex items-center justify-center gap-4 mt-2">
            <div className="flex items-center gap-1 text-golden-400/40 text-xs">
              <Shield className="h-3 w-3" />
              Secure Login
            </div>
            <div className="flex items-center gap-1 text-golden-400/40 text-xs">
              <Zap className="h-3 w-3" />
              Fast & Reliable
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 