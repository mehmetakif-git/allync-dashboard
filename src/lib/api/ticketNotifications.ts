// =====================================================
// TICKET EMAIL NOTIFICATIONS
// =====================================================

import { sendEmail } from './emailService';

const HEADER_IMAGE_URL = 'https://allyncai.com/mail-header-full.png';
const COMPANY_INFO = {
  name: 'Allync AI',
  website: 'https://allyncai.com',
  websiteTR: 'https://allyncai.com.tr',
  email: 'info@allyncai.com',
  phoneTR: '+90 533 494 04 16',
  phoneQA: '+974 5107 9565',
};

// =====================================================
// EMAIL TEMPLATES
// =====================================================

// 1. NEW TICKET CREATED (to Support Team)
export function getNewTicketEmailTemplate(data: {
  ticketNumber: string;
  subject: string;
  priority: string;
  company: string;
  createdBy: string;
  category: string;
  description: string;
  ticketUrl: string;
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #111827;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #1f2937 0%, #111827 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);">
          
          <!-- Header with Image -->
          <tr>
            <td style="padding: 0;">
              <img src="${HEADER_IMAGE_URL}" alt="Allync AI" style="width: 100%; height: auto; display: block;">
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <!-- Title -->
              <h1 style="margin: 0 0 10px; font-size: 28px; font-weight: bold; color: #ffffff; text-align: center;">
                🎫 New Support Ticket
              </h1>
              <p style="margin: 0 0 30px; font-size: 16px; color: #9ca3af; text-align: center;">
                A new support ticket has been created
              </p>

              <!-- Ticket Info Box -->
              <div style="background: linear-gradient(135deg, #00d9ff15 0%, #00b8e615 100%); border: 1px solid #00d9ff30; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
                <p style="margin: 0 0 10px; font-size: 14px; color: #9ca3af;">Ticket Number</p>
                <p style="margin: 0 0 20px; font-size: 20px; font-weight: bold; color: #00d9ff; font-family: monospace;">
                  ${data.ticketNumber}
                </p>

                <p style="margin: 0 0 10px; font-size: 14px; color: #9ca3af;">Subject</p>
                <p style="margin: 0 0 20px; font-size: 18px; font-weight: bold; color: #ffffff;">
                  ${data.subject}
                </p>

                <div style="display: flex; gap: 15px; margin-bottom: 15px;">
                  <div style="flex: 1;">
                    <p style="margin: 0 0 5px; font-size: 12px; color: #9ca3af;">Priority</p>
                    <span style="display: inline-block; padding: 6px 12px; background: ${getPriorityColor(data.priority)}; border-radius: 6px; font-size: 12px; font-weight: 600;">
                      ${data.priority.toUpperCase()}
                    </span>
                  </div>
                  <div style="flex: 1;">
                    <p style="margin: 0 0 5px; font-size: 12px; color: #9ca3af;">Category</p>
                    <p style="margin: 0; font-size: 14px; color: #ffffff;">${data.category}</p>
                  </div>
                </div>

                <p style="margin: 0 0 5px; font-size: 12px; color: #9ca3af;">Company</p>
                <p style="margin: 0 0 15px; font-size: 14px; color: #ffffff;">🏢 ${data.company}</p>

                <p style="margin: 0 0 5px; font-size: 12px; color: #9ca3af;">Created By</p>
                <p style="margin: 0; font-size: 14px; color: #ffffff;">👤 ${data.createdBy}</p>
              </div>

              <!-- Description -->
              <div style="background: #1f293750; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
                <p style="margin: 0 0 10px; font-size: 14px; font-weight: bold; color: #ffffff;">Description:</p>
                <p style="margin: 0; font-size: 14px; color: #d1d5db; line-height: 1.6; white-space: pre-wrap;">
                  ${data.description}
                </p>
              </div>

              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <tr>
                  <td align="center">
                    <a href="${data.ticketUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #00d9ff 0%, #00b8e6 100%); color: #000000; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(0, 217, 255, 0.3);">
                      View Ticket →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Note -->
              <p style="margin: 0; font-size: 13px; color: #6b7280; text-align: center; font-style: italic;">
                ⚡ Please respond to this ticket as soon as possible
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background-color: #0f172a; border-top: 1px solid #1f2937;">
              <p style="margin: 0 0 15px; font-size: 14px; color: #9ca3af; text-align: center;">
                <strong style="color: #ffffff;">${COMPANY_INFO.name}</strong><br>
                AI-Powered Business Automation Solutions
              </p>
              <p style="margin: 0 0 10px; font-size: 13px; color: #6b7280; text-align: center;">
                📧 ${COMPANY_INFO.email}<br>
                🌐 <a href="${COMPANY_INFO.website}" style="color: #00d9ff; text-decoration: none;">${COMPANY_INFO.website}</a> | 
                <a href="${COMPANY_INFO.websiteTR}" style="color: #00d9ff; text-decoration: none;">${COMPANY_INFO.websiteTR}</a><br>
                📞 TR: ${COMPANY_INFO.phoneTR} | QA: ${COMPANY_INFO.phoneQA}
              </p>
              <p style="margin: 15px 0 0; font-size: 12px; color: #4b5563; text-align: center;">
                © ${new Date().getFullYear()} ${COMPANY_INFO.name}. All rights reserved.
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
}

// 2. TICKET STATUS CHANGED (to Customer)
export function getTicketStatusChangedEmailTemplate(data: {
  ticketNumber: string;
  subject: string;
  oldStatus: string;
  newStatus: string;
  updatedBy: string;
  ticketUrl: string;
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #111827;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #1f2937 0%, #111827 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);">
          
          <tr>
            <td style="padding: 0;">
              <img src="${HEADER_IMAGE_URL}" alt="Allync AI" style="width: 100%; height: auto; display: block;">
            </td>
          </tr>

          <tr>
            <td style="padding: 40px 30px;">
              <h1 style="margin: 0 0 10px; font-size: 28px; font-weight: bold; color: #ffffff; text-align: center;">
                🔔 Ticket Status Updated
              </h1>
              <p style="margin: 0 0 30px; font-size: 16px; color: #9ca3af; text-align: center;">
                Your support ticket status has been updated
              </p>

              <div style="background: linear-gradient(135deg, #00d9ff15 0%, #00b8e615 100%); border: 1px solid #00d9ff30; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
                <p style="margin: 0 0 10px; font-size: 14px; color: #9ca3af;">Ticket Number</p>
                <p style="margin: 0 0 20px; font-size: 20px; font-weight: bold; color: #00d9ff; font-family: monospace;">
                  ${data.ticketNumber}
                </p>

                <p style="margin: 0 0 10px; font-size: 14px; color: #9ca3af;">Subject</p>
                <p style="margin: 0 0 20px; font-size: 18px; font-weight: bold; color: #ffffff;">
                  ${data.subject}
                </p>

                <p style="margin: 0 0 10px; font-size: 14px; color: #9ca3af;">Status Change</p>
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="padding: 6px 12px; background: #4b556350; border-radius: 6px; font-size: 12px; font-weight: 600; color: #9ca3af;">
                    ${formatStatusLabel(data.oldStatus)}
                  </span>
                  <span style="color: #00d9ff; font-size: 18px;">→</span>
                  <span style="padding: 6px 12px; background: ${getStatusColor(data.newStatus)}; border-radius: 6px; font-size: 12px; font-weight: 600;">
                    ${formatStatusLabel(data.newStatus)}
                  </span>
                </div>
              </div>

              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <tr>
                  <td align="center">
                    <a href="${data.ticketUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #00d9ff 0%, #00b8e6 100%); color: #000000; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(0, 217, 255, 0.3);">
                      View Ticket →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 30px; background-color: #0f172a; border-top: 1px solid #1f2937;">
              <p style="margin: 0 0 15px; font-size: 14px; color: #9ca3af; text-align: center;">
                <strong style="color: #ffffff;">${COMPANY_INFO.name}</strong><br>
                AI-Powered Business Automation Solutions
              </p>
              <p style="margin: 0 0 10px; font-size: 13px; color: #6b7280; text-align: center;">
                📧 ${COMPANY_INFO.email}<br>
                🌐 <a href="${COMPANY_INFO.website}" style="color: #00d9ff; text-decoration: none;">${COMPANY_INFO.website}</a>
              </p>
              <p style="margin: 15px 0 0; font-size: 12px; color: #4b5563; text-align: center;">
                © ${new Date().getFullYear()} ${COMPANY_INFO.name}. All rights reserved.
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
}

// 3. NEW REPLY (to Customer or Support)
export function getNewReplyEmailTemplate(data: {
  ticketNumber: string;
  subject: string;
  senderName: string;
  message: string;
  ticketUrl: string;
  isToCustomer: boolean;
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #111827;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #1f2937 0%, #111827 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);">
          
          <tr>
            <td style="padding: 0;">
              <img src="${HEADER_IMAGE_URL}" alt="Allync AI" style="width: 100%; height: auto; display: block;">
            </td>
          </tr>

          <tr>
            <td style="padding: 40px 30px;">
              <h1 style="margin: 0 0 10px; font-size: 28px; font-weight: bold; color: #ffffff; text-align: center;">
                💬 New Reply
              </h1>
              <p style="margin: 0 0 30px; font-size: 16px; color: #9ca3af; text-align: center;">
                ${data.isToCustomer ? 'Our support team has replied to your ticket' : 'Customer has replied to the ticket'}
              </p>

              <div style="background: linear-gradient(135deg, #00d9ff15 0%, #00b8e615 100%); border: 1px solid #00d9ff30; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
                <p style="margin: 0 0 10px; font-size: 14px; color: #9ca3af;">Ticket Number</p>
                <p style="margin: 0 0 20px; font-size: 20px; font-weight: bold; color: #00d9ff; font-family: monospace;">
                  ${data.ticketNumber}
                </p>

                <p style="margin: 0 0 10px; font-size: 14px; color: #9ca3af;">Subject</p>
                <p style="margin: 0 0 20px; font-size: 18px; font-weight: bold; color: #ffffff;">
                  ${data.subject}
                </p>

                <p style="margin: 0 0 10px; font-size: 14px; color: #9ca3af;">From</p>
                <p style="margin: 0; font-size: 14px; color: #ffffff;">👤 ${data.senderName}</p>
              </div>

              <div style="background: #1f293750; border-radius: 12px; padding: 20px; margin-bottom: 25px; border-left: 4px solid #00d9ff;">
                <p style="margin: 0; font-size: 14px; color: #d1d5db; line-height: 1.6; white-space: pre-wrap;">
                  ${data.message}
                </p>
              </div>

              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <tr>
                  <td align="center">
                    <a href="${data.ticketUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #00d9ff 0%, #00b8e6 100%); color: #000000; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(0, 217, 255, 0.3);">
                      View & Reply →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 30px; background-color: #0f172a; border-top: 1px solid #1f2937;">
              <p style="margin: 0 0 15px; font-size: 14px; color: #9ca3af; text-align: center;">
                <strong style="color: #ffffff;">${COMPANY_INFO.name}</strong><br>
                AI-Powered Business Automation Solutions
              </p>
              <p style="margin: 0 0 10px; font-size: 13px; color: #6b7280; text-align: center;">
                📧 ${COMPANY_INFO.email}<br>
                🌐 <a href="${COMPANY_INFO.website}" style="color: #00d9ff; text-decoration: none;">${COMPANY_INFO.website}</a>
              </p>
              <p style="margin: 15px 0 0; font-size: 12px; color: #4b5563; text-align: center;">
                © ${new Date().getFullYear()} ${COMPANY_INFO.name}. All rights reserved.
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
}

// 4. TICKET RESOLVED (to Customer)
export function getTicketResolvedEmailTemplate(data: {
  ticketNumber: string;
  subject: string;
  resolutionNotes: string;
  resolvedBy: string;
  ticketUrl: string;
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #111827;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #1f2937 0%, #111827 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);">
          
          <tr>
            <td style="padding: 0;">
              <img src="${HEADER_IMAGE_URL}" alt="Allync AI" style="width: 100%; height: auto; display: block;">
            </td>
          </tr>

          <tr>
            <td style="padding: 40px 30px;">
              <h1 style="margin: 0 0 10px; font-size: 28px; font-weight: bold; color: #ffffff; text-align: center;">
                ✅ Ticket Resolved
              </h1>
              <p style="margin: 0 0 30px; font-size: 16px; color: #9ca3af; text-align: center;">
                Your support ticket has been resolved
              </p>

              <div style="background: linear-gradient(135deg, #10b98115 0%, #059669 15 100%); border: 1px solid #10b98130; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
                <p style="margin: 0 0 10px; font-size: 14px; color: #9ca3af;">Ticket Number</p>
                <p style="margin: 0 0 20px; font-size: 20px; font-weight: bold; color: #10b981; font-family: monospace;">
                  ${data.ticketNumber}
                </p>

                <p style="margin: 0 0 10px; font-size: 14px; color: #9ca3af;">Subject</p>
                <p style="margin: 0; font-size: 18px; font-weight: bold; color: #ffffff;">
                  ${data.subject}
                </p>
              </div>

              ${data.resolutionNotes ? `
              <div style="background: #1f293750; border-radius: 12px; padding: 20px; margin-bottom: 25px; border-left: 4px solid #10b981;">
                <p style="margin: 0 0 10px; font-size: 14px; font-weight: bold; color: #10b981;">Resolution Notes:</p>
                <p style="margin: 0; font-size: 14px; color: #d1d5db; line-height: 1.6; white-space: pre-wrap;">
                  ${data.resolutionNotes}
                </p>
              </div>
              ` : ''}

              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <tr>
                  <td align="center">
                    <a href="${data.ticketUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);">
                      View Ticket →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0 0; font-size: 13px; color: #6b7280; text-align: center; font-style: italic;">
                ⭐ We'd love your feedback! Please rate your experience.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 30px; background-color: #0f172a; border-top: 1px solid #1f2937;">
              <p style="margin: 0 0 15px; font-size: 14px; color: #9ca3af; text-align: center;">
                <strong style="color: #ffffff;">${COMPANY_INFO.name}</strong><br>
                AI-Powered Business Automation Solutions
              </p>
              <p style="margin: 0 0 10px; font-size: 13px; color: #6b7280; text-align: center;">
                📧 ${COMPANY_INFO.email}<br>
                🌐 <a href="${COMPANY_INFO.website}" style="color: #00d9ff; text-decoration: none;">${COMPANY_INFO.website}</a>
              </p>
              <p style="margin: 15px 0 0; font-size: 12px; color: #4b5563; text-align: center;">
                © ${new Date().getFullYear()} ${COMPANY_INFO.name}. All rights reserved.
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
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function getPriorityColor(priority: string): string {
  switch (priority.toLowerCase()) {
    case 'urgent': return '#ef4444';
    case 'high': return '#f97316';
    case 'medium': return '#eab308';
    case 'low': return '#6b7280';
    default: return '#6b7280';
  }
}

function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'open': return '#3b82f6';
    case 'in_progress': return '#eab308';
    case 'waiting_customer': return '#a855f7';
    case 'resolved': return '#10b981';
    case 'closed': return '#6b7280';
    default: return '#6b7280';
  }
}

function formatStatusLabel(status: string): string {
  return status.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

// =====================================================
// EMAIL SENDING FUNCTIONS
// =====================================================

// Send new ticket notification to support team
export async function sendNewTicketNotification(data: {
  ticketNumber: string;
  subject: string;
  priority: string;
  company: string;
  createdBy: string;
  category: string;
  description: string;
  ticketUrl: string;
  supportEmails: string[]; // Array of support team emails
}) {
  const htmlContent = getNewTicketEmailTemplate(data);

  for (const email of data.supportEmails) {
    try {
      await sendEmail({
        to: email,
        subject: `🎫 New Support Ticket: ${data.ticketNumber}`,
        html: htmlContent,
      });
    } catch (error) {
      console.error(`Error sending new ticket notification to ${email}:`, error);
    }
  }
}

// Send status change notification to customer
export async function sendTicketStatusChangeNotification(data: {
  ticketNumber: string;
  subject: string;
  oldStatus: string;
  newStatus: string;
  updatedBy: string;
  ticketUrl: string;
  customerEmail: string;
}) {
  const htmlContent = getTicketStatusChangedEmailTemplate(data);

  try {
    await sendEmail({
      to: data.customerEmail,
      subject: `🔔 Ticket Status Updated: ${data.ticketNumber}`,
      html: htmlContent,
    });
  } catch (error) {
    console.error('Error sending status change notification:', error);
    throw error;
  }
}

// Send new reply notification
export async function sendNewReplyNotification(data: {
  ticketNumber: string;
  subject: string;
  senderName: string;
  message: string;
  ticketUrl: string;
  recipientEmail: string;
  isToCustomer: boolean;
}) {
  const htmlContent = getNewReplyEmailTemplate(data);

  try {
    await sendEmail({
      to: data.recipientEmail,
      subject: `💬 New Reply on Ticket: ${data.ticketNumber}`,
      html: htmlContent,
    });
  } catch (error) {
    console.error('Error sending reply notification:', error);
    throw error;
  }
}

// Send ticket resolved notification to customer
export async function sendTicketResolvedNotification(data: {
  ticketNumber: string;
  subject: string;
  resolutionNotes: string;
  resolvedBy: string;
  ticketUrl: string;
  customerEmail: string;
}) {
  const htmlContent = getTicketResolvedEmailTemplate(data);

  try {
    await sendEmail({
      to: data.customerEmail,
      subject: `✅ Ticket Resolved: ${data.ticketNumber}`,
      html: htmlContent,
    });
  } catch (error) {
    console.error('Error sending ticket resolved notification:', error);
    throw error;
  }
}