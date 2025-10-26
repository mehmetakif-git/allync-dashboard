// Maintenance Notification Email Template
// Bilingual support (TR/EN)

import { EMAIL_CONFIG } from './emailTemplates';

export interface MaintenanceEmailData {
  companyName: string;
  adminName: string;
  adminEmail: string;
  startTime: string;
  endTime: string;
  messageTr: string;
  messageEn: string;
  affectedServices: string[] | null;
  language: 'tr' | 'en';
}

const translations = {
  tr: {
    subject: '🚧 Planlı Bakım Bildirimi',
    title: 'Planlı Sistem Bakımı',
    greeting: 'Sayın',
    intro: 'Sistemimizde planlı bir bakım yapılacağını bildirmek isteriz.',
    startTime: 'Başlangıç Zamanı',
    endTime: 'Bitiş Zamanı',
    duration: 'Süre',
    affectedServices: 'Etkilenecek Servisler',
    allServices: 'Tüm Servisler',
    message: 'Bakım Mesajı',
    whatToExpect: 'Ne Beklemeli?',
    expectPoint1: 'Bakım süresi boyunca sisteme erişim sağlayamayacaksınız',
    expectPoint2: 'Tüm verileriniz güvende, herhangi bir veri kaybı olmayacak',
    expectPoint3: 'Bakım tamamlandığında normal şekilde giriş yapabileceksiniz',
    apology: 'Anlayışınız için teşekkür ederiz.',
    questions: 'Sorularınız için bizimle iletişime geçebilirsiniz',
  },
  en: {
    subject: '🚧 Scheduled Maintenance Notification',
    title: 'Scheduled System Maintenance',
    greeting: 'Dear',
    intro: 'We would like to inform you about a scheduled maintenance on our system.',
    startTime: 'Start Time',
    endTime: 'End Time',
    duration: 'Duration',
    affectedServices: 'Affected Services',
    allServices: 'All Services',
    message: 'Maintenance Message',
    whatToExpect: 'What to Expect?',
    expectPoint1: 'You will not be able to access the system during maintenance',
    expectPoint2: 'All your data is safe, there will be no data loss',
    expectPoint3: 'You will be able to log in normally after maintenance is completed',
    apology: 'Thank you for your understanding.',
    questions: 'Feel free to contact us if you have any questions',
  },
};

function formatDate(dateString: string, language: 'tr' | 'en'): string {
  const date = new Date(dateString);
  return date.toLocaleString(language === 'tr' ? 'tr-TR' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function calculateDuration(start: string, end: string, language: 'tr' | 'en'): string {
  const diff = new Date(end).getTime() - new Date(start).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (language === 'tr') {
    if (hours > 0) {
      return `${hours} saat ${minutes} dakika`;
    }
    return `${minutes} dakika`;
  } else {
    if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  }
}

export function createMaintenanceNotificationEmail(data: MaintenanceEmailData): string {
  const t = translations[data.language];
  const duration = calculateDuration(data.startTime, data.endTime, data.language);
  const message = data.language === 'tr' ? data.messageTr : data.messageEn;

  const content = `
<!DOCTYPE html>
<html lang="${data.language}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t.subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f7;">
  
  <!-- Email Container -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f7; padding: 40px 20px;">
    <tr>
      <td align="center">
        
        <!-- Main Email Card -->
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
          
          <!-- Header Image -->
          <tr>
            <td style="padding: 0; line-height: 0;">
              <img src="${EMAIL_CONFIG.logoUrl}" 
                   width="600" 
                   alt="Allync AI - AI-Powered Business Automation" 
                   style="display: block; width: 100%; max-width: 600px; height: auto; border-radius: 16px 16px 0 0;">
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 50px 40px;">
              
              <!-- Warning Icon & Title -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td align="center">
                    <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); width: 80px; height: 80px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px; box-shadow: 0 4px 15px rgba(251, 191, 36, 0.3);">
                      <span style="font-size: 48px; line-height: 1;">🚧</span>
                    </div>
                    <h2 style="color: #1a1a1a; margin: 0; font-size: 28px; font-weight: 700;">
                      ${t.title}
                    </h2>
                  </td>
                </tr>
              </table>
              
              <!-- Greeting -->
              <p style="color: #4a4a4a; margin: 0 0 10px 0; font-size: 16px; line-height: 1.7;">
                ${t.greeting} ${data.adminName},
              </p>
              
              <p style="color: #4a4a4a; margin: 0 0 30px 0; font-size: 16px; line-height: 1.7;">
                ${t.intro}
              </p>
              
              <!-- Maintenance Details Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0; background: linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%); border-radius: 12px; border-left: 4px solid #fb923c; overflow: hidden;">
                <tr>
                  <td style="padding: 25px;">
                    
                    <!-- Start Time -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 15px;">
                      <tr>
                        <td width="40%" style="color: #92400e; font-size: 14px; font-weight: 600;">
                          <span style="font-size: 20px; margin-right: 8px;">🕐</span>
                          ${t.startTime}:
                        </td>
                        <td width="60%" style="color: #1a1a1a; font-size: 15px; font-weight: 600;">
                          ${formatDate(data.startTime, data.language)}
                        </td>
                      </tr>
                    </table>
                    
                    <!-- End Time -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 15px;">
                      <tr>
                        <td width="40%" style="color: #92400e; font-size: 14px; font-weight: 600;">
                          <span style="font-size: 20px; margin-right: 8px;">🕐</span>
                          ${t.endTime}:
                        </td>
                        <td width="60%" style="color: #1a1a1a; font-size: 15px; font-weight: 600;">
                          ${formatDate(data.endTime, data.language)}
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Duration -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="40%" style="color: #92400e; font-size: 14px; font-weight: 600;">
                          <span style="font-size: 20px; margin-right: 8px;">⏱️</span>
                          ${t.duration}:
                        </td>
                        <td width="60%" style="color: #1a1a1a; font-size: 15px; font-weight: 600;">
                          ${duration}
                        </td>
                      </tr>
                    </table>
                    
                  </td>
                </tr>
              </table>
              
              <!-- Affected Services -->
              ${data.affectedServices && data.affectedServices.length > 0 ? `
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td style="background-color: #fef2f2; padding: 20px; border-radius: 12px; border-left: 4px solid #ef4444;">
                    <p style="color: #991b1b; margin: 0 0 12px 0; font-size: 15px; font-weight: 700;">
                      <span style="font-size: 20px; margin-right: 8px;">⚠️</span>
                      ${t.affectedServices}:
                    </p>
                    ${data.affectedServices.map(service => `
                      <p style="color: #991b1b; margin: 0 0 6px 0; font-size: 14px; padding-left: 28px;">
                        • ${service}
                      </p>
                    `).join('')}
                  </td>
                </tr>
              </table>
              ` : `
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td style="background-color: #fef2f2; padding: 20px; border-radius: 12px; border-left: 4px solid #ef4444;">
                    <p style="color: #991b1b; margin: 0; font-size: 15px; font-weight: 700;">
                      <span style="font-size: 20px; margin-right: 8px;">⚠️</span>
                      ${t.affectedServices}: ${t.allServices}
                    </p>
                  </td>
                </tr>
              </table>
              `}
              
              <!-- Maintenance Message -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td style="background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%); padding: 20px; border-radius: 12px; border-left: 4px solid #6366f1;">
                    <p style="color: #312e81; margin: 0 0 10px 0; font-size: 15px; font-weight: 700;">
                      <span style="font-size: 20px; margin-right: 8px;">📝</span>
                      ${t.message}:
                    </p>
                    <p style="color: #312e81; margin: 0; font-size: 15px; line-height: 1.6;">
                      ${message}
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- What to Expect -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td>
                    <h3 style="color: #1a1a1a; margin: 0 0 15px 0; font-size: 18px; font-weight: 700;">
                      ${t.whatToExpect}
                    </h3>
                    
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 12px;">
                      <tr>
                        <td width="30" valign="top" style="padding-top: 4px;">
                          <span style="color: #10b981; font-size: 20px;">✓</span>
                        </td>
                        <td style="color: #4a4a4a; font-size: 15px; line-height: 1.6;">
                          ${t.expectPoint1}
                        </td>
                      </tr>
                    </table>
                    
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 12px;">
                      <tr>
                        <td width="30" valign="top" style="padding-top: 4px;">
                          <span style="color: #10b981; font-size: 20px;">✓</span>
                        </td>
                        <td style="color: #4a4a4a; font-size: 15px; line-height: 1.6;">
                          ${t.expectPoint2}
                        </td>
                      </tr>
                    </table>
                    
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="30" valign="top" style="padding-top: 4px;">
                          <span style="color: #10b981; font-size: 20px;">✓</span>
                        </td>
                        <td style="color: #4a4a4a; font-size: 15px; line-height: 1.6;">
                          ${t.expectPoint3}
                        </td>
                      </tr>
                    </table>
                    
                  </td>
                </tr>
              </table>
              
              <!-- Apology -->
              <p style="color: #4a4a4a; margin: 30px 0 0 0; font-size: 16px; line-height: 1.7; text-align: center; font-style: italic;">
                ${t.apology}
              </p>
              
            </td>
          </tr>
          
          <!-- Footer / Signature -->
          <tr>
            <td style="background-color: #fafafa; padding: 40px; text-align: center; border-top: 1px solid #e5e5e5;">
              
              <!-- Closing -->
              <p style="margin: 0 0 8px 0; font-size: 16px; color: #666666;">
                ${data.language === 'tr' ? 'Saygılarımızla,' : 'Best regards,'}
              </p>
              <p style="margin: 0 0 25px 0; font-size: 22px; font-weight: 700; background: linear-gradient(135deg, #00d9ff, #b537f2); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
                Allync AI Team
              </p>
              
              <!-- Contact Info Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 25px 0;">
                <tr>
                  <td style="background-color: #ffffff; padding: 25px; border-radius: 12px; border: 2px solid #00d9ff; box-shadow: 0 2px 8px rgba(0, 217, 255, 0.15);">
                    
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="50%" valign="top" style="padding-right: 15px;">
                          
                          <p style="margin: 0 0 15px 0; font-size: 14px; color: #4a4a4a;">
                            <span style="font-size: 16px; margin-right: 6px;">📧</span>
                            <a href="mailto:${EMAIL_CONFIG.supportEmail}" style="color: #00d9ff; text-decoration: none; font-weight: 500;">
                              ${EMAIL_CONFIG.supportEmail}
                            </a>
                          </p>
                          
                          <p style="margin: 0 0 15px 0; font-size: 14px; color: #4a4a4a;">
                            <span style="font-size: 16px; margin-right: 6px;">🌐</span>
                            <a href="${EMAIL_CONFIG.websiteUrl}" style="color: #00d9ff; text-decoration: none; font-weight: 500;">
                              allyncai.com
                            </a>
                          </p>
                          
                          <p style="margin: 0; font-size: 14px; color: #4a4a4a;">
                            <span style="font-size: 16px; margin-right: 6px;">🌐</span>
                            <a href="${EMAIL_CONFIG.websiteUrlTR}" style="color: #00d9ff; text-decoration: none; font-weight: 500;">
                              allyncai.com.tr
                            </a>
                          </p>
                          
                        </td>
                        
                        <td width="50%" valign="top" style="padding-left: 15px; border-left: 1px solid #e5e7eb;">
                          
                          <p style="margin: 0 0 15px 0; font-size: 14px; color: #4a4a4a;">
                            <span style="font-size: 16px; margin-right: 6px;">🇹🇷</span>
                            <a href="tel:${EMAIL_CONFIG.phoneTR.replace(/\s/g, '')}" style="color: #00d9ff; text-decoration: none; font-weight: 500;">
                              ${EMAIL_CONFIG.phoneTR}
                            </a>
                          </p>
                          
                          <p style="margin: 0; font-size: 14px; color: #4a4a4a;">
                            <span style="font-size: 16px; margin-right: 6px;">🇶🇦</span>
                            <a href="tel:${EMAIL_CONFIG.phoneQA.replace(/\s/g, '')}" style="color: #00d9ff; text-decoration: none; font-weight: 500;">
                              ${EMAIL_CONFIG.phoneQA}
                            </a>
                          </p>
                          
                        </td>
                      </tr>
                    </table>
                    
                  </td>
                </tr>
              </table>
              
              <!-- Copyright -->
              <p style="margin: 25px 0 0 0; color: #999999; font-size: 13px;">
                © 2025 Allync AI. All rights reserved.
              </p>
              
              <!-- Footer Note -->
              <p style="margin: 15px 0 0 0; color: #bbbbbb; font-size: 12px;">
                ${t.questions}
              </p>
              
            </td>
          </tr>
          
        </table>
        
      </td>
    </tr>
  </table>
  
</body>
</html>
  `;

  return content;
}

export const maintenanceEmailTemplates = {
  notification: createMaintenanceNotificationEmail,
};