import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Building2, RefreshCw, Download, FileText, Table2, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import {
  getRevenueStats,
  getMonthlyRevenue,
  getRevenueByService,
  getTopCompanies,
  getRevenueSourcesBreakdown,
  getCustomerRetentionMetrics,
  getGrowthMetrics,
  type MonthlyRevenue,
  type ServiceRevenue,
  type TopCompany,
  type RevenueStats,
  type RevenueSourcesBreakdown,
  type CustomerRetentionMetrics,
  type GrowthMetrics,
} from '../../lib/api/revenue';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function RevenueAnalytics() {
  // Data states
  const [stats, setStats] = useState<RevenueStats | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyRevenue[]>([]);
  const [serviceRevenue, setServiceRevenue] = useState<ServiceRevenue[]>([]);
  const [topCompanies, setTopCompanies] = useState<TopCompany[]>([]);
  const [revenueSources, setRevenueSources] = useState<RevenueSourcesBreakdown | null>(null);
  const [retentionMetrics, setRetentionMetrics] = useState<CustomerRetentionMetrics | null>(null);
  const [growthMetrics, setGrowthMetrics] = useState<GrowthMetrics | null>(null);

  // UI states
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'12' | '6' | '3'>('12');
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Fetch all data
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('📊 Fetching revenue analytics data...');

      const [
        statsData,
        monthlyDataResult,
        serviceRevenueData,
        topCompaniesData,
        revenueSourcesData,
        retentionData,
        growthData,
      ] = await Promise.all([
        getRevenueStats(),
        getMonthlyRevenue({ months: parseInt(timeRange) }),
        getRevenueByService(),
        getTopCompanies(8),
        getRevenueSourcesBreakdown(),
        getCustomerRetentionMetrics(),
        getGrowthMetrics(),
      ]);

      setStats(statsData);
      setMonthlyData(monthlyDataResult);
      setServiceRevenue(serviceRevenueData);
      setTopCompanies(topCompaniesData);
      setRevenueSources(revenueSourcesData);
      setRetentionMetrics(retentionData);
      setGrowthMetrics(growthData);

      console.log('✅ Revenue analytics data loaded successfully');
    } catch (err: any) {
      console.error('❌ Error fetching revenue analytics:', err);
      setError('Failed to load revenue analytics');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [timeRange]);

  // Format currency
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount.toFixed(0)}`;
  };

  // Export to Excel (XLSX)
  const exportToExcel = () => {
    if (!stats) return;

    setIsExporting(true);
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      
      // Create workbook
      const wb = XLSX.utils.book_new();

      // Sheet 1: Summary
      const summaryData = [
        ['REVENUE ANALYTICS REPORT'],
        [`Generated: ${new Date().toLocaleString()}`],
        [`Time Period: Last ${timeRange} Months`],
        [],
        ['REVENUE STATISTICS'],
        ['Metric', 'Value'],
        ['Total Revenue', `$${stats.total_revenue.toLocaleString()}`],
        ['Total Profit', `$${stats.total_profit.toLocaleString()}`],
        ['Profit Margin', `${((stats.total_profit / stats.total_revenue) * 100).toFixed(1)}%`],
        ['Average Monthly Revenue', `$${stats.avg_monthly_revenue.toLocaleString()}`],
        ['Growth Rate', `${stats.growth_rate}%`],
        ['Active Companies', stats.active_companies],
        ['Total Invoices', stats.total_invoices],
        ['Paid Invoices', stats.paid_invoices],
        ['Pending Invoices', stats.pending_invoices],
      ];
      const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
      ws1['!cols'] = [{ wch: 30 }, { wch: 20 }];
      XLSX.utils.book_append_sheet(wb, ws1, 'Summary');

      // Sheet 2: Monthly Revenue
      const monthlyDataForExcel = [
        ['MONTHLY REVENUE TREND'],
        [],
        ['Month', 'Revenue', 'Expenses', 'Profit', 'Invoice Count'],
        ...monthlyData.map(m => [
          m.month,
          m.revenue,
          m.expenses,
          m.profit,
          m.invoice_count
        ])
      ];
      const ws2 = XLSX.utils.aoa_to_sheet(monthlyDataForExcel);
      ws2['!cols'] = [{ wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(wb, ws2, 'Monthly Revenue');

      // Sheet 3: Service Revenue
      const serviceDataForExcel = [
        ['REVENUE BY SERVICE'],
        [],
        ['Service Name', 'Total Revenue', 'Active Subscriptions', 'Avg Price Per Month'],
        ...serviceRevenue.map(s => [
          s.service_name,
          s.revenue,
          s.active_subscriptions,
          s.avg_price
        ])
      ];
      const ws3 = XLSX.utils.aoa_to_sheet(serviceDataForExcel);
      ws3['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 20 }, { wch: 20 }];
      XLSX.utils.book_append_sheet(wb, ws3, 'Services');

      // Sheet 4: Top Companies
      const companiesDataForExcel = [
        ['TOP PERFORMING COMPANIES'],
        [],
        ['Rank', 'Company Name', 'Email', 'Total Spent', 'Monthly Spend', 'Services', 'Invoices', 'Growth Rate'],
        ...topCompanies.map((c, i) => [
          i + 1,
          c.name,
          c.email,
          c.total_spent,
          c.monthly_spend,
          c.services_count,
          c.invoice_count,
          `${c.growth_rate}%`
        ])
      ];
      const ws4 = XLSX.utils.aoa_to_sheet(companiesDataForExcel);
      ws4['!cols'] = [{ wch: 6 }, { wch: 25 }, { wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 10 }, { wch: 10 }, { wch: 12 }];
      XLSX.utils.book_append_sheet(wb, ws4, 'Top Companies');

      // Sheet 5: Metrics
      const metricsData = [
        ['BUSINESS METRICS'],
        [],
        ['REVENUE SOURCES'],
        ['Source', 'Amount', 'Percentage'],
        ['Subscriptions', revenueSources?.subscriptions || 0, `${revenueSources?.subscriptions_percentage}%`],
        ['One-time Services', revenueSources?.one_time || 0, `${revenueSources?.one_time_percentage}%`],
        ['Add-ons', revenueSources?.addons || 0, `${revenueSources?.addons_percentage}%`],
        [],
        ['CUSTOMER RETENTION'],
        ['Metric', 'Value'],
        ['Retention Rate', `${retentionMetrics?.retention_rate}%`],
        ['Churn Rate', `${retentionMetrics?.churn_rate}%`],
        ['Avg Lifetime Value', `$${retentionMetrics?.avg_lifetime_value.toLocaleString()}`],
        ['Customer Acquisition Cost', `$${retentionMetrics?.customer_acquisition_cost.toLocaleString()}`],
        ['Active Customers', retentionMetrics?.active_customers],
        ['Churned Customers', retentionMetrics?.churned_customers],
        [],
        ['GROWTH METRICS'],
        ['Metric', 'Value'],
        ['Month-over-Month Growth', `${growthMetrics?.mom_growth}%`],
        ['Year-over-Year Growth', `${growthMetrics?.yoy_growth}%`],
        ['New Customers This Month', growthMetrics?.new_customers_this_month],
        ['Upgrade Rate', `${growthMetrics?.upgrade_rate}%`],
      ];
      const ws5 = XLSX.utils.aoa_to_sheet(metricsData);
      ws5['!cols'] = [{ wch: 30 }, { wch: 20 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(wb, ws5, 'Metrics');

      // Write file
      XLSX.writeFile(wb, `revenue-analytics-${timestamp}.xlsx`);

      alert('✅ Excel file exported successfully!');
    } catch (err) {
      console.error('Export error:', err);
      alert('❌ Failed to export Excel. Make sure xlsx package is installed.');
    } finally {
      setIsExporting(false);
      setShowExportMenu(false);
    }
  };

  // Export to CSV (Improved formatting)
  const exportToCSV = () => {
    if (!stats) return;

    setIsExporting(true);
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      
      // Better CSV formatting with proper escaping
      const escapeCsv = (str: string) => {
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      let csv = '';
      
      // Header
      csv += 'REVENUE ANALYTICS REPORT\n';
      csv += `Generated:,${new Date().toLocaleString()}\n`;
      csv += `Time Period:,Last ${timeRange} Months\n`;
      csv += '\n';

      // Stats Section
      csv += 'REVENUE STATISTICS\n';
      csv += 'Metric,Value\n';
      csv += `Total Revenue,$${stats.total_revenue.toLocaleString()}\n`;
      csv += `Total Profit,$${stats.total_profit.toLocaleString()}\n`;
      csv += `Profit Margin,${((stats.total_profit / stats.total_revenue) * 100).toFixed(1)}%\n`;
      csv += `Average Monthly Revenue,$${stats.avg_monthly_revenue.toLocaleString()}\n`;
      csv += `Growth Rate,${stats.growth_rate}%\n`;
      csv += `Active Companies,${stats.active_companies}\n`;
      csv += `Total Invoices,${stats.total_invoices}\n`;
      csv += `Paid Invoices,${stats.paid_invoices}\n`;
      csv += `Pending Invoices,${stats.pending_invoices}\n`;
      csv += '\n';

      // Monthly Revenue
      csv += 'MONTHLY REVENUE TREND\n';
      csv += 'Month,Revenue,Expenses,Profit,Invoice Count\n';
      monthlyData.forEach(month => {
        csv += `${month.month},$${month.revenue.toLocaleString()},$${month.expenses.toLocaleString()},$${month.profit.toLocaleString()},${month.invoice_count}\n`;
      });
      csv += '\n';

      // Service Revenue
      csv += 'REVENUE BY SERVICE\n';
      csv += 'Service Name,Total Revenue,Active Subscriptions,Avg Price Per Month\n';
      serviceRevenue.forEach(service => {
        csv += `${escapeCsv(service.service_name)},$${service.revenue.toLocaleString()},${service.active_subscriptions},$${service.avg_price.toLocaleString()}\n`;
      });
      csv += '\n';

      // Top Companies
      csv += 'TOP PERFORMING COMPANIES\n';
      csv += 'Rank,Company Name,Email,Total Spent,Monthly Spend,Services,Invoices,Growth Rate\n';
      topCompanies.forEach((company, i) => {
        csv += `${i + 1},${escapeCsv(company.name)},${company.email},$${company.total_spent.toLocaleString()},$${company.monthly_spend.toLocaleString()},${company.services_count},${company.invoice_count},${company.growth_rate}%\n`;
      });
      csv += '\n';

      // Revenue Sources
      if (revenueSources) {
        csv += 'REVENUE SOURCES\n';
        csv += 'Source,Amount,Percentage\n';
        csv += `Subscriptions,$${revenueSources.subscriptions.toLocaleString()},${revenueSources.subscriptions_percentage}%\n`;
        csv += `One-time Services,$${revenueSources.one_time.toLocaleString()},${revenueSources.one_time_percentage}%\n`;
        csv += `Add-ons,$${revenueSources.addons.toLocaleString()},${revenueSources.addons_percentage}%\n`;
        csv += '\n';
      }

      // Retention Metrics
      if (retentionMetrics) {
        csv += 'CUSTOMER RETENTION\n';
        csv += 'Metric,Value\n';
        csv += `Retention Rate,${retentionMetrics.retention_rate}%\n`;
        csv += `Churn Rate,${retentionMetrics.churn_rate}%\n`;
        csv += `Avg Lifetime Value,$${retentionMetrics.avg_lifetime_value.toLocaleString()}\n`;
        csv += `Customer Acquisition Cost,$${retentionMetrics.customer_acquisition_cost.toLocaleString()}\n`;
        csv += `Active Customers,${retentionMetrics.active_customers}\n`;
        csv += `Churned Customers,${retentionMetrics.churned_customers}\n`;
        csv += '\n';
      }

      // Growth Metrics
      if (growthMetrics) {
        csv += 'GROWTH METRICS\n';
        csv += 'Metric,Value\n';
        csv += `Month-over-Month Growth,${growthMetrics.mom_growth}%\n`;
        csv += `Year-over-Year Growth,${growthMetrics.yoy_growth}%\n`;
        csv += `New Customers This Month,${growthMetrics.new_customers_this_month}\n`;
        csv += `Upgrade Rate,${growthMetrics.upgrade_rate}%\n`;
      }

      // Download
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `revenue-analytics-${timestamp}.csv`;
      link.click();

      alert('✅ CSV exported successfully!');
    } catch (err) {
      console.error('Export error:', err);
      alert('❌ Failed to export CSV');
    } finally {
      setIsExporting(false);
      setShowExportMenu(false);
    }
  };

  // Export to JSON
  const exportToJSON = () => {
    if (!stats) return;

    setIsExporting(true);
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const data = {
        generated_at: new Date().toISOString(),
        time_range: `${timeRange} months`,
        statistics: stats,
        monthly_revenue: monthlyData,
        service_revenue: serviceRevenue,
        top_companies: topCompanies,
        revenue_sources: revenueSources,
        retention_metrics: retentionMetrics,
        growth_metrics: growthMetrics,
      };

      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `revenue-analytics-${timestamp}.json`;
      link.click();

      alert('✅ JSON exported successfully!');
    } catch (err) {
      console.error('Export error:', err);
      alert('❌ Failed to export JSON');
    } finally {
      setIsExporting(false);
      setShowExportMenu(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-muted mt-4">Loading revenue analytics...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !stats) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Failed to Load Analytics</h2>
            <p className="text-muted mb-6">{error || 'Unknown error occurred'}</p>
            <button
              onClick={fetchData}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors shadow-lg shadow-blue-500/50"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Revenue Analytics</h1>
            <p className="text-muted mt-1">Comprehensive financial performance overview</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Export Menu */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={isExporting}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold flex items-center gap-2 transition-colors disabled:opacity-50 shadow-lg shadow-green-500/50"
              >
                {isExporting ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Export
                  </>
                )}
              </button>

              {showExportMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowExportMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-xl py-1 z-50">
                    <button
                      onClick={exportToExcel}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-green-400" />
                      <span>Export as Excel (.xlsx)</span>
                    </button>
                    <button
                      onClick={exportToCSV}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors"
                    >
                      <Table2 className="w-4 h-4 text-blue-400" />
                      <span>Export as CSV</span>
                    </button>
                    <button
                      onClick={exportToJSON}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors"
                    >
                      <FileText className="w-4 h-4 text-purple-400" />
                      <span>Export as JSON</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Time Range */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500"
            >
              <option value="3">Last 3 Months</option>
              <option value="6">Last 6 Months</option>
              <option value="12">Last 12 Months</option>
            </select>

            {/* Refresh */}
            <button
              onClick={fetchData}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5 text-muted" />
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[20px] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted text-sm">Total Revenue</p>
                <p className="text-3xl font-bold text-white mt-2">
                  {formatCurrency(stats.total_revenue)}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  {stats.growth_rate >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  )}
                  <span className={`text-sm ${stats.growth_rate >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {stats.growth_rate >= 0 ? '+' : ''}{stats.growth_rate}%
                  </span>
                </div>
              </div>
              <DollarSign className="w-12 h-12 text-green-500" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[20px] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted text-sm">Total Profit</p>
                <p className="text-3xl font-bold text-white mt-2">
                  {formatCurrency(stats.total_profit)}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 text-sm">
                    {((stats.total_profit / stats.total_revenue) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              <DollarSign className="w-12 h-12 text-blue-500" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[20px] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted text-sm">Avg Monthly</p>
                <p className="text-3xl font-bold text-white mt-2">
                  {formatCurrency(stats.avg_monthly_revenue)}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 text-sm">
                    {growthMetrics?.mom_growth.toFixed(1)}%
                  </span>
                </div>
              </div>
              <DollarSign className="w-12 h-12 text-purple-500" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[20px] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted text-sm">Active Companies</p>
                <p className="text-3xl font-bold text-white mt-2">{stats.active_companies}</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 text-sm">
                    +{growthMetrics?.new_customers_this_month} this month
                  </span>
                </div>
              </div>
              <Building2 className="w-12 h-12 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Revenue Trend Chart */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[20px] p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white">Revenue Trend</h2>
            <p className="text-muted text-sm mt-1">Monthly revenue, expenses, and profit over time</p>
          </div>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem',
                    color: '#fff',
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} name="Revenue" />
                <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} name="Expenses" />
                <Line type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={2} name="Profit" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted">No revenue data available for the selected period</p>
            </div>
          )}
        </div>

        {/* Revenue by Service & Top Companies */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue by Service */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[20px] p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white">Revenue by Service</h2>
              <p className="text-muted text-sm mt-1">Top performing services</p>
            </div>
            {serviceRevenue.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={serviceRevenue.slice(0, 8)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="service_name" 
                    stroke="#9CA3AF" 
                    angle={-45} 
                    textAnchor="end" 
                    height={100}
                    interval={0}
                  />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '0.5rem',
                      color: '#fff',
                    }}
                  />
                  <Bar dataKey="revenue" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted">No service revenue data available</p>
              </div>
            )}
          </div>

          {/* Top Companies */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[20px] p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white">Top Performing Companies</h2>
              <p className="text-muted text-sm mt-1">Highest revenue contributors</p>
            </div>
            {topCompanies.length > 0 ? (
              <div className="space-y-3 max-h-[350px] overflow-y-auto">
                {topCompanies.map((company, index) => (
                  <div key={company.id} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-primary/70 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 font-bold text-sm flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-medium truncate">{company.name}</h3>
                          <div className="flex items-center gap-3 mt-1 text-sm text-muted">
                            <span>{company.services_count} services</span>
                            <span>•</span>
                            <span>${company.monthly_spend}/mo</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {company.growth_rate > 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-400" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-400" />
                        )}
                        <span className={`font-medium ${company.growth_rate > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {company.growth_rate > 0 ? '+' : ''}{company.growth_rate}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Building2 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-muted">No company data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Revenue Sources, Retention, Growth */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Revenue Sources */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[20px] p-6">
            <h3 className="text-white font-medium mb-4">Revenue Sources</h3>
            {revenueSources ? (
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-muted text-sm">Subscriptions</span>
                    <span className="text-white font-medium">{revenueSources.subscriptions_percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${revenueSources.subscriptions_percentage}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-muted text-sm">One-time Services</span>
                    <span className="text-white font-medium">{revenueSources.one_time_percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full" 
                      style={{ width: `${revenueSources.one_time_percentage}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-muted text-sm">Add-ons</span>
                    <span className="text-white font-medium">{revenueSources.addons_percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${revenueSources.addons_percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted text-sm">No data available</p>
            )}
          </div>

          {/* Customer Retention */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[20px] p-6">
            <h3 className="text-white font-medium mb-4">Customer Retention</h3>
            {retentionMetrics ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted text-sm">Retention Rate</span>
                  <span className="text-white font-medium">{retentionMetrics.retention_rate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted text-sm">Churn Rate</span>
                  <span className="text-white font-medium">{retentionMetrics.churn_rate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted text-sm">Avg Lifetime Value</span>
                  <span className="text-white font-medium">{formatCurrency(retentionMetrics.avg_lifetime_value)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted text-sm">Customer Acquisition Cost</span>
                  <span className="text-white font-medium">{formatCurrency(retentionMetrics.customer_acquisition_cost)}</span>
                </div>
              </div>
            ) : (
              <p className="text-muted text-sm">No data available</p>
            )}
          </div>

          {/* Growth Metrics */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[20px] p-6">
            <h3 className="text-white font-medium mb-4">Growth Metrics</h3>
            {growthMetrics ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted text-sm">MoM Growth</span>
                  <span className="text-green-400 font-medium">
                    {growthMetrics.mom_growth >= 0 ? '+' : ''}{growthMetrics.mom_growth}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted text-sm">YoY Growth</span>
                  <span className="text-green-400 font-medium">
                    {growthMetrics.yoy_growth >= 0 ? '+' : ''}{growthMetrics.yoy_growth}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted text-sm">New Customers</span>
                  <span className="text-white font-medium">{growthMetrics.new_customers_this_month} this month</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted text-sm">Upgrade Rate</span>
                  <span className="text-green-400 font-medium">+{growthMetrics.upgrade_rate}%</span>
                </div>
              </div>
            ) : (
              <p className="text-muted text-sm">No data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}