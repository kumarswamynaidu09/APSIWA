import { useState, useEffect } from 'react';
import { NavTab, GalleryItem, MembershipApplication, UserProfile, WebsiteSettings } from './types';
import { GALLERY_ITEMS } from './data/mockData';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomeScreen } from './components/HomeScreen';
import { AboutScreen } from './components/AboutScreen';
import { GalleryScreen } from './components/GalleryScreen';
import { MembershipScreen } from './components/MembershipScreen';
import { SplashScreen } from './components/SplashScreen';
import { GalleryLightbox } from './components/GalleryLightbox';
import { StatusTrackerModal } from './components/StatusTrackerModal';
import { ProfileScreen } from './components/ProfileScreen';
import { PaymentScreen } from './components/PaymentScreen';
import { AdminDashboard } from './components/AdminDashboard';
import {
  supabase,
  mapSupabaseUserToProfile,
  signOut,
  isSupabaseConfigured,
  fetchUserApplications,
  fetchWebsiteSettings,
  saveWebsiteSettings,
  DEFAULT_WEBSITE_SETTINGS,
  ADMIN_EMAILS,
  calculateValidityDate
} from './lib/supabase';

export function App() {
  // Splash Screen State (2 seconds duration)
  const [showSplash, setShowSplash] = useState(true);

  // Active Navigation Tab
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [selectedGalleryItem, setSelectedGalleryItem] = useState<GalleryItem | null>(null);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);

  // Dynamic Website Settings (Fees, QR code, bank info, secretariat contacts)
  const [websiteSettings, setWebsiteSettings] = useState<WebsiteSettings>(() => fetchWebsiteSettings());

  // Current Admin / Active Session State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('apsiwa_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Pending Membership Application Payload for Payment Screen
  const [pendingApplicationData, setPendingApplicationData] = useState<Partial<MembershipApplication> | null>(null);

  // Realtime Stored Applications (loaded from Supabase / localStorage)
  const [applications, setApplications] = useState<MembershipApplication[]>(() => {
    try {
      const raw = localStorage.getItem('apsiwa_membership_applications');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Reload applications helper
  const handleRefreshApplications = async () => {
    const apps = await fetchUserApplications(currentUser?.email);
    if (apps && apps.length > 0) {
      setApplications(apps);
    }
  };

  // Handle Switching to Admin User for demo / governance testing
  const handleSwitchToAdminUser = (adminEmail: string) => {
    if (!adminEmail) {
      setCurrentUser(null);
      try {
        localStorage.removeItem('apsiwa_current_user');
      } catch {}
      return;
    }

    const adminUser: UserProfile = {
      id: `admin-${adminEmail.replace(/[^a-zA-Z0-9]/g, '')}`,
      email: adminEmail,
      name: adminEmail.startsWith('kumar') ? 'Kumar Swamy Naidu (Admin)' : 'APSIWA Secretariat Admin',
      phoneNumber: '+91 94401 23456',
      membershipId: 'APSIWA-ADMIN-01',
      membershipStatus: 'Active',
      role: 'admin',
      district: 'Amaravati'
    };
    setCurrentUser(adminUser);
    try {
      localStorage.setItem('apsiwa_current_user', JSON.stringify(adminUser));
    } catch {}
    handleRefreshApplications();
  };

  // Update website settings in realtime
  const handleUpdateWebsiteSettings = (newSettings: WebsiteSettings) => {
    setWebsiteSettings(newSettings);
  };

  // Check active Supabase session on startup & listen to auth changes (for Admin users)
  // Check active Supabase session on startup & listen to auth changes & Realtime DB changes
  useEffect(() => {
    // Initial fetch on mount
    fetchUserApplications(currentUser?.email).then((apps) => {
      if (apps) setApplications(apps);
    });

    if (isSupabaseConfigured()) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const profile = mapSupabaseUserToProfile(session.user);
          setCurrentUser(profile);
          fetchUserApplications(session.user.email).then((apps) => {
            if (apps) setApplications(apps);
          });
        }
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const profile = mapSupabaseUserToProfile(session.user);
          setCurrentUser(profile);
          try {
            localStorage.setItem('apsiwa_current_user', JSON.stringify(profile));
          } catch {}
          fetchUserApplications(session.user.email).then((apps) => {
            if (apps) setApplications(apps);
          });
        } else {
          setCurrentUser(null);
          try {
            localStorage.removeItem('apsiwa_current_user');
          } catch {}
        }
      });

      // Realtime subscription on membership_applications table
      const realtimeChannel = supabase
        .channel('public:membership_applications')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'membership_applications' },
          () => {
            fetchUserApplications(currentUser?.email).then((apps) => {
              if (apps) setApplications(apps);
            });
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
        supabase.removeChannel(realtimeChannel);
      };
    }
  }, []);

  // Handle Logout
  const handleLogout = async () => {
    await signOut();
    setCurrentUser(null);
    try {
      localStorage.removeItem('apsiwa_current_user');
    } catch (err) {
      console.error('Failed to remove user session', err);
    }
  };

  // Handle user profile update
  const handleUpdateUser = (updated: UserProfile) => {
    setCurrentUser(updated);
    try {
      localStorage.setItem('apsiwa_current_user', JSON.stringify(updated));
    } catch {}
  };

  // Handle Proceed from Membership Page to Payment Page
  const handleProceedToPayment = (formData: Partial<MembershipApplication>) => {
    setPendingApplicationData(formData);
    setCurrentTab('payment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle Existing Member Instant Web Onboarding (No payment required)
  const handleExistingMemberRegistered = (newApp: MembershipApplication) => {
    setApplications((prev) => [newApp, ...prev.filter((a) => a.id !== newApp.id)]);
    const calculatedValidUntil = newApp.validUntil || calculateValidityDate(newApp.paymentDate);
    const updatedUser: UserProfile = {
      id: currentUser?.id || `usr_${Date.now()}`,
      name: newApp.fullName,
      email: newApp.emailAddress,
      phoneNumber: newApp.mobileNumber,
      dateOfBirth: newApp.dateOfBirth,
      avatarUrl: newApp.photoUrl,
      membershipId: newApp.id,
      companyName: newApp.companyName,
      designation: newApp.designation,
      district: newApp.district,
      gstNumber: newApp.gstNumber,
      businessType: newApp.businessType,
      address: newApp.officeAddress,
      pincode: newApp.pincode,
      validUntil: calculatedValidUntil,
      membershipTier: 'Life Member (EPC Tier-1)',
      membershipStatus: 'Active',
      joinedDate: '2026'
    };
    handleUpdateUser(updatedUser);
    setCurrentTab('profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle Payment Complete
  const handlePaymentSuccess = (newApp: MembershipApplication) => {
    setApplications((prev) => [newApp, ...prev]);
    if (currentUser) {
      const calculatedValidUntil = newApp.validUntil || calculateValidityDate(newApp.paymentDate);
      const updatedUser: UserProfile = {
        ...currentUser,
        membershipId: newApp.id,
        companyName: newApp.companyName,
        district: newApp.district,
        validUntil: calculatedValidUntil,
        membershipStatus: 'Active'
      };
      handleUpdateUser(updatedUser);
    }
  };

  // Scroll to top on tab change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentTab]);

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f9fc] text-[#191c1e] font-sans antialiased">
      {/* 2-Second Splash Screen on initial load */}
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

      {/* Main Website Flow */}
      {!showSplash && (
        <>
          {/* Sticky Header with First Line (Logo + Become Member + Admin Portal) & Second Line (Navigation) */}
          <Header
            currentTab={currentTab}
            onNavigate={(tab) => setCurrentTab(tab)}
            onOpenStatusTracker={() => setIsTrackerOpen(true)}
            applicationCount={applications.length}
            currentUser={currentUser}
            onLogout={handleLogout}
          />

          {/* Main Content View Container (pt-28 for 2-line header offset) */}
          {/* Flow: Home -> Gallery -> Membership -> Payment -> Profile -> About -> Admin */}
          <main className="flex-1 pt-28 sm:pt-32">
            {currentTab === 'home' && (
              <HomeScreen
                onNavigate={(tab) => setCurrentTab(tab)}
                onOpenLightbox={(item) => setSelectedGalleryItem(item)}
                galleryItems={GALLERY_ITEMS}
              />
            )}

            {currentTab === 'gallery' && (
              <GalleryScreen
                galleryItems={GALLERY_ITEMS}
                onOpenLightbox={(item) => setSelectedGalleryItem(item)}
              />
            )}

            {currentTab === 'membership' && (
              <MembershipScreen
                currentUser={currentUser}
                websiteSettings={websiteSettings}
                onProceedToPayment={handleProceedToPayment}
                onExistingMemberRegistered={handleExistingMemberRegistered}
                onNavigateProfile={() => setCurrentTab('profile')}
                onNavigateHome={() => setCurrentTab('home')}
              />
            )}

            {currentTab === 'payment' && (
              <PaymentScreen
                applicationData={pendingApplicationData}
                currentUser={currentUser}
                websiteSettings={websiteSettings}
                onPaymentSuccess={handlePaymentSuccess}
                onBackToMembership={() => setCurrentTab('membership')}
                onNavigateProfile={() => setCurrentTab('profile')}
              />
            )}

            {currentTab === 'profile' && (
              <ProfileScreen
                user={currentUser}
                onUpdateUser={handleUpdateUser}
                applications={applications}
                onNavigateMembership={() => setCurrentTab('membership')}
              />
            )}

            {currentTab === 'admin' && (
              <AdminDashboard
                currentUser={currentUser}
                applications={applications}
                onRefreshApplications={handleRefreshApplications}
                websiteSettings={websiteSettings}
                onUpdateWebsiteSettings={handleUpdateWebsiteSettings}
                onNavigateHome={() => setCurrentTab('home')}
                onSwitchToAdminUser={handleSwitchToAdminUser}
              />
            )}

            {currentTab === 'about' && <AboutScreen onNavigate={(tab) => setCurrentTab(tab)} />}
          </main>

          {/* Global Footer */}
          <Footer onNavigate={(tab) => setCurrentTab(tab)} />

          {/* Fullscreen Interactive Lightbox Modal */}
          <GalleryLightbox
            item={selectedGalleryItem}
            allItems={GALLERY_ITEMS}
            onClose={() => setSelectedGalleryItem(null)}
            onSelect={(item) => setSelectedGalleryItem(item)}
          />

          {/* Member Application Status Tracker */}
          <StatusTrackerModal
            isOpen={isTrackerOpen}
            onClose={() => setIsTrackerOpen(false)}
            applications={applications}
          />
        </>
      )}
    </div>
  );
}

export default App;
