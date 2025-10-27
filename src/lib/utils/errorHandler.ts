// =====================================================
// ERROR HANDLER UTILITY
// Secure error handling with user-friendly messages
// =====================================================

import logger from '../services/consoleLogger';

export interface ErrorResponse {
  userMessage: string;
  shouldRetry: boolean;
  severity: 'low' | 'medium' | 'high';
}

class ErrorHandler {
  private static instance: ErrorHandler;

  // Generic user-friendly messages (NO technical details)
  private readonly genericMessages = {
    network: 'Unable to connect. Please check your internet connection and try again.',
    server: 'Something went wrong on our end. Please try again in a few moments.',
    validation: 'Please check your input and try again.',
    permission: 'You do not have permission to perform this action.',
    notFound: 'The requested item could not be found.',
    timeout: 'The request took too long. Please try again.',
    unknown: 'An unexpected error occurred. Please try again or contact support.',
  };

  private constructor() {}

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  // =====================================================
  // MAIN ERROR HANDLING METHOD
  // =====================================================

  public handle(error: any, context?: string): ErrorResponse {
    // Log technical details (only in development)
    logger.error(`Error in ${context || 'unknown context'}`, error);

    // Determine error type and return safe message
    if (this.isNetworkError(error)) {
      return {
        userMessage: this.genericMessages.network,
        shouldRetry: true,
        severity: 'medium',
      };
    }

    if (this.isAuthError(error)) {
      return {
        userMessage: this.genericMessages.permission,
        shouldRetry: false,
        severity: 'high',
      };
    }

    if (this.isValidationError(error)) {
      return {
        userMessage: this.getValidationMessage(error),
        shouldRetry: false,
        severity: 'low',
      };
    }

    if (this.isNotFoundError(error)) {
      return {
        userMessage: this.genericMessages.notFound,
        shouldRetry: false,
        severity: 'low',
      };
    }

    if (this.isTimeoutError(error)) {
      return {
        userMessage: this.genericMessages.timeout,
        shouldRetry: true,
        severity: 'medium',
      };
    }

    // Default: Generic server error (SAFE - no details exposed)
    return {
      userMessage: this.genericMessages.server,
      shouldRetry: true,
      severity: 'high',
    };
  }

  // =====================================================
  // ERROR TYPE DETECTION
  // =====================================================

  private isNetworkError(error: any): boolean {
    return (
      error?.message?.toLowerCase().includes('network') ||
      error?.message?.toLowerCase().includes('fetch') ||
      error?.code === 'NETWORK_ERROR' ||
      !navigator.onLine
    );
  }

  private isAuthError(error: any): boolean {
    return (
      error?.status === 401 ||
      error?.status === 403 ||
      error?.code === 'PGRST301' || // Supabase auth error
      error?.message?.toLowerCase().includes('unauthorized') ||
      error?.message?.toLowerCase().includes('permission')
    );
  }

  private isValidationError(error: any): boolean {
    return (
      error?.status === 400 ||
      error?.code === 'PGRST102' || // Supabase validation error
      error?.message?.toLowerCase().includes('invalid') ||
      error?.message?.toLowerCase().includes('required')
    );
  }

  private isNotFoundError(error: any): boolean {
    return (
      error?.status === 404 ||
      error?.code === 'PGRST116' || // Supabase not found
      error?.message?.toLowerCase().includes('not found')
    );
  }

  private isTimeoutError(error: any): boolean {
    return (
      error?.code === 'ETIMEDOUT' ||
      error?.message?.toLowerCase().includes('timeout')
    );
  }

  // =====================================================
  // SPECIFIC MESSAGE HANDLERS
  // =====================================================

  private getValidationMessage(error: any): string {
    // Return generic message - NEVER expose field names or constraints
    return this.genericMessages.validation;
  }

  // =====================================================
  // UTILITY METHODS
  // =====================================================

  // Get safe error message for notifications
  public getNotificationErrorMessage(error: any): string {
    const response = this.handle(error, 'Notification');
    return response.userMessage;
  }

  // Get safe error message for API calls
  public getApiErrorMessage(error: any, endpoint?: string): string {
    const response = this.handle(error, endpoint);
    return response.userMessage;
  }
}

// =====================================================
// SINGLETON INSTANCE
// =====================================================

export const errorHandler = ErrorHandler.getInstance();

export default errorHandler;

// =====================================================
// USAGE EXAMPLES:
// =====================================================

/*
import errorHandler from './utils/errorHandler';

// In API calls:
try {
  await createNotification(data);
} catch (err) {
  const errorInfo = errorHandler.handle(err, 'createNotification');
  showError(errorInfo.userMessage);
  // Technical details are logged automatically (dev only)
}

// Quick usage:
catch (err) {
  showError(errorHandler.getApiErrorMessage(err, 'createNotification'));
}
*/