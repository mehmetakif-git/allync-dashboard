import { Building2, Eye, Settings, TrendingUp, Users, DollarSign, Activity } from 'lucide-react';

interface ServiceContentTabProps {
  serviceData: any;
  onEdit: () => void;
  serviceGradient: string;
}

export function ServiceContentTab({ serviceData, onEdit, serviceGradient }: ServiceContentTabProps) {
  return (
    <div className="space-y-6">
      {/* Service Info Card */}
      <div className="bg-card backdrop-blur-xl border border-secondary rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Service Information</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="text-sm text-muted">Service Name (English)</label>
            <p className="text-white font-medium mt-1">{serviceData?.name_en}</p>
          </div>
          <div>
            <label className="text-sm text-muted">Service Name (Turkish)</label>
            <p className="text-white font-medium mt-1">{serviceData?.name_tr}</p>
          </div>
          <div className="col-span-2">
            <label className="text-sm text-muted">Description (English)</label>
            <p className="text-secondary mt-1">{serviceData?.description_en}</p>
          </div>
          <div className="col-span-2">
            <label className="text-sm text-muted">Description (Turkish)</label>
            <p className="text-secondary mt-1">{serviceData?.description_tr}</p>
          </div>
        </div>
      </div>

      {/* Features Card */}
      <div className="bg-card backdrop-blur-xl border border-secondary rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Features</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="text-sm text-muted mb-3 block">English</label>
            <ul className="space-y-2">
              {serviceData?.features_en?.map((feature: string, index: number) => (
                <li key={index} className="flex items-start gap-2 text-secondary">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <label className="text-sm text-muted mb-3 block">Turkish</label>
            <ul className="space-y-2">
              {serviceData?.features_tr?.map((feature: string, index: number) => (
                <li key={index} className="flex items-start gap-2 text-secondary">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Pricing Card */}
      <div className="bg-card backdrop-blur-xl border border-secondary rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Pricing Plans</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-primary/50 border border-secondary rounded-lg p-4">
            <div className="text-sm text-muted mb-1">Starter</div>
            <div className="text-2xl font-bold text-white">${serviceData?.pricing?.starter}</div>
            <div className="text-xs text-muted mt-1">per month</div>
          </div>
          <div className="bg-primary/50 border border-secondary rounded-lg p-4">
            <div className="text-sm text-muted mb-1">Professional</div>
            <div className="text-2xl font-bold text-white">${serviceData?.pricing?.professional}</div>
            <div className="text-xs text-muted mt-1">per month</div>
          </div>
          <div className="bg-primary/50 border border-secondary rounded-lg p-4">
            <div className="text-sm text-muted mb-1">Enterprise</div>
            <div className="text-2xl font-bold text-white">${serviceData?.pricing?.enterprise}</div>
            <div className="text-xs text-muted mt-1">per month</div>
          </div>
        </div>
      </div>

      {/* Delivery Time & Status */}
      <div className="bg-card backdrop-blur-xl border border-secondary rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Additional Information</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="text-sm text-muted">Delivery Time (English)</label>
            <p className="text-white font-medium mt-1">{serviceData?.delivery_time_en}</p>
          </div>
          <div>
            <label className="text-sm text-muted">Delivery Time (Turkish)</label>
            <p className="text-white font-medium mt-1">{serviceData?.delivery_time_tr}</p>
          </div>
          <div>
            <label className="text-sm text-muted">Service Status</label>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-1 ${
              serviceData?.status === 'active' ? 'bg-green-500/10 text-green-400 border border-green-500/30' :
              serviceData?.status === 'maintenance' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30' :
              'bg-red-500/10 text-red-400 border border-red-500/30'
            }`}>
              {serviceData?.status}
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={onEdit}
        className={`w-full px-6 py-3 bg-gradient-to-r ${serviceGradient} text-white rounded-lg font-medium hover:opacity-90 transition-opacity`}
      >
        Edit Content
      </button>
    </div>
  );
}

interface Company {
  id: string;
  name: string;
  instanceCount: number;
  status: string;
  plan: string;
}

interface CompaniesTabProps {
  companies: Company[];
  onViewDetails: (companyId: string) => void;
  onConfigure: (company: Company) => void;
  serviceGradient: string;
}

export function CompaniesTab({ companies, onViewDetails, onConfigure, serviceGradient }: CompaniesTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-white">Companies Using This Service</h3>
          <p className="text-muted text-sm mt-1">{companies.length} active companies</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map((company) => (
          <div
            key={company.id}
            className="bg-card backdrop-blur-xl border border-secondary rounded-xl p-6 hover:border-secondary transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-lg font-semibold text-white">{company.name}</h4>
                <p className="text-sm text-muted mt-1">
                  {company.instanceCount} {company.instanceCount === 1 ? 'instance' : 'instances'}
                </p>
              </div>
              <div className="flex flex-col gap-2 items-end">
                <span className={`px-2 py-1 rounded-full text-xs border ${
                  company.status === 'active'
                    ? 'bg-green-500/10 text-green-400 border-green-500/30'
                    : 'bg-gray-500/10 text-muted border-secondary/30'
                }`}>
                  {company.status}
                </span>
                <span className="text-xs text-muted">{company.plan}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => onViewDetails(company.id)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 hover:bg-hover text-white rounded-lg transition-colors"
              >
                <Eye className="w-4 h-4" />
                <span className="text-sm">Details</span>
              </button>
              <button
                onClick={() => onConfigure(company)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r ${serviceGradient} text-white rounded-lg hover:opacity-90 transition-opacity`}
              >
                <Settings className="w-4 h-4" />
                <span className="text-sm">Configure</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {companies.length === 0 && (
        <div className="bg-card backdrop-blur-xl border border-secondary rounded-xl p-12 text-center">
          <Building2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-muted mb-2">No Companies Yet</h3>
          <p className="text-muted">No companies are currently using this service.</p>
        </div>
      )}
    </div>
  );
}

interface AnalyticsTabProps {
  totalCompanies: number;
  totalInstances: number;
  totalRevenue: number;
  monthlyGrowth: number;
  serviceGradient: string;
}

export function AnalyticsTab({
  totalCompanies,
  totalInstances,
  totalRevenue,
  monthlyGrowth,
  serviceGradient
}: AnalyticsTabProps) {
  const usageData = [
    { month: 'Jan', instances: 8 },
    { month: 'Feb', instances: 10 },
    { month: 'Mar', instances: 9 },
    { month: 'Apr', instances: 12 },
    { month: 'May', instances: 11 },
    { month: 'Jun', instances: totalInstances },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card backdrop-blur-xl border border-secondary rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-muted">Total Companies</span>
          </div>
          <p className="text-3xl font-bold text-white">{totalCompanies}</p>
        </div>

        <div className="bg-card backdrop-blur-xl border border-secondary rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-5 h-5 text-green-400" />
            <span className="text-sm text-muted">Active Instances</span>
          </div>
          <p className="text-3xl font-bold text-white">{totalInstances}</p>
        </div>

        <div className="bg-card backdrop-blur-xl border border-secondary rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-5 h-5 text-yellow-400" />
            <span className="text-sm text-muted">Total Revenue</span>
          </div>
          <p className="text-3xl font-bold text-white">${totalRevenue}</p>
          <p className="text-xs text-muted mt-1">per month</p>
        </div>

        <div className="bg-card backdrop-blur-xl border border-secondary rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            <span className="text-sm text-muted">Monthly Growth</span>
          </div>
          <p className="text-3xl font-bold text-white">+{monthlyGrowth}%</p>
        </div>
      </div>

      {/* Usage Trend Chart */}
      <div className="bg-card backdrop-blur-xl border border-secondary rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-6">Usage Trend</h3>
        <div className="h-64 flex items-end justify-between gap-4">
          {usageData.map((data, index) => (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full bg-gray-700 rounded-t-lg relative" style={{ height: `${(data.instances / Math.max(...usageData.map(d => d.instances))) * 100}%` }}>
                <div className={`absolute inset-0 bg-gradient-to-t ${serviceGradient} rounded-t-lg opacity-80`} />
              </div>
              <span className="text-xs text-muted">{data.month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card backdrop-blur-xl border border-secondary rounded-xl p-6">
          <div className="text-sm text-muted mb-2">Starter Plan</div>
          <div className="text-2xl font-bold text-white mb-1">33%</div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full" style={{ width: '33%' }} />
          </div>
        </div>

        <div className="bg-card backdrop-blur-xl border border-secondary rounded-xl p-6">
          <div className="text-sm text-muted mb-2">Professional Plan</div>
          <div className="text-2xl font-bold text-white mb-1">50%</div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full" style={{ width: '50%' }} />
          </div>
        </div>

        <div className="bg-card backdrop-blur-xl border border-secondary rounded-xl p-6">
          <div className="text-sm text-muted mb-2">Enterprise Plan</div>
          <div className="text-2xl font-bold text-white mb-1">17%</div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div className="bg-purple-500 h-2 rounded-full" style={{ width: '17%' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
