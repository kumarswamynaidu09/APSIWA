import React from 'react';
import { NavTab } from '../types';

interface AboutScreenProps {
  onNavigate: (tab: NavTab) => void;
}

export const AboutScreen: React.FC<AboutScreenProps> = ({ onNavigate }) => {
  const leadership = [
    {
      role: 'President',
      name: 'B Viswa Prasad',
      tenure: 'Executive Board',
      firm: 'Solar EPC Enterprises, Andhra Pradesh',
      bio: 'Pioneering renewable energy leadership, statewide DISCOM advocacy, and championing the welfare and statutory accreditation of solar integrators across Andhra Pradesh.'
    },
    {
      role: 'Organising Secretary',
      name: 'Ch Satish Kumar',
      tenure: 'Executive Board',
      firm: 'CleanGrid Energy Systems, Andhra Pradesh',
      bio: 'Steering statewide institutional networking, district coordination, and member welfare programs.'
    },
    {
      role: 'Vice President (Rayalaseema)',
      name: 'C. Harish Reddy',
      tenure: 'Executive Board',
      firm: 'Rayalaseema CleanGrid Systems, Tirupati',
      bio: 'Championing rural solar microgrids, agricultural pump solarization, and regional installer skill clinics.'
    },
    {
      role: 'Treasurer',
      name: 'P. Nageswara Rao',
      tenure: 'Executive Board',
      firm: 'Amaravati SunWorks Pvt Ltd, Guntur',
      bio: 'Chartered financial and solar compliance specialist steering transparent welfare funds and member benefit schemes.'
    }
  ];

  const milestones = [
    {
      year: '2022',
      title: 'Foundation & State Registration',
      desc: 'Established as the unified welfare and advocacy platform for solar EPCs and installers across Andhra Pradesh.'
    },
    {
      year: '2023',
      title: 'APERC Net-Metering SLA Accord',
      desc: 'Formulated benchmark timelines for bi-directional meter release and grid synchronisation with APCPDCL and APSPDCL.'
    },
    {
      year: '2024',
      title: 'PM Surya Ghar Facilitation Cell',
      desc: 'Launched district level technical helpdesks assisting consumers and accredited integrators in fast-track subsidy claims.'
    },
    {
      year: '2025-26',
      title: 'Statewide Safety Certification Mandate',
      desc: 'Trained over 1,400 technicians on CEA safety standards and DC high-voltage fire prevention across 26 districts.'
    }
  ];

  return (
    <div className="w-full bg-[#f7f9fc] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-margin space-y-12">
        {/* Header Hero */}
        <div className="flex flex-col space-y-3">
          <div className="flex items-center gap-2">
            <span className="h-0.5 w-6 bg-[#003477]"></span>
            <span className="text-[11px] text-[#003477] uppercase font-bold tracking-widest">
              Institutional Profile &amp; Governance
            </span>
          </div>
          <h1 className="font-display-lg text-[#003477] tracking-tight">
            About APSIWA
          </h1>
          <p className="font-body-lg text-[#434752] max-w-3xl leading-relaxed">
            Andhra Pradesh Solar Integrators Welfare Association (APSIWA) is the state institutional
            consortium of certified solar engineering firms, EPCs, rooftop installers, and clean energy
            contractors dedicated to transforming Andhra Pradesh into India's leading solar powerhouse.
          </p>
        </div>

        {/* Mission, Vision & Guiding Principles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#ffffff] rounded-2xl p-6 border border-[#e0e3e6] shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#003477]/10 text-[#003477] flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px]">flag</span>
            </div>
            <h2 className="text-[16px] font-bold text-[#191c1e]">Our Mission</h2>
            <p className="text-[13px] text-[#434752] leading-relaxed">
              To unite, empower, and champion the welfare of solar integrators in Andhra Pradesh by
              fostering statutory advocacy, technical excellence, fair procurement benchmarks, and sustainable
              clean energy growth.
            </p>
          </div>

          <div className="bg-[#ffffff] rounded-2xl p-6 border border-[#e0e3e6] shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#006e2e]/10 text-[#006e2e] flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px]">visibility</span>
            </div>
            <h2 className="text-[16px] font-bold text-[#191c1e]">Our Vision</h2>
            <p className="text-[13px] text-[#434752] leading-relaxed">
              To establish a zero-accident, highly accredited solar integration ecosystem across all 26
              districts of Andhra Pradesh that accelerates rooftop solar adoption, industrial decarbonisation,
              and local engineering employment.
            </p>
          </div>

          <div className="bg-[#ffffff] rounded-2xl p-6 border border-[#e0e3e6] shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#803a00]/10 text-[#803a00] flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px]">handshake</span>
            </div>
            <h2 className="text-[16px] font-bold text-[#191c1e]">Institutional Values</h2>
            <p className="text-[13px] text-[#434752] leading-relaxed">
              Professional integrity, rigorous electrical safety protocols, collective legal welfare,
              unwavering statutory compliance with state power utilities, and inclusive member representation.
            </p>
          </div>
        </div>

        {/* Statutory & DISCOM Representation */}
        <div className="bg-[#ffffff] rounded-2xl p-6 sm:p-8 border border-[#e0e3e6] shadow-xs">
          <div className="max-w-3xl space-y-2 mb-6">
            <span className="text-[11px] text-[#003477] uppercase font-bold tracking-widest">
              Statutory Representation
            </span>
            <h2 className="font-headline-lg text-[#003477] tracking-tight">
              Active Dialogue with Andhra Pradesh Energy Authorities
            </h2>
            <p className="text-[13px] text-[#434752] leading-relaxed">
              APSIWA maintains active representation and consultative standing across government bodies:
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
            <div className="p-4 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] flex flex-col items-center justify-center">
              <span className="text-[15px] font-bold text-[#003477]">APERC</span>
              <span className="text-[11px] text-[#434752] mt-1">Regulatory Commission</span>
            </div>
            <div className="p-4 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] flex flex-col items-center justify-center">
              <span className="text-[15px] font-bold text-[#003477]">NREDCAP</span>
              <span className="text-[11px] text-[#434752] mt-1">Renewable Development</span>
            </div>
            <div className="p-4 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] flex flex-col items-center justify-center">
              <span className="text-[15px] font-bold text-[#003477]">APCPDCL</span>
              <span className="text-[11px] text-[#434752] mt-1">Central Power DISCOM</span>
            </div>
            <div className="p-4 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] flex flex-col items-center justify-center">
              <span className="text-[15px] font-bold text-[#003477]">APEPDCL</span>
              <span className="text-[11px] text-[#434752] mt-1">Eastern Power DISCOM</span>
            </div>
            <div className="p-4 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] flex flex-col items-center justify-center">
              <span className="text-[15px] font-bold text-[#003477]">APSPDCL</span>
              <span className="text-[11px] text-[#434752] mt-1">Southern Power DISCOM</span>
            </div>
            <div className="p-4 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] flex flex-col items-center justify-center">
              <span className="text-[15px] font-bold text-[#003477]">MNRE</span>
              <span className="text-[11px] text-[#434752] mt-1">Govt. of India</span>
            </div>
          </div>
        </div>

        {/* Executive Council Leadership */}
        <div className="space-y-6">
          <div className="flex flex-col space-y-1">
            <span className="text-[11px] text-[#003477] uppercase font-bold tracking-widest">
              Executive Council
            </span>
            <h2 className="font-headline-lg text-[#003477] tracking-tight">
              Leadership &amp; Office Bearers
            </h2>
            <p className="text-[13px] text-[#434752]">
              Democratic leadership elected by accredited members to steer policy, welfare, and state representation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {leadership.map((leader, idx) => (
              <div
                key={idx}
                className="bg-[#ffffff] rounded-2xl p-5 border border-[#e0e3e6] shadow-xs flex flex-col justify-between space-y-4"
              >
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#d8e2ff] text-[#001a42] text-[10px] font-bold uppercase tracking-wider">
                    {leader.role}
                  </span>
                  <h3 className="text-[15px] font-bold text-[#191c1e] mt-2">{leader.name}</h3>
                  <p className="text-[11px] text-[#003477] font-semibold">{leader.firm}</p>
                  <p className="text-[12px] text-[#434752] mt-2 leading-relaxed">{leader.bio}</p>
                </div>
                <div className="pt-2 border-t border-[#e0e3e6] text-[11px] text-[#737783] flex items-center justify-between">
                  <span>{leader.tenure}</span>
                  <span className="material-symbols-outlined text-[#006e2e] text-[16px]">verified</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Milestones Timeline */}
        <div className="bg-[#ffffff] rounded-2xl p-6 sm:p-8 border border-[#e0e3e6] shadow-xs space-y-6">
          <div className="flex flex-col space-y-1">
            <span className="text-[11px] text-[#003477] uppercase font-bold tracking-widest">
              Association Journey
            </span>
            <h2 className="font-headline-lg text-[#003477] tracking-tight">
              Key Institutional Milestones
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {milestones.map((item, idx) => (
              <div key={idx} className="relative p-4 rounded-xl bg-[#f7f9fc] border border-[#e0e3e6] space-y-2">
                <span className="text-xl font-bold text-[#003477]">{item.year}</span>
                <h3 className="text-[14px] font-bold text-[#191c1e]">{item.title}</h3>
                <p className="text-[12px] text-[#434752] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Join CTA */}
        <div className="bg-[#003477] text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-1 text-center sm:text-left">
            <h2 className="text-[18px] font-bold">Are you an installer or EPC in Andhra Pradesh?</h2>
            <p className="text-[13px] text-white/80">
              Join APSIWA today for unified representation, welfare legal protection, and accredited status.
            </p>
          </div>
          <button
            onClick={() => {
              onNavigate('membership');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="px-6 py-3 rounded-xl bg-white text-[#003477] font-bold text-[14px] hover:bg-[#f2f4f7] transition-colors shrink-0 shadow-xs cursor-pointer"
          >
            Apply for Membership
          </button>
        </div>
      </div>
    </div>
  );
};
