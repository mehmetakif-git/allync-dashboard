// =====================================================
// WhatsApp Service - TypeScript Type Definitions
// =====================================================

// =====================================================
// ENUMS
// =====================================================

export enum InstanceType {
  SALES = 'sales',
  SUPPORT = 'support',
  GENERAL = 'general',
  INFO = 'info',
  MARKETING = 'marketing'
}

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  AUDIO = 'audio',
  VIDEO = 'video',
  DOCUMENT = 'document',
  LOCATION = 'location'
}

export enum MessageSender {
  CUSTOMER = 'customer',
  BOT = 'bot',
  AGENT = 'agent'
}

export enum SessionStatus {
  ACTIVE = 'active',
  CLOSED = 'closed',
  ARCHIVED = 'archived'
}

export enum CustomerStatus {
  NEW = 'new',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BLOCKED = 'blocked'
}

export enum ErrorSeverity {
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

export enum ErrorType {
  WEBHOOK_ERROR = 'webhook_error',
  GEMINI_API_ERROR = 'gemini_api_error',
  EVOLUTION_API_ERROR = 'evolution_api_error',
  DATABASE_ERROR = 'database_error',
  SESSION_ERROR = 'session_error',
  VALIDATION_ERROR = 'validation_error',
  TIMEOUT_ERROR = 'timeout_error',
  NETWORK_ERROR = 'network_error',
  UNKNOWN_ERROR = 'unknown_error'
}

export enum IntegrationType {
  APPOINTMENT = 'appointment',
  DOCUMENT = 'document',
  DRIVE = 'drive',
  GMAIL = 'gmail',
  PHOTO = 'photo',
  SHEETS = 'sheets'
}

// =====================================================
// WHATSAPP CORE TYPES
// =====================================================

export interface WhatsAppInstance {
  id: string;
  company_id: string;
  instance_id: string;
  instance_name: string | null;
  phone_number: string | null;
  status: string;
  qr_code: string | null;
  is_connected: boolean;
  last_connected_at: string | null;
  webhook_url: string | null;
  api_key: string | null;
  settings: Record<string, any> | null;
  evolution_api_url: string | null;
  evolution_api_key: string | null;
  gemini_api_key: string | null;
  instance_type: InstanceType | null;
  ai_system_prompt: string | null;
  ai_settings: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  // Computed/joined fields
  company?: {
    id: string;
    name: string;
  };
}

export interface WhatsAppSession {
  id: string;
  company_id: string;
  user_id: string;
  sender: string;
  session_start: string;
  session_end: string | null;
  is_active: boolean;
  context: Record<string, any>;
  last_message: string | null;
  last_message_time: string | null;
  unread_count: number;
  message_count: number;
  customer_name: string | null;
  customer_phone: string | null;
  status: SessionStatus;
  created_at: string;
  updated_at: string;
  // Computed/joined fields
  user?: WhatsAppUserProfile;
  messages?: WhatsAppMessage[];
  integration_indicators?: IntegrationType[];
}

export interface WhatsAppUserProfile {
  id: string;
  company_id: string;
  phone_number: string;
  name: string | null;
  email: string | null;
  preferences: Record<string, any>;
  tags: string[];
  total_messages: number;
  last_seen: string | null;
  customer_status: CustomerStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Computed fields
  integration_usage?: {
    [key in IntegrationType]?: number;
  };
}

export interface WhatsAppMessage {
  id: string;
  company_id: string;
  session_id: string;
  user_id: string;
  sender: MessageSender;
  sender_name: string | null;
  message_body: string;
  message_owner: string;
  message_type: MessageType;
  media_url: string | null;
  instance_id: string | null;
  sentiment: string | null;
  intent: string | null;
  created_at: string;
  updated_at: string;
  // Computed fields
  integration_actions?: IntegrationAction[];
}

export interface WhatsAppMetrics {
  id: string;
  company_id: string;
  metric_date: string;
  total_messages: number;
  customer_messages: number;
  bot_messages: number;
  agent_messages: number;
  new_sessions: number;
  active_sessions: number;
  resolved_sessions: number;
  avg_response_time: string | null;
  avg_session_duration: string | null;
  satisfaction_score: number | null;
  resolved_rate: number | null;
  created_at: string;
}

export interface WhatsAppHourlyMetrics {
  id: string;
  company_id: string;
  metric_hour: string;
  total_messages: number;
  customer_messages: number;
  bot_messages: number;
  agent_messages: number;
  new_sessions: number;
  active_sessions: number;
  avg_response_time: string | null;
  messages_per_session: number | null;
  positive_sentiment: number;
  neutral_sentiment: number;
  negative_sentiment: number;
  intents: Record<string, number>;
  metadata: Record<string, any>;
  created_at: string;
}

export interface WhatsAppError {
  id: string;
  company_id: string;
  instance_id: string | null;
  error_type: ErrorType;
  error_message: string;
  error_details: Record<string, any>;
  node_name: string | null;
  workflow_id: string | null;
  execution_id: string | null;
  user_id: string | null;
  session_id: string | null;
  phone_number: string | null;
  http_status_code: number | null;
  severity: ErrorSeverity;
  is_resolved: boolean;
  created_at: string;
  updated_at: string;
}

// =====================================================
// INTEGRATION REQUEST TYPES
// =====================================================

export interface AppointmentRequest {
  id: string;
  company_id: string;
  calendar_instance_id: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  whatsapp_customer_id: string | null;
  whatsapp_session_id: string | null;
  whatsapp_message_id: string | null;
  appointment_reason: string | null;
  requested_date: string | null;
  requested_time: string | null;
  appointment_date: string | null;
  appointment_time: string | null;
  staff_id: string | null;
  appointment_type_id: string | null;
  status: string;
  google_event_id: string | null;
  calendar_event_link: string | null;
  google_meet_link: string | null;
  ai_parsed_data: Record<string, any> | null;
  ai_confidence_score: number | null;
  n8n_execution_id: string | null;
  n8n_workflow_status: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentRequest {
  id: string;
  company_id: string;
  docs_instance_id: string | null;
  customer_phone: string | null;
  customer_name: string | null;
  whatsapp_customer_id: string | null;
  whatsapp_session_id: string | null;
  whatsapp_message_id: string | null;
  request_type: string | null;
  document_type: string | null;
  document_title: string | null;
  document_instructions: string | null;
  generated_document_id: string | null;
  ai_parsed_request: Record<string, any> | null;
  ai_confidence: number | null;
  n8n_execution_id: string | null;
  bot_response: string | null;
  status: string;
  error_message: string | null;
  created_at: string;
}

export interface GeneratedDocument {
  id: string;
  company_id: string;
  docs_instance_id: string | null;
  request_id: string | null;
  google_doc_id: string | null;
  google_doc_url: string | null;
  google_doc_name: string | null;
  template_used: string | null;
  variables_used: Record<string, any> | null;
  ai_prompt: string | null;
  ai_generated_content: string | null;
  ai_model: string | null;
  document_content: string | null;
  is_shared: boolean;
  shared_with: string | null;
  share_link: string | null;
  whatsapp_customer_id: string | null;
  whatsapp_session_id: string | null;
  whatsapp_message_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface DriveRequest {
  id: string;
  company_id: string;
  drive_instance_id: string | null;
  customer_phone: string | null;
  customer_name: string | null;
  whatsapp_customer_id: string | null;
  whatsapp_session_id: string | null;
  whatsapp_message_id: string | null;
  request_type: string;
  search_query: string | null;
  search_results_count: number | null;
  search_results: Record<string, any> | null;
  uploaded_file_id: string | null;
  ai_parsed_request: Record<string, any> | null;
  ai_confidence: number | null;
  n8n_execution_id: string | null;
  bot_response: string | null;
  status: string;
  error_message: string | null;
  created_at: string;
}

export interface DriveFile {
  id: string;
  company_id: string;
  drive_instance_id: string | null;
  google_file_id: string | null;
  google_file_url: string | null;
  google_file_name: string | null;
  mime_type: string | null;
  file_size_bytes: number | null;
  file_extension: string | null;
  parent_folder_id: string | null;
  folder_path: string | null;
  tags: string | null;
  ai_summary: string | null;
  ai_tags: string | null;
  ocr_text: string | null;
  uploaded_via_whatsapp: boolean;
  whatsapp_customer_id: string | null;
  whatsapp_session_id: string | null;
  whatsapp_message_id: string | null;
  is_shared: boolean;
  shared_with: string | null;
  share_link: string | null;
  share_permissions: string | null;
  created_at: string;
  updated_at: string;
}

export interface GmailRequest {
  id: string;
  company_id: string;
  gmail_instance_id: string | null;
  customer_phone: string | null;
  customer_name: string | null;
  whatsapp_customer_id: string | null;
  whatsapp_session_id: string | null;
  whatsapp_message_id: string | null;
  request_type: string;
  to_email: string | null;
  subject: string | null;
  body: string | null;
  search_query: string | null;
  search_results_count: number | null;
  gmail_message_id: string | null;
  ai_parsed_request: Record<string, any> | null;
  ai_confidence: number | null;
  n8n_execution_id: string | null;
  bot_response: string | null;
  status: string;
  error_message: string | null;
  created_at: string;
}

export interface GmailMessage {
  id: string;
  company_id: string;
  gmail_instance_id: string | null;
  gmail_message_id: string | null;
  gmail_thread_id: string | null;
  from_email: string | null;
  to_emails: string | null;
  subject: string | null;
  body_text: string | null;
  body_html: string | null;
  has_attachments: boolean;
  attachments_count: number | null;
  attachments_info: Record<string, any> | null;
  gmail_labels: string | null;
  ai_summary: string | null;
  ai_intent: string | null;
  ai_sentiment: string | null;
  ai_priority: string | null;
  direction: string;
  whatsapp_customer_id: string | null;
  whatsapp_session_id: string | null;
  whatsapp_message_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface PhotoRequest {
  id: string;
  company_id: string;
  photos_instance_id: string | null;
  customer_phone: string | null;
  customer_name: string | null;
  whatsapp_customer_id: string | null;
  whatsapp_session_id: string | null;
  whatsapp_message_id: string | null;
  request_type: string;
  search_query: string | null;
  search_results_count: number | null;
  search_results: Record<string, any> | null;
  uploaded_photo_id: string | null;
  ai_parsed_request: Record<string, any> | null;
  ai_confidence: number | null;
  n8n_execution_id: string | null;
  bot_response: string | null;
  status: string;
  error_message: string | null;
  created_at: string;
}

export interface Photo {
  id: string;
  company_id: string;
  photos_instance_id: string | null;
  google_photo_id: string | null;
  google_photo_url: string | null;
  thumbnail_url: string | null;
  width: number | null;
  height: number | null;
  file_size_bytes: number | null;
  mime_type: string | null;
  description: string | null;
  album_id: string | null;
  album_name: string | null;
  tags: string | null;
  whatsapp_customer_id: string | null;
  whatsapp_session_id: string | null;
  whatsapp_message_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface SheetsQuery {
  id: string;
  company_id: string;
  sheets_instance_id: string | null;
  customer_phone: string | null;
  customer_name: string | null;
  whatsapp_customer_id: string | null;
  whatsapp_session_id: string | null;
  whatsapp_message_id: string | null;
  query_text: string;
  query_intent: string | null;
  ai_parsed_query: Record<string, any> | null;
  ai_confidence: number | null;
  search_results: Record<string, any> | null;
  results_count: number | null;
  query_language: string;
  bot_response: string | null;
  response_type: string | null;
  query_duration_ms: number | null;
  search_duration_ms: number | null;
  n8n_execution_id: string | null;
  status: string;
  error_message: string | null;
  created_at: string;
}

// =====================================================
// UI/COMPONENT TYPES
// =====================================================

export interface IntegrationAction {
  type: IntegrationType;
  id: string;
  label: string;
  timestamp: string;
  status?: string;
}

export interface ConversationFilter {
  status?: SessionStatus[];
  integrationTypes?: IntegrationType[];
  dateRange?: {
    start: string;
    end: string;
  };
  searchQuery?: string;
}

export interface UserProfileFilter {
  status?: CustomerStatus[];
  tags?: string[];
  searchQuery?: string;
  hasIntegrations?: IntegrationType[];
}

export interface MetricsDateRange {
  start: string;
  end: string;
  preset?: 'today' | 'week' | 'month' | 'custom';
}

export interface AnalyticsData {
  overall: {
    total_messages: number;
    customer_messages: number;
    bot_messages: number;
    agent_messages: number;
    active_sessions: number;
    avg_response_time: string;
    resolution_rate: number;
    satisfaction_score: number;
  };
  integrations: {
    [key in IntegrationType]: {
      total_requests: number;
      success_count: number;
      error_count: number;
      avg_confidence: number;
    };
  };
  charts: {
    messages_over_time: Array<{ date: string; count: number }>;
    sentiment_distribution: Array<{ label: string; value: number }>;
    hourly_activity: Array<{ hour: number; count: number }>;
  };
}

export interface IntegrationConfig {
  type: IntegrationType;
  enabled: boolean;
  instance_id: string | null;
  instance_name: string | null;
  settings: Record<string, any>;
}

export interface InstanceSwitcherOption {
  id: string;
  name: string;
  phone_number: string | null;
  instance_type: InstanceType | null;
  is_connected: boolean;
  is_current: boolean;
}

// =====================================================
// API RESPONSE TYPES
// =====================================================

export interface WhatsAppInstanceWithStats extends WhatsAppInstance {
  stats: {
    active_sessions: number;
    today_messages: number;
    total_users: number;
    error_count: number;
  };
}

export interface SessionWithMessages extends WhatsAppSession {
  messages: WhatsAppMessage[];
  integration_actions: IntegrationAction[];
}

export interface UserProfileWithHistory extends WhatsAppUserProfile {
  sessions: WhatsAppSession[];
  integration_history: {
    appointments: AppointmentRequest[];
    documents: GeneratedDocument[];
    drive_files: DriveFile[];
    gmail_messages: GmailMessage[];
    photos: Photo[];
    sheets_queries: SheetsQuery[];
  };
}

// =====================================================
// FORM TYPES
// =====================================================

export interface CreateInstanceFormData {
  instance_name: string;
  phone_number: string;
  instance_type: InstanceType;
  evolution_api_url: string;
  evolution_api_key: string;
  gemini_api_key: string;
  ai_system_prompt: string;
  settings?: Record<string, any>;
  ai_settings?: Record<string, any>;
}

export interface UpdateInstanceFormData extends Partial<CreateInstanceFormData> {
  id: string;
}

export interface SupportTicketFormData {
  issue_type: string;
  instance_id?: string;
  integration_type?: IntegrationType;
  priority: 'low' | 'medium' | 'high';
  subject: string;
  description: string;
  screenshot?: File;
}
