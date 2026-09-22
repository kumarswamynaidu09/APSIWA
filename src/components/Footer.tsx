import React from 'react';
import { NavTab } from '../types';
import {
  ShieldCheck,
  Home,
  Images,
  Award,
  Contact,
  Info,
  Lock,
  MapPin,
  Mail,
  Phone,
  Clock
} from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: NavTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full bg-[#ffffff] border-t border-[#e0e3e6] mt-margin">
      <div className="max-w-7xl mx-auto px-margin py-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Column 1: Organization Bio */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2">
              <img
                alt="APSIWA Official Logo"
                className="h-10 w-auto object-contain"
                src="/logo.png"
              />
              <span className="text-[16px] font-bold text-[#003477]">APSIWA</span>
            </div>
            <p className="text-[11px] uppercase font-bold text-[#191c1e] tracking-wider">
              ANDHRA PRADESH SOLAR INTEGRATORS WELFARE ASSOCIATION
            </p>
            <p className="text-[13px] text-[#434752] leading-relaxed max-w-md">
              Dedicated welfare association advocating for solar EPCs, installers, and integrators across Andhra Pradesh. Promoting clean energy compliance, professional excellence, and sustainable grid growth.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <span className="inline-flex items-center px-3 py-1 rounded-lg bg-[#f2f4f7] text-[11px] text-[#006e2e] font-semibold">
                <ShieldCheck size={16} className="mr-1.5 text-[#006e2e]" />
                Government Recognized Network
              </span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="md:col-span-3 space-y-3">
            <p className="text-[14px] font-bold text-[#191c1e]">Portal Navigation</p>
            <ul className="space-y-2 text-[13px] text-[#434752]">
              <li>
                <button
                  onClick={() => {
                    onNavigate('home');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-[#003477] transition-colors cursor-pointer text-left flex items-center gap-1.5"
                >
                  <Home size={15} className="opacity-70" />
                  <span>Home</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onNavigate('gallery');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-[#003477] transition-colors cursor-pointer text-left flex items-center gap-1.5"
                >
                  <Images size={15} className="opacity-70" />
                  <span>Activities Gallery</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onNavigate('membership');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-[#003477] transition-colors cursor-pointer text-left flex items-center gap-1.5"
                >
                  <Award size={15} className="opacity-70" />
                  <span>Membership Application</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onNavigate('profile');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-[#003477] transition-colors cursor-pointer text-left flex items-center gap-1.5"
                >
                  <Contact size={15} className="opacity-70" />
                  <span>ID Card &amp; Status</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onNavigate('about');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-[#003477] transition-colors cursor-pointer text-left flex items-center gap-1.5"
                >
                  <Info size={15} className="opacity-70" />
                  <span>About APSIWA &amp; Governance</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onNavigate('admin');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-[#003477] text-[#003477] font-medium transition-colors cursor-pointer text-left flex items-center gap-1.5 pt-1"
                >
                  <Lock size={15} />
                  <span>Admin Portal</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact Details */}
          <div className="md:col-span-4 space-y-3">
            <p className="text-[14px] font-bold text-[#191c1e]">Contact Details</p>
            <div className="space-y-2.5 text-[13px] text-[#434752]">
              <div className="flex items-start gap-2.5">
                <MapPin size={18} className="text-[#003477] shrink-0 mt-0.5" />
                <span>Association Secretariat, Visakhapatnam, Andhra Pradesh, India</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail size={18} className="text-[#003477] shrink-0" />
                <a className="hover:text-[#003477] transition-colors underline" href="mailto:apsiwa2018@gmail.com">
                  apsiwa2018@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone size={18} className="text-[#003477] shrink-0" />
                <a className="hover:text-[#003477] transition-colors" href="tel:+918662450000">
                  +91 866 245 XXXX
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock size={18} className="text-[#003477] shrink-0" />
                <span>Mon - Fri: 09:30 AM - 05:30 PM IST</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#e0e3e6] mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px] text-[#434752]">
          <span>© 2026 APSIWA. All Rights Reserved. Empowering Solar Integrators, Strengthening the Industry.</span>
          <div className="flex items-center gap-3">
            <span>Institutional Welfare Platform</span>
            <span className="w-1 h-1 rounded-full bg-[#c3c6d4]"></span>
            <span>Government Liaison</span>
            <span className="w-1 h-1 rounded-full bg-[#c3c6d4]"></span>
            <button
              onClick={() => {
                onNavigate('admin');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-[#003477] font-semibold text-[#003477] transition-colors cursor-pointer inline-flex items-center gap-1"
            >
              <Lock size={13} />
              <span>Admin Portal</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
