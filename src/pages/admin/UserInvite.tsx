import { useState } from 'react';
import { Send, Mail, UserPlus, Clock, CheckCircle2, XCircle } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

interface Invite {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  role: string;
  status: 'sent' | 'accepted' | 'expired';
  sentDate: string;
  sentBy: string;
}

const mockCompanies = [
  'Tech Innovators Inc',
  'Global Solutions Ltd',
  'Digital Marketing Pro',
  'E-Commerce Plus',
  'Creative Studios',
  'Data Analytics Corp',
];

const mockInvites: Invite[] = [
  {
    id: '1',
    firstName: 'Alice',
    lastName: 'Brown',
    email: 'alice.brown@techinnovators.com',
    company: 'Tech Innovators Inc',
    role: 'User',
    status: 'accepted',
    sentDate: '2024-03-15',
    sentBy: 'info@allyncai.com',
  },
  {
    id: '2',
    firstName: 'Bob',
    lastName: 'Wilson',
    email: 'bob.wilson@globalsolutions.com',
    company: 'Global Solutions Ltd',
    role: 'Company Admin',
    status: 'sent',
    sentDate: '2024-03-18',
    sentBy: 'info@allyncai.com',
  },
  {
    id: '3',
    firstName: 'Carol',
    lastName: 'Martinez',
    email: 'carol.m@digitalmarketingpro.com',
    company: 'Digital Marketing Pro',
    role: 'User',
    status: 'expired',
    sentDate: '2024-02-20',
    sentBy: 'info@allyncai.com',
  },
];

export default function UserInvite() {
  const [invites] = useState<Invite[]>(mockInvites);
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    role: 'user',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.company) {
      alert('Please fill in all required fields');
      return;
    }

    if (confirm(`Send invitation email to ${formData.email}?`)) {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsLoading(false);
      alert(`Invitation sent successfully to ${formData.email}`);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        company: '',
        role: 'user',
      });
    }
  };

  const emailPreview = `
Hi ${formData.firstName} ${formData.lastName},

You've been invited to join ${formData.company} on the Allync Platform!

Your account has been created with ${formData.role} privileges. Click the link below to set your password and get started:

[Set Password & Login]

If you didn't expect this invitation, you can safely ignore this email.

Best regards,
Allync Team
info@allyncai.com
  `.trim();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Invite Users</h1>
        <p className="text-gray-400 mt-1">Send invitations to new users via email</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-800 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <UserPlus className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-bold text-white">New Invitation</h2>
          </div>

          <form onSubmit={handleSendInvite} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">
                  First Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  placeholder="Enter first name"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">
                  Last Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  placeholder="Enter last name"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">
                Email Address <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                placeholder="user@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">
                Company <span className="text-red-400">*</span>
              </label>
              <select
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                required
              >
                <option value="">Select a company</option>
                {mockCompanies.map((company) => (
                  <option key={company} value={company}>
                    {company}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">
                Role <span className="text-red-400">*</span>
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                required
              >
                <option value="user">User</option>
                <option value="company_admin">Company Admin</option>
              </select>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <p className="text-blue-400 font-medium">Email will be sent from</p>
                  <p className="text-gray-300 text-sm mt-1">info@allyncai.com via Resend.com</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Sending Invitation...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Invitation
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 font-medium"
                disabled={isLoading}
              >
                {showPreview ? 'Hide' : 'Preview'}
              </button>
            </div>

            {showPreview && (
              <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                <h3 className="text-white font-medium mb-3">Email Preview</h3>
                <div className="bg-gray-900 rounded p-4 text-gray-300 text-sm whitespace-pre-line font-mono">
                  {emailPreview}
                </div>
              </div>
            )}
          </form>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Invitation Stats</h2>
          <div className="space-y-4">
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Sent</p>
                  <p className="text-2xl font-bold text-white mt-1">{invites.length}</p>
                </div>
                <Send className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Accepted</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {invites.filter(i => i.status === 'accepted').length}
                  </p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Pending</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {invites.filter(i => i.status === 'sent').length}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Expired</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {invites.filter(i => i.status === 'expired').length}
                  </p>
                </div>
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Recent Invitations</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">User</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Email</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Company</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Role</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Sent Date</th>
              </tr>
            </thead>
            <tbody>
              {invites.map((invite) => (
                <tr key={invite.id} className="border-b border-gray-700 hover:bg-gray-750">
                  <td className="py-4 px-4">
                    <p className="text-white font-medium">
                      {invite.firstName} {invite.lastName}
                    </p>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-gray-300 text-sm">{invite.email}</p>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-white">{invite.company}</p>
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-3 py-1 rounded-full text-sm bg-blue-500/20 text-blue-400">
                      {invite.role}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      invite.status === 'accepted' ? 'bg-green-500/20 text-green-400' :
                      invite.status === 'sent' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {invite.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-gray-300 text-sm">{invite.sentDate}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
