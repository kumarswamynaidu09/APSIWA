import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { UserProfile, MembershipApplication, WebsiteSettings, GalleryItem, AssociationEvent } from '../types';
import { GALLERY_ITEMS, DEFAULT_EVENTS } from '../data/mockData';

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

/**
 * Calculate membership validity date (Valid for exactly 1 year from payment day)
 * Output formatted as DD-MMM-YYYY (e.g. 22-SEP-2027)
 */
export function calculateValidityDate(paymentDateStr?: string): string {
  let date: Date;
  if (paymentDateStr) {
    const parsed = new Date(paymentDateStr);
    date = isNaN(parsed.getTime()) ? new Date() : parsed;
  } else {
    date = new Date();
  }

  const validUntil = new Date(date);
  validUntil.setFullYear(validUntil.getFullYear() + 1);

  const day = String(validUntil.getDate()).padStart(2, '0');
  const month = validUntil.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  const year = validUntil.getFullYear();

  return `${day}-${month}-${year}`;
}

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

  const validUntil = meta.valid_until || calculateValidityDate(meta.payment_date || user.created_at);

  return {
    id: user.id,
    name,
    email: user.email || '',
    phoneNumber,
    avatarUrl: meta.avatar_url || meta.avatarUrl || meta.photo_url || meta.photoUrl || undefined,
    dateOfBirth: meta.date_of_birth || meta.dateOfBirth || meta.dob || undefined,
    membershipId: meta.membership_id || `APSIWA-${user.id.slice(0, 6).toUpperCase()}`,
    joinedDate: joinedYear,
    companyName: meta.company_name || meta.companyName,
    designation: meta.designation,
    district: meta.district,
    gstNumber: meta.gst_number || meta.gstNumber,
    businessType: meta.business_type || meta.businessType,
    address: meta.office_address || meta.address,
    validUntil,
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
        name: email.trim().toLowerCase() === 'apsiwa2018@gmail.com' ? 'APSIWA Secretariat Admin' : email.split('@')[0].replace(/[._-]/g, ' '),
        email: email.trim(),
        membershipId: email.trim().toLowerCase() === 'apsiwa2018@gmail.com' ? 'APSIWA-ADM-001' : 'APSIWA-MEM-2026',
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

  if (isSupabaseConfigured()) {
    try {
      // Safe update user auth metadata only if an active session exists
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const calculatedValidUntil = app.validUntil || calculateValidityDate(app.paymentDate);
          await supabase.auth.updateUser({
            data: {
              company_name: app.companyName,
              district: app.district,
              membership_id: app.id,
              gst_number: app.gstNumber,
              business_type: app.businessType,
              office_address: app.officeAddress,
              avatar_url: app.photoUrl,
              photo_url: app.photoUrl,
              dob: app.dateOfBirth,
              valid_until: calculatedValidUntil,
              membership_tier: 'Life Member (EPC Tier-1)',
              membership_status: 'Active',
            },
          });
        }
      } catch (authErr) {
        console.warn('Auth user metadata update skipped (no active session):', authErr);
      }

      const validDob = (app.dateOfBirth && app.dateOfBirth.trim() !== '' && app.dateOfBirth !== 'N/A') ? app.dateOfBirth : null;

      // Insert into membership_applications table matching live database schema
      const { error: appError } = await supabase.from('membership_applications').upsert({
        id: app.id,
        user_id: userId || null,
        full_name: app.fullName,
        dob: validDob,
        mobile_number: app.mobileNumber,
        email_address: app.emailAddress,
        company_name: app.companyName,
        designation: app.designation || null,
        gst_number: app.gstNumber || null,
        business_type: app.businessType || 'Solar EPC Integrator',
        experience: app.experience || '1 - 3 Years',
        district: app.district,
        office_address: app.officeAddress,
        pincode: app.pincode,
        photo_url: app.photoUrl || null,
        utr_number: app.utrNumber,
        payment_date: app.paymentDate || new Date().toISOString().slice(0, 10),
        amount_paid: app.amountPaid || '₹ 2,000.00',
        payment_screenshot_url: app.paymentScreenshotUrl || null,
        submission_date: app.submissionDate || new Date().toLocaleDateString('en-IN', { month: 'short', day: '2-digit', year: 'numeric' }),
        status: app.status || 'Pending Verification',
      });

      if (appError) {
        console.error('membership_applications upsert error:', appError.message);
        return { success: false, error: appError.message };
      }

      return { success: true, error: null };
    } catch (err: any) {
      console.error('Supabase save error:', err);
      return { success: false, error: err?.message || 'Save failed' };
    }
  }

  return { success: true, error: null };
}

/**
 * Fetch Membership Applications (Realtime from Supabase with local cache sync)
 */
export async function fetchUserApplications(userEmail?: string): Promise<MembershipApplication[]> {
  const localAppsRaw = localStorage.getItem('apsiwa_membership_applications');
  const localApps: MembershipApplication[] = localAppsRaw ? JSON.parse(localAppsRaw) : [];

  if (!isSupabaseConfigured()) {
    return localApps;
  }

  try {
    let query = supabase.from('membership_applications').select('*').order('created_at', { ascending: false });
    
    // Only filter by email if a non-admin member email is provided
    if (userEmail && !isAdminUser(userEmail)) {
      query = query.eq('email_address', userEmail.trim());
    }

    const { data, error } = await query;
    if (error) {
      console.warn('Supabase fetch applications notice:', error.message);
      return localApps;
    }

    if (data) {
      const mapped: MembershipApplication[] = data.map((item: any) => ({
        id: item.id,
        fullName: item.full_name || item.fullName || 'Member',
        dateOfBirth: item.dob || item.date_of_birth || item.dateOfBirth || '',
        mobileNumber: item.mobile_number || item.mobileNumber || '',
        emailAddress: item.email_address || item.emailAddress || '',
        companyName: item.company_name || item.companyName || '',
        designation: item.designation || '',
        gstNumber: item.gst_number || item.gstNumber || undefined,
        businessType: item.business_type || item.businessType || 'Solar EPC Integrator',
        experience: item.experience || '1 - 3 Years',
        district: item.district || 'Andhra Pradesh',
        officeAddress: item.office_address || item.officeAddress || '',
        pincode: item.pincode || '',
        photoUrl: item.photo_url || item.photoUrl || '',
        utrNumber: item.utr_number || item.utrNumber || 'N/A',
        paymentDate: item.payment_date || item.paymentDate || new Date().toISOString(),
        amountPaid: item.amount_paid || item.amountPaid || '₹ 2,000.00',
        paymentScreenshotUrl: item.payment_screenshot_url || item.paymentScreenshotUrl || undefined,
        submissionDate: item.submission_date || item.submissionDate || new Date().toISOString().slice(0, 10),
        applicationType: (item.utr_number && (item.utr_number.startsWith('ONSPOT') || item.amount_paid?.includes('0.00'))) ? 'Existing Member' : 'New Member',
        status: item.status || 'Pending Verification',
        validUntil: item.valid_until || calculateValidityDate(item.payment_date || item.created_at),
      }));

      try {
        localStorage.setItem('apsiwa_membership_applications', JSON.stringify(mapped));
      } catch {}

      return mapped;
    }

    return [];
  } catch (err) {
    console.warn('fetchUserApplications catch error:', err);
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
      const validDob = (app.dateOfBirth && app.dateOfBirth.trim() !== '' && app.dateOfBirth !== 'N/A') ? app.dateOfBirth : null;

      const { error } = await supabase.from('membership_applications').upsert({
        id: app.id,
        full_name: app.fullName,
        dob: validDob,
        mobile_number: app.mobileNumber,
        email_address: app.emailAddress,
        company_name: app.companyName,
        designation: app.designation || null,
        gst_number: app.gstNumber || null,
        business_type: app.businessType || 'Solar EPC Integrator',
        experience: app.experience || '1 - 3 Years',
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
 * Toggle Active / Inactive Status for an existing member
 */
export async function toggleMemberActiveStatus(
  app: MembershipApplication,
  newStatus: 'Active' | 'Inactive' | 'Approved' | 'Pending Verification' | 'Rejected'
): Promise<{ success: boolean; error: string | null; updatedApp: MembershipApplication }> {
  const updatedApp: MembershipApplication = {
    ...app,
    status: newStatus
  };
  const res = await updateApplicationDetails(updatedApp);
  return { success: res.success, error: res.error, updatedApp };
}

/**
 * Delete an application (Admin action)
 */
export async function deleteApplication(id: string): Promise<{ success: boolean; error?: string | null }> {
  try {
    const existingRaw = localStorage.getItem('apsiwa_membership_applications');
    const existing: MembershipApplication[] = existingRaw ? JSON.parse(existingRaw) : [];
    const filtered = existing.filter((a) => a.id !== id);
    localStorage.setItem('apsiwa_membership_applications', JSON.stringify(filtered));
  } catch (e) {
    console.error('Error removing application from localStorage:', e);
  }

  if (isSupabaseConfigured()) {
    try {
      // 1. Delete associated payment ledger entry if present to satisfy foreign keys
      const { error: payErr } = await supabase.from('payments').delete().eq('application_id', id);
      if (payErr) {
        console.warn('Note deleting associated payment row:', payErr.message);
      }

      // 2. Delete membership application row
      const { error: appErr } = await supabase.from('membership_applications').delete().eq('id', id);
      if (appErr) {
        console.error('Supabase delete application error:', appErr.message);
        return { success: false, error: appErr.message };
      }
    } catch (err: any) {
      console.error('Supabase delete exception:', err);
      return { success: false, error: err?.message || 'Delete failed' };
    }
  }

  return { success: true, error: null };
}

// Default Website Settings
export const DEFAULT_WEBSITE_SETTINGS: WebsiteSettings = {
  regularFee: 5000,
  expoFee: 2000,
  expoDiscountPercentage: 60,
  expoOfferTitle: 'Special Solar Expo Inaugural Offer (60% OFF)',
  isExpoActive: true,
  upiId: 'andhrapradeshsolarintegratorswelfareassociation@idbi',
  accountNumber: '1018102000010052',
  ifscCode: 'IBKL0001018',
  bankName: 'IDBI BANK',
  bankBranch: 'Seethamadhara Branch',
  qrCodeUrl: '/payment-qr.png',
  secretariatAddress: 'Association Secretariat, Visakhapatnam, Andhra Pradesh, India',
  secretariatPhone: '+91 9866194904 / +91 9440316267',
  secretariatEmail: 'apsiwa2018@gmail.com',
  announcementText: 'Official institutional registrations are now open with exclusive 60% Solar Expo inaugural fee.',
  resendApiKey: '',
  resendFromEmail: 'APSIWA Secretariat <onboarding@resend.dev>',
  galleryItems: GALLERY_ITEMS,
  events: DEFAULT_EVENTS,
};

/**
 * Checks if an event is past its date or expiry time
 */
export function isEventExpired(event: AssociationEvent): boolean {
  try {
    const now = new Date();
    if (event.expiresAt) {
      return new Date(event.expiresAt).getTime() < now.getTime();
    }
    if (event.endDate) {
      const end = new Date(`${event.endDate}T23:59:59`);
      return end.getTime() < now.getTime();
    }
    if (event.date) {
      const start = new Date(`${event.date}T23:59:59`);
      return start.getTime() < now.getTime();
    }
  } catch {}
  return false;
}

/**
 * Filter active public events (automatically excluding expired events if autoRemoveOnExpiry is true)
 */
export function filterActivePublicEvents(events?: AssociationEvent[]): AssociationEvent[] {
  if (!events || events.length === 0) return DEFAULT_EVENTS;
  return events.filter((evt) => {
    if (evt.autoRemoveOnExpiry && isEventExpired(evt)) {
      return false;
    }
    return true;
  });
}

/**
 * Purge or cleanup expired events from settings
 */
export function cleanupExpiredEvents(settings: WebsiteSettings): WebsiteSettings {
  const currentEvents = settings.events || DEFAULT_EVENTS;
  const filtered = currentEvents.filter((evt) => !isEventExpired(evt));
  return {
    ...settings,
    events: filtered
  };
}

/**
 * Fetch Website Settings (Sync from localStorage fallback)
 */
export function fetchWebsiteSettings(): WebsiteSettings {
  try {
    const raw = localStorage.getItem('apsiwa_website_settings');
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_WEBSITE_SETTINGS,
        ...parsed,
        galleryItems: parsed.galleryItems?.length ? parsed.galleryItems : GALLERY_ITEMS,
        events: parsed.events?.length ? parsed.events : DEFAULT_EVENTS
      };
    }
  } catch {}
  return DEFAULT_WEBSITE_SETTINGS;
}

/**
 * Fetch Website Settings from Supabase Realtime DB
 */
export async function fetchWebsiteSettingsAsync(): Promise<WebsiteSettings> {
  const local = fetchWebsiteSettings();
  if (!isSupabaseConfigured()) return local;

  try {
    const { data, error } = await supabase
      .from('website_settings')
      .select('settings_json')
      .eq('id', 'global_config')
      .maybeSingle();

    if (!error && data?.settings_json) {
      const merged = {
        ...DEFAULT_WEBSITE_SETTINGS,
        ...data.settings_json,
        galleryItems: data.settings_json.galleryItems?.length ? data.settings_json.galleryItems : GALLERY_ITEMS,
        events: data.settings_json.events?.length ? data.settings_json.events : DEFAULT_EVENTS
      };
      try {
        localStorage.setItem('apsiwa_website_settings', JSON.stringify(merged));
      } catch {}
      return merged;
    }
  } catch (err) {
    console.warn('Supabase fetchWebsiteSettingsAsync note:', err);
  }
  return local;
}

/**
 * Save Website Settings (Realtime Supabase + LocalStorage)
 */
export async function saveWebsiteSettings(settings: WebsiteSettings): Promise<{ success: boolean; error?: string | null }> {
  try {
    localStorage.setItem('apsiwa_website_settings', JSON.stringify(settings));
  } catch {}

  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from('website_settings').upsert({
        id: 'global_config',
        settings_json: settings,
        updated_at: new Date().toISOString(),
      });
      if (error) {
        console.warn('Supabase save website_settings error:', error.message);
        return { success: false, error: error.message };
      }
    } catch (err: any) {
      console.warn('Supabase save website_settings exception:', err);
      return { success: true, error: err?.message };
    }
  }

  return { success: true };
}
