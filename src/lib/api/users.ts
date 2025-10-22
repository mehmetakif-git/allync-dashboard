import { supabase } from '../supabase';

export interface User {
  id: string;
  company_id: string;
  email: string;
  role: 'company_admin' | 'user';
  full_name: string;
  avatar_url?: string | null;
  language: string;
  created_at: string;
  updated_at: string;
}

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