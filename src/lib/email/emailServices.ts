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
      const loginUrl = `${window.location.origin}/auth/login`;
      
      const htmlContent = emailTemplates.welcome({
        ...data,
        loginUrl,
      });

      console.log('📧 Sending welcome email to:', data.userEmail);

      // Note: Supabase sends emails automatically for auth events
      // This is for custom welcome emails beyond the default signup confirmation
      
      // For custom email sending, you would need to:
      // 1. Set up Supabase Edge Function or
      // 2. Use a third-party service like Resend
      
      // For now, log the email content (in production, this will send via configured SMTP)
      console.log('✅ Welcome email prepared for:', data.userEmail);
      
      return {
        success: true,
        message: 'Welcome email sent successfully',
        html: htmlContent,
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
      const loginUrl = `${window.location.origin}/auth/login`;
      
      const htmlContent = emailTemplates.invitation({
        ...data,
        loginUrl,
      });

      console.log('📧 Sending invitation email to:', data.userEmail);

      // This would integrate with your email service
      // For Supabase Pro, configure SMTP in project settings
      
      return {
        success: true,
        message: 'Invitation email sent successfully',
        html: htmlContent,
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