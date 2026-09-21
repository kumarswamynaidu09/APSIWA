import { useState, useEffect } from 'react';
import { NavTab, GalleryItem, MembershipApplication, UserProfile } from './types';
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
import { supabase, mapSupabaseUserToProfile, signOut, isSupabaseConfigured } from './lib/supabase';

export function App() {
  // Splash Screen State (2 seconds duration)
  const [showSplash, setShowSplash] = useState(true);

  // Post-Splash Authentication Screen (Login & Signup with Skip Now)
  const [showPostSplashAuth, setShowPostSplashAuth] = useState(true);

  // Active Navigation Tab
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [selectedGalleryItem, setSelectedGalleryItem] = useState<GalleryItem | null>(null);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);

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

  // Stored Applications
  const [applications, setApplications] = useState<MembershipApplication[]>([
    {
      id: 'APSIWA-2026-48192',
      fullName: 'B. Raghava Choudhary',
      mobileNumber: '98480 32190',
      emailAddress: 'raghava.solar@amaravati-epc.in',
      dob: '1988-06-15',
      companyName: 'SuryaTeja Clean Energy Infra LLP',
      photoUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDxboUC-jIFd6gy0Rk8AY1BSfmhxdF6jOsxXocg7EqCSqShZipOt7pK1rv6SIPEBx2XBWpuqHe3TO0XTse86szzJ2KeTaKJzn9YLVslaYu5ussZvZs1ZsSfeNjHWjSMuLpQSrsjeDdvtSrEPhOipY-4DXjJfDa5SS_RWxkF5RbpA3UfMjXw-oLhQ7oEKNXFgoygyo4M0woc1TA-2BpIqFf4K0JW7gL-uyDSt8GYZq_cvWi4ZqEiJzc6Wg',
      utrNumber: '409218204910',
      paymentDate: '2026-03-01',
      amountPaid: '₹ 5,000.00',
      paymentScreenshotUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDKQoPqerF6MxsFeWOQEuqjZRMOpmIHXD4ubJsjC-HLBkb6H8aH9E9q4bIuwFwOaQ9HK3Sl8Oi7yGFQsqhG4gzs4IAJR6F5Q4YqVeAWJmOkjit-g7lwqdHivjTfhp8-bLHcRqeadCaE1t74t3t6gYv7azrvqiE2k6DlgVUwMN8KJCsNkOaLr8bg1e3HlnPyaCfMTDN4U0wMK5fgZI_vn5mcEVrdfVRypfOrTx3_NkRqVrmFLkSMKtwx4A',
      submissionDate: 'Mar 01, 2026',
      status: 'Pending Verification'
    }
  ]);

  // Handle Auth open
  const handleOpenAuth = (mode: 'login' | 'signup' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  // Handle Login / Signup Success
  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('apsiwa_current_user', JSON.stringify(user));
    } catch (err) {
      console.error('Failed to persist user session', err);
    }
    setIsAuthModalOpen(false);
    setShowPostSplashAuth(false);
    if (currentTab === 'auth') {
      setCurrentTab('home');
    }
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

  // Handle new membership application submission
  const handleSubmitApplication = (newApp: MembershipApplication) => {
    setApplications((prev) => [...prev, newApp]);
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
          {/* Flow: Home -> Gallery -> Membership -> Profile -> About */}
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
                onSubmitApplication={handleSubmitApplication}
                onNavigateHome={() => setCurrentTab('home')}
                onOpenTracker={() => setIsTrackerOpen(true)}
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
