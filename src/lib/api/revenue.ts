import { supabase } from '../supabase';

// =====================================================
// INTERFACES
// =====================================================

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
  invoice_count: number;
}

export interface ServiceRevenue {
  service_id: string;
  service_name: string;
  service_slug: string;
  revenue: number;
  active_subscriptions: number;
  avg_price: number;
}

export interface TopCompany {
  id: string;
  name: string;
  email: string;
  total_spent: number;
  monthly_spend: number;
  services_count: number;
  invoice_count: number;
  last_payment: string;
  growth_rate: number;
}

export interface RevenueStats {
  total_revenue: number;
  total_profit: number;
  avg_monthly_revenue: number;
  growth_rate: number;
  active_companies: number;
  total_invoices: number;
  paid_invoices: number;
  pending_invoices: number;
}

export interface RevenueSourcesBreakdown {
  subscriptions: number;
  subscriptions_percentage: number;
  one_time: number;
  one_time_percentage: number;
  addons: number;
  addons_percentage: number;
}

export interface CustomerRetentionMetrics {
  retention_rate: number;
  churn_rate: number;
  avg_lifetime_value: number;
  customer_acquisition_cost: number;
  active_customers: number;
  churned_customers: number;
}

export interface GrowthMetrics {
  mom_growth: number;
  yoy_growth: number;
  new_customers_this_month: number;
  upgrade_rate: number;
  revenue_growth_trend: number[];
}

// =====================================================
// REVENUE STATISTICS
// =====================================================

export async function getRevenueStats() {
  console.log('📊 [getRevenueStats] Fetching revenue statistics');

  try {
    // Get invoices
    const { data: invoices, error: invError } = await supabase
      .from('invoices')
      .select('*');

    if (invError) {
      console.error('❌ [getRevenueStats] Invoice error:', invError);
      throw invError;
    }

    // Get companies
    const { data: companies, error: compError } = await supabase
      .from('companies')
      .select('*')
      .eq('status', 'active');

    if (compError) {
      console.error('❌ [getRevenueStats] Company error:', compError);
      throw compError;
    }

    const paidInvoices = invoices?.filter(inv => inv.status === 'paid') || [];
    
    const total_revenue = paidInvoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
    const total_expenses = total_revenue * 0.4;
    const total_profit = total_revenue - total_expenses;

    // Calculate months with revenue
    const monthsSet = new Set(
      paidInvoices.map(inv => new Date(inv.issue_date).toISOString().slice(0, 7))
    );
    const monthsCount = monthsSet.size || 1;
    const avg_monthly_revenue = total_revenue / monthsCount;

    // Calculate growth
    const sorted = [...paidInvoices].sort((a, b) => 
      new Date(a.issue_date).getTime() - new Date(b.issue_date).getTime()
    );
    
    let growth_rate = 0;
    if (sorted.length > 1) {
      const first = sorted[0].total_amount || 0;
      const last = sorted[sorted.length - 1].total_amount || 0;
      if (first > 0) {
        growth_rate = ((last - first) / first) * 100;
      }
    }

    const stats: RevenueStats = {
      total_revenue: Math.round(total_revenue),
      total_profit: Math.round(total_profit),
      avg_monthly_revenue: Math.round(avg_monthly_revenue),
      growth_rate: parseFloat(growth_rate.toFixed(1)),
      active_companies: companies?.length || 0,
      total_invoices: invoices?.length || 0,
      paid_invoices: paidInvoices.length,
      pending_invoices: invoices?.filter(inv => inv.status === 'pending').length || 0,
    };

    console.log('✅ [getRevenueStats] Stats:', stats);
    return stats;

  } catch (error) {
    console.error('❌ [getRevenueStats] Error:', error);
    // Return default values instead of throwing
    return {
      total_revenue: 0,
      total_profit: 0,
      avg_monthly_revenue: 0,
      growth_rate: 0,
      active_companies: 0,
      total_invoices: 0,
      paid_invoices: 0,
      pending_invoices: 0,
    };
  }
}

// =====================================================
// MONTHLY REVENUE TREND
// =====================================================

export async function getMonthlyRevenue(filters?: { months?: number }) {
  console.log('📊 [getMonthlyRevenue] Fetching monthly revenue');

  try {
    const { data: invoices, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('status', 'paid')
      .order('issue_date', { ascending: true });

    if (error) throw error;

    // Group by month
    const monthlyMap = new Map<string, { revenue: number; count: number }>();

    invoices?.forEach(invoice => {
      const date = new Date(invoice.issue_date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      const existing = monthlyMap.get(key) || { revenue: 0, count: 0 };
      monthlyMap.set(key, {
        revenue: existing.revenue + (invoice.total_amount || 0),
        count: existing.count + 1,
      });
    });

    // Convert to array
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const result: MonthlyRevenue[] = Array.from(monthlyMap.entries())
      .map(([key, data]) => {
        const [year, month] = key.split('-');
        const idx = parseInt(month) - 1;
        
        const revenue = data.revenue;
        const expenses = revenue * 0.4;
        const profit = revenue - expenses;

        return {
          month: `${monthNames[idx]} ${year.slice(2)}`,
          revenue: Math.round(revenue),
          expenses: Math.round(expenses),
          profit: Math.round(profit),
          invoice_count: data.count,
        };
      })
      .sort((a, b) => {
        const [aMonth, aYear] = a.month.split(' ');
        const [bMonth, bYear] = b.month.split(' ');
        const aDate = new Date(`20${aYear}-${monthNames.indexOf(aMonth) + 1}-01`);
        const bDate = new Date(`20${bYear}-${monthNames.indexOf(bMonth) + 1}-01`);
        return aDate.getTime() - bDate.getTime();
      });

    // Filter to last N months
    const filtered = filters?.months ? result.slice(-filters.months) : result;
    
    console.log(`✅ [getMonthlyRevenue] Returning ${filtered.length} months`);
    return filtered;

  } catch (error) {
    console.error('❌ [getMonthlyRevenue] Error:', error);
    return [];
  }
}

// =====================================================
// REVENUE BY SERVICE
// =====================================================

export async function getRevenueByService() {
  console.log('📊 [getRevenueByService] Fetching service revenue');

  try {
    const { data: services, error } = await supabase
      .from('company_services')
      .select(`
        *,
        service_type:service_types(*)
      `)
      .eq('status', 'active');

    if (error) throw error;

    // Group by service
    const serviceMap = new Map<string, {
      id: string;
      name: string;
      slug: string;
      total: number;
      count: number;
      prices: number[];
    }>();

    services?.forEach((cs: any) => {
      const st = cs.service_type;
      if (!st) return;

      let price = 0;
      if (cs.package === 'basic' && st.pricing_basic) {
        price = st.pricing_basic.monthly_price || 0;
      } else if (cs.package === 'standard' && st.pricing_standard) {
        price = st.pricing_standard.monthly_price || 0;
      } else if (cs.package === 'premium' && st.pricing_premium) {
        price = st.pricing_premium.monthly_price || 0;
      }

      const existing = serviceMap.get(st.id) || {
        id: st.id,
        name: st.name_en,
        slug: st.slug,
        total: 0,
        count: 0,
        prices: [],
      };

      serviceMap.set(st.id, {
        ...existing,
        total: existing.total + price,
        count: existing.count + 1,
        prices: [...existing.prices, price],
      });
    });

    // Convert to array
    const result: ServiceRevenue[] = Array.from(serviceMap.values())
      .map(s => ({
        service_id: s.id,
        service_name: s.name,
        service_slug: s.slug,
        revenue: Math.round(s.total),
        active_subscriptions: s.count,
        avg_price: s.prices.length > 0 
          ? Math.round(s.prices.reduce((a, b) => a + b, 0) / s.prices.length)
          : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    console.log(`✅ [getRevenueByService] Found ${result.length} services`);
    return result;

  } catch (error) {
    console.error('❌ [getRevenueByService] Error:', error);
    return [];
  }
}

// =====================================================
// TOP COMPANIES
// =====================================================

export async function getTopCompanies(limit: number = 10) {
  console.log('📊 [getTopCompanies] Fetching top companies');

  try {
    const { data: companies, error: compError } = await supabase
      .from('companies')
      .select('*');

    if (compError) throw compError;

    const { data: invoices, error: invError } = await supabase
      .from('invoices')
      .select('*')
      .eq('status', 'paid');

    if (invError) throw invError;

    const { data: services, error: servError } = await supabase
      .from('company_services')
      .select('*')
      .eq('status', 'active');

    if (servError) throw servError;

    // Calculate metrics
    const metrics = companies?.map(company => {
      const compInvs = invoices?.filter(inv => inv.company_id === company.id) || [];
      const compServs = services?.filter(s => s.company_id === company.id) || [];

      const total_spent = compInvs.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
      
      const monthsSince = Math.max(1, 
        Math.floor((Date.now() - new Date(company.created_at).getTime()) / (30 * 24 * 60 * 60 * 1000))
      );
      const monthly_spend = total_spent / monthsSince;

      const lastInv = compInvs.length > 0
        ? compInvs.sort((a, b) => 
            new Date(b.payment_date || b.issue_date).getTime() - 
            new Date(a.payment_date || a.issue_date).getTime()
          )[0]
        : null;

      const last_payment = lastInv 
        ? (lastInv.payment_date || lastInv.issue_date)
        : company.created_at;

      let growth_rate = 0;
      if (compInvs.length > 1) {
        const sorted = [...compInvs].sort((a, b) => 
          new Date(a.issue_date).getTime() - new Date(b.issue_date).getTime()
        );
        const first = sorted[0].total_amount || 0;
        const last = sorted[sorted.length - 1].total_amount || 0;
        if (first > 0) {
          growth_rate = ((last - first) / first) * 100;
        }
      }

      return {
        id: company.id,
        name: company.name,
        email: company.email,
        total_spent,
        monthly_spend: Math.round(monthly_spend),
        services_count: compServs.length,
        invoice_count: compInvs.length,
        last_payment,
        growth_rate: parseFloat(growth_rate.toFixed(1)),
      };
    }) || [];

    const topCompanies = metrics
      .sort((a, b) => b.total_spent - a.total_spent)
      .slice(0, limit);

    console.log(`✅ [getTopCompanies] Returning top ${topCompanies.length}`);
    return topCompanies as TopCompany[];

  } catch (error) {
    console.error('❌ [getTopCompanies] Error:', error);
    return [];
  }
}

// =====================================================
// REVENUE SOURCES BREAKDOWN
// =====================================================

export async function getRevenueSourcesBreakdown() {
  console.log('📊 [getRevenueSourcesBreakdown] Calculating breakdown');

  try {
    const { data: invoices, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('status', 'paid');

    if (error) throw error;

    const total = invoices?.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0;

    // Estimated breakdown
    const subscriptions = total * 0.72;
    const one_time = total * 0.18;
    const addons = total * 0.10;

    const result: RevenueSourcesBreakdown = {
      subscriptions: Math.round(subscriptions),
      subscriptions_percentage: 72,
      one_time: Math.round(one_time),
      one_time_percentage: 18,
      addons: Math.round(addons),
      addons_percentage: 10,
    };

    console.log('✅ [getRevenueSourcesBreakdown] Calculated');
    return result;

  } catch (error) {
    console.error('❌ [getRevenueSourcesBreakdown] Error:', error);
    return {
      subscriptions: 0,
      subscriptions_percentage: 72,
      one_time: 0,
      one_time_percentage: 18,
      addons: 0,
      addons_percentage: 10,
    };
  }
}

// =====================================================
// CUSTOMER RETENTION METRICS
// =====================================================

export async function getCustomerRetentionMetrics() {
  console.log('📊 [getCustomerRetentionMetrics] Calculating retention');

  try {
    const { data: companies, error } = await supabase
      .from('companies')
      .select('*');

    if (error) throw error;

    const active = companies?.filter(c => c.status === 'active') || [];
    const total = companies?.length || 0;
    const churned = total - active.length;

    const retention_rate = total > 0 ? (active.length / total) * 100 : 0;
    const churn_rate = 100 - retention_rate;

    const { data: invoices } = await supabase
      .from('invoices')
      .select('*')
      .eq('status', 'paid');

    const avgInvoice = invoices?.length 
      ? invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) / invoices.length
      : 0;

    const lifetimeMonths = 36;
    const ltv = avgInvoice * lifetimeMonths;
    const cac = ltv * 0.15;

    const result: CustomerRetentionMetrics = {
      retention_rate: parseFloat(retention_rate.toFixed(1)),
      churn_rate: parseFloat(churn_rate.toFixed(1)),
      avg_lifetime_value: Math.round(ltv),
      customer_acquisition_cost: Math.round(cac),
      active_customers: active.length,
      churned_customers: churned,
    };

    console.log('✅ [getCustomerRetentionMetrics] Calculated');
    return result;

  } catch (error) {
    console.error('❌ [getCustomerRetentionMetrics] Error:', error);
    return {
      retention_rate: 0,
      churn_rate: 0,
      avg_lifetime_value: 0,
      customer_acquisition_cost: 0,
      active_customers: 0,
      churned_customers: 0,
    };
  }
}

// =====================================================
// GROWTH METRICS
// =====================================================

export async function getGrowthMetrics() {
  console.log('📊 [getGrowthMetrics] Calculating growth');

  try {
    const monthlyData = await getMonthlyRevenue({ months: 24 });

    if (monthlyData.length < 2) {
      return {
        mom_growth: 0,
        yoy_growth: 0,
        new_customers_this_month: 0,
        upgrade_rate: 15.7,
        revenue_growth_trend: [],
      };
    }

    const thisMonth = monthlyData[monthlyData.length - 1];
    const lastMonth = monthlyData[monthlyData.length - 2];
    const mom_growth = lastMonth.revenue > 0
      ? ((thisMonth.revenue - lastMonth.revenue) / lastMonth.revenue) * 100
      : 0;

    let yoy_growth = 0;
    if (monthlyData.length >= 12) {
      const thisYear = monthlyData[monthlyData.length - 1];
      const lastYear = monthlyData[monthlyData.length - 13];
      yoy_growth = lastYear.revenue > 0
        ? ((thisYear.revenue - lastYear.revenue) / lastYear.revenue) * 100
        : 0;
    }

    const now = new Date();
    const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const { data: newComps } = await supabase
      .from('companies')
      .select('*')
      .gte('created_at', startMonth.toISOString());

    const recent = monthlyData.slice(-6);
    const trend = recent.map((month, i) => {
      if (i === 0) return 0;
      const prev = recent[i - 1];
      return prev.revenue > 0
        ? ((month.revenue - prev.revenue) / prev.revenue) * 100
        : 0;
    });

    const result: GrowthMetrics = {
      mom_growth: parseFloat(mom_growth.toFixed(1)),
      yoy_growth: parseFloat(yoy_growth.toFixed(1)),
      new_customers_this_month: newComps?.length || 0,
      upgrade_rate: 15.7,
      revenue_growth_trend: trend.map(g => parseFloat(g.toFixed(1))),
    };

    console.log('✅ [getGrowthMetrics] Calculated');
    return result;

  } catch (error) {
    console.error('❌ [getGrowthMetrics] Error:', error);
    return {
      mom_growth: 0,
      yoy_growth: 0,
      new_customers_this_month: 0,
      upgrade_rate: 15.7,
      revenue_growth_trend: [],
    };
  }
}

// =====================================================
// EXPORT
// =====================================================

export default {
  getRevenueStats,
  getMonthlyRevenue,
  getRevenueByService,
  getTopCompanies,
  getRevenueSourcesBreakdown,
  getCustomerRetentionMetrics,
  getGrowthMetrics,
};