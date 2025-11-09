import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Shield, Building2, AlertCircle, CheckCircle, KeyRound } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ContactAdminModal from '../../components/ContactAdminModal';
import { EmailService } from '../../lib/email';
import activityLogger from '../../lib/services/activityLogger'; // ✅ ACTIVITY LOGGER

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Login States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // Modal States
  const [showContactModal, setShowContactModal] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  
  // Forgot Password States
  const [resetEmail, setResetEmail] = useState('');
  const [resetStatus, setResetStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [resetMessage, setResetMessage] = useState('');

  const isDevelopment = import.meta.env.DEV;

  // Load saved email on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('allync_remember_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('🔐 Attempting login:', email);
      
      // Login and get user
      const user = await login(email, password);
      
      console.log('✅ Login successful!', user);
      console.log('👤 User object:', user);
      console.log('🎭 User role:', user.role);

      // ✅ TRACK SUCCESSFUL LOGIN
      await activityLogger.logLogin(user.id, user.company_id || null);

      // Save email if "Remember Me" is checked
      if (rememberMe) {
        localStorage.setItem('allync_remember_email', email);
      } else {
        localStorage.removeItem('allync_remember_email');
      }

      // Navigate based on role
      if (user.role === 'super_admin') {
        console.log('➡️ Navigating to /admin');
        navigate('/admin', { replace: true });
      } else {
        console.log('➡️ Navigating to /dashboard');
        navigate('/dashboard', { replace: true });
      }
    } catch (err: any) {
      console.error('❌ Login failed:', err);
      setError(err.message || 'Invalid email or password. Please try again.');
      
      // ✅ TRACK FAILED LOGIN
      await activityLogger.logLoginFailed(err.message || 'Invalid email or password');
      
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!resetEmail) {
      setResetStatus('error');
      setResetMessage('Please enter your email address');
      return;
    }

    setResetStatus('loading');
    setResetMessage('');

    try {
      console.log('📧 Sending password reset email to:', resetEmail);

      // Use Supabase's built-in password reset
      await EmailService.sendPasswordResetEmail({
        userName: resetEmail.split('@')[0], // Extract name from email
        userEmail: resetEmail,
      });

      console.log('✅ Password reset email sent successfully');

      // ✅ TRACK PASSWORD RESET REQUEST
      await activityLogger.log({
        action: 'Password Reset Requested',
        category: 'auth',
        description: `Password reset email sent to ${resetEmail}`,
        status: 'success' as const,
        severity: 'info' as const,
        tags: ['password_reset', 'email'],
      });

      setResetStatus('success');
      setResetMessage('Password reset link has been sent to your email. Please check your inbox.');
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setShowForgotPassword(false);
        setResetEmail('');
        setResetStatus('idle');
        setResetMessage('');
      }, 3000);

    } catch (err: any) {
      console.error('❌ Failed to send password reset email:', err);
      
      // ✅ TRACK PASSWORD RESET ERROR
      await activityLogger.logError(
        'Password Reset Failed',
        err,
        { email: resetEmail },
        'error' as const
      );
      
      setResetStatus('error');
      setResetMessage(err.message || 'Failed to send reset email. Please try again.');
    }
  };

  const handleDemoLogin = async (demoEmail: string, demoPassword: string = 'Demo123!') => {
    setError('');
    setIsLoading(true);

    try {
      console.log('🎯 Demo login:', demoEmail);
      
      // Login and get user
      const user = await login(demoEmail, demoPassword);
      
      console.log('✅ Demo login successful!', user);

      // ✅ TRACK DEMO LOGIN
      await activityLogger.logLogin(user.id, user.company_id || null);

      // Navigate based on role
      if (user.role === 'super_admin') {
        console.log('➡️ Navigating to /admin');
        navigate('/admin', { replace: true });
      } else {
        console.log('➡️ Navigating to /dashboard');
        navigate('/dashboard', { replace: true });
      }
    } catch (err: any) {
      console.error('❌ Demo login failed:', err);
      setError('Demo login failed. Please contact support.');
      
      // ✅ TRACK FAILED DEMO LOGIN
      await activityLogger.logLoginFailed(`Demo login failed: ${err.message}`);
      
      setIsLoading(false);
    }
  };

  const demoAccounts = [
    {
      role: 'Super Admin',
      email: 'info@allyncai.com',
      company: 'Allync',
      description: 'Full system access - manage all companies',
      icon: Shield,
      gradient: 'from-red-600 to-orange-600',
      textColor: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
    },
    {
      role: 'Company Admin',
      email: 'sarah.smith@techcorp.com',
      company: 'Tech Corp',
      description: 'Manage company services, users, and billing',
      icon: Building2,
      gradient: 'from-blue-600 to-purple-600',
      textColor: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
    },
    {
      role: 'Company Admin',
      email: 'robert.johnson@mediainc.com',
      company: 'Media Inc',
      description: 'Manage company services, users, and billing',
      icon: Building2,
      gradient: 'from-green-600 to-emerald-600',
      textColor: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-mobile p-4">
      <div className={`w-full ${isDevelopment ? 'max-w-6xl' : 'max-w-md'}`}>
        <div className={`grid grid-cols-1 ${isDevelopment ? 'lg:grid-cols-2' : ''} gap-6`}>
          {/* Login Form */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[20px] shadow-2xl p-8">
            {/* Logo & Title */}
            <div className="text-center mb-8">
              {/* Logo with Glow */}
              <div className="relative inline-block mb-4">
                <div className="absolute inset-0 bg-blue-500/30 blur-2xl rounded-full"></div>
                <img
                  src="/logo-white.png"
                  alt="Allync AI"
                  className="relative h-20 w-auto mx-auto drop-shadow-[0_0_15px_rgba(59,130,246,0.5)] hover:drop-shadow-[0_0_25px_rgba(59,130,246,0.7)] transition-all duration-300"
                  onError={(e) => {
                    e.currentTarget.src = '/logo-white.svg';
                  }}
                />
              </div>
              
              {/* Shiny Gradient Text */}
              <h1 className="text-4xl font-bold mb-2">
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-x">
                  Allync AI
                </span>
              </h1>
              
              <p className="text-muted">Sign in to your dashboard</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-red-400 text-sm font-medium">Login Failed</p>
                  <p className="text-red-400/80 text-sm mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="your@email.com"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-secondary">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Enter your password"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-white/10 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                  disabled={isLoading}
                />
                <label
                  htmlFor="rememberMe"
                  className="text-sm text-gray-300 cursor-pointer select-none"
                >
                  Remember my email
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-500/50"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Help Links */}
            <div className="mt-6 text-center">
              <button
                onClick={() => setShowContactModal(true)}
                className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                Need help? Contact Administrator
              </button>
            </div>

            {/* Demo Info (Production) */}
            {!isDevelopment && (
              <div className="mt-8 pt-6 border-t border-white/10">
                <p className="text-center text-xs text-muted mb-3">Demo Credentials:</p>
                <div className="space-y-2 text-xs text-muted bg-white/5 rounded-xl p-4 border border-white/10">
                  <p>📧 <span className="text-red-400">Super Admin:</span> info@allyncai.com</p>
                  <p>📧 <span className="text-blue-400">Company Admin:</span> sarah.smith@techcorp.com</p>
                  <p>🔑 <span className="text-muted">Password:</span> Demo123!</p>
                </div>
              </div>
            )}
          </div>

          {/* Demo Quick Login (Development Only) */}
          {isDevelopment && (
            <div className="space-y-4">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[20px] shadow-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">🚀 Quick Demo Access</h2>
                  <span className="px-3 py-1 bg-orange-500/20 text-orange-400 text-xs font-bold rounded-full border border-orange-500/30">
                    DEV ONLY
                  </span>
                </div>
                <p className="text-sm text-muted mb-6">
                  Click any account to instantly login and explore the platform
                </p>

                <div className="space-y-3">
                  {demoAccounts.map((account) => {
                    const Icon = account.icon;
                    return (
                      <button
                        key={account.email}
                        onClick={() => handleDemoLogin(account.email)}
                        disabled={isLoading}
                        className={`w-full p-4 rounded-xl border-2 ${account.borderColor} ${account.bgColor} hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left group`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${account.gradient} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className={`font-bold ${account.textColor} mb-1 text-base`}>
                              {account.role}
                            </h3>
                            <p className="text-sm text-muted mb-2">{account.description}</p>
                            <p className="text-xs text-muted font-medium">
                              🏢 {account.company}
                            </p>
                            <p className="text-xs text-muted font-mono mt-1">
                              📧 {account.email}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/10">
                  <p className="text-xs text-muted text-center">
                    🔑 All demo passwords: <span className="text-blue-400 font-mono font-bold">Demo123!</span>
                  </p>
                </div>
              </div>

              <div className="bg-orange-500/10 border border-orange-500/30 rounded-[20px] p-4">
                <p className="text-xs text-orange-300">
                  <strong>⚠️ Development Mode:</strong> Quick login buttons are hidden in production.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contact Admin Modal */}
      <ContactAdminModal 
        isOpen={showContactModal} 
        onClose={() => setShowContactModal(false)} 
      />

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[20px] max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <KeyRound className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Reset Password</h2>
                <p className="text-sm text-muted">Enter your email to receive reset link</p>
              </div>
            </div>

            {/* Success Message */}
            {resetStatus === 'success' && (
              <div className="mb-4 p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-green-400 text-sm font-medium">Email Sent!</p>
                  <p className="text-green-400/80 text-sm mt-1">{resetMessage}</p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {resetStatus === 'error' && (
              <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-red-400 text-sm font-medium">Error</p>
                  <p className="text-red-400/80 text-sm mt-1">{resetMessage}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="your@email.com"
                    required
                    disabled={resetStatus === 'loading' || resetStatus === 'success'}
                  />
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3">
                <p className="text-xs text-blue-400">
                  🔒 A password reset link will be sent to your email. The link expires in 1 hour.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetEmail('');
                    setResetStatus('idle');
                    setResetMessage('');
                  }}
                  disabled={resetStatus === 'loading'}
                  className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetStatus === 'loading' || resetStatus === 'success'}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-xl font-semibold transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {resetStatus === 'loading' ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sending...
                    </>
                  ) : resetStatus === 'success' ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Sent!
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}