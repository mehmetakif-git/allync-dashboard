// =====================================================
// WhatsApp Formatters - Utility Functions
// =====================================================

import { IntegrationType } from '../../types/whatsapp';
import {
  Calendar, FileText, Folder, Mail, Image, Table,
  MessageCircle, CheckCircle, Clock, XCircle, Circle,
  TrendingUp, TrendingDown, Minus
} from 'lucide-react';

/**
 * Format phone number to international format
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return 'N/A';

  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // Format as international: +XX (XXX) XXX-XXXX
  if (cleaned.length >= 10) {
    const countryCode = cleaned.slice(0, -10);
    const areaCode = cleaned.slice(-10, -7);
    const firstPart = cleaned.slice(-7, -4);
    const secondPart = cleaned.slice(-4);

    if (countryCode) {
      return `+${countryCode} (${areaCode}) ${firstPart}-${secondPart}`;
    }
    return `(${areaCode}) ${firstPart}-${secondPart}`;
  }

  return phone;
}

/**
 * Format message timestamp relative to now
 */
export function formatMessageTime(timestamp: string): string {
  if (!timestamp) return '';

  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  // Less than a minute
  if (diffInSeconds < 60) {
    return 'Just now';
  }

  // Less than an hour
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  }

  // Less than a day
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  }

  // Less than a week
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  }

  // Show date
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
}

/**
 * Format session duration
 */
export function formatSessionDuration(start: string, end?: string): string {
  if (!start) return 'N/A';

  const startDate = new Date(start);
  const endDate = end ? new Date(end) : new Date();
  const diffInSeconds = Math.floor((endDate.getTime() - startDate.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds}s`;
  }

  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    const seconds = diffInSeconds % 60;
    return `${minutes}m ${seconds}s`;
  }

  const hours = Math.floor(diffInSeconds / 3600);
  const minutes = Math.floor((diffInSeconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

/**
 * Truncate message text
 */
export function truncateMessage(text: string, length: number = 50): string {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}

/**
 * Get integration icon component
 */
export function getIntegrationIcon(type: IntegrationType) {
  switch (type) {
    case IntegrationType.APPOINTMENT:
      return Calendar;
    case IntegrationType.DOCUMENT:
      return FileText;
    case IntegrationType.DRIVE:
      return Folder;
    case IntegrationType.GMAIL:
      return Mail;
    case IntegrationType.PHOTO:
      return Image;
    case IntegrationType.SHEETS:
      return Table;
    default:
      return MessageCircle;
  }
}

/**
 * Get integration color
 */
export function getIntegrationColor(type: IntegrationType): string {
  switch (type) {
    case IntegrationType.APPOINTMENT:
      return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
    case IntegrationType.DOCUMENT:
      return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
    case IntegrationType.DRIVE:
      return 'text-green-400 bg-green-500/10 border-green-500/30';
    case IntegrationType.GMAIL:
      return 'text-red-400 bg-red-500/10 border-red-500/30';
    case IntegrationType.PHOTO:
      return 'text-pink-400 bg-pink-500/10 border-pink-500/30';
    case IntegrationType.SHEETS:
      return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
    default:
      return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
  }
}

/**
 * Get integration display name
 */
export function getIntegrationDisplayName(type: IntegrationType): string {
  switch (type) {
    case IntegrationType.APPOINTMENT:
      return 'Appointment';
    case IntegrationType.DOCUMENT:
      return 'Document';
    case IntegrationType.DRIVE:
      return 'Drive';
    case IntegrationType.GMAIL:
      return 'Gmail';
    case IntegrationType.PHOTO:
      return 'Photo';
    case IntegrationType.SHEETS:
      return 'Sheets';
    default:
      return 'Unknown';
  }
}

/**
 * Alias for getIntegrationDisplayName
 */
export function getIntegrationLabel(type: IntegrationType): string {
  return getIntegrationDisplayName(type);
}

/**
 * Get integration emoji
 */
export function getIntegrationEmoji(type: IntegrationType): string {
  switch (type) {
    case IntegrationType.APPOINTMENT:
      return '📅';
    case IntegrationType.DOCUMENT:
      return '📄';
    case IntegrationType.DRIVE:
      return '📁';
    case IntegrationType.GMAIL:
      return '📧';
    case IntegrationType.PHOTO:
      return '📷';
    case IntegrationType.SHEETS:
      return '📊';
    default:
      return '💬';
  }
}

/**
 * Get sentiment color
 */
export function getSentimentColor(sentiment: string | null): string {
  if (!sentiment) return 'text-gray-400';

  const s = sentiment.toLowerCase();
  if (s.includes('positive')) return 'text-green-400';
  if (s.includes('negative')) return 'text-red-400';
  return 'text-yellow-400';
}

/**
 * Get sentiment icon
 */
export function getSentimentIcon(sentiment: string | null) {
  if (!sentiment) return Circle;

  const s = sentiment.toLowerCase();
  if (s.includes('positive')) return CheckCircle;
  if (s.includes('negative')) return XCircle;
  return Minus;
}

/**
 * Format file size from bytes
 */
export function formatFileSize(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${units[i]}`;
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  if (typeof value !== 'number' || isNaN(value)) return '0%';
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format large numbers with K, M suffixes
 */
export function formatNumber(num: number): string {
  if (!num || num === 0) return '0';

  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

/**
 * Get status color
 */
export function getStatusColor(status: string): string {
  const s = status.toLowerCase();

  if (s === 'active') return 'text-green-400 bg-green-500/10 border-green-500/30';
  if (s === 'closed' || s === 'completed') return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
  if (s === 'pending') return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
  if (s === 'blocked' || s === 'rejected') return 'text-red-400 bg-red-500/10 border-red-500/30';
  if (s === 'archived') return 'text-purple-400 bg-purple-500/10 border-purple-500/30';

  return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
}

/**
 * Get status icon
 */
export function getStatusIcon(status: string) {
  const s = status.toLowerCase();

  if (s === 'active') return CheckCircle;
  if (s === 'closed' || s === 'completed') return CheckCircle;
  if (s === 'pending') return Clock;
  if (s === 'blocked' || s === 'rejected') return XCircle;

  return Circle;
}

/**
 * Format date range
 */
export function formatDateRange(start: string, end: string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);

  const sameYear = startDate.getFullYear() === endDate.getFullYear();
  const sameMonth = sameYear && startDate.getMonth() === endDate.getMonth();

  const startStr = startDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: sameYear ? undefined : 'numeric'
  });

  const endStr = endDate.toLocaleDateString('en-US', {
    month: sameMonth ? undefined : 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return `${startStr} - ${endStr}`;
}

/**
 * Format response time (interval to human readable)
 */
export function formatResponseTime(interval: string | null): string {
  if (!interval) return 'N/A';

  // Parse PostgreSQL interval format
  // Examples: "00:05:30", "01:23:45", "2 days 03:45:12"

  try {
    // Simple case: HH:MM:SS
    if (interval.includes(':')) {
      const parts = interval.split(' ');
      let days = 0;
      let timeStr = interval;

      if (parts.length > 1 && parts[0].includes('day')) {
        days = parseInt(parts[0]);
        timeStr = parts[parts.length - 1];
      }

      const [hours, minutes, seconds] = timeStr.split(':').map(Number);

      if (days > 0) {
        return `${days}d ${hours}h`;
      }
      if (hours > 0) {
        return `${hours}h ${minutes}m`;
      }
      if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
      }
      return `${seconds}s`;
    }

    return interval;
  } catch (error) {
    return interval;
  }
}

/**
 * Get trend icon and color
 */
export function getTrendIndicator(current: number, previous: number): {
  icon: any;
  color: string;
  percentage: number;
} {
  if (previous === 0) {
    return {
      icon: TrendingUp,
      color: 'text-green-400',
      percentage: 100
    };
  }

  const change = ((current - previous) / previous) * 100;

  if (change > 0) {
    return {
      icon: TrendingUp,
      color: 'text-green-400',
      percentage: change
    };
  } else if (change < 0) {
    return {
      icon: TrendingDown,
      color: 'text-red-400',
      percentage: Math.abs(change)
    };
  }

  return {
    icon: Minus,
    color: 'text-gray-400',
    percentage: 0
  };
}

/**
 * Format AI confidence score
 */
export function formatConfidence(score: number | null): string {
  if (!score) return 'N/A';

  const percentage = (score * 100).toFixed(0);
  return `${percentage}%`;
}

/**
 * Get confidence color
 */
export function getConfidenceColor(score: number | null): string {
  if (!score) return 'text-gray-400';

  if (score >= 0.8) return 'text-green-400';
  if (score >= 0.6) return 'text-yellow-400';
  return 'text-red-400';
}

/**
 * Format message type display
 */
export function formatMessageType(type: string): string {
  const typeMap: Record<string, string> = {
    'text': 'Text',
    'image': 'Image',
    'audio': 'Audio',
    'video': 'Video',
    'document': 'Document',
    'location': 'Location'
  };

  return typeMap[type] || type;
}

/**
 * Get instance type badge color
 */
export function getInstanceTypeBadgeColor(type: string): string {
  switch (type) {
    case 'sales':
      return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    case 'support':
      return 'bg-green-500/10 text-green-400 border-green-500/30';
    case 'general':
      return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
    case 'info':
      return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
    case 'marketing':
      return 'bg-pink-500/10 text-pink-400 border-pink-500/30';
    default:
      return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
  }
}
