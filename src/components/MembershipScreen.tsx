import React, { useState } from 'react';
import { MembershipApplication, UserProfile } from '../types';
import {
  User,
  Building2,
  Mail,
  Phone,
  Calendar,
  MapPin,
  FileText,
  Upload,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  CreditCard
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
  // Representative Details State
  const [fullName, setFullName] = useState(currentUser?.name || 'Er. B. Raghava Choudhary');
  const [designation, setDesignation] = useState('Managing Director');
  const [mobileNumber, setMobileNumber] = useState(currentUser?.phoneNumber || '98480 32190');
  const [emailAddress, setEmailAddress] = useState(currentUser?.email || 'raghava.solar@amaravati-epc.in');
  const [dob, setDob] = useState('1988-06-15');
  const [bloodGroup, setBloodGroup] = useState('O +ve');

  // Representative Photo State
  const [memberPhotoUrl, setMemberPhotoUrl] = useState<string>(
    currentUser?.avatarUrl ||
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDxboUC-jIFd6gy0Rk8AY1BSfmhxdF6jOsxXocg7EqCSqShZipOt7pK1rv6SIPEBx2XBWpuqHe3TO0XTse86szzJ2KeTaKJzn9YLVslaYu5ussZvZs1ZsSfeNjHWjSMuLpQSrsjeDdvtSrEPhOipY-4DXjJfDa5SS_RWxkF5RbpA3UfMjXw-oLhQ7oEKNXFgoygyo4M0woc1TA-2BpIqFf4K0JW7gL-uyDSt8GYZq_cvWi4ZqEiJzc6Wg'
  );
  const [photoFileName, setPhotoFileName] = useState('official_portrait.jpg');

  // Business / Firm Details State
  const [companyName, setCompanyName] = useState('Amaravati SunTech Solar Solutions Pvt Ltd');
  const [businessType, setBusinessType] = useState('Private Limited Company');
  const [gstNumber, setGstNumber] = useState('37AABCU9603R1ZM');
  const [district, setDistrict] = useState('NTR (Vijayawada)');
  const [experience, setExperience] = useState('5 - 10 Years');
  const [officeAddress, setOfficeAddress] = useState('D.No. 40-1-52, APIIC Industrial Area, Auto Nagar, Vijayawada');
  const [pincode, setPincode] = useState('520007');
  const [selectedScopes, setSelectedScopes] = useState<string[]>([
    'Residential Rooftop (PM Surya Ghar)',
    'Commercial & Industrial (C&I)'
  ]);

  const [declarationAccepted, setDeclarationAccepted] = useState(true);
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

    if (!fullName.trim() || !mobileNumber.trim() || !emailAddress.trim()) {
      setErrorMsg('Please complete all mandatory Representative Details.');
      return;
    }

    if (!companyName.trim() || !officeAddress.trim() || !pincode.trim()) {
      setErrorMsg('Please provide complete Business & Firm Information.');
      return;
    }

    if (!declarationAccepted) {
      setErrorMsg('Please confirm the institutional declaration before proceeding.');
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
      photoUrl: memberPhotoUrl
    };

    onProceedToPayment(applicationPayload);
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-10 px-4 sm:px-6">
      <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
        {/* Top Centered Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#003477]/10 text-[#003477] text-xs font-bold uppercase tracking-wider">
            <ShieldCheck size={14} />
            <span>State Solar Integrators Welfare Association</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#191c1e] tracking-tight">
            Institutional Membership Enrolment
          </h1>

          <p className="text-xs sm:text-sm text-[#434752] max-w-2xl mx-auto leading-relaxed">
            Fill in your authorized representative information, upload your portrait photo, and provide registered firm credentials to join the official Andhra Pradesh solar network.
          </p>

          {/* Stepper (Centered) */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#003477] bg-[#d8e2ff]/60 px-3 py-1 rounded-full border border-[#003477]/20">
              <User size={14} />
              <span>1. Representative &amp; Business Details</span>
            </div>
            <span className="text-[#ccd0d5]">→</span>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#737783]">
              <CreditCard size={14} />
              <span>2. Payment &amp; UTR Verification</span>
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
                <h3 className="text-base font-extrabold leading-tight">APSIWA Enrolment Form</h3>
                <span className="text-[11px] text-[#8ef9a0] font-semibold">
                  Andhra Pradesh Solar Integrators Welfare Association
                </span>
              </div>
            </div>
            <span className="hidden sm:inline-flex px-3 py-1 rounded-full bg-[#ffbe3b] text-[#00285e] text-xs font-black uppercase">
              Annual Fee: ₹5,000
            </span>
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
                      placeholder="e.g. Er. B. Raghava Choudhary"
                      className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-xs font-medium focus:bg-white focus:border-[#003477] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#191c1e] mb-1">Designation *</label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-3 text-[#737783]" size={15} />
                    <input
                      type="text"
                      required
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
                      placeholder="raghava@amaravati-epc.in"
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
                      placeholder="+91 98480 32190"
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
                  <h4 className="text-xs font-bold text-[#191c1e]">{photoFileName}</h4>
                  <p className="text-[11px] text-[#737783]">
                    This official photo will appear on your government-recognized APSIWA Smart Identity Card.
                  </p>
                  <span className="inline-flex items-center gap-1 text-[10px] text-[#006e2e] font-semibold">
                    <CheckCircle2 size={11} />
                    High-Res Photo Ready
                  </span>
                </div>

                <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-[#e0e3e6] text-xs font-bold text-[#003477] hover:bg-[#f2f4f7] cursor-pointer shadow-2xs transition-colors shrink-0">
                  <Upload size={14} />
                  <span>Change Photo</span>
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
                      placeholder="e.g. Amaravati SunTech Solar Solutions Pvt Ltd"
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
                    GSTIN Number (Optional/Mandatory for Pvt Ltd)
                  </label>
                  <input
                    type="text"
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                    placeholder="37AABCU9603R1ZM"
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
                    placeholder="520007"
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
                Step 1 of 2: Details will be locked upon proceeding to the secure payment screen.
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#006e2e] hover:bg-[#005322] text-white text-sm font-extrabold shadow-md transition-all cursor-pointer active:scale-98"
              >
                <span>Confirm Details &amp; Proceed to Payment</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
