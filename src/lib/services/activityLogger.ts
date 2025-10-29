import { createActivityLog } from '../api/activityLogs';
import type { CreateActivityLog, ActivityStatus, SeverityLevel, DeviceType } from '../api/activityTypes';

// =====================================================
// ACTIVITY LOGGER SERVICE
// Automatic activity tracking for the entire application
// =====================================================

class ActivityLogger {
  private static instance: ActivityLogger;
  private sessionId: string;
  private userId: string | null = null;
  private companyId: string | null = null;

  private constructor() {
    this.sessionId = this.generateSessionId();
    this.detectDevice();
  }

  public static getInstance(): ActivityLogger {
    if (!ActivityLogger.instance) {
      ActivityLogger.instance = new ActivityLogger();
    }
    return ActivityLogger.instance;
  }

  // =====================================================
  // SETUP
  // =====================================================

  public setUser(userId: string, companyId: string | null) {
    this.userId = userId;
    this.companyId = companyId;
    console.log('✅ ActivityLogger: User set', { userId, companyId });
  }

  public clearUser() {
    this.userId = null;
    this.companyId = null;
    console.log('✅ ActivityLogger: User cleared');
  }

  // =====================================================
  // CORE LOGGING METHOD
  // =====================================================

  public async log(params: {
    action: string;
    category?: string;
    entity_type?: string;
    entity_id?: string;
    description?: string;
    details?: Record<string, any>;
    status?: ActivityStatus;
    severity?: SeverityLevel;
    changed_data?: { before?: any; after?: any };
    error?: Error | string;
    duration_ms?: number;
    tags?: string[];
  }): Promise<void> {
    try {
      const logData: CreateActivityLog = {
        user_id: this.userId,
        company_id: this.companyId,
        action: params.action,
        action_category: params.category,
        entity_type: params.entity_type,
        entity_id: params.entity_id,
        description: params.description,
        details: params.details || {},
        status: params.status || 'success',
        severity_level: params.severity || 'info',
        changed_data: params.changed_data || {},
        session_id: this.sessionId,
        ip_address: await this.getIpAddress(),
        user_agent: navigator.userAgent,
        device_type: this.detectDevice(),
        browser: this.detectBrowser(),
        location_data: await this.getLocationData(),
        error_message: params.error
          ? params.error instanceof Error
            ? params.error.message
            : params.error
          : undefined,
        duration_ms: params.duration_ms,
        tags: params.tags,
        metadata: {
          url: window.location.href,
          timestamp: new Date().toISOString(),
        },
      };

      await createActivityLog(logData);
      console.log('📝 Activity logged:', params.action);
    } catch (error) {
      console.error('❌ Failed to log activity:', error);
      // Don't throw - logging should never break the app
    }
  }

  // =====================================================
  // CONVENIENCE METHODS
  // =====================================================

  // AUTH ACTIONS
  public async logLogin(userId: string, companyId: string | null) {
    this.setUser(userId, companyId);
    await this.log({
      action: 'User Login',
      action_category: 'auth',  // ✅ FIXED
      description: 'User logged in successfully',
      status: 'success',
      severity: 'info',
    });
  }

  public async logLogout() {
    await this.log({
      action: 'User Logout',
      action_category: 'auth',  // ✅ FIXED
      description: 'User logged out',
      status: 'success',
      severity: 'info',
    });
    this.clearUser();
  }

  public async logLoginFailed(error: string) {
    await this.log({
      action: 'Login Failed',
      action_category: 'auth',  // ✅ FIXED
      description: 'Failed login attempt',
      status: 'failed',
      severity: 'warning',
      error: error,
    });
  }

  // CREATE ACTIONS
  public async logCreate(entityType: string, entityId: string, details?: any) {
    await this.log({
      action: `${entityType} Created`,
      action_category: 'create',  // ✅ FIXED
      entity_type: entityType,
      entity_id: entityId,
      description: `Created new ${entityType}`,
      details: details,
      status: 'success',
      severity: 'info',
      tags: ['create', entityType.toLowerCase()],
    });
  }

  // UPDATE ACTIONS
  public async logUpdate(
    entityType: string,
    entityId: string,
    before: any,
    after: any,
    details?: any
  ) {
    await this.log({
      action: `${entityType} Updated`,
      action_category: 'update',  // ✅ FIXED
      entity_type: entityType,
      entity_id: entityId,
      description: `Updated ${entityType}`,
      details: details,
      changed_data: { before, after },
      status: 'success',
      severity: 'info',
      tags: ['update', entityType.toLowerCase()],
    });
  }

  // DELETE ACTIONS
  public async logDelete(entityType: string, entityId: string, details?: any) {
    await this.log({
      action: `${entityType} Deleted`,
      action_category: 'delete',  // ✅ FIXED
      entity_type: entityType,
      entity_id: entityId,
      description: `Deleted ${entityType}`,
      details: details,
      status: 'success',
      severity: 'warning',
      tags: ['delete', entityType.toLowerCase()],
    });
  }

  // VIEW ACTIONS
  public async logView(entityType: string, entityId: string, details?: any) {
    await this.log({
      action: `${entityType} Viewed`,
      action_category: 'view',  // ✅ FIXED
      entity_type: entityType,
      entity_id: entityId,
      description: `Viewed ${entityType}`,
      details: details,
      status: 'success',
      severity: 'info',
      tags: ['view', entityType.toLowerCase()],
    });
  }

  // EXPORT ACTIONS
  public async logExport(format: string, recordCount: number, filters?: any) {
    await this.log({
      action: 'Data Exported',
      category: 'export',
      description: `Exported ${recordCount} records as ${format}`,
      details: { format, recordCount, filters },
      status: 'success',
      severity: 'info',
      tags: ['export', format.toLowerCase()],
    });
  }

  // SYSTEM ACTIONS
  public async logSystemAction(action: string, description: string, details?: any) {
    await this.log({
      action: action,
      category: 'system',
      description: description,
      details: details,
      status: 'success',
      severity: 'info',
      tags: ['system'],
    });
  }

  // ERROR LOGGING
  public async logError(
    action: string,
    error: Error | string,
    details?: any,
    severity: SeverityLevel = 'error'
  ) {
    await this.log({
      action: action,
      category: 'error',
      description: `Error: ${error instanceof Error ? error.message : error}`,
      details: details,
      status: 'failed',
      severity: severity,
      error: error,
      tags: ['error'],
    });
  }

  // SETTINGS ACTIONS
  public async logSettingsChange(
    settingName: string,
    oldValue: any,
    newValue: any
  ) {
    await this.log({
      action: 'Settings Updated',
      category: 'settings',
      entity_type: 'setting',
      entity_id: settingName,
      description: `Changed ${settingName}`,
      changed_data: {
        before: { [settingName]: oldValue },
        after: { [settingName]: newValue },
      },
      status: 'success',
      severity: 'info',
      tags: ['settings'],
    });
  }

  // SERVICE ACTIONS
  public async logServiceAction(
    serviceName: string,
    action: string,
    details?: any
  ) {
    await this.log({
      action: `${serviceName} ${action}`,
      category: 'service',
      entity_type: 'service',
      entity_id: serviceName,
      description: `${action} ${serviceName} service`,
      details: details,
      status: 'success',
      severity: 'info',
      tags: ['service', serviceName.toLowerCase()],
    });
  }

  // SERVICE CONFIGURATION
  public async logServiceConfigured(
    userId: string,
    companyId: string,
    serviceName: string,
    action: 'created' | 'updated'
  ) {
    await this.log({
      action: `Service Configuration ${action === 'created' ? 'Created' : 'Updated'}`,
      category: 'service',
      entity_type: 'service_configuration',
      entity_id: serviceName,
      description: `${action === 'created' ? 'Created' : 'Updated'} ${serviceName} service configuration`,
      details: {
        service_name: serviceName,
        configured_by: userId,
        company_id: companyId,
        action: action,
      },
      status: 'success',
      severity: 'info',
      tags: ['service', 'configuration', serviceName.toLowerCase(), action],
    });
  }

  // PAYMENT ACTIONS
  public async logPayment(
    action: string,
    amount: number,
    currency: string,
    details?: any
  ) {
    await this.log({
      action: action,
      category: 'payment',
      description: `Payment ${action.toLowerCase()}: ${currency} ${amount}`,
      details: { ...details, amount, currency },
      status: 'success',
      severity: 'info',
      tags: ['payment'],
    });
  }

  // PERFORMANCE TRACKING
  public async logPerformance(
    action: string,
    durationMs: number,
    details?: any
  ) {
    const severity: SeverityLevel =
      durationMs > 5000 ? 'warning' : durationMs > 10000 ? 'error' : 'info';

    await this.log({
      action: action,
      category: 'performance',
      description: `Operation took ${durationMs}ms`,
      details: details,
      duration_ms: durationMs,
      status: 'success',
      severity: severity,
      tags: ['performance'],
    });
  }

  // =====================================================
  // HELPER METHODS
  // =====================================================

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private detectDevice(): DeviceType {
    const ua = navigator.userAgent.toLowerCase();
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return 'tablet';
    }
    if (/mobile|iphone|ipod|android|blackberry|mini|windows\sce|palm/i.test(ua)) {
      return 'mobile';
    }
    return 'desktop';
  }

  private detectBrowser(): string {
    const ua = navigator.userAgent;
    let browser = 'Unknown';

    if (ua.indexOf('Firefox') > -1) {
      browser = 'Firefox';
    } else if (ua.indexOf('Opera') > -1 || ua.indexOf('OPR') > -1) {
      browser = 'Opera';
    } else if (ua.indexOf('Trident') > -1) {
      browser = 'Internet Explorer';
    } else if (ua.indexOf('Edge') > -1) {
      browser = 'Edge';
    } else if (ua.indexOf('Chrome') > -1) {
      browser = 'Chrome';
    } else if (ua.indexOf('Safari') > -1) {
      browser = 'Safari';
    }

    return browser;
  }

  private async getIpAddress(): Promise<string | null> {
    try {
      // Note: In production, get IP from backend
      // This is a placeholder
      return null;
    } catch (error) {
      return null;
    }
  }

  private async getLocationData(): Promise<Record<string, any>> {
    try {
      // Note: In production, use IP geolocation service
      // This is a placeholder
      return {};
    } catch (error) {
      return {};
    }
  }
}

// =====================================================
// SINGLETON INSTANCE
// =====================================================

export const activityLogger = ActivityLogger.getInstance();

// =====================================================
// CONVENIENCE EXPORT
// =====================================================

export default activityLogger;

// =====================================================
// USAGE EXAMPLES:
// =====================================================

/*
// In your login function:
import activityLogger from './services/activityLogger';

async function handleLogin(email, password) {
  try {
    const { user, company } = await login(email, password);
    await activityLogger.logLogin(user.id, company.id);
  } catch (error) {
    await activityLogger.logLoginFailed(error.message);
  }
}

// In your CRUD operations:
async function createCompany(data) {
  const company = await api.createCompany(data);
  await activityLogger.logCreate('Company', company.id, data);
  return company;
}

async function updateUser(id, updates) {
  const oldUser = await api.getUser(id);
  const newUser = await api.updateUser(id, updates);
  await activityLogger.logUpdate('User', id, oldUser, newUser);
  return newUser;
}

async function deleteInvoice(id) {
  await api.deleteInvoice(id);
  await activityLogger.logDelete('Invoice', id);
}

// Performance tracking:
const start = Date.now();
await heavyOperation();
await activityLogger.logPerformance('Heavy Operation', Date.now() - start);

// Error tracking:
try {
  await riskyOperation();
} catch (error) {
  await activityLogger.logError('Risky Operation Failed', error, { context: 'details' }, 'critical');
}
*/