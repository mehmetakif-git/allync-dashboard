import { supabase } from './supabase';

export interface AuthUser {
  id: string;
  email: string;
  role: 'super_admin' | 'company_admin' | 'user';
  full_name: string;
  company_id: string | null;
  avatar_url?: string | null;
  language: string;
}

// Login with email/password
export async function signIn(email: string, password: string) {
  try {
    console.log('🔐 Signing in:', email);
    
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) throw authError;

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    console.log('🔍 Profile data:', profile);
    console.log('🔍 Profile error:', profileError);
      if (!profile) throw new Error('Profile not found'); 
      if (profileError) throw profileError;

    console.log('✅ Login successful:', profile);
    return profile as AuthUser;
  } catch (error: any) {
    console.error('❌ Login failed:', error.message);
    throw error;
  }
}

// Sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// Get current session
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    return profile as AuthUser;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// Check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
}

// Listen to auth state changes
export function onAuthStateChange(callback: (user: AuthUser | null) => void) {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('🔔 Auth state changed:', event);
    
    if (session?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      callback(profile as AuthUser);
    } else {
      callback(null);
    }
  });
}