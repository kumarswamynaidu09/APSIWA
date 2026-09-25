import React, { useState } from 'react';
import { MembershipApplication, UserProfile, WebsiteSettings } from '../types';
import {
  CreditCard,
  QrCode,
  Copy,
  CheckCircle2,
  Calendar,
  Upload,
  ArrowLeft,
  ShieldCheck,
  Check,
  Flame,
  Clock,
  UserCheck,
  AlertCircle,
  ExternalLink,
  Lock,
  Download,
  FileText,
  Printer
} from 'lucide-react';
import { saveMembershipApplication, DEFAULT_WEBSITE_SETTINGS, calculateValidityDate } from '../lib/supabase';
import { compressImage, validateImageFile } from '../lib/imageUtils';

interface PaymentScreenProps {
  applicationData: Partial<MembershipApplication> | null;
  currentUser: UserProfile | null;
  websiteSettings?: WebsiteSettings;
  onPaymentSuccess: (newApp: MembershipApplication) => void;
  onBackToMembership: () => void;
  onNavigateProfile: () => void;
}

export const PaymentScreen: React.FC<PaymentScreenProps> = ({
  applicationData,
  currentUser,
  websiteSettings = DEFAULT_WEBSITE_SETTINGS,
  onPaymentSuccess,
  onBackToMembership,
  onNavigateProfile
}) => {
  // Dynamic settings from Admin
  const activeFee = websiteSettings.isExpoActive ? websiteSettings.expoFee : websiteSettings.regularFee;
  const regularFee = websiteSettings.regularFee;
  const discountPct = websiteSettings.expoDiscountPercentage;
  const upiId = websiteSettings.upiId || 'andhrapradeshsolarintegratorswelfareassociation@idbi';
  const accountNumber = websiteSettings.accountNumber || '1018102000010052';
  const ifscCode = websiteSettings.ifscCode || 'IBKL0001018';
  const qrCodeUrl = websiteSettings.qrCodeUrl || '/payment-qr.png';
  const bankName = websiteSettings.bankName || 'IDBI BANK';
  const bankBranch = websiteSettings.bankBranch || 'Seethamadhara Branch';

  // Realtime state - clean and empty for user's actual UTR & date
  const [utrNumber, setUtrNumber] = useState(applicationData?.utrNumber || '');
  const [paymentDate, setPaymentDate] = useState(
    applicationData?.paymentDate || new Date().toISOString().split('T')[0]
  );
  const [screenshotUrl, setScreenshotUrl] = useState<string>(applicationData?.paymentScreenshotUrl || '');
  const [screenshotFileName, setScreenshotFileName] = useState('');

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Modal states: 'pending_approval' -> 'approved'
  const [submittedApp, setSubmittedApp] = useState<MembershipApplication | null>(null);
  const [adminApproving, setAdminApproving] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [downloadingQr, setDownloadingQr] = useState(false);

  // Representative & Firm summary details from actual user / form
  const repName = applicationData?.fullName || currentUser?.name || 'Applicant';
  const repDob = applicationData?.dateOfBirth || currentUser?.dateOfBirth || '';
  const repPhoto = applicationData?.photoUrl || currentUser?.avatarUrl || '';
  const repEmail = applicationData?.emailAddress || currentUser?.email || '';
  const repPhone = applicationData?.mobileNumber || currentUser?.phoneNumber || '';
  const repCompany = applicationData?.companyName || currentUser?.companyName || 'Solar EPC Enterprise';
  const repDistrict = applicationData?.district || currentUser?.district || 'Andhra Pradesh';

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleDownloadQr = async () => {
    setDownloadingQr(true);
    try {
      if (qrCodeUrl.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = qrCodeUrl;
        link.download = 'APSIWA-Official-Payment-QR.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setDownloadingQr(false);
        return;
      }

      const response = await fetch(qrCodeUrl, { mode: 'cors' });
      if (response.ok) {
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = 'APSIWA-Official-Payment-QR.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
        setDownloadingQr(false);
        return;
      }
      throw new Error('Direct fetch failed');
    } catch {
      // Fallback via Image object + canvas or new window
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || 400;
          canvas.height = img.naturalHeight || 400;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const dataUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = 'APSIWA-Official-Payment-QR.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
        } catch {
          window.open(qrCodeUrl, '_blank');
        }
        setDownloadingQr(false);
      };
      img.onerror = () => {
        window.open(qrCodeUrl, '_blank');
        setDownloadingQr(false);
      };
      img.src = qrCodeUrl;
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateImageFile(file, 10);
      if (!validation.valid) {
        setErrorMsg(validation.error || 'Invalid file');
        return;
      }
      try {
        setErrorMsg('');
        setScreenshotFileName(file.name);
        const { dataUrl } = await compressImage(file, {
          maxWidth: 900,
          maxHeight: 900,
          quality: 0.7
        });
        setScreenshotUrl(dataUrl);
      } catch {
        setErrorMsg('Could not process screenshot image. Please try another.');
      }
    }
  };

  // Submit payment for Admin review
  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!utrNumber.trim() || utrNumber.trim().length < 6) {
      setErrorMsg('Please enter a valid Bank UTR / UPI Transaction Reference Number.');
      return;
    }

    if (!screenshotUrl || !screenshotUrl.trim()) {
      setErrorMsg('Payment receipt screenshot is compulsory. Please upload a screenshot of your payment receipt before submitting.');
      return;
    }

    setSubmitting(true);

    const newApplicationId = `APSIWA-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const pendingApp: MembershipApplication = {
      id: newApplicationId,
      fullName: repName,
      dateOfBirth: repDob,
      mobileNumber: repPhone,
      emailAddress: repEmail,
      companyName: repCompany,
      designation: applicationData?.designation || currentUser?.designation || 'Solar Representative',
      district: repDistrict,
      gstNumber: applicationData?.gstNumber || '',
      businessType: applicationData?.businessType || 'Private Limited Company',
      experience: applicationData?.experience || '1 - 3 Years',
      officeAddress: applicationData?.officeAddress || '',
      pincode: applicationData?.pincode || '',
      photoUrl: repPhoto,
      utrNumber: utrNumber.trim(),
      paymentDate: paymentDate,
      amountPaid: `₹ ${activeFee.toLocaleString('en-IN')}.00`,
      paymentScreenshotUrl: screenshotUrl || undefined,
      submissionDate: new Date().toLocaleDateString('en-IN', {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
      }),
      validUntil: calculateValidityDate(paymentDate),
      status: 'Pending Verification'
    };

    try {
      // Save realtime to Supabase as Pending Verification
      const res = await saveMembershipApplication(pendingApp, currentUser?.id);
      if (res.error) {
        console.warn('Membership application save notice:', res.error);
      }

      setSubmitting(false);
      setSubmittedApp(pendingApp);
      setIsApproved(false);
      onPaymentSuccess(pendingApp);
    } catch (err: any) {
      console.error('Error saving application:', err);
      setSubmitting(false);
      setSubmittedApp(pendingApp);
      setIsApproved(false);
      onPaymentSuccess(pendingApp);
    }
  };

  // Admin Approval Action Handler
  const handleAdminApprove = async () => {
    if (!submittedApp) return;
    setAdminApproving(true);

    const approvedApp: MembershipApplication = {
      ...submittedApp,
      status: 'Approved'
    };

    try {
      // Save status change in realtime to Supabase
      await saveMembershipApplication(approvedApp, currentUser?.id);
      
      setTimeout(() => {
        setAdminApproving(false);
        setSubmittedApp(approvedApp);
        setIsApproved(true);
        onPaymentSuccess(approvedApp);
      }, 700);
    } catch (err) {
      setAdminApproving(false);
      setSubmittedApp(approvedApp);
      setIsApproved(true);
      onPaymentSuccess(approvedApp);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-10 px-4 sm:px-6">
      <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in zoom-in-98 duration-200">
        {/* Top Centered Header & Stepper */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#003477]/10 text-[#003477] text-xs font-bold uppercase tracking-wider">
            <ShieldCheck size={14} />
            <span>APSIWA Official Enrolment Portal</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#191c1e] tracking-tight">
            Membership Fee Payment &amp; Verification
          </h1>

          <p className="text-xs sm:text-sm text-[#434752] max-w-xl mx-auto">
            Scan the official APSIWA UPI QR code or transfer via NEFT/RTGS to complete your state enrolment.
          </p>

          {/* Stepper (Centered) */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#006e2e]">
              <CheckCircle2 size={16} />
              <span>1. Application Details Confirmed</span>
            </div>
            <span className="text-[#ccd0d5]">→</span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#003477] bg-[#d8e2ff]/50 px-3 py-1 rounded-full border border-[#003477]/20">
              <CreditCard size={14} />
              <span>2. Payment &amp; UTR Verification</span>
            </div>
          </div>
        </div>

        {/* Main Centered Container */}
        <div className="bg-white rounded-3xl border border-[#e0e3e6] shadow-xl overflow-hidden">
          {/* Summary Banner with Expo Discount */}
          <div className="bg-gradient-to-r from-[#003477] via-[#024aa3] to-[#00285e] text-white p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#00285e]">
            <div className="flex items-center gap-4">
              <div className="w-14 h-16 rounded-xl bg-white/15 border-2 border-white/40 overflow-hidden flex items-center justify-center shrink-0 shadow-sm">
                {repPhoto ? (
                  <img src={repPhoto} alt={repName} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-extrabold text-lg text-white">{repName.charAt(0)}</span>
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10.5px] uppercase font-bold text-[#8ef9a0] tracking-widest block">
                    Enrolment Summary
                  </span>
                  {websiteSettings.isExpoActive && (
                    <span className="px-2 py-0.5 rounded-full bg-[#ffbe3b] text-[#00285e] text-[10px] font-black uppercase">
                      🎉 Expo Offer ({discountPct}% OFF)
                    </span>
                  )}
                </div>
                <h3 className="text-lg sm:text-xl font-black">{repName}</h3>
                <p className="text-xs text-white/80 font-medium flex items-center gap-2 flex-wrap">
                  <span>{repCompany}</span>
                  <span className="text-white/40">•</span>
                  <span>DOB: <strong className="text-white">{repDob || 'N/A'}</strong></span>
                  <span className="text-white/40">•</span>
                  <span className="text-[#ffbe3b] font-semibold">{repDistrict}</span>
                </p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-right shrink-0">
              {websiteSettings.isExpoActive && (
                <div className="flex items-center justify-end gap-2">
                  <span className="text-xs text-white/60 line-through">₹ {regularFee.toLocaleString('en-IN')}.00</span>
                  <span className="px-1.5 py-0.5 rounded bg-[#006e2e] text-white text-[9.5px] font-extrabold uppercase">
                    Save {discountPct}%
                  </span>
                </div>
              )}
              <div className="text-2xl sm:text-3xl font-black text-[#8ef9a0]">₹ {activeFee.toLocaleString('en-IN')}.00</div>
              <span className="text-[10px] text-white/70 block">
                {websiteSettings.isExpoActive ? websiteSettings.expoOfferTitle : 'APSIWA State Membership Fee'}
              </span>
            </div>
          </div>

          <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Official Banking Details & QR Code (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-[#f7f9fc] rounded-2xl p-5 border border-[#e0e3e6] space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold uppercase text-[#003477] tracking-wider flex items-center gap-1.5">
                    <QrCode size={16} />
                    <span>Scan &amp; Pay ₹{activeFee.toLocaleString('en-IN')}</span>
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-[#8ef9a0]/20 text-[#006e2e] text-[10px] font-bold">
                    Direct Bank Transfer
                  </span>
                </div>

                {/* QR Code Container */}
                <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-[#e0e3e6] shadow-xs">
                  <img
                    src={qrCodeUrl}
                    alt="APSIWA Official UPI QR Code"
                    className="w-44 h-44 sm:w-48 sm:h-48 object-contain rounded-lg border border-[#e0e3e6] p-1 bg-white"
                  />
                  <div className="mt-3 flex items-center justify-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] text-[#434752] font-semibold flex-wrap">
                    <span className="px-1.5 py-0.5 bg-[#f2f4f7] rounded border border-[#e0e3e6]">PhonePe</span>
                    <span className="px-1.5 py-0.5 bg-[#f2f4f7] rounded border border-[#e0e3e6]">Google Pay</span>
                    <span className="px-1.5 py-0.5 bg-[#f2f4f7] rounded border border-[#e0e3e6]">Paytm</span>
                    <span className="px-1.5 py-0.5 bg-[#f2f4f7] rounded border border-[#e0e3e6]">BHIM / Any UPI</span>
                  </div>

                  {/* QR Code Download Button */}
                  <button
                    type="button"
                    onClick={handleDownloadQr}
                    disabled={downloadingQr}
                    className="w-full mt-3 inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#003477] hover:bg-[#024aa3] text-white text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-98 disabled:opacity-75"
                  >
                    {downloadingQr ? (
                      <>
                        <span className="material-symbols-outlined text-base animate-spin">refresh</span>
                        <span>Preparing QR Image...</span>
                      </>
                    ) : (
                      <>
                        <Download size={14} />
                        <span>Download QR Code Image</span>
                      </>
                    )}
                  </button>
                </div>

                {/* UPI ID Row - Perfectly Aligned & Safe for Mobile */}
                <div className="flex items-center justify-between gap-2.5 p-3 sm:p-3.5 rounded-xl bg-white border border-[#e0e3e6] shadow-xs">
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] text-[#737783] uppercase block font-bold tracking-wider mb-0.5">
                      APSIWA Official UPI ID
                    </span>
                    <div className="text-xs sm:text-sm font-mono font-bold text-[#003477] break-all select-all leading-snug">
                      {upiId}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(upiId, 'upi')}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg bg-[#f0f4fa] hover:bg-[#e0e8f5] text-[#003477] text-xs font-bold transition-all shrink-0 cursor-pointer active:scale-95 border border-[#d0dbe9]"
                    title="Copy UPI ID"
                  >
                    {copiedField === 'upi' ? (
                      <>
                        <Check size={14} className="text-[#006e2e]" />
                        <span className="text-[#006e2e] text-[11px] font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span className="text-[11px]">Copy</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Bank Account Details */}
                <div className="space-y-2 text-xs">
                  <div className="p-3 sm:p-3.5 rounded-xl bg-white border border-[#e0e3e6] space-y-2 shadow-xs">
                    <span className="text-[10px] font-bold text-[#737783] uppercase block tracking-wider">
                      Direct NEFT / RTGS Details
                    </span>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[#434752] shrink-0">Account No:</span>
                      <div className="flex items-center gap-1.5 min-w-0 justify-end">
                        <span className="font-mono font-bold text-[#191c1e] text-xs sm:text-sm break-all select-all">
                          {accountNumber}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(accountNumber, 'acc')}
                          className="p-1 rounded text-[#003477] hover:bg-[#f0f4fa] cursor-pointer shrink-0 transition-colors"
                          title="Copy Account Number"
                        >
                          {copiedField === 'acc' ? <Check size={13} className="text-[#006e2e]" /> : <Copy size={13} />}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[#434752] shrink-0">IFSC Code:</span>
                      <div className="flex items-center gap-1.5 min-w-0 justify-end">
                        <span className="font-mono font-bold text-[#191c1e] text-xs sm:text-sm break-all select-all">
                          {ifscCode}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(ifscCode, 'ifsc')}
                          className="p-1 rounded text-[#003477] hover:bg-[#f0f4fa] cursor-pointer shrink-0 transition-colors"
                          title="Copy IFSC Code"
                        >
                          {copiedField === 'ifsc' ? <Check size={13} className="text-[#006e2e]" /> : <Copy size={13} />}
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between text-[11px] text-[#737783] pt-1.5 border-t border-[#e0e3e6] gap-1">
                      <span>Bank: <strong className="text-[#434752]">{bankName}</strong></span>
                      <span>Branch: <strong className="text-[#434752]">{bankBranch}</strong></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Realtime UTR & Proof Submission Form (7 cols) */}
            <div className="lg:col-span-7 space-y-5">
              <div>
                <h4 className="text-base font-extrabold text-[#191c1e]">
                  Submit Payment Verification Proof
                </h4>
                <p className="text-xs text-[#434752] mt-0.5">
                  Enter your 12-digit UTR transaction number from your banking or UPI app after transferring ₹{activeFee.toLocaleString('en-IN')}.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-[#ffdad6] border border-[#ffb4ab] text-[#ba1a1a] text-xs flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">error</span>
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmitPayment} className="space-y-4">
                {/* UTR Input */}
                <div>
                  <label className="block text-xs font-bold text-[#191c1e] mb-1.5">
                    12-Digit Bank UTR / UPI Transaction Reference No. *
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3.5 top-3 text-[#737783]" size={16} />
                    <input
                      type="text"
                      required
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value.replace(/\s+/g, ''))}
                      placeholder="Enter 12-digit UTR / Reference ID"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-xs font-mono font-bold text-[#003477] focus:bg-white focus:border-[#003477] outline-none"
                    />
                  </div>
                  <span className="text-[10.5px] text-[#737783] mt-1 block">
                    Available on your payment receipt as "UPI Transaction ID" or "Bank Ref No."
                  </span>
                </div>

                {/* Amount Display */}
                <div>
                  <label className="block text-xs font-bold text-[#191c1e] mb-1.5">
                    Amount Transferred *
                  </label>
                  <input
                    type="text"
                    disabled
                    value={`₹ ${activeFee.toLocaleString('en-IN')}.00 (${websiteSettings.isExpoActive ? `Special Expo Offer - ${discountPct}% Discount` : 'Annual Membership Fee'})`}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-xs font-bold text-[#006e2e] outline-none"
                  />
                </div>

                {/* Payment Date */}
                <div>
                  <label className="block text-xs font-bold text-[#191c1e] mb-1.5">
                    Transfer Date *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-3 text-[#737783]" size={16} />
                    <input
                      type="date"
                      required
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-xs font-medium focus:bg-white focus:border-[#003477] outline-none"
                    />
                  </div>
                </div>

                {/* Payment Screenshot Upload (Compulsory) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-[#191c1e]">
                      Payment Receipt / Screenshot <span className="text-[#ba1a1a]">*</span>
                    </label>
                    <span className="px-2 py-0.5 rounded-full bg-[#ffdad6] text-[#ba1a1a] text-[10px] font-extrabold uppercase tracking-wider">
                      Compulsory *
                    </span>
                  </div>
                  <div
                    className={`flex items-center gap-4 p-3.5 rounded-xl transition-all ${
                      screenshotUrl
                        ? 'bg-[#f0f9f4] border border-[#006e2e]/40 shadow-xs'
                        : 'bg-[#f2f4f7] border-2 border-dashed border-[#ccd0d5] hover:border-[#003477]'
                    }`}
                  >
                    <div className="w-14 h-14 rounded-lg bg-white border border-[#e0e3e6] overflow-hidden flex items-center justify-center shrink-0 shadow-2xs">
                      {screenshotUrl ? (
                        <img src={screenshotUrl} alt="Receipt" className="w-full h-full object-cover" />
                      ) : (
                        <Upload size={22} className="text-[#003477]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className={`text-xs font-bold truncate block ${screenshotUrl ? 'text-[#006e2e]' : 'text-[#191c1e]'}`}>
                        {screenshotFileName || (screenshotUrl ? '✓ Receipt Screenshot Attached' : 'Upload Payment Receipt Screenshot *')}
                      </span>
                      <span className="text-[10.5px] text-[#737783] block">
                        {screenshotUrl ? 'Screenshot verified & attached' : 'PNG, JPG or PDF receipt from UPI / Bank app (Required)'}
                      </span>
                    </div>
                    <label className={`px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all shrink-0 shadow-2xs ${
                      screenshotUrl
                        ? 'bg-white border border-[#006e2e]/30 text-[#006e2e] hover:bg-[#e8f5e9]'
                        : 'bg-[#003477] text-white hover:bg-[#024aa3]'
                    }`}>
                      <span>{screenshotUrl ? 'Change' : 'Browse File *'}</span>
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    </label>
                  </div>
                  {!screenshotUrl && (
                    <span className="text-[10.5px] text-[#ba1a1a] font-semibold mt-1 flex items-center gap-1">
                      <AlertCircle size={12} className="shrink-0" />
                      <span>Please attach a screenshot of your successful transaction receipt before submitting.</span>
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-[#e0e3e6] flex flex-col sm:flex-row items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={onBackToMembership}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#f2f4f7] hover:bg-[#e0e3e6] text-[#434752] text-xs font-bold transition-all cursor-pointer"
                  >
                    <ArrowLeft size={14} />
                    <span>Back to Details</span>
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#006e2e] hover:bg-[#005322] text-white text-xs sm:text-sm font-extrabold shadow-md transition-all cursor-pointer active:scale-98 disabled:opacity-75"
                  >
                    {submitting ? (
                      <>
                        <span className="material-symbols-outlined text-base animate-spin">refresh</span>
                        <span>Verifying &amp; Submitting...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={16} />
                        <span>Submit Payment for Admin Approval</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* POPUP MODAL: PAYMENT SUBMITTED & ADMIN APPROVAL ACTION */}
      {submittedApp && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#e0e3e6] space-y-5 animate-in zoom-in-95 duration-200">
            {/* Header: Pending vs Approved */}
            {!isApproved ? (
              <div className="bg-gradient-to-r from-[#00285e] via-[#003477] to-[#024aa3] text-white p-6 text-center space-y-2 border-b-2 border-[#ffbe3b]">
                <div className="w-14 h-14 rounded-full bg-[#ffbe3b]/20 text-[#ffbe3b] flex items-center justify-center mx-auto border border-[#ffbe3b]/40 animate-pulse">
                  <Clock size={30} />
                </div>
                <h2 className="text-xl font-black tracking-tight">
                  Payment Submitted • Awaiting Admin Approval
                </h2>
                <p className="text-xs text-white/80 max-w-sm mx-auto">
                  Your UTR reference <span className="font-mono font-bold text-[#ffbe3b]">{submittedApp.utrNumber}</span> has been received by the Secretariat Council for verification.
                </p>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-[#005322] via-[#006e2e] to-[#008738] text-white p-6 text-center space-y-2 border-b-2 border-[#8ef9a0]">
                <div className="w-14 h-14 rounded-full bg-white/20 text-[#8ef9a0] flex items-center justify-center mx-auto border border-white/40">
                  <CheckCircle2 size={32} />
                </div>
                <h2 className="text-xl font-black tracking-tight">
                  🎉 Membership Approved &amp; Certified!
                </h2>
                <p className="text-xs text-white/90 max-w-sm mx-auto">
                  APSIWA Secretariat Admin has approved your application. Your official Smart ID Card and Certificate are now activated.
                </p>
              </div>
            )}

            {/* Application Summary Card */}
            <div className="px-6 space-y-3 text-xs">
              <div className="p-4 rounded-2xl bg-[#f7f9fc] border border-[#e0e3e6] space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[#737783]">Membership ID:</span>
                  <span className="font-mono font-bold text-[#003477]">{submittedApp.id}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#737783]">Representative:</span>
                  <span className="font-bold text-[#191c1e]">{submittedApp.fullName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#737783]">Firm / Company:</span>
                  <span className="font-bold text-[#191c1e]">{submittedApp.companyName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#737783]">Membership Fee Paid:</span>
                  <span className="font-bold text-[#006e2e]">
                    ₹ {activeFee.toLocaleString('en-IN')}.00 {websiteSettings.isExpoActive ? `(${discountPct}% Discount)` : ''}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#737783]">Bank UTR:</span>
                  <span className="font-mono font-bold text-[#003477]">{submittedApp.utrNumber}</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-[#e0e3e6]">
                  <span className="text-[#737783]">Current Status:</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded-full text-[10.5px] ${
                      isApproved
                        ? 'bg-[#8ef9a0]/25 text-[#006e2e] border border-[#006e2e]/30'
                        : 'bg-[#ffbe3b]/25 text-[#00285e] border border-[#ffbe3b]/40'
                    }`}
                  >
                    {isApproved ? '✓ Approved & Active' : '⏳ Pending Admin Verification'}
                  </span>
                </div>
              </div>

              {/* Payment Receipt Download & Instructions Box */}
              <div className="p-4 rounded-2xl bg-[#f0f7ff] border border-[#bcd7ff] space-y-3">
                <div className="flex items-center gap-2 text-[#003477] font-bold">
                  <FileText size={16} />
                  <span>Official Remittance Acknowledgement</span>
                </div>
                <p className="text-[11.5px] text-[#334155] leading-relaxed">
                  Your remittance details and UTR reference have been recorded. You can download or print your official payment receipt below for your records:
                </p>
                <button
                  type="button"
                  onClick={() => {
                    const receiptNo = `REC-${submittedApp.id}`;
                    const feeFormatted = submittedApp.amountPaid || `₹ ${activeFee.toLocaleString('en-IN')}.00`;
                    const dateFormatted = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                    const printWindow = window.open('', '_blank');
                    if (!printWindow) {
                      alert('Please allow pop-ups to download and print your official receipt.');
                      return;
                    }

                    printWindow.document.write(`
                      <!DOCTYPE html>
                      <html>
                      <head>
                        <title>APSIWA Payment Receipt - ${receiptNo}</title>
                        <style>
                          body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; margin: 0; padding: 30px; background: #f8fafc; -webkit-print-color-adjust: exact; }
                          .receipt-box { max-width: 680px; margin: 0 auto; background: #fff; padding: 36px; border-radius: 12px; border: 1px solid #cbd5e1; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
                          .header { text-align: center; border-bottom: 2px solid #003477; padding-bottom: 16px; margin-bottom: 24px; }
                          .title { font-size: 20px; font-weight: 900; color: #003477; margin: 0 0 4px 0; }
                          .sub { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; margin: 0; }
                          .receipt-badge { display: inline-block; background: #ffbe3b; color: #00285e; padding: 4px 14px; border-radius: 20px; font-size: 11px; font-weight: 800; margin-top: 10px; }
                          .grid { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 13px; }
                          .table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; }
                          .table th { background: #f1f5f9; padding: 10px 12px; text-align: left; color: #475569; font-weight: 800; border-bottom: 2px solid #cbd5e1; }
                          .table td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; }
                          .status { color: #b25e00; font-weight: 700; background: #fff8e6; padding: 4px 10px; border-radius: 6px; display: inline-block; border: 1px solid #ffe08a; font-size: 11.5px; }
                          .footer { text-align: center; margin-top: 32px; padding-top: 16px; border-top: 1px dashed #cbd5e1; font-size: 11px; color: #64748b; }
                          @media print { body { background: #fff; padding: 0; } .receipt-box { box-shadow: none; border: none; } }
                        </style>
                      </head>
                      <body>
                        <div class="receipt-box">
                          <div class="header">
                            <h1 class="title">ANDHRA PRADESH SOLAR INTEGRATORS WELFARE ASSOCIATION</h1>
                            <p class="sub">APSIWA Secretariat • Visakhapatnam, Andhra Pradesh</p>
                            <div class="receipt-badge">OFFICIAL PAYMENT ACKNOWLEDGEMENT RECEIPT</div>
                          </div>
                          
                          <div class="grid">
                            <div>
                              <p style="margin:0 0 4px 0;"><strong>Receipt No:</strong> <span style="font-family:monospace; color:#003477;">${receiptNo}</span></p>
                              <p style="margin:0 0 4px 0;"><strong>Application ID:</strong> <span style="font-family:monospace;">${submittedApp.id}</span></p>
                              <p style="margin:0;"><strong>Payment Date:</strong> ${submittedApp.paymentDate || dateFormatted}</p>
                            </div>
                            <div style="text-align: right;">
                              <p style="margin:0 0 4px 0;"><strong>Status:</strong></p>
                              <span class="status">Payment Submitted • Awaiting Secretariat Verification</span>
                            </div>
                          </div>

                          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 18px; margin-bottom: 20px; font-size: 13px;">
                            <p style="margin: 0 0 4px 0;"><strong>Payer Name:</strong> ${submittedApp.fullName}</p>
                            <p style="margin: 0 0 4px 0;"><strong>Firm / Enterprise:</strong> ${submittedApp.companyName || 'Solar Integrator'}</p>
                            <p style="margin: 0 0 4px 0;"><strong>Mobile:</strong> +91 ${submittedApp.mobileNumber}</p>
                            <p style="margin: 0;"><strong>District:</strong> ${submittedApp.district || 'Andhra Pradesh'}</p>
                          </div>

                          <table class="table">
                            <thead>
                              <tr>
                                <th>Particulars</th>
                                <th>Mode &amp; Reference</th>
                                <th style="text-align: right;">Amount</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td>
                                  <strong>State Solar Institutional Membership Fee</strong><br />
                                  <span style="font-size: 11px; color: #64748b;">Includes 1-Year Life Accreditation &amp; Smart ID Card</span>
                                </td>
                                <td>
                                  UPI / Bank Remittance<br />
                                  <span style="font-family: monospace; font-size: 11.5px; color: #006e2e; font-weight: bold;">UTR: ${submittedApp.utrNumber}</span>
                                </td>
                                <td style="text-align: right; font-weight: 800; color: #006e2e; font-size: 14px;">
                                  ${feeFormatted}
                                </td>
                              </tr>
                            </tbody>
                          </table>

                          <div class="grid" style="margin-top: 24px; align-items: flex-end;">
                            <div style="font-size: 11.5px; color: #64748b; max-width: 320px;">
                              <p style="margin: 0 0 4px 0;"><strong>Note:</strong></p>
                              <p style="margin: 0; line-height: 1.4;">Once approved by the Secretariat, your digital Smart ID Card will be immediately downloadable on the portal using your phone number.</p>
                            </div>
                            <div style="text-align: right;">
                              <p style="margin: 0 0 30px 0; font-size: 11px; color: #64748b;">Authorized Signatory</p>
                              <p style="margin: 0; font-size: 13px; font-weight: 800; color: #003477;">APSIWA Secretariat</p>
                            </div>
                          </div>

                          <div class="footer">
                            <p style="margin: 0 0 4px 0;">APSIWA Secretariat • Email: apsiwa2018@gmail.com • Registered under AP Societies Act</p>
                            <p style="margin: 0;">This is an official system-generated electronic receipt.</p>
                          </div>
                        </div>
                        <script>
                          window.onload = function() { window.print(); }
                        </script>
                      </body>
                      </html>
                    `);
                    printWindow.document.close();
                  }}
                  className="w-full py-3 rounded-xl bg-[#003477] hover:bg-[#024aa3] text-white text-xs sm:text-sm font-extrabold shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
                >
                  <Download size={16} />
                  <span>Download / Print Payment Receipt</span>
                </button>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-6 pt-0 flex flex-col sm:flex-row gap-2.5">
              {isApproved ? (
                <button
                  type="button"
                  onClick={onNavigateProfile}
                  className="w-full py-3.5 rounded-xl bg-[#006e2e] hover:bg-[#005322] text-white text-xs sm:text-sm font-black text-center shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <ShieldCheck size={18} />
                  <span>Go to Profile &amp; Download Smart ID Card</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onNavigateProfile}
                  className="w-full py-2.5 rounded-xl bg-[#f2f4f7] hover:bg-[#e0e3e6] text-[#003477] text-xs font-bold text-center transition-colors cursor-pointer"
                >
                  View Profile &amp; Application Status
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
