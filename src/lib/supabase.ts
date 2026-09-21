import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { UserProfile } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== 'https://your-project.supabase.co' &&
    supabaseAnonKey !== 'your-anon-key'
  );
};

// Create Supabase client if credentials exist, otherwise fallback client
export const supabase: SupabaseClient = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

// Helper to convert Supabase User to APSIWA UserProfile
export const mapSupabaseUserToProfile = (user: User): UserProfile => {
  const meta = user.user_metadata || {};
  const name =
    meta.full_name ||
    meta.name ||
    user.email?.split('@')[0].replace(/[._-]/g, ' ') ||
    'APSIWA Member';
  const phoneNumber = meta.phone || meta.phoneNumber || user.phone || undefined;
  
  const joinedYear = user.created_at
    ? new Date(user.created_at).toLocaleDateString('en-IN', {
        month: 'short',
        year: 'numeric',
      })
    : '2026';

  return {
    id: user.id,
    name,
    email: user.email || '',
    phoneNumber,
    membershipId: meta.membership_id || `APSIWA-${user.id.slice(0, 6).toUpperCase()}`,
    joinedDate: joinedYear,
  };
};

/**
 * Sign in with email and password
 */
export async function signInWithEmail(email: string, password: string): Promise<{
  user: UserProfile | null;
  error: string | null;
}> {
  if (!isSupabaseConfigured()) {
    // Fallback local storage auth for development before Supabase keys are provided
    return localFallbackLogin(email, password);
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      return { user: null, error: error.message };
    }

    if (!data.user) {
      return { user: null, error: 'User data not found after login.' };
    }

    const profile = mapSupabaseUserToProfile(data.user);
    return { user: profile, error: null };
  } catch (err: any) {
    return { user: null, error: err.message || 'An unexpected error occurred during login.' };
  }
}

/**
 * Sign up with email, password, and metadata
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  meta: { name: string; phoneNumber: string }
): Promise<{
  user: UserProfile | null;
  error: string | null;
  needsEmailConfirmation?: boolean;
}> {
  if (!isSupabaseConfigured()) {
    return localFallbackSignup(email, password, meta);
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          name: meta.name.trim(),
          full_name: meta.name.trim(),
          phoneNumber: meta.phoneNumber.trim(),
          phone: meta.phoneNumber.trim(),
          membership_id: `APSIWA-MEM-${Math.floor(10000 + Math.random() * 90000)}`,
        },
      },
    });

    if (error) {
      return { user: null, error: error.message };
    }

    if (!data.user) {
      return { user: null, error: 'Registration failed. Please try again.' };
    }

    let profile = mapSupabaseUserToProfile(data.user);

    // If session is already created (email confirmation is OFF in Supabase)
    if (data.session) {
      return { user: profile, error: null, needsEmailConfirmation: false };
    }

    // If no session yet, attempt instant sign in with credentials
    try {
      const signInResult = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInResult.data?.user) {
        profile = mapSupabaseUserToProfile(signInResult.data.user);
        return { user: profile, error: null, needsEmailConfirmation: false };
      }
    } catch {}

    return { user: profile, error: null, needsEmailConfirmation: false };
  } catch (err: any) {
    return { user: null, error: err.message || 'An unexpected error occurred during registration.' };
  }
}

/**
 * Sign out
 */
export async function signOut(): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { error: null };
  }

  try {
    const { error } = await supabase.auth.signOut();
    return { error: error ? error.message : null };
  } catch (err: any) {
    return { error: err.message || 'Error signing out' };
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { error: null };
  }

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/#reset-password`,
    });
    return { error: error ? error.message : null };
  } catch (err: any) {
    return { error: err.message || 'Error sending password reset email' };
  }
}

// Local development fallback helpers
function localFallbackLogin(email: string, _password: string) {
  const storedUsersRaw = localStorage.getItem('apsiwa_registered_users');
  const registeredUsers: any[] = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];
  const existingUser = registeredUsers.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase()
  );

  const loggedInUser: UserProfile = existingUser
    ? {
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
        phoneNumber: existingUser.phoneNumber,
        membershipId: existingUser.membershipId || 'APSIWA-MEM-2026',
        joinedDate: existingUser.joinedDate || '2026',
      }
    : {
        id: `usr_${Date.now()}`,
        name: email.split('@')[0].replace(/[._-]/g, ' '),
        email: email.trim(),
        membershipId: 'APSIWA-MEM-2026',
        joinedDate: new Date().toLocaleDateString('en-IN', {
          month: 'short',
          year: 'numeric',
        }),
      };

  return { user: loggedInUser, error: null };
}

function localFallbackSignup(email: string, _password: string, meta: { name: string; phoneNumber: string }) {
  const newUser: UserProfile = {
    id: `usr_${Date.now()}`,
    name: meta.name.trim(),
    email: email.trim(),
    phoneNumber: meta.phoneNumber.trim(),
    membershipId: `APSIWA-MEM-${Math.floor(10000 + Math.random() * 90000)}`,
    joinedDate: new Date().toLocaleDateString('en-IN', {
      month: 'short',
      year: 'numeric',
    }),
  };

  const storedUsersRaw = localStorage.getItem('apsiwa_registered_users');
  const registeredUsers: any[] = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];
  registeredUsers.push(newUser);
  localStorage.setItem('apsiwa_registered_users', JSON.stringify(registeredUsers));

  return { user: newUser, error: null, needsEmailConfirmation: false };
}
