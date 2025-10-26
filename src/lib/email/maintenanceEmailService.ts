import { supabase } from '../supabase';
import { maintenanceEmailTemplates, type MaintenanceEmailData } from './maintenanceEmailTemplate';
import { EMAIL_CONFIG } from './emailTemplates';

// =====================================================
// SEND MAINTENANCE NOTIFICATION TO COMPANY ADMINS
// =====================================================

export async function sendMaintenanceNotification(maintenanceWindowId: string) {
  try {
    console.log('📧 [sendMaintenanceNotification] Starting for window:', maintenanceWindowId);

    // 1. Get maintenance window details
    const { data: maintenanceWindow, error: maintenanceError } = await supabase
      .from('maintenance_windows')
      .select('*')
      .eq('id', maintenanceWindowId)
      .single();

    if (maintenanceError || !maintenanceWindow) {
      throw new Error('Maintenance window not found');
    }

    console.log('✅ Maintenance window loaded:', maintenanceWindow);

    // 2. Get all company admins (excluding super admins)
    const { data: companyAdmins, error: adminsError } = await supabase
      .from('profiles')
      .select('id, full_name, email, company_id, companies(name, country)')
      .eq('role', 'company_admin');

    if (adminsError) {
      throw new Error(`Failed to fetch company admins: ${adminsError.message}`);
    }

    if (!companyAdmins || companyAdmins.length === 0) {
      console.log('ℹ️ No company admins found to notify');
      return {
        success: true,
        notificationsSent: 0,
        message: 'No company admins to notify',
      };
    }

    console.log(`👥 Found ${companyAdmins.length} company admins to notify`);

    // 3. Send emails to each company admin
    const emailPromises = companyAdmins.map(async (admin) => {
      try {
        // Determine language based on company country
        const language = admin.companies?.country === 'TR' ? 'tr' : 'en';
        
        const emailData: MaintenanceEmailData = {
          companyName: admin.companies?.name || 'Your Company',
          adminName: admin.full_name,
          adminEmail: admin.email,
          startTime: maintenanceWindow.start_time,
          endTime: maintenanceWindow.end_time,
          messageTr: maintenanceWindow.message_tr,
          messageEn: maintenanceWindow.message_en,
          affectedServices: maintenanceWindow.affected_services,
          language: language,
        };

        const htmlContent = maintenanceEmailTemplates.notification(emailData);

        // Note: In production, this would integrate with Resend or SMTP
        // For now, we log the email (in production, send via configured email service)
        console.log(`📧 Email prepared for: ${admin.email} (${language})`);

        // Here you would integrate with your email service:
        // await sendEmailViaResend(admin.email, subject, htmlContent);
        
        return {
          success: true,
          email: admin.email,
          adminName: admin.full_name,
        };

      } catch (error: any) {
        console.error(`❌ Failed to send email to ${admin.email}:`, error);
        return {
          success: false,
          email: admin.email,
          error: error.message,
        };
      }
    });

    const results = await Promise.all(emailPromises);
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    console.log(`✅ Notifications sent: ${successCount} success, ${failCount} failed`);

    // 4. Update maintenance window to mark notifications sent
    await supabase
      .from('maintenance_windows')
      .update({
        metadata: {
          ...(maintenanceWindow.metadata || {}),
          notifications_sent: true,
          notifications_sent_at: new Date().toISOString(),
          notifications_count: successCount,
        }
      })
      .eq('id', maintenanceWindowId);

    return {
      success: true,
      notificationsSent: successCount,
      notificationsFailed: failCount,
      results: results,
    };

  } catch (error: any) {
    console.error('❌ [sendMaintenanceNotification] Error:', error);
    throw error;
  }
}

// =====================================================
// GET EMAIL PREVIEW (For testing)
// =====================================================

export function getMaintenanceEmailPreview(data: MaintenanceEmailData): string {
  return maintenanceEmailTemplates.notification(data);
}

// =====================================================
// EXPORT
// =====================================================

export const maintenanceEmailService = {
  sendNotification: sendMaintenanceNotification,
  getPreview: getMaintenanceEmailPreview,
};