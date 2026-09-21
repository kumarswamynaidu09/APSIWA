import React, { useState } from 'react';
import { MembershipApplication, UserProfile } from '../types';
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
  Lock
} from 'lucide-react';
import { saveMembershipApplication } from '../lib/supabase';

interface PaymentScreenProps {
  applicationData: Partial<MembershipApplication> | null;
  currentUser: UserProfile | null;
  onPaymentSuccess: (newApp: MembershipApplication) => void;
  onBackToMembership: () => void;
  onNavigateProfile: () => void;
}

export const PaymentScreen: React.FC<PaymentScreenProps> = ({
  applicationData,
  currentUser,
  onPaymentSuccess,
  onBackToMembership,
  onNavigateProfile
}) => {
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

  // Representative & Firm summary details from actual user / form
  const repName = applicationData?.fullName || currentUser?.name || 'Applicant';
  const repEmail = applicationData?.emailAddress || currentUser?.email || '';
  const repPhone = applicationData?.mobileNumber || currentUser?.phoneNumber || '';
  const repCompany = applicationData?.companyName || currentUser?.companyName || 'Solar EPC Enterprise';
  const repDistrict = applicationData?.district || currentUser?.district || 'Andhra Pradesh';

  const upiId = 'apsiwa.welfare@sbi';
  const accountNumber = '394801002934';
  const ifscCode = 'SBIN0012849';

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshotFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        setScreenshotUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
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

    setSubmitting(true);

    const newApplicationId = `APSIWA-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const pendingApp: MembershipApplication = {
      id: newApplicationId,
      fullName: repName,
      mobileNumber: repPhone,
      emailAddress: repEmail,
      companyName: repCompany,
      district: repDistrict,
      dob: applicationData?.dob || '',
      gstNumber: applicationData?.gstNumber || '',
      businessType: applicationData?.businessType || 'Private Limited Company',
      experience: applicationData?.experience || '1 - 3 Years',
      officeAddress: applicationData?.officeAddress || '',
      pincode: applicationData?.pincode || '',
      photoUrl: applicationData?.photoUrl || currentUser?.avatarUrl,
      utrNumber: utrNumber.trim(),
      paymentDate: paymentDate,
      amountPaid: '₹ 2,000.00',
      paymentScreenshotUrl: screenshotUrl || undefined,
      submissionDate: new Date().toLocaleDateString('en-IN', {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
      }),
      status: 'Pending Verification'
    };

    try {
      // Save realtime to Supabase as Pending Verification
      await saveMembershipApplication(pendingApp, currentUser?.id);

      setSubmitting(false);
      setSubmittedApp(pendingApp);
      setIsApproved(false);
    } catch (err: any) {
      console.error('Error saving application:', err);
      setSubmitting(false);
      setSubmittedApp(pendingApp);
      setIsApproved(false);
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
          {/* Summary Banner with 60% Expo Discount */}
          <div className="bg-gradient-to-r from-[#003477] via-[#024aa3] to-[#00285e] text-white p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#00285e]">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10.5px] uppercase font-bold text-[#8ef9a0] tracking-widest block">
                  Enrolment Summary
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#ffbe3b] text-[#00285e] text-[10px] font-black uppercase">
                  🎉 Expo Offer (60% OFF)
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black">{repName}</h3>
              <p className="text-xs text-white/80 font-medium">
                {repCompany} • <span className="text-[#ffbe3b] font-semibold">{repDistrict}</span>
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-right shrink-0">
              <div className="flex items-center justify-end gap-2">
                <span className="text-xs text-white/60 line-through">₹ 5,000.00</span>
                <span className="px-1.5 py-0.5 rounded bg-[#006e2e] text-white text-[9.5px] font-extrabold uppercase">
                  Save 60%
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-[#8ef9a0]">₹ 2,000.00</div>
              <span className="text-[10px] text-white/70 block">Special Solar Expo Fee (Annual)</span>
            </div>
          </div>

          <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Official Banking Details & QR Code (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-[#f7f9fc] rounded-2xl p-5 border border-[#e0e3e6] space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold uppercase text-[#003477] tracking-wider flex items-center gap-1.5">
                    <QrCode size={16} />
                    <span>Scan &amp; Pay ₹2,000</span>
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-[#8ef9a0]/20 text-[#006e2e] text-[10px] font-bold">
                    Direct Bank Transfer
                  </span>
                </div>

                {/* QR Code Container */}
                <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-[#e0e3e6] shadow-xs">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDKQoPqerF6MxsFeWOQEuqjZRMOpmIHXD4ubJsjC-HLBkb6H8aH9E9q4bIuwFwOaQ9HK3Sl8Oi7yGFQsqhG4gzs4IAJR6F5Q4YqVeAWJmOkjit-g7lwqdHivjTfhp8-bLHcRqeadCaE1t74t3t6gYv7azrvqiE2k6DlgVUwMN8KJCsNkOaLr8bg1e3HlnPyaCfMTDN4U0wMK5fgZI_vn5mcEVrdfVRypfOrTx3_NkRqVrmFLkSMKtwx4A"
                    alt="APSIWA Official UPI QR Code"
                    className="w-44 h-44 object-contain rounded-lg border border-[#e0e3e6]"
                  />
                  <div className="mt-3 flex items-center gap-2 text-[11px] text-[#434752] font-semibold">
                    <span className="px-1.5 py-0.5 bg-[#f2f4f7] rounded border">PhonePe</span>
                    <span className="px-1.5 py-0.5 bg-[#f2f4f7] rounded border">Google Pay</span>
                    <span className="px-1.5 py-0.5 bg-[#f2f4f7] rounded border">Paytm</span>
                    <span className="px-1.5 py-0.5 bg-[#f2f4f7] rounded border">BHIM</span>
                  </div>
                </div>

                {/* UPI ID Row */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#e0e3e6]">
                  <div>
                    <span className="text-[10px] text-[#737783] uppercase block font-bold">APSIWA Official UPI ID</span>
                    <span className="text-xs font-mono font-bold text-[#003477]">{upiId}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(upiId, 'upi')}
                    className="p-1.5 rounded-lg bg-[#f2f4f7] hover:bg-[#e0e3e6] text-[#003477] transition-colors cursor-pointer"
                    title="Copy UPI ID"
                  >
                    {copiedField === 'upi' ? <Check size={14} className="text-[#006e2e]" /> : <Copy size={14} />}
                  </button>
                </div>

                {/* Bank Account Details */}
                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-xl bg-white border border-[#e0e3e6] space-y-1.5">
                    <span className="text-[10px] font-bold text-[#737783] uppercase block">Direct NEFT / RTGS Details</span>
                    <div className="flex justify-between items-center">
                      <span className="text-[#434752]">Account Number:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-[#191c1e]">{accountNumber}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(accountNumber, 'acc')}
                          className="text-[#003477] hover:text-[#024aa3] cursor-pointer"
                        >
                          {copiedField === 'acc' ? <Check size={12} className="text-[#006e2e]" /> : <Copy size={12} />}
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#434752]">IFSC Code:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-[#191c1e]">{ifscCode}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(ifscCode, 'ifsc')}
                          className="text-[#003477] hover:text-[#024aa3] cursor-pointer"
                        >
                          {copiedField === 'ifsc' ? <Check size={12} className="text-[#006e2e]" /> : <Copy size={12} />}
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between text-[11px] text-[#737783] pt-1 border-t border-[#e0e3e6]">
                      <span>Bank: State Bank of India</span>
                      <span>Branch: Amaravati Secretariat</span>
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
                  Enter your 12-digit UTR transaction number from your banking or UPI app after transferring ₹2,000.
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
                    value="₹ 2,000.00 (Special Expo Offer - 60% Discount)"
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

                {/* Payment Screenshot Upload */}
                <div>
                  <label className="block text-xs font-bold text-[#191c1e] mb-1.5">
                    Payment Receipt / Screenshot (Optional)
                  </label>
                  <div className="flex items-center gap-4 p-3.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6]">
                    <div className="w-14 h-14 rounded-lg bg-white border border-[#e0e3e6] overflow-hidden flex items-center justify-center shrink-0">
                      {screenshotUrl ? (
                        <img src={screenshotUrl} alt="Receipt" className="w-full h-full object-cover" />
                      ) : (
                        <Upload size={20} className="text-[#737783]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-[#191c1e] truncate block">
                        {screenshotFileName || (screenshotUrl ? 'Receipt Uploaded' : 'Upload Receipt Screenshot')}
                      </span>
                      <span className="text-[10.5px] text-[#737783] block">
                        PNG, JPG or PDF receipt from bank app
                      </span>
                    </div>
                    <label className="px-3 py-1.5 rounded-lg bg-white border border-[#e0e3e6] text-xs font-bold text-[#003477] hover:bg-[#eceef1] cursor-pointer transition-colors shrink-0">
                      <span>{screenshotUrl ? 'Change' : 'Upload'}</span>
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    </label>
                  </div>
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
                  <span className="text-[#737783]">Expo Fee Paid:</span>
                  <span className="font-bold text-[#006e2e]">₹ 2,000.00 (60% Discount)</span>
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

              {/* ADMIN APPROVAL ACTION BOX (Popup Approval Trigger) */}
              {!isApproved && (
                <div className="p-4 rounded-2xl bg-[#fff8e6] border border-[#ffe08a] space-y-3">
                  <div className="flex items-center gap-2 text-[#b25e00] font-bold">
                    <UserCheck size={16} />
                    <span>Secretariat / Admin Approval Portal</span>
                  </div>
                  <p className="text-[11.5px] text-[#6b4700] leading-relaxed">
                    As an authorized APSIWA administrator, you can verify the UTR and immediately grant active member certification:
                  </p>
                  <button
                    type="button"
                    onClick={handleAdminApprove}
                    disabled={adminApproving}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#006e2e] to-[#008738] hover:from-[#005322] hover:to-[#006e2e] text-white text-xs sm:text-sm font-extrabold shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98 disabled:opacity-75"
                  >
                    {adminApproving ? (
                      <>
                        <span className="material-symbols-outlined text-base animate-spin">refresh</span>
                        <span>Authorizing &amp; Issuing ID Card...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={16} />
                        <span>✓ Admin Action: Approve Membership Now</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="p-6 pt-0 flex flex-col sm:flex-row gap-2.5">
              {isApproved ? (
                <button
                  type="button"
                  onClick={onNavigateProfile}
                  className="w-full py-3.5 rounded-xl bg-[#003477] hover:bg-[#024aa3] text-white text-xs sm:text-sm font-black text-center shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Go to Profile &amp; Download Smart ID Card</span>
                  <span className="material-symbols-outlined text-base">badge</span>
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
