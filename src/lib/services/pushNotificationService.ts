// =====================================================
// Push Notification Service
// =====================================================
// Uses Expo Server SDK to send push notifications to mobile devices

import { Expo, ExpoPushMessage, ExpoPushTicket, ExpoPushReceipt } from 'expo-server-sdk';
import { supabase } from '../supabase';
import logger from './consoleLogger';

// Initialize Expo SDK
const expo = new Expo({
  accessToken: process.env.EXPO_ACCESS_TOKEN, // Optional, for higher rate limits
  useFcmV1: true, // Use FCM v1 API (recommended)
});

// =====================================================
// TYPES
// =====================================================

export interface PushNotificationData {
  userId: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  sound?: 'default' | null;
  badge?: number;
  priority?: 'default' | 'normal' | 'high';
  channelId?: string;
}

export interface PushResult {
  success: boolean;
  userId: string;
  ticketId?: string;
  error?: string;
}

export interface BulkPushResult {
  total: number;
  successful: number;
  failed: number;
  results: PushResult[];
}

// =====================================================
// PUSH TOKEN MANAGEMENT
// =====================================================

/**
 * Register a push token for a user
 */
export async function registerPushToken(
  userId: string,
  pushToken: string,
  platform: 'ios' | 'android' | 'web'
): Promise<void> {
  try {
    // Validate Expo push token
    if (!Expo.isExpoPushToken(pushToken)) {
      throw new Error(`Invalid Expo push token: ${pushToken}`);
    }

    logger.info(`🔔 Registering push token for user ${userId}`, { platform });

    const { error } = await supabase
      .from('profiles')
      .update({
        push_token: pushToken,
        push_enabled: true,
        push_platform: platform,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) throw error;

    logger.success(`✅ Push token registered successfully for user ${userId}`);
  } catch (error: any) {
    logger.error(`❌ Failed to register push token for user ${userId}:`, error);
    throw error;
  }
}

/**
 * Unregister push token for a user (on logout)
 */
export async function unregisterPushToken(userId: string): Promise<void> {
  try {
    logger.info(`🔕 Unregistering push token for user ${userId}`);

    const { error } = await supabase
      .from('profiles')
      .update({
        push_token: null,
        push_enabled: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) throw error;

    logger.success(`✅ Push token unregistered for user ${userId}`);
  } catch (error: any) {
    logger.error(`❌ Failed to unregister push token for user ${userId}:`, error);
    throw error;
  }
}

/**
 * Get push token for a user
 */
export async function getPushToken(userId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('push_token, push_enabled')
      .eq('id', userId)
      .single();

    if (error) throw error;
    if (!data?.push_enabled || !data?.push_token) return null;

    return data.push_token;
  } catch (error: any) {
    logger.error(`❌ Failed to get push token for user ${userId}:`, error);
    return null;
  }
}

// =====================================================
// SEND PUSH NOTIFICATIONS
// =====================================================

/**
 * Send push notification to a single user
 */
export async function sendPushToUser(notification: PushNotificationData): Promise<PushResult> {
  try {
    const pushToken = await getPushToken(notification.userId);

    if (!pushToken) {
      logger.warn(`⚠️ User ${notification.userId} has no push token or push disabled`);
      return {
        success: false,
        userId: notification.userId,
        error: 'No push token or push notifications disabled',
      };
    }

    // Validate token
    if (!Expo.isExpoPushToken(pushToken)) {
      logger.error(`❌ Invalid push token for user ${notification.userId}: ${pushToken}`);
      await logPushNotification({
        userId: notification.userId,
        pushToken,
        status: 'error',
        errorMessage: 'Invalid Expo push token',
      });
      return {
        success: false,
        userId: notification.userId,
        error: 'Invalid push token',
      };
    }

    // Prepare push message
    const message: ExpoPushMessage = {
      to: pushToken,
      sound: notification.sound || 'default',
      title: notification.title,
      body: notification.message,
      data: notification.data || {},
      badge: notification.badge,
      priority: notification.priority || 'high',
      channelId: notification.channelId || 'default',
    };

    logger.info(`📤 Sending push to user ${notification.userId}`, { title: notification.title });

    // Send push notification
    const tickets = await expo.sendPushNotificationsAsync([message]);
    const ticket = tickets[0];

    // Check if successful
    if (ticket.status === 'ok') {
      logger.success(`✅ Push sent successfully to user ${notification.userId}`);

      // Log successful send
      await logPushNotification({
        userId: notification.userId,
        pushToken,
        status: 'sent',
        ticketId: ticket.id,
      });

      return {
        success: true,
        userId: notification.userId,
        ticketId: ticket.id,
      };
    } else {
      logger.error(`❌ Push failed for user ${notification.userId}:`, ticket.message);

      // Log failed send
      await logPushNotification({
        userId: notification.userId,
        pushToken,
        status: 'failed',
        errorMessage: ticket.message,
      });

      return {
        success: false,
        userId: notification.userId,
        error: ticket.message,
      };
    }
  } catch (error: any) {
    logger.error(`❌ Error sending push to user ${notification.userId}:`, error);
    return {
      success: false,
      userId: notification.userId,
      error: error.message,
    };
  }
}

/**
 * Send push notifications to multiple users
 */
export async function sendPushToMultipleUsers(
  notifications: PushNotificationData[]
): Promise<BulkPushResult> {
  logger.info(`📤 Sending push to ${notifications.length} users`);

  const results: PushResult[] = [];
  let successful = 0;
  let failed = 0;

  // Process in batches of 100 (Expo recommendation)
  const batchSize = 100;
  for (let i = 0; i < notifications.length; i += batchSize) {
    const batch = notifications.slice(i, i + batchSize);

    // Send each notification in parallel
    const batchResults = await Promise.all(
      batch.map(notification => sendPushToUser(notification))
    );

    results.push(...batchResults);

    // Count successes and failures
    batchResults.forEach(result => {
      if (result.success) successful++;
      else failed++;
    });

    // Small delay between batches to avoid rate limiting
    if (i + batchSize < notifications.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  logger.success(`✅ Push notifications sent: ${successful} successful, ${failed} failed`);

  return {
    total: notifications.length,
    successful,
    failed,
    results,
  };
}

/**
 * Send push to users based on target audience
 */
export async function sendPushToAudience(
  audience: 'all' | 'super_admins' | 'company_admins' | 'users',
  title: string,
  message: string,
  data?: Record<string, any>
): Promise<BulkPushResult> {
  try {
    logger.info(`📤 Sending push to audience: ${audience}`);

    // Build query based on audience
    let query = supabase
      .from('profiles')
      .select('id, push_token, push_enabled')
      .eq('push_enabled', true)
      .not('push_token', 'is', null);

    // Apply role filter
    if (audience === 'super_admins') {
      query = query.eq('role', 'super_admin');
    } else if (audience === 'company_admins') {
      query = query.eq('role', 'company_admin');
    } else if (audience === 'users') {
      query = query.eq('role', 'user');
    }

    const { data: users, error } = await query;

    if (error) throw error;
    if (!users || users.length === 0) {
      logger.warn(`⚠️ No users found for audience: ${audience}`);
      return { total: 0, successful: 0, failed: 0, results: [] };
    }

    logger.info(`📤 Found ${users.length} users with push enabled`);

    // Prepare notifications for all users
    const notifications: PushNotificationData[] = users.map(user => ({
      userId: user.id,
      title,
      message,
      data,
      priority: 'high',
    }));

    // Send push notifications
    return await sendPushToMultipleUsers(notifications);
  } catch (error: any) {
    logger.error(`❌ Error sending push to audience ${audience}:`, error);
    throw error;
  }
}

// =====================================================
// RECEIPT HANDLING
// =====================================================

/**
 * Check receipts for sent push notifications
 * Should be called periodically (e.g., 15 minutes after sending)
 */
export async function checkPushReceipts(ticketIds: string[]): Promise<void> {
  try {
    logger.info(`🔍 Checking receipts for ${ticketIds.length} tickets`);

    const receiptIdChunks = expo.chunkPushNotificationReceiptIds(ticketIds);

    for (const chunk of receiptIdChunks) {
      const receipts = await expo.getPushNotificationReceiptsAsync(chunk);

      for (const receiptId in receipts) {
        const receipt = receipts[receiptId];

        if (receipt.status === 'ok') {
          // Update log as delivered
          await supabase
            .from('push_notifications_log')
            .update({
              status: 'delivered',
              delivered_at: new Date().toISOString(),
              receipt_id: receiptId,
            })
            .eq('ticket_id', receiptId);

          logger.success(`✅ Push delivered: ${receiptId}`);
        } else if (receipt.status === 'error') {
          // Update log with error
          await supabase
            .from('push_notifications_log')
            .update({
              status: 'error',
              error_message: receipt.message,
              receipt_id: receiptId,
            })
            .eq('ticket_id', receiptId);

          logger.error(`❌ Push error: ${receipt.message}`, { receiptId });

          // Handle specific errors
          if (receipt.details?.error === 'DeviceNotRegistered') {
            // Token is invalid, should be removed
            logger.warn(`⚠️ Device not registered, should remove token for receipt ${receiptId}`);
          }
        }
      }
    }
  } catch (error: any) {
    logger.error(`❌ Error checking push receipts:`, error);
  }
}

// =====================================================
// LOGGING
// =====================================================

/**
 * Log push notification attempt
 */
async function logPushNotification(log: {
  userId: string;
  pushToken: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'error';
  ticketId?: string;
  errorMessage?: string;
  notificationId?: string;
}): Promise<void> {
  try {
    await supabase.from('push_notifications_log').insert({
      user_id: log.userId,
      push_token: log.pushToken,
      status: log.status,
      ticket_id: log.ticketId,
      error_message: log.errorMessage,
      notification_id: log.notificationId,
      sent_at: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('❌ Failed to log push notification:', error);
  }
}

// =====================================================
// EXPORT DEFAULT
// =====================================================

export default {
  registerPushToken,
  unregisterPushToken,
  getPushToken,
  sendPushToUser,
  sendPushToMultipleUsers,
  sendPushToAudience,
  checkPushReceipts,
};
