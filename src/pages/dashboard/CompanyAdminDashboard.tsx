import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap, TrendingUp, Clock, CheckCircle, CreditCard,
  ArrowRight, Package, DollarSign,
  MessageCircle, Instagram, Calendar, Sheet, Mail, FileText,
  FolderOpen, Image, Mic, Heart, Globe, Smartphone
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getServiceTypes } from '../../lib/api/companies';
import { getInvoicesByCompany } from '../../lib/api/invoices';
import { getCompanyServices } from '../../lib/api/companyServices'; // ✅ NEW: Use company_services

interface ActiveService {
  id: string; // company_services.id
  companyServiceId: string; // company_services.id
  name_en: string;
  slug: string;
  package: string;
  status: string;
  instanceName: string;
  approved_at: string;
}

interface Invoice {
  id: string;
  invoice_number: string;
  total_amount: number;
  status: string;
  due_date?: string;
  issue_date: string;
}

export default function CompanyAdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeServices, setActiveServices] = useState<ActiveService[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [monthlyCost, setMonthlyCost] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.company_id) return;

      try {
        setLoading(true);

        console.log('📊 [CompanyAdminDashboard] Fetching data for company:', user.company_id);

        // ✅ FIXED: Use company_services instead of service_requests
        const [companyServicesData, invoicesData, serviceTypesData] = await Promise.all([
          getCompanyServices(user.company_id), // ✅ NEW
          getInvoicesByCompany(user.company_id),
          getServiceTypes()
        ]);

        console.log('📦 [CompanyAdminDashboard] Data fetched:', {
          companyServices: companyServicesData?.length || 0,
          invoices: invoicesData?.length || 0,
          serviceTypes: serviceTypesData?.length || 0
        });

        // ✅ FIXED: Map company_services to active services
        console.log('🔍 [CompanyAdminDashboard] All company services:', companyServicesData);
        console.log('🔍 [CompanyAdminDashboard] Active services filter:', companyServicesData.filter((cs: any) => cs.status === 'active'));

        const activeServicesData = companyServicesData
          .filter((cs: any) => {
            console.log('🔍 Service status check:', { id: cs.id, status: cs.status, service_type: cs.service_type });
            return cs.status === 'active';
          })
          .map((cs: any) => {
            const mapped = {
              id: cs.id, // company_services.id
              companyServiceId: cs.id, // ✅ IMPORTANT: Store for navigation
              name_en: cs.service_type?.name_en || 'Unknown Service',
              slug: cs.service_type?.slug || '',
              package: cs.package,
              status: cs.status,
              instanceName: cs.instance_name || cs.service_type?.name_en || 'Service',
              approved_at: cs.created_at,
            };
            console.log('🔍 Mapped service:', mapped);
            return mapped;
          });

        console.log('✅ [CompanyAdminDashboard] Active services:', activeServicesData);

        // Calculate monthly cost from unpaid invoices
        const cost = invoicesData
          .filter((inv: any) => inv.status === 'unpaid' || inv.status === 'pending')
          .reduce((sum: number, inv: any) => sum + (inv.total_amount || 0), 0);

        console.log('💰 [CompanyAdminDashboard] Monthly cost calculated:', {
          unpaidInvoices: invoicesData.filter((inv: any) => inv.status === 'unpaid' || inv.status === 'pending').length,
          totalCost: cost
        });

        setActiveServices(activeServicesData);
        setInvoices(invoicesData);
        setMonthlyCost(cost);
        setLoading(false);
      } catch (error) {
        console.error('❌ [CompanyAdminDashboard] Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.company_id]);

  // Icon mapping - same as Services.tsx and CompanySidebar
  const getServiceIcon = (slug: string) => {
    const iconMap: Record<string, any> = {
      'whatsapp-automation': MessageCircle,
      'instagram-automation': Instagram,
      'google-calendar-integration': Calendar,
      'google-calendar': Calendar,
      'google-sheets-integration': Sheet,
      'google-sheets': Sheet,
      'gmail-integration': Mail,
      'gmail': Mail,
      'google-docs-integration': FileText,
      'google-docs': FileText,
      'google-drive-integration': FolderOpen,
      'google-drive': FolderOpen,
      'google-photos-integration': Image,
      'google-photos': Image,
      'voice-cloning': Mic,
      'sentiment-analysis': Heart,
      'website-development': Globe,
      'mobile-app-development': Smartphone
    };

    return iconMap[slug] || Package;
  };

  // Color mapping for service cards
  const getServiceGradient = (slug: string) => {
    const gradientMap: Record<string, string> = {
      'whatsapp-automation': 'from-green-500 to-green-700',
      'instagram-automation': 'from-pink-500 to-purple-600',
      'google-calendar': 'from-blue-500 to-blue-700',
      'google-sheets': 'from-green-600 to-green-800',
      'gmail': 'from-red-500 to-red-700',
      'google-docs': 'from-blue-600 to-blue-800',
      'google-drive': 'from-yellow-500 to-orange-600',
      'google-photos': 'from-red-600 to-pink-600',
      'voice-cloning': 'from-purple-500 to-purple-700',
      'sentiment-analysis': 'from-pink-600 to-red-600',
      'website-development': 'from-cyan-500 to-blue-600',
      'mobile-app-development': 'from-indigo-500 to-purple-600'
    };

    return gradientMap[slug] || 'from-blue-500 to-blue-700';
  };

  // ✅ FIXED: Navigate to service page WITH serviceId parameter
  const handleViewService = (slug: string, serviceId: string) => {
    const slugMap: Record<string, string> = {
      'whatsapp-automation': 'whatsapp',
      'instagram-automation': 'instagram',
      'google-calendar-integration': 'calendar',
      'google-calendar': 'calendar',
      'google-sheets-integration': 'sheets',
      'google-sheets': 'sheets',
      'gmail-integration': 'gmail',
      'gmail': 'gmail',
      'google-docs-integration': 'docs',
      'google-docs': 'docs',
      'google-drive-integration': 'drive',
      'google-drive': 'drive',
      'google-photos-integration': 'photos',
      'google-photos': 'photos',
      'website-development': 'website',
      'mobile-app-development': 'mobile-app'
    };

    const path = slugMap[slug] || slug;
    
    // ✅ CRITICAL FIX: Include serviceId in URL
    console.log('🔗 [CompanyAdminDashboard] Navigating to:', `/dashboard/services/${path}/${serviceId}`);
    navigate(`/dashboard/services/${path}/${serviceId}`);
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-white text-xl">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-muted mt-1">Welcome back! Here's your services overview</p>
      </div>

      {/* Stats Cards - Mobile UI Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Active Services */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[20px] p-5 hover:bg-white/15 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-blue-500/30 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-blue-400" />
            </div>
            <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            </div>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{activeServices.length}</p>
          <p className="text-xs uppercase tracking-wide text-gray-400">Active Services</p>
        </div>

        {/* Service Instances */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[20px] p-5 hover:bg-white/15 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-yellow-500/30 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="w-6 h-6 bg-yellow-500/20 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            </div>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{activeServices.length}</p>
          <p className="text-xs uppercase tracking-wide text-gray-400">Service Instances</p>
        </div>

        {/* All Services */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[20px] p-5 hover:bg-white/15 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-green-500/30 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            </div>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{activeServices.length}</p>
          <p className="text-xs uppercase tracking-wide text-gray-400">All Services</p>
        </div>

        {/* Pending Invoices */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[20px] p-5 hover:bg-white/15 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-purple-500/30 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-purple-400" />
            </div>
            <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            </div>
          </div>
          <p className="text-3xl font-bold text-white mb-1">${monthlyCost.toLocaleString()}</p>
          <p className="text-xs uppercase tracking-wide text-gray-400">Pending Invoices</p>
        </div>
      </div>

      {/* Active Services Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">Active Services</h2>
          <button
            onClick={() => navigate('/dashboard/services')}
            className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors flex items-center gap-1"
          >
            View All Services
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {activeServices.length === 0 ? (
          <div className="bg-primary/50 border border-primary rounded-xl p-12 text-center">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-gray-600" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Active Services</h3>
            <p className="text-muted mb-4">You don't have any active services yet. Browse our catalog to get started!</p>
            <button
              onClick={() => navigate('/dashboard/services')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors inline-flex items-center gap-2"
            >
              Browse Services
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeServices.map((service) => {
              const Icon = getServiceIcon(service.slug);
              const gradient = getServiceGradient(service.slug);

              return (
                <div
                  key={service.id}
                  className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[20px] p-5 hover:scale-[1.02] hover:bg-white/15 transition-all cursor-pointer group"
                  onClick={() => handleViewService(service.slug, service.companyServiceId)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-[60px] h-[60px] bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <span className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold border border-green-500/30">
                      ACTIVE
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">{service.instanceName}</h3>
                  <p className="text-sm text-blue-400 mb-1 line-clamp-1">{service.name_en}</p>
                  <p className="text-sm text-gray-400 mb-4">Plan: <span className="font-semibold text-white">{service.package.toUpperCase()}</span></p>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewService(service.slug, service.companyServiceId);
                    }}
                    className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-blue-500/50"
                  >
                    View Details
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Invoices Summary */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[20px] overflow-hidden">
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <h3 className="font-bold text-white text-lg">Recent Invoices</h3>
            <button
              onClick={() => navigate('/dashboard/invoices')}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium"
            >
              View All
            </button>
          </div>
          <div className="p-5">
            {invoices.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No invoices yet</p>
            ) : (
              <div className="space-y-3">
                {invoices.slice(0, 3).map((invoice) => (
                  <div key={invoice.id} className="flex items-start gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all border border-white/10">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CreditCard className="w-5 h-5 text-green-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-base font-bold text-white">
                          ${invoice.total_amount ? invoice.total_amount.toLocaleString() : '0'}
                        </p>
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                          invoice.status === 'paid' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                          invoice.status === 'unpaid' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                          'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                        }`}>
                          {invoice.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Due: {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions - Mobile UI Design */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <button
          onClick={() => navigate('/dashboard/services')}
          className="group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-700 rounded-[20px]"></div>
          <div className="relative p-5 flex items-center justify-between hover:scale-[1.02] transition-transform">
            <div className="text-left flex-1">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                <Package className="w-6 h-6 text-white" />
              </div>
              <p className="font-bold text-lg mb-1 text-white">Browse Services</p>
              <p className="text-sm text-blue-100">Discover new features</p>
            </div>
            <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        <button
          onClick={() => navigate('/dashboard/invoices')}
          className="group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-green-700 rounded-[20px]"></div>
          <div className="relative p-5 flex items-center justify-between hover:scale-[1.02] transition-transform">
            <div className="text-left flex-1">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <p className="font-bold text-lg mb-1 text-white">View Invoices</p>
              <p className="text-sm text-green-100">Manage billing</p>
            </div>
            <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        <button
          onClick={() => navigate('/dashboard/support')}
          className="group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-purple-700 rounded-[20px]"></div>
          <div className="relative p-5 flex items-center justify-between hover:scale-[1.02] transition-transform">
            <div className="text-left flex-1">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <p className="font-bold text-lg mb-1 text-white">Get Support</p>
              <p className="text-sm text-purple-100">Contact our team</p>
            </div>
            <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </div>
    </div>
  );
}