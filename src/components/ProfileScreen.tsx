import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, MembershipApplication } from '../types';
import {
  User,
  Mail,
  Phone,
  Building2,
  MapPin,
  FileText,
  CreditCard,
  ShieldCheck,
  ShieldAlert,
  Download,
  Printer,
  CheckCircle2,
  Clock,
  Calendar,
  Sparkles,
  Edit3,
  Save,
  Award,
  AlertCircle,
  Copy,
  ExternalLink,
  ChevronRight,
  Search,
  Lock,
  Unlock,
  KeyRound,
  FileCheck,
  RotateCcw,
  Check,
  Eye
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { calculateValidityDate } from '../lib/supabase';

interface ProfileScreenProps {
  user: UserProfile | null;
  onUpdateUser: (updated: UserProfile) => void;
  applications: MembershipApplication[];
  onNavigateMembership: () => void;
  onOpenAuth?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  user,
  onUpdateUser,
  applications,
  onNavigateMembership
}) => {
  // Search query state for Membership Number (Clean without pre-filled mock data)
  const initialId = user?.membershipId || '';
  const [searchQuery, setSearchQuery] = useState(initialId);
  const [activeSearchedId, setActiveSearchedId] = useState(initialId);

  // Phone verification state for downloading approved card
  const [phoneLast4Input, setPhoneLast4Input] = useState('');
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  // Card view & export states
  const [cardSide, setCardSide] = useState<'front' | 'back' | 'both'>('front');
  const [downloadingFormat, setDownloadingFormat] = useState<'image' | 'pdf' | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [activeTab, setActiveTab] = useState<'card' | 'details' | 'timeline'>('card');

  // References for capturing DOM elements
  const a4DocumentRef = useRef<HTMLDivElement>(null);

  // Find matching application or user profile (Only genuine submitted applications, zero mock data)
  const findMembershipRecord = (queryId: string) => {
    if (!queryId.trim()) return null;
    const cleanQuery = queryId.trim().toLowerCase();

    // 1. Check in real-time submitted applications
    const foundApp = applications.find(
      (app) =>
        (app.id && app.id.toLowerCase() === cleanQuery) ||
        (app.mobileNumber && app.mobileNumber.toLowerCase().includes(cleanQuery))
    );
    if (foundApp) {
      const validUntil = foundApp.validUntil || calculateValidityDate(foundApp.paymentDate || foundApp.submissionDate);
      return {
        id: foundApp.id,
        fullName: foundApp.fullName,
        emailAddress: foundApp.emailAddress,
        mobileNumber: foundApp.mobileNumber,
        dateOfBirth: foundApp.dateOfBirth,
        companyName: foundApp.companyName,
        designation: foundApp.designation || 'Authorized Representative',
        district: foundApp.district || 'Visakhapatnam',
        businessType: foundApp.businessType || 'Solar EPC Enterprise',
        gstNumber: foundApp.gstNumber || '',
        officeAddress: foundApp.officeAddress || 'Visakhapatnam, Andhra Pradesh',
        pincode: foundApp.pincode || '',
        photoUrl: foundApp.photoUrl,
        applicationType: foundApp.applicationType || 'New Member',
        status: foundApp.status || 'Approved',
        submissionDate: foundApp.submissionDate || '2026',
        validUntil,
        amountPaid: foundApp.amountPaid || '₹ 2,000.00',
        utrNumber: foundApp.utrNumber || 'VERIFIED-MEMBER'
      };
    }

    // 2. Check current logged-in user
    if (user && (user.membershipId?.toLowerCase() === cleanQuery || user.phoneNumber?.includes(cleanQuery))) {
      const validUntil = user.validUntil || calculateValidityDate(user.joinedDate);
      return {
        id: user.membershipId || queryId.toUpperCase(),
        fullName: user.name,
        emailAddress: user.email,
        mobileNumber: user.phoneNumber || '',
        dateOfBirth: user.dateOfBirth || '',
        companyName: user.companyName || '',
        designation: user.designation || 'Solar EPC Lead',
        district: user.district || 'Visakhapatnam',
        businessType: user.businessType || 'Solar EPC Enterprise',
        gstNumber: user.gstNumber || '',
        officeAddress: user.address || 'Visakhapatnam, Andhra Pradesh',
        pincode: user.pincode || '',
        photoUrl: user.avatarUrl,
        applicationType: 'New Member' as const,
        status: (user.membershipStatus === 'Active' ? 'Approved' : user.membershipStatus || 'Approved') as any,
        submissionDate: user.joinedDate || '2026',
        validUntil,
        amountPaid: '₹ 2,000.00',
        utrNumber: 'VERIFIED-MEMBER'
      };
    }

    return null;
  };

  const matchedRecord = findMembershipRecord(activeSearchedId);

  // Auto-verify if current user matches the searched ID
  useEffect(() => {
    if (user && matchedRecord && user.membershipId === matchedRecord.id) {
      setIsPhoneVerified(true);
    } else {
      setIsPhoneVerified(false);
      setPhoneLast4Input('');
      setVerificationError('');
      setVerificationSuccess(false);
    }
  }, [activeSearchedId, user]);

  // Handle Search Submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setActiveSearchedId(searchQuery.trim());
    setIsPhoneVerified(false);
    setVerificationError('');
    setVerificationSuccess(false);
  };

  // Handle Last 4 Digits Phone Verification
  const handleVerifyPhone = (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationError('');

    if (!matchedRecord) return;

    const cleanInput = phoneLast4Input.trim().replace(/\D/g, '');

    if (cleanInput.length !== 4) {
      setVerificationError('Please enter exactly 4 digits.');
      return;
    }

    const rawDigits = (matchedRecord.mobileNumber || '').replace(/\D/g, '');
    const clean10 = rawDigits.length >= 10 ? rawDigits.slice(-10) : rawDigits;
    const actualLast4 = clean10.slice(-4);

    if (cleanInput === actualLast4) {
      setIsPhoneVerified(true);
      setVerificationSuccess(true);
      setVerificationError('');
    } else {
      setVerificationError(
        `Incorrect last 4 digits. Please enter the last 4 digits of the mobile number starting with ${first4}.`
      );
    }
  };

  const handleCopyId = () => {
    if (!matchedRecord) return;
    navigator.clipboard.writeText(matchedRecord.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Download Card as High-Resolution PNG Image
  const handleDownloadImage = async () => {
    if (!isPhoneVerified || matchedRecord?.status !== 'Approved') return;
    setDownloadingFormat('image');
    try {
      const targetElement = a4DocumentRef.current;
      if (!targetElement) return;

      const canvas = await html2canvas(targetElement, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      const image = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.href = image;
      link.download = `APSIWA-Membership-Sheet-${matchedRecord.id}.png`;
      link.click();
    } catch (err) {
      console.error('Error generating sheet image:', err);
    } finally {
      setDownloadingFormat(null);
    }
  };

  // Download Card as PDF (A4 Portrait Print Ready)
  const handleDownloadPDF = async () => {
    if (!isPhoneVerified || matchedRecord?.status !== 'Approved') return;
    setDownloadingFormat('pdf');
    try {
      const targetElement = a4DocumentRef.current;
      if (!targetElement) return;

      const canvas = await html2canvas(targetElement, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Fit calculation for standard A4 portrait (210mm x 297mm)
      const margin = 10;
      const printWidth = pageWidth - margin * 2;
      const printHeight = (canvas.height * printWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', margin, margin, printWidth, Math.min(printHeight, pageHeight - margin * 2));

      pdf.save(`APSIWA-Membership-Certificate-${matchedRecord.id}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setDownloadingFormat(null);
    }
  };

  // Direct Browser Print
  const handlePrint = () => {
    if (!isPhoneVerified || matchedRecord?.status !== 'Approved') return;
    window.print();
  };

  // First 4 digits visible, last 4 digits to be entered
  const rawDigits = (matchedRecord?.mobileNumber || '').replace(/\D/g, '');
  const clean10 = rawDigits.length >= 10 ? rawDigits.slice(-10) : rawDigits;
  const first4 = clean10.length >= 4 ? clean10.slice(0, 4) : '••••';
  const last4 = clean10.length >= 4 ? clean10.slice(-4) : '••••';
  const phoneMask = `${first4} •• ••••`;

  return (
    <div className="max-w-7xl mx-auto px-margin py-8 space-y-8 animate-in fade-in duration-300">
      {/* ========================================================================= */}
      {/* 1. HERO & MEMBERSHIP NUMBER SEARCH PORTAL */}
      {/* ========================================================================= */}
      <div className="relative bg-gradient-to-r from-[#00285e] via-[#003477] to-[#024aa3] rounded-3xl p-6 sm:p-10 text-white overflow-hidden shadow-xl border border-[#024aa3]/30">
        {/* Decorative background glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#ffbe3b]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-[#8ef9a0]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#8ef9a0] text-xs font-bold uppercase tracking-wider">
            <ShieldCheck size={14} />
            <span>APSIWA Official Member Verification &amp; ID Portal</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Member Status &amp; Digital Smart ID Card
            </h1>
            <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
              Enter your generated APSIWA Membership Number below to check real-time approval status.
              Approved members can securely unlock and download their official Digital Smart ID card
              by verifying the last 4 digits of their registered phone number.
            </p>
          </div>

          {/* Search Bar Form */}
          <form onSubmit={handleSearchSubmit} className="pt-2">
            <div className="flex flex-col sm:flex-row items-stretch gap-3 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 shadow-lg">
              <div className="relative flex-1 flex items-center">
                <Search className="absolute left-4 text-white/60" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter Membership Number (e.g. APSIWA-2026-10842 or APSIWA-2025-00101)"
                  className="w-full pl-12 pr-4 py-3.5 bg-transparent text-white font-mono font-bold text-sm sm:text-base placeholder-white/50 outline-none"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#ffbe3b] hover:bg-[#fab220] text-[#00285e] font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer active:scale-98"
              >
                <Search size={16} />
                <span>Check Status</span>
              </button>
            </div>
          </form>

          {/* Quick Access for Recent Real Applications (if any) */}
          {applications.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap text-xs text-white/70">
              <span className="font-semibold text-white/90">Recent Submissions:</span>
              {applications.slice(0, 3).map((app) => (
                <button
                  key={app.id}
                  type="button"
                  onClick={() => {
                    setSearchQuery(app.id);
                    setActiveSearchedId(app.id);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-white font-mono text-[11px] font-bold transition-all cursor-pointer border border-white/20"
                >
                  {app.id}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SEARCH RESULTS / RECORD NOT FOUND STATE */}
      {/* ========================================================================= */}
      {!matchedRecord && activeSearchedId.trim() && (
        <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-[#e0e3e6] shadow-sm space-y-5 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-2xl bg-[#ffdad6] text-[#ba1a1a] mx-auto flex items-center justify-center">
            <AlertCircle size={32} />
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-[#191c1e]">No Membership Record Found</h3>
            <p className="text-xs text-[#434752] leading-relaxed">
              We could not find any active application or membership matching ID{' '}
              <span className="font-mono font-bold text-[#ba1a1a]">"{activeSearchedId}"</span>.
              Please double check the generated ID number or register for membership below.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={onNavigateMembership}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#003477] hover:bg-[#024aa3] text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
            >
              <FileCheck size={16} />
              <span>Register / Apply for Membership</span>
            </button>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveSearchedId('');
              }}
              className="px-4 py-2.5 rounded-xl bg-[#f2f4f7] hover:bg-[#e0e3e6] text-[#434752] text-xs font-semibold cursor-pointer"
            >
              Clear Search
            </button>
          </div>
        </div>
      )}

      {/* Initial state when no query active yet */}
      {!matchedRecord && !activeSearchedId.trim() && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-[#e0e3e6] shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#d8e2ff] text-[#003477] flex items-center justify-center font-bold">
              1
            </div>
            <h4 className="font-bold text-sm text-[#191c1e]">Step 1: Enter Membership ID</h4>
            <p className="text-xs text-[#737783] leading-relaxed">
              Type your generated APSIWA Membership Number (received during online registration or offline onboarding).
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-[#e0e3e6] shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#ffbe3b]/20 text-[#00285e] flex items-center justify-center font-bold">
              2
            </div>
            <h4 className="font-bold text-sm text-[#191c1e]">Step 2: Check Approval Status</h4>
            <p className="text-xs text-[#737783] leading-relaxed">
              Instantly view whether your accreditation is Approved, Pending Verification, or In Review with the Secretariat.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-[#e0e3e6] shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#8ef9a0]/30 text-[#006e2e] flex items-center justify-center font-bold">
              3
            </div>
            <h4 className="font-bold text-sm text-[#191c1e]">Step 3: Unlock ID Card</h4>
            <p className="text-xs text-[#737783] leading-relaxed">
              When approved, enter the last 4 digits of your registered phone number to download your official PDF / PNG ID card.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. MATCHED RECORD DISPLAY & STATUS BANNER */}
      {/* ========================================================================= */}
      {matchedRecord && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Member Overview Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#e0e3e6] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-20 rounded-2xl bg-[#003477] text-white flex items-center justify-center font-bold text-xl overflow-hidden shrink-0 shadow-sm border border-[#003477]/20">
                {matchedRecord.photoUrl ? (
                  <img
                    src={matchedRecord.photoUrl}
                    alt={matchedRecord.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  matchedRecord.fullName.charAt(0)
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-lg font-black text-[#191c1e]">{matchedRecord.fullName}</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#d8e2ff] text-[#001a42] border border-[#003477]/20">
                    {matchedRecord.applicationType}
                  </span>
                </div>
                <p className="text-xs font-bold text-[#003477]">{matchedRecord.companyName}</p>
                <div className="flex items-center gap-3 text-xs text-[#737783] flex-wrap">
                  <span className="flex items-center gap-1 font-mono font-bold text-[#003477]">
                    ID: {matchedRecord.id}
                  </span>
                  <span>•</span>
                  <span>DOB: {matchedRecord.dateOfBirth}</span>
                  <span>•</span>
                  <span>{matchedRecord.district}, AP</span>
                </div>
              </div>
            </div>

            {/* Status Pill on Right */}
            <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
              <span className="text-[11px] font-bold text-[#737783] uppercase tracking-wider">
                Accreditation Status
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black shadow-2xs ${
                  matchedRecord.status === 'Approved'
                    ? 'bg-[#8ef9a0]/30 text-[#006e2e] border border-[#006e2e]/30'
                    : matchedRecord.status === 'In Review'
                    ? 'bg-[#d8e2ff] text-[#001a42] border border-[#003477]/20'
                    : 'bg-[#ffbe3b]/25 text-[#00285e] border border-[#ffbe3b]/40'
                }`}
              >
                {matchedRecord.status === 'Approved' ? (
                  <CheckCircle2 size={15} />
                ) : (
                  <Clock size={15} />
                )}
                <span>{matchedRecord.status}</span>
              </span>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* 4. STATUS NOTICES: IF NOT APPROVED (PENDING OR IN REVIEW) */}
          {/* ===================================================================== */}
          {matchedRecord.status !== 'Approved' && (
            <div className="bg-gradient-to-br from-[#fff8e1] to-[#ffecb3]/40 rounded-3xl p-6 sm:p-8 border border-[#ffbe3b]/60 shadow-xs space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#ffbe3b] text-[#00285e] flex items-center justify-center shrink-0 shadow-sm">
                  <Clock size={24} />
                </div>
                <div className="space-y-1.5 flex-1">
                  <h3 className="text-base font-extrabold text-[#00285e]">
                    Membership Status: {matchedRecord.status}
                  </h3>
                  <p className="text-xs text-[#434752] leading-relaxed">
                    Your membership application is currently queued for institutional verification by the
                    APSIWA Secretariat. Payment transactions (UTR / Bank receipts) and enterprise
                    credentials are being reviewed.
                  </p>
                  <p className="text-xs font-bold text-[#003477]">
                    🔒 The official Digital Smart ID Card download will automatically unlock as soon as the
                    Secretariat verifies and approves your record.
                  </p>
                </div>
              </div>

              {/* Secretariat Contact Notice */}
              <div className="pt-4 border-t border-[#ffbe3b]/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#00285e]">
                <span>
                  Submitted on:{' '}
                  <strong className="font-mono">{matchedRecord.submissionDate}</strong> | Visakhapatnam Secretariat
                </span>
                <span className="font-semibold">
                  Support Email:{' '}
                  <a href="mailto:apsiwa2018@gmail.com" className="underline font-bold text-[#003477]">
                    apsiwa2018@gmail.com
                  </a>
                </span>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* 5. IF APPROVED: PHONE VERIFICATION GATE (LAST 4 DIGITS) */}
          {/* ===================================================================== */}
          {matchedRecord.status === 'Approved' && !isPhoneVerified && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#003477]/20 shadow-md space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#003477] text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Lock size={22} />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#003477]">
                    Security Gate &amp; Credential Protection
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-[#191c1e]">
                    Enter Last 4 Digits of Phone Number to Unlock ID Card
                  </h3>
                  <p className="text-xs text-[#737783] leading-relaxed">
                    To prevent unauthorized downloads of official APSIWA credentials, please verify the
                    last 4 digits of the registered mobile number for{' '}
                    <strong className="text-[#191c1e]">{matchedRecord.fullName}</strong>.
                  </p>
                </div>
              </div>

              <form onSubmit={handleVerifyPhone} className="max-w-md space-y-4">
                {/* Visual Phone Number Display with First 4 Digits Visible */}
                <div className="p-4 rounded-2xl bg-[#f7f9fc] border border-[#e0e3e6] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#191c1e]">Registered Phone Number:</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#d8e2ff] text-[#001a42] text-[10.5px] font-extrabold">
                      First 4 Digits Visible
                    </span>
                  </div>
                  <div className="font-mono text-base font-extrabold text-[#003477] tracking-wider flex items-center gap-2">
                    <span className="bg-white px-2.5 py-1 rounded-lg border border-[#003477]/30 text-[#003477] shadow-2xs">
                      {first4}
                    </span>
                    <span className="text-[#737783] font-bold">• •</span>
                    <span className="bg-[#ffdad6]/60 text-[#ba1a1a] px-2.5 py-1 rounded-lg border border-[#ba1a1a]/30">
                      [ _ _ _ _ ]
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#191c1e] mb-1.5">
                    Enter the Last 4 Digits of Mobile Number ({first4} •• <span className="text-[#006e2e] font-mono">____</span>) *
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <KeyRound className="absolute left-3.5 top-3 text-[#737783]" size={16} />
                      <input
                        type="password"
                        maxLength={4}
                        pattern="[0-9]*"
                        inputMode="numeric"
                        value={phoneLast4Input}
                        onChange={(e) => setPhoneLast4Input(e.target.value.replace(/\D/g, ''))}
                        placeholder="••••"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] font-mono text-center font-black tracking-widest text-lg outline-none focus:bg-white focus:border-[#003477]"
                      />
                    </div>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#006e2e] hover:bg-[#005322] text-white text-xs font-bold shadow-md transition-all cursor-pointer active:scale-98"
                    >
                      <Unlock size={15} />
                      <span>Unlock ID Card</span>
                    </button>
                  </div>
                </div>

                {verificationError && (
                  <div className="p-3 rounded-xl bg-[#ffdad6] text-[#ba1a1a] text-xs font-medium flex items-center gap-2">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{verificationError}</span>
                  </div>
                )}
              </form>
            </div>
          )}

          {/* ===================================================================== */}
          {/* 6. FULL UNLOCKED STATE: A4 MEMBERSHIP SHEET & DOWNLOAD OPTIONS */}
          {/* ===================================================================== */}
          {matchedRecord.status === 'Approved' && isPhoneVerified && (
            <div className="space-y-6 animate-in zoom-in-95 duration-200">
              {/* Unlocked banner & Export Controls */}
              <div className="bg-[#e8f5e9] border border-[#006e2e]/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-xs">
                <div className="flex items-center gap-2 text-[#004d1c] font-bold">
                  <ShieldCheck size={18} className="text-[#006e2e]" />
                  <span>
                    Official A4 Membership Certificate &amp; Detachable ID Card Ready
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  <button
                    type="button"
                    onClick={handleDownloadPDF}
                    disabled={downloadingFormat !== null}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#006e2e] hover:bg-[#005322] text-white font-bold text-xs shadow-xs cursor-pointer active:scale-98 disabled:opacity-70"
                  >
                    <FileText size={14} />
                    <span>{downloadingFormat === 'pdf' ? 'Generating PDF...' : 'Download PDF (A4 Sheet)'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadImage}
                    disabled={downloadingFormat !== null}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#003477] hover:bg-[#024aa3] text-white font-bold text-xs shadow-xs cursor-pointer active:scale-98 disabled:opacity-70"
                  >
                    <Download size={14} />
                    <span>{downloadingFormat === 'image' ? 'Exporting...' : 'Download Image'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="p-2 rounded-xl bg-white border border-[#e0e3e6] text-[#003477] hover:bg-[#f2f4f7] cursor-pointer"
                    title="Print Document"
                  >
                    <Printer size={16} />
                  </button>
                </div>
              </div>

              {/* =============================================================== */}
              {/* OFFICIAL A4 MEMBERSHIP CERTIFICATE SHEET (75% DETAILS + 25% CARD) */}
              {/* =============================================================== */}
              <div className="flex justify-center py-2">
                <div
                  ref={a4DocumentRef}
                  className="w-full max-w-[760px] bg-white rounded-2xl border-2 border-[#cbd5e1] shadow-xl p-6 sm:p-9 font-sans text-[#1e293b] space-y-5 print:shadow-none print:border-none"
                >
                  {/* =========================================================== */}
                  {/* TOP 75%: OFFICIAL CERTIFICATE & ACCREDITATION DOSSIER */}
                  {/* =========================================================== */}
                  <div className="space-y-4">
                    {/* Official Letterhead Header */}
                    <div className="flex items-center justify-between pb-3.5 border-b-[2.5px] border-[#003477] gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src="/logo.png"
                          alt="APSIWA"
                          className="h-14 w-auto object-contain bg-white rounded-lg p-1 border border-[#003477]/20 shadow-2xs"
                        />
                        <div>
                          <span className="inline-block bg-[#ffbe3b] text-[#00285e] text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-sm">
                            Govt. Recognized State Solar Welfare Body
                          </span>
                          <h2 className="text-base sm:text-lg font-black text-[#003477] uppercase tracking-tight leading-tight mt-0.5">
                            Andhra Pradesh Solar Integrators Welfare Association
                          </h2>
                          <p className="text-[10px] text-[#475569] font-semibold">
                            State Secretariat: Visakhapatnam &bull; CPDCL / EPDCL Regulatory Liaison Body &bull; www.apsiwa.in
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0 hidden sm:block">
                        <div className="px-3 py-1.5 rounded-lg border-2 border-[#006e2e] bg-[#f0fdf4] text-center">
                          <span className="text-[8px] font-black text-[#006e2e] uppercase block">ACCREDITATION</span>
                          <span className="text-[11px] font-black text-[#003477]">LIFE MEMBER</span>
                        </div>
                      </div>
                    </div>

                    {/* Meta Reference Bar */}
                    <div className="grid grid-cols-3 gap-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-3 text-xs">
                      <div>
                        <span className="text-[9.5px] font-bold text-[#64748b] uppercase block">MEMBERSHIP NUMBER</span>
                        <span className="font-mono font-black text-[#003477] text-sm sm:text-base">
                          {matchedRecord.id}
                        </span>
                      </div>
                      <div className="text-center">
                        <span className="text-[9.5px] font-bold text-[#64748b] uppercase block">ADMISSION STATUS</span>
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10.5px] font-black bg-[#dcfce7] text-[#006e2e] border border-[#86efac]">
                          &bull; APPROVED &amp; ACTIVE
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9.5px] font-bold text-[#64748b] uppercase block">VALIDITY PERIOD</span>
                        <span className="font-mono font-black text-[#006e2e] text-xs sm:text-sm">
                          {matchedRecord.validUntil}
                        </span>
                      </div>
                    </div>

                    {/* Formal Certificate Declaration */}
                    <div className="text-xs text-[#334155] leading-relaxed space-y-1">
                      <p className="font-semibold text-[#1e293b]">
                        This official certificate confirms that the applicant enterprise and authorized representative detailed below are verified and accredited as an active institutional member of the <strong>Andhra Pradesh Solar Integrators Welfare Association (APSIWA)</strong>.
                      </p>
                    </div>

                    {/* Two-Column Details Breakdown */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                      {/* Section 1: Representative Profile */}
                      <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-3.5 space-y-2">
                        <h4 className="font-black text-[11px] text-[#003477] uppercase tracking-wide border-b border-[#e2e8f0] pb-1.5 flex items-center justify-between">
                          <span>1. Representative Profile</span>
                          <span className="text-[9px] text-[#006e2e] font-extrabold">VERIFIED</span>
                        </h4>
                        <table className="w-full text-left text-[11px] border-collapse">
                          <tbody>
                            <tr>
                              <td className="py-1 text-[#64748b] w-24">Full Name:</td>
                              <td className="py-1 font-extrabold text-[#0f172a]">{matchedRecord.fullName}</td>
                            </tr>
                            <tr>
                              <td className="py-1 text-[#64748b]">Designation:</td>
                              <td className="py-1 font-bold text-[#0f172a]">{matchedRecord.designation}</td>
                            </tr>
                            <tr>
                              <td className="py-1 text-[#64748b]">Date of Birth:</td>
                              <td className="py-1 font-bold text-[#0f172a] font-mono">{matchedRecord.dateOfBirth}</td>
                            </tr>
                            <tr>
                              <td className="py-1 text-[#64748b]">Mobile No:</td>
                              <td className="py-1 font-bold text-[#0f172a] font-mono">{matchedRecord.mobileNumber}</td>
                            </tr>
                            <tr>
                              <td className="py-1 text-[#64748b]">Email ID:</td>
                              <td className="py-1 font-bold text-[#003477] truncate">{matchedRecord.emailAddress}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* Section 2: Enterprise Credentials */}
                      <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-3.5 space-y-2">
                        <h4 className="font-black text-[11px] text-[#003477] uppercase tracking-wide border-b border-[#e2e8f0] pb-1.5 flex items-center justify-between">
                          <span>2. Enterprise Credentials</span>
                          <span className="text-[9px] text-[#003477] font-extrabold">STATE TIER-1</span>
                        </h4>
                        <table className="w-full text-left text-[11px] border-collapse">
                          <tbody>
                            <tr>
                              <td className="py-1 text-[#64748b] w-24">Firm Name:</td>
                              <td className="py-1 font-extrabold text-[#003477]">{matchedRecord.companyName}</td>
                            </tr>
                            <tr>
                              <td className="py-1 text-[#64748b]">Business Type:</td>
                              <td className="py-1 font-bold text-[#0f172a]">{matchedRecord.businessType}</td>
                            </tr>
                            <tr>
                              <td className="py-1 text-[#64748b]">District / State:</td>
                              <td className="py-1 font-bold text-[#0f172a]">{matchedRecord.district}, AP</td>
                            </tr>
                            <tr>
                              <td className="py-1 text-[#64748b]">GSTIN:</td>
                              <td className="py-1 font-bold text-[#0f172a] font-mono">{matchedRecord.gstNumber || 'N/A'}</td>
                            </tr>
                            <tr>
                              <td className="py-1 text-[#64748b]">Office Address:</td>
                              <td className="py-1 font-medium text-[#0f172a] leading-tight">
                                {matchedRecord.officeAddress} {matchedRecord.pincode ? `- ${matchedRecord.pincode}` : ''}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Secretariat Seal & Signatures Bar */}
                    <div className="pt-2 border-t border-[#e2e8f0] flex items-center justify-between text-[10.5px] text-[#64748b]">
                      <div>
                        <span>Issued by: <strong>APSIWA Secretariat, Visakhapatnam</strong></span><br />
                        <span>Admission Date: <strong>{matchedRecord.submissionDate}</strong> | ID: <strong className="font-mono text-[#003477]">{matchedRecord.id}</strong></span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-center border-2 border-[#003477] rounded-lg px-3 py-1 bg-[#f0fdf4]">
                          <span className="text-[8px] font-black text-[#006e2e] uppercase block">OFFICIAL SEAL</span>
                          <span className="text-[10px] font-black text-[#003477]">APSIWA 2026</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* =========================================================== */}
                  {/* SCISSOR CUT LINE (DELIMITER BETWEEN 75% SHEET & 25% CARD) */}
                  {/* =========================================================== */}
                  <div className="py-1.5 px-4 bg-[#f1f5f9] text-center border-y-2 border-dashed border-[#94a3b8] rounded-md">
                    <span className="text-[10.5px] sm:text-xs font-black uppercase text-[#475569] tracking-wider">
                      &#9986; - - - - - - - - Cut Along Dotted Line To Detach Membership ID Card - - - - - - - - &#9986;
                    </span>
                  </div>

                  {/* =========================================================== */}
                  {/* BOTTOM 25%: DETACHABLE WALLET-SIZED FRONT ID CARD (NO QR) */}
                  {/* =========================================================== */}
                  <div className="pt-1 flex justify-center">
                    <div className="w-full max-w-[530px] h-[190px] rounded-xl bg-gradient-to-r from-[#001d4a] via-[#003477] to-[#00285e] border-2 border-[#ffbe3b] shadow-lg text-white overflow-hidden flex flex-col justify-between">
                      {/* Card Header */}
                      <div className="bg-[#002255] px-3.5 py-1.5 border-b border-[#ffbe3b] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src="/logo.png"
                            alt="APSIWA"
                            className="h-6 w-auto object-contain bg-white rounded-sm p-0.5"
                          />
                          <div>
                            <span className="text-xs font-black tracking-tight leading-none block">
                              APSIWA
                            </span>
                            <span className="text-[7px] uppercase font-bold text-[#8ef9a0] tracking-wider block">
                              Andhra Pradesh Solar Integrators Welfare Association
                            </span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-[#ffbe3b] text-[#00285e] text-[8px] font-black uppercase">
                          MEMBER ID CARD (FRONT)
                        </span>
                      </div>

                      {/* Card Body (NO QR CODE) */}
                      <div className="px-3.5 py-2 flex items-center gap-3">
                        {/* Member Photo */}
                        <div className="flex flex-col items-center gap-1 shrink-0">
                          <div className="w-16 h-20 rounded-md bg-[#f2f4f7] border-2 border-[#ffffff] overflow-hidden flex items-center justify-center shadow-inner">
                            {matchedRecord.photoUrl ? (
                              <img
                                src={matchedRecord.photoUrl}
                                alt={matchedRecord.fullName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-[#003477] to-[#024aa3] text-white flex items-center justify-center font-bold text-xl">
                                {matchedRecord.fullName.charAt(0)}
                              </div>
                            )}
                          </div>
                          <span className="text-[7px] font-black text-[#8ef9a0] uppercase tracking-wider">
                            &bull; VERIFIED
                          </span>
                        </div>

                        {/* Member Details */}
                        <div className="flex-1 min-w-0 space-y-1 text-left">
                          <div>
                            <h3 className="text-sm font-black text-white leading-tight truncate uppercase">
                              {matchedRecord.fullName}
                            </h3>
                            <p className="text-[10px] font-bold text-[#ffbe3b] truncate">
                              {matchedRecord.designation} &bull; {matchedRecord.companyName}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 pt-1 text-[9px] border-t border-white/20">
                            <div>
                              <span className="text-white/60 block text-[7.5px]">ID NUMBER:</span>
                              <span className="font-mono font-black text-[#ffbe3b]">{matchedRecord.id}</span>
                            </div>
                            <div>
                              <span className="text-white/60 block text-[7.5px]">DOB:</span>
                              <span className="font-mono font-bold text-white">{matchedRecord.dateOfBirth}</span>
                            </div>
                            <div>
                              <span className="text-white/60 block text-[7.5px]">DISTRICT:</span>
                              <span className="font-bold text-white truncate block">{matchedRecord.district}</span>
                            </div>
                            <div>
                              <span className="text-white/60 block text-[7.5px]">VALID TILL:</span>
                              <span className="font-mono font-black text-[#8ef9a0]">{matchedRecord.validUntil}</span>
                            </div>
                          </div>
                        </div>

                        {/* Official Gold Seal (Replaces QR) */}
                        <div className="shrink-0 flex flex-col items-center justify-center">
                          <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#ffbe3b] via-[#fab220] to-[#ffd782] flex items-center justify-center shadow-md border-2 border-[#ffffff] text-[6.5px] font-black text-[#00285e] text-center leading-tight">
                            APSIWA<br />SEAL
                          </div>
                        </div>
                      </div>

                      {/* Card Footer Bar */}
                      <div className="bg-[#00193d] px-3.5 py-1 border-t border-white/15 flex items-center justify-between text-[7.5px] text-[#cbd5e1]">
                        <span>Govt. Recognized State Solar Association &bull; Andhra Pradesh</span>
                        <span className="font-bold text-[#8ef9a0]">Authorized Bearer Credential</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
