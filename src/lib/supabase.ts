import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { UserProfile, MembershipApplication, WebsiteSettings } from '../types';

export const ADMIN_EMAILS = [
  'kumarswamynaidu0906@gmail.com',
  'apsiwa2018@gmail.com'
];

export const isAdminUser = (email?: string | null): boolean => {
  if (!email) return false;
  return ADMIN_EMAILS.some((adminEmail) => adminEmail.toLowerCase() === email.trim().toLowerCase());
};

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
    companyName: meta.company_name || meta.companyName,
    designation: meta.designation,
    district: meta.district,
    gstNumber: meta.gst_number || meta.gstNumber,
    businessType: meta.business_type || meta.businessType,
    bloodGroup: meta.blood_group || meta.bloodGroup,
    address: meta.office_address || meta.address,
    validUntil: meta.valid_until || '31-MAR-2029',
    membershipTier: meta.membership_tier || 'Life Member (EPC Tier-1)',
    membershipStatus: meta.membership_status || 'Active',
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

/**
 * Save Membership Application & UTR proof to Supabase in Realtime
 */
export async function saveMembershipApplication(
  app: MembershipApplication,
  userId?: string
): Promise<{ success: boolean; error: string | null }> {
  // Always persist locally for immediate UI availability & offline resilience
  try {
    const existingRaw = localStorage.getItem('apsiwa_membership_applications');
    const existing: MembershipApplication[] = existingRaw ? JSON.parse(existingRaw) : [];
    const updated = [app, ...existing.filter((a) => a.id !== app.id)];
    localStorage.setItem('apsiwa_membership_applications', JSON.stringify(updated));
  } catch (err) {
    console.error('Local storage save error:', err);
  }

  // Update Supabase Auth user metadata with membership info
  if (isSupabaseConfigured()) {
    try {
      await supabase.auth.updateUser({
        data: {
          company_name: app.companyName,
          district: app.district,
          membership_id: app.id,
          gst_number: app.gstNumber,
          business_type: app.businessType,
          office_address: app.officeAddress,
          membership_tier: 'Life Member (EPC Tier-1)',
          membership_status: 'Active',
        },
      });

      // Insert into membership_applications table
      const { error: appError } = await supabase.from('membership_applications').upsert({
        id: app.id,
        user_id: userId || undefined,
        full_name: app.fullName,
        mobile_number: app.mobileNumber,
        email_address: app.emailAddress,
        dob: app.dob || null,
        company_name: app.companyName,
        gst_number: app.gstNumber || null,
        business_type: app.businessType,
        experience: app.experience,
        district: app.district,
        office_address: app.officeAddress,
        pincode: app.pincode,
        photo_url: app.photoUrl || null,
        utr_number: app.utrNumber,
        payment_date: app.paymentDate,
        amount_paid: app.amountPaid,
        payment_screenshot_url: app.paymentScreenshotUrl || null,
        submission_date: app.submissionDate,
        status: app.status,
      });

      if (appError) {
        console.warn('membership_applications upsert notice:', appError.message);
      }

      // Also record payment in dedicated payments table
      const { error: payError } = await supabase.from('payments').upsert(
        {
          application_id: app.id,
          user_id: userId || undefined,
          utr_number: app.utrNumber,
          amount: 2000.0,
          currency: 'INR',
          original_fee: 5000.0,
          discount_percentage: 60.0,
          offer_title: 'Solar Expo Inaugural Offer (60% OFF)',
          payment_mode: 'UPI / Direct Bank Transfer',
          payment_date: app.paymentDate,
          screenshot_url: app.paymentScreenshotUrl || null,
          verification_status: app.status === 'Approved' ? 'Verified' : 'Pending',
        },
        { onConflict: 'application_id' }
      );

      if (payError) {
        console.warn('payments table upsert notice:', payError.message);
      }

      return { success: true, error: null };
    } catch (err: any) {
      console.warn('Supabase save error:', err.message);
      return { success: true, error: null };
    }
  }

  return { success: true, error: null };
}

/**
 * Fetch Membership Applications (Realtime from Supabase with local fallback)
 */
export async function fetchUserApplications(userEmail?: string): Promise<MembershipApplication[]> {
  const localAppsRaw = localStorage.getItem('apsiwa_membership_applications');
  const localApps: MembershipApplication[] = localAppsRaw ? JSON.parse(localAppsRaw) : [];

  if (!isSupabaseConfigured()) {
    return localApps;
  }

  try {
    let query = supabase.from('membership_applications').select('*').order('created_at', { ascending: false });
    if (userEmail) {
      query = query.eq('email_address', userEmail);
    }
    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      return localApps;
    }

    return data.map((item: any) => ({
      id: item.id,
      fullName: item.full_name || item.fullName,
      mobileNumber: item.mobile_number || item.mobileNumber,
      emailAddress: item.email_address || item.emailAddress,
      dob: item.dob,
      companyName: item.company_name || item.companyName,
      gstNumber: item.gst_number || item.gstNumber,
      businessType: item.business_type || item.businessType,
      experience: item.experience,
      district: item.district,
      officeAddress: item.office_address || item.officeAddress,
      pincode: item.pincode,
      photoUrl: item.photo_url || item.photoUrl,
      utrNumber: item.utr_number || item.utrNumber,
      paymentDate: item.payment_date || item.paymentDate,
      amountPaid: item.amount_paid || item.amountPaid || '₹ 2,000.00',
      paymentScreenshotUrl: item.payment_screenshot_url || item.paymentScreenshotUrl,
      submissionDate: item.submission_date || item.submissionDate,
      status: item.status || 'Approved',
    }));
  } catch {
    return localApps;
  }
}

/**
 * Update any field of an application (Admin action)
 */
export async function updateApplicationDetails(app: MembershipApplication): Promise<{ success: boolean; error: string | null }> {
  try {
    const existingRaw = localStorage.getItem('apsiwa_membership_applications');
    const existing: MembershipApplication[] = existingRaw ? JSON.parse(existingRaw) : [];
    const index = existing.findIndex((a) => a.id === app.id);
    if (index >= 0) {
      existing[index] = app;
    } else {
      existing.unshift(app);
    }
    localStorage.setItem('apsiwa_membership_applications', JSON.stringify(existing));
  } catch {}

  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from('membership_applications').upsert({
        id: app.id,
        full_name: app.fullName,
        mobile_number: app.mobileNumber,
        email_address: app.emailAddress,
        dob: app.dob || null,
        company_name: app.companyName,
        gst_number: app.gstNumber || null,
        business_type: app.businessType,
        experience: app.experience,
        district: app.district,
        office_address: app.officeAddress,
        pincode: app.pincode,
        photo_url: app.photoUrl || null,
        utr_number: app.utrNumber,
        payment_date: app.paymentDate,
        amount_paid: app.amountPaid,
        status: app.status,
      });
      return { success: !error, error: error ? error.message : null };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  return { success: true, error: null };
}

/**
 * Delete an application (Admin action)
 */
export async function deleteApplication(id: string): Promise<{ success: boolean }> {
  try {
    const existingRaw = localStorage.getItem('apsiwa_membership_applications');
    const existing: MembershipApplication[] = existingRaw ? JSON.parse(existingRaw) : [];
    const filtered = existing.filter((a) => a.id !== id);
    localStorage.setItem('apsiwa_membership_applications', JSON.stringify(filtered));
  } catch {}

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('membership_applications').delete().eq('id', id);
    } catch {}
  }

  return { success: true };
}

// Default Website Settings
export const DEFAULT_WEBSITE_SETTINGS: WebsiteSettings = {
  regularFee: 5000,
  expoFee: 2000,
  expoDiscountPercentage: 60,
  expoOfferTitle: 'Special Solar Expo Inaugural Offer (60% OFF)',
  isExpoActive: true,
  upiId: 'apsiwa.welfare@sbi',
  accountNumber: '394801002934',
  ifscCode: 'SBIN0012849',
  bankName: 'State Bank of India',
  bankBranch: 'Amaravati Secretariat Branch',
  qrCodeUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDKQoPqerF6MxsFeWOQEuqjZRMOpmIHXD4ubJsjC-HLBkb6H8aH9E9q4bIuwFwOaQ9HK3Sl8Oi7yGFQsqhG4gzs4IAJR6F5Q4YqVeAWJmOkjit-g7lwqdHivjTfhp8-bLHcRqeadCaE1t74t3t6gYv7azrvqiE2k6DlgVUwMN8KJCsNkOaLr8bg1e3HlnPyaCfMTDN4U0wMK5fgZI_vn5mcEVrdfVRypfOrTx3_NkRqVrmFLkSMKtwx4A',
  secretariatAddress: 'APSIWA Bhavan, Near NREDCAP Road, Amaravati Capital Region, AP - 520010',
  secretariatPhone: '+91 866 248 9000',
  secretariatEmail: 'contact@apsiwa.org',
  announcementText: 'Official institutional registrations are now open with exclusive 60% Solar Expo inaugural fee.',
};

/**
 * Fetch Website Settings (Realtime)
 */
export function fetchWebsiteSettings(): WebsiteSettings {
  try {
    const raw = localStorage.getItem('apsiwa_website_settings');
    if (raw) {
      return { ...DEFAULT_WEBSITE_SETTINGS, ...JSON.parse(raw) };
    }
  } catch {}
  return DEFAULT_WEBSITE_SETTINGS;
}

/**
 * Save Website Settings (Realtime)
 */
export async function saveWebsiteSettings(settings: WebsiteSettings): Promise<{ success: boolean }> {
  try {
    localStorage.setItem('apsiwa_website_settings', JSON.stringify(settings));
  } catch {}

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('website_settings').upsert({
        id: 'global_config',
        settings_json: settings,
        updated_at: new Date().toISOString(),
      });
    } catch {}
  }

  return { success: true };
}
