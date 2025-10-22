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

    if (profileError) throw profileError;

    console.log('✅ Login successful:', profile);
    return profile as AuthUser;  // ← RETURN USER!
  } catch (error: any) {
    console.error('❌ Login failed:', error.message);
    throw error;
  }
}