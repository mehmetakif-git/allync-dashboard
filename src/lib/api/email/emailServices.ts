// Email template configurations and utilities
// Based on Allync AI branded email design

export const EMAIL_CONFIG = {
  from: 'info@allyncai.com',
  fromName: 'Allync AI',
  replyTo: 'info@allyncai.com',
  logoUrl: 'https://www.allyncai.com/mail-header-full.png', // Production
  websiteUrl: 'https://allyncai.com',
  websiteUrlTR: 'https://allyncai.com.tr',
  supportEmail: 'info@allyncai.com',
  phoneTR: '+90 533 494 04 16',
  phoneQA: '+974 5107 9565',
};

// Base email template wrapper
const createEmailTemplate = (content: string, greeting: string = 'Hello') => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Allync AI - Dashboard</title>
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
              ${content}
            </td>
          </tr>
          
          <!-- Footer / Signature -->
          <tr>
            <td style="background-color: #fafafa; padding: 40px; text-align: center; border-top: 1px solid #e5e5e5;">
              
              <!-- Closing -->
              <p style="margin: 0 0 8px 0; font-size: 16px; color: #666666;">
                Best regards,
              </p>
              <p style="margin: 0 0 25px 0; font-size: 22px; font-weight: 700; background: linear-gradient(135deg, #00d9ff, #b537f2); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
                Allync AI Team
              </p>
              
              <!-- Contact Info Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 25px 0;">
                <tr>
                  <td style="background-color: #ffffff; padding: 25px; border-radius: 12px; border: 2px solid #00d9ff; box-shadow: 0 2px 8px rgba(0, 217, 255, 0.15);">
                    
                    <!-- Two Column Layout -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <!-- Left Column: Email & Websites -->
                        <td width="50%" valign="top" style="padding-right: 15px;">
                          
                          <!-- Email -->
                          <p style="margin: 0 0 15px 0; font-size: 14px; color: #4a4a4a;">
                            <span style="font-size: 16px; margin-right: 6px;">📧</span>
                            <a href="mailto:${EMAIL_CONFIG.supportEmail}" style="color: #00d9ff; text-decoration: none; font-weight: 500;">
                              ${EMAIL_CONFIG.supportEmail}
                            </a>
                          </p>
                          
                          <!-- Website - .com -->
                          <p style="margin: 0 0 15px 0; font-size: 14px; color: #4a4a4a;">
                            <span style="font-size: 16px; margin-right: 6px;">🌐</span>
                            <a href="${EMAIL_CONFIG.websiteUrl}" style="color: #00d9ff; text-decoration: none; font-weight: 500;">
                              allyncai.com
                            </a>
                          </p>
                          
                          <!-- Website - .com.tr -->
                          <p style="margin: 0; font-size: 14px; color: #4a4a4a;">
                            <span style="font-size: 16px; margin-right: 6px;">🌐</span>
                            <a href="${EMAIL_CONFIG.websiteUrlTR}" style="color: #00d9ff; text-decoration: none; font-weight: 500;">
                              allyncai.com.tr
                            </a>
                          </p>
                          
                        </td>
                        
                        <!-- Right Column: Phones -->
                        <td width="50%" valign="top" style="padding-left: 15px; border-left: 1px solid #e5e7eb;">
                          
                          <!-- Phone - Turkey -->
                          <p style="margin: 0 0 15px 0; font-size: 14px; color: #4a4a4a;">
                            <span style="font-size: 16px; margin-right: 6px;">🇹🇷</span>
                            <a href="tel:${EMAIL_CONFIG.phoneTR.replace(/\s/g, '')}" style="color: #00d9ff; text-decoration: none; font-weight: 500;">
                              ${EMAIL_CONFIG.phoneTR}
                            </a>
                          </p>
                          
                          <!-- Phone - Qatar -->
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
                This email was sent from Allync AI Dashboard.
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
};

// ===== EMAIL TEMPLATES =====

// 1. WELCOME EMAIL (New User Created)
export const createWelcomeEmail = (data: {
  userName: string;
  userEmail: string;
  companyName: string;
  temporaryPassword?: string;
  loginUrl: string;
}) => {
  const content = `
    <!-- Greeting -->
    <h2 style="color: #1a1a1a; margin: 0 0 20px 0; font-size: 26px; font-weight: 600;">
      Welcome to Allync AI, ${data.userName}! 🎉
    </h2>
    
    <!-- Body Text -->
    <p style="color: #4a4a4a; margin: 0 0 20px 0; font-size: 16px; line-height: 1.7;">
      Your account has been successfully created on the <strong style="color: #1a1a1a;">Allync AI Platform</strong>.
    </p>
    
    <!-- Success Box -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
      <tr>
        <td style="background: linear-gradient(135deg, #e8f9ff 0%, #f3e8ff 100%); padding: 25px; border-radius: 12px; border-left: 4px solid #00d9ff;">
          <p style="color: #1a1a1a; margin: 0 0 12px 0; font-size: 15px; line-height: 1.6;">
            <span style="font-size: 20px; margin-right: 8px;">✅</span>
            <strong>Account Details</strong>
          </p>
          <p style="color: #4a4a4a; margin: 0 0 8px 0; font-size: 15px; line-height: 1.6;">
            <strong>Email:</strong> ${data.userEmail}
          </p>
          <p style="color: #4a4a4a; margin: 0 0 8px 0; font-size: 15px; line-height: 1.6;">
            <strong>Company:</strong> ${data.companyName}
          </p>
          ${data.temporaryPassword ? `
          <p style="color: #4a4a4a; margin: 0; font-size: 15px; line-height: 1.6;">
            <strong>Temporary Password:</strong> <code style="background-color: #ffffff; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${data.temporaryPassword}</code>
          </p>
          ` : ''}
        </td>
      </tr>
    </table>
    
    ${data.temporaryPassword ? `
    <!-- Security Notice -->
    <p style="color: #4a4a4a; margin: 0 0 30px 0; font-size: 16px; line-height: 1.7;">
      ⚠️ <strong>Important:</strong> For security reasons, you will be required to change your password on your first login.
    </p>
    ` : ''}
    
    <!-- Additional Info -->
    <p style="color: #4a4a4a; margin: 0 0 30px 0; font-size: 16px; line-height: 1.7;">
      Get started with AI-powered business automation and explore all the features available to you.
    </p>
    
    <!-- CTA Button -->
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding: 20px 0;">
          <a href="${data.loginUrl}" 
             style="display: inline-block; background: linear-gradient(135deg, #00d9ff 0%, #00b8e6 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 15px rgba(0, 217, 255, 0.3);">
            🚀 Login to Dashboard
          </a>
        </td>
      </tr>
    </table>
  `;

  return createEmailTemplate(content);
};

// 2. INVITATION EMAIL
export const createInvitationEmail = (data: {
  userName: string;
  userEmail: string;
  companyName: string;
  role: string;
  temporaryPassword: string;
  loginUrl: string;
  invitedBy?: string;
}) => {
  const content = `
    <!-- Greeting -->
    <h2 style="color: #1a1a1a; margin: 0 0 20px 0; font-size: 26px; font-weight: 600;">
      You're Invited! 🎊
    </h2>
    
    <!-- Body Text -->
    <p style="color: #4a4a4a; margin: 0 0 20px 0; font-size: 16px; line-height: 1.7;">
      ${data.invitedBy ? `${data.invitedBy} has` : 'You have been'} invited to join <strong style="color: #1a1a1a;">${data.companyName}</strong> on the Allync AI Platform.
    </p>
    
    <!-- Success Box -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
      <tr>
        <td style="background: linear-gradient(135deg, #e8f9ff 0%, #f3e8ff 100%); padding: 25px; border-radius: 12px; border-left: 4px solid #00d9ff;">
          <p style="color: #1a1a1a; margin: 0 0 12px 0; font-size: 15px; line-height: 1.6;">
            <span style="font-size: 20px; margin-right: 8px;">🔑</span>
            <strong>Your Login Credentials</strong>
          </p>
          <p style="color: #4a4a4a; margin: 0 0 8px 0; font-size: 15px; line-height: 1.6;">
            <strong>Email:</strong> ${data.userEmail}
          </p>
          <p style="color: #4a4a4a; margin: 0 0 8px 0; font-size: 15px; line-height: 1.6;">
            <strong>Role:</strong> ${data.role}
          </p>
          <p style="color: #4a4a4a; margin: 0; font-size: 15px; line-height: 1.6;">
            <strong>Temporary Password:</strong> <code style="background-color: #ffffff; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${data.temporaryPassword}</code>
          </p>
        </td>
      </tr>
    </table>
    
    <!-- Security Notice -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
      <tr>
        <td style="background-color: #fff9e6; padding: 20px; border-radius: 12px; border-left: 4px solid #fbbf24;">
          <p style="color: #92400e; margin: 0; font-size: 14px; line-height: 1.6;">
            <span style="font-size: 18px; margin-right: 6px;">⚠️</span>
            <strong>Security Notice:</strong> You must change this temporary password on your first login for security reasons.
          </p>
        </td>
      </tr>
    </table>
    
    <!-- Additional Info -->
    <p style="color: #4a4a4a; margin: 0 0 30px 0; font-size: 16px; line-height: 1.7;">
      Click the button below to access your dashboard and start exploring AI-powered automation features.
    </p>
    
    <!-- CTA Button -->
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding: 20px 0;">
          <a href="${data.loginUrl}" 
             style="display: inline-block; background: linear-gradient(135deg, #00d9ff 0%, #00b8e6 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 15px rgba(0, 217, 255, 0.3);">
            🚀 Accept Invitation & Login
          </a>
        </td>
      </tr>
    </table>
  `;

  return createEmailTemplate(content);
};

// 3. PASSWORD RESET EMAIL
export const createPasswordResetEmail = (data: {
  userName: string;
  resetUrl: string;
  expiresIn?: string;
}) => {
  const content = `
    <!-- Greeting -->
    <h2 style="color: #1a1a1a; margin: 0 0 20px 0; font-size: 26px; font-weight: 600;">
      Password Reset Request 🔒
    </h2>
    
    <!-- Body Text -->
    <p style="color: #4a4a4a; margin: 0 0 20px 0; font-size: 16px; line-height: 1.7;">
      Hi ${data.userName},
    </p>
    
    <p style="color: #4a4a4a; margin: 0 0 30px 0; font-size: 16px; line-height: 1.7;">
      We received a request to reset your password for your Allync AI account. Click the button below to create a new password.
    </p>
    
    <!-- CTA Button -->
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding: 20px 0;">
          <a href="${data.resetUrl}" 
             style="display: inline-block; background: linear-gradient(135deg, #00d9ff 0%, #00b8e6 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 15px rgba(0, 217, 255, 0.3);">
            🔑 Reset Password
          </a>
        </td>
      </tr>
    </table>
    
    <!-- Security Info -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
      <tr>
        <td style="background-color: #fff9e6; padding: 20px; border-radius: 12px; border-left: 4px solid #fbbf24;">
          <p style="color: #92400e; margin: 0 0 10px 0; font-size: 14px; line-height: 1.6;">
            <span style="font-size: 18px; margin-right: 6px;">⏰</span>
            This link will expire in <strong>${data.expiresIn || '1 hour'}</strong>.
          </p>
          <p style="color: #92400e; margin: 0; font-size: 14px; line-height: 1.6;">
            <span style="font-size: 18px; margin-right: 6px;">🔒</span>
            If you didn't request this, please ignore this email. Your password will remain unchanged.
          </p>
        </td>
      </tr>
    </table>
    
    <!-- Help Text -->
    <p style="color: #999999; margin: 30px 0 0 0; font-size: 14px; line-height: 1.6;">
      If the button doesn't work, copy and paste this link into your browser:<br>
      <a href="${data.resetUrl}" style="color: #00d9ff; word-break: break-all;">${data.resetUrl}</a>
    </p>
  `;

  return createEmailTemplate(content);
};

// 4. PASSWORD CHANGED CONFIRMATION
export const createPasswordChangedEmail = (data: {
  userName: string;
  changeDate: string;
}) => {
  const content = `
    <!-- Greeting -->
    <h2 style="color: #1a1a1a; margin: 0 0 20px 0; font-size: 26px; font-weight: 600;">
      Password Changed Successfully ✅
    </h2>
    
    <!-- Body Text -->
    <p style="color: #4a4a4a; margin: 0 0 20px 0; font-size: 16px; line-height: 1.7;">
      Hi ${data.userName},
    </p>
    
    <!-- Success Box -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
      <tr>
        <td style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); padding: 25px; border-radius: 12px; border-left: 4px solid #10b981;">
          <p style="color: #065f46; margin: 0 0 12px 0; font-size: 15px; line-height: 1.6;">
            <span style="font-size: 20px; margin-right: 8px;">✅</span>
            <strong>Your password has been changed successfully.</strong>
          </p>
          <p style="color: #065f46; margin: 0; font-size: 15px; line-height: 1.6;">
            <span style="font-size: 20px; margin-right: 8px;">📅</span>
            Changed on: ${data.changeDate}
          </p>
        </td>
      </tr>
    </table>
    
    <!-- Security Notice -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
      <tr>
        <td style="background-color: #fef2f2; padding: 20px; border-radius: 12px; border-left: 4px solid #ef4444;">
          <p style="color: #991b1b; margin: 0; font-size: 14px; line-height: 1.6;">
            <span style="font-size: 18px; margin-right: 6px;">⚠️</span>
            <strong>Didn't change your password?</strong> If you didn't make this change, please contact our support team immediately at 
            <a href="mailto:${EMAIL_CONFIG.supportEmail}" style="color: #00d9ff; text-decoration: none;">${EMAIL_CONFIG.supportEmail}</a>
          </p>
        </td>
      </tr>
    </table>
  `;

  return createEmailTemplate(content);
};

// Export all templates
export const emailTemplates = {
  welcome: createWelcomeEmail,
  invitation: createInvitationEmail,
  passwordReset: createPasswordResetEmail,
  passwordChanged: createPasswordChangedEmail,
};