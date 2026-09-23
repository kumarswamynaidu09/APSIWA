import React, { useState } from 'react';
import { MembershipApplication } from '../types';
import { ShieldCheck, X, CheckCircle2, Clock, Circle, SearchX } from 'lucide-react';

interface StatusTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  applications: MembershipApplication[];
}

export const StatusTrackerModal: React.FC<StatusTrackerModalProps> = ({
  isOpen,
  onClose,
  applications
}) => {
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState(false);

  if (!isOpen) return null;

  // Search logic
  const matchedApp = query.trim()
    ? applications.find(
        (a) =>
          a.id.toLowerCase() === query.trim().toLowerCase() ||
          a.mobileNumber.replace(/\D/g, '').includes(query.trim().replace(/\D/g, ''))
      )
    : applications[applications.length - 1] || null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#ffffff] rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#e0e3e6] flex flex-col">
        {/* Header */}
        <div className="bg-[#003477] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck size={24} className="text-[#8ef9a0]" />
            <div>
              <h2 className="text-[16px] font-bold">APSIWA Application Tracker</h2>
              <p className="text-[11px] text-[#8ef9a0] font-semibold uppercase">
                Enrolment Verification System
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Query Form */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter Application ID or Mobile Number"
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-[#191c1e] text-[13px] focus:bg-white focus:border-[#003477] focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-[#003477] text-white text-[13px] font-semibold hover:bg-[#024aa3] transition-colors cursor-pointer"
            >
              Verify
            </button>
          </form>

          {/* Results */}
          {matchedApp ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#f7f9fc] border border-[#e0e3e6] space-y-3">
                <div className="flex items-center justify-between border-b border-[#e0e3e6] pb-2">
                  <span className="text-[11px] text-[#434752] uppercase font-bold tracking-wider">
                    Application ID
                  </span>
                  <span className="font-mono font-bold text-[#003477]">{matchedApp.id}</span>
                </div>

                <div className="flex items-center gap-3 pb-2 border-b border-[#e0e3e6]">
                  <div className="w-10 h-12 rounded-lg bg-[#003477] text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden shadow-2xs border border-[#003477]/20">
                    {matchedApp.photoUrl ? (
                      <img src={matchedApp.photoUrl} alt={matchedApp.fullName} className="w-full h-full object-cover" />
                    ) : (
                      matchedApp.fullName.charAt(0)
                    )}
                  </div>
                  <div>
                    <span className="text-[13px] font-extrabold text-[#191c1e] block">{matchedApp.fullName}</span>
                    <span className="text-[11px] text-[#003477] font-semibold block">
                      DOB: {matchedApp.dateOfBirth || 'N/A'} • {matchedApp.district || 'AP'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[12px]">
                  <div>
                    <span className="text-[#737783] block text-[10px] uppercase">Mobile No</span>
                    <span className="font-semibold text-[#191c1e]">+91 {matchedApp.mobileNumber}</span>
                  </div>
                  <div>
                    <span className="text-[#737783] block text-[10px] uppercase">Company</span>
                    <span className="font-semibold text-[#191c1e] truncate block">{matchedApp.companyName || 'Solar Integrator'}</span>
                  </div>
                  <div>
                    <span className="text-[#737783] block text-[10px] uppercase">Email</span>
                    <span className="font-semibold text-[#191c1e] truncate block">{matchedApp.emailAddress}</span>
                  </div>
                  <div>
                    <span className="text-[#737783] block text-[10px] uppercase">Submitted On</span>
                    <span className="font-semibold text-[#191c1e]">{matchedApp.submissionDate}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#e0e3e6] flex items-center justify-between">
                  <span className="text-[12px] text-[#434752]">Verification Status:</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1.5 ${
                    matchedApp.status === 'Active' || matchedApp.status === 'Approved'
                      ? 'bg-[#8bf69d]/30 text-[#006e2e] border border-[#006e2e]/20'
                      : matchedApp.status === 'Inactive'
                        ? 'bg-[#ffdad6] text-[#ba1a1a] border border-[#ba1a1a]/20'
                        : 'bg-[#ffbe3b]/30 text-[#00285e] border border-[#ffbe3b]/30'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${
                      matchedApp.status === 'Active' || matchedApp.status === 'Approved'
                        ? 'bg-[#006e2e] animate-pulse'
                        : matchedApp.status === 'Inactive'
                          ? 'bg-[#ba1a1a]'
                          : 'bg-[#ffbe3b]'
                    }`}></span>
                    {matchedApp.status === 'Approved' ? 'Active' : matchedApp.status}
                  </span>
                </div>
              </div>

              {/* Stepper */}
              <div className="space-y-2 pt-1">
                <p className="text-[11px] text-[#434752] font-semibold uppercase tracking-wider">
                  Accreditation Timeline
                </p>
                <div className="space-y-2 text-[12px]">
                  <div className="flex items-center gap-2.5 text-[#006e2e]">
                    <CheckCircle2 size={16} />
                    <span className="font-medium">1. Application &amp; UPI Remittance Filed</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[#003477]">
                    <Clock size={16} />
                    <span className="font-medium">2. Secretariat Audit &amp; UTR Reconciliation (In Progress)</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[#737783]">
                    <Circle size={16} />
                    <span>3. Executive Council Board Approval</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[#737783]">
                    <Circle size={16} />
                    <span>4. Digital Certificate &amp; Physical ID Card Dispatch</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-[13px] text-[#434752] space-y-2">
              <SearchX size={36} className="text-[#737783] mx-auto" />
              <p>No application found matching your criteria.</p>
              <p className="text-[11px] text-[#737783]">
                Try searching with the exact Application ID (e.g. APSIWA-2026-XXXXX) or registered mobile number.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#f2f4f7] border-t border-[#e0e3e6] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white hover:bg-[#eceef1] text-[#191c1e] text-[13px] font-semibold border border-[#e0e3e6] cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
