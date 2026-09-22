import React, { useState, useRef, useEffect } from 'react';
import { NavTab, UserProfile } from '../types';
import {
  Menu,
  X,
  Home,
  Images,
  Award,
  Contact,
  Info,
  UserPlus,
  ShieldAlert,
  BadgeCheck
} from 'lucide-react';
import { isAdminUser } from '../lib/supabase';

interface HeaderProps {
  currentTab: NavTab;
  onNavigate: (tab: NavTab) => void;
  onOpenStatusTracker: () => void;
  applicationCount: number;
  currentUser: UserProfile | null;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onNavigate,
  onOpenStatusTracker,
  applicationCount,
  currentUser,
  onLogout
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: NavTab; label: string; Icon: React.ElementType }[] = [
    { id: 'home', label: 'Home', Icon: Home },
    { id: 'gallery', label: 'Activities Gallery', Icon: Images },
    { id: 'membership', label: 'Membership', Icon: Award },
    { id: 'profile', label: 'Member Profile & Card', Icon: Contact },
    { id: 'about', label: 'About APSIWA', Icon: Info }
  ];

  const isAdmin = isAdminUser(currentUser?.email);

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
            {/* Become a Member Button with 60% Expo Discount Badge */}
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
              <UserPlus size={18} className="shrink-0" />
              <span>Become a Member</span>
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
      {/* SECOND LINE: Navigation Bar Centered                      */}
      {/* ========================================================= */}
      <div className="bg-[#f7f9fc] border-t border-[#eceef1] shadow-2xs">
        <div className="max-w-7xl mx-auto px-margin flex items-center justify-center">
          <nav className="hidden md:flex items-center justify-center gap-2 sm:gap-2.5 h-12 py-1">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              const ItemIcon = item.Icon;
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
                  <ItemIcon
                    size={16}
                    className={`transition-colors shrink-0 ${
                      isActive ? 'text-[#003477]' : 'text-[#737783]'
                    }`}
                  />
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
          {navItems.map((item) => {
            const ItemIcon = item.Icon;
            return (
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
                <ItemIcon size={18} className="shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-3 border-t border-[#e0e3e6] flex flex-col gap-2">
            <button
              onClick={() => {
                onNavigate('admin');
                setMobileMenuOpen(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full py-2.5 px-4 bg-[#fff8e6] text-[#b25e00] border border-[#ffbe3b]/50 rounded-xl text-center font-bold text-[13px] flex items-center justify-center gap-2"
            >
              <ShieldAlert size={16} />
              <span>Admin Secretariat Dashboard</span>
            </button>

            {isAdmin && currentUser && (
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
                  className="px-2.5 py-1 text-[#ba1a1a] bg-white rounded border border-[#e0e3e6] font-semibold cursor-pointer"
                >
                  Sign Out Admin
                </button>
              </div>
            )}

            <button
              onClick={() => {
                onNavigate('membership');
                setMobileMenuOpen(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-[#006e2e] via-[#008738] to-[#006e2e] text-white rounded-xl text-center font-extrabold text-[13px] flex items-center justify-center gap-2 shadow-md"
            >
              <UserPlus size={18} />
              <span>Become a Member (60% Expo OFF)</span>
            </button>

            <button
              onClick={() => {
                onOpenStatusTracker();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 px-4 bg-[#f2f4f7] text-[#003477] rounded-xl text-center font-medium text-[13px] flex items-center justify-center gap-2"
            >
              <BadgeCheck size={18} />
              <span>Track Application Status</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
