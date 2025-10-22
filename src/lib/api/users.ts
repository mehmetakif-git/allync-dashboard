import { supabase } from '../supabase';

export interface User {
  id: string;
  company_id: string | null; // null = super_admin
  email: string;
  role: 'super_admin' | 'company_admin' | 'user';
  full_name: string;
  avatar_url?: string | null;
  language: string;
  status: 'active' | 'suspended' | 'blocked'; // YENİ!
  last_login?: string | null; // YENİ!
  created_at: string;
  updated_at: string;
}

export interface UserInvite {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  company_id: string;
  role: 'user' | 'company_admin';
  status: 'sent' | 'accepted' | 'expired';
  invited_by: string | null;
  invite_token: string;
  temporary_password?: string | null;
  created_at: string;
  expires_at: string;
  accepted_at?: string | null;
}

// =====================================================
// USER FUNCTIONS (EXISTING - Keep them)
// =====================================================

// Get all users for a company
export async function getCompanyUsers(companyId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching company users:', error);
    throw error;
  }
  
  return data as User[];
}

// Get user by ID
export async function getUserById(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
  
  return data as User;
}

// Create user (Note: This requires Supabase Auth admin access)
export async function createUser(userData: {
  email: string;
  password: string;
  full_name: string;
  company_id: string;
  role: 'company_admin' | 'user';
  language?: string;
}) {
  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: userData.email,
    password: userData.password,
    email_confirm: true,
  });

  if (authError) {
    console.error('Error creating auth user:', authError);
    throw authError;
  }

  // Create profile
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .insert([{
      id: authData.user.id,
      company_id: userData.company_id,
      email: userData.email,
      full_name: userData.full_name,
      role: userData.role,
      language: userData.language || 'en',
      status: 'active',
    }])
    .select()
    .single();

  if (profileError) {
    console.error('Error creating profile:', profileError);
    throw profileError;
  }

  return profileData as User;
}

// Update user
export async function updateUser(userId: string, updates: Partial<User>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user:', error);
    throw error;
  }
  
  return data as User;
}

// Delete user
export async function deleteUser(userId: string) {
  // Delete profile
  const { error: profileError } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId);

  if (profileError) {
    console.error('Error deleting profile:', profileError);
    throw profileError;
  }

  // Delete auth user (requires admin access)
  const { error: authError } = await supabase.auth.admin.deleteUser(userId);

  if (authError) {
    console.error('Error deleting auth user:', authError);
    throw authError;
  }
}

// =====================================================
// NEW FUNCTIONS - For UsersManagement
// =====================================================

// Get ALL users (for Super Admin - includes company info)
export async function getAllUsers() {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      company:companies(
        id,
        name
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all users:', error);
    throw error;
  }
  
  return data;
}

// Update user status (suspend/block/activate)
export async function updateUserStatus(
  userId: string, 
  status: 'active' | 'suspended' | 'blocked'
) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ status })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user status:', error);
    throw error;
  }
  
  return data as User;
}

// Update last login time
export async function updateLastLogin(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ last_login: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating last login:', error);
    throw error;
  }
  
  return data as User;
}

// =====================================================
// INVITE FUNCTIONS - For UserInvite
// =====================================================

// Get all invites (optionally filter by company)
export async function getInvites(companyId?: string) {
  let query = supabase
    .from('user_invites')
    .select(`
      *,
      company:companies(
        id,
        name
      ),
      inviter:profiles!invited_by(
        id,
        full_name,
        email
      )
    `)
    .order('created_at', { ascending: false });

  if (companyId) {
    query = query.eq('company_id', companyId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching invites:', error);
    throw error;
  }
  
  return data as any[];
}

// Create invite
export async function createInvite(inviteData: {
  first_name: string;
  last_name: string;
  email: string;
  company_id: string;
  role: 'user' | 'company_admin';
  temporary_password?: string;
  invited_by: string;
}) {
  const { data, error } = await supabase
    .from('user_invites')
    .insert([{
      first_name: inviteData.first_name,
      last_name: inviteData.last_name,
      email: inviteData.email,
      company_id: inviteData.company_id,
      role: inviteData.role,
      temporary_password: inviteData.temporary_password,
      invited_by: inviteData.invited_by,
      status: 'sent',
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating invite:', error);
    throw error;
  }
  
  return data as UserInvite;
}

// Accept invite (when user registers with token)
export async function acceptInvite(inviteToken: string, userId: string) {
  const { data, error } = await supabase
    .from('user_invites')
    .update({ 
      status: 'accepted',
      accepted_at: new Date().toISOString()
    })
    .eq('invite_token', inviteToken)
    .select()
    .single();

  if (error) {
    console.error('Error accepting invite:', error);
    throw error;
  }
  
  return data as UserInvite;
}

// Expire invite manually
export async function expireInvite(inviteId: string) {
  const { data, error } = await supabase
    .from('user_invites')
    .update({ status: 'expired' })
    .eq('id', inviteId)
    .select()
    .single();

  if (error) {
    console.error('Error expiring invite:', error);
    throw error;
  }
  
  return data as UserInvite;
}

// Delete invite
export async function deleteInvite(inviteId: string) {
  const { error } = await supabase
    .from('user_invites')
    .delete()
    .eq('id', inviteId);

  if (error) {
    console.error('Error deleting invite:', error);
    throw error;
  }
}

// Get invite by token (for registration page)
export async function getInviteByToken(token: string) {
  const { data, error } = await supabase
    .from('user_invites')
    .select(`
      *,
      company:companies(
        id,
        name
      )
    `)
    .eq('invite_token', token)
    .eq('status', 'sent')
    .single();

  if (error) {
    console.error('Error fetching invite:', error);
    throw error;
  }
  
  return data;
}