import { useState } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, TrendingUp, Users, BarChart3, Settings as SettingsIcon, Download } from 'lucide-react';
import { mockAppointmentRequests, mockCalendarStaff, mockAppointmentTypes } from '../../data/mockCalendarData';

export default function GoogleCalendar() {
  const [activeTab, setActiveTab] = useState('appointments');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredAppointments = statusFilter === 'all'
    ? mockAppointmentRequests
    : mockAppointmentRequests.filter(a => a.status === statusFilter);

  const stats = {
    total: mockAppointmentRequests.length,
    pending: mockAppointmentRequests.filter(a => a.status === 'pending').length,
    approved: mockAppointmentRequests.filter(a => a.status === 'approved').length,
    completed: mockAppointmentRequests.filter(a => a.status === 'completed').length,
    cancelled: mockAppointmentRequests.filter(a => a.status === 'cancelled').length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30';
      case 'approved': return 'bg-blue-500/10 text-blue-500 border-blue-500/30';
      case 'completed': return 'bg-green-500/10 text-green-500 border-green-500/30';
      case 'cancelled': return 'bg-red-500/10 text-red-500 border-red-500/30';
      case 'no_show': return 'bg-gray-500/10 text-gray-500 border-gray-500/30';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <AlertCircle className="w-4 h-4" />;
      case 'approved': return <Clock className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      case 'no_show': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-8 text-white mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                <Calendar className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">Google Calendar</h1>
                <p className="text-blue-100 text-lg">WhatsApp appointment booking & calendar management</p>
              </div>
            </div>
            <button className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition-colors flex items-center gap-2 backdrop-blur-sm">
              <Download className="w-5 h-5" />
              Export Data
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-gray-400">Total</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              <span className="text-sm text-gray-400">Pending</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.pending}</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-gray-400">Approved</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.approved}</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm text-gray-400">Completed</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.completed}</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <XCircle className="w-5 h-5 text-red-500" />
              <span className="text-sm text-gray-400">Cancelled</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.cancelled}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl mb-6">
          <div className="flex border-b border-gray-700">
            <button
              onClick={() => setActiveTab('appointments')}
              className={`px-6 py-3 font-medium transition-colors relative ${
                activeTab === 'appointments'
                  ? 'text-blue-500'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Appointments
              {activeTab === 'appointments' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-6 py-3 font-medium transition-colors relative ${
                activeTab === 'analytics'
                  ? 'text-blue-500'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Analytics
              {activeTab === 'analytics' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-6 py-3 font-medium transition-colors relative ${
                activeTab === 'settings'
                  ? 'text-blue-500'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Settings
              {activeTab === 'settings' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"></div>
              )}
            </button>
          </div>
        </div>

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div className="space-y-6">
            {/* Filter */}
            <div className="flex gap-2 overflow-x-auto">
              {['all', 'pending', 'approved', 'completed', 'cancelled'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status as any)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize whitespace-nowrap ${
                    statusFilter === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Appointments Table */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-900/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date & Time</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Staff</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Source</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {filteredAppointments.map((appointment) => (
                      <tr key={appointment.id} className="hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-white font-medium">{appointment.customer_name}</p>
                            <p className="text-sm text-gray-400">{appointment.customer_phone}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-white">{appointment.appointment_type}</p>
                          <p className="text-sm text-gray-400">{appointment.duration_minutes} min</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-white">{appointment.requested_date}</p>
                          <p className="text-sm text-gray-400">{appointment.requested_time}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-gray-300">
                            {appointment.assigned_to_staff_id
                              ? mockCalendarStaff.find(s => s.id === appointment.assigned_to_staff_id)?.name || 'Unassigned'
                              : 'Unassigned'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-2 w-fit ${getStatusColor(appointment.status)}`}>
                            {getStatusIcon(appointment.status)}
                            {appointment.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-gray-300">{appointment.source}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-gray-400">Completion Rate</span>
                </div>
                <p className="text-3xl font-bold text-white">85%</p>
                <p className="text-sm text-green-500 mt-1">↑ 12% from last month</p>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  <span className="text-sm text-gray-400">Avg Response Time</span>
                </div>
                <p className="text-3xl font-bold text-white">2.5 min</p>
                <p className="text-sm text-green-500 mt-1">↓ 30s from last month</p>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <BarChart3 className="w-5 h-5 text-purple-500" />
                  <span className="text-sm text-gray-400">Monthly Bookings</span>
                </div>
                <p className="text-3xl font-bold text-white">142</p>
                <p className="text-sm text-green-500 mt-1">↑ 24% from last month</p>
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Appointment Types Distribution</h3>
              <div className="space-y-4">
                {mockAppointmentTypes.map((type) => {
                  const count = mockAppointmentRequests.filter(a => a.appointment_type === type.name).length;
                  const percentage = (count / mockAppointmentRequests.length) * 100;
                  return (
                    <div key={type.name}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-300">{type.name}</span>
                        <span className="text-gray-400 text-sm">{count} bookings ({percentage.toFixed(0)}%)</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <div className="bg-gradient-to-r from-blue-500 to-blue-700 h-3 rounded-full" style={{ width: `${percentage}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
              <p className="text-yellow-500 text-sm">
                Note: Settings are view-only. Contact your system administrator or support to modify service configuration.
              </p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Calendar Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Google Calendar ID</label>
                  <input type="text" defaultValue="techcorp@google.com" className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Timezone</label>
                  <select className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white">
                    <option>Asia/Qatar</option>
                    <option>UTC</option>
                    <option>America/New_York</option>
                  </select>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-900 rounded-lg">
                  <div>
                    <p className="text-white font-medium">Auto-approve appointments</p>
                    <p className="text-sm text-gray-400">Automatically approve new appointment requests</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Staff Management</h3>
              <div className="space-y-3">
                {mockCalendarStaff.map((staff) => (
                  <div key={staff.id} className="flex items-center justify-between p-4 bg-gray-900 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-semibold">
                        {staff.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-white font-medium">{staff.name}</p>
                        <p className="text-sm text-gray-400">{staff.email}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      staff.is_active
                        ? 'bg-green-500/10 text-green-500 border border-green-500/30'
                        : 'bg-gray-500/10 text-gray-500 border border-gray-500/30'
                    }`}>
                      {staff.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Instance Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-400 mb-2">Connection Status</p>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-white font-medium">Connected</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-2">Last Connected</p>
                  <p className="text-white font-medium">2 hours ago</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-2">Service Status</p>
                  <span className="px-3 py-1 bg-green-500/10 text-green-500 border border-green-500/30 rounded-full text-xs font-medium">
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
