import { ArrowLeft, Settings, BarChart3, Users, Clock, TrendingUp, Activity, CheckCircle } from 'lucide-react';
import { serviceTypes } from '../data/services';

interface ServiceDashboardProps {
  slug: string;
  onBack: () => void;
}

export default function ServiceDashboard({ slug, onBack }: ServiceDashboardProps) {
  const service = serviceTypes.find(s => s.slug === slug);

  if (!service) {
    return (
      <div className="p-6 bg-gray-950 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Service Not Found</h1>
          <button onClick={onBack} className="text-blue-400 hover:underline">
            Back to Services
          </button>
        </div>
      </div>
    );
  }

  const Icon = service.icon;

  const mockStats: Record<string, Record<string, string | number>> = {
    'instagram-automation': {
      'Total Messages': 8732,
      'Followers': 15420,
      'Engagement Rate': '8.5%',
      'Posts Scheduled': 145,
    },
    'text-to-video': {
      'Videos Created': 342,
      'Total Duration': '12.5 hrs',
      'Avg Render Time': '45s',
      'Success Rate': '99.2%',
    },
    'text-to-image': {
      'Images Generated': 5234,
      'High Quality': 4892,
      'Avg Generation': '3.2s',
      'Storage Used': '24.5 GB',
    },
    'voice-cloning': {
      'Voices Cloned': 23,
      'Audio Generated': '8.5 hrs',
      'Languages': 12,
      'Accuracy': '98.5%',
    },
    'document-ai': {
      'Documents Processed': 1842,
      'Data Extracted': '45.2k fields',
      'Accuracy': '97.8%',
      'Processing Time': '2.1s avg',
    },
    'image-to-video': {
      'Videos Created': 523,
      'Images Processed': 8234,
      'Total Duration': '6.2 hrs',
      'Quality': '4K/HD',
    },
    'video-to-video': {
      'Videos Transformed': 234,
      'Total Duration': '18.5 hrs',
      'Styles Applied': 12,
      'Processing Time': '5.2 min avg',
    },
    'data-analysis': {
      'Datasets Analyzed': 145,
      'Insights Generated': 2341,
      'Models Trained': 23,
      'Accuracy': '94.5%',
    },
    'custom-ai': {
      'Custom Models': 8,
      'API Calls': 145234,
      'Uptime': '99.9%',
      'Response Time': '120ms',
    },
    'ecommerce': {
      'Products Listed': 523,
      'Orders': 1234,
      'Revenue': '$45,234',
      'Conversion': '3.2%',
    },
    'corporate-website': {
      'Page Views': 45234,
      'Unique Visitors': 12345,
      'Avg Session': '4.2 min',
      'Bounce Rate': '42%',
    },
    'mobile-app': {
      'Active Users': 8234,
      'Daily Sessions': 15432,
      'Avg Session': '8.5 min',
      'Retention': '65%',
    },
    'digital-marketing': {
      'Campaigns Active': 12,
      'Total Reach': '234k',
      'Engagement': '5.2%',
      'Conversions': 432,
    },
    'iot-solutions': {
      'Connected Devices': 234,
      'Data Points': '2.3M',
      'Uptime': '99.8%',
      'Alerts': 23,
    },
    'cloud-solutions': {
      'Services Running': 45,
      'Total Storage': '2.3 TB',
      'Bandwidth': '234 GB',
      'Cost Savings': '32%',
    },
    'ui-ux-design': {
      'Projects': 12,
      'Prototypes': 45,
      'User Tests': 234,
      'Satisfaction': '94%',
    },
    'maintenance-support': {
      'Tickets Resolved': 523,
      'Avg Response': '12 min',
      'Uptime': '99.95%',
      'Satisfaction': '96%',
    },
  };

  const stats = mockStats[slug] || {
    'Total Requests': 1245,
    'Active Users': 67,
    'Avg Time': '5.2s',
    'Success Rate': '98%',
  };

  return (
    <div className="p-6 space-y-6 bg-gray-950 min-h-screen">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </button>
          <div className={`w-12 h-12 bg-gradient-to-br ${service.color} rounded-xl flex items-center justify-center`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{service.name_en}</h1>
            <p className="text-gray-400 text-sm">{service.description_en}</p>
          </div>
        </div>
        <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg flex items-center gap-2 transition-colors">
          <Settings className="w-4 h-4" />
          Settings
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(stats).map(([key, value], idx) => (
          <div key={idx} className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400 text-sm">{key}</p>
              <Activity className="w-5 h-5 text-gray-500" />
            </div>
            <p className="text-3xl font-bold text-white">{value}</p>
            <div className="flex items-center gap-1 mt-2 text-green-400 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>+12% vs last month</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Active Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {service.features.map((feature, idx) => (
            <div key={idx} className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-lg">
              <div className={`w-10 h-10 bg-gradient-to-br ${service.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-medium">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
        <h3 className="text-lg font-bold text-blue-400 mb-2">Demo Dashboard</h3>
        <p className="text-gray-300">
          This is a demo dashboard for <strong>{service.name_en}</strong>.
          In production, this page will show real data, analytics, and service-specific controls.
        </p>
      </div>
    </div>
  );
}
