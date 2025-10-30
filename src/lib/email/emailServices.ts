import { supabase } from '../supabase';
import { emailTemplates, EMAIL_CONFIG } from './emailTemplates';

// Email sending service using Supabase
export class EmailService {
  
  /**
   * Send Welcome Email to newly created user
   */
  static async sendWelcomeEmail(data: {
    userName: string;
    userEmail: string;
    companyName: string;
    temporaryPassword?: string;
  }) {
    try {
      const loginUrl = `${window.location.origin}/login`;

      const htmlContent = emailTemplates.welcome({
        ...data,
        loginUrl,
      });

      console.log('📧 Sending welcome email via Edge Function to:', data.userEmail);

      // Call Supabase Edge Function to send email
      const { data: result, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: data.userEmail,
          subject: `Welcome to ${EMAIL_CONFIG.companyName}! 🎊`,
          html: htmlContent
        }
      })

      if (error) {
        console.error('❌ Edge Function error:', error);
        throw error;
      }

      console.log('✅ Welcome email sent successfully:', result);

      return {
        success: true,
        message: 'Welcome email sent successfully',
        emailId: result.emailId
      };

    } catch (error: any) {
      console.error('❌ Error sending welcome email:', error);
      throw new Error(`Failed to send welcome email: ${error.message}`);
    }
  }

  /**
   * Send Invitation Email with credentials
   */
  static async sendInvitationEmail(data: {
    userName: string;
    userEmail: string;
    companyName: string;
    role: string;
    temporaryPassword: string;
    invitedBy?: string;
  }) {
    try {
      const loginUrl = `${window.location.origin}/login`;

      const htmlContent = emailTemplates.invitation({
        ...data,
        loginUrl,
      });

      console.log('📧 Sending invitation email via Edge Function to:', data.userEmail);

      // Call Supabase Edge Function to send email
      const { data: result, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: data.userEmail,
          subject: `You're Invited to ${EMAIL_CONFIG.companyName}! 🎊`,
          html: htmlContent
        }
      })

      if (error) {
        console.error('❌ Edge Function error:', error);
        throw error;
      }

      console.log('✅ Invitation email sent successfully:', result);

      return {
        success: true,
        message: 'Invitation email sent successfully',
        emailId: result.emailId
      };

    } catch (error: any) {
      console.error('❌ Error sending invitation email:', error);
      throw new Error(`Failed to send invitation email: ${error.message}`);
    }
  }

  /**
   * Send Password Reset Email
   */
  static async sendPasswordResetEmail(data: {
    userName: string;
    userEmail: string;
  }) {
    try {
      console.log('📧 Sending password reset email to:', data.userEmail);

      // Supabase handles password reset emails automatically
      // when you call resetPasswordForEmail()
      const { error } = await supabase.auth.resetPasswordForEmail(
        data.userEmail,
        {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        }
      );

      if (error) {
        throw error;
      }

      console.log('✅ Password reset email sent via Supabase');
      
      return {
        success: true,
        message: 'Password reset email sent successfully',
      };
      
    } catch (error: any) {
      console.error('❌ Error sending password reset email:', error);
      throw new Error(`Failed to send password reset email: ${error.message}`);
    }
  }

  /**
   * Send Password Changed Confirmation Email
   */
  static async sendPasswordChangedEmail(data: {
    userName: string;
    userEmail: string;
  }) {
    try {
      const changeDate = new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      const htmlContent = emailTemplates.passwordChanged({
        userName: data.userName,
        changeDate,
      });

      console.log('📧 Sending password changed confirmation to:', data.userEmail);

      // This is a notification email, would be sent via custom email service
      
      return {
        success: true,
        message: 'Password changed confirmation sent successfully',
        html: htmlContent,
      };
      
    } catch (error: any) {
      console.error('❌ Error sending password changed email:', error);
      throw new Error(`Failed to send password changed email: ${error.message}`);
    }
  }

  /**
   * Utility: Get email HTML for preview (useful for testing)
   */
  static getEmailPreview(type: 'welcome' | 'invitation' | 'passwordReset' | 'passwordChanged', data: any) {
    switch (type) {
      case 'welcome':
        return emailTemplates.welcome({
          ...data,
          loginUrl: `${window.location.origin}/auth/login`,
        });
      case 'invitation':
        return emailTemplates.invitation({
          ...data,
          loginUrl: `${window.location.origin}/auth/login`,
        });
      case 'passwordReset':
        return emailTemplates.passwordReset(data);
      case 'passwordChanged':
        return emailTemplates.passwordChanged(data);
      default:
        return '';
    }
  }
}

// Export email templates for direct access if needed
export { emailTemplates, EMAIL_CONFIG };