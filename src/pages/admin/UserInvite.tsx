import { useState, useEffect } from 'react';
import { Send, Mail, UserPlus, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getAllCompanies } from '../../lib/api/companies';
import { getInvites, createInvite } from '../../lib/api/users';
import { EmailService } from '../../lib/email';
import { supabase } from '../../lib/supabase';

interface Company {
  id: string;
  name: string;
  email: string;
}

interface Invite {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  company: {
    id: string;
    name: string;
  };
  role: string;
  status: 'sent' | 'accepted' | 'expired';
  created_at: string;
  inviter?: {
    id: string;
    full_name: string;
    email: string;
  };
}

export default function UserInvite() {
  // Data States
  const [companies, setCompanies] = useState<Company[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    role: 'user',
    password: '',
    sendEmail: true,
  });

  // UI States
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ===== UTILITY FUNCTIONS =====

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const showError = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(null), 5000);
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      console.log('📡 Fetching companies and invites...');
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
      
      // Fetch companies and invites in parallel
      const [companiesData, invitesData] = await Promise.all([
        getAllCompanies(),
        getInvites()
      ]);
      
      console.log('✅ Data fetched:', { 
        companies: companiesData?.length || 0, 
        invites: invitesData?.length || 0 
      });
      
      setCompanies(companiesData || []);
      setInvites(invitesData || []);
    } catch (err: any) {
      console.error('❌ Error fetching data:', err);
      showError(err.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  // ===== LIFECYCLE =====

  useEffect(() => {
    fetchData();
  }, []);

  // ===== HANDLERS =====

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.company || !formData.password) {
      showError('Please fill in all required fields including password');
      return;
    }

    if (!currentUserId) {
      showError('You must be logged in to send invitations');
      return;
    }

    // Confirm action
    const confirmMessage = formData.sendEmail
      ? `Send invitation email with credentials to ${formData.email}?`
      : `Create account for ${formData.email} without sending email?`;

    if (!confirm(confirmMessage)) return;

    setIsSubmitting(true);

    try {
      console.log('📤 Creating invite...');
      
      // Create invite in database
      const newInvite = await createInvite({
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        company_id: formData.company,
        role: formData.role as 'user' | 'company_admin',
        temporary_password: formData.password,
        invited_by: currentUserId,
      });

      console.log('✅ Invite created:', newInvite);

      // Send invitation email via Supabase
      if (formData.sendEmail) {
        try {
          const company = companies.find(c => c.id === formData.company);
          
          await EmailService.sendInvitationEmail({
            userName: `${formData.firstName} ${formData.lastName}`,
            userEmail: formData.email,
            companyName: company?.name || 'Allync AI',
            role: formData.role === 'company_admin' ? 'Company Admin' : 'User',
            temporaryPassword: formData.password,
            invitedBy: undefined, // Can fetch current user name if needed
          });

          console.log('📧 Invitation email sent successfully');
        } catch (emailError: any) {
          console.error('⚠️ Failed to send invitation email:', emailError);
          // Don't fail the entire process if email fails
          showError('Invite created but email failed to send. Please share credentials manually.');
        }
      }

      // Refresh invites list
      await fetchData();

      // Show success message
      const message = formData.sendEmail
        ? `Invitation sent successfully to ${formData.email}! 📧`
        : `Account created for ${formData.email}. Please share credentials manually.`;
      
      showSuccess(message);

      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        company: '',
        role: 'user',
        password: '',
        sendEmail: true,
      });
      setShowPreview(false);

    } catch (err: any) {
      console.error('❌ Error creating invite:', err);
      showError(err.message || 'Failed to create invitation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ===== DATA CALCULATIONS =====

  const selectedCompany = companies.find(c => c.id === formData.company);

  // Get email preview HTML
  const getEmailPreview = () => {
    if (!formData.firstName || !formData.email) {
      return 'Fill in the form to see email preview...';
    }

    return EmailService.getEmailPreview('invitation', {
      userName: `${formData.firstName} ${formData.lastName}`,
      userEmail: formData.email,
      companyName: selectedCompany?.name || '[Company Name]',
      role: formData.role === 'company_admin' ? 'Company Admin' : 'User',
      temporaryPassword: formData.password || '[Password]',
    });
  };

  // Statistics
  const stats = {
    total: invites.length,
    accepted: invites.filter(i => i.status === 'accepted').length,
    pending: invites.filter(i => i.status === 'sent').length,
    expired: invites.filter(i => i.status === 'expired').length,
  };

  // ===== LOADING STATE =====

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // ===== RENDER =====

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Invite Users</h1>
          <p className="text-gray-400 mt-1">Send formal invitations to new users via email</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-green-500 font-medium">Success!</p>
              <p className="text-green-400/70 text-sm">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
              <XCircle className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className="text-red-500 font-medium">Error!</p>
              <p className="text-red-400/70 text-sm">{errorMessage}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Invite Form */}
          <div className="lg:col-span-2 bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
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
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    placeholder="Enter first name"
                    disabled={isSubmitting}
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
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    placeholder="Enter last name"
                    disabled={isSubmitting}
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
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  placeholder="user@example.com"
                  disabled={isSubmitting}
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
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  disabled={isSubmitting}
                  required
                >
                  <option value="">Select a company</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
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
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  disabled={isSubmitting}
                  required
                >
                  <option value="user">User</option>
                  <option value="company_admin">Company Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">
                  Temporary Password <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter temporary password"
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  disabled={isSubmitting}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">User will be required to change this password on first login</p>
              </div>

              <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.sendEmail}
                    onChange={(e) => setFormData({ ...formData, sendEmail: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                    disabled={isSubmitting}
                  />
                  <div>
                    <p className="text-white font-medium">Send invitation email</p>
                    <p className="text-gray-400 text-xs">Email will include login credentials and instructions</p>
                  </div>
                </label>
              </div>

              {formData.sendEmail ? (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-blue-400 mt-0.5" />
                    <div>
                      <p className="text-blue-400 font-medium">Email will be sent via Supabase</p>
                      <p className="text-gray-300 text-sm mt-1">From: info@allyncai.com (via SMTP)</p>
                      <p className="text-gray-400 text-xs mt-2">Professional HTML email with branded template</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-orange-400 mt-0.5" />
                    <div>
                      <p className="text-orange-400 font-medium">No email will be sent</p>
                      <p className="text-gray-300 text-sm mt-1">You will need to share the credentials manually</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-all disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
                  className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {showPreview ? 'Hide Preview' : 'Preview Email'}
                </button>
              </div>

              {showPreview && (
                <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
                  <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-blue-400" />
                    Email Preview (HTML)
                  </h3>
                  <div 
                    className="bg-white rounded p-4 text-sm overflow-auto max-h-96"
                    dangerouslySetInnerHTML={{ __html: getEmailPreview() }}
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    This is how the email will appear to the recipient
                  </p>
                </div>
              )}
            </form>
          </div>

          {/* Statistics */}
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Invitation Stats</h2>
            <div className="space-y-4">
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Sent</p>
                    <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
                  </div>
                  <Send className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Accepted</p>
                    <p className="text-2xl font-bold text-white mt-1">{stats.accepted}</p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
              </div>
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Pending</p>
                    <p className="text-2xl font-bold text-white mt-1">{stats.pending}</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-500" />
                </div>
              </div>
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Expired</p>
                    <p className="text-2xl font-bold text-white mt-1">{stats.expired}</p>
                  </div>
                  <XCircle className="w-8 h-8 text-red-500" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Invitations */}
        <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Recent Invitations</h2>
          {invites.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-white font-medium mb-2">No invitations yet</p>
              <p className="text-gray-400 text-sm">Sent invitations will appear here</p>
            </div>
          ) : (
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
                    <tr key={invite.id} className="border-b border-gray-700 hover:bg-gray-900/30 transition-colors">
                      <td className="py-4 px-4">
                        <p className="text-white font-medium">
                          {invite.first_name} {invite.last_name}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-gray-300 text-sm">{invite.email}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-white">{invite.company.name}</p>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-3 py-1 rounded-full text-sm bg-blue-500/20 border border-blue-500/30 text-blue-400">
                          {invite.role === 'company_admin' ? 'Company Admin' : 'User'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          invite.status === 'accepted' ? 'bg-green-500/20 border border-green-500/30 text-green-400' :
                          invite.status === 'sent' ? 'bg-yellow-500/20 border border-yellow-500/30 text-yellow-400' :
                          'bg-red-500/20 border border-red-500/30 text-red-400'
                        }`}>
                          {invite.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-gray-300 text-sm">
                          {new Date(invite.created_at).toLocaleDateString()}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}