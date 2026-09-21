import React, { useState, useRef, useEffect } from 'react';
import { NavTab, UserProfile } from '../types';
import { Menu, X, User, LogOut, ChevronDown, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  currentTab: NavTab;
  onNavigate: (tab: NavTab) => void;
  onOpenStatusTracker: () => void;
  applicationCount: number;
  currentUser: UserProfile | null;
  onLogout: () => void;
  onOpenAuth: (mode?: 'login' | 'signup') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onNavigate,
  onOpenStatusTracker,
  applicationCount,
  currentUser,
  onLogout,
  onOpenAuth
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navItems: { id: NavTab; label: string; icon: string }[] = [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'gallery', label: 'Activities Gallery', icon: 'photo_library' },
    { id: 'membership', label: 'Membership', icon: 'card_membership' },
    { id: 'profile', label: 'Member Profile & Card', icon: 'badge' },
    { id: 'about', label: 'About APSIWA', icon: 'info' }
  ];

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 bg-[#ffffff] border-b border-[#e0e3e6] shadow-xs">
      {/* ========================================================= */}
      {/* FIRST LINE: Title Logo + Become Member + Profile Section  */}
      {/* ========================================================= */}
      <div className="border-b border-[#eceef1] bg-white">
        <div className="max-w-7xl mx-auto px-margin h-16 sm:h-20 flex items-center justify-between gap-4">
          {/* Left: Brand Logo & Institutional Title */}
          <div className="flex items-center min-w-0">
            <button
              onClick={() => {
                onNavigate('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-3 text-left group cursor-pointer focus:outline-none"
            >
              <img
                alt="APSIWA Official Logo"
                className="h-11 sm:h-13 w-auto object-contain transition-transform group-hover:scale-105 shrink-0"
                src="/logo.png"
              />
              <div className="flex flex-col min-w-0">
                <span className="text-[17px] sm:text-[20px] font-extrabold text-[#003477] tracking-tight leading-none">
                  APSIWA
                </span>
                <span className="text-[10.5px] sm:text-[12px] text-[#434752] tracking-wider uppercase font-semibold mt-1 truncate">
                  Andhra Pradesh Solar Integrators Welfare Association
                </span>
              </div>
            </button>
          </div>

          {/* Right: Become Member CTA & Profile Section */}
          <div className="flex items-center justify-end gap-2.5 sm:gap-3.5 shrink-0">
            {/* Become a Member Button with Blinking Pulse Effect & 60% Expo Discount Badge */}
            <button
              onClick={() => {
                onNavigate('membership');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="relative inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-[#006e2e] via-[#008738] to-[#006e2e] text-[#ffffff] text-[12.5px] sm:text-[13.5px] font-extrabold rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer whitespace-nowrap active:scale-95 animate-pulse ring-2 ring-[#8ef9a0]/70"
            >
              <span className="absolute -top-2.5 -right-1 px-1.5 py-0.5 rounded-full bg-[#ffbe3b] text-[#00285e] text-[9px] font-black uppercase tracking-wider shadow-sm animate-bounce">
                60% OFF
              </span>
              <span className="material-symbols-outlined text-[17px] sm:text-[19px]">how_to_reg</span>
              <span>Become a Member</span>
            </button>

            {/* Profile & Account Section in First Line */}
            <div className="relative" ref={dropdownRef}>
              {currentUser ? (
                /* Logged In Profile Trigger */
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 py-1.5 px-2 sm:px-3 rounded-xl bg-[#f2f4f7] hover:bg-[#eceef1] border border-[#e0e3e6] transition-colors cursor-pointer group whitespace-nowrap"
                >
                  <div className="w-8 h-8 rounded-full bg-[#003477] text-white flex items-center justify-center font-bold text-[12px] shadow-xs shrink-0">
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="hidden md:flex flex-col text-left">
                    <span className="text-[12px] font-bold text-[#191c1e] max-w-[110px] truncate leading-tight">
                      {currentUser.name}
                    </span>
                    <span className="text-[10px] text-[#006e2e] font-semibold flex items-center gap-0.5">
                      <CheckCircle2 size={10} />
                      Member
                    </span>
                  </div>
                  <ChevronDown
                    size={14}
                    className={`text-[#737783] transition-transform ${
                      profileDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              ) : (
                /* Not Logged In: Profile / Sign In Button */
                <button
                  onClick={() => onOpenAuth('login')}
                  className="flex items-center gap-1.5 py-2 px-3 sm:px-3.5 rounded-xl bg-[#f2f4f7] hover:bg-[#e0e3e6] border border-[#e0e3e6] text-[#003477] text-[13px] font-semibold transition-colors cursor-pointer whitespace-nowrap"
                  title="Sign In / Register Profile"
                >
                  <User size={16} />
                  <span className="hidden sm:inline">Profile / Sign In</span>
                </button>
              )}

              {/* Profile Dropdown Menu */}
              {profileDropdownOpen && currentUser && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#e0e3e6] py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-3 border-b border-[#e0e3e6] space-y-1">
                    <p className="text-[13px] font-bold text-[#191c1e] truncate">{currentUser.name}</p>
                    <p className="text-[11px] text-[#737783] truncate">{currentUser.email}</p>
                    {currentUser.phoneNumber && (
                      <p className="text-[11px] text-[#434752]">{currentUser.phoneNumber}</p>
                    )}
                    <span className="inline-block mt-1 px-2 py-0.5 rounded bg-[#8bf69d]/20 text-[#006e2e] text-[10px] font-bold">
                      {currentUser.membershipId || 'APSIWA Verified'}
                    </span>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onNavigate('profile');
                      }}
                      className="w-full text-left px-4 py-2 text-[13px] text-[#003477] font-semibold hover:bg-[#f2f4f7] flex items-center justify-between cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">
                          account_circle
                        </span>
                        <span>My Profile &amp; ID Card</span>
                      </span>
                      <span className="px-1.5 py-0.5 bg-[#006e2e] text-white text-[10px] font-bold rounded-full">
                        Active
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onNavigate('profile');
                      }}
                      className="w-full text-left px-4 py-2 text-[13px] text-[#191c1e] hover:bg-[#f2f4f7] flex items-center justify-between cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-[#003477]">
                          verified_user
                        </span>
                        <span>Enrolment Status</span>
                      </span>
                      {applicationCount > 0 && (
                        <span className="px-1.5 py-0.5 bg-[#006e2e] text-white text-[10px] font-bold rounded-full">
                          {applicationCount}
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onNavigate('profile');
                      }}
                      className="w-full text-left px-4 py-2 text-[13px] text-[#191c1e] hover:bg-[#f2f4f7] flex items-center gap-2 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px] text-[#003477]">
                        badge
                      </span>
                      <span>Download ID Card</span>
                    </button>
                  </div>

                  <div className="pt-1 border-t border-[#e0e3e6]">
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full text-left px-4 py-2 text-[13px] text-[#ba1a1a] hover:bg-[#ffdad6]/40 flex items-center gap-2 cursor-pointer font-medium"
                    >
                      <LogOut size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Status Tracker Icon with Application Badge */}
            <button
              onClick={onOpenStatusTracker}
              title="Track Application Status & Registry"
              className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#f2f4f7] hover:bg-[#eceef1] border border-[#e0e3e6] flex items-center justify-center text-[#003477] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">inventory</span>
              {applicationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#006e2e] text-white rounded-full text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                  {applicationCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-[#434752] hover:bg-[#eceef1] transition-colors focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SECOND LINE: Navigation Bar in the Next Line (Centered)   */}
      {/* ========================================================= */}
      <div className="bg-[#f7f9fc] border-t border-[#eceef1] shadow-2xs">
        <div className="max-w-7xl mx-auto px-margin flex items-center justify-center">
          {/* Main Flow Navigation (Home -> Gallery -> Membership -> About) Centered */}
          <nav className="hidden md:flex items-center justify-center gap-2 sm:gap-2.5 h-12 overflow-x-auto py-1">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`h-full flex items-center gap-2 px-4.5 lg:px-5 text-[13.5px] transition-all relative cursor-pointer font-semibold rounded-lg whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'text-[#003477] bg-white border border-[#e0e3e6] shadow-xs ring-1 ring-[#003477]/10'
                      : 'text-[#434752] hover:text-[#003477] hover:bg-white/70'
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-[18px] transition-colors shrink-0 ${
                      isActive ? 'text-[#003477]' : 'text-[#737783] group-hover:text-[#003477]'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#003477] ml-0.5"></span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#e0e3e6] bg-[#ffffff] px-6 py-4 space-y-2 shadow-lg animate-in slide-in-from-top-2 duration-150">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                setMobileMenuOpen(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`w-full text-left py-2.5 px-3 rounded-xl text-[14px] font-medium transition-colors flex items-center gap-2.5 ${
                currentTab === item.id
                  ? 'bg-[#d8e2ff] text-[#001a42] font-semibold'
                  : 'text-[#434752] hover:bg-[#f2f4f7]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}

          <div className="pt-3 border-t border-[#e0e3e6] flex flex-col gap-2">
            {!currentUser ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth('login');
                }}
                className="w-full py-2.5 px-4 bg-[#003477] text-white rounded-xl text-center font-semibold text-[13px] flex items-center justify-center gap-2"
              >
                <User size={16} />
                <span>Sign In / Sign Up</span>
              </button>
            ) : (
              <div className="p-3 bg-[#f2f4f7] rounded-xl flex items-center justify-between text-[12px]">
                <div>
                  <p className="font-bold text-[#191c1e]">{currentUser.name}</p>
                  <p className="text-[#737783] text-[11px]">{currentUser.email}</p>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="px-2.5 py-1 text-[#ba1a1a] bg-white rounded border border-[#e0e3e6] font-semibold"
                >
                  Sign Out
                </button>
              </div>
            )}

            <button
              onClick={() => {
                onNavigate('membership');
                setMobileMenuOpen(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-[#006e2e] via-[#008738] to-[#006e2e] text-white rounded-xl text-center font-extrabold text-[13px] flex items-center justify-center gap-2 animate-pulse shadow-md"
            >
              <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
              <span>Become a Member (₹2,000 • 60% Expo OFF)</span>
            </button>

            <button
              onClick={() => {
                onOpenStatusTracker();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 px-4 bg-[#f2f4f7] text-[#003477] rounded-xl text-center font-medium text-[13px] flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">verified</span>
              <span>Track Application Status</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
