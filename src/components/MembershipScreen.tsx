import React, { useState } from 'react';
import { MembershipApplication } from '../types';

interface MembershipScreenProps {
  onSubmitApplication: (app: MembershipApplication) => void;
  onNavigateHome?: () => void;
  onOpenTracker?: () => void;
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
  'Sole Proprietorship',
  'Partnership Firm',
  'Limited Liability Partnership (LLP)',
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
  onSubmitApplication,
  onNavigateHome,
  onOpenTracker
}) => {
  // Member Personal Details Form State
  const [fullName, setFullName] = useState('B. Raghava Choudhary');
  const [designation, setDesignation] = useState('Managing Director');
  const [mobileNumber, setMobileNumber] = useState('98480 32190');
  const [emailAddress, setEmailAddress] = useState('raghava.solar@amaravati-epc.in');
  const [dob, setDob] = useState('1988-06-15');

  // Business / Firm Details Form State
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

  const [memberPhotoUrl, setMemberPhotoUrl] = useState<string>(
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDxboUC-jIFd6gy0Rk8AY1BSfmhxdF6jOsxXocg7EqCSqShZipOt7pK1rv6SIPEBx2XBWpuqHe3TO0XTse86szzJ2KeTaKJzn9YLVslaYu5ussZvZs1ZsSfeNjHWjSMuLpQSrsjeDdvtSrEPhOipY-4DXjJfDa5SS_RWxkF5RbpA3UfMjXw-oLhQ7oEKNXFgoygyo4M0woc1TA-2BpIqFf4K0JW7gL-uyDSt8GYZq_cvWi4ZqEiJzc6Wg'
  );

  const [utrNumber, setUtrNumber] = useState('409218204910');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentReceiptUrl, setPaymentReceiptUrl] = useState<string>(
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDKQoPqerF6MxsFeWOQEuqjZRMOpmIHXD4ubJsjC-HLBkb6H8aH9E9q4bIuwFwOaQ9HK3Sl8Oi7yGFQsqhG4gzs4IAJR6F5Q4YqVeAWJmOkjit-g7lwqdHivjTfhp8-bLHcRqeadCaE1t74t3t6gYv7azrvqiE2k6DlgVUwMN8KJCsNkOaLr8bg1e3HlnPyaCfMTDN4U0wMK5fgZI_vn5mcEVrdfVRypfOrTx3_NkRqVrmFLkSMKtwx4A'
  );

  const [declarationAccepted, setDeclarationAccepted] = useState(true);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedApp, setSubmittedApp] = useState<MembershipApplication | null>(null);

  // Toggle scope
  const toggleScope = (scope: string) => {
    setSelectedScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]
    );
  };

  // Copy UPI ID
  const handleCopyUpi = () => {
    navigator.clipboard.writeText('apsiwa.association@sbi');
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  // Handle Photo Upload
  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setMemberPhotoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Receipt Upload
  const handleReceiptFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setPaymentReceiptUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Submission handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!declarationAccepted) {
      alert('Please check and accept the declaration to submit your application.');
      return;
    }
    if (
      !fullName.trim() ||
      !companyName.trim() ||
      !mobileNumber.trim() ||
      !emailAddress.trim() ||
      !district.trim() ||
      !officeAddress.trim() ||
      !utrNumber.trim()
    ) {
      alert('Please fill in all mandatory fields marked with an asterisk (*).');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      const randomSuffix = Math.floor(10000 + Math.random() * 90000);
      const newApp: MembershipApplication = {
        id: `APSIWA-2026-${randomSuffix}`,
        fullName,
        mobileNumber,
        emailAddress,
        dob,
        companyName,
        businessType,
        gstNumber,
        district,
        experience,
        officeAddress,
        pincode,
        photoUrl: memberPhotoUrl,
        utrNumber,
        paymentDate,
        amountPaid: '₹ 5,000.00',
        paymentScreenshotUrl: paymentReceiptUrl,
        submissionDate: new Date().toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }),
        status: 'Pending Verification'
      };

      onSubmitApplication(newApp);
      setSubmittedApp(newApp);
      setSubmitting(false);
    }, 600);
  };

  const handlePrintSlip = () => {
    window.print();
  };

  return (
    <div className="w-full bg-[#f7f9fc] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-margin">
        {/* Breadcrumb & Heading */}
        <div className="flex flex-col space-y-2 mb-8">
          <div className="flex items-center gap-2">
            <span className="h-0.5 w-6 bg-[#003477]"></span>
            <span className="text-[11px] text-[#003477] uppercase font-bold tracking-widest">
              MEMBERSHIP ENROLMENT PORTAL 2026-27
            </span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="font-display-lg text-[#003477] tracking-tight">
                Become an APSIWA Member
              </h1>
              <p className="font-body-md text-[#434752] max-w-2xl mt-1">
                Register your solar integration business firm and authorized representative below. Complete unified
                UPI remittance for state accreditation, official firm certification, and member privileges.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#ffffff] border border-[#e0e3e6] shadow-xs shrink-0 self-start md:self-auto">
              <span className="w-2.5 h-2.5 rounded-full bg-[#006e2e]"></span>
              <span className="text-[12px] font-semibold text-[#191c1e]">
                Official AP Portal • Secured Verification Engine
              </span>
            </div>
          </div>
        </div>

        {/* 2-Column Responsive Layout */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN: Representative Details, Business Firm Stuff, & Member Photo */}
          <div className="lg:col-span-7 space-y-6">
            {/* 01 Representative Details */}
            <div className="bg-[#ffffff] rounded-2xl p-6 border border-[#e0e3e6] shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#e0e3e6] pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-[#003477] text-white flex items-center justify-center text-[12px] font-bold">
                    01
                  </span>
                  <h2 className="text-[16px] font-bold text-[#191c1e]">Representative Details</h2>
                </div>
                <span className="text-[11px] text-[#434752] font-semibold uppercase tracking-wider">
                  Authorized Signatory
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[13px] font-semibold text-[#191c1e] mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter Authorized Representative Name"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-[#191c1e] text-[14px] focus:bg-[#ffffff] focus:border-[#003477] focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-[#191c1e] mb-1">
                    Designation / Role in Firm
                  </label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="e.g. Managing Director / Proprietor"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-[#191c1e] text-[14px] focus:bg-[#ffffff] focus:border-[#003477] focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-[#191c1e] mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-[#191c1e] text-[14px] focus:bg-[#ffffff] focus:border-[#003477] focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-[#191c1e] mb-1">
                    Mobile Number *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-[14px] font-semibold text-[#434752]">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="10-digit number"
                      className="w-full pl-12 pr-3.5 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-[#191c1e] text-[14px] focus:bg-[#ffffff] focus:border-[#003477] focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-[#191c1e] mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-[#191c1e] text-[14px] focus:bg-[#ffffff] focus:border-[#003477] focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* 02 Business Firm Information */}
            <div className="bg-[#ffffff] rounded-2xl p-6 border border-[#e0e3e6] shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#e0e3e6] pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-[#003477] text-white flex items-center justify-center text-[12px] font-bold">
                    02
                  </span>
                  <h2 className="text-[16px] font-bold text-[#191c1e]">Business Firm Details</h2>
                </div>
                <span className="text-[11px] text-[#434752] font-semibold uppercase tracking-wider">
                  Solar Enterprise Data
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[13px] font-semibold text-[#191c1e] mb-1">
                    Firm / Enterprise Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Amaravati SunTech Solar Solutions Pvt Ltd"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-[#191c1e] text-[14px] focus:bg-[#ffffff] focus:border-[#003477] focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-[#191c1e] mb-1">
                    Business Entity Type *
                  </label>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-[#191c1e] text-[14px] focus:bg-[#ffffff] focus:border-[#003477] focus:outline-none transition-all cursor-pointer"
                  >
                    {BUSINESS_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-[#191c1e] mb-1">
                    GSTIN / Registration Number
                  </label>
                  <input
                    type="text"
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                    placeholder="e.g. 37AABCU9603R1ZM"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-[#191c1e] text-[14px] uppercase focus:bg-[#ffffff] focus:border-[#003477] focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-[#191c1e] mb-1">
                    Operational District in Andhra Pradesh *
                  </label>
                  <select
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-[#191c1e] text-[14px] focus:bg-[#ffffff] focus:border-[#003477] focus:outline-none transition-all cursor-pointer"
                  >
                    {AP_DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-[#191c1e] mb-1">
                    Solar Industry Experience *
                  </label>
                  <select
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-[#191c1e] text-[14px] focus:bg-[#ffffff] focus:border-[#003477] focus:outline-none transition-all cursor-pointer"
                  >
                    {EXPERIENCE_LEVELS.map((exp) => (
                      <option key={exp} value={exp}>
                        {exp}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[13px] font-semibold text-[#191c1e] mb-1">
                    Registered Business Office Address in AP *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={officeAddress}
                    onChange={(e) => setOfficeAddress(e.target.value)}
                    placeholder="Building / Plot No, Street, Landmark, City/Town"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-[#191c1e] text-[14px] focus:bg-[#ffffff] focus:border-[#003477] focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-[#191c1e] mb-1">
                    Postal PIN Code *
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="6-digit PIN (e.g. 520007)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-[#191c1e] text-[14px] focus:bg-[#ffffff] focus:border-[#003477] focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-[#191c1e] mb-1">
                    State Jurisdiction
                  </label>
                  <input
                    type="text"
                    readOnly
                    value="Andhra Pradesh (APSIWA Jurisdiction)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#eceef1] border border-[#e0e3e6] text-[#434752] text-[14px] font-medium cursor-not-allowed"
                  />
                </div>

                {/* Integration Scopes Checkboxes */}
                <div className="sm:col-span-2 pt-2 border-t border-[#e0e3e6]">
                  <label className="block text-[13px] font-semibold text-[#191c1e] mb-2">
                    Primary Integration &amp; EPC Scope
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {SOLAR_SCOPES.map((scope) => {
                      const isSelected = selectedScopes.includes(scope);
                      return (
                        <button
                          type="button"
                          key={scope}
                          onClick={() => toggleScope(scope)}
                          className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all border cursor-pointer flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-[#003477] text-white border-[#003477]'
                              : 'bg-[#f2f4f7] text-[#434752] border-[#e0e3e6] hover:bg-[#e0e3e6]'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[15px]">
                            {isSelected ? 'check_circle' : 'add_circle'}
                          </span>
                          <span>{scope}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* 03 Member Photo */}
            <div className="bg-[#ffffff] rounded-2xl p-6 border border-[#e0e3e6] shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#e0e3e6] pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-[#003477] text-white flex items-center justify-center text-[12px] font-bold">
                    03
                  </span>
                  <h2 className="text-[16px] font-bold text-[#191c1e]">Representative Photograph</h2>
                </div>
                <span className="text-[11px] text-[#434752] font-semibold uppercase tracking-wider">
                  ID Card &amp; Certificate
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                {/* Photo Preview Frame */}
                <div className="relative w-32 h-40 rounded-xl overflow-hidden bg-[#eceef1] border-2 border-dashed border-[#c3c6d4] flex items-center justify-center shrink-0">
                  {memberPhotoUrl ? (
                    <img
                      src={memberPhotoUrl}
                      alt="Applicant Photo Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-center p-2 text-[#737783]">
                      <span className="material-symbols-outlined text-[32px]">account_box</span>
                      <span className="text-[10px] mt-1">35mm x 45mm</span>
                    </div>
                  )}
                  {memberPhotoUrl && (
                    <button
                      type="button"
                      onClick={() => setMemberPhotoUrl('')}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 cursor-pointer"
                      title="Remove Photo"
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  )}
                </div>

                {/* Upload Action */}
                <div className="flex-1 space-y-2 text-center sm:text-left">
                  <p className="text-[13px] font-semibold text-[#191c1e]">
                    Passport Size Photograph
                  </p>
                  <p className="text-[12px] text-[#434752] leading-relaxed">
                    Clear front-facing photo on light background. Used on your official APSIWA State
                    Accreditation ID Card and member credential.
                  </p>
                  <div className="pt-2">
                    <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#f2f4f7] hover:bg-[#e0e3e6] text-[#003477] text-[13px] font-semibold cursor-pointer transition-colors border border-[#e0e3e6]">
                      <span className="material-symbols-outlined text-[18px]">add_a_photo</span>
                      <span>Choose Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-[11px] text-[#737783]">Format: JPG, PNG • Max size: 2 MB</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Fees, UPI Payment & Confirmation */}
          <div className="lg:col-span-5 space-y-6">
            {/* Membership Fee Card */}
            <div className="bg-[#ffffff] rounded-2xl p-6 border border-[#e0e3e6] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-[#d8e2ff] text-[#001a42] text-[11px] font-bold uppercase tracking-wider">
                  Annual Tier
                </span>
                <span className="text-[12px] text-[#006e2e] font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">verified</span> Active Period 2026-27
                </span>
              </div>

              <div>
                <p className="text-[12px] text-[#434752] uppercase font-bold tracking-wider">
                  Institutional Assessment
                </p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-3xl font-bold text-[#003477]">₹ 5,000</span>
                  <span className="text-[13px] text-[#434752]">/ Year</span>
                </div>
                <p className="text-[11px] text-[#737783] mt-0.5">
                  GST Exempt • Associational Welfare Membership Dues
                </p>
              </div>

              {/* Perks List */}
              <div className="pt-3 border-t border-[#e0e3e6] space-y-2 text-[12px] text-[#434752]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#006e2e] text-[18px]">check_circle</span>
                  <span>Direct DISCOM &amp; APERC Regulatory Representation</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#006e2e] text-[18px]">check_circle</span>
                  <span>Official Accredited Solar Integrator Directory Listing</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#006e2e] text-[18px]">check_circle</span>
                  <span>Institutional Legal, Dispute, and Arbitration Advisory</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#006e2e] text-[18px]">check_circle</span>
                  <span>Quarterly Inverter Masterclasses &amp; Field Certifications</span>
                </div>
              </div>
            </div>

            {/* Pay Using UPI */}
            <div className="bg-[#ffffff] rounded-2xl p-6 border border-[#e0e3e6] shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#e0e3e6] pb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#003477] text-[22px]">qr_code_scanner</span>
                  <h2 className="text-[16px] font-bold text-[#191c1e]">Pay Using UPI</h2>
                </div>
                <span className="text-[11px] text-[#006e2e] font-bold uppercase tracking-wider">
                  Instant Clearance
                </span>
              </div>

              {/* QR Code Presentation Box */}
              <div className="flex flex-col items-center text-center p-4 bg-[#f7f9fc] rounded-xl border border-[#e0e3e6]">
                <div className="p-3 bg-white rounded-xl shadow-xs border border-[#e0e3e6]">
                  {/* Clean SVG Vector QR code */}
                  <svg className="w-44 h-44" viewBox="0 0 200 200" fill="none">
                    <rect width="200" height="200" fill="white" rx="8" />

                    {/* Top-Left Finder */}
                    <rect x="16" y="16" width="48" height="48" rx="4" fill="#003477" />
                    <rect x="24" y="24" width="32" height="32" rx="2" fill="white" />
                    <rect x="30" y="30" width="20" height="20" rx="2" fill="#003477" />

                    {/* Top-Right Finder */}
                    <rect x="136" y="16" width="48" height="48" rx="4" fill="#003477" />
                    <rect x="144" y="24" width="32" height="32" rx="2" fill="white" />
                    <rect x="150" y="30" width="20" height="20" rx="2" fill="#003477" />

                    {/* Bottom-Left Finder */}
                    <rect x="16" y="136" width="48" height="48" rx="4" fill="#003477" />
                    <rect x="24" y="144" width="32" height="32" rx="2" fill="white" />
                    <rect x="30" y="150" width="20" height="20" rx="2" fill="#003477" />

                    {/* Data Matrix Dots Pattern */}
                    <rect x="74" y="20" width="8" height="8" fill="#191c1e" />
                    <rect x="90" y="20" width="8" height="8" fill="#191c1e" />
                    <rect x="110" y="20" width="12" height="8" fill="#191c1e" />
                    <rect x="74" y="36" width="12" height="8" fill="#191c1e" />
                    <rect x="100" y="36" width="8" height="8" fill="#191c1e" />
                    <rect x="116" y="36" width="8" height="8" fill="#191c1e" />
                    <rect x="80" y="52" width="8" height="12" fill="#191c1e" />
                    <rect x="104" y="52" width="16" height="8" fill="#191c1e" />

                    <rect x="20" y="74" width="8" height="16" fill="#191c1e" />
                    <rect x="36" y="80" width="12" height="8" fill="#191c1e" />
                    <rect x="54" y="74" width="8" height="12" fill="#191c1e" />
                    <rect x="20" y="104" width="16" height="8" fill="#191c1e" />
                    <rect x="44" y="100" width="8" height="16" fill="#191c1e" />

                    <rect x="140" y="74" width="12" height="8" fill="#191c1e" />
                    <rect x="164" y="74" width="8" height="16" fill="#191c1e" />
                    <rect x="140" y="96" width="16" height="8" fill="#191c1e" />
                    <rect x="168" y="100" width="8" height="16" fill="#191c1e" />

                    <rect x="74" y="140" width="8" height="16" fill="#191c1e" />
                    <rect x="90" y="140" width="16" height="8" fill="#191c1e" />
                    <rect x="114" y="144" width="8" height="8" fill="#191c1e" />
                    <rect x="140" y="140" width="12" height="12" fill="#191c1e" />
                    <rect x="160" y="144" width="8" height="16" fill="#191c1e" />
                    <rect x="80" y="168" width="16" height="8" fill="#191c1e" />
                    <rect x="108" y="164" width="8" height="16" fill="#191c1e" />
                    <rect x="130" y="168" width="16" height="8" fill="#191c1e" />
                    <rect x="160" y="172" width="12" height="8" fill="#191c1e" />

                    {/* Center Brand Badge (Lightning Bolt) */}
                    <rect x="80" y="80" width="40" height="40" rx="8" fill="#003477" />
                    <path
                      d="M102 88L92 102H101L98 112L108 98H99L102 88Z"
                      fill="#8ef9a0"
                      stroke="#8ef9a0"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <p className="text-[13px] font-bold text-[#003477] mt-3">Scan &amp; Pay ₹5,000</p>
                <p className="text-[11px] text-[#434752] mt-0.5">
                  Scan with any BHIM UPI app on your smartphone
                </p>
              </div>

              {/* Association UPI ID Copy Box */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6]">
                <div className="flex flex-col">
                  <span className="text-[11px] text-[#434752] font-semibold uppercase tracking-wider">
                    APSIWA Official UPI ID
                  </span>
                  <span className="text-[14px] font-mono font-bold text-[#003477] select-all">
                    apsiwa.association@sbi
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="px-3 py-1.5 rounded-lg bg-[#ffffff] hover:bg-[#eceef1] text-[#003477] text-[12px] font-semibold transition-all border border-[#e0e3e6] cursor-pointer flex items-center gap-1 active:scale-95"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {copiedUpi ? 'done' : 'content_copy'}
                  </span>
                  <span>{copiedUpi ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>

              {/* Supported Payment Apps */}
              <div className="flex items-center justify-center gap-4 text-[11px] text-[#434752] font-semibold pt-1">
                <span>Google Pay</span>
                <span>•</span>
                <span>PhonePe</span>
                <span>•</span>
                <span>Paytm</span>
                <span>•</span>
                <span>BHIM</span>
                <span>•</span>
                <span>SBI YONO</span>
              </div>
            </div>

            {/* 03 Payment Confirmation */}
            <div className="bg-[#ffffff] rounded-2xl p-6 border border-[#e0e3e6] shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#e0e3e6] pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-[#003477] text-white flex items-center justify-center text-[12px] font-bold">
                    03
                  </span>
                  <h2 className="text-[16px] font-bold text-[#191c1e]">Payment Confirmation</h2>
                </div>
                <span className="text-[11px] text-[#434752] font-semibold uppercase tracking-wider">
                  Verification Step
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[13px] font-semibold text-[#191c1e] mb-1">
                    12-Digit Transaction / UTR Number *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={16}
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                    placeholder="e.g. 408271829104"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-[#191c1e] text-[14px] font-mono focus:bg-[#ffffff] focus:border-[#003477] focus:outline-none transition-all"
                  />
                  <p className="text-[11px] text-[#737783] mt-1">
                    Found in your bank SMS or UPI transaction details as UTR / Ref No.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[13px] font-semibold text-[#191c1e] mb-1">
                      Payment Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-[#191c1e] text-[13px] focus:bg-[#ffffff] focus:border-[#003477] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-[#191c1e] mb-1">
                      Amount Paid
                    </label>
                    <input
                      type="text"
                      disabled
                      value="₹ 5,000.00"
                      className="w-full px-3.5 py-2 rounded-xl bg-[#eceef1] border border-[#e0e3e6] text-[#003477] font-bold text-[13px] cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Upload Receipt Screenshot */}
                <div>
                  <label className="block text-[13px] font-semibold text-[#191c1e] mb-1">
                    Payment Receipt / Screenshot *
                  </label>
                  <div className="p-3 bg-[#f2f4f7] rounded-xl border border-[#e0e3e6] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 overflow-hidden">
                      {paymentReceiptUrl ? (
                        <img
                          src={paymentReceiptUrl}
                          alt="Receipt Preview"
                          className="w-12 h-12 rounded-lg object-cover border border-[#c3c6d4] shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-[#eceef1] flex items-center justify-center text-[#737783] shrink-0">
                          <span className="material-symbols-outlined text-[20px]">receipt_long</span>
                        </div>
                      )}
                      <div className="truncate">
                        <p className="text-[12px] font-bold text-[#191c1e] truncate">
                          {paymentReceiptUrl ? 'Screenshot Attached' : 'No Receipt Attached'}
                        </p>
                        <p className="text-[10px] text-[#737783]">JPG, PNG or PDF screenshot</p>
                      </div>
                    </div>
                    <label className="px-3 py-1.5 rounded-lg bg-white hover:bg-[#eceef1] text-[#003477] text-[12px] font-semibold cursor-pointer border border-[#e0e3e6] shrink-0 transition-colors">
                      Browse
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleReceiptFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Declaration & Submission */}
            <div className="bg-[#ffffff] rounded-2xl p-6 border border-[#e0e3e6] shadow-xs space-y-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={declarationAccepted}
                  onChange={(e) => setDeclarationAccepted(e.target.checked)}
                  className="w-5 h-5 rounded border-[#c3c6d4] text-[#003477] focus:ring-[#003477] mt-0.5"
                />
                <span className="text-[12px] text-[#434752] leading-relaxed select-none">
                  I hereby solemnly declare that all particulars furnished above are true and correct to the
                  best of my knowledge, and agree to abide by the constitution, code of ethics, and statutory
                  guidelines of Andhra Pradesh Solar Integrators Welfare Association (APSIWA).
                </span>
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 px-6 rounded-xl bg-[#024aa3] hover:bg-[#003477] text-white text-[15px] font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98 disabled:opacity-75"
              >
                {submitting ? (
                  <>
                    <span className="material-symbols-outlined text-[20px] animate-spin">refresh</span>
                    <span>Processing Registry Filing...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Membership Application</span>
                    <span className="material-symbols-outlined text-[20px]">how_to_reg</span>
                  </>
                )}
              </button>
              <p className="text-[11px] text-center text-[#737783]">
                Secured SSL submission to Andhra Pradesh Solar Integrators Welfare Association Central Registry.
              </p>
            </div>
          </div>
        </form>
      </div>

      {/* SUBMISSION SUCCESS MODAL */}
      {submittedApp && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#ffffff] rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#e0e3e6]">
            {/* Modal Header */}
            <div className="bg-[#003477] text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  alt="APSIWA Official Logo"
                  className="h-10 w-auto object-contain brightness-0 invert"
                  src="https://lh3.googleusercontent.com/aida/AEtjO1XtZkjiEfKiqomreBUaiGljqTkyNgi1FUkOKJ3HvrCFYW8jYu8s7SUfAaG_WWw1VyG9kMbiZYBFjTbThj1g23WGqAkfylwD0MzfiMx2scfOtl_9YCFQzWF49omfwDGWJLCRAcjX99Jhbi1k8hQC5aG4ZRZ9o2CYYASYm1smUcxiC_FvrnMSfYE1H3_ZOdLP6sTUBjgaUTVNLcNGHLUFkzc5aCOd771sc1SKjEmXcbNyjyFgIn_OkJJwzUs3"
                />
                <div>
                  <h2 className="text-[16px] font-bold leading-tight">APSIWA Registry</h2>
                  <p className="text-[11px] text-[#8ef9a0] font-semibold uppercase tracking-wider">
                    Enrolment Filed
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSubmittedApp(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 p-3.5 bg-[#f2f4f7] rounded-xl border border-[#e0e3e6]">
                <div className="w-10 h-10 rounded-full bg-[#006e2e] text-white flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[24px]">verified</span>
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-[#191c1e]">
                    Application Submitted Successfully!
                  </h3>
                  <p className="text-[12px] text-[#434752]">
                    Your registration has been recorded in the state integrator registry.
                  </p>
                </div>
              </div>

              {/* Docket Details */}
              <div className="bg-[#f7f9fc] rounded-xl p-4 space-y-2.5 text-[13px] border border-[#e0e3e6]">
                <div className="flex items-center justify-between">
                  <span className="text-[#434752]">Application ID:</span>
                  <span className="font-mono font-bold text-[#003477]">{submittedApp.id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#434752]">Firm Name:</span>
                  <span className="font-semibold text-[#191c1e] text-right">{submittedApp.companyName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#434752]">Representative:</span>
                  <span className="font-semibold text-[#191c1e]">{submittedApp.fullName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#434752]">Operating District:</span>
                  <span className="font-semibold text-[#191c1e]">{submittedApp.district || 'Andhra Pradesh'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#434752]">Mobile Number:</span>
                  <span className="font-semibold text-[#191c1e]">+91 {submittedApp.mobileNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#434752]">Email Address:</span>
                  <span className="text-[#191c1e]">{submittedApp.emailAddress}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#434752]">Transaction UTR:</span>
                  <span className="font-mono text-[#191c1e]">{submittedApp.utrNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#434752]">Status:</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#ffdad6] text-[#ba1a1a] text-[11px] font-bold">
                    {submittedApp.status}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[#e0e3e6]">
                  <span className="text-[#434752]">Amount Confirmed:</span>
                  <span className="text-[15px] font-bold text-[#006e2e]">{submittedApp.amountPaid}</span>
                </div>
              </div>

              <p className="text-[12px] text-[#434752] leading-relaxed">
                The APSIWA Secretariat will verify your remittance and business credentials within 2 business days. Once approved,
                your official Firm Accreditation Certificate and Member ID Card will be dispatched to
                your registered email address.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handlePrintSlip}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#003477] text-white text-[13px] font-semibold hover:bg-[#024aa3] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                  <span>Print Acknowledgment</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSubmittedApp(null);
                    if (onOpenTracker) {
                      onOpenTracker();
                    } else if (onNavigateHome) {
                      onNavigateHome();
                    }
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#ffffff] text-[#003477] text-[13px] font-semibold hover:bg-[#eceef1] border border-[#e0e3e6] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">track_changes</span>
                  <span>Track Application Status</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
