// =====================================================
// CONSOLE LOGGER SERVICE
// Safe console logging with environment checks
// =====================================================

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class ConsoleLogger {
  private static instance: ConsoleLogger;
  private isDevelopment: boolean;
  private minLevel: LogLevel;

  // Sensitive keys that should NEVER be logged
  private sensitiveKeys = [
    'password',
    'token',
    'secret',
    'api_key',
    'apiKey',
    'access_token',
    'refresh_token',
    'authorization',
    'credit_card',
    'ssn',
    'pin',
  ];

  private constructor() {
    // Check if we're in development
    this.isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';
    this.minLevel = this.isDevelopment ? 'debug' : 'error';
  }

  public static getInstance(): ConsoleLogger {
    if (!ConsoleLogger.instance) {
      ConsoleLogger.instance = new ConsoleLogger();
    }
    return ConsoleLogger.instance;
  }

  // =====================================================
  // CORE LOGGING METHODS
  // =====================================================

  public debug(message: string, data?: any): void {
    if (this.shouldLog('debug')) {
      console.log(`🔍 [DEBUG] ${message}`, this.sanitize(data));
    }
  }

  public info(message: string, data?: any): void {
    if (this.shouldLog('info')) {
      console.log(`ℹ️ [INFO] ${message}`, this.sanitize(data));
    }
  }

  public warn(message: string, data?: any): void {
    if (this.shouldLog('warn')) {
      console.warn(`⚠️ [WARN] ${message}`, this.sanitize(data));
    }
  }

  public error(message: string, error?: any): void {
    if (this.shouldLog('error')) {
      console.error(`❌ [ERROR] ${message}`, this.sanitize(error));
    }
  }

  public success(message: string, data?: any): void {
    if (this.shouldLog('info')) {
      console.log(`✅ [SUCCESS] ${message}`, this.sanitize(data));
    }
  }

  // API specific logging
  public apiRequest(endpoint: string, method: string, data?: any): void {
    if (this.shouldLog('debug')) {
      console.log(`📡 [API REQUEST] ${method} ${endpoint}`, this.sanitize(data));
    }
  }

  public apiResponse(endpoint: string, status: number, data?: any): void {
    if (this.shouldLog('debug')) {
      const emoji = status < 300 ? '✅' : status < 400 ? '⚠️' : '❌';
      console.log(`${emoji} [API RESPONSE] ${status} ${endpoint}`, this.sanitize(data));
    }
  }

  // =====================================================
  // HELPER METHODS
  // =====================================================

  private shouldLog(level: LogLevel): boolean {
    if (!this.isDevelopment && level !== 'error') {
      return false;
    }

    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.minLevel);
  }

  // Remove sensitive data before logging
  private sanitize(data: any): any {
    if (!data) return data;

    // Don't modify primitives
    if (typeof data !== 'object') return data;

    // Handle arrays
    if (Array.isArray(data)) {
      return data.map(item => this.sanitize(item));
    }

    // Handle objects
    const sanitized: any = {};
    for (const key in data) {
      if (this.isSensitiveKey(key)) {
        sanitized[key] = '***REDACTED***';
      } else if (typeof data[key] === 'object' && data[key] !== null) {
        sanitized[key] = this.sanitize(data[key]);
      } else {
        sanitized[key] = data[key];
      }
    }
    return sanitized;
  }

  private isSensitiveKey(key: string): boolean {
    const lowerKey = key.toLowerCase();
    return this.sensitiveKeys.some(sensitive => lowerKey.includes(sensitive));
  }

  // =====================================================
  // CONFIGURATION
  // =====================================================

  public setMinLevel(level: LogLevel): void {
    this.minLevel = level;
  }

  public enableProduction(): void {
    this.isDevelopment = false;
  }

  public disableProduction(): void {
    this.isDevelopment = true;
  }
}

// =====================================================
// SINGLETON INSTANCE
// =====================================================

export const logger = ConsoleLogger.getInstance();

export default logger;

// =====================================================
// USAGE EXAMPLES:
// =====================================================

/*
import logger from './services/consoleLogger';

// Basic logging
logger.info('User logged in', { userId: '123' });
logger.error('Failed to fetch data', error);
logger.warn('API rate limit approaching', { remaining: 5 });
logger.debug('Component rendered', { props });

// API logging
logger.apiRequest('/api/users', 'GET');
logger.apiResponse('/api/users', 200, { count: 10 });

// This will automatically redact sensitive data:
logger.info('User data', { 
  name: 'John',
  password: 'secret123',  // Will be shown as ***REDACTED***
  token: 'abc123'         // Will be shown as ***REDACTED***
});
*/