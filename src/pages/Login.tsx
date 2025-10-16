import { useState } from 'react';
import { Mail, Lock, Loader2, Shield, Building2, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { t } = useLanguage();

  const isDevelopment = import.meta.env.DEV;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string, demoPassword: string = 'demo') => {
    setError('');
    setLoading(true);

    console.log('Demo login clicked:', demoEmail);

    try {
      await login(demoEmail, demoPassword);
      console.log('Demo login successful!');
    } catch (err) {
      console.error('Demo login failed:', err);
      setError('Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    {
      role: 'Super Admin',
      email: 'info@allyncai.com',
      name: 'Allync',
      description: 'Full system access - manage all companies and services',
      icon: Shield,
      gradient: 'from-red-600 to-orange-600',
      textColor: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
    },
    {
      role: 'Company Admin',
      email: 'company@example.com',
      description: 'Manage company services, users, and billing',
      icon: Building2,
      gradient: 'from-blue-600 to-purple-600',
      textColor: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
    },
    {
      role: 'Regular User',
      email: 'user@example.com',
      description: 'Access company services and view reports',
      icon: UserIcon,
      gradient: 'from-green-600 to-emerald-600',
      textColor: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-4">
      <div className={`w-full ${isDevelopment ? 'max-w-6xl' : 'max-w-md'}`}>
        <div className={`grid grid-cols-1 ${isDevelopment ? 'lg:grid-cols-2' : ''} gap-6`}>
          <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-2xl shadow-2xl shadow-black/70 p-8">
            <div className="text-center mb-8">
              <img
                src="/logo-white.svg"
                alt="Allync"
                className="h-16 w-auto mx-auto mb-4"
                onError={(e) => {
                  e.currentTarget.src = '/logo-white.png';
                }}
              />
              <h2 className="text-3xl font-bold text-white mb-2">Welcome to Allync</h2>
              <p className="text-gray-400">Sign in to your account to continue</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">{t('auth.email')}</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white placeholder-gray-500"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">{t('auth.password')}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white placeholder-gray-500"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="w-4 h-4 text-blue-400 bg-gray-900 border-gray-700 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-400">{t('auth.rememberMe')}</span>
                </label>
                <a href="#forgot" className="text-sm text-blue-400 hover:text-blue-300 font-medium">
                  {t('auth.forgotPassword')}
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('auth.signingIn')}
                  </>
                ) : (
                  t('auth.signInButton')
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-400">
                {t('auth.noAccount')}{' '}
                <a href="#register" className="text-blue-400 hover:text-blue-300 font-medium">
                  {t('auth.register')}
                </a>
              </p>
            </div>
          </div>

          {isDevelopment && (
            <div className="space-y-4">
              <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-2xl shadow-2xl shadow-black/70 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">Quick Demo Access</h2>
                  <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs font-medium rounded">
                    DEV ONLY
                  </span>
                </div>
                <p className="text-sm text-gray-400 mb-6">
                  Click any account below to instantly login and explore the platform
                </p>

                <div className="space-y-3">
                  {demoAccounts.map((account) => {
                    const Icon = account.icon;
                    return (
                      <button
                        key={account.email}
                        onClick={() => handleDemoLogin(account.email)}
                        disabled={loading}
                        className={`w-full p-4 rounded-xl border-2 ${account.borderColor} ${account.bgColor} hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left group`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${account.gradient} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className={`font-bold ${account.textColor} mb-1`}>{account.role}</h3>
                            <p className="text-sm text-gray-400 mb-2">{account.description}</p>
                            {account.name && (
                              <p className="text-xs text-gray-500">👤 {account.name}</p>
                            )}
                            <p className="text-xs text-gray-500 font-mono">📧 {account.email}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
                <p className="text-sm text-orange-300">
                  <strong>Development Mode:</strong> These demo accounts will NOT appear in production build.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
