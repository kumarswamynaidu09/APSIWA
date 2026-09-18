import React from 'react';
import { NavTab } from '../types';

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
                src="https://lh3.googleusercontent.com/aida/AEtjO1XtZkjiEfKiqomreBUaiGljqTkyNgi1FUkOKJ3HvrCFYW8jYu8s7SUfAaG_WWw1VyG9kMbiZYBFjTbThj1g23WGqAkfylwD0MzfiMx2scfOtl_9YCFQzWF49omfwDGWJLCRAcjX99Jhbi1k8hQC5aG4ZRZ9o2CYYASYm1smUcxiC_FvrnMSfYE1H3_ZOdLP6sTUBjgaUTVNLcNGHLUFkzc5aCOd771sc1SKjEmXcbNyjyFgIn_OkJJwzUs3"
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
                <span className="material-symbols-outlined text-[16px] mr-1.5">verified</span>
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
                  <span className="material-symbols-outlined text-[15px] opacity-70">home</span>
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
                  <span className="material-symbols-outlined text-[15px] opacity-70">photo_library</span>
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
                  <span className="material-symbols-outlined text-[15px] opacity-70">card_membership</span>
                  <span>Membership Application</span>
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
                  <span className="material-symbols-outlined text-[15px] opacity-70">info</span>
                  <span>About APSIWA &amp; Governance</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact Details */}
          <div className="md:col-span-4 space-y-3">
            <p className="text-[14px] font-bold text-[#191c1e]">Contact Details</p>
            <div className="space-y-2.5 text-[13px] text-[#434752]">
              <div className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[#003477] text-[20px] shrink-0 mt-0.5">location_on</span>
                <span>Association Secretariat, Vijayawada &amp; Amaravati, Andhra Pradesh</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[#003477] text-[20px] shrink-0">mail</span>
                <a className="hover:text-[#003477] transition-colors underline" href="mailto:contact@apsiwa.org">
                  contact@apsiwa.org
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[#003477] text-[20px] shrink-0">call</span>
                <a className="hover:text-[#003477] transition-colors" href="tel:+918662450000">
                  +91 866 245 XXXX
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[#003477] text-[20px] shrink-0">schedule</span>
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
          </div>
        </div>
      </div>
    </footer>
  );
};
