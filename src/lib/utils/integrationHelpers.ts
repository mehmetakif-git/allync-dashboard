// =====================================================
// Integration Helpers - Utility Functions
// =====================================================

import { IntegrationType } from '../../types/whatsapp';
import {
  getIntegrationIcon,
  getIntegrationColor,
  getIntegrationDisplayName,
  getIntegrationEmoji
} from './whatsappFormatters';

/**
 * Get integration route for navigation
 */
export function getIntegrationRoute(type: IntegrationType, id: string): string {
  switch (type) {
    case IntegrationType.APPOINTMENT:
      return `/dashboard/appointments/${id}`;
    case IntegrationType.DOCUMENT:
      return `/dashboard/documents/${id}`;
    case IntegrationType.DRIVE:
      return `/dashboard/drive/files/${id}`;
    case IntegrationType.GMAIL:
      return `/dashboard/gmail/messages/${id}`;
    case IntegrationType.PHOTO:
      return `/dashboard/photos/${id}`;
    case IntegrationType.SHEETS:
      return `/dashboard/sheets/queries/${id}`;
    default:
      return '#';
  }
}

/**
 * Parse WhatsApp context from message
 */
export interface IntegrationContext {
  customer_id: string | null;
  session_id: string | null;
  message_id: string | null;
  customer_phone: string | null;
  customer_name: string | null;
}

export function parseWhatsAppContext(data: any): IntegrationContext {
  return {
    customer_id: data.whatsapp_customer_id || data.user_id || null,
    session_id: data.whatsapp_session_id || data.session_id || null,
    message_id: data.whatsapp_message_id || data.message_id || null,
    customer_phone: data.customer_phone || data.phone_number || null,
    customer_name: data.customer_name || data.name || null,
  };
}

/**
 * Get integration configuration defaults
 */
export function getIntegrationDefaults(type: IntegrationType): Record<string, any> {
  switch (type) {
    case IntegrationType.APPOINTMENT:
      return {
        auto_approve: false,
        require_confirmation: true,
        send_reminders: true,
        reminder_hours_before: 24,
      };
    case IntegrationType.DOCUMENT:
      return {
        use_templates: true,
        ai_generation: true,
        auto_share: false,
      };
    case IntegrationType.DRIVE:
      return {
        auto_upload: true,
        organize_by_customer: true,
        create_folders: true,
      };
    case IntegrationType.GMAIL:
      return {
        auto_reply: false,
        auto_sync: true,
        sync_interval_minutes: 15,
      };
    case IntegrationType.PHOTO:
      return {
        auto_upload: true,
        organize_by_date: true,
        organize_by_customer: true,
        create_albums: true,
      };
    case IntegrationType.SHEETS:
      return {
        allow_queries: true,
        allow_write: false,
        auto_sync: true,
        sync_interval_minutes: 15,
      };
    default:
      return {};
  }
}

/**
 * Build integration badge props
 */
export interface IntegrationBadgeProps {
  icon: any;
  color: string;
  label: string;
  emoji: string;
}

export function getIntegrationBadgeProps(type: IntegrationType): IntegrationBadgeProps {
  return {
    icon: getIntegrationIcon(type),
    color: getIntegrationColor(type),
    label: getIntegrationDisplayName(type),
    emoji: getIntegrationEmoji(type),
  };
}

/**
 * Check if integration is enabled for company
 */
export function isIntegrationEnabled(
  enabledIntegrations: string[] | null | undefined,
  type: IntegrationType
): boolean {
  if (!enabledIntegrations) return false;
  return enabledIntegrations.includes(type);
}

/**
 * Get integration statistics label
 */
export function getIntegrationStatLabel(type: IntegrationType): string {
  switch (type) {
    case IntegrationType.APPOINTMENT:
      return 'Appointments Booked';
    case IntegrationType.DOCUMENT:
      return 'Documents Generated';
    case IntegrationType.DRIVE:
      return 'Files Uploaded';
    case IntegrationType.GMAIL:
      return 'Emails Sent';
    case IntegrationType.PHOTO:
      return 'Photos Uploaded';
    case IntegrationType.SHEETS:
      return 'Queries Performed';
    default:
      return 'Actions';
  }
}

/**
 * Get integration description
 */
export function getIntegrationDescription(type: IntegrationType): string {
  switch (type) {
    case IntegrationType.APPOINTMENT:
      return 'Book and manage appointments via WhatsApp. Customers can request appointments, and they are automatically synced to Google Calendar.';
    case IntegrationType.DOCUMENT:
      return 'Generate documents from templates or AI. Customers can request documents via WhatsApp, and they are created in Google Docs.';
    case IntegrationType.DRIVE:
      return 'Upload and manage files via WhatsApp. Files are automatically uploaded to Google Drive and organized by customer.';
    case IntegrationType.GMAIL:
      return 'Send and receive emails via WhatsApp. Customers can request email actions, and messages are synced with Gmail.';
    case IntegrationType.PHOTO:
      return 'Upload and organize photos via WhatsApp. Photos are automatically uploaded to Google Photos and organized into albums.';
    case IntegrationType.SHEETS:
      return 'Query spreadsheet data via WhatsApp. Customers can ask questions about data in Google Sheets using natural language.';
    default:
      return 'No description available';
  }
}

/**
 * Get integration setup requirements
 */
export function getIntegrationRequirements(type: IntegrationType): string[] {
  switch (type) {
    case IntegrationType.APPOINTMENT:
      return [
        'Google Calendar instance configured',
        'Calendar staff members defined',
        'Appointment types set up',
      ];
    case IntegrationType.DOCUMENT:
      return [
        'Google Docs instance configured',
        'Document templates created (optional)',
        'Gemini AI API key configured',
      ];
    case IntegrationType.DRIVE:
      return [
        'Google Drive instance configured',
        'Folder structure created (optional)',
      ];
    case IntegrationType.GMAIL:
      return [
        'Gmail instance configured',
        'Email templates created (optional)',
      ];
    case IntegrationType.PHOTO:
      return [
        'Google Photos instance configured',
      ];
    case IntegrationType.SHEETS:
      return [
        'Google Sheets instance configured',
        'Spreadsheets linked',
        'Column mappings defined',
      ];
    default:
      return [];
  }
}

/**
 * Get integration icon for Google service
 */
export function getGoogleServiceIcon(type: IntegrationType): string {
  switch (type) {
    case IntegrationType.APPOINTMENT:
      return 'https://www.gstatic.com/images/branding/product/1x/calendar_48dp.png';
    case IntegrationType.DOCUMENT:
      return 'https://www.gstatic.com/images/branding/product/1x/docs_48dp.png';
    case IntegrationType.DRIVE:
      return 'https://www.gstatic.com/images/branding/product/1x/drive_2020q4_48dp.png';
    case IntegrationType.GMAIL:
      return 'https://www.gstatic.com/images/branding/product/1x/gmail_48dp.png';
    case IntegrationType.PHOTO:
      return 'https://www.gstatic.com/images/branding/product/1x/photos_48dp.png';
    case IntegrationType.SHEETS:
      return 'https://www.gstatic.com/images/branding/product/1x/sheets_48dp.png';
    default:
      return '';
  }
}

/**
 * Sort integrations by priority
 */
export function sortIntegrationsByPriority(types: IntegrationType[]): IntegrationType[] {
  const priority: IntegrationType[] = [
    IntegrationType.APPOINTMENT,
    IntegrationType.GMAIL,
    IntegrationType.DOCUMENT,
    IntegrationType.DRIVE,
    IntegrationType.SHEETS,
    IntegrationType.PHOTO,
  ];

  return types.sort((a, b) => priority.indexOf(a) - priority.indexOf(b));
}
