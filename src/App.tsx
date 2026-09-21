import { useState, useEffect } from 'react';
import { NavTab, GalleryItem, MembershipApplication, UserProfile, WebsiteSettings } from './types';
import { GALLERY_ITEMS } from './data/mockData';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomeScreen } from './components/HomeScreen';
import { AboutScreen } from './components/AboutScreen';
import { GalleryScreen } from './components/GalleryScreen';
import { MembershipScreen } from './components/MembershipScreen';
import { AuthScreen } from './components/AuthScreen';
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
  ADMIN_EMAILS
} from './lib/supabase';

export function App() {
  // Splash Screen State (2 seconds duration)
  const [showSplash, setShowSplash] = useState(true);

  // Post-Splash Authentication Screen (Login & Signup with Skip Now)
  const [showPostSplashAuth, setShowPostSplashAuth] = useState(true);

  // Active Navigation Tab
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [selectedGalleryItem, setSelectedGalleryItem] = useState<GalleryItem | null>(null);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);

  // Dynamic Website Settings (Fees, QR code, bank info, secretariat contacts)
  const [websiteSettings, setWebsiteSettings] = useState<WebsiteSettings>(() => fetchWebsiteSettings());

  // User Authentication State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('apsiwa_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');

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

  // Handle Auth open
  const handleOpenAuth = (mode: 'login' | 'signup' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  // Handle Login / Signup Success (Directly Redirects into Membership Page)
  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('apsiwa_current_user', JSON.stringify(user));
    } catch (err) {
      console.error('Failed to persist user session', err);
    }
    setIsAuthModalOpen(false);
    setShowPostSplashAuth(false);
    // Redirect directly into membership page
    setCurrentTab('membership');
  };

  // Handle Switching to Admin User for demo / governance testing
  const handleSwitchToAdminUser = (adminEmail: string) => {
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

  // Check active Supabase session on startup & listen to auth changes
  useEffect(() => {
    if (isSupabaseConfigured()) {
      // Get initial session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const profile = mapSupabaseUserToProfile(session.user);
          setCurrentUser(profile);
          setShowPostSplashAuth(false);
          fetchUserApplications(session.user.email).then((apps) => {
            if (apps && apps.length > 0) setApplications(apps);
          });
        }
      });

      // Listen to auth state changes (login, logout, token refresh)
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const profile = mapSupabaseUserToProfile(session.user);
          setCurrentUser(profile);
          setShowPostSplashAuth(false);
          try {
            localStorage.setItem('apsiwa_current_user', JSON.stringify(profile));
          } catch {}
          fetchUserApplications(session.user.email).then((apps) => {
            if (apps && apps.length > 0) setApplications(apps);
          });
        } else {
          setCurrentUser(null);
          try {
            localStorage.removeItem('apsiwa_current_user');
          } catch {}
        }
      });

      return () => {
        subscription.unsubscribe();
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

  // Handle Payment Complete
  const handlePaymentSuccess = (newApp: MembershipApplication) => {
    setApplications((prev) => [newApp, ...prev]);
    if (currentUser) {
      const updatedUser: UserProfile = {
        ...currentUser,
        membershipId: newApp.id,
        companyName: newApp.companyName,
        district: newApp.district,
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

      {/* Post-Splash Authentication View: Login & Signup with Skip Now */}
      {!showSplash && showPostSplashAuth && !currentUser ? (
        <AuthScreen
          initialMode="login"
          onLoginSuccess={handleLoginSuccess}
          onSkip={() => setShowPostSplashAuth(false)}
        />
      ) : (
        <>
          {/* Sticky Header with First Line (Logo + Become Member + Profile) & Second Line (Navigation) */}
          <Header
            currentTab={currentTab}
            onNavigate={(tab) => setCurrentTab(tab)}
            onOpenStatusTracker={() => setIsTrackerOpen(true)}
            applicationCount={applications.length}
            currentUser={currentUser}
            onLogout={handleLogout}
            onOpenAuth={handleOpenAuth}
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
                onOpenAuth={() => handleOpenAuth('login')}
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

            {currentTab === 'auth' && (
              <AuthScreen
                initialMode={authModalMode}
                onLoginSuccess={handleLoginSuccess}
                onNavigate={(tab) => setCurrentTab(tab)}
              />
            )}
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

          {/* Login / Sign Up Modal */}
          {isAuthModalOpen && (
            <AuthScreen
              isModal={true}
              initialMode={authModalMode}
              onLoginSuccess={handleLoginSuccess}
              onClose={() => setIsAuthModalOpen(false)}
            />
          )}
        </>
      )}
    </div>
  );
}

export default App;
