// =====================================================
// ACTIVITY LOGS - TYPE DEFINITIONS
// =====================================================

// =====================================================
// ENUMS
// =====================================================

export enum ActivityStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
  PENDING = 'pending',
  WARNING = 'warning',
}

export enum SeverityLevel {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

export enum ActionCategory {
  AUTH = 'auth',
  USER = 'user',
  COMPANY = 'company',
  SERVICE = 'service',
  INVOICE = 'invoice',
  PAYMENT = 'payment',
  NOTIFICATION = 'notification',
  SYSTEM = 'system',
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  VIEW = 'view',
  EXPORT = 'export',
  IMPORT = 'import',
  SETTINGS = 'settings',
  MAINTENANCE = 'maintenance',
}

export enum DeviceType {
  DESKTOP = 'desktop',
  MOBILE = 'mobile',
  TABLET = 'tablet',
  UNKNOWN = 'unknown',
}

export enum EntityType {
  USER = 'user',
  COMPANY = 'company',
  SERVICE = 'service',
  INVOICE = 'invoice',
  PAYMENT = 'payment',
  NOTIFICATION = 'notification',
  MAINTENANCE_WINDOW = 'maintenance_window',
  SYSTEM_SETTING = 'system_setting',
  SUPPORT_TICKET = 'support_ticket',
  TRANSACTION = 'transaction',
}

// =====================================================
// INTERFACES
// =====================================================

export interface ActivityLog {
  id: string;
  company_id: string | null;
  user_id: string | null;
  action: string;
  action_category: string | null;
  entity_type: string | null;
  entity_id: string | null;
  description: string | null;
  details: Record<string, any>;
  ip_address: string | null;
  user_agent: string | null;
  metadata: Record<string, any>;
  status: ActivityStatus;
  severity_level: SeverityLevel;
  changed_data: ChangedData;
  session_id: string | null;
  device_type: DeviceType | null;
  browser: string | null;
  location_data: LocationData;
  error_message: string | null;
  duration_ms: number | null;
  tags: string[] | null;
  created_at: string;
  
  // Relations (joined data)
  user?: {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
    role: string;
  };
  company?: {
    id: string;
    name: string;
    email: string;
    country: string;
    status: string;
  };
}

export interface ChangedData {
  before?: Record<string, any>;
  after?: Record<string, any>;
  fields_changed?: string[];
}

export interface LocationData {
  country?: string;
  city?: string;
  region?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
}

// =====================================================
// CREATE/UPDATE INTERFACES
// =====================================================

export interface CreateActivityLog {
  company_id?: string | null;
  user_id?: string | null;
  action: string;
  action_category?: string;
  entity_type?: string;
  entity_id?: string;
  description?: string;
  details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  metadata?: Record<string, any>;
  status?: ActivityStatus;
  severity_level?: SeverityLevel;
  changed_data?: ChangedData;
  session_id?: string;
  device_type?: DeviceType;
  browser?: string;
  location_data?: LocationData;
  error_message?: string;
  duration_ms?: number;
  tags?: string[];
}

// =====================================================
// FILTER/QUERY INTERFACES
// =====================================================

export interface ActivityLogFilters {
  company_id?: string;
  user_id?: string;
  action_category?: string;
  entity_type?: string;
  status?: ActivityStatus;
  severity_level?: SeverityLevel;
  device_type?: DeviceType;
  start_date?: string;
  end_date?: string;
  search?: string;
  tags?: string[];
  has_error?: boolean;
}

export interface ActivityLogQueryOptions {
  filters?: ActivityLogFilters;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
  include_user?: boolean;
  include_company?: boolean;
}

// =====================================================
// STATISTICS INTERFACES
// =====================================================

export interface ActivityStatistics {
  total_logs: number;
  success_count: number;
  failed_count: number;
  warning_count: number;
  critical_count: number;
  login_count: number;
  logout_count: number;
  create_count: number;
  update_count: number;
  delete_count: number;
  unique_users: number;
  unique_companies: number;
  avg_duration_ms: number | null;
}

export interface ActivityTimeline {
  hour: string;
  log_count: number;
  success_count: number;
  failed_count: number;
}

export interface TopActiveUser {
  user_id: string;
  user_name: string;
  user_email: string;
  activity_count: number;
  last_activity: string;
}

export interface ActivitySummary {
  by_category: Record<string, number>;
  by_status: Record<string, number>;
  by_severity: Record<string, number>;
  by_device: Record<string, number>;
  by_browser: Record<string, number>;
  by_hour: ActivityTimeline[];
  top_users: TopActiveUser[];
  recent_errors: ActivityLog[];
}

// =====================================================
// EXPORT INTERFACES
// =====================================================

export interface ExportOptions {
  format: 'csv' | 'excel' | 'json';
  filters?: ActivityLogFilters;
  include_user_details?: boolean;
  include_company_details?: boolean;
  filename?: string;
}

export interface ExportResult {
  success: boolean;
  filename: string;
  format: string;
  record_count: number;
  file_size?: number;
  download_url?: string;
}

// =====================================================
// PAGINATION
// =====================================================

export interface PaginatedActivityLogs {
  data: ActivityLog[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// =====================================================
// UTILITY TYPES
// =====================================================

export type ActivityLogWithRelations = ActivityLog & {
  user: NonNullable<ActivityLog['user']>;
  company: NonNullable<ActivityLog['company']>;
};

export type ActivityLogPreview = Pick<
  ActivityLog,
  'id' | 'action' | 'action_category' | 'status' | 'created_at'
>;

// =====================================================
// HELPER TYPE GUARDS
// =====================================================

export function isSuccessStatus(status: ActivityStatus): boolean {
  return status === ActivityStatus.SUCCESS;
}

export function isErrorStatus(status: ActivityStatus): boolean {
  return status === ActivityStatus.FAILED;
}

export function isCriticalSeverity(severity: SeverityLevel): boolean {
  return severity === SeverityLevel.CRITICAL || severity === SeverityLevel.ERROR;
}

export function hasChangedData(log: ActivityLog): boolean {
  return (
    log.changed_data &&
    (!!log.changed_data.before || !!log.changed_data.after)
  );
}