import React, { useState, useRef } from 'react';
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
  ChevronRight
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ProfileScreenProps {
  user: UserProfile | null;
  onUpdateUser: (updated: UserProfile) => void;
  applications: MembershipApplication[];
  onNavigateMembership: () => void;
  onOpenAuth: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  user,
  onUpdateUser,
  applications,
  onNavigateMembership,
  onOpenAuth
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'status' | 'card'>('card');
  const [cardSide, setCardSide] = useState<'front' | 'back' | 'both'>('front');
  const [isEditing, setIsEditing] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [downloadingFormat, setDownloadingFormat] = useState<'image' | 'pdf' | null>(null);

  // References for capturing DOM elements
  const cardFrontRef = useRef<HTMLDivElement>(null);
  const cardBackRef = useRef<HTMLDivElement>(null);
  const cardBothRef = useRef<HTMLDivElement>(null);

  // Fallback defaults if user profile is partially filled
  const memberData = {
    name: user?.name || 'Er. B. Raghava Choudhary',
    email: user?.email || 'raghava.solar@amaravati-epc.in',
    phone: user?.phoneNumber || '+91 98480 32190',
    companyName: user?.companyName || 'SuryaTeja Clean Energy Infra LLP',
    designation: user?.designation || 'Managing Director & EPC Lead',
    district: user?.district || 'Krishna / Amaravati',
    businessType: user?.businessType || 'Solar EPC & Rooftop Integrator',
    gstNumber: user?.gstNumber || '37AAACS9823M1ZX',
    bloodGroup: user?.bloodGroup || 'O +ve',
    address: user?.address || 'Plot #42, Solar Tech Enclave, MG Road, Vijayawada, AP - 520010',
    membershipId: user?.membershipId || 'APSIWA-LM-2026-4819',
    joinedDate: user?.joinedDate || 'March 2026',
    validUntil: user?.validUntil || '31-MAR-2029',
    membershipTier: user?.membershipTier || 'Life Member (EPC Tier-1)',
    membershipStatus: user?.membershipStatus || 'Active'
  };

  // Edit form state
  const [editFormData, setEditFormData] = useState(memberData);

  // Find linked application if any
  const linkedApp = applications[0] || null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(memberData.membershipId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const updated: UserProfile = {
      ...user,
      name: editFormData.name,
      phoneNumber: editFormData.phone,
      companyName: editFormData.companyName,
      designation: editFormData.designation,
      district: editFormData.district,
      gstNumber: editFormData.gstNumber,
      businessType: editFormData.businessType,
      bloodGroup: editFormData.bloodGroup,
      address: editFormData.address
    };
    onUpdateUser(updated);
    setIsEditing(false);
  };

  // Download Card as High-Resolution PNG Image
  const handleDownloadImage = async () => {
    setDownloadingFormat('image');
    try {
      const targetElement = cardSide === 'both' ? cardBothRef.current : (cardSide === 'front' ? cardFrontRef.current : cardBackRef.current);
      if (!targetElement) return;

      const canvas = await html2canvas(targetElement, {
        scale: 3, // 3x crisp high-DPI resolution
        useCORS: true,
        backgroundColor: null,
        logging: false
      });

      const image = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.href = image;
      link.download = `APSIWA-ID-CARD-${memberData.membershipId}-${cardSide}.png`;
      link.click();
    } catch (err) {
      console.error('Error generating card image:', err);
    } finally {
      setDownloadingFormat(null);
    }
  };

  // Download Card as PDF
  const handleDownloadPDF = async () => {
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
      pdf.text('ANDHRA PRADESH SOLAR INTEGRATORS WELFARE ASSOCIATION (APSIWA)', pageWidth / 2, 15, { align: 'center' });
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(67, 71, 82);
      pdf.text(`Official Institutional Member Identity Card | Issued: ${memberData.joinedDate} | ID: ${memberData.membershipId}`, pageWidth / 2, 22, { align: 'center' });

      // Calculate aspect ratio fit
      const imgWidth = 220;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const posX = (pageWidth - imgWidth) / 2;
      const posY = 30;

      pdf.addImage(imgData, 'PNG', posX, posY, imgWidth, Math.min(imgHeight, pageHeight - 45));

      // PDF Footer note
      pdf.setFontSize(8);
      pdf.setTextColor(115, 119, 131);
      pdf.text('This is an official digitally generated membership credential verified by APSIWA Secretariat.', pageWidth / 2, pageHeight - 10, { align: 'center' });

      pdf.save(`APSIWA-Membership-Card-${memberData.membershipId}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setDownloadingFormat(null);
    }
  };

  // Print Card
  const handlePrint = () => {
    window.print();
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl p-10 border border-[#e0e3e6] shadow-sm max-w-lg mx-auto space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-[#f2f4f7] flex items-center justify-center mx-auto text-[#003477]">
            <User size={32} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-[#191c1e]">Member Authentication Required</h2>
            <p className="text-sm text-[#434752] leading-relaxed">
              Please sign in or register your account to view your APSIWA member profile, track enrolment status, and download your official Membership ID card.
            </p>
          </div>
          <button
            onClick={onOpenAuth}
            className="w-full py-3 rounded-xl bg-[#003477] hover:bg-[#024aa3] text-white text-sm font-bold shadow-md transition-all cursor-pointer"
          >
            Sign In / Register Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-margin py-8 space-y-8 animate-in fade-in duration-300">
      {/* PROFILE BANNER / HEADER */}
      <div className="relative bg-gradient-to-r from-[#00285e] via-[#003477] to-[#024aa3] rounded-3xl p-6 sm:p-8 text-white overflow-hidden shadow-lg border border-[#024aa3]/30">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#ffbe3b]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[#8ef9a0]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Left: Avatar + Details */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative group">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white p-1 shadow-md border-2 border-[#ffbe3b]/60 flex items-center justify-center overflow-hidden">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={memberData.name} className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <div className="w-full h-full bg-[#f2f4f7] rounded-xl flex items-center justify-center text-[#003477] font-bold text-2xl">
                    {memberData.name.charAt(0)}
                  </div>
                )}
              </div>
              <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#006e2e] border-2 border-white flex items-center justify-center text-white" title="Verified Member">
                <CheckCircle2 size={14} />
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                  {memberData.name}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#ffbe3b]/20 border border-[#ffbe3b]/40 text-[#ffbe3b] text-[11px] font-bold">
                  <Award size={12} />
                  {memberData.membershipTier}
                </span>
              </div>

              <p className="text-[13px] text-white/85 font-medium flex items-center gap-2 flex-wrap">
                <span>{memberData.companyName}</span>
                <span className="text-white/40">•</span>
                <span className="flex items-center gap-1 text-white/75">
                  <MapPin size={13} />
                  {memberData.district}
                </span>
              </p>

              <div className="flex items-center gap-3 pt-1 flex-wrap text-[12px] text-white/70">
                <button
                  onClick={handleCopyId}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-mono text-[11.5px] transition-colors cursor-pointer border border-white/10"
                  title="Click to copy Membership ID"
                >
                  <span>{memberData.membershipId}</span>
                  {copiedId ? <CheckCircle2 size={13} className="text-[#8ef9a0]" /> : <Copy size={13} />}
                </button>
                <span>Joined {memberData.joinedDate}</span>
              </div>
            </div>
          </div>

          {/* Right: Quick ID Card CTA */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => setActiveTab('card')}
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#ffbe3b] hover:bg-[#fab220] text-[#00285e] font-bold text-[13px] shadow-sm transition-all cursor-pointer active:scale-95"
            >
              <CreditCard size={16} />
              <span>View ID Card</span>
            </button>
          </div>
        </div>
      </div>

      {/* THREE MAIN TABS NAVIGATION */}
      <div className="flex border-b border-[#e0e3e6] gap-2 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('card')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'card'
              ? 'border-[#003477] text-[#003477] bg-[#f0f4ff]/50 rounded-t-xl'
              : 'border-transparent text-[#434752] hover:text-[#191c1e] hover:border-[#ccd0d5]'
          }`}
        >
          <CreditCard size={18} />
          <span>Membership Card</span>
          <span className="ml-1 px-2 py-0.5 rounded-full bg-[#006e2e]/10 text-[#006e2e] text-[11px] font-bold">
            Official
          </span>
        </button>

        <button
          onClick={() => setActiveTab('status')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'status'
              ? 'border-[#003477] text-[#003477] bg-[#f0f4ff]/50 rounded-t-xl'
              : 'border-transparent text-[#434752] hover:text-[#191c1e] hover:border-[#ccd0d5]'
          }`}
        >
          <Clock size={18} />
          <span>Membership Status</span>
          <span className="w-2 h-2 rounded-full bg-[#006e2e]" />
        </button>

        <button
          onClick={() => setActiveTab('details')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'details'
              ? 'border-[#003477] text-[#003477] bg-[#f0f4ff]/50 rounded-t-xl'
              : 'border-transparent text-[#434752] hover:text-[#191c1e] hover:border-[#ccd0d5]'
          }`}
        >
          <User size={18} />
          <span>Profile Details</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: MEMBERSHIP CARD (PRIMARY FOCUS WITH DOWNLOAD AS IMAGE & PDF) */}
      {/* ========================================================================= */}
      {activeTab === 'card' && (
        <div className="space-y-6">
          {/* Card Controls Bar */}
          <div className="bg-white rounded-2xl p-4 border border-[#e0e3e6] shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#434752] uppercase tracking-wider">
                Card View:
              </span>
              <div className="inline-flex rounded-xl bg-[#f2f4f7] p-1 border border-[#e0e3e6]">
                <button
                  onClick={() => setCardSide('front')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    cardSide === 'front' ? 'bg-white text-[#003477] shadow-xs' : 'text-[#434752]'
                  }`}
                >
                  Front Side
                </button>
                <button
                  onClick={() => setCardSide('back')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    cardSide === 'back' ? 'bg-white text-[#003477] shadow-xs' : 'text-[#434752]'
                  }`}
                >
                  Back Side
                </button>
                <button
                  onClick={() => setCardSide('both')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    cardSide === 'both' ? 'bg-white text-[#003477] shadow-xs' : 'text-[#434752]'
                  }`}
                >
                  Both Sides
                </button>
              </div>
            </div>

            {/* Download Buttons */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={handleDownloadImage}
                disabled={downloadingFormat !== null}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#006e2e] hover:bg-[#005322] text-white text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <Download size={14} />
                <span>{downloadingFormat === 'image' ? 'Generating Image...' : 'Download as Image (PNG)'}</span>
              </button>

              <button
                onClick={handleDownloadPDF}
                disabled={downloadingFormat !== null}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#003477] hover:bg-[#024aa3] text-white text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <FileText size={14} />
                <span>{downloadingFormat === 'pdf' ? 'Creating PDF...' : 'Download as PDF'}</span>
              </button>

              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#f2f4f7] hover:bg-[#e0e3e6] text-[#191c1e] text-xs font-semibold transition-all cursor-pointer"
                title="Print ID Card"
              >
                <Printer size={14} />
                <span>Print</span>
              </button>
            </div>
          </div>

          {/* CARD CONTAINER FOR RENDERING */}
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
                    <img src="/logo.png" alt="APSIWA" className="h-9 w-auto object-contain bg-white rounded-md p-0.5" />
                    <div>
                      <span className="text-[13px] font-extrabold tracking-tight block leading-tight">APSIWA</span>
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
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={memberData.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#003477] to-[#024aa3] text-white flex items-center justify-center font-bold text-2xl">
                          {memberData.name.charAt(0)}
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
                        {memberData.name}
                      </h3>
                      <p className="text-[10px] font-semibold text-[#434752] truncate">
                        {memberData.designation}
                      </p>
                      <p className="text-[9.5px] font-bold text-[#191c1e] truncate">
                        {memberData.companyName}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 pt-1 text-[9px] border-t border-[#e0e3e6]">
                      <div>
                        <span className="text-[#737783] block text-[8px]">ID NO:</span>
                        <span className="font-bold text-[#003477] font-mono">{memberData.membershipId}</span>
                      </div>
                      <div>
                        <span className="text-[#737783] block text-[8px]">DISTRICT:</span>
                        <span className="font-bold text-[#191c1e] truncate block">{memberData.district}</span>
                      </div>
                      <div>
                        <span className="text-[#737783] block text-[8px]">VALID TILL:</span>
                        <span className="font-bold text-[#006e2e]">{memberData.validUntil}</span>
                      </div>
                      <div>
                        <span className="text-[#737783] block text-[8px]">BLOOD GROUP:</span>
                        <span className="font-bold text-[#ba1a1a]">{memberData.bloodGroup}</span>
                      </div>
                    </div>
                  </div>

                  {/* QR Code & Hologram */}
                  <div className="flex flex-col items-center justify-between h-full py-1 shrink-0">
                    <div className="w-14 h-14 p-1 bg-white border border-[#003477] rounded flex items-center justify-center shadow-xs">
                      <QrCode size={48} className="text-[#003477]" />
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#ffbe3b] via-[#fab220] to-[#ffd782] flex items-center justify-center shadow-md border border-[#ffffff] text-[6.5px] font-extrabold text-[#00285e] text-center leading-tight">
                      APSIWA<br/>SEAL
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
                  <span className="text-[#ffbe3b]">www.apsiwa.org</span>
                </div>

                {/* Back Body Terms */}
                <div className="p-3.5 text-[8.5px] text-[#434752] space-y-1.5 leading-relaxed">
                  <p className="font-bold text-[#003477] text-[9.5px]">APSIWA Institutional Terms:</p>
                  <ul className="list-disc pl-3 space-y-0.5">
                    <li>This card certifies the bearer as a registered member of APSIWA for AP State Solar projects.</li>
                    <li>Cardholder adheres to official DISCOM &amp; NREDCAP technical &amp; safety standards.</li>
                    <li>Non-transferable. Loss of card must be reported to the Secretariat immediately.</li>
                  </ul>

                  <div className="pt-2 border-t border-[#e0e3e6] grid grid-cols-2 gap-2 text-[8px]">
                    <div>
                      <span className="font-bold text-[#191c1e] block">State Secretariat:</span>
                      <span>APSIWA Bhavan, Near NREDCAP Road, Amaravati Capital Region, AP - 520010</span>
                    </div>
                    <div>
                      <span className="font-bold text-[#191c1e] block">Emergency &amp; Support:</span>
                      <span>contact@apsiwa.org | +91 866 248 9000</span>
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

            {/* SINGLE SIDE DISPLAY (FRONT ONLY) */}
            {cardSide === 'front' && (
              <div
                ref={cardFrontRef}
                className="w-full max-w-[480px] h-[300px] rounded-3xl bg-white border-2 border-[#003477] shadow-2xl overflow-hidden flex flex-col relative text-[#191c1e] transition-transform hover:scale-[1.01]"
              >
                {/* Header Banner */}
                <div className="bg-[#003477] text-white px-5 py-3 flex items-center justify-between border-b-2 border-[#ffbe3b]">
                  <div className="flex items-center gap-3">
                    <img src="/logo.png" alt="APSIWA" className="h-10 w-auto object-contain bg-white rounded-md p-1 shadow-xs" />
                    <div>
                      <span className="text-[15px] font-black tracking-tight block leading-tight">APSIWA</span>
                      <span className="text-[8px] uppercase font-bold text-[#8ef9a0] tracking-wider block">
                        Andhra Pradesh Solar Integrators Welfare Association
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-[#ffbe3b] text-[#00285e] text-[9.5px] font-black uppercase tracking-wider">
                    MEMBER ID
                  </span>
                </div>

                {/* Card Body */}
                <div className="flex-1 p-4 flex gap-4 items-center relative bg-gradient-to-b from-white to-[#fbfcfe]">
                  {/* Member Photo */}
                  <div className="flex flex-col items-center gap-1.5 shrink-0">
                    <div className="w-22 h-26 rounded-xl bg-[#f2f4f7] border-2 border-[#003477] overflow-hidden flex items-center justify-center shadow-md">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={memberData.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#003477] to-[#024aa3] text-white flex items-center justify-center font-extrabold text-3xl">
                          {memberData.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <span className="text-[8.5px] font-black text-[#006e2e] uppercase tracking-wider bg-[#8ef9a0]/30 px-2 py-0.5 rounded-full border border-[#006e2e]/20">
                      VERIFIED
                    </span>
                  </div>

                  {/* Member Info */}
                  <div className="flex-1 min-w-0 space-y-1.5 text-left">
                    <div>
                      <h3 className="text-[16px] font-extrabold text-[#003477] leading-tight truncate">
                        {memberData.name}
                      </h3>
                      <p className="text-[11px] font-semibold text-[#434752] truncate">
                        {memberData.designation}
                      </p>
                      <p className="text-[10.5px] font-bold text-[#191c1e] truncate">
                        {memberData.companyName}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 pt-1.5 text-[9.5px] border-t border-[#e0e3e6]">
                      <div>
                        <span className="text-[#737783] block text-[8px] font-bold">MEMBERSHIP ID:</span>
                        <span className="font-extrabold text-[#003477] font-mono text-[10.5px]">{memberData.membershipId}</span>
                      </div>
                      <div>
                        <span className="text-[#737783] block text-[8px] font-bold">DISTRICT:</span>
                        <span className="font-bold text-[#191c1e] truncate block">{memberData.district}</span>
                      </div>
                      <div>
                        <span className="text-[#737783] block text-[8px] font-bold">VALID UP TO:</span>
                        <span className="font-bold text-[#006e2e]">{memberData.validUntil}</span>
                      </div>
                      <div>
                        <span className="text-[#737783] block text-[8px] font-bold">BLOOD GROUP:</span>
                        <span className="font-bold text-[#ba1a1a]">{memberData.bloodGroup}</span>
                      </div>
                    </div>
                  </div>

                  {/* QR Code & Hologram */}
                  <div className="flex flex-col items-center justify-between h-full py-1 shrink-0">
                    <div className="w-16 h-16 p-1 bg-white border border-[#003477]/40 rounded-lg flex items-center justify-center shadow-xs">
                      <QrCode size={54} className="text-[#003477]" />
                    </div>
                    <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#ffbe3b] via-[#fab220] to-[#ffd782] flex items-center justify-center shadow-md border-2 border-white text-[7px] font-black text-[#00285e] text-center leading-tight">
                      APSIWA<br/>SEAL
                    </div>
                  </div>
                </div>

                {/* Footer Bar */}
                <div className="bg-[#f2f4f7] px-5 py-2 border-t border-[#e0e3e6] flex items-center justify-between text-[8.5px] text-[#434752]">
                  <span className="font-bold text-[#003477]">AP Institutional Solar Welfare Association</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[#737783]">Authorized Signatory</span>
                    <span className="font-mono font-bold text-[#003477]">AP-2026</span>
                  </div>
                </div>
              </div>
            )}

            {/* SINGLE SIDE DISPLAY (BACK ONLY) */}
            {cardSide === 'back' && (
              <div
                ref={cardBackRef}
                className="w-full max-w-[480px] h-[300px] rounded-3xl bg-white border-2 border-[#003477] shadow-2xl overflow-hidden flex flex-col justify-between text-[#191c1e] transition-transform hover:scale-[1.01]"
              >
                {/* Back Header */}
                <div className="bg-[#003477] text-white px-5 py-2.5 border-b-2 border-[#ffbe3b] flex items-center justify-between text-[12px] font-bold">
                  <span>TERMS &amp; ASSOCIATION CONTACT</span>
                  <span className="text-[#ffbe3b] font-mono">www.apsiwa.org</span>
                </div>

                {/* Back Body Terms */}
                <div className="p-5 text-[9.5px] text-[#434752] space-y-2.5 leading-relaxed">
                  <p className="font-bold text-[#003477] text-[11px]">Official APSIWA Governance Guidelines:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>This card certifies active membership in the Andhra Pradesh Solar Integrators Welfare Association.</li>
                    <li>Cardholder is authorized to represent institutional solar integration standards across AP DISCOMs.</li>
                    <li>Property of APSIWA. Must be returned upon cessation of membership.</li>
                  </ul>

                  <div className="pt-3 border-t border-[#e0e3e6] grid grid-cols-2 gap-3 text-[9px]">
                    <div>
                      <span className="font-bold text-[#191c1e] block">State Secretariat:</span>
                      <span>APSIWA Bhavan, Amaravati Capital Region, Andhra Pradesh - 520010</span>
                    </div>
                    <div>
                      <span className="font-bold text-[#191c1e] block">Official Inquiries:</span>
                      <span>contact@apsiwa.org | +91 866 248 9000</span>
                    </div>
                  </div>
                </div>

                {/* Back Barcode Strip */}
                <div className="bg-[#f2f4f7] px-5 py-2.5 border-t border-[#e0e3e6] flex items-center justify-between text-[9px]">
                  <div className="space-x-1 font-mono tracking-widest text-[#003477] font-bold text-[12px]">
                    ||| | |||| || ||||| |||| || |||
                  </div>
                  <span className="text-[8px] text-[#737783] font-mono">ID: {memberData.membershipId}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MEMBERSHIP STATUS & TIMELINE TRACKER */}
      {/* ========================================================================= */}
      {activeTab === 'status' && (
        <div className="space-y-6">
          {/* Status Overview Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e0e3e6] shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#e0e3e6]">
              <div>
                <span className="text-xs font-bold text-[#003477] tracking-wider uppercase block">
                  Enrolment Lifecycle
                </span>
                <h2 className="text-xl font-extrabold text-[#191c1e] mt-0.5">
                  Membership Status: <span className="text-[#006e2e]">Active &amp; Certified</span>
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#8ef9a0]/25 border border-[#006e2e]/30 text-[#006e2e] text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-[#006e2e] animate-pulse" />
                  Life Membership Active
                </span>
              </div>
            </div>

            {/* Stepper Timeline */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
              {/* Step 1 */}
              <div className="p-4 rounded-2xl bg-[#f2f4f7] border border-[#e0e3e6] space-y-2">
                <div className="flex items-center gap-2 text-[#006e2e]">
                  <CheckCircle2 size={18} />
                  <span className="text-xs font-bold uppercase tracking-wider">Step 1: Completed</span>
                </div>
                <h4 className="text-sm font-bold text-[#191c1e]">Application &amp; KYC</h4>
                <p className="text-xs text-[#434752] leading-relaxed">
                  Institutional registration and firm details verified.
                </p>
                <span className="text-[11px] text-[#737783] block font-mono">01-Mar-2026</span>
              </div>

              {/* Step 2 */}
              <div className="p-4 rounded-2xl bg-[#f2f4f7] border border-[#e0e3e6] space-y-2">
                <div className="flex items-center gap-2 text-[#006e2e]">
                  <CheckCircle2 size={18} />
                  <span className="text-xs font-bold uppercase tracking-wider">Step 2: Completed</span>
                </div>
                <h4 className="text-sm font-bold text-[#191c1e]">Payment &amp; UTR</h4>
                <p className="text-xs text-[#434752] leading-relaxed">
                  Admission fee &amp; welfare subscription verified via UTR.
                </p>
                <span className="text-[11px] text-[#737783] block font-mono">UTR: 409218204910</span>
              </div>

              {/* Step 3 */}
              <div className="p-4 rounded-2xl bg-[#f2f4f7] border border-[#e0e3e6] space-y-2">
                <div className="flex items-center gap-2 text-[#006e2e]">
                  <CheckCircle2 size={18} />
                  <span className="text-xs font-bold uppercase tracking-wider">Step 3: Completed</span>
                </div>
                <h4 className="text-sm font-bold text-[#191c1e]">District Scrutiny</h4>
                <p className="text-xs text-[#434752] leading-relaxed">
                  District executive council cleared installation credentials.
                </p>
                <span className="text-[11px] text-[#737783] block font-mono">Zone AP-Central</span>
              </div>

              {/* Step 4 */}
              <div className="p-4 rounded-2xl bg-[#8ef9a0]/15 border border-[#006e2e]/30 space-y-2">
                <div className="flex items-center gap-2 text-[#006e2e]">
                  <ShieldCheck size={18} />
                  <span className="text-xs font-bold uppercase tracking-wider">Step 4: Active</span>
                </div>
                <h4 className="text-sm font-bold text-[#006e2e]">Certified &amp; Issued</h4>
                <p className="text-xs text-[#434752] leading-relaxed">
                  Official Digital ID Card &amp; Certificate in good standing.
                </p>
                <span className="text-[11px] text-[#006e2e] font-bold block">Valid till 2029</span>
              </div>
            </div>

            {/* Application Summary Box */}
            <div className="bg-[#f7f9fc] rounded-2xl p-5 border border-[#e0e3e6] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-[#737783] block">Membership Tier</span>
                <span className="font-bold text-[#191c1e] text-sm">{memberData.membershipTier}</span>
              </div>
              <div>
                <span className="text-[#737783] block">State Registration No.</span>
                <span className="font-bold text-[#003477] font-mono text-sm">{memberData.membershipId}</span>
              </div>
              <div>
                <span className="text-[#737783] block">Validity Horizon</span>
                <span className="font-bold text-[#006e2e] text-sm">3 Years (2026 - 2029)</span>
              </div>
              <div>
                <span className="text-[#737783] block">Secretariat Verification</span>
                <span className="font-bold text-[#191c1e] text-sm">Amaravati Council</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PROFILE DETAILS & EDITING */}
      {/* ========================================================================= */}
      {activeTab === 'details' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e0e3e6] shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#e0e3e6]">
            <div>
              <h2 className="text-xl font-extrabold text-[#191c1e]">Personal &amp; Firm Information</h2>
              <p className="text-xs text-[#434752] mt-0.5">
                Official institutional profile registered in APSIWA State Registry.
              </p>
            </div>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#f2f4f7] hover:bg-[#e0e3e6] text-[#003477] text-xs font-bold transition-all cursor-pointer"
            >
              {isEditing ? (
                <>
                  <AlertCircle size={14} />
                  <span>Cancel Edit</span>
                </>
              ) : (
                <>
                  <Edit3 size={14} />
                  <span>Edit Profile</span>
                </>
              )}
            </button>
          </div>

          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#191c1e] mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-xs font-medium focus:bg-white focus:border-[#003477] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#191c1e] mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-xs font-medium focus:bg-white focus:border-[#003477] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#191c1e] mb-1">Company / Firm Name</label>
                  <input
                    type="text"
                    value={editFormData.companyName}
                    onChange={(e) => setEditFormData({ ...editFormData, companyName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-xs font-medium focus:bg-white focus:border-[#003477] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#191c1e] mb-1">Designation</label>
                  <input
                    type="text"
                    value={editFormData.designation}
                    onChange={(e) => setEditFormData({ ...editFormData, designation: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-xs font-medium focus:bg-white focus:border-[#003477] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#191c1e] mb-1">District</label>
                  <input
                    type="text"
                    value={editFormData.district}
                    onChange={(e) => setEditFormData({ ...editFormData, district: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-xs font-medium focus:bg-white focus:border-[#003477] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#191c1e] mb-1">GSTIN Number</label>
                  <input
                    type="text"
                    value={editFormData.gstNumber}
                    onChange={(e) => setEditFormData({ ...editFormData, gstNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-xs font-medium focus:bg-white focus:border-[#003477] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#191c1e] mb-1">Blood Group</label>
                  <input
                    type="text"
                    value={editFormData.bloodGroup}
                    onChange={(e) => setEditFormData({ ...editFormData, bloodGroup: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-xs font-medium focus:bg-white focus:border-[#003477] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#191c1e] mb-1">Office Address</label>
                  <input
                    type="text"
                    value={editFormData.address}
                    onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-xs font-medium focus:bg-white focus:border-[#003477] outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl bg-[#f2f4f7] hover:bg-[#e0e3e6] text-xs font-semibold text-[#434752] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#006e2e] hover:bg-[#005322] text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                >
                  <Save size={14} />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Section */}
              <div className="p-5 rounded-2xl bg-[#f2f4f7] border border-[#e0e3e6] space-y-4">
                <div className="flex items-center gap-2 text-[#003477] font-bold text-sm">
                  <User size={16} />
                  <span>Personal Details</span>
                </div>
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-[#e0e3e6]">
                    <span className="text-[#737783]">Full Name:</span>
                    <span className="font-bold text-[#191c1e]">{memberData.name}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#e0e3e6]">
                    <span className="text-[#737783]">Email Address:</span>
                    <span className="font-bold text-[#191c1e]">{memberData.email}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#e0e3e6]">
                    <span className="text-[#737783]">Phone Number:</span>
                    <span className="font-bold text-[#191c1e]">{memberData.phone}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#e0e3e6]">
                    <span className="text-[#737783]">Blood Group:</span>
                    <span className="font-bold text-[#ba1a1a]">{memberData.bloodGroup}</span>
                  </div>
                </div>
              </div>

              {/* Firm Section */}
              <div className="p-5 rounded-2xl bg-[#f2f4f7] border border-[#e0e3e6] space-y-4">
                <div className="flex items-center gap-2 text-[#003477] font-bold text-sm">
                  <Building2 size={16} />
                  <span>Enterprise / Firm Details</span>
                </div>
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-[#e0e3e6]">
                    <span className="text-[#737783]">Company Name:</span>
                    <span className="font-bold text-[#191c1e]">{memberData.companyName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#e0e3e6]">
                    <span className="text-[#737783]">Designation:</span>
                    <span className="font-bold text-[#191c1e]">{memberData.designation}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#e0e3e6]">
                    <span className="text-[#737783]">District:</span>
                    <span className="font-bold text-[#191c1e]">{memberData.district}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#e0e3e6]">
                    <span className="text-[#737783]">GSTIN Number:</span>
                    <span className="font-bold text-[#003477] font-mono">{memberData.gstNumber}</span>
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
