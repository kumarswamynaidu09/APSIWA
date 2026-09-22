import React, { useState } from 'react';
import { MembershipApplication, UserProfile, WebsiteSettings } from '../types';
import {
  User,
  Building2,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Upload,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  CreditCard,
  UserCheck,
  UserPlus,
  Lock,
  Clock,
  Flame,
  AlertCircle,
  FileCheck,
  Award,
  ExternalLink
} from 'lucide-react';
import { DEFAULT_WEBSITE_SETTINGS, saveMembershipApplication, calculateValidityDate } from '../lib/supabase';
import { compressImage, validateImageFile } from '../lib/imageUtils';

interface MembershipScreenProps {
  currentUser: UserProfile | null;
  websiteSettings?: WebsiteSettings;
  onProceedToPayment: (data: Partial<MembershipApplication>) => void;
  onExistingMemberRegistered?: (app: MembershipApplication) => void;
  onNavigateProfile?: () => void;
  onNavigateHome?: () => void;
}

const AP_DISTRICTS = [
  'Alluri Sitharama Raju',
  'Anakapalli',
  'Ananthapuramu',
  'Annamayya',
  'Bapatla',
  'Chittoor',
  'Dr. B.R. Ambedkar Konaseema',
  'East Godavari',
  'Eluru',
  'Guntur',
  'Kakinada',
  'Krishna',
  'Kurnool',
  'Nandyal',
  'NTR (Vijayawada)',
  'Palnadu',
  'Parvathipuram Manyam',
  'Prakasam',
  'Srikakulam',
  'Sri Potti Sriramulu Nellore',
  'Sri Sathya Sai',
  'Tirupati',
  'Visakhapatnam',
  'Vizianagaram',
  'West Godavari',
  'YSR Kadapa'
];

const BUSINESS_TYPES = [
  'Private Limited Company',
  'Limited Liability Partnership (LLP)',
  'Sole Proprietorship',
  'Partnership Firm',
  'Public Limited Company'
];

const EXPERIENCE_LEVELS = [
  '1 - 3 Years',
  '3 - 5 Years',
  '5 - 10 Years',
  '10+ Years',
  'New Entrant (< 1 Year)'
];

const SOLAR_SCOPES = [
  'Residential Rooftop (PM Surya Ghar)',
  'Commercial & Industrial (C&I)',
  'Ground-Mounted Solar EPC',
  'Agricultural Solar Pumps (PM KUSUM)',
  'Solar O&M & Testing Services'
];

export const MembershipScreen: React.FC<MembershipScreenProps> = ({
  currentUser,
  websiteSettings = DEFAULT_WEBSITE_SETTINGS,
  onProceedToPayment,
  onExistingMemberRegistered,
  onNavigateProfile,
  onNavigateHome
}) => {
  // Main Tab State: 'new' (New Member) | 'existing' (Existing Member) | 'renewal' (Renewal)
  const [membershipTab, setMembershipTab] = useState<'new' | 'existing' | 'renewal'>('new');

  const activeFee = websiteSettings.isExpoActive ? websiteSettings.expoFee : websiteSettings.regularFee;
  const regularFee = websiteSettings.regularFee;
  const discountPct = websiteSettings.expoDiscountPercentage;
  const savings = regularFee - activeFee;

  // =========================================================================
  // TAB 1: NEW MEMBER STATE
  // =========================================================================
  const [fullName, setFullName] = useState(currentUser?.name || '');
  const [dateOfBirth, setDateOfBirth] = useState(currentUser?.dateOfBirth || '');
  const [designation, setDesignation] = useState(currentUser?.designation || '');
  const [mobileNumber, setMobileNumber] = useState(currentUser?.phoneNumber || '');
  const [emailAddress, setEmailAddress] = useState(currentUser?.email || '');
  const [memberPhotoUrl, setMemberPhotoUrl] = useState<string>(currentUser?.avatarUrl || '');
  const [photoFileName, setPhotoFileName] = useState('');
  const [companyName, setCompanyName] = useState(currentUser?.companyName || '');
  const [businessType, setBusinessType] = useState(currentUser?.businessType || 'Private Limited Company');
  const [gstNumber, setGstNumber] = useState(currentUser?.gstNumber || '');
  const [experience, setExperience] = useState(currentUser?.experience || '1 - 3 Years');
  const [district, setDistrict] = useState(currentUser?.district || 'Visakhapatnam');
  const [officeAddress, setOfficeAddress] = useState(currentUser?.officeAddress || '');
  const [pincode, setPincode] = useState(currentUser?.pincode || '');
  const [selectedScopes, setSelectedScopes] = useState<string[]>([]);
  const [declarationAccepted, setDeclarationAccepted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // =========================================================================
  // TAB 2: EXISTING MEMBER STATE (NO PAYMENT PAGE REQUIRED)
  // =========================================================================
  const [existingFullName, setExistingFullName] = useState(currentUser?.name || '');
  const [existingDateOfBirth, setExistingDateOfBirth] = useState(currentUser?.dateOfBirth || '');
  const [existingDesignation, setExistingDesignation] = useState(currentUser?.designation || '');
  const [existingMobile, setExistingMobile] = useState(currentUser?.phoneNumber || '');
  const [existingEmail, setExistingEmail] = useState(currentUser?.email || '');
  const [existingPhotoUrl, setExistingPhotoUrl] = useState<string>(currentUser?.avatarUrl || '');
  const [existingPhotoFileName, setExistingPhotoFileName] = useState('');
  const [existingCompanyName, setExistingCompanyName] = useState(currentUser?.companyName || '');
  const [existingBusinessType, setExistingBusinessType] = useState(currentUser?.businessType || 'Private Limited Company');
  const [existingGstNumber, setExistingGstNumber] = useState(currentUser?.gstNumber || '');
  const [existingExperience, setExistingExperience] = useState(currentUser?.experience || '1 - 3 Years');
  const [existingDistrict, setExistingDistrict] = useState(currentUser?.district || 'Visakhapatnam');
  const [existingOfficeAddress, setExistingOfficeAddress] = useState(currentUser?.officeAddress || '');
  const [existingPincode, setExistingPincode] = useState(currentUser?.pincode || '');
  const [existingSelectedScopes, setExistingSelectedScopes] = useState<string[]>([]);
  const [existingDeclarationAccepted, setExistingDeclarationAccepted] = useState(false);
  const [existingErrorMsg, setExistingErrorMsg] = useState('');
  const [existingSubmitting, setExistingSubmitting] = useState(false);
  const [existingSuccessMsg, setExistingSuccessMsg] = useState('');

  // Scope toggles
  const toggleScope = (scope: string) => {
    setSelectedScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]
    );
  };

  const toggleExistingScope = (scope: string) => {
    setExistingSelectedScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]
    );
  };

  // Photo uploads with client-side compression to minimize database storage size
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateImageFile(file, 8);
      if (!validation.valid) {
        setErrorMsg(validation.error || 'Invalid photo file');
        return;
      }
      try {
        setPhotoFileName(file.name);
        const { dataUrl } = await compressImage(file, {
          maxWidth: 500,
          maxHeight: 500,
          quality: 0.75
        });
        setMemberPhotoUrl(dataUrl);
      } catch {
        setErrorMsg('Could not process photo. Please select another image.');
      }
    }
  };

  const handleExistingPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateImageFile(file, 8);
      if (!validation.valid) {
        setExistingErrorMsg(validation.error || 'Invalid photo file');
        return;
      }
      try {
        setExistingPhotoFileName(file.name);
        const { dataUrl } = await compressImage(file, {
          maxWidth: 500,
          maxHeight: 500,
          quality: 0.75
        });
        setExistingPhotoUrl(dataUrl);
      } catch {
        setExistingErrorMsg('Could not process photo. Please select another image.');
      }
    }
  };

  // =========================================================================
  // SUBMIT HANDLER: NEW MEMBER (Proceeds to Payment Screen)
  // =========================================================================
  const handleSubmitNewMember = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim()) {
      setErrorMsg('Please enter the Representative Full Name.');
      return;
    }

    if (!dateOfBirth.trim()) {
      setErrorMsg('Date of Birth is compulsory. Please provide your Date of Birth.');
      return;
    }

    if (!memberPhotoUrl.trim()) {
      setErrorMsg('Passport size portrait photograph is compulsory. Please upload a photo for your official Smart ID Card.');
      return;
    }

    if (!mobileNumber.trim() || !emailAddress.trim()) {
      setErrorMsg('Please provide valid Mobile Number and Email Address.');
      return;
    }

    if (!companyName.trim()) {
      setErrorMsg('Please enter your Company / Firm Legal Name.');
      return;
    }

    if (!officeAddress.trim() || !pincode.trim()) {
      setErrorMsg('Please provide complete Registered Office Address and Pincode.');
      return;
    }

    if (!declarationAccepted) {
      setErrorMsg('Please confirm the institutional declaration before proceeding to payment.');
      return;
    }

    const applicationPayload: Partial<MembershipApplication> = {
      fullName: fullName.trim(),
      dateOfBirth: dateOfBirth.trim(),
      mobileNumber: mobileNumber.trim(),
      emailAddress: emailAddress.trim(),
      companyName: companyName.trim(),
      designation: designation.trim() || 'Solar Representative',
      gstNumber: gstNumber.trim(),
      businessType: businessType,
      experience: experience,
      district: district,
      officeAddress: officeAddress.trim(),
      pincode: pincode.trim(),
      photoUrl: memberPhotoUrl.trim(),
      amountPaid: `₹ ${activeFee.toLocaleString('en-IN')}.00`
    };

    onProceedToPayment(applicationPayload);
  };

  // =========================================================================
  // SUBMIT HANDLER: EXISTING MEMBER (Bypasses Payment -> Instant Smart ID)
  // =========================================================================
  const handleSubmitExistingMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setExistingErrorMsg('');

    if (!existingFullName.trim()) {
      setExistingErrorMsg('Please enter the Authorized Representative Full Name.');
      return;
    }

    if (!existingDateOfBirth.trim()) {
      setExistingErrorMsg('Date of Birth is compulsory for official registration.');
      return;
    }

    if (!existingPhotoUrl.trim()) {
      setExistingErrorMsg('Passport size portrait photograph is compulsory for generating your Digital Smart ID Card.');
      return;
    }

    if (!existingMobile.trim() || !existingEmail.trim()) {
      setExistingErrorMsg('Please provide valid Mobile Number and Email Address.');
      return;
    }

    if (!existingCompanyName.trim()) {
      setExistingErrorMsg('Please enter your Company / Enterprise Legal Name.');
      return;
    }

    if (!existingOfficeAddress.trim() || !existingPincode.trim()) {
      setExistingErrorMsg('Please provide complete Registered Office Address and Pincode.');
      return;
    }

    if (!existingDeclarationAccepted) {
      setExistingErrorMsg('Please confirm the existing member accreditation declaration.');
      return;
    }

    setExistingSubmitting(true);

    const generatedMemberId = `APSIWA-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const existingApp: MembershipApplication = {
      id: generatedMemberId,
      fullName: existingFullName.trim(),
      dateOfBirth: existingDateOfBirth.trim(),
      mobileNumber: existingMobile.trim(),
      emailAddress: existingEmail.trim(),
      companyName: existingCompanyName.trim(),
      designation: existingDesignation.trim() || 'Managing Director',
      district: existingDistrict,
      gstNumber: existingGstNumber.trim() || '37AAAAA0000A1Z5',
      businessType: existingBusinessType,
      experience: existingExperience,
      officeAddress: existingOfficeAddress.trim(),
      pincode: existingPincode.trim(),
      photoUrl: existingPhotoUrl.trim(),
      utrNumber: 'EXISTING-MEMBER-VERIFIED',
      paymentDate: new Date().toISOString().split('T')[0],
      amountPaid: 'Exempt / Active Life Member',
      submissionDate: new Date().toLocaleDateString('en-IN', {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
      }),
      validUntil: calculateValidityDate(new Date().toISOString().split('T')[0]),
      status: 'Approved'
    };

    try {
      await saveMembershipApplication(existingApp, currentUser?.id);
      setExistingSuccessMsg('Web portal profile verified and registered successfully! Redirecting to your Smart ID Card...');
      
      setTimeout(() => {
        setExistingSubmitting(false);
        if (onExistingMemberRegistered) {
          onExistingMemberRegistered(existingApp);
        } else if (onNavigateProfile) {
          onNavigateProfile();
        }
      }, 900);
    } catch (err: any) {
      console.error('Error saving existing member onboarding:', err);
      setExistingSubmitting(false);
      if (onExistingMemberRegistered) {
        onExistingMemberRegistered(existingApp);
      } else if (onNavigateProfile) {
        onNavigateProfile();
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-10 px-4 sm:px-6">
      <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in zoom-in-98 duration-200">
        {/* Top Centered Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#003477]/10 text-[#003477] text-xs font-bold uppercase tracking-wider">
            <ShieldCheck size={14} />
            <span>APSIWA Official State Registry</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#191c1e] tracking-tight">
            Institutional Membership Portal
          </h1>

          <p className="text-xs sm:text-sm text-[#434752] max-w-xl mx-auto">
            Choose your enrolment pathway below. New integrators can apply for fresh admission, while existing offline members can onboard to access their Digital Smart ID Card.
          </p>

          {/* THREE MAIN MEMBERSHIP SUB-TABS SWITCHER */}
          <div className="max-w-xl mx-auto pt-3">
            <div className="grid grid-cols-3 gap-1.5 p-1.5 rounded-2xl bg-white border border-[#e0e3e6] shadow-sm">
              {/* Tab 1: New Member */}
              <button
                type="button"
                onClick={() => setMembershipTab('new')}
                className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  membershipTab === 'new'
                    ? 'bg-[#003477] text-white shadow-md'
                    : 'text-[#434752] hover:bg-[#f2f4f7] hover:text-[#191c1e]'
                }`}
              >
                <UserPlus size={16} />
                <span className="leading-tight">New Member</span>
                {membershipTab === 'new' && (
                  <span className="hidden sm:inline-block px-1.5 py-0.2 rounded-full bg-[#ffbe3b] text-[#00285e] text-[9.5px] font-black uppercase">
                    Admission
                  </span>
                )}
              </button>

              {/* Tab 2: Existing Member */}
              <button
                type="button"
                onClick={() => setMembershipTab('existing')}
                className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  membershipTab === 'existing'
                    ? 'bg-[#003477] text-white shadow-md'
                    : 'text-[#434752] hover:bg-[#f2f4f7] hover:text-[#191c1e]'
                }`}
              >
                <UserCheck size={16} />
                <span className="leading-tight">Existing Member</span>
                {membershipTab === 'existing' ? (
                  <span className="hidden sm:inline-block px-1.5 py-0.2 rounded-full bg-[#8ef9a0] text-[#004d1c] text-[9.5px] font-black uppercase">
                    No Fee
                  </span>
                ) : (
                  <span className="hidden sm:inline-block px-1.5 py-0.2 rounded-full bg-[#e0e3e6] text-[#434752] text-[9.5px] font-bold">
                    Web Onboard
                  </span>
                )}
              </button>

              {/* Tab 3: Renewal (Locked - Opens Soon) */}
              <button
                type="button"
                onClick={() => setMembershipTab('renewal')}
                className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  membershipTab === 'renewal'
                    ? 'bg-[#ffbe3b] text-[#00285e] shadow-md'
                    : 'text-[#737783] hover:bg-[#f2f4f7]'
                }`}
              >
                <Lock size={15} className="text-[#ba1a1a]" />
                <span className="leading-tight">Renewal</span>
                <span className="px-1.5 py-0.2 rounded-full bg-[#ba1a1a]/10 text-[#ba1a1a] text-[9px] font-black uppercase">
                  Opens Soon
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1 CONTENT: NEW MEMBER ENROLMENT (WITH PAYMENT FLOW) */}
        {/* ========================================================================= */}
        {membershipTab === 'new' && (
          <div className="space-y-6">
            {/* Special Solar Expo Offer Banner with Discount % */}
            {websiteSettings.isExpoActive && (
              <div className="max-w-4xl mx-auto p-4 rounded-2xl bg-gradient-to-r from-[#fff3d4] via-[#ffe8a3] to-[#fff3d4] border border-[#ffbe3b] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#ffbe3b] text-[#00285e] flex items-center justify-center font-black shrink-0 shadow-xs animate-bounce">
                    <Flame size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-black uppercase tracking-wider text-[#003477]">
                        {websiteSettings.expoOfferTitle}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-[#006e2e] text-white text-[10.5px] font-black uppercase tracking-wide">
                        {discountPct}% OFF
                      </span>
                    </div>
                    <p className="text-[11.5px] text-[#434752] font-semibold">
                      Regular Membership Fee <span className="line-through text-[#ba1a1a]">₹{regularFee.toLocaleString('en-IN')}</span> • Special Expo Fee <span className="font-extrabold text-[#006e2e] text-[13px]">₹{activeFee.toLocaleString('en-IN')} / Year</span>
                    </p>
                  </div>
                </div>

                <div className="bg-white/80 rounded-xl px-3 py-1.5 border border-[#ffbe3b]/60 text-right shrink-0">
                  <span className="text-[10px] text-[#737783] block uppercase font-bold">You Save</span>
                  <span className="text-sm font-black text-[#006e2e]">₹{savings.toLocaleString('en-IN')} ({discountPct}% Discount)</span>
                </div>
              </div>
            )}

            {/* Stepper (Centered) */}
            <div className="flex items-center justify-center gap-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#003477] bg-[#d8e2ff]/60 px-3 py-1 rounded-full border border-[#003477]/20">
                <UserPlus size={14} />
                <span>1. Representative &amp; Business Details</span>
              </div>
              <span className="text-[#ccd0d5]">→</span>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#737783]">
                <CreditCard size={14} />
                <span>2. Payment (₹{activeFee.toLocaleString('en-IN')})</span>
              </div>
            </div>

            {/* Form Container */}
            <div className="bg-white rounded-3xl border border-[#e0e3e6] shadow-xl overflow-hidden">
              {/* Header Banner */}
              <div className="bg-[#003477] text-white px-6 sm:px-8 py-5 flex items-center justify-between border-b border-[#00285e]">
                <div className="flex items-center gap-3">
                  <img src="/logo.png" alt="APSIWA" className="h-9 w-auto object-contain bg-white rounded p-0.5" />
                  <div>
                    <h3 className="text-base font-extrabold leading-tight">New Member Enrolment Form</h3>
                    <span className="text-[11px] text-[#8ef9a0] font-semibold">
                      Andhra Pradesh Solar Integrators Welfare Association
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#8ef9a0] uppercase font-bold block">
                    {websiteSettings.isExpoActive ? 'Expo Special Offer' : 'Annual Fee'}
                  </span>
                  <span className="text-sm font-black text-[#ffbe3b]">
                    ₹{activeFee.toLocaleString('en-IN')}{' '}
                    {websiteSettings.isExpoActive && (
                      <span className="line-through text-xs text-white/60 font-normal">₹{regularFee.toLocaleString('en-IN')}</span>
                    )}
                  </span>
                </div>
              </div>

              {errorMsg && (
                <div className="mx-6 sm:mx-8 mt-6 p-3.5 rounded-xl bg-[#ffdad6] border border-[#ffb4ab] text-[#ba1a1a] text-xs flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">error</span>
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmitNewMember} className="p-6 sm:p-8 space-y-8">
                {/* SECTION 1: REPRESENTATIVE DETAILS */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-[#e0e3e6]">
                    <div className="w-7 h-7 rounded-lg bg-[#003477] text-white flex items-center justify-center font-bold text-xs">
                      1
                    </div>
                    <h3 className="text-base font-extrabold text-[#003477]">
                      Authorized Representative Details
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#191c1e] mb-1">
                        Full Name <span className="text-[#ba1a1a]">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-3 text-[#737783]" size={15} />
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Enter Full Name"
                          className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-xs font-medium focus:bg-white focus:border-[#003477] outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#191c1e] mb-1">
                        Date of Birth <span className="text-[#ba1a1a] font-extrabold">* (Compulsory)</span>
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3.5 top-3 text-[#737783]" size={15} />
                        <input
                          type="date"
                          required
                          value={dateOfBirth}
                          max={new Date().toISOString().split('T')[0]}
                          onChange={(e) => setDateOfBirth(e.target.value)}
                          className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-xs font-medium focus:bg-white focus:border-[#003477] outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#191c1e] mb-1">Designation</label>
                      <div className="relative">
                        <Building2 className="absolute left-3.5 top-3 text-[#737783]" size={15} />
                        <input
                          type="text"
                          value={designation}
                          onChange={(e) => setDesignation(e.target.value)}
                          placeholder="Managing Director / Partner / Proprietor"
                          className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-xs font-medium focus:bg-white focus:border-[#003477] outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#191c1e] mb-1">
                        Email Address <span className="text-[#ba1a1a]">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-3 text-[#737783]" size={15} />
                        <input
                          type="email"
                          required
                          value={emailAddress}
                          onChange={(e) => setEmailAddress(e.target.value)}
                          placeholder="email@company.com"
                          className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-xs font-medium focus:bg-white focus:border-[#003477] outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#191c1e] mb-1">
                        Mobile Number <span className="text-[#ba1a1a]">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-3 text-[#737783]" size={15} />
                        <input
                          type="tel"
                          required
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-xs font-medium focus:bg-white focus:border-[#003477] outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION 2: REPRESENTATIVE PHOTOGRAPH (COMPULSORY) */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-[#e0e3e6]">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#003477] text-white flex items-center justify-center font-bold text-xs">
                        2
                      </div>
                      <h3 className="text-base font-extrabold text-[#003477]">
                        Representative Portrait Photograph <span className="text-[#ba1a1a]">*</span>
                      </h3>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#ffdad6] text-[#ba1a1a] text-[10px] font-extrabold uppercase tracking-wide">
                      Compulsory for ID Card
                    </span>
                  </div>

                  <div className={`p-4 rounded-2xl bg-[#f7f9fc] border transition-all flex flex-col sm:flex-row items-center gap-5 ${
                    memberPhotoUrl ? 'border-[#006e2e]/40 bg-[#f4faf6]' : 'border-[#ffb4ab]/70'
                  }`}>
                    <div className={`w-20 h-24 rounded-xl bg-white border-2 overflow-hidden shadow-sm flex items-center justify-center shrink-0 ${
                      memberPhotoUrl ? 'border-[#006e2e]' : 'border-[#ba1a1a] border-dashed'
                    }`}>
                      {memberPhotoUrl ? (
                        <img src={memberPhotoUrl} alt="Representative" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center justify-center p-1 text-center">
                          <User size={28} className="text-[#ba1a1a]" />
                          <span className="text-[8px] font-bold text-[#ba1a1a] mt-1">Photo Req.</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-1 text-center sm:text-left">
                      <div className="flex items-center gap-2 justify-center sm:justify-start">
                        <h4 className="text-xs font-bold text-[#191c1e]">
                          {photoFileName || (memberPhotoUrl ? 'Photograph Ready' : 'Upload Passport Size Photograph')}
                        </h4>
                        {memberPhotoUrl && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#006e2e]">
                            <CheckCircle2 size={12} />
                            Uploaded
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#737783]">
                        This official photo will appear on your government-recognized APSIWA Smart Identity Card &amp; State Registry.
                      </p>
                    </div>

                    <label className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer shadow-2xs transition-colors shrink-0 ${
                      memberPhotoUrl
                        ? 'bg-white border border-[#e0e3e6] text-[#003477] hover:bg-[#f2f4f7]'
                        : 'bg-[#003477] hover:bg-[#024aa3] text-white'
                    }`}>
                      <Upload size={14} />
                      <span>{memberPhotoUrl ? 'Change Photo' : 'Upload Photo *'}</span>
                      <input type="file" accept="image/*" required={!memberPhotoUrl} onChange={handlePhotoUpload} className="hidden" />
                    </label>
                  </div>
                </div>

                {/* SECTION 3: BUSINESS & FIRM DETAILS */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-[#e0e3e6]">
                    <div className="w-7 h-7 rounded-lg bg-[#003477] text-white flex items-center justify-center font-bold text-xs">
                      3
                    </div>
                    <h3 className="text-base font-extrabold text-[#003477]">
                      Business &amp; Firm Information
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-[#191c1e] mb-1">
                        Company / Firm Legal Name <span className="text-[#ba1a1a]">*</span>
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-3.5 top-3 text-[#737783]" size={15} />
                        <input
                          type="text"
                          required
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="e.g. Surya Renewable Power Pvt Ltd"
                          className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-xs font-medium focus:bg-white focus:border-[#003477] outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#191c1e] mb-1">
                        Business Constitution <span className="text-[#ba1a1a]">*</span>
                      </label>
                      <select
                        value={businessType}
                        onChange={(e) => setBusinessType(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-xs font-medium focus:bg-white focus:border-[#003477] outline-none cursor-pointer"
                      >
                        {BUSINESS_TYPES.map((bt) => (
                          <option key={bt} value={bt}>
                            {bt}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#191c1e] mb-1">
                        GSTIN Number (Optional)
                      </label>
                      <input
                        type="text"
                        value={gstNumber}
                        onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                        placeholder="37AAAAA0000A1Z5"
                        className="w-full px-3.5 py-2 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-xs font-mono font-bold text-[#003477] focus:bg-white focus:border-[#003477] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#191c1e] mb-1">
                        Andhra Pradesh District <span className="text-[#ba1a1a]">*</span>
                      </label>
                      <select
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-xs font-medium focus:bg-white focus:border-[#003477] outline-none cursor-pointer"
                      >
                        {AP_DISTRICTS.map((dist) => (
                          <option key={dist} value={dist}>
                            {dist}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#191c1e] mb-1">
                        Industry Experience <span className="text-[#ba1a1a]">*</span>
                      </label>
                      <select
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-xs font-medium focus:bg-white focus:border-[#003477] outline-none cursor-pointer"
                      >
                        {EXPERIENCE_LEVELS.map((exp) => (
                          <option key={exp} value={exp}>
                            {exp}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-[#191c1e] mb-1">
                        Registered Office Address <span className="text-[#ba1a1a]">*</span>
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3.5 top-3 text-[#737783]" size={15} />
                        <input
                          type="text"
                          required
                          value={officeAddress}
                          onChange={(e) => setOfficeAddress(e.target.value)}
                          placeholder="D.No, Street, Landmark, City/Town"
                          className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-xs font-medium focus:bg-white focus:border-[#003477] outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#191c1e] mb-1">Pincode <span className="text-[#ba1a1a]">*</span></label>
                      <input
                        type="text"
                        required
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        placeholder="e.g. 520001"
                        className="w-full px-3.5 py-2 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-xs font-medium focus:bg-white focus:border-[#003477] outline-none"
                      />
                    </div>
                  </div>

                  {/* Solar Scope Chips */}
                  <div>
                    <label className="block text-xs font-bold text-[#191c1e] mb-2">
                      Solar Work Scope &amp; Expertise (Select all applicable)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {SOLAR_SCOPES.map((scope) => {
                        const isSelected = selectedScopes.includes(scope);
                        return (
                          <button
                            key={scope}
                            type="button"
                            onClick={() => toggleScope(scope)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer border ${
                              isSelected
                                ? 'bg-[#003477] text-white border-[#003477] shadow-2xs font-bold'
                                : 'bg-[#f2f4f7] text-[#434752] border-[#e0e3e6] hover:border-[#ccd0d5]'
                            }`}
                          >
                            {isSelected ? '✓ ' : '+ '}
                            {scope}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* SECTION 4: DECLARATION */}
                <div className="p-4 rounded-2xl bg-[#f7f9fc] border border-[#e0e3e6] flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="declaration"
                    checked={declarationAccepted}
                    onChange={(e) => setDeclarationAccepted(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-[#003477] focus:ring-[#003477] cursor-pointer"
                  />
                  <label htmlFor="declaration" className="text-xs text-[#434752] leading-relaxed cursor-pointer">
                    I hereby certify that the information supplied above is authentic. As a member of APSIWA, I pledge to adhere to all AP State DISCOM, NREDCAP, and statutory solar installation safety protocols.
                  </label>
                </div>

                {/* PROCEED TO PAYMENT ACTION BUTTON */}
                <div className="pt-4 border-t border-[#e0e3e6] flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-[#737783] text-center sm:text-left">
                    Step 1 of 2: Details will be locked upon proceeding to the secure payment screen (₹2,000 Expo Offer).
                  </div>

                  <button
                    type="submit"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#006e2e] hover:bg-[#005322] text-white text-sm font-extrabold shadow-md transition-all cursor-pointer active:scale-98"
                  >
                    <span>Confirm Details &amp; Proceed to Payment (₹2,000)</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2 CONTENT: EXISTING MEMBER WEB ONBOARDING (NO PAYMENT PAGE REQUIRED) */}
        {/* ========================================================================= */}
        {membershipTab === 'existing' && (
          <div className="space-y-6">
            {/* Informational Guidance Banner */}
            <div className="bg-gradient-to-r from-[#003477] via-[#024aa3] to-[#00285e] text-white p-6 rounded-3xl shadow-lg border border-[#024aa3]/40 space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-[#8ef9a0] text-[#004d1c] text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-2xs">
                  <ShieldCheck size={14} />
                  No Payment Required • Direct Web Onboarding
                </span>
                <span className="text-xs text-white/80 font-medium">
                  Official APSIWA State Member Registry
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black">
                Existing APSIWA Member Web Portal Registration
              </h2>

              <p className="text-xs sm:text-sm text-white/90 leading-relaxed max-w-3xl">
                This registration gateway is exclusively for individuals and solar enterprises who are <strong>already official members of APSIWA</strong> (registered offline, through previous annual batches, or holding an existing APSIWA registration number) but have <strong>not yet registered on this website</strong>. 
                Fill in your credentials to instantly verify your profile and generate your <strong>Digital Smart ID Card &amp; Certificate</strong>.
              </p>

              <div className="pt-2 flex items-center gap-4 text-xs text-[#8ef9a0] font-bold flex-wrap">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={15} /> Instant Smart ID Generation
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={15} /> 100% Fee Exemption for Active Members
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={15} /> DISCOM Accreditation Sync
                </span>
              </div>
            </div>

            {/* Form Container */}
            <div className="bg-white rounded-3xl border border-[#e0e3e6] shadow-xl overflow-hidden">
              <div className="bg-[#f7f9fc] px-6 sm:px-8 py-4 border-b border-[#e0e3e6] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <FileCheck className="text-[#003477]" size={20} />
                  <span className="text-sm font-extrabold text-[#003477]">
                    Existing Member Web Profile Verification
                  </span>
                </div>
                <span className="text-xs font-bold text-[#006e2e] bg-[#8ef9a0]/30 px-3 py-1 rounded-full">
                  Zero Fee • Instant Verification
                </span>
              </div>

              {existingErrorMsg && (
                <div className="mx-6 sm:mx-8 mt-6 p-3.5 rounded-xl bg-[#ffdad6] border border-[#ffb4ab] text-[#ba1a1a] text-xs flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{existingErrorMsg}</span>
                </div>
              )}

              {existingSuccessMsg && (
                <div className="mx-6 sm:mx-8 mt-6 p-3.5 rounded-xl bg-[#e8f5e9] border border-[#a5d6a7] text-[#006e2e] text-xs flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  <span>{existingSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmitExistingMember} className="p-6 sm:p-8 space-y-8">
                {/* SECTION 1: AUTHORIZED REPRESENTATIVE DETAILS & COMPULSORY DOB */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-[#e0e3e6]">
                    <div className="w-7 h-7 rounded-lg bg-[#003477] text-white flex items-center justify-center font-bold text-xs">
                      1
                    </div>
                    <h3 className="text-base font-extrabold text-[#003477]">
                      Authorized Representative Profile
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#191c1e] mb-1">
                        Representative Full Name <span className="text-[#ba1a1a]">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-3 text-[#737783]" size={15} />
                        <input
                          type="text"
                          required
                          value={existingFullName}
                          onChange={(e) => setExistingFullName(e.target.value)}
                          placeholder="Enter Representative Name"
                          className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-xs font-medium focus:bg-white focus:border-[#003477] outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#191c1e] mb-1">
                        Date of Birth <span className="text-[#ba1a1a] font-extrabold">* (Compulsory)</span>
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3.5 top-3 text-[#737783]" size={15} />
                        <input
                          type="date"
                          required
                          value={existingDateOfBirth}
                          max={new Date().toISOString().split('T')[0]}
                          onChange={(e) => setExistingDateOfBirth(e.target.value)}
                          className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-xs font-medium focus:bg-white focus:border-[#003477] outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#191c1e] mb-1">
                        Designation <span className="text-[#ba1a1a]">*</span>
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-3.5 top-3 text-[#737783]" size={15} />
                        <input
                          type="text"
                          required
                          value={existingDesignation}
                          onChange={(e) => setExistingDesignation(e.target.value)}
                          placeholder="Managing Director / Partner / Lead"
                          className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-xs font-medium focus:bg-white focus:border-[#003477] outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#191c1e] mb-1">
                        Email Address <span className="text-[#ba1a1a]">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-3 text-[#737783]" size={15} />
                        <input
                          type="email"
                          required
                          value={existingEmail}
                          onChange={(e) => setExistingEmail(e.target.value)}
                          placeholder="email@company.com"
                          className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-xs font-medium focus:bg-white focus:border-[#003477] outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#191c1e] mb-1">
                        Mobile Number <span className="text-[#ba1a1a]">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-3 text-[#737783]" size={15} />
                        <input
                          type="tel"
                          required
                          value={existingMobile}
                          onChange={(e) => setExistingMobile(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-xs font-medium focus:bg-white focus:border-[#003477] outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION 2: COMPULSORY PHOTOGRAPH UPLOAD */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-[#e0e3e6]">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#003477] text-white flex items-center justify-center font-bold text-xs">
                        2
                      </div>
                      <h3 className="text-base font-extrabold text-[#003477]">
                        Representative Portrait Photograph <span className="text-[#ba1a1a]">*</span>
                      </h3>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#ffdad6] text-[#ba1a1a] text-[10px] font-extrabold uppercase tracking-wide">
                      Compulsory for Smart ID Card
                    </span>
                  </div>

                  <div className={`p-4 rounded-2xl bg-[#f7f9fc] border transition-all flex flex-col sm:flex-row items-center gap-5 ${
                    existingPhotoUrl ? 'border-[#006e2e]/40 bg-[#f4faf6]' : 'border-[#ffb4ab]/70'
                  }`}>
                    <div className={`w-20 h-24 rounded-xl bg-white border-2 overflow-hidden shadow-sm flex items-center justify-center shrink-0 ${
                      existingPhotoUrl ? 'border-[#006e2e]' : 'border-[#ba1a1a] border-dashed'
                    }`}>
                      {existingPhotoUrl ? (
                        <img src={existingPhotoUrl} alt="Representative" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center justify-center p-1 text-center">
                          <User size={28} className="text-[#ba1a1a]" />
                          <span className="text-[8px] font-bold text-[#ba1a1a] mt-1">Photo Req.</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-1 text-center sm:text-left">
                      <div className="flex items-center gap-2 justify-center sm:justify-start">
                        <h4 className="text-xs font-bold text-[#191c1e]">
                          {existingPhotoFileName || (existingPhotoUrl ? 'Photograph Ready' : 'Upload Passport Size Photograph')}
                        </h4>
                        {existingPhotoUrl && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#006e2e]">
                            <CheckCircle2 size={12} />
                            Uploaded
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#737783]">
                        This photo will be embedded into your official APSIWA Smart Identity Card with QR code verification.
                      </p>
                    </div>

                    <label className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer shadow-2xs transition-colors shrink-0 ${
                      existingPhotoUrl
                        ? 'bg-white border border-[#e0e3e6] text-[#003477] hover:bg-[#f2f4f7]'
                        : 'bg-[#003477] hover:bg-[#024aa3] text-white'
                    }`}>
                      <Upload size={14} />
                      <span>{existingPhotoUrl ? 'Change Photo' : 'Upload Photo *'}</span>
                      <input type="file" accept="image/*" required={!existingPhotoUrl} onChange={handleExistingPhotoUpload} className="hidden" />
                    </label>
                  </div>
                </div>

                {/* SECTION 3: ENTERPRISE & DISTRICT DETAILS */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-[#e0e3e6]">
                    <div className="w-7 h-7 rounded-lg bg-[#003477] text-white flex items-center justify-center font-bold text-xs">
                      3
                    </div>
                    <h3 className="text-base font-extrabold text-[#003477]">
                      Enterprise &amp; District Information
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-[#191c1e] mb-1">
                        Company / Enterprise Legal Name <span className="text-[#ba1a1a]">*</span>
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-3.5 top-3 text-[#737783]" size={15} />
                        <input
                          type="text"
                          required
                          value={existingCompanyName}
                          onChange={(e) => setExistingCompanyName(e.target.value)}
                          placeholder="e.g. Rayalaseema Solar EPC Pvt Ltd"
                          className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-xs font-medium focus:bg-white focus:border-[#003477] outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#191c1e] mb-1">
                        Business Constitution
                      </label>
                      <select
                        value={existingBusinessType}
                        onChange={(e) => setExistingBusinessType(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-xs font-medium focus:bg-white focus:border-[#003477] outline-none cursor-pointer"
                      >
                        {BUSINESS_TYPES.map((bt) => (
                          <option key={bt} value={bt}>
                            {bt}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#191c1e] mb-1">
                        GSTIN Number (Optional)
                      </label>
                      <input
                        type="text"
                        value={existingGstNumber}
                        onChange={(e) => setExistingGstNumber(e.target.value.toUpperCase())}
                        placeholder="37AAAAA0000A1Z5"
                        className="w-full px-3.5 py-2 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-xs font-mono font-bold text-[#003477] focus:bg-white focus:border-[#003477] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#191c1e] mb-1">
                        Andhra Pradesh District <span className="text-[#ba1a1a]">*</span>
                      </label>
                      <select
                        value={existingDistrict}
                        onChange={(e) => setExistingDistrict(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-xs font-medium focus:bg-white focus:border-[#003477] outline-none cursor-pointer"
                      >
                        {AP_DISTRICTS.map((dist) => (
                          <option key={dist} value={dist}>
                            {dist}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#191c1e] mb-1">
                        Experience in Solar Industry
                      </label>
                      <select
                        value={existingExperience}
                        onChange={(e) => setExistingExperience(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-xs font-medium focus:bg-white focus:border-[#003477] outline-none cursor-pointer"
                      >
                        {EXPERIENCE_LEVELS.map((exp) => (
                          <option key={exp} value={exp}>
                            {exp}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-[#191c1e] mb-1">
                        Registered Office Address <span className="text-[#ba1a1a]">*</span>
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3.5 top-3 text-[#737783]" size={15} />
                        <input
                          type="text"
                          required
                          value={existingOfficeAddress}
                          onChange={(e) => setExistingOfficeAddress(e.target.value)}
                          placeholder="D.No, Street, Landmark, City/Town"
                          className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-xs font-medium focus:bg-white focus:border-[#003477] outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#191c1e] mb-1">Pincode <span className="text-[#ba1a1a]">*</span></label>
                      <input
                        type="text"
                        required
                        value={existingPincode}
                        onChange={(e) => setExistingPincode(e.target.value)}
                        placeholder="e.g. 520001"
                        className="w-full px-3.5 py-2 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-xs font-medium focus:bg-white focus:border-[#003477] outline-none"
                      />
                    </div>
                  </div>

                  {/* Existing Scopes */}
                  <div>
                    <label className="block text-xs font-bold text-[#191c1e] mb-2">
                      Solar Domain Expertise (Select all applicable)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {SOLAR_SCOPES.map((scope) => {
                        const isSelected = existingSelectedScopes.includes(scope);
                        return (
                          <button
                            key={scope}
                            type="button"
                            onClick={() => toggleExistingScope(scope)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer border ${
                              isSelected
                                ? 'bg-[#003477] text-white border-[#003477] shadow-2xs font-bold'
                                : 'bg-[#f2f4f7] text-[#434752] border-[#e0e3e6] hover:border-[#ccd0d5]'
                            }`}
                          >
                            {isSelected ? '✓ ' : '+ '}
                            {scope}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* SECTION 4: DECLARATION */}
                <div className="p-4 rounded-2xl bg-[#f7f9fc] border border-[#e0e3e6] flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="existingDeclaration"
                    checked={existingDeclarationAccepted}
                    onChange={(e) => setExistingDeclarationAccepted(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-[#003477] focus:ring-[#003477] cursor-pointer"
                  />
                  <label htmlFor="existingDeclaration" className="text-xs text-[#434752] leading-relaxed cursor-pointer">
                    I solemnly affirm that I am an authorized active member of the Andhra Pradesh Solar Integrators Welfare Association (APSIWA). The credentials provided above are genuine for web profile sync and Smart ID card generation.
                  </label>
                </div>

                {/* SUBMIT BUTTON (DIRECT SMART ID GENERATION, NO PAYMENT) */}
                <div className="pt-4 border-t border-[#e0e3e6] flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-[#006e2e] font-bold text-center sm:text-left flex items-center gap-1.5">
                    <CheckCircle2 size={16} />
                    <span>No fee required. Your Digital Smart ID Card will be generated immediately.</span>
                  </div>

                  <button
                    type="submit"
                    disabled={existingSubmitting}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#003477] hover:bg-[#024aa3] text-white text-sm font-extrabold shadow-md transition-all cursor-pointer active:scale-98 disabled:opacity-75"
                  >
                    <span>{existingSubmitting ? 'Verifying & Generating...' : 'Complete Web Onboarding & View ID Card'}</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3 CONTENT: MEMBERSHIP RENEWAL (LOCKED - OPENS SOON) */}
        {/* ========================================================================= */}
        {membershipTab === 'renewal' && (
          <div className="bg-white rounded-3xl border border-[#e0e3e6] shadow-xl p-8 sm:p-12 text-center space-y-6 animate-in zoom-in-98 duration-200">
            {/* Locked Glowing Icon Badge */}
            <div className="relative inline-block">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-[#ffe8a3] via-[#ffbe3b] to-[#ffd782] text-[#00285e] flex items-center justify-center shadow-lg mx-auto">
                <Lock size={42} className="text-[#00285e]" />
              </div>
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#ba1a1a] text-white text-[10px] font-black uppercase tracking-wider shadow-sm whitespace-nowrap">
                Opens Soon
              </span>
            </div>

            <div className="max-w-xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffdad6] text-[#ba1a1a] text-xs font-black uppercase tracking-wider">
                <Clock size={13} />
                <span>Scheduled Portal Gateway: Opens Soon</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-[#191c1e] tracking-tight">
                Annual Membership Renewal
              </h2>

              <p className="text-xs sm:text-sm text-[#434752] leading-relaxed pt-1">
                The online annual membership renewal and multi-year validity extension gateway for the financial year <strong>2026–2027</strong> is currently undergoing scheduled rollout and will <strong>open soon</strong>.
              </p>
            </div>

            {/* Information Grid */}
            <div className="max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4 text-left pt-2">
              <div className="p-4 rounded-2xl bg-[#f7f9fc] border border-[#e0e3e6] space-y-1.5">
                <div className="flex items-center gap-2 text-[#003477] font-bold text-xs">
                  <CheckCircle2 size={16} />
                  <span>Existing Cards Remain Valid</span>
                </div>
                <p className="text-[11.5px] text-[#737783] leading-relaxed">
                  All active institutional members are in complete good standing with AP DISCOMs and NREDCAP until their printed validity date (2029).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#f7f9fc] border border-[#e0e3e6] space-y-1.5">
                <div className="flex items-center gap-2 text-[#003477] font-bold text-xs">
                  <Mail size={16} />
                  <span>Broadcast Notification</span>
                </div>
                <p className="text-[11.5px] text-[#737783] leading-relaxed">
                  Official SMS and email alerts with renewal windows and discounted rates will be dispatched to all registered members once activated.
                </p>
              </div>
            </div>

            {/* Action CTA buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              {onNavigateProfile && (
                <button
                  type="button"
                  onClick={onNavigateProfile}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#003477] hover:bg-[#024aa3] text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                >
                  <CreditCard size={15} />
                  <span>View Current Digital ID Card</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setMembershipTab('existing')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#f2f4f7] hover:bg-[#e0e3e6] text-[#003477] text-xs font-bold transition-all cursor-pointer"
              >
                <UserCheck size={15} />
                <span>Existing Member Web Onboarding</span>
              </button>

              {onNavigateHome && (
                <button
                  type="button"
                  onClick={onNavigateHome}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white border border-[#e0e3e6] hover:bg-[#f2f4f7] text-[#434752] text-xs font-semibold cursor-pointer"
                >
                  Return to Home
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
