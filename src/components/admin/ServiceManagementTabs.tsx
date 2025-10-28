import { useState } from 'react';
import { Building2, TrendingUp, DollarSign, Activity, Eye, Settings, X, Save, Loader2, Edit } from 'lucide-react';

// =====================================================
// TAB 1: OVERALL/ANALYTICS TAB
// =====================================================

interface OverallTabProps {
  totalCompanies: number;
  totalRevenue: number;
  activeSubscriptions: number;
  monthlyGrowth: number;
  serviceGradient: string;
  revenueByPackage?: {
    basic: number;
    standard: number;
    premium: number;
  };
}

export function OverallTab({
  totalCompanies,
  totalRevenue,
  activeSubscriptions,
  monthlyGrowth,
  serviceGradient,
  revenueByPackage = { basic: 0, standard: 0, premium: 0 }
}: OverallTabProps) {
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
          <p className="text-xs text-muted mt-1">Using this service</p>
        </div>

        <div className="bg-card backdrop-blur-xl border border-secondary rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-5 h-5 text-green-400" />
            <span className="text-sm text-muted">Active Subscriptions</span>
          </div>
          <p className="text-3xl font-bold text-white">{activeSubscriptions}</p>
          <p className="text-xs text-muted mt-1">Currently active</p>
        </div>

        <div className="bg-card backdrop-blur-xl border border-secondary rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-5 h-5 text-yellow-400" />
            <span className="text-sm text-muted">Total Revenue</span>
          </div>
          <p className="text-3xl font-bold text-white">${totalRevenue.toFixed(0)}</p>
          <p className="text-xs text-muted mt-1">Monthly recurring</p>
        </div>

        <div className="bg-card backdrop-blur-xl border border-secondary rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            <span className="text-sm text-muted">Monthly Growth</span>
          </div>
          <p className="text-3xl font-bold text-white">+{monthlyGrowth}%</p>
          <p className="text-xs text-muted mt-1">Compared to last month</p>
        </div>
      </div>

      {/* Revenue Distribution by Package */}
      <div className="bg-card backdrop-blur-xl border border-secondary rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-6">Revenue Distribution by Package</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-primary/50 border border-secondary rounded-lg p-6">
            <div className="text-sm text-muted mb-2">Basic Package</div>
            <div className="text-2xl font-bold text-white mb-1">${revenueByPackage.basic.toFixed(0)}</div>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: totalRevenue > 0 ? `${(revenueByPackage.basic / totalRevenue) * 100}%` : '0%' }}
              />
            </div>
            <p className="text-xs text-muted mt-2">
              {totalRevenue > 0 ? Math.round((revenueByPackage.basic / totalRevenue) * 100) : 0}% of total
            </p>
          </div>

          <div className="bg-primary/50 border border-secondary rounded-lg p-6">
            <div className="text-sm text-muted mb-2">Standard Package</div>
            <div className="text-2xl font-bold text-white mb-1">${revenueByPackage.standard.toFixed(0)}</div>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
              <div
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{ width: totalRevenue > 0 ? `${(revenueByPackage.standard / totalRevenue) * 100}%` : '0%' }}
              />
            </div>
            <p className="text-xs text-muted mt-2">
              {totalRevenue > 0 ? Math.round((revenueByPackage.standard / totalRevenue) * 100) : 0}% of total
            </p>
          </div>

          <div className="bg-primary/50 border border-secondary rounded-lg p-6">
            <div className="text-sm text-muted mb-2">Premium Package</div>
            <div className="text-2xl font-bold text-white mb-1">${revenueByPackage.premium.toFixed(0)}</div>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
              <div
                className="bg-purple-500 h-2 rounded-full transition-all"
                style={{ width: totalRevenue > 0 ? `${(revenueByPackage.premium / totalRevenue) * 100}%` : '0%' }}
              />
            </div>
            <p className="text-xs text-muted mt-2">
              {totalRevenue > 0 ? Math.round((revenueByPackage.premium / totalRevenue) * 100) : 0}% of total
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// TAB 2: COMPANIES TAB (with pricing management)
// =====================================================

interface CompanyWithPricing {
  id: string;
  name: string;
  status: string;
  customPricing?: {
    basic?: { price: number; period: string; currency: string };
    standard?: { price: number; period: string; currency: string };
    premium?: { price: number; period: string; currency: string };
  };
  activePackage?: string;
}

interface CompaniesTabProps {
  companies: CompanyWithPricing[];
  serviceGradient: string;
  onViewDetails: (companyId: string) => void;
  onSetPricing: (companyId: string, pricing: any) => Promise<void>;
}

export function CompaniesTab({
  companies,
  serviceGradient,
  onViewDetails,
  onSetPricing
}: CompaniesTabProps) {
  const [selectedCompany, setSelectedCompany] = useState<CompanyWithPricing | null>(null);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Pricing form state
  const [basicPrice, setBasicPrice] = useState('');
  const [basicPeriod, setBasicPeriod] = useState('month');
  const [standardPrice, setStandardPrice] = useState('');
  const [standardPeriod, setStandardPeriod] = useState('month');
  const [premiumPrice, setPremiumPrice] = useState('');
  const [premiumPeriod, setPremiumPeriod] = useState('month');

  const handleOpenPricingModal = (company: CompanyWithPricing) => {
    setSelectedCompany(company);

    // Populate form with existing pricing
    setBasicPrice(company.customPricing?.basic?.price?.toString() || '');
    setBasicPeriod(company.customPricing?.basic?.period || 'month');
    setStandardPrice(company.customPricing?.standard?.price?.toString() || '');
    setStandardPeriod(company.customPricing?.standard?.period || 'month');
    setPremiumPrice(company.customPricing?.premium?.price?.toString() || '');
    setPremiumPeriod(company.customPricing?.premium?.period || 'month');

    setShowPricingModal(true);
  };

  const handleSavePricing = async () => {
    if (!selectedCompany) return;

    try {
      setSaving(true);

      const pricing = {
        basic: basicPrice ? { price: parseFloat(basicPrice), period: basicPeriod, currency: 'USD' } : null,
        standard: standardPrice ? { price: parseFloat(standardPrice), period: standardPeriod, currency: 'USD' } : null,
        premium: premiumPrice ? { price: parseFloat(premiumPrice), period: premiumPeriod, currency: 'USD' } : null,
      };

      await onSetPricing(selectedCompany.id, pricing);

      setShowPricingModal(false);
      setSelectedCompany(null);
    } catch (error) {
      console.error('Error saving pricing:', error);
      alert('Failed to save pricing. Please try again.');
    } finally {
      setSaving(false);
    }
  };

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
                  {company.activePackage || 'No active package'}
                </p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs border ${
                company.status === 'active'
                  ? 'bg-green-500/10 text-green-400 border-green-500/30'
                  : 'bg-gray-500/10 text-muted border-secondary/30'
              }`}>
                {company.status}
              </span>
            </div>

            {/* Pricing Info */}
            <div className="mb-4 p-3 bg-primary/30 rounded-lg">
              <p className="text-xs text-muted mb-2 font-semibold">Custom Pricing</p>
              <div className="space-y-1">
                {company.customPricing?.basic && (
                  <p className="text-xs text-secondary">
                    Basic: ${company.customPricing.basic.price}/{company.customPricing.basic.period}
                  </p>
                )}
                {company.customPricing?.standard && (
                  <p className="text-xs text-secondary">
                    Standard: ${company.customPricing.standard.price}/{company.customPricing.standard.period}
                  </p>
                )}
                {company.customPricing?.premium && (
                  <p className="text-xs text-secondary">
                    Premium: ${company.customPricing.premium.price}/{company.customPricing.premium.period}
                  </p>
                )}
                {!company.customPricing?.basic && !company.customPricing?.standard && !company.customPricing?.premium && (
                  <p className="text-xs text-muted italic">No custom pricing set</p>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => onViewDetails(company.id)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 hover:bg-hover text-white rounded-lg transition-colors"
              >
                <Eye className="w-4 h-4" />
                <span className="text-sm">View</span>
              </button>
              <button
                onClick={() => handleOpenPricingModal(company)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r ${serviceGradient} text-white rounded-lg hover:opacity-90 transition-opacity`}
              >
                <Settings className="w-4 h-4" />
                <span className="text-sm">Set Pricing</span>
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

      {/* Pricing Modal */}
      {showPricingModal && selectedCompany && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-secondary rounded-2xl max-w-2xl w-full border border-secondary shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-secondary sticky top-0 bg-secondary z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">Set Custom Pricing</h3>
                  <p className="text-sm text-muted mt-1">{selectedCompany.name}</p>
                </div>
                <button
                  onClick={() => setShowPricingModal(false)}
                  className="text-muted hover:text-white"
                  disabled={saving}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Package */}
              <div className="bg-primary/50 border border-secondary rounded-xl p-4">
                <h4 className="text-white font-semibold mb-4">Basic Package</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted block mb-2">Price (USD)</label>
                    <input
                      type="number"
                      value={basicPrice}
                      onChange={(e) => setBasicPrice(e.target.value)}
                      placeholder="299"
                      className="w-full px-4 py-2 bg-secondary border border-secondary rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted block mb-2">Period</label>
                    <select
                      value={basicPeriod}
                      onChange={(e) => setBasicPeriod(e.target.value)}
                      className="w-full px-4 py-2 bg-secondary border border-secondary rounded-lg text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="month">Monthly</option>
                      <option value="year">Yearly</option>
                      <option value="one-time">One-time</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Standard Package */}
              <div className="bg-primary/50 border border-secondary rounded-xl p-4">
                <h4 className="text-white font-semibold mb-4">Standard Package</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted block mb-2">Price (USD)</label>
                    <input
                      type="number"
                      value={standardPrice}
                      onChange={(e) => setStandardPrice(e.target.value)}
                      placeholder="599"
                      className="w-full px-4 py-2 bg-secondary border border-secondary rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted block mb-2">Period</label>
                    <select
                      value={standardPeriod}
                      onChange={(e) => setStandardPeriod(e.target.value)}
                      className="w-full px-4 py-2 bg-secondary border border-secondary rounded-lg text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="month">Monthly</option>
                      <option value="year">Yearly</option>
                      <option value="one-time">One-time</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Premium Package */}
              <div className="bg-primary/50 border border-secondary rounded-xl p-4">
                <h4 className="text-white font-semibold mb-4">Premium Package</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted block mb-2">Price (USD)</label>
                    <input
                      type="number"
                      value={premiumPrice}
                      onChange={(e) => setPremiumPrice(e.target.value)}
                      placeholder="1299"
                      className="w-full px-4 py-2 bg-secondary border border-secondary rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted block mb-2">Period</label>
                    <select
                      value={premiumPeriod}
                      onChange={(e) => setPremiumPeriod(e.target.value)}
                      className="w-full px-4 py-2 bg-secondary border border-secondary rounded-lg text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="month">Monthly</option>
                      <option value="year">Yearly</option>
                      <option value="one-time">One-time</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <p className="text-sm text-blue-400">
                  💡 Leave price empty to use default pricing for that package. Custom pricing will override default pricing for this company only.
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-secondary flex gap-3 sticky bottom-0 bg-secondary">
              <button
                onClick={() => setShowPricingModal(false)}
                disabled={saving}
                className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePricing}
                disabled={saving}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Pricing
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =====================================================
// TAB 3: SERVICE CONTENT TAB
// =====================================================

interface ServiceContentTabProps {
  serviceData: {
    name_en: string;
    name_tr: string;
    description_en: string | null;
    description_tr: string | null;
    short_description_en: string | null;
    short_description_tr: string | null;
    features: any;
    pricing_basic: any;
    pricing_standard: any;
    pricing_premium: any;
    status: string;
    payment_type?: string;
  };
  onEdit: () => void;
  serviceGradient: string;
  showPricing?: boolean; // For one-time services (website/mobile), hide pricing
}

export function ServiceContentTab({
  serviceData,
  onEdit,
  serviceGradient,
  showPricing = true
}: ServiceContentTabProps) {
  return (
    <div className="space-y-6">
      {/* Service Info Card */}
      <div className="bg-card backdrop-blur-xl border border-secondary rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">Service Information</h3>
          <button
            onClick={onEdit}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-hover text-white rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit Content
          </button>
        </div>

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
            <label className="text-sm text-muted">Short Description (English)</label>
            <p className="text-secondary mt-1">{serviceData?.short_description_en || 'No short description'}</p>
          </div>
          <div className="col-span-2">
            <label className="text-sm text-muted">Short Description (Turkish)</label>
            <p className="text-secondary mt-1">{serviceData?.short_description_tr || 'No short description'}</p>
          </div>
          <div className="col-span-2">
            <label className="text-sm text-muted">Description (English)</label>
            <p className="text-secondary mt-1">{serviceData?.description_en || 'No description'}</p>
          </div>
          <div className="col-span-2">
            <label className="text-sm text-muted">Description (Turkish)</label>
            <p className="text-secondary mt-1">{serviceData?.description_tr || 'No description'}</p>
          </div>
        </div>
      </div>

      {/* Features Card */}
      {serviceData?.features && (
        <div className="bg-card backdrop-blur-xl border border-secondary rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Features</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-sm text-muted mb-3 block">English</label>
              <ul className="space-y-2">
                {serviceData?.features?.en?.map((feature: string, index: number) => (
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
                {serviceData?.features?.tr?.map((feature: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 text-secondary">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Default Pricing Card - Only show for recurring services */}
      {showPricing && (
        <div className="bg-card backdrop-blur-xl border border-secondary rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Default Pricing</h3>
          <p className="text-sm text-muted mb-4">These are default prices. You can set custom pricing per company in the Companies tab.</p>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-primary/50 border border-secondary rounded-lg p-4">
              <div className="text-sm text-muted mb-1">Basic</div>
              <div className="text-2xl font-bold text-white">
                ${serviceData?.pricing_basic?.price || 0}
              </div>
              <div className="text-xs text-muted mt-1">
                per {serviceData?.pricing_basic?.period || 'month'}
              </div>
            </div>

            <div className="bg-primary/50 border border-secondary rounded-lg p-4">
              <div className="text-sm text-muted mb-1">Standard</div>
              <div className="text-2xl font-bold text-white">
                ${serviceData?.pricing_standard?.price || 0}
              </div>
              <div className="text-xs text-muted mt-1">
                per {serviceData?.pricing_standard?.period || 'month'}
              </div>
            </div>

            <div className="bg-primary/50 border border-secondary rounded-lg p-4">
              <div className="text-sm text-muted mb-1">Premium</div>
              <div className="text-2xl font-bold text-white">
                ${serviceData?.pricing_premium?.price || 0}
              </div>
              <div className="text-xs text-muted mt-1">
                per {serviceData?.pricing_premium?.period || 'month'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Service Status */}
      <div className="bg-card backdrop-blur-xl border border-secondary rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Service Status</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="text-sm text-muted">Current Status</label>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-1 ${
              serviceData?.status === 'active' ? 'bg-green-500/10 text-green-400 border border-green-500/30' :
              serviceData?.status === 'maintenance' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30' :
              'bg-red-500/10 text-red-400 border border-red-500/30'
            }`}>
              {serviceData?.status}
            </span>
          </div>
          <div>
            <label className="text-sm text-muted">Payment Type</label>
            <p className="text-white font-medium mt-1 capitalize">{serviceData?.payment_type || 'Recurring'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
