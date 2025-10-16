import { useState } from 'react';
import { Send, Mail, User, Building2, Shield, Calendar, CheckCircle, Eye } from 'lucide-react';

interface InviteData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  role: 'COMPANY_ADMIN' | 'USER';
  customMessage: string;
}

const mockCompanies = [
  { id: 'c1', name: 'Tech Corp' },
  { id: 'c2', name: 'Digital Solutions Inc' },
  { id: 'c3', name: 'Innovation Labs' },
  { id: 'c4', name: 'Global Systems' },
  { id: 'c5', name: 'Future Dynamics' },
];

const defaultMessages = {
  COMPANY_ADMIN: `Hello {firstName},

You have been invited to join {company} on Allync as a Company Admin!

As a Company Admin, you will be able to:
- Manage company services and users
- View and pay invoices
- Request new services
- Contact support

Click the link below to set up your account:
{inviteLink}

Welcome to Allync!

Best regards,
The Allync Team`,
  USER: `Hello {firstName},

You have been invited to join {company} on Allync!

As a team member, you will be able to:
- Access company services
- View service reports
- Contact support

Click the link below to set up your account:
{inviteLink}

Welcome to Allync!

Best regards,
The Allync Team`,
};

export default function UserInvite() {
  const [inviteData, setInviteData] = useState<InviteData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    role: 'USER',
    customMessage: defaultMessages.USER,
  });
  const [showPreview, setShowPreview] = useState(false);
  const [recentInvites, setRecentInvites] = useState([
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah@techcorp.com',
      company: 'Tech Corp',
      role: 'USER',
      sentAt: '2024-12-14 10:30',
      status: 'pending',
    },
    {
      id: '2',
      name: 'Michael Chen',
      email: 'michael@digital.com',
      company: 'Digital Solutions Inc',
      role: 'COMPANY_ADMIN',
      sentAt: '2024-12-13 15:45',
      status: 'accepted',
    },
  ]);

  const handleRoleChange = (role: 'COMPANY_ADMIN' | 'USER') => {
    setInviteData({
      ...inviteData,
      role,
      customMessage: defaultMessages[role],
    });
  };

  const getEmailPreview = () => {
    let message = inviteData.customMessage;
    message = message.replace('{firstName}', inviteData.firstName || '[First Name]');
    message = message.replace('{company}', inviteData.company ? mockCompanies.find(c => c.id === inviteData.company)?.name || '[Company]' : '[Company]');
    message = message.replace('{inviteLink}', 'https://allync.ai/invite/abc123xyz');
    return message;
  };

  const handleSendInvite = () => {
    if (!inviteData.firstName || !inviteData.lastName || !inviteData.email || !inviteData.company) {
      alert('❌ Please fill in all required fields');
      return;
    }

    const companyName = mockCompanies.find(c => c.id === inviteData.company)?.name;

    if (!confirm(
      `📧 Send Invitation Email?\n\n` +
      `To: ${inviteData.firstName} ${inviteData.lastName}\n` +
      `Email: ${inviteData.email}\n` +
      `Company: ${companyName}\n` +
      `Role: ${inviteData.role === 'COMPANY_ADMIN' ? 'Company Admin' : 'Regular User'}\n\n` +
      `An invitation email will be sent from info@allyncai.com\n\n` +
      `Continue?`
    )) {
      return;
    }

    console.log('Sending invite via Resend.com API:', {
      from: 'info@allyncai.com',
      to: inviteData.email,
      subject: `You've been invited to join ${companyName} on Allync`,
      html: getEmailPreview().replace(/\n/g, '<br>'),
    });

    alert(
      `✅ Invitation Sent!\n\n` +
      `To: ${inviteData.firstName} ${inviteData.lastName}\n` +
      `Email: ${inviteData.email}\n` +
      `Company: ${companyName}\n` +
      `Role: ${inviteData.role}\n\n` +
      `📧 Email sent via Resend.com from info@allyncai.com\n\n` +
      `The user will receive an invitation email with setup instructions.`
    );

    setRecentInvites([
      {
        id: Date.now().toString(),
        name: `${inviteData.firstName} ${inviteData.lastName}`,
        email: inviteData.email,
        company: companyName || '',
        role: inviteData.role,
        sentAt: new Date().toLocaleString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }),
        status: 'pending',
      },
      ...recentInvites,
    ]);

    setInviteData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      company: '',
      role: 'USER',
      customMessage: defaultMessages.USER,
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Invite Users</h1>
          <p className="text-gray-400 mt-1">Send invitation emails to new Company Admins or Users</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-sm text-gray-400">Total Invites Sent</p>
          </div>
          <p className="text-3xl font-bold text-white">24</p>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-sm text-gray-400">Accepted</p>
          </div>
          <p className="text-3xl font-bold text-white">18</p>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-sm text-gray-400">Pending</p>
          </div>
          <p className="text-3xl font-bold text-white">6</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Send Invitation</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">User Role *</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleRoleChange('COMPANY_ADMIN')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    inviteData.role === 'COMPANY_ADMIN'
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  <Shield className="w-6 h-6 mx-auto mb-2" />
                  <p className="font-medium text-sm">Company Admin</p>
                  <p className="text-xs opacity-70 mt-1">Full access</p>
                </button>
                <button
                  onClick={() => handleRoleChange('USER')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    inviteData.role === 'USER'
                      ? 'bg-green-600 border-green-600 text-white'
                      : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  <User className="w-6 h-6 mx-auto mb-2" />
                  <p className="font-medium text-sm">Regular User</p>
                  <p className="text-xs opacity-70 mt-1">Limited access</p>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">First Name *</label>
                <input
                  type="text"
                  value={inviteData.firstName}
                  onChange={(e) => setInviteData({ ...inviteData, firstName: e.target.value })}
                  placeholder="John"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Last Name *</label>
                <input
                  type="text"
                  value={inviteData.lastName}
                  onChange={(e) => setInviteData({ ...inviteData, lastName: e.target.value })}
                  placeholder="Smith"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-red-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Email Address *</label>
              <input
                type="email"
                value={inviteData.email}
                onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                placeholder="john@company.com"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Phone Number</label>
              <input
                type="tel"
                value={inviteData.phone}
                onChange={(e) => setInviteData({ ...inviteData, phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Company *</label>
              <select
                value={inviteData.company}
                onChange={(e) => setInviteData({ ...inviteData, company: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-red-500"
              >
                <option value="">Select Company</option>
                {mockCompanies.map(company => (
                  <option key={company.id} value={company.id}>{company.name}</option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-400">Email Message</label>
                <button
                  onClick={() => setInviteData({ ...inviteData, customMessage: defaultMessages[inviteData.role] })}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  Reset to Default
                </button>
              </div>
              <textarea
                value={inviteData.customMessage}
                onChange={(e) => setInviteData({ ...inviteData, customMessage: e.target.value })}
                rows={8}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-red-500 resize-none font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-2">
                Available variables: {'{firstName}'}, {'{company}'}, {'{inviteLink}'}
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setShowPreview(true)}
                className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Preview Email
              </button>
              <button
                onClick={handleSendInvite}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send Invitation
              </button>
            </div>
          </div>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Recent Invitations</h2>

          <div className="space-y-3">
            {recentInvites.map((invite) => (
              <div key={invite.id} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-white">{invite.name}</p>
                    <p className="text-sm text-gray-400">{invite.email}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    invite.status === 'accepted'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {invite.status === 'accepted' ? 'Accepted' : 'Pending'}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    {invite.company}
                  </div>
                  <div className="flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    {invite.role === 'COMPANY_ADMIN' ? 'Company Admin' : 'User'}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {invite.sentAt.split(' ')[0]}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 max-w-2xl w-full">
            <h2 className="text-2xl font-bold text-white mb-6">Email Preview</h2>

            <div className="bg-white rounded-lg p-6 mb-6">
              <div className="border-b border-gray-200 pb-4 mb-4">
                <p className="text-sm text-gray-600"><strong>From:</strong> info@allyncai.com</p>
                <p className="text-sm text-gray-600"><strong>To:</strong> {inviteData.email || 'user@example.com'}</p>
                <p className="text-sm text-gray-600"><strong>Subject:</strong> You've been invited to join {mockCompanies.find(c => c.id === inviteData.company)?.name || '[Company]'} on Allync</p>
              </div>
              <div className="text-gray-800 whitespace-pre-wrap font-sans">
                {getEmailPreview()}
              </div>
            </div>

            <button
              onClick={() => setShowPreview(false)}
              className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
