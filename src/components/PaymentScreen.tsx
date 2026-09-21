import React, { useState } from 'react';
import { MembershipApplication, UserProfile } from '../types';
import {
  CreditCard,
  QrCode,
  Copy,
  CheckCircle2,
  Building2,
  Calendar,
  Upload,
  ArrowLeft,
  ShieldCheck,
  Check,
  ExternalLink,
  HelpCircle
} from 'lucide-react';

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
  const [utrNumber, setUtrNumber] = useState(applicationData?.utrNumber || '');
  const [paymentDate, setPaymentDate] = useState(
    applicationData?.paymentDate || new Date().toISOString().split('T')[0]
  );
  const [screenshotUrl, setScreenshotUrl] = useState<string>(
    applicationData?.paymentScreenshotUrl ||
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDKQoPqerF6MxsFeWOQEuqjZRMOpmIHXD4ubJsjC-HLBkb6H8aH9E9q4bIuwFwOaQ9HK3Sl8Oi7yGFQsqhG4gzs4IAJR6F5Q4YqVeAWJmOkjit-g7lwqdHivjTfhp8-bLHcRqeadCaE1t74t3t6gYv7azrvqiE2k6DlgVUwMN8KJCsNkOaLr8bg1e3HlnPyaCfMTDN4U0wMK5fgZI_vn5mcEVrdfVRypfOrTx3_NkRqVrmFLkSMKtwx4A'
  );
  const [screenshotFileName, setScreenshotFileName] = useState('payment_receipt_verified.png');

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittedApp, setSubmittedApp] = useState<MembershipApplication | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Representative & Firm summary details
  const repName = applicationData?.fullName || currentUser?.name || 'Solar Integrator Representative';
  const repEmail = applicationData?.emailAddress || currentUser?.email || 'member@apsiwa.org';
  const repPhone = applicationData?.mobileNumber || currentUser?.phoneNumber || '+91 98480 32190';
  const repCompany = applicationData?.companyName || 'Solar EPC Energy Firm';
  const repDistrict = applicationData?.district || 'Amaravati / Central AP';

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

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!utrNumber.trim() || utrNumber.trim().length < 8) {
      setErrorMsg('Please enter a valid 12-digit Bank UTR / Transaction Reference Number.');
      return;
    }

    setSubmitting(true);

    const newApplicationId = `APSIWA-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const fullApp: MembershipApplication = {
      id: newApplicationId,
      fullName: repName,
      mobileNumber: repPhone,
      emailAddress: repEmail,
      companyName: repCompany,
      district: repDistrict,
      dob: applicationData?.dob || '1990-01-01',
      gstNumber: applicationData?.gstNumber || '37AAACS9823M1ZX',
      businessType: applicationData?.businessType || 'Private Limited Company',
      experience: applicationData?.experience || '3 - 5 Years',
      officeAddress: applicationData?.officeAddress || 'Andhra Pradesh, India',
      pincode: applicationData?.pincode || '520001',
      photoUrl: applicationData?.photoUrl || currentUser?.avatarUrl,
      utrNumber: utrNumber.trim(),
      paymentDate: paymentDate,
      amountPaid: '₹ 5,000.00',
      paymentScreenshotUrl: screenshotUrl,
      submissionDate: new Date().toLocaleDateString('en-IN', {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
      }),
      status: 'Approved'
    };

    setTimeout(() => {
      setSubmitting(false);
      setSubmittedApp(fullApp);
      onPaymentSuccess(fullApp);
    }, 800);
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-10 px-4 sm:px-6">
      <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in zoom-in-98 duration-200">
        {/* Top Centered Header & Stepper */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#003477]/10 text-[#003477] text-xs font-bold uppercase tracking-wider">
            <ShieldCheck size={14} />
            <span>APSIWA Official Enrolment Portal</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#191c1e] tracking-tight">
            Membership Fee Payment &amp; Verification
          </h1>

          <p className="text-xs sm:text-sm text-[#434752] max-w-xl mx-auto">
            Complete your admission and welfare subscription fee to activate your official state membership and digital ID card.
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
          {/* Summary Banner */}
          <div className="bg-gradient-to-r from-[#003477] via-[#024aa3] to-[#00285e] text-white p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#00285e]">
            <div className="space-y-1">
              <span className="text-[10.5px] uppercase font-bold text-[#8ef9a0] tracking-widest block">
                Applicant &amp; Firm Summary
              </span>
              <h3 className="text-lg sm:text-xl font-black">{repName}</h3>
              <p className="text-xs text-white/80 font-medium">
                {repCompany} • <span className="text-[#ffbe3b] font-semibold">{repDistrict}</span>
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-right shrink-0">
              <span className="text-[11px] text-white/70 block uppercase font-bold tracking-wider">
                Total Membership Fee
              </span>
              <div className="text-2xl sm:text-3xl font-black text-[#8ef9a0]">₹ 5,000.00</div>
              <span className="text-[10px] text-white/60 block">Annual Welfare Subscription</span>
            </div>
          </div>

          <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Official Banking Details & QR Code (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-[#f7f9fc] rounded-2xl p-5 border border-[#e0e3e6] space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold uppercase text-[#003477] tracking-wider flex items-center gap-1.5">
                    <QrCode size={16} />
                    <span>Scan &amp; Pay via UPI</span>
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-[#8ef9a0]/20 text-[#006e2e] text-[10px] font-bold">
                    Instant Bank Transfer
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
                    <span className="text-[10px] text-[#737783] uppercase block font-bold">APSIWA UPI ID</span>
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

            {/* Right Column: UTR & Proof Submission Form (7 cols) */}
            <div className="lg:col-span-7 space-y-5">
              <div>
                <h4 className="text-base font-extrabold text-[#191c1e]">
                  Submit Payment Verification Proof
                </h4>
                <p className="text-xs text-[#434752] mt-0.5">
                  Enter the 12-digit UTR reference number generated by your bank app after successful transfer.
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
                    12-Digit Bank UTR / Reference No. *
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3.5 top-3 text-[#737783]" size={16} />
                    <input
                      type="text"
                      required
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value.replace(/\s+/g, ''))}
                      placeholder="e.g. 409218204910"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-xs font-mono font-bold text-[#003477] focus:bg-white focus:border-[#003477] outline-none"
                    />
                  </div>
                  <span className="text-[10.5px] text-[#737783] mt-1 block">
                    Found in your UPI receipt as "UPI Transaction ID" or "UTR No."
                  </span>
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
                    Payment Receipt / Screenshot *
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
                        {screenshotFileName}
                      </span>
                      <span className="text-[10.5px] text-[#006e2e] font-semibold flex items-center gap-1">
                        <CheckCircle2 size={12} />
                        Receipt Attached
                      </span>
                    </div>
                    <label className="px-3 py-1.5 rounded-lg bg-white border border-[#e0e3e6] text-xs font-bold text-[#003477] hover:bg-[#eceef1] cursor-pointer transition-colors shrink-0">
                      <span>Change</span>
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
                        <span>Verifying &amp; Registering...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={16} />
                        <span>Submit Payment Proof &amp; Complete Registration</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* SUCCESS MODAL ON PAYMENT SUBMISSION */}
      {submittedApp && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#e0e3e6] space-y-6 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-[#003477] text-white p-6 text-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-[#8ef9a0]/20 text-[#8ef9a0] flex items-center justify-center mx-auto border border-[#8ef9a0]/40">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="text-xl font-extrabold">APSIWA Membership Activated!</h2>
              <p className="text-xs text-white/80">
                Your payment proof has been verified and registered with the Andhra Pradesh Secretariat.
              </p>
            </div>

            {/* Application Data */}
            <div className="px-6 space-y-3 text-xs">
              <div className="p-4 rounded-2xl bg-[#f7f9fc] border border-[#e0e3e6] space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#737783]">Membership ID:</span>
                  <span className="font-mono font-bold text-[#003477]">{submittedApp.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#737783]">Member Name:</span>
                  <span className="font-bold text-[#191c1e]">{submittedApp.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#737783]">Firm:</span>
                  <span className="font-bold text-[#191c1e]">{submittedApp.companyName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#737783]">Bank UTR:</span>
                  <span className="font-mono font-bold text-[#006e2e]">{submittedApp.utrNumber}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-6 pt-0 flex gap-3">
              <button
                type="button"
                onClick={onNavigateProfile}
                className="flex-1 py-3 rounded-xl bg-[#003477] hover:bg-[#024aa3] text-white text-xs font-bold text-center shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>View Member Profile &amp; Download ID Card</span>
                <span className="material-symbols-outlined text-base">badge</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
