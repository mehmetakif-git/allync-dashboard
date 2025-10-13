import { useState } from 'react';
import { Plus, Eye, X, Send, Paperclip, AlertCircle, Clock, CheckCircle, Star } from 'lucide-react';
import { tickets } from '../data/mockData';
import { Ticket } from '../types';

export default function Support() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'Open' | 'In Progress' | 'Resolved'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-red-500/20 text-red-400';
      case 'High':
        return 'bg-orange-500/20 text-orange-400';
      case 'Medium':
        return 'bg-yellow-500/20 text-yellow-400';
      default:
        return 'bg-gray-800/50 text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open':
        return 'bg-blue-500/20 text-blue-400';
      case 'In Progress':
        return 'bg-purple-500/20 text-purple-400';
      case 'Resolved':
        return 'bg-green-500/20 text-green-400';
      default:
        return 'bg-gray-800/50 text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Open':
        return <AlertCircle className="w-4 h-4" />;
      case 'In Progress':
        return <Clock className="w-4 h-4" />;
      case 'Resolved':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const filteredTickets =
    activeFilter === 'all'
      ? tickets
      : tickets.filter((t) => t.status === activeFilter);

  const handleViewTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setShowDetailModal(true);
  };

  return (
    <>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Support Tickets</h1>
            <p className="text-gray-400 mt-1">Manage and track support requests</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors transition-all transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Create Ticket
          </button>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl shadow-sm border border-gray-700 p-6">
          <div className="flex gap-2 mb-6">
            {[
              { id: 'all', label: 'All', count: tickets.length },
              { id: 'Open', label: 'Open', count: tickets.filter((t) => t.status === 'Open').length },
              {
                id: 'In Progress',
                label: 'In Progress',
                count: tickets.filter((t) => t.status === 'In Progress').length,
              },
              {
                id: 'Resolved',
                label: 'Resolved',
                count: tickets.filter((t) => t.status === 'Resolved').length,
              },
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeFilter === filter.id
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-gray-400 hover:bg-gray-800'
                }`}
              >
                {filter.label}{' '}
                <span
                  className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                    activeFilter === filter.id
                      ? 'bg-gray-900 bg-opacity-20'
                      : 'bg-gray-800'
                  }`}
                >
                  {filter.count}
                </span>
              </button>
            ))}
          </div>

          <div className="border border-gray-800 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-900/50 border-b border-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                    Ticket #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800/50 backdrop-blur-xl divide-y divide-gray-800">
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-white">{ticket.number}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white">{ticket.subject}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 text-xs rounded-full font-medium ${getPriorityColor(
                          ticket.priority
                        )}`}
                      >
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 text-xs rounded-full font-medium ${getStatusColor(
                          ticket.status
                        )}`}
                      >
                        {getStatusIcon(ticket.status)}
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {ticket.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleViewTicket(ticket)}
                        className="p-2 hover:bg-blue-500/10 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4 text-blue-400" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showCreateModal && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowCreateModal(false)}
          ></div>
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-gray-900 rounded-xl shadow-2xl z-50">
            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Create Support Ticket</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-800 rounded-lg"
              >
                <X className="w-6 h-6 text-gray-300" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Subject</label>
                <input
                  type="text"
                  placeholder="Brief description of your issue"
                  className="w-full px-4 py-2 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Category</label>
                  <select className="w-full px-4 py-2 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option>Technical</option>
                    <option>Billing</option>
                    <option>Feature Request</option>
                    <option>Bug</option>
                    <option>General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Priority</label>
                  <select className="w-full px-4 py-2 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Description
                </label>
                <textarea
                  rows={6}
                  placeholder="Provide detailed information about your issue..."
                  className="w-full px-4 py-2 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Attachments
                </label>
                <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer">
                  <Paperclip className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    PNG, JPG, PDF up to 10MB
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors transition-all transition-colors font-medium">
                  Submit Ticket
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-3 border border-gray-700 text-gray-400 rounded-lg hover:bg-gray-700/50 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {showDetailModal && selectedTicket && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowDetailModal(false)}
          ></div>
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl bg-gray-900 rounded-xl shadow-2xl z-50 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedTicket.number}</h2>
                  <p className="text-gray-400 mt-1">{selectedTicket.subject}</p>
                </div>
                <span
                  className={`px-3 py-1 text-sm rounded-full font-medium ${getStatusColor(
                    selectedTicket.status
                  )}`}
                >
                  {selectedTicket.status}
                </span>
                <span
                  className={`px-3 py-1 text-sm rounded-full font-medium ${getPriorityColor(
                    selectedTicket.priority
                  )}`}
                >
                  {selectedTicket.priority}
                </span>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-gray-800 rounded-lg"
              >
                <X className="w-6 h-6 text-gray-300" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-4 gap-4 p-4 bg-gray-900/50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Category</p>
                  <p className="font-medium text-white">{selectedTicket.category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Created By</p>
                  <p className="font-medium text-white">{selectedTicket.createdBy}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Created</p>
                  <p className="font-medium text-white">
                    {new Date(selectedTicket.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Last Updated</p>
                  <p className="font-medium text-white">
                    {new Date(selectedTicket.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-4">Conversation</h3>
                <div className="space-y-4">
                  {selectedTicket.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isSupport ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-4 ${
                          message.isSupport
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-800/50 text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-sm">{message.sender}</span>
                          <span
                            className={`text-xs ${
                              message.isSupport ? 'text-blue-300' : 'text-gray-400'
                            }`}
                          >
                            {new Date(message.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm">{message.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-4">Reply</h3>
                <textarea
                  rows={4}
                  placeholder="Type your reply..."
                  className="w-full px-4 py-2 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
                ></textarea>
                <div className="flex items-center justify-between">
                  <button className="flex items-center gap-2 px-4 py-2 text-gray-400 border border-gray-700 rounded-lg hover:bg-gray-700/50 transition-colors">
                    <Paperclip className="w-4 h-4" />
                    Attach File
                  </button>
                  <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium">
                      <Send className="w-4 h-4" />
                      Send Reply
                    </button>
                    {selectedTicket.status !== 'Resolved' && (
                      <button className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium">
                        Mark as Resolved
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {selectedTicket.status === 'Resolved' && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Rate Your Experience</h3>
                  <div className="flex items-center gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} className="p-1 hover:scale-110 transition-transform">
                        <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
                      </button>
                    ))}
                  </div>
                  <textarea
                    rows={3}
                    placeholder="Share your feedback (optional)"
                    className="w-full px-4 py-2 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
                  ></textarea>
                  <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium">
                    Submit Feedback
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
