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
  QrCode,
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
  const cardFrontRef = useRef<HTMLDivElement>(null);
  const cardBackRef = useRef<HTMLDivElement>(null);
  const cardBothRef = useRef<HTMLDivElement>(null);

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
      const targetElement =
        cardSide === 'both'
          ? cardBothRef.current
          : cardSide === 'front'
          ? cardFrontRef.current
          : cardBackRef.current;
      if (!targetElement) return;

      const canvas = await html2canvas(targetElement, {
        scale: 3,
        useCORS: true,
        backgroundColor: null,
        logging: false
      });

      const image = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.href = image;
      link.download = `APSIWA-ID-CARD-${matchedRecord.id}-${cardSide}.png`;
      link.click();
    } catch (err) {
      console.error('Error generating card image:', err);
    } finally {
      setDownloadingFormat(null);
    }
  };

  // Download Card as PDF (A4 Print Ready)
  const handleDownloadPDF = async () => {
    if (!isPhoneVerified || matchedRecord?.status !== 'Approved') return;
    setDownloadingFormat('pdf');
    try {
      const targetElement = cardBothRef.current || cardFrontRef.current;
      if (!targetElement) return;

      const canvas = await html2canvas(targetElement, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // APSIWA Header title in PDF
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.setTextColor(0, 52, 119);
      pdf.text(
        'ANDHRA PRADESH SOLAR INTEGRATORS WELFARE ASSOCIATION (APSIWA)',
        pageWidth / 2,
        15,
        { align: 'center' }
      );

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(67, 71, 82);
      pdf.text(
        `Official Institutional Member Identity Card | Issued: ${matchedRecord.submissionDate} | ID: ${matchedRecord.id}`,
        pageWidth / 2,
        22,
        { align: 'center' }
      );

      // Fit calculation
      const imgWidth = 220;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const posX = (pageWidth - imgWidth) / 2;
      const posY = 30;

      pdf.addImage(imgData, 'PNG', posX, posY, imgWidth, Math.min(imgHeight, pageHeight - 45));

      // PDF Footer note
      pdf.setFontSize(8);
      pdf.setTextColor(115, 119, 131);
      pdf.text(
        'This is an official digitally generated membership credential verified by APSIWA Secretariat, Visakhapatnam.',
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );

      pdf.save(`APSIWA-Membership-Card-${matchedRecord.id}.pdf`);
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
          {/* 6. FULL UNLOCKED STATE: DIGITAL SMART ID CARD & DOWNLOAD OPTIONS */}
          {/* ===================================================================== */}
          {matchedRecord.status === 'Approved' && isPhoneVerified && (
            <div className="space-y-6 animate-in zoom-in-95 duration-200">
              {/* Unlocked banner */}
              <div className="bg-[#e8f5e9] border border-[#006e2e]/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-[#004d1c] font-bold">
                  <ShieldCheck size={18} className="text-[#006e2e]" />
                  <span>
                    Authenticated Bearer Verified — Official Digital Smart ID Card Ready for Download
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadImage}
                    disabled={downloadingFormat !== null}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#003477] hover:bg-[#024aa3] text-white font-bold text-xs shadow-xs cursor-pointer active:scale-98 disabled:opacity-70"
                  >
                    <Download size={14} />
                    <span>{downloadingFormat === 'image' ? 'Exporting...' : 'Download Image'}</span>
                  </button>
                  <button
                    onClick={handleDownloadPDF}
                    disabled={downloadingFormat !== null}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#006e2e] hover:bg-[#005322] text-white font-bold text-xs shadow-xs cursor-pointer active:scale-98 disabled:opacity-70"
                  >
                    <FileText size={14} />
                    <span>{downloadingFormat === 'pdf' ? 'Generating PDF...' : 'Download PDF (A4)'}</span>
                  </button>
                  <button
                    onClick={handlePrint}
                    className="p-2 rounded-xl bg-white border border-[#e0e3e6] text-[#003477] hover:bg-[#f2f4f7] cursor-pointer"
                    title="Print ID Card"
                  >
                    <Printer size={16} />
                  </button>
                </div>
              </div>

              {/* Side Switcher Toolbar */}
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setCardSide('front')}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    cardSide === 'front'
                      ? 'bg-[#003477] text-white shadow-xs'
                      : 'bg-white text-[#434752] border border-[#e0e3e6] hover:bg-[#f2f4f7]'
                  }`}
                >
                  Front Side
                </button>
                <button
                  type="button"
                  onClick={() => setCardSide('back')}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    cardSide === 'back'
                      ? 'bg-[#003477] text-white shadow-xs'
                      : 'bg-white text-[#434752] border border-[#e0e3e6] hover:bg-[#f2f4f7]'
                  }`}
                >
                  Back Side
                </button>
                <button
                  type="button"
                  onClick={() => setCardSide('both')}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    cardSide === 'both'
                      ? 'bg-[#003477] text-white shadow-xs'
                      : 'bg-white text-[#434752] border border-[#e0e3e6] hover:bg-[#f2f4f7]'
                  }`}
                >
                  Side-by-Side View
                </button>
              </div>

              {/* =============================================================== */}
              {/* THE OFFICIAL DIGITAL SMART ID CARD CONTAINERS */}
              {/* =============================================================== */}
              <div className="flex flex-col items-center justify-center gap-8 py-4">
                {/* Hidden container for rendering BOTH sides when exporting PDF or both-mode */}
                <div
                  ref={cardBothRef}
                  className={`flex flex-col lg:flex-row items-center justify-center gap-8 p-4 bg-transparent ${
                    cardSide === 'both' ? 'flex' : 'hidden'
                  }`}
                >
                  {/* FRONT CARD (BOTH MODE) */}
                  <div className="w-[440px] sm:w-[480px] h-[290px] rounded-2xl bg-white border-2 border-[#003477] shadow-xl overflow-hidden flex flex-col relative text-[#191c1e]">
                    {/* Header Strip */}
                    <div className="bg-[#003477] text-white px-4 py-2.5 flex items-center justify-between border-b-2 border-[#ffbe3b]">
                      <div className="flex items-center gap-2.5">
                        <img
                          src="/logo.png"
                          alt="APSIWA"
                          className="h-9 w-auto object-contain bg-white rounded-md p-0.5"
                        />
                        <div>
                          <span className="text-[13px] font-extrabold tracking-tight block leading-tight">
                            APSIWA
                          </span>
                          <span className="text-[7.5px] uppercase font-semibold text-[#8ef9a0] tracking-wider block">
                            Andhra Pradesh Solar Integrators Welfare Association
                          </span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-[#ffbe3b] text-[#00285e] text-[9px] font-extrabold uppercase">
                        MEMBER ID
                      </span>
                    </div>

                    {/* Card Body */}
                    <div className="flex-1 p-3.5 flex gap-3.5 items-center relative">
                      {/* Member Photo */}
                      <div className="flex flex-col items-center gap-1 shrink-0">
                        <div className="w-20 h-24 rounded-lg bg-[#f2f4f7] border-2 border-[#003477] overflow-hidden flex items-center justify-center shadow-inner">
                          {matchedRecord.photoUrl ? (
                            <img
                              src={matchedRecord.photoUrl}
                              alt={matchedRecord.fullName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[#003477] to-[#024aa3] text-white flex items-center justify-center font-bold text-2xl">
                              {matchedRecord.fullName.charAt(0)}
                            </div>
                          )}
                        </div>
                        <span className="text-[8px] font-bold text-[#006e2e] uppercase tracking-wider bg-[#8ef9a0]/20 px-1.5 py-0.5 rounded">
                          VERIFIED
                        </span>
                      </div>

                      {/* Member Information */}
                      <div className="flex-1 min-w-0 space-y-1 text-left">
                        <div>
                          <h3 className="text-[14px] font-extrabold text-[#003477] leading-tight truncate">
                            {matchedRecord.fullName}
                          </h3>
                          <p className="text-[10px] font-semibold text-[#434752] truncate">
                            {matchedRecord.designation}
                          </p>
                          <p className="text-[9.5px] font-bold text-[#191c1e] truncate">
                            {matchedRecord.companyName}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-x-2 gap-y-1 pt-1 text-[8.5px] border-t border-[#e0e3e6]">
                          <div>
                            <span className="text-[#737783] block text-[7.5px]">ID NO:</span>
                            <span className="font-bold text-[#003477] font-mono">
                              {matchedRecord.id}
                            </span>
                          </div>
                          <div>
                            <span className="text-[#737783] block text-[7.5px]">DOB:</span>
                            <span className="font-bold text-[#191c1e] font-mono">
                              {matchedRecord.dateOfBirth}
                            </span>
                          </div>
                          <div>
                            <span className="text-[#737783] block text-[7.5px]">DISTRICT:</span>
                            <span className="font-bold text-[#191c1e] truncate block">
                              {matchedRecord.district}
                            </span>
                          </div>
                          <div>
                            <span className="text-[#737783] block text-[7.5px]">VALID TILL:</span>
                            <span className="font-bold text-[#006e2e]">{matchedRecord.validUntil}</span>
                          </div>
                        </div>
                      </div>

                      {/* QR Code & Hologram */}
                      <div className="flex flex-col items-center justify-between h-full py-1 shrink-0">
                        <div className="w-14 h-14 p-1 bg-white border border-[#003477] rounded flex items-center justify-center shadow-xs">
                          <QrCode size={48} className="text-[#003477]" />
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#ffbe3b] via-[#fab220] to-[#ffd782] flex items-center justify-center shadow-md border border-[#ffffff] text-[6.5px] font-extrabold text-[#00285e] text-center leading-tight">
                          APSIWA
                          <br />
                          SEAL
                        </div>
                      </div>
                    </div>

                    {/* Footer Bar */}
                    <div className="bg-[#f2f4f7] px-4 py-1.5 border-t border-[#e0e3e6] flex items-center justify-between text-[8px] text-[#434752]">
                      <span className="font-semibold">Govt. Recognized State Solar Association</span>
                      <div className="flex items-center gap-3">
                        <span>Authorized Signatory</span>
                        <span className="font-mono font-bold text-[#003477]">AP-SOLAR-2026</span>
                      </div>
                    </div>
                  </div>

                  {/* BACK CARD (BOTH MODE) */}
                  <div className="w-[440px] sm:w-[480px] h-[290px] rounded-2xl bg-white border-2 border-[#003477] shadow-xl overflow-hidden flex flex-col justify-between text-[#191c1e]">
                    {/* Back Header */}
                    <div className="bg-[#003477] text-white px-4 py-2 border-b-2 border-[#ffbe3b] flex items-center justify-between text-[11px] font-bold">
                      <span>TERMS &amp; ASSOCIATION CONTACT</span>
                      <span className="text-[#ffbe3b]">www.apsiwa.in</span>
                    </div>

                    {/* Back Body Terms */}
                    <div className="p-3.5 text-[8.5px] text-[#434752] space-y-1.5 leading-relaxed">
                      <p className="font-bold text-[#003477] text-[9.5px]">APSIWA Institutional Terms:</p>
                      <ul className="list-disc pl-3 space-y-0.5">
                        <li>
                          This card certifies the bearer as a registered member of APSIWA for AP State Solar
                          projects.
                        </li>
                        <li>
                          Membership is valid for 1 year from the payment date (Valid until: {matchedRecord.validUntil}).
                        </li>
                        <li>
                          Cardholder adheres to official DISCOM &amp; NREDCAP technical &amp; safety standards.
                        </li>
                        <li>Non-transferable. Loss of card must be reported to the Secretariat immediately.</li>
                      </ul>

                      <div className="pt-2 border-t border-[#e0e3e6] grid grid-cols-2 gap-2 text-[8px]">
                        <div>
                          <span className="font-bold text-[#191c1e] block">State Secretariat:</span>
                          <span>Association Secretariat, Visakhapatnam, Andhra Pradesh, India</span>
                        </div>
                        <div>
                          <span className="font-bold text-[#191c1e] block">Official Contact:</span>
                          <span>apsiwa2018@gmail.com | +91 866 248 9000</span>
                        </div>
                      </div>
                    </div>

                    {/* Back Barcode Strip */}
                    <div className="bg-[#f2f4f7] px-4 py-2 border-t border-[#e0e3e6] flex items-center justify-between text-[8px]">
                      <div className="space-x-1 font-mono tracking-widest text-[#003477] font-bold text-[10px]">
                        ||| | |||| || ||||| |||| || |||
                      </div>
                      <span className="text-[7.5px] text-[#737783]">Security ID: 98402840-APSIWA</span>
                    </div>
                  </div>
                </div>

                {/* SINGLE SIDE DISPLAY: FRONT ONLY */}
                {cardSide === 'front' && (
                  <div
                    ref={cardFrontRef}
                    className="w-[440px] sm:w-[480px] h-[290px] rounded-2xl bg-white border-2 border-[#003477] shadow-xl overflow-hidden flex flex-col relative text-[#191c1e] animate-in zoom-in-95 duration-200"
                  >
                    {/* Header Strip */}
                    <div className="bg-[#003477] text-white px-4 py-2.5 flex items-center justify-between border-b-2 border-[#ffbe3b]">
                      <div className="flex items-center gap-2.5">
                        <img
                          src="/logo.png"
                          alt="APSIWA"
                          className="h-9 w-auto object-contain bg-white rounded-md p-0.5"
                        />
                        <div>
                          <span className="text-[13px] font-extrabold tracking-tight block leading-tight">
                            APSIWA
                          </span>
                          <span className="text-[7.5px] uppercase font-semibold text-[#8ef9a0] tracking-wider block">
                            Andhra Pradesh Solar Integrators Welfare Association
                          </span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-[#ffbe3b] text-[#00285e] text-[9px] font-extrabold uppercase">
                        MEMBER ID
                      </span>
                    </div>

                    {/* Card Body */}
                    <div className="flex-1 p-3.5 flex gap-3.5 items-center relative">
                      {/* Member Photo */}
                      <div className="flex flex-col items-center gap-1 shrink-0">
                        <div className="w-20 h-24 rounded-lg bg-[#f2f4f7] border-2 border-[#003477] overflow-hidden flex items-center justify-center shadow-inner">
                          {matchedRecord.photoUrl ? (
                            <img
                              src={matchedRecord.photoUrl}
                              alt={matchedRecord.fullName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[#003477] to-[#024aa3] text-white flex items-center justify-center font-bold text-2xl">
                              {matchedRecord.fullName.charAt(0)}
                            </div>
                          )}
                        </div>
                        <span className="text-[8px] font-bold text-[#006e2e] uppercase tracking-wider bg-[#8ef9a0]/20 px-1.5 py-0.5 rounded">
                          VERIFIED
                        </span>
                      </div>

                      {/* Member Information */}
                      <div className="flex-1 min-w-0 space-y-1 text-left">
                        <div>
                          <h3 className="text-[14px] font-extrabold text-[#003477] leading-tight truncate">
                            {matchedRecord.fullName}
                          </h3>
                          <p className="text-[10px] font-semibold text-[#434752] truncate">
                            {matchedRecord.designation}
                          </p>
                          <p className="text-[9.5px] font-bold text-[#191c1e] truncate">
                            {matchedRecord.companyName}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-x-2 gap-y-1 pt-1 text-[8.5px] border-t border-[#e0e3e6]">
                          <div>
                            <span className="text-[#737783] block text-[7.5px]">ID NO:</span>
                            <span className="font-bold text-[#003477] font-mono">
                              {matchedRecord.id}
                            </span>
                          </div>
                          <div>
                            <span className="text-[#737783] block text-[7.5px]">DOB:</span>
                            <span className="font-bold text-[#191c1e] font-mono">
                              {matchedRecord.dateOfBirth}
                            </span>
                          </div>
                          <div>
                            <span className="text-[#737783] block text-[7.5px]">DISTRICT:</span>
                            <span className="font-bold text-[#191c1e] truncate block">
                              {matchedRecord.district}
                            </span>
                          </div>
                          <div>
                            <span className="text-[#737783] block text-[7.5px]">VALID TILL:</span>
                            <span className="font-bold text-[#006e2e]">{matchedRecord.validUntil}</span>
                          </div>
                        </div>
                      </div>

                      {/* QR Code & Hologram */}
                      <div className="flex flex-col items-center justify-between h-full py-1 shrink-0">
                        <div className="w-14 h-14 p-1 bg-white border border-[#003477] rounded flex items-center justify-center shadow-xs">
                          <QrCode size={48} className="text-[#003477]" />
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#ffbe3b] via-[#fab220] to-[#ffd782] flex items-center justify-center shadow-md border border-[#ffffff] text-[6.5px] font-extrabold text-[#00285e] text-center leading-tight">
                          APSIWA
                          <br />
                          SEAL
                        </div>
                      </div>
                    </div>

                    {/* Footer Bar */}
                    <div className="bg-[#f2f4f7] px-4 py-1.5 border-t border-[#e0e3e6] flex items-center justify-between text-[8px] text-[#434752]">
                      <span className="font-semibold">Govt. Recognized State Solar Association</span>
                      <div className="flex items-center gap-3">
                        <span>Authorized Signatory</span>
                        <span className="font-mono font-bold text-[#003477]">AP-SOLAR-2026</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* SINGLE SIDE DISPLAY: BACK ONLY */}
                {cardSide === 'back' && (
                  <div
                    ref={cardBackRef}
                    className="w-[440px] sm:w-[480px] h-[290px] rounded-2xl bg-white border-2 border-[#003477] shadow-xl overflow-hidden flex flex-col justify-between text-[#191c1e] animate-in zoom-in-95 duration-200"
                  >
                    {/* Back Header */}
                    <div className="bg-[#003477] text-white px-4 py-2 border-b-2 border-[#ffbe3b] flex items-center justify-between text-[11px] font-bold">
                      <span>TERMS &amp; ASSOCIATION CONTACT</span>
                      <span className="text-[#ffbe3b]">www.apsiwa.in</span>
                    </div>

                    {/* Back Body Terms */}
                    <div className="p-3.5 text-[8.5px] text-[#434752] space-y-1.5 leading-relaxed">
                      <p className="font-bold text-[#003477] text-[9.5px]">APSIWA Institutional Terms:</p>
                      <ul className="list-disc pl-3 space-y-0.5">
                        <li>
                          This card certifies the bearer as a registered member of APSIWA for AP State Solar
                          projects.
                        </li>
                        <li>
                          Membership is valid for 1 year from the payment date (Valid until: {matchedRecord.validUntil}).
                        </li>
                        <li>
                          Cardholder adheres to official DISCOM &amp; NREDCAP technical &amp; safety standards.
                        </li>
                        <li>Non-transferable. Loss of card must be reported to the Secretariat immediately.</li>
                      </ul>

                      <div className="pt-2 border-t border-[#e0e3e6] grid grid-cols-2 gap-2 text-[8px]">
                        <div>
                          <span className="font-bold text-[#191c1e] block">State Secretariat:</span>
                          <span>Association Secretariat, Visakhapatnam, Andhra Pradesh, India</span>
                        </div>
                        <div>
                          <span className="font-bold text-[#191c1e] block">Official Contact:</span>
                          <span>apsiwa2018@gmail.com | +91 866 248 9000</span>
                        </div>
                      </div>
                    </div>

                    {/* Back Barcode Strip */}
                    <div className="bg-[#f2f4f7] px-4 py-2 border-t border-[#e0e3e6] flex items-center justify-between text-[8px]">
                      <div className="space-x-1 font-mono tracking-widest text-[#003477] font-bold text-[10px]">
                        ||| | |||| || ||||| |||| || |||
                      </div>
                      <span className="text-[7.5px] text-[#737783]">Security ID: 98402840-APSIWA</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Full Accreditation Profile Details Accordion */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e0e3e6] shadow-xs space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[#e0e3e6]">
                  <div>
                    <h3 className="text-base font-extrabold text-[#191c1e]">
                      Official Member Credentials &amp; Enterprise Details
                    </h3>
                    <p className="text-xs text-[#737783]">
                      Institutional accreditation record archived in APSIWA State Registry.
                    </p>
                  </div>
                  <button
                    onClick={handleCopyId}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#f2f4f7] hover:bg-[#d8e2ff] text-[#003477] text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Copy size={13} />
                    <span>{copiedId ? 'Copied ID!' : 'Copy ID'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-[#f7f9fc] border border-[#e0e3e6]/60">
                    <span className="text-[#737783] block text-[11px]">Representative</span>
                    <span className="font-bold text-[#191c1e] block text-sm">{matchedRecord.fullName}</span>
                    <span className="text-[11px] text-[#003477] font-medium">DOB: {matchedRecord.dateOfBirth}</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#f7f9fc] border border-[#e0e3e6]/60">
                    <span className="text-[#737783] block text-[11px]">Enterprise / Firm</span>
                    <span className="font-bold text-[#191c1e] block text-sm truncate">
                      {matchedRecord.companyName}
                    </span>
                    <span className="text-[11px] text-[#737783]">{matchedRecord.businessType}</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#f7f9fc] border border-[#e0e3e6]/60">
                    <span className="text-[#737783] block text-[11px]">GSTIN Number</span>
                    <span className="font-mono font-bold text-[#006e2e] block text-sm">
                      {matchedRecord.gstNumber}
                    </span>
                    <span className="text-[11px] text-[#737783]">District: {matchedRecord.district}</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#f7f9fc] border border-[#e0e3e6]/60">
                    <span className="text-[#737783] block text-[11px]">Contact &amp; Secretarial</span>
                    <span className="font-mono font-bold text-[#191c1e] block text-xs">
                      {matchedRecord.mobileNumber}
                    </span>
                    <span className="text-[11px] text-[#737783] block truncate">
                      {matchedRecord.emailAddress}
                    </span>
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
