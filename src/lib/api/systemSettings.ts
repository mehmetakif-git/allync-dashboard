import { supabase } from '../supabase';

// =====================================================
// INTERFACES
// =====================================================

export interface SystemSetting {
  id: string;
  category: string;
  key: string;
  value: any;
  description: string | null;
  is_encrypted: boolean;
  last_updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface SettingUpdate {
  key: string;
  value: any;
}

export interface CategorySettings {
  [key: string]: any;
}

// =====================================================
// GET SETTINGS BY CATEGORY
// =====================================================

export async function getSettingsByCategory(category: string) {
  console.log(`📋 [getSettingsByCategory] Fetching ${category} settings`);

  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .eq('category', category)
      .order('key', { ascending: true });

    if (error) throw error;

    // Convert to key-value object
    const settings: CategorySettings = {};
    data?.forEach(setting => {
      settings[setting.key] = setting.value;
    });

    console.log(`✅ [getSettingsByCategory] Found ${Object.keys(settings).length} settings`);
    return settings;

  } catch (error) {
    console.error(`❌ [getSettingsByCategory] Error:`, error);
    throw error;
  }
}

// =====================================================
// GET ALL SETTINGS
// =====================================================

export async function getAllSettings() {
  console.log('📋 [getAllSettings] Fetching all settings');

  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .order('category, key', { ascending: true });

    if (error) throw error;

    // Group by category
    const settingsByCategory: { [category: string]: CategorySettings } = {};
    
    data?.forEach(setting => {
      if (!settingsByCategory[setting.category]) {
        settingsByCategory[setting.category] = {};
      }
      settingsByCategory[setting.category][setting.key] = setting.value;
    });

    console.log(`✅ [getAllSettings] Found ${Object.keys(settingsByCategory).length} categories`);
    return settingsByCategory;

  } catch (error) {
    console.error('❌ [getAllSettings] Error:', error);
    throw error;
  }
}

// =====================================================
// GET SINGLE SETTING
// =====================================================

export async function getSetting(category: string, key: string) {
  console.log(`📋 [getSetting] Fetching ${category}.${key}`);

  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('value')
      .eq('category', category)
      .eq('key', key)
      .single();

    if (error) throw error;

    console.log(`✅ [getSetting] Retrieved ${category}.${key}`);
    return data?.value;

  } catch (error) {
    console.error(`❌ [getSetting] Error:`, error);
    return null;
  }
}

// =====================================================
// UPDATE SETTING
// =====================================================

export async function updateSetting(
  category: string,
  key: string,
  value: any,
  userId?: string
) {
  console.log(`📝 [updateSetting] Updating ${category}.${key}`);

  try {
    const updateData: any = {
      value,
      updated_at: new Date().toISOString(),
    };

    if (userId) {
      updateData.last_updated_by = userId;
    }

    const { data, error } = await supabase
      .from('system_settings')
      .update(updateData)
      .eq('category', category)
      .eq('key', key)
      .select()
      .single();

    if (error) throw error;

    console.log(`✅ [updateSetting] Updated ${category}.${key}`);
    return data;

  } catch (error) {
    console.error(`❌ [updateSetting] Error:`, error);
    throw error;
  }
}

// =====================================================
// UPDATE MULTIPLE SETTINGS
// =====================================================

export async function updateSettings(
  category: string,
  settings: SettingUpdate[],
  userId?: string
) {
  console.log(`📝 [updateSettings] Updating ${settings.length} settings in ${category}`);

  try {
    const updates = settings.map(setting =>
      updateSetting(category, setting.key, setting.value, userId)
    );

    const results = await Promise.all(updates);

    console.log(`✅ [updateSettings] Updated ${results.length} settings successfully`);
    return results;

  } catch (error) {
    console.error('❌ [updateSettings] Error:', error);
    throw error;
  }
}

// =====================================================
// UPDATE CATEGORY SETTINGS (BULK)
// =====================================================

export async function updateCategorySettings(
  category: string,
  settingsObject: CategorySettings,
  userId?: string
) {
  console.log(`📝 [updateCategorySettings] Bulk update for ${category}`);

  try {
    const updates = Object.entries(settingsObject).map(([key, value]) =>
      updateSetting(category, key, value, userId)
    );

    const results = await Promise.all(updates);

    console.log(`✅ [updateCategorySettings] Updated ${results.length} settings`);
    return results;

  } catch (error) {
    console.error('❌ [updateCategorySettings] Error:', error);
    throw error;
  }
}

// =====================================================
// CREATE SETTING
// =====================================================

export async function createSetting(
  category: string,
  key: string,
  value: any,
  description?: string,
  isEncrypted: boolean = false,
  userId?: string
) {
  console.log(`➕ [createSetting] Creating ${category}.${key}`);

  try {
    const { data, error } = await supabase
      .from('system_settings')
      .insert({
        category,
        key,
        value,
        description,
        is_encrypted: isEncrypted,
        last_updated_by: userId,
      })
      .select()
      .single();

    if (error) throw error;

    console.log(`✅ [createSetting] Created ${category}.${key}`);
    return data;

  } catch (error) {
    console.error(`❌ [createSetting] Error:`, error);
    throw error;
  }
}

// =====================================================
// DELETE SETTING
// =====================================================

export async function deleteSetting(category: string, key: string) {
  console.log(`🗑️ [deleteSetting] Deleting ${category}.${key}`);

  try {
    const { error } = await supabase
      .from('system_settings')
      .delete()
      .eq('category', category)
      .eq('key', key);

    if (error) throw error;

    console.log(`✅ [deleteSetting] Deleted ${category}.${key}`);
    return true;

  } catch (error) {
    console.error(`❌ [deleteSetting] Error:`, error);
    throw error;
  }
}

// =====================================================
// RESET CATEGORY TO DEFAULTS
// =====================================================

export async function resetCategoryToDefaults(category: string) {
  console.log(`🔄 [resetCategoryToDefaults] Resetting ${category} to defaults`);

  try {
    // This would need default values defined
    // For now, just log the action
    console.log(`⚠️ [resetCategoryToDefaults] Not implemented yet`);
    throw new Error('Reset to defaults not implemented');

  } catch (error) {
    console.error('❌ [resetCategoryToDefaults] Error:', error);
    throw error;
  }
}

// =====================================================
// TEST DATABASE CONNECTION
// =====================================================

export async function testDatabaseConnection() {
  console.log('🔌 [testDatabaseConnection] Testing connection');

  try {
    const { error } = await supabase
      .from('system_settings')
      .select('count')
      .limit(1);

    if (error) throw error;

    console.log('✅ [testDatabaseConnection] Connection successful');
    return { success: true, message: 'Database connection successful' };

  } catch (error) {
    console.error('❌ [testDatabaseConnection] Connection failed:', error);
    return { success: false, message: 'Database connection failed' };
  }
}

// =====================================================
// EXPORT ALL
// =====================================================

export default {
  getSettingsByCategory,
  getAllSettings,
  getSetting,
  updateSetting,
  updateSettings,
  updateCategorySettings,
  createSetting,
  deleteSetting,
  resetCategoryToDefaults,
  testDatabaseConnection,
};