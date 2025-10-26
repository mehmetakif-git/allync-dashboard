import { supabase } from '../supabase';
import { maintenanceEmailService } from '../email/maintenanceEmailService';

// =====================================================
// INTERFACES
// =====================================================

export interface MaintenanceWindow {
  id: string;
  scheduled_by: string;
  start_time: string;
  end_time: string;
  message_tr: string;
  message_en: string;
  affected_services: string[] | null;
  is_active: boolean;
  metadata: any;
  created_at: string;
  updated_at: string;
  scheduled_by_profile?: {
    full_name: string;
    email: string;
  };
}

export interface CreateMaintenanceWindow {
  scheduled_by: string;
  start_time: string;
  end_time: string;
  message_tr: string;
  message_en: string;
  affected_services?: string[];
  metadata?: any;
  send_notifications?: boolean; // Option to send email notifications
}

export interface UpdateMaintenanceWindow {
  start_time?: string;
  end_time?: string;
  message_tr?: string;
  message_en?: string;
  affected_services?: string[];
  is_active?: boolean;
  metadata?: any;
}

// =====================================================
// GET ALL MAINTENANCE WINDOWS
// =====================================================

export async function getAllMaintenanceWindows() {
  console.log('📅 [getAllMaintenanceWindows] Fetching all maintenance windows');

  try {
    const { data, error } = await supabase
      .from('maintenance_windows')
      .select(`
        *,
        scheduled_by_profile:profiles!scheduled_by(full_name, email)
      `)
      .order('start_time', { ascending: false });

    if (error) throw error;

    console.log(`✅ [getAllMaintenanceWindows] Found ${data?.length || 0} windows`);
    return data as MaintenanceWindow[];

  } catch (error) {
    console.error('❌ [getAllMaintenanceWindows] Error:', error);
    throw error;
  }
}

// =====================================================
// GET ACTIVE MAINTENANCE WINDOW
// =====================================================

export async function getActiveMaintenanceWindow() {
  console.log('📅 [getActiveMaintenanceWindow] Fetching active maintenance');

  try {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('maintenance_windows')
      .select(`
        *,
        scheduled_by_profile:profiles!scheduled_by(full_name, email)
      `)
      .eq('is_active', true)
      .lte('start_time', now)
      .gte('end_time', now)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    console.log('✅ [getActiveMaintenanceWindow] Active window:', data ? 'Found' : 'None');
    return data as MaintenanceWindow | null;

  } catch (error) {
    console.error('❌ [getActiveMaintenanceWindow] Error:', error);
    return null;
  }
}

// =====================================================
// GET UPCOMING MAINTENANCE WINDOWS
// =====================================================

export async function getUpcomingMaintenanceWindows() {
  console.log('📅 [getUpcomingMaintenanceWindows] Fetching upcoming maintenance');

  try {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('maintenance_windows')
      .select(`
        *,
        scheduled_by_profile:profiles!scheduled_by(full_name, email)
      `)
      .eq('is_active', true)
      .gt('start_time', now)
      .order('start_time', { ascending: true })
      .limit(10);

    if (error) throw error;

    console.log(`✅ [getUpcomingMaintenanceWindows] Found ${data?.length || 0} upcoming`);
    return data as MaintenanceWindow[];

  } catch (error) {
    console.error('❌ [getUpcomingMaintenanceWindows] Error:', error);
    throw error;
  }
}

// =====================================================
// GET MAINTENANCE HISTORY
// =====================================================

export async function getMaintenanceHistory(limit: number = 20) {
  console.log('📅 [getMaintenanceHistory] Fetching maintenance history');

  try {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('maintenance_windows')
      .select(`
        *,
        scheduled_by_profile:profiles!scheduled_by(full_name, email)
      `)
      .lt('end_time', now)
      .order('end_time', { ascending: false })
      .limit(limit);

    if (error) throw error;

    console.log(`✅ [getMaintenanceHistory] Found ${data?.length || 0} past windows`);
    return data as MaintenanceWindow[];

  } catch (error) {
    console.error('❌ [getMaintenanceHistory] Error:', error);
    throw error;
  }
}

// =====================================================
// CREATE MAINTENANCE WINDOW (WITH AUTO EMAIL)
// =====================================================

export async function createMaintenanceWindow(window: CreateMaintenanceWindow) {
  console.log('➕ [createMaintenanceWindow] Creating maintenance window');

  try {
    // Create maintenance window
    const { data, error } = await supabase
      .from('maintenance_windows')
      .insert({
        scheduled_by: window.scheduled_by,
        start_time: window.start_time,
        end_time: window.end_time,
        message_tr: window.message_tr,
        message_en: window.message_en,
        affected_services: window.affected_services || null,
        is_active: true,
        metadata: window.metadata || {},
      })
      .select(`
        *,
        scheduled_by_profile:profiles!scheduled_by(full_name, email)
      `)
      .single();

    if (error) throw error;

    console.log('✅ [createMaintenanceWindow] Created successfully:', data.id);

    // Send email notifications if requested (default: true)
    if (window.send_notifications !== false) {
      console.log('📧 [createMaintenanceWindow] Sending email notifications...');
      
      try {
        await maintenanceEmailService.sendNotification(data.id);
        console.log('✅ [createMaintenanceWindow] Email notifications sent');
      } catch (emailError: any) {
        console.error('⚠️ [createMaintenanceWindow] Failed to send emails:', emailError);
        // Don't throw error, maintenance was created successfully
      }
    }

    return data as MaintenanceWindow;

  } catch (error) {
    console.error('❌ [createMaintenanceWindow] Error:', error);
    throw error;
  }
}

// =====================================================
// UPDATE MAINTENANCE WINDOW
// =====================================================

export async function updateMaintenanceWindow(
  id: string,
  updates: UpdateMaintenanceWindow
) {
  console.log(`📝 [updateMaintenanceWindow] Updating window ${id}`);

  try {
    const { data, error } = await supabase
      .from('maintenance_windows')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(`
        *,
        scheduled_by_profile:profiles!scheduled_by(full_name, email)
      `)
      .single();

    if (error) throw error;

    console.log('✅ [updateMaintenanceWindow] Updated successfully');
    return data as MaintenanceWindow;

  } catch (error) {
    console.error('❌ [updateMaintenanceWindow] Error:', error);
    throw error;
  }
}

// =====================================================
// DELETE MAINTENANCE WINDOW
// =====================================================

export async function deleteMaintenanceWindow(id: string) {
  console.log(`🗑️ [deleteMaintenanceWindow] Deleting window ${id}`);

  try {
    const { error } = await supabase
      .from('maintenance_windows')
      .delete()
      .eq('id', id);

    if (error) throw error;

    console.log('✅ [deleteMaintenanceWindow] Deleted successfully');
    return true;

  } catch (error) {
    console.error('❌ [deleteMaintenanceWindow] Error:', error);
    throw error;
  }
}

// =====================================================
// CANCEL MAINTENANCE WINDOW
// =====================================================

export async function cancelMaintenanceWindow(id: string) {
  console.log(`❌ [cancelMaintenanceWindow] Canceling window ${id}`);

  try {
    const { data, error } = await supabase
      .from('maintenance_windows')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    console.log('✅ [cancelMaintenanceWindow] Canceled successfully');
    return data as MaintenanceWindow;

  } catch (error) {
    console.error('❌ [cancelMaintenanceWindow] Error:', error);
    throw error;
  }
}

// =====================================================
// CHECK IF IN MAINTENANCE
// =====================================================

export async function isInMaintenance() {
  console.log('🔍 [isInMaintenance] Checking maintenance status');

  try {
    const activeWindow = await getActiveMaintenanceWindow();
    const result = activeWindow !== null;

    console.log(`✅ [isInMaintenance] Status: ${result ? 'IN MAINTENANCE' : 'NORMAL'}`);
    return result;

  } catch (error) {
    console.error('❌ [isInMaintenance] Error:', error);
    return false;
  }
}

// =====================================================
// GET MAINTENANCE STATUS
// =====================================================

export async function getMaintenanceStatus() {
  console.log('📊 [getMaintenanceStatus] Getting full status');

  try {
    const [active, upcoming] = await Promise.all([
      getActiveMaintenanceWindow(),
      getUpcomingMaintenanceWindows(),
    ]);

    const status = {
      is_in_maintenance: active !== null,
      active_window: active,
      upcoming_windows: upcoming,
      next_maintenance: upcoming.length > 0 ? upcoming[0] : null,
    };

    console.log('✅ [getMaintenanceStatus] Status retrieved');
    return status;

  } catch (error) {
    console.error('❌ [getMaintenanceStatus] Error:', error);
    throw error;
  }
}

// =====================================================
// RESEND NOTIFICATIONS (Manual trigger)
// =====================================================

export async function resendMaintenanceNotifications(id: string) {
  console.log(`📧 [resendMaintenanceNotifications] Resending for window ${id}`);

  try {
    const result = await maintenanceEmailService.sendNotification(id);
    console.log('✅ [resendMaintenanceNotifications] Notifications sent');
    return result;
  } catch (error) {
    console.error('❌ [resendMaintenanceNotifications] Error:', error);
    throw error;
  }
}

// =====================================================
// EXPORT ALL
// =====================================================

export default {
  getAllMaintenanceWindows,
  getActiveMaintenanceWindow,
  getUpcomingMaintenanceWindows,
  getMaintenanceHistory,
  createMaintenanceWindow,
  updateMaintenanceWindow,
  deleteMaintenanceWindow,
  cancelMaintenanceWindow,
  isInMaintenance,
  getMaintenanceStatus,
  resendMaintenanceNotifications,
};