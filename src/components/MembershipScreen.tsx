import React, { useState } from 'react';
import { MembershipApplication, UserProfile } from '../types';
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
  Percent,
  Tag,
  Flame
} from 'lucide-react';

interface MembershipScreenProps {
  currentUser: UserProfile | null;
  onProceedToPayment: (data: Partial<MembershipApplication>) => void;
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

const BLOOD_GROUPS = ['A +ve', 'A -ve', 'B +ve', 'B -ve', 'O +ve', 'O -ve', 'AB +ve', 'AB -ve'];

export const MembershipScreen: React.FC<MembershipScreenProps> = ({
  currentUser,
  onProceedToPayment
}) => {
  // Representative Details State (Realtime - Initialized from real logged-in user or empty)
  const [fullName, setFullName] = useState(currentUser?.name || '');
  const [designation, setDesignation] = useState(currentUser?.designation || '');
  const [mobileNumber, setMobileNumber] = useState(currentUser?.phoneNumber || '');
  const [emailAddress, setEmailAddress] = useState(currentUser?.email || '');
  const [dob, setDob] = useState('');
  const [bloodGroup, setBloodGroup] = useState(currentUser?.bloodGroup || 'O +ve');

  // Representative Photo State
  const [memberPhotoUrl, setMemberPhotoUrl] = useState<string>(currentUser?.avatarUrl || '');
  const [photoFileName, setPhotoFileName] = useState('');

  // Business / Firm Details State (Realtime empty inputs)
  const [companyName, setCompanyName] = useState(currentUser?.companyName || '');
  const [businessType, setBusinessType] = useState(currentUser?.businessType || 'Private Limited Company');
  const [gstNumber, setGstNumber] = useState(currentUser?.gstNumber || '');
  const [district, setDistrict] = useState(currentUser?.district || 'NTR (Vijayawada)');
  const [experience, setExperience] = useState('1 - 3 Years');
  const [officeAddress, setOfficeAddress] = useState(currentUser?.address || '');
  const [pincode, setPincode] = useState('');
  const [selectedScopes, setSelectedScopes] = useState<string[]>([
    'Residential Rooftop (PM Surya Ghar)'
  ]);

  const [declarationAccepted, setDeclarationAccepted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const toggleScope = (scope: string) => {
    setSelectedScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]
    );
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        setMemberPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitDetails = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim()) {
      setErrorMsg('Please enter the Representative Full Name.');
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
      mobileNumber: mobileNumber.trim(),
      emailAddress: emailAddress.trim(),
      dob: dob,
      companyName: companyName.trim(),
      gstNumber: gstNumber.trim(),
      businessType: businessType,
      experience: experience,
      district: district,
      officeAddress: officeAddress.trim(),
      pincode: pincode.trim(),
      photoUrl: memberPhotoUrl || undefined
    };

    onProceedToPayment(applicationPayload);
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-10 px-4 sm:px-6">
      <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
        {/* Top Centered Header & Special Expo Offer Callout */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#003477]/10 text-[#003477] text-xs font-bold uppercase tracking-wider">
            <ShieldCheck size={14} />
            <span>State Solar Integrators Welfare Association (APSIWA)</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#191c1e] tracking-tight">
            Institutional Membership Enrolment
          </h1>

          <p className="text-xs sm:text-sm text-[#434752] max-w-2xl mx-auto leading-relaxed">
            Register your solar EPC enterprise or installer firm into the official Andhra Pradesh state registry.
          </p>

          {/* SPECIAL EXPO OFFER BANNER (60% DISCOUNT) */}
          <div className="max-w-2xl mx-auto mt-2 bg-gradient-to-r from-[#ffbe3b]/20 via-[#ffbe3b]/30 to-[#8ef9a0]/30 border-2 border-[#ffbe3b] rounded-2xl p-3.5 sm:p-4 text-[#00285e] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-left">
              <div className="w-10 h-10 rounded-xl bg-[#003477] text-[#ffbe3b] flex items-center justify-center font-bold shrink-0 shadow-xs animate-bounce">
                <Flame size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black uppercase tracking-wider text-[#003477]">
                    Special Solar Expo Inaugural Offer
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#006e2e] text-white text-[10.5px] font-black uppercase tracking-wide">
                    60% OFF
                  </span>
                </div>
                <p className="text-[11.5px] text-[#434752] font-semibold">
                  Regular Membership Fee <span className="line-through text-[#ba1a1a]">₹5,000</span> • Special Expo Fee <span className="font-extrabold text-[#006e2e] text-[13px]">₹2,000 / Year</span>
                </p>
              </div>
            </div>

            <div className="bg-white/80 rounded-xl px-3 py-1.5 border border-[#ffbe3b]/60 text-right shrink-0">
              <span className="text-[10px] text-[#737783] block uppercase font-bold">You Save</span>
              <span className="text-sm font-black text-[#006e2e]">₹3,000 (60% Discount)</span>
            </div>
          </div>

          {/* Stepper (Centered) */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#003477] bg-[#d8e2ff]/60 px-3 py-1 rounded-full border border-[#003477]/20">
              <User size={14} />
              <span>1. Representative &amp; Business Details</span>
            </div>
            <span className="text-[#ccd0d5]">→</span>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#737783]">
              <CreditCard size={14} />
              <span>2. Payment (₹2,000 Expo Offer)</span>
            </div>
          </div>
        </div>

        {/* Unified All-in-One Form Container (Centered) */}
        <div className="bg-white rounded-3xl border border-[#e0e3e6] shadow-xl overflow-hidden">
          {/* Header Banner */}
          <div className="bg-[#003477] text-white px-6 sm:px-8 py-5 flex items-center justify-between border-b border-[#00285e]">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="APSIWA" className="h-9 w-auto object-contain bg-white rounded p-0.5" />
              <div>
                <h3 className="text-base font-extrabold leading-tight">APSIWA Realtime Enrolment Form</h3>
                <span className="text-[11px] text-[#8ef9a0] font-semibold">
                  Andhra Pradesh Solar Integrators Welfare Association
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-[#8ef9a0] uppercase font-bold block">Expo Special Offer</span>
              <span className="text-sm font-black text-[#ffbe3b]">₹2,000 <span className="line-through text-xs text-white/60 font-normal">₹5,000</span></span>
            </div>
          </div>

          {errorMsg && (
            <div className="mx-6 sm:mx-8 mt-6 p-3.5 rounded-xl bg-[#ffdad6] border border-[#ffb4ab] text-[#ba1a1a] text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-base">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmitDetails} className="p-6 sm:p-8 space-y-8">
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
                  <label className="block text-xs font-bold text-[#191c1e] mb-1">Full Name *</label>
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
                  <label className="block text-xs font-bold text-[#191c1e] mb-1">Email Address *</label>
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
                  <label className="block text-xs font-bold text-[#191c1e] mb-1">Mobile Number *</label>
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

                <div>
                  <label className="block text-xs font-bold text-[#191c1e] mb-1">Date of Birth</label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-3 text-[#737783]" size={15} />
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-xs font-medium focus:bg-white focus:border-[#003477] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#191c1e] mb-1">Blood Group</label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-xs font-medium focus:bg-white focus:border-[#003477] outline-none cursor-pointer"
                  >
                    {BLOOD_GROUPS.map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION 2: REPRESENTATIVE PHOTOGRAPH */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-[#e0e3e6]">
                <div className="w-7 h-7 rounded-lg bg-[#003477] text-white flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <h3 className="text-base font-extrabold text-[#003477]">
                  Representative Portrait Photograph
                </h3>
              </div>

              <div className="p-4 rounded-2xl bg-[#f7f9fc] border border-[#e0e3e6] flex flex-col sm:flex-row items-center gap-5">
                <div className="w-20 h-24 rounded-xl bg-white border-2 border-[#003477] overflow-hidden shadow-sm flex items-center justify-center shrink-0">
                  {memberPhotoUrl ? (
                    <img src={memberPhotoUrl} alt="Representative" className="w-full h-full object-cover" />
                  ) : (
                    <User size={32} className="text-[#737783]" />
                  )}
                </div>

                <div className="flex-1 space-y-1 text-center sm:text-left">
                  <h4 className="text-xs font-bold text-[#191c1e]">
                    {photoFileName || (memberPhotoUrl ? 'Photo Uploaded' : 'Upload Passport Size Photo')}
                  </h4>
                  <p className="text-[11px] text-[#737783]">
                    This official photo will appear on your government-recognized APSIWA Smart Identity Card.
                  </p>
                </div>

                <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-[#e0e3e6] text-xs font-bold text-[#003477] hover:bg-[#f2f4f7] cursor-pointer shadow-2xs transition-colors shrink-0">
                  <Upload size={14} />
                  <span>{memberPhotoUrl ? 'Change Photo' : 'Upload Photo'}</span>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
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
                    Company / Firm Legal Name *
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
                    Business Constitution *
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
                    Andhra Pradesh District *
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
                    Industry Experience *
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
                    Registered Office Address *
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
                  <label className="block text-xs font-bold text-[#191c1e] mb-1">Pincode *</label>
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

              {/* Solar Installation Scope Chips */}
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
    </div>
  );
};
