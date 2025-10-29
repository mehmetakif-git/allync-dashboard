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
        const activeServicesData = companyServicesData
          .filter((cs: any) => cs.status === 'active')
          .map((cs: any) => {
            return {
              id: cs.id, // company_services.id
              companyServiceId: cs.id, // ✅ IMPORTANT: Store for navigation
              name_en: cs.service_type?.name_en || 'Unknown Service',
              slug: cs.service_type?.slug || '',
              package: cs.package,
              status: cs.status,
              instanceName: cs.instance_name || cs.service_type?.name_en || 'Service',
              approved_at: cs.created_at,
            };
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <TrendingUp className="w-5 h-5 text-blue-200" />
          </div>
          <p className="text-blue-200 text-sm mb-1">Active Services</p>
          <p className="text-3xl font-bold">{activeServices.length}</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-600 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <p className="text-yellow-200 text-sm mb-1">Service Instances</p>
          <p className="text-3xl font-bold">{activeServices.length}</p>
        </div>

        <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
          <p className="text-green-200 text-sm mb-1">All Services</p>
          <p className="text-3xl font-bold">{activeServices.length}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <p className="text-purple-200 text-sm mb-1">Pending Invoices</p>
          <p className="text-3xl font-bold">${monthlyCost.toLocaleString()}</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeServices.map((service) => {
              const Icon = getServiceIcon(service.slug);
              const gradient = getServiceGradient(service.slug);

              return (
                <div
                  key={service.id}
                  className="bg-primary/50 border border-primary rounded-xl p-6 hover:bg-card transition-all hover:scale-105 cursor-pointer"
                  onClick={() => handleViewService(service.slug, service.companyServiceId)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium border-l-4 border-l-green-500">
                      Active
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-1">{service.instanceName}</h3>
                  <p className="text-sm text-blue-400 mb-1">{service.name_en}</p>
                  <p className="text-sm text-muted mb-4">Plan: {service.package.toUpperCase()}</p>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewService(service.slug, service.companyServiceId);
                    }}
                    className="w-full mt-4 px-4 py-2 bg-secondary hover:bg-hover text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    View Details
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Invoices Summary */}
        <div className="bg-primary/50 border border-primary rounded-xl overflow-hidden">
          <div className="p-4 border-b border-primary flex items-center justify-between">
            <h3 className="font-bold text-white">Recent Invoices</h3>
            <button
              onClick={() => navigate('/dashboard/invoices')}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              View All
            </button>
          </div>
          <div className="p-4">
            {invoices.length === 0 ? (
              <p className="text-muted text-center py-4">No invoices yet</p>
            ) : (
              <div className="space-y-3">
                {invoices.slice(0, 3).map((invoice) => (
                  <div key={invoice.id} className="flex items-start gap-3 p-3 bg-card rounded-lg">
                    <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CreditCard className="w-4 h-4 text-green-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-white">
                          ${invoice.total_amount ? invoice.total_amount.toLocaleString() : '0'}
                        </p>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          invoice.status === 'paid' ? 'bg-green-500/20 text-green-400' :
                          invoice.status === 'unpaid' ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {invoice.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-muted mt-1">
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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => navigate('/dashboard/services')}
          className="p-6 bg-blue-600 hover:bg-blue-700 rounded-xl text-white transition-all hover:scale-105 flex items-center justify-between"
        >
          <div className="text-left">
            <p className="font-bold text-lg mb-1">Browse Services</p>
            <p className="text-sm text-blue-200">Discover new features</p>
          </div>
          <ArrowRight className="w-6 h-6" />
        </button>

        <button
          onClick={() => navigate('/dashboard/invoices')}
          className="p-6 bg-green-600 hover:bg-green-700 rounded-xl text-white transition-all hover:scale-105 flex items-center justify-between"
        >
          <div className="text-left">
            <p className="font-bold text-lg mb-1">View Invoices</p>
            <p className="text-sm text-green-200">Manage billing</p>
          </div>
          <ArrowRight className="w-6 h-6" />
        </button>

        <button
          onClick={() => navigate('/dashboard/support')}
          className="p-6 bg-purple-600 hover:bg-purple-700 rounded-xl text-white transition-all hover:scale-105 flex items-center justify-between"
        >
          <div className="text-left">
            <p className="font-bold text-lg mb-1">Get Support</p>
            <p className="text-sm text-purple-200">Contact our team</p>
          </div>
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}