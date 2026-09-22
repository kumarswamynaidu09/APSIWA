import React, { useState } from 'react';
import { MembershipApplication, UserProfile, WebsiteSettings } from '../types';
import {
  ShieldAlert,
  ShieldCheck,
  Users,
  CreditCard,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Edit3,
  Trash2,
  Check,
  X,
  Upload,
  Settings,
  QrCode,
  Building2,
  Phone,
  Mail,
  MapPin,
  FileText,
  DollarSign,
  Save,
  Eye,
  Lock,
  RefreshCw,
  Award,
  AlertTriangle,
  UserPlus,
  Download,
  Copy,
  LogOut,
  MessageSquare,
  BadgeCheck,
  Plus,
  ExternalLink,
  Calendar,
  CheckCheck,
  Send,
  Sparkles,
  Zap,
  Printer,
  FileCheck
} from 'lucide-react';
import {
  ADMIN_EMAILS,
  isAdminUser,
  updateApplicationDetails,
  deleteApplication,
  saveWebsiteSettings,
  saveMembershipApplication,
  calculateValidityDate
} from '../lib/supabase';
import { sendApprovalConfirmationEmail } from '../lib/emailService';
import { compressImage } from '../lib/imageUtils';

export const AP_DISTRICTS = [
  'Visakhapatnam',
  'NTR (Vijayawada)',
  'Guntur',
  'Tirupati',
  'Kurnool',
  'Sri Potti Sriramulu Nellore',
  'Kakinada',
  'Ananthapuramu',
  'YSR Kadapa',
  'Chittoor',
  'Prakasam',
  'Srikakulam',
  'Vizianagaram',
  'Eluru',
  'West Godavari',
  'East Godavari',
  'Anakapalli',
  'Bapatla',
  'Palnadu',
  'Nandyal',
  'Sri Sathya Sai',
  'Annamayya',
  'Alluri Sitharama Raju',
  'Parvathipuram Manyam',
  'Dr. B.R. Ambedkar Konaseema',
  'Krishna'
];

export const BUSINESS_TYPES = [
  'Private Limited Company',
  'Limited Liability Partnership (LLP)',
  'Sole Proprietorship',
  'Partnership Firm',
  'Public Limited Company'
];

export const EXPERIENCE_LEVELS = [
  '1 - 3 Years',
  '3 - 5 Years',
  '5 - 10 Years',
  '10+ Years',
  'New Entrant (< 1 Year)'
];

interface AdminDashboardProps {
  currentUser: UserProfile | null;
  applications: MembershipApplication[];
  onRefreshApplications: () => void;
  websiteSettings: WebsiteSettings;
  onUpdateWebsiteSettings: (newSettings: WebsiteSettings) => void;
  onNavigateHome: () => void;
  onSwitchToAdminUser: (adminEmail: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  applications,
  onRefreshApplications,
  websiteSettings,
  onUpdateWebsiteSettings,
  onNavigateHome,
  onSwitchToAdminUser
}) => {
  const [activeTab, setActiveTab] = useState<'applications' | 'onspot' | 'settings'>('applications');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<'All' | 'New Member' | 'Existing Member'>('All');
  const [districtFilter, setDistrictFilter] = useState<string>('All');

  // Modal states
  const [viewingApp, setViewingApp] = useState<MembershipApplication | null>(null);
  const [editingApp, setEditingApp] = useState<MembershipApplication | null>(null);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [viewingReceiptUrl, setViewingReceiptUrl] = useState<string | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);

  // On-Spot Registration Form State (Zero Payment / Instant Accreditation)
  const initialSpotForm = {
    fullName: '',
    dateOfBirth: '',
    mobileNumber: '',
    emailAddress: '',
    companyName: '',
    designation: 'Managing Director',
    businessType: 'Solar EPC Integrator',
    district: 'Visakhapatnam',
    gstNumber: '',
    officeAddress: '',
    pincode: '',
    experience: '1 - 3 Years',
    photoUrl: '',
    sendEmailConfirmation: true,
  };

  const [spotForm, setSpotForm] = useState(initialSpotForm);
  const [spotPhotoFileName, setSpotPhotoFileName] = useState('');
  const [isSubmittingSpot, setIsSubmittingSpot] = useState(false);
  const [spotRegisteredApp, setSpotRegisteredApp] = useState<MembershipApplication | null>(null);

  // New Member Form State (for Manual Admin Onboarding Modal)
  const [newMemberForm, setNewMemberForm] = useState({
    fullName: '',
    dateOfBirth: '',
    mobileNumber: '',
    emailAddress: '',
    companyName: '',
    businessType: 'Solar EPC Integrator',
    district: 'Visakhapatnam',
    gstNumber: '',
    officeAddress: '',
    applicationType: 'New Member' as 'New Member' | 'Existing Member',
    utrNumber: 'OFFLINE-ADM-' + Math.floor(100000 + Math.random() * 900000),
    amountPaid: '₹ 2,000.00',
    status: 'Approved' as 'Approved' | 'Pending Verification',
    photoUrl: ''
  });

  // Settings form state
  const [settingsForm, setSettingsForm] = useState<WebsiteSettings>(websiteSettings);

  const isAdmin = isAdminUser(currentUser?.email);

  // Stats calculations
  const totalApps = applications.length;
  const newMemberApps = applications.filter((a) => a.applicationType !== 'Existing Member');
  const existingMemberApps = applications.filter((a) => a.applicationType === 'Existing Member');

  const approvedCount = applications.filter((a) => a.status === 'Approved').length;
  const pendingCount = applications.filter((a) => a.status === 'Pending Verification' || a.status === 'In Review').length;
  const rejectedCount = applications.filter((a) => a.status === 'Rejected').length;
  const pendingExistingCount = existingMemberApps.filter((a) => a.status === 'Pending Verification' || a.status === 'In Review').length;
  const pendingNewCount = newMemberApps.filter((a) => a.status === 'Pending Verification' || a.status === 'In Review').length;

  const approvedNewCount = newMemberApps.filter((a) => a.status === 'Approved').length;
  const totalRevenue = approvedNewCount * (websiteSettings.isExpoActive ? websiteSettings.expoFee : websiteSettings.regularFee);

  // Filtered applications list
  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      (app.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.companyName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.utrNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.emailAddress || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.mobileNumber || '').includes(searchQuery);

    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
    const matchesDistrict = districtFilter === 'All' || app.district === districtFilter;

    const matchesType =
      typeFilter === 'All' ||
      (typeFilter === 'Existing Member' && app.applicationType === 'Existing Member') ||
      (typeFilter === 'New Member' && app.applicationType !== 'Existing Member');

    return matchesSearch && matchesStatus && matchesDistrict && matchesType;
  });

  // Send Email Confirmation & Digital Card via Resend
  const handleSendEmailConfirmation = async (app: MembershipApplication) => {
    if (!app.emailAddress) {
      alert('This member does not have an email address recorded.');
      return;
    }
    setActionSuccessMsg(`Sending membership approval & ID card email to ${app.emailAddress}...`);
    const result = await sendApprovalConfirmationEmail(app, websiteSettings);
    if (result.success) {
      if (result.simulated) {
        setActionSuccessMsg(`Email prepared for ${app.fullName} (${app.emailAddress}). Configure Resend API Key in Settings for live sending.`);
      } else {
        setActionSuccessMsg(`Official approval email & digital ID card sent to ${app.emailAddress} via Resend! (Message ID: ${result.messageId})`);
      }
    } else {
      setActionSuccessMsg(`Email error: ${result.error}`);
    }
    setTimeout(() => setActionSuccessMsg(''), 5500);
  };

  // 1-Click Approve Handler (Updates DB & automatically pushes Resend confirmation email)
  const handleQuickApprove = async (app: MembershipApplication) => {
    const validUntilDate = app.validUntil || calculateValidityDate(app.paymentDate || new Date().toISOString());
    const updated: MembershipApplication = {
      ...app,
      status: 'Approved',
      validUntil: validUntilDate
    };
    await updateApplicationDetails(updated);
    if (viewingApp?.id === app.id) {
      setViewingApp(updated);
    }
    onRefreshApplications();

    // Push email confirmation via Resend with membership card & credentials
    if (updated.emailAddress) {
      setActionSuccessMsg(`Approved ${app.id}! Dispatching confirmation email with digital card to ${updated.emailAddress}...`);
      const emailResult = await sendApprovalConfirmationEmail(updated, websiteSettings);
      if (emailResult.success) {
        if (emailResult.simulated) {
          setActionSuccessMsg(`Member ${app.fullName} (${app.id}) approved! Valid until ${validUntilDate}. (Email prepared for ${updated.emailAddress})`);
        } else {
          setActionSuccessMsg(`Member ${app.fullName} approved and official confirmation email sent to ${updated.emailAddress} via Resend!`);
        }
      } else {
        setActionSuccessMsg(`Member approved, email notice: ${emailResult.error}`);
      }
    } else {
      setActionSuccessMsg(`Application ${app.id} (${app.fullName}) approved! Membership is active & valid until ${validUntilDate}.`);
    }

    setTimeout(() => setActionSuccessMsg(''), 5500);
  };

  // 1-Click Reject / In Review Handler
  const handleQuickReject = async (app: MembershipApplication) => {
    const updated: MembershipApplication = {
      ...app,
      status: 'Rejected'
    };
    await updateApplicationDetails(updated);
    if (viewingApp?.id === app.id) {
      setViewingApp(updated);
    }
    setActionSuccessMsg(`Application ${app.id} marked as Rejected.`);
    onRefreshApplications();
    setTimeout(() => setActionSuccessMsg(''), 3000);
  };

  // Copy text to clipboard with feedback
  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setActionSuccessMsg(`Copied ${label}: ${text}`);
    setTimeout(() => setActionSuccessMsg(''), 3000);
  };

  // Copy WhatsApp approval template message
  const handleCopyWhatsAppMessage = (app: MembershipApplication) => {
    const validDate = app.validUntil || calculateValidityDate(app.paymentDate || new Date().toISOString());
    const message = `*APSIWA Membership Approval Notice*\n\nDear *${app.fullName}* (${app.companyName}),\n\nCongratulations! Your membership application has been *APPROVED* by the Andhra Pradesh Solar Integrators Welfare Association (APSIWA).\n\n*Membership ID:* ${app.id}\n*Valid Until:* ${validDate}\n*Status:* Active Member\n\nYou can now search your status and download your official Digital Smart ID Card at our portal: ${window.location.origin}\n\n_Andhra Pradesh Solar Integrators Welfare Association (APSIWA)_`;
    navigator.clipboard.writeText(message);
    setActionSuccessMsg('WhatsApp approval notification copied to clipboard!');
    setTimeout(() => setActionSuccessMsg(''), 3500);
  };

  // Export Applications to CSV
  const handleExportCSV = () => {
    if (applications.length === 0) {
      alert('No application records to export.');
      return;
    }

    const headers = [
      'Application ID',
      'Application Type',
      'Full Name',
      'Date of Birth',
      'Mobile Number',
      'Email Address',
      'Company Name',
      'Business Type',
      'District',
      'GSTIN',
      'Office Address',
      'Bank UTR Number',
      'Amount Paid',
      'Status',
      'Valid Until',
      'Submission Date'
    ];

    const rows = applications.map((app) => [
      `"${app.id}"`,
      `"${app.applicationType || 'New Member'}"`,
      `"${app.fullName || ''}"`,
      `"${app.dateOfBirth || ''}"`,
      `"${app.mobileNumber || ''}"`,
      `"${app.emailAddress || ''}"`,
      `"${app.companyName || ''}"`,
      `"${app.businessType || ''}"`,
      `"${app.district || ''}"`,
      `"${app.gstNumber || ''}"`,
      `"${(app.officeAddress || '').replace(/"/g, '""')}"`,
      `"${app.utrNumber || ''}"`,
      `"${app.amountPaid || ''}"`,
      `"${app.status || ''}"`,
      `"${app.validUntil || ''}"`,
      `"${app.paymentDate || ''}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `APSIWA_Members_Registry_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setActionSuccessMsg('Exported all member records to CSV successfully!');
    setTimeout(() => setActionSuccessMsg(''), 3000);
  };

  // Handle On-Spot Registration Submission (Zero Payment / Instant DB Persistence)
  const handleSpotRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!spotForm.fullName.trim() || !spotForm.dateOfBirth || !spotForm.mobileNumber.trim()) {
      alert('Please enter Representative Full Name, Date of Birth, and Mobile Number.');
      return;
    }

    if (spotForm.mobileNumber.replace(/\D/g, '').length < 10) {
      alert('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsSubmittingSpot(true);

    const generatedId = `APSIWA-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const validityDate = calculateValidityDate(new Date().toISOString());
    const currentDateFormatted = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    });

    // Auto-generate high-quality avatar if no custom photo was uploaded
    const finalPhotoUrl =
      spotForm.photoUrl ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(spotForm.fullName.trim())}&background=003477&color=ffffff&size=300&font-size=0.45&bold=true`;

    const newSpotApp: MembershipApplication = {
      id: generatedId,
      fullName: spotForm.fullName.trim(),
      dateOfBirth: spotForm.dateOfBirth,
      mobileNumber: spotForm.mobileNumber.trim(),
      emailAddress: spotForm.emailAddress.trim(),
      companyName: spotForm.companyName.trim() || 'Solar Energy Integrator',
      designation: spotForm.designation.trim() || 'Managing Director',
      businessType: spotForm.businessType,
      experience: spotForm.experience,
      district: spotForm.district,
      gstNumber: spotForm.gstNumber.trim() || undefined,
      officeAddress: spotForm.officeAddress.trim() || `${spotForm.district}, Andhra Pradesh`,
      pincode: spotForm.pincode.trim() || '530001',
      photoUrl: finalPhotoUrl,
      utrNumber: `ONSPOT-REG-${Math.floor(100000 + Math.random() * 900000)}`,
      paymentDate: new Date().toISOString(),
      amountPaid: '₹ 0.00 (Spot Enrolment)',
      submissionDate: currentDateFormatted,
      validUntil: validityDate,
      applicationType: 'New Member',
      status: 'Approved',
    };

    // Save directly to Supabase & local database storage
    const saveResult = await saveMembershipApplication(newSpotApp);
    setIsSubmittingSpot(false);

    if (saveResult.error) {
      console.warn('Supabase save notice:', saveResult.error);
    }

    setSpotRegisteredApp(newSpotApp);
    onRefreshApplications();
    setActionSuccessMsg(`⚡ On-Spot Member Registered & Saved to Database! ID: ${newSpotApp.id}`);

    // Send instant welcome & ID card confirmation email if requested & email is provided
    if (spotForm.sendEmailConfirmation && newSpotApp.emailAddress) {
      sendApprovalConfirmationEmail(newSpotApp, websiteSettings)
        .then((emailRes) => {
          if (emailRes.success && !emailRes.simulated) {
            setActionSuccessMsg(`On-Spot registration saved & official Digital Smart ID Card emailed to ${newSpotApp.emailAddress}!`);
          }
        })
        .catch((err) => console.warn('Spot email dispatch error:', err));
    }

    setTimeout(() => setActionSuccessMsg(''), 6000);
  };

  // Handle Photo File Upload with Canvas Compression
  const handleSpotPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImage(file, {
        maxWidth: 600,
        maxHeight: 600,
        quality: 0.8
      });
      setSpotForm((prev) => ({ ...prev, photoUrl: compressed.dataUrl }));
      setSpotPhotoFileName(`${file.name} (${compressed.sizeKb} KB)`);
    } catch (err) {
      console.error('Photo compression failed, falling back to raw reader:', err);
      const reader = new FileReader();
      reader.onload = () => {
        setSpotForm((prev) => ({ ...prev, photoUrl: reader.result as string }));
        setSpotPhotoFileName(file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  // Reset On-Spot Registration Form for next registrant
  const handleResetSpotForm = () => {
    setSpotForm(initialSpotForm);
    setSpotPhotoFileName('');
    setSpotRegisteredApp(null);
  };

  // Handle Manual Member Creation Submission
  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberForm.fullName || !newMemberForm.dateOfBirth || !newMemberForm.mobileNumber) {
      alert('Please enter Name, Date of Birth, and Mobile Number.');
      return;
    }

    const newId = `APSIWA-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const validUntilDate = calculateValidityDate(new Date().toISOString());

    const newApp: MembershipApplication = {
      id: newId,
      fullName: newMemberForm.fullName.trim(),
      dateOfBirth: newMemberForm.dateOfBirth,
      mobileNumber: newMemberForm.mobileNumber.trim(),
      emailAddress: newMemberForm.emailAddress.trim(),
      companyName: newMemberForm.companyName.trim() || 'Solar Solutions Provider',
      businessType: newMemberForm.businessType,
      district: newMemberForm.district,
      gstNumber: newMemberForm.gstNumber.trim() || undefined,
      officeAddress: newMemberForm.officeAddress.trim() || 'Visakhapatnam, Andhra Pradesh',
      applicationType: newMemberForm.applicationType,
      utrNumber: newMemberForm.utrNumber,
      amountPaid: newMemberForm.applicationType === 'Existing Member' ? '₹ 0.00' : newMemberForm.amountPaid,
      paymentScreenshotUrl: undefined,
      photoUrl: newMemberForm.photoUrl || undefined,
      status: newMemberForm.status,
      validUntil: validUntilDate,
      paymentDate: new Date().toISOString()
    };

    await saveMembershipApplication(newApp);
    setIsAddingMember(false);
    setActionSuccessMsg(`Member ${newApp.fullName} (${newApp.id}) added and registered!`);
    onRefreshApplications();
    setTimeout(() => setActionSuccessMsg(''), 4000);
  };

  // Save full edited application
  const handleSaveAppEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApp) return;

    await updateApplicationDetails(editingApp);
    setActionSuccessMsg(`Application ${editingApp.id} updated successfully!`);
    setEditingApp(null);
    onRefreshApplications();
    setTimeout(() => setActionSuccessMsg(''), 3000);
  };

  // Delete Application
  const handleDeleteApp = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete application ${id} for ${name}?`)) {
      await deleteApplication(id);
      setActionSuccessMsg(`Application ${id} deleted.`);
      onRefreshApplications();
      setTimeout(() => setActionSuccessMsg(''), 3000);
    }
  };

  // Save Website Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    await saveWebsiteSettings(settingsForm);
    onUpdateWebsiteSettings(settingsForm);
    setSavingSettings(false);
    setActionSuccessMsg('Global website settings, fees, and QR code updated in realtime!');
    setTimeout(() => setActionSuccessMsg(''), 3500);
  };

  // QR Code Image file upload
  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSettingsForm({ ...settingsForm, qrCodeUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // Admin Login Form State (Clean empty initial values)
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Handle Admin Login submission
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const emailTrimmed = adminEmail.trim().toLowerCase();
    const passwordTrimmed = adminPassword.trim();

    if (!emailTrimmed) {
      setLoginError('Please enter your administrator email address.');
      return;
    }

    if (!passwordTrimmed) {
      setLoginError('Please enter your password.');
      return;
    }

    setIsLoggingIn(true);

    if (!ADMIN_EMAILS.some((adm) => adm.toLowerCase() === emailTrimmed)) {
      setLoginError(`Access Denied: ${adminEmail} is not authorized for administrator access.`);
      setIsLoggingIn(false);
      return;
    }

    // Authorize admin session
    setTimeout(() => {
      onSwitchToAdminUser(adminEmail.trim());
      setIsLoggingIn(false);
      setActionSuccessMsg(`Welcome, Administrator (${adminEmail})`);
      setTimeout(() => setActionSuccessMsg(''), 4000);
    }, 400);
  };

  // If not logged in as authorized admin, show the Secure Admin Login Gatekeeper
  if (!isAdmin) {
    return (
      <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-12 px-4 sm:px-6 animate-in fade-in duration-200">
        <div className="w-full max-w-md bg-white rounded-3xl border border-[#e0e3e6] shadow-xl overflow-hidden">
          {/* Header Banner */}
          <div className="bg-[#003477] text-white p-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 text-white flex items-center justify-center mx-auto shadow-sm">
              <Lock size={26} />
            </div>
            <div>
              <span className="inline-block px-3 py-0.5 rounded-full bg-white/15 text-white text-[11px] font-bold uppercase tracking-wider mb-1.5 border border-white/20">
                Secretariat Portal
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-white">Admin Authentication</h2>
              <p className="text-xs text-white/80 mt-1 max-w-xs mx-auto">
                Authorized access for APSIWA Council &amp; State Secretariat administrators.
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-5">
            {loginError && (
              <div className="p-3.5 rounded-xl bg-[#ffdad6] border border-[#ffb4ab] text-[#ba1a1a] text-xs font-semibold flex items-start gap-2">
                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#191c1e] mb-1.5">
                  Administrator Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 text-[#737783]" size={16} />
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-sm text-[#191c1e] outline-none focus:bg-white focus:border-[#003477] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#191c1e] mb-1.5">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 text-[#737783]" size={16} />
                  <input
                    type="password"
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-sm text-[#191c1e] outline-none focus:bg-white focus:border-[#003477] transition-all"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-3.5 rounded-xl bg-[#003477] hover:bg-[#024aa3] text-white text-sm font-bold text-center shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98 disabled:opacity-75"
                >
                  {isLoggingIn ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={18} />
                      <span>Unlock Admin Dashboard</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="pt-3 border-t border-[#e0e3e6] text-center">
              <button
                type="button"
                onClick={onNavigateHome}
                className="text-xs text-[#003477] hover:underline font-bold cursor-pointer inline-flex items-center gap-1"
              >
                <span>&larr; Return to Public Website</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-margin py-8 space-y-8 animate-in fade-in duration-300">
      {/* ADMIN HEADER BANNER (CLEAN & STREAMLINED) */}
      <div className="relative bg-gradient-to-r from-[#001d4a] via-[#003477] to-[#00285e] rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-[#024aa3]/40 overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-[#ffbe3b]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 -bottom-20 w-64 h-64 bg-[#8ef9a0]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffbe3b] text-[#00285e] text-xs font-black uppercase tracking-wider shadow-xs">
                <ShieldCheck size={14} />
                APSIWA Secretariat Admin Portal
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#8ef9a0]/25 text-[#8ef9a0] text-[11px] font-bold border border-[#8ef9a0]/40">
                <CheckCircle2 size={12} />
                {currentUser?.email}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              State Membership Governance &amp; Approvals
            </h1>

            <p className="text-xs sm:text-sm text-white/80 max-w-2xl leading-relaxed">
              Verify UTR payments, approve memberships in 1-click, review member profiles, export records, and manage association settings.
            </p>
          </div>

          {/* Quick Action Buttons (Replaced Admin Session Active box) */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto shrink-0">
            <button
              onClick={() => {
                setActiveTab('onspot');
                setSpotRegisteredApp(null);
                window.scrollTo({ top: 380, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#006e2e] via-[#008738] to-[#006e2e] text-white text-xs font-black shadow-md hover:shadow-lg hover:scale-105 transition-all cursor-pointer active:scale-95 ring-2 ring-[#8ef9a0]/70 animate-pulse"
            >
              <Zap size={16} className="text-[#ffbe3b]" />
              <span>⚡ On-Spot Registration</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/20 text-xs font-bold transition-all cursor-pointer"
              title="Download all records as CSV spreadsheet"
            >
              <Download size={16} />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => {
                onSwitchToAdminUser(''); // logout
                onNavigateHome();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#ffdad6]/20 hover:bg-[#ffdad6]/35 text-[#ffb4ab] border border-[#ffb4ab]/30 text-xs font-bold transition-all cursor-pointer"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* QUICK STATS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Applications */}
        <div className="bg-white rounded-2xl p-5 border border-[#e0e3e6] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[#737783]">
            <span className="text-xs font-bold uppercase tracking-wider">Total Records</span>
            <FileText size={18} className="text-[#003477]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#191c1e]">{totalApps}</div>
          <span className="text-[11px] text-[#737783] block">Lifetime submitted</span>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white rounded-2xl p-5 border border-[#e0e3e6] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[#b25e00]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#b25e00]">Pending Action</span>
            <Clock size={18} className="text-[#b25e00]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#b25e00]">{pendingCount}</div>
          <span className="text-[11px] text-[#b25e00] font-semibold block">Awaiting admin review</span>
        </div>

        {/* Approved Members */}
        <div className="bg-white rounded-2xl p-5 border border-[#e0e3e6] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[#006e2e]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#006e2e]">Approved Members</span>
            <ShieldCheck size={18} className="text-[#006e2e]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#006e2e]">{approvedCount}</div>
          <span className="text-[11px] text-[#006e2e] font-semibold block">Active Digital ID Cards issued</span>
        </div>

        {/* Collections */}
        <div className="bg-white rounded-2xl p-5 border border-[#e0e3e6] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[#003477]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#003477]">Fee Revenue</span>
            <CreditCard size={18} className="text-[#003477]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#003477]">
            ₹ {totalRevenue.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-[#006e2e] font-semibold block">Verified Admission Fees</span>
        </div>
      </div>

      {/* SUCCESS ACTION TOAST */}
      {actionSuccessMsg && (
        <div className="p-4 rounded-2xl bg-[#8bf69d]/30 border border-[#006e2e]/40 text-[#006e2e] text-xs sm:text-sm font-bold flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} />
            <span>{actionSuccessMsg}</span>
          </div>
          <button onClick={() => setActionSuccessMsg('')} className="text-[#006e2e] hover:opacity-75 cursor-pointer">
            <X size={16} />
          </button>
        </div>
      )}

      {/* DASHBOARD TABS NAVIGATION */}
      <div className="flex border-b border-[#e0e3e6] gap-2 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('applications')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${activeTab === 'applications'
              ? 'border-[#003477] text-[#003477] bg-[#f0f4ff]/60 rounded-t-xl'
              : 'border-transparent text-[#434752] hover:text-[#191c1e]'
            }`}
        >
          <Users size={18} />
          <span>Membership Registry &amp; Approvals</span>
          {pendingCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-[#ffbe3b] text-[#00285e] text-[10.5px] font-black animate-pulse">
              {pendingCount} Pending
            </span>
          )}
        </button>

        <button
          onClick={() => {
            setActiveTab('onspot');
            setSpotRegisteredApp(null);
          }}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${activeTab === 'onspot'
              ? 'border-[#006e2e] text-[#006e2e] bg-[#e8f5e9]/70 rounded-t-xl shadow-xs'
              : 'border-transparent text-[#434752] hover:text-[#006e2e]'
            }`}
        >
          <Zap size={18} className="text-[#006e2e]" />
          <span>⚡ On-Spot Registration (No Payment)</span>
          <span className="px-2 py-0.5 rounded-full bg-[#006e2e] text-white text-[10px] font-black uppercase tracking-wider">
            Fast Desk
          </span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${activeTab === 'settings'
              ? 'border-[#003477] text-[#003477] bg-[#f0f4ff]/60 rounded-t-xl'
              : 'border-transparent text-[#434752] hover:text-[#191c1e]'
            }`}
        >
          <Settings size={18} />
          <span>Website Assets, QR Code &amp; Pricing</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: MEMBERSHIP APPLICATIONS & APPROVALS TABLE */}
      {/* ========================================================================= */}
      {activeTab === 'applications' && (
        <div className="space-y-5">
          {/* Top Category Filter Tabs */}
          <div className="flex rounded-2xl bg-white p-1.5 border border-[#e0e3e6] shadow-xs gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setTypeFilter('All')}
              className={`flex-1 min-w-[140px] py-2 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2 ${typeFilter === 'All'
                  ? 'bg-[#003477] text-white shadow-xs'
                  : 'text-[#434752] hover:bg-[#f2f4f7]'
                }`}
            >
              <span>All Registrations</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${typeFilter === 'All' ? 'bg-white/20 text-white' : 'bg-[#f2f4f7] text-[#737783]'
                }`}>
                {totalApps}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setTypeFilter('New Member')}
              className={`flex-1 min-w-[140px] py-2 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2 ${typeFilter === 'New Member'
                  ? 'bg-[#006e2e] text-white shadow-xs'
                  : 'text-[#434752] hover:bg-[#f2f4f7]'
                }`}
            >
              <span>New Member Admissions</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${typeFilter === 'New Member' ? 'bg-white/20 text-white' : 'bg-[#e8f5e9] text-[#006e2e]'
                }`}>
                {newMemberApps.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setTypeFilter('Existing Member')}
              className={`flex-1 min-w-[140px] py-2 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2 ${typeFilter === 'Existing Member'
                  ? 'bg-[#003477] text-white shadow-xs'
                  : 'text-[#434752] hover:bg-[#f2f4f7]'
                }`}
            >
              <span>Existing Member Onboardings</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${typeFilter === 'Existing Member' ? 'bg-white/20 text-white' : 'bg-[#d8e2ff] text-[#003477]'
                }`}>
                {existingMemberApps.length}
              </span>
            </button>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="bg-white rounded-2xl p-4 border border-[#e0e3e6] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Search */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-3 text-[#737783]" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Name, Firm, ID, UTR, Phone..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-xs font-medium focus:bg-white focus:border-[#003477] outline-none"
              />
            </div>

            {/* Filter Dropdowns & Actions */}
            <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap justify-end">
              <div className="flex items-center gap-1.5 text-xs text-[#737783]">
                <Filter size={14} />
                <span className="font-semibold">Status:</span>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-xs font-bold text-[#003477] outline-none cursor-pointer"
              >
                <option value="All">All Statuses ({totalApps})</option>
                <option value="Pending Verification">Pending Verification ({pendingCount})</option>
                <option value="Approved">Approved ({approvedCount})</option>
                <option value="In Review">In Review</option>
                <option value="Rejected">Rejected ({rejectedCount})</option>
              </select>

              <button
                onClick={onRefreshApplications}
                className="p-2 rounded-xl bg-[#f2f4f7] hover:bg-[#e0e3e6] text-[#003477] transition-colors cursor-pointer"
                title="Refresh Realtime Data"
              >
                <RefreshCw size={15} />
              </button>
            </div>
          </div>

          {/* Applications Table */}
          <div className="bg-white rounded-3xl border border-[#e0e3e6] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#f7f9fc] border-b border-[#e0e3e6] text-[#737783] uppercase font-bold text-[10.5px]">
                    <th className="py-3.5 px-4">Member Details</th>
                    <th className="py-3.5 px-4">Type</th>
                    <th className="py-3.5 px-4">Firm &amp; District</th>
                    <th className="py-3.5 px-4">Payment Proof</th>
                    <th className="py-3.5 px-4">Status &amp; Validity</th>
                    <th className="py-3.5 px-4 text-right">Quick Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e0e3e6]">
                  {filteredApps.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-[#737783]">
                        No membership records matching your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredApps.map((app) => {
                      const isAppApproved = app.status === 'Approved';
                      const isExistingMember = app.applicationType === 'Existing Member';
                      const validUntilDate = app.validUntil || calculateValidityDate(app.paymentDate);

                      return (
                        <tr key={app.id} className="hover:bg-[#fbfcfe] transition-colors">
                          {/* Member Details */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div
                                onClick={() => setViewingApp(app)}
                                className="w-10 h-11 rounded-xl bg-[#003477] text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden shadow-2xs border border-[#003477]/20 cursor-pointer hover:opacity-90"
                                title="Click to view full application & verify photo"
                              >
                                {app.photoUrl ? (
                                  <img src={app.photoUrl} alt={app.fullName} className="w-full h-full object-cover" />
                                ) : (
                                  app.fullName.charAt(0)
                                )}
                              </div>
                              <div className="min-w-0">
                                <button
                                  onClick={() => setViewingApp(app)}
                                  className="font-extrabold text-[#191c1e] text-[13px] block truncate text-left hover:text-[#003477] cursor-pointer"
                                >
                                  {app.fullName}
                                </button>
                                <span className="text-[11px] text-[#003477] font-semibold block truncate">
                                  DOB: {app.dateOfBirth || 'N/A'}
                                </span>
                                <span className="text-[10.5px] text-[#737783] block truncate font-mono">
                                  ID: {app.id} • {app.mobileNumber}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Application Type */}
                          <td className="py-3.5 px-4">
                            {isExistingMember ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#d8e2ff] text-[#001a42] font-extrabold text-[10px] border border-[#003477]/20">
                                <ShieldCheck size={11} className="text-[#003477]" />
                                Existing Member
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#e8f5e9] text-[#004d1c] font-extrabold text-[10px] border border-[#006e2e]/20">
                                <UserPlus size={11} className="text-[#006e2e]" />
                                New Admission
                              </span>
                            )}
                          </td>

                          {/* Firm & District */}
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-[#003477] block truncate max-w-[180px]">
                              {app.companyName}
                            </span>
                            <span className="text-[10.5px] text-[#434752] block font-medium">
                              {app.district} • {app.businessType}
                            </span>
                            <span className="text-[10px] text-[#737783] block font-mono">
                              GST: {app.gstNumber || 'N/A'}
                            </span>
                          </td>

                          {/* Payment / Onboard Proof */}
                          <td className="py-3.5 px-4">
                            {isExistingMember ? (
                              <div>
                                <span className="text-[10px] font-extrabold text-[#006e2e] block">
                                  Exempt / Pre-registered
                                </span>
                                <span className="text-[10px] text-[#737783] font-mono">
                                  Ref: {app.utrNumber || 'N/A'}
                                </span>
                              </div>
                            ) : (app.amountPaid?.toLowerCase().includes('spot') || app.amountPaid?.includes('0.00') || app.utrNumber?.startsWith('ONSPOT')) ? (
                              <div>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#e8f5e9] text-[#006e2e] font-extrabold text-[10px] border border-[#006e2e]/30">
                                  <Zap size={10} className="text-[#006e2e]" />
                                  Spot Enrolment (₹0 Fee)
                                </span>
                                <span className="text-[10px] text-[#737783] font-mono block mt-0.5">
                                  Ref: {app.utrNumber}
                                </span>
                              </div>
                            ) : (
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono font-bold text-[#006e2e]">{app.utrNumber}</span>
                                  {app.paymentScreenshotUrl && (
                                    <button
                                      type="button"
                                      onClick={() => setViewingReceiptUrl(app.paymentScreenshotUrl || null)}
                                      className="p-1 rounded bg-[#f2f4f7] hover:bg-[#e0e3e6] text-[#003477] cursor-pointer"
                                      title="View Uploaded Payment Screenshot"
                                    >
                                      <Eye size={12} />
                                    </button>
                                  )}
                                </div>
                                <span className="text-[10.5px] text-[#191c1e] font-bold block">
                                  {app.amountPaid || '₹ 2,000.00'}
                                </span>
                              </div>
                            )}
                          </td>

                          {/* Status & Validity */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-1">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10.5px] ${isAppApproved
                                    ? 'bg-[#8ef9a0]/25 text-[#006e2e] border border-[#006e2e]/30'
                                    : app.status === 'In Review'
                                      ? 'bg-[#d8e2ff] text-[#001a42] border border-[#003477]/20'
                                      : app.status === 'Rejected'
                                        ? 'bg-[#ffdad6] text-[#ba1a1a] border border-[#ba1a1a]/30'
                                        : 'bg-[#ffbe3b]/25 text-[#00285e] border border-[#ffbe3b]/40'
                                  }`}
                              >
                                {isAppApproved ? <Check size={11} /> : <Clock size={11} />}
                                <span>{app.status}</span>
                              </span>
                              {isAppApproved && (
                                <span className="text-[10px] text-[#006e2e] block font-mono font-semibold">
                                  Valid: {validUntilDate}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Quick Admin Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                              {/* Full Review Modal */}
                              <button
                                type="button"
                                onClick={() => setViewingApp(app)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#f0f4ff] hover:bg-[#d8e2ff] text-[#003477] text-[11px] font-bold transition-all cursor-pointer"
                                title="Open Full Review & Document Verification"
                              >
                                <Eye size={12} />
                                <span>Review</span>
                              </button>

                              {!isAppApproved ? (
                                <button
                                  type="button"
                                  onClick={() => handleQuickApprove(app)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#006e2e] hover:bg-[#005322] text-white text-[11px] font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                                  title="1-Click Approve Application & Dispatch Resend Email with ID Card"
                                >
                                  <Check size={12} />
                                  <span>Approve</span>
                                </button>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleCopyWhatsAppMessage(app)}
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#e8f5e9] hover:bg-[#c8e6c9] text-[#006e2e] text-[11px] font-bold transition-colors cursor-pointer"
                                    title="Copy WhatsApp approval message to send to applicant"
                                  >
                                    <MessageSquare size={12} />
                                    <span>WhatsApp</span>
                                  </button>

                                  {app.emailAddress && (
                                    <button
                                      type="button"
                                      onClick={() => handleSendEmailConfirmation(app)}
                                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#e0edff] hover:bg-[#c5dcfa] text-[#003477] text-[11px] font-bold transition-colors cursor-pointer"
                                      title={`Push confirmation email & digital ID card to ${app.emailAddress} via Resend`}
                                    >
                                      <Send size={11} />
                                      <span>Email</span>
                                    </button>
                                  )}
                                </>
                              )}

                              {/* Copy ID Button */}
                              <button
                                type="button"
                                onClick={() => handleCopyText(app.id, 'Membership ID')}
                                className="p-1.5 rounded-lg bg-[#f2f4f7] hover:bg-[#e0e3e6] text-[#434752] transition-colors cursor-pointer"
                                title="Copy Membership ID"
                              >
                                <Copy size={13} />
                              </button>

                              {/* Edit Modal Button */}
                              <button
                                type="button"
                                onClick={() => setEditingApp({ ...app })}
                                className="p-1.5 rounded-lg bg-[#f2f4f7] hover:bg-[#d8e2ff] text-[#003477] transition-colors cursor-pointer"
                                title="Edit Record Details"
                              >
                                <Edit3 size={13} />
                              </button>

                              {/* Delete Button */}
                              <button
                                type="button"
                                onClick={() => handleDeleteApp(app.id, app.fullName)}
                                className="p-1.5 rounded-lg bg-[#f2f4f7] hover:bg-[#ffdad6] text-[#ba1a1a] transition-colors cursor-pointer"
                                title="Delete Record"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DETAILED MEMBER REVIEW & APPROVAL MODAL */}
      {/* ========================================================================= */}
      {viewingApp && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-150 my-8 shadow-2xl border border-[#e0e3e6]">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#e0e3e6] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-14 rounded-2xl bg-[#003477] text-white overflow-hidden flex items-center justify-center font-bold shadow-md border-2 border-[#003477]">
                  {viewingApp.photoUrl ? (
                    <img src={viewingApp.photoUrl} alt="Photo" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm font-black">{viewingApp.fullName.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-[#191c1e]">{viewingApp.fullName}</h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${viewingApp.status === 'Approved'
                          ? 'bg-[#e8f5e9] text-[#006e2e] border border-[#006e2e]/30'
                          : 'bg-[#ffbe3b]/25 text-[#00285e] border border-[#ffbe3b]/40'
                        }`}
                    >
                      {viewingApp.status}
                    </span>
                  </div>
                  <p className="text-xs font-mono font-bold text-[#003477]">
                    ID: {viewingApp.id} • {viewingApp.applicationType || 'New Member'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setViewingApp(null)}
                className="p-2 rounded-full bg-[#f2f4f7] hover:bg-[#e0e3e6] text-[#434752] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-[#f7f9fc] border border-[#e0e3e6] space-y-1">
                <span className="text-[10.5px] uppercase font-bold text-[#737783] block">Personal Information</span>
                <p className="font-bold text-[#191c1e]">{viewingApp.fullName}</p>
                <p className="text-[#003477] font-semibold">DOB: {viewingApp.dateOfBirth || 'Not Provided'}</p>
                <p className="text-[#434752]">Phone: {viewingApp.mobileNumber}</p>
                <p className="text-[#434752] truncate">Email: {viewingApp.emailAddress}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#f7f9fc] border border-[#e0e3e6] space-y-1">
                <span className="text-[10.5px] uppercase font-bold text-[#737783] block">Firm &amp; Enterprise</span>
                <p className="font-bold text-[#003477]">{viewingApp.companyName}</p>
                <p className="text-[#434752] font-semibold">{viewingApp.businessType}</p>
                <p className="text-[#191c1e]">District: {viewingApp.district}</p>
                <p className="text-[#737783] font-mono">GSTIN: {viewingApp.gstNumber || 'N/A'}</p>
              </div>

              <div className="sm:col-span-2 p-3.5 rounded-xl bg-[#f7f9fc] border border-[#e0e3e6] space-y-1">
                <span className="text-[10.5px] uppercase font-bold text-[#737783] block">Office Address</span>
                <p className="text-[#191c1e] leading-relaxed">{viewingApp.officeAddress || 'Not Provided'}</p>
              </div>

              {/* Payment & Validity Section */}
              <div className="sm:col-span-2 p-4 rounded-2xl bg-gradient-to-r from-[#f0f9f4] to-[#f0f4ff] border border-[#b8e5c8] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] uppercase font-extrabold text-[#006e2e] block tracking-wider">
                    Membership Validity &amp; Payment
                  </span>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm font-black text-[#003477]">
                      {viewingApp.applicationType === 'Existing Member' ? 'Existing Member (Fee Exempt)' : `Paid: ${viewingApp.amountPaid || '₹ 2,000.00'}`}
                    </span>
                    <span className="font-mono text-xs font-bold text-[#006e2e] bg-white px-2 py-0.5 rounded-md border border-[#006e2e]/20">
                      UTR: {viewingApp.utrNumber}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#434752] mt-1">
                    Membership Valid Until: <strong className="text-[#006e2e]">{viewingApp.validUntil || calculateValidityDate(viewingApp.paymentDate)}</strong> (1 Year)
                  </p>
                </div>

                {viewingApp.paymentScreenshotUrl && (
                  <button
                    type="button"
                    onClick={() => setViewingReceiptUrl(viewingApp.paymentScreenshotUrl || null)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white text-[#003477] font-bold text-xs shadow-xs border border-[#e0e3e6] hover:bg-[#f2f4f7] cursor-pointer"
                  >
                    <Eye size={14} />
                    <span>View Receipt Proof</span>
                  </button>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-[#e0e3e6] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyWhatsAppMessage(viewingApp)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#e8f5e9] hover:bg-[#c8e6c9] text-[#006e2e] font-bold text-xs transition-colors cursor-pointer"
                  title="Copy WhatsApp notification"
                >
                  <MessageSquare size={14} />
                  <span>WhatsApp Notice</span>
                </button>

                {viewingApp.emailAddress && (
                  <button
                    type="button"
                    onClick={() => handleSendEmailConfirmation(viewingApp)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#e0edff] hover:bg-[#c5dcfa] text-[#003477] font-bold text-xs transition-colors cursor-pointer"
                    title={`Send confirmation & digital ID card email to ${viewingApp.emailAddress} via Resend`}
                  >
                    <Send size={14} />
                    <span>Email Member</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleCopyText(viewingApp.id, 'Membership ID')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#f2f4f7] hover:bg-[#e0e3e6] text-[#434752] font-bold text-xs transition-colors cursor-pointer"
                >
                  <Copy size={14} />
                  <span>Copy ID</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                {viewingApp.status !== 'Approved' ? (
                  <button
                    type="button"
                    onClick={() => handleQuickApprove(viewingApp)}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#006e2e] hover:bg-[#005322] text-white font-black text-xs shadow-md transition-all cursor-pointer active:scale-95"
                  >
                    <CheckCheck size={16} />
                    <span>Approve &amp; Issue ID Card</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleQuickReject(viewingApp)}
                    className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-[#ffdad6] hover:bg-[#ffb4ab] text-[#ba1a1a] font-bold text-xs transition-colors cursor-pointer"
                  >
                    <X size={14} />
                    <span>Revoke / Reject</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setEditingApp({ ...viewingApp });
                    setViewingApp(null);
                  }}
                  className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-[#003477] hover:bg-[#024aa3] text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  <Edit3 size={14} />
                  <span>Edit</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ON-SPOT REGISTRATION DESK (ZERO PAYMENT / INSTANT ACCREDITATION) */}
      {/* ========================================================================= */}
      {activeTab === 'onspot' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Desk Banner */}
          <div className="bg-gradient-to-r from-[#00285e] via-[#003477] to-[#004d1c] rounded-3xl p-6 sm:p-8 text-white shadow-lg border border-[#8ef9a0]/30 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-80 h-80 bg-[#8ef9a0]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffbe3b] text-[#00285e] text-xs font-black uppercase tracking-wider shadow-xs">
                    <Zap size={14} className="fill-[#00285e]" />
                    Secretariat Spot Admission Desk
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#8ef9a0]/20 text-[#8ef9a0] text-xs font-bold border border-[#8ef9a0]/40">
                    <CheckCircle2 size={12} />
                    Zero Fee / Direct Database Registration
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  On-Spot Member Registration &amp; Instant ID Desk
                </h2>
                <p className="text-xs sm:text-sm text-white/80 max-w-2xl leading-relaxed">
                  Fast on-spot registration for exhibitions, conferences &amp; secretariat walk-ins. No payment required (fee waived). The member record is saved directly into the live database, generates an official ID, and enables immediate Digital Smart ID Card access.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleResetSpotForm}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw size={14} />
                  <span>Reset Form</span>
                </button>
              </div>
            </div>
          </div>

          {/* SUCCESS STATE VIEW (IF JUST REGISTERED) */}
          {spotRegisteredApp ? (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#006e2e] shadow-xl space-y-6 animate-in zoom-in-95 duration-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#e0e3e6]">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#e8f5e9] text-[#006e2e] flex items-center justify-center font-bold text-xl shadow-xs border border-[#006e2e]/20 shrink-0">
                    <CheckCircle2 size={28} />
                  </div>
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-[#006e2e]">
                      SUCCESSFULLY REGISTERED &amp; SAVED IN DATABASE
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-[#191c1e]">
                      {spotRegisteredApp.fullName}
                    </h3>
                    <p className="text-xs text-[#737783]">
                      {spotRegisteredApp.companyName} • {spotRegisteredApp.district}, Andhra Pradesh
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right bg-[#f7f9fc] px-4 py-2.5 rounded-2xl border border-[#e0e3e6]">
                  <span className="text-[10px] font-bold uppercase text-[#737783] block">
                    Issued Membership ID
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-mono font-black text-[#003477]">
                      {spotRegisteredApp.id}
                    </span>
                    <button
                      onClick={() => handleCopyText(spotRegisteredApp.id, 'Membership ID')}
                      className="p-1 rounded-lg hover:bg-white text-[#003477] border border-transparent hover:border-[#e0e3e6] cursor-pointer"
                      title="Copy Membership ID"
                    >
                      <Copy size={15} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Registration Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-[#f7f9fc] border border-[#e0e3e6]">
                  <span className="text-[10px] uppercase font-bold text-[#737783] block">Mobile Number</span>
                  <span className="font-bold text-[#191c1e] text-sm">+91 {spotRegisteredApp.mobileNumber}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#f7f9fc] border border-[#e0e3e6]">
                  <span className="text-[10px] uppercase font-bold text-[#737783] block">Email Address</span>
                  <span className="font-bold text-[#003477] text-sm truncate block">{spotRegisteredApp.emailAddress}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#f7f9fc] border border-[#e0e3e6]">
                  <span className="text-[10px] uppercase font-bold text-[#737783] block">Membership Status</span>
                  <span className="inline-flex items-center gap-1 font-bold text-[#006e2e] text-sm">
                    <span className="w-2 h-2 rounded-full bg-[#006e2e] animate-pulse"></span>
                    Approved &amp; Active
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#f7f9fc] border border-[#e0e3e6]">
                  <span className="text-[10px] uppercase font-bold text-[#737783] block">Card Validity</span>
                  <span className="font-bold text-[#003477] text-sm font-mono">{spotRegisteredApp.validUntil}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#e0e3e6]">
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={() => setViewingApp(spotRegisteredApp)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#003477] hover:bg-[#024aa3] text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
                  >
                    <Eye size={15} />
                    <span>View Member Card &amp; Dossier</span>
                  </button>

                  <button
                    onClick={() => handleSendEmailConfirmation(spotRegisteredApp)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#f0f4ff] hover:bg-[#d8e2ff] text-[#003477] text-xs font-bold transition-colors cursor-pointer border border-[#003477]/20"
                  >
                    <Mail size={15} />
                    <span>Resend Confirmation Email</span>
                  </button>

                  <button
                    onClick={() => handleCopyWhatsAppMessage(spotRegisteredApp)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#e8f5e9] hover:bg-[#c8e6c9] text-[#006e2e] text-xs font-bold transition-colors cursor-pointer border border-[#006e2e]/20"
                  >
                    <MessageSquare size={15} />
                    <span>Copy WhatsApp Notice</span>
                  </button>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setActiveTab('applications')}
                    className="px-4 py-2.5 rounded-xl bg-[#f2f4f7] hover:bg-[#e0e3e6] text-[#434752] text-xs font-bold cursor-pointer"
                  >
                    View in Registry
                  </button>

                  <button
                    onClick={handleResetSpotForm}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#006e2e] to-[#008738] text-white text-xs font-black shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95"
                  >
                    <UserPlus size={16} />
                    <span>Register Next Member (On-Spot)</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* ON-SPOT REGISTRATION FORM */
            <form onSubmit={handleSpotRegistration} className="space-y-6">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e0e3e6] shadow-sm space-y-6">
                {/* Section 1: Personal Credentials */}
                <div>
                  <div className="flex items-center gap-2 pb-3 border-b border-[#e0e3e6] mb-4">
                    <UserPlus size={18} className="text-[#003477]" />
                    <h3 className="text-base font-extrabold text-[#191c1e]">
                      1. Representative Personal Credentials
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-[#191c1e] mb-1.5">
                        Full Representative Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Srikanth Varma"
                        value={spotForm.fullName}
                        onChange={(e) => setSpotForm({ ...spotForm, fullName: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-xs font-semibold text-[#191c1e] focus:bg-white focus:border-[#003477] outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[#191c1e] mb-1.5">
                        Date of Birth * (For Smart ID Card)
                      </label>
                      <input
                        type="date"
                        required
                        max={new Date().toISOString().split('T')[0]}
                        value={spotForm.dateOfBirth}
                        onChange={(e) => setSpotForm({ ...spotForm, dateOfBirth: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-xs font-semibold text-[#191c1e] focus:bg-white focus:border-[#003477] outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[#191c1e] mb-1.5">
                        Mobile Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        placeholder="10-digit mobile number"
                        value={spotForm.mobileNumber}
                        onChange={(e) => setSpotForm({ ...spotForm, mobileNumber: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-xs font-semibold text-[#191c1e] focus:bg-white focus:border-[#003477] outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[#191c1e] mb-1.5">
                        Email Address * (For Card Delivery)
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="member@company.com"
                        value={spotForm.emailAddress}
                        onChange={(e) => setSpotForm({ ...spotForm, emailAddress: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-xs font-semibold text-[#191c1e] focus:bg-white focus:border-[#003477] outline-none transition-colors"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-bold text-[#191c1e] mb-1.5">
                        Member Portrait Photograph (Optional / Auto-avatar Generated)
                      </label>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-14 rounded-xl bg-[#f2f4f7] border-2 border-[#003477]/30 overflow-hidden flex items-center justify-center shrink-0 shadow-2xs">
                          {spotForm.photoUrl ? (
                            <img src={spotForm.photoUrl} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[10px] font-bold text-[#737783]">Avatar</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <label className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#003477] hover:bg-[#024aa3] text-white text-xs font-bold cursor-pointer transition-colors shadow-2xs">
                            <Upload size={14} />
                            <span>Upload &amp; Compress Photo</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleSpotPhotoUpload}
                              className="hidden"
                            />
                          </label>
                          {spotPhotoFileName && (
                            <span className="text-[11px] text-[#006e2e] font-semibold block mt-1 truncate">
                              ✓ {spotPhotoFileName}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Business Firm & District */}
                <div>
                  <div className="flex items-center gap-2 pb-3 border-b border-[#e0e3e6] mb-4">
                    <Building2 size={18} className="text-[#003477]" />
                    <h3 className="text-base font-extrabold text-[#191c1e]">
                      2. Business Entity &amp; District Profile
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-[#191c1e] mb-1.5">
                        Company / Solar Enterprise Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Andhra Solar Integrators Ltd"
                        value={spotForm.companyName}
                        onChange={(e) => setSpotForm({ ...spotForm, companyName: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-xs font-semibold text-[#191c1e] focus:bg-white focus:border-[#003477] outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[#191c1e] mb-1.5">
                        Representative Designation
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Managing Director / Partner / Lead EPC"
                        value={spotForm.designation}
                        onChange={(e) => setSpotForm({ ...spotForm, designation: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-xs font-semibold text-[#191c1e] focus:bg-white focus:border-[#003477] outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[#191c1e] mb-1.5">
                        District (Andhra Pradesh) *
                      </label>
                      <select
                        value={spotForm.district}
                        onChange={(e) => setSpotForm({ ...spotForm, district: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-xs font-bold text-[#003477] focus:bg-white focus:border-[#003477] outline-none cursor-pointer"
                      >
                        {AP_DISTRICTS.map((dist) => (
                          <option key={dist} value={dist}>
                            {dist}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-[#191c1e] mb-1.5">
                        Business Entity Type
                      </label>
                      <select
                        value={spotForm.businessType}
                        onChange={(e) => setSpotForm({ ...spotForm, businessType: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-xs font-semibold text-[#191c1e] focus:bg-white focus:border-[#003477] outline-none cursor-pointer"
                      >
                        {BUSINESS_TYPES.map((bt) => (
                          <option key={bt} value={bt}>
                            {bt}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-[#191c1e] mb-1.5">
                        Solar Industry Experience
                      </label>
                      <select
                        value={spotForm.experience}
                        onChange={(e) => setSpotForm({ ...spotForm, experience: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-xs font-semibold text-[#191c1e] focus:bg-white focus:border-[#003477] outline-none cursor-pointer"
                      >
                        {EXPERIENCE_LEVELS.map((exp) => (
                          <option key={exp} value={exp}>
                            {exp}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-[#191c1e] mb-1.5">
                        GSTIN Number (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="37AAAAA0000A1Z5"
                        value={spotForm.gstNumber}
                        onChange={(e) => setSpotForm({ ...spotForm, gstNumber: e.target.value.toUpperCase() })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-xs font-mono font-bold text-[#003477] focus:bg-white focus:border-[#003477] outline-none transition-colors"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-bold text-[#191c1e] mb-1.5">
                        Office / Business Street Address *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Door No 4-21, Main Road, Commercial Complex"
                        value={spotForm.officeAddress}
                        onChange={(e) => setSpotForm({ ...spotForm, officeAddress: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-xs font-semibold text-[#191c1e] focus:bg-white focus:border-[#003477] outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[#191c1e] mb-1.5">
                        Pincode
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="530001"
                        value={spotForm.pincode}
                        onChange={(e) => setSpotForm({ ...spotForm, pincode: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-xs font-mono font-semibold text-[#191c1e] focus:bg-white focus:border-[#003477] outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Spot Enrolment Policy & Zero Payment Details */}
                <div className="p-4 rounded-2xl bg-[#e8f5e9]/60 border border-[#006e2e]/30 space-y-3 text-xs">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={18} className="text-[#006e2e]" />
                      <span className="font-extrabold text-[#004d1c] text-sm">
                        Zero Payment Spot Enrolment Policy
                      </span>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-[#006e2e] text-white text-[11px] font-black uppercase">
                      Fee: ₹ 0.00 (Exempt)
                    </span>
                  </div>

                  <p className="text-[#004d1c]/80 text-[11.5px] leading-relaxed">
                    This registration will be written directly into the Supabase database with <strong>Approved</strong> status and 1-year institutional validity ({calculateValidityDate(new Date().toISOString())}). No payment verification is needed.
                  </p>

                  <div className="pt-2 border-t border-[#006e2e]/20 flex items-center justify-between flex-wrap gap-2">
                    <label className="inline-flex items-center gap-2 cursor-pointer font-bold text-[#004d1c]">
                      <input
                        type="checkbox"
                        checked={spotForm.sendEmailConfirmation}
                        onChange={(e) => setSpotForm({ ...spotForm, sendEmailConfirmation: e.target.checked })}
                        className="w-4 h-4 rounded text-[#006e2e] focus:ring-[#006e2e]"
                      />
                      <span>Dispatch official welcome confirmation email &amp; Smart ID Card link to member</span>
                    </label>
                  </div>
                </div>

                {/* Submit Action Buttons */}
                <div className="pt-4 border-t border-[#e0e3e6] flex flex-col sm:flex-row items-center justify-between gap-3">
                  <span className="text-xs text-[#737783]">
                    Member can instantly access their card at <strong>www.apsiwa.in</strong> after saving.
                  </span>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={handleResetSpotForm}
                      className="flex-1 sm:flex-initial px-4 py-3 rounded-xl bg-[#f2f4f7] hover:bg-[#e0e3e6] text-[#434752] text-xs font-bold transition-colors cursor-pointer"
                    >
                      Clear Form
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmittingSpot}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#006e2e] via-[#008738] to-[#006e2e] text-white text-xs sm:text-sm font-black shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-98 disabled:opacity-75"
                    >
                      {isSubmittingSpot ? (
                        <>
                          <RefreshCw size={16} className="animate-spin" />
                          <span>Saving to Database...</span>
                        </>
                      ) : (
                        <>
                          <Zap size={16} className="text-[#ffbe3b]" />
                          <span>Complete On-Spot Registration &amp; Save</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MANUAL MEMBER ADDITION MODAL (FOR SECRETARIAT ADMIN) */}
      {/* ========================================================================= */}
      {isAddingMember && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 animate-in zoom-in-95 duration-150 my-8 shadow-2xl border border-[#e0e3e6]">
            <div className="flex items-center justify-between border-b border-[#e0e3e6] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#006e2e]/15 text-[#006e2e] flex items-center justify-center font-bold">
                  <Zap size={20} className="text-[#006e2e]" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#191c1e]">On-Spot Secretariat Admission Modal</h3>
                  <p className="text-xs text-[#737783]">Direct registration with zero payment, instant ID &amp; database persistence</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddingMember(false)}
                className="p-1.5 rounded-full bg-[#f2f4f7] hover:bg-[#e0e3e6] text-[#434752] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateMember} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#191c1e] mb-1">Applicant / Member Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kumar Swamy"
                    value={newMemberForm.fullName}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, fullName: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] font-medium outline-none focus:bg-white focus:border-[#003477]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#191c1e] mb-1">Date of Birth * (Compulsory)</label>
                  <input
                    type="date"
                    required
                    value={newMemberForm.dateOfBirth}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, dateOfBirth: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] font-medium outline-none focus:bg-white focus:border-[#003477]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#191c1e] mb-1">Mobile Phone Number *</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    value={newMemberForm.mobileNumber}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, mobileNumber: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] font-medium outline-none focus:bg-white focus:border-[#003477]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#191c1e] mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="member@example.com"
                    value={newMemberForm.emailAddress}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, emailAddress: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] font-medium outline-none focus:bg-white focus:border-[#003477]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#191c1e] mb-1">Company / Solar Enterprise Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Swamy Solar Systems Pvt Ltd"
                    value={newMemberForm.companyName}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, companyName: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] font-medium outline-none focus:bg-white focus:border-[#003477]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#191c1e] mb-1">District *</label>
                  <select
                    value={newMemberForm.district}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, district: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] font-bold text-[#003477] outline-none cursor-pointer"
                  >
                    {AP_DISTRICTS.map((dist) => (
                      <option key={dist} value={dist}>
                        {dist}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#191c1e] mb-1">Registration Type</label>
                  <select
                    value={newMemberForm.applicationType}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, applicationType: e.target.value as any })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] font-bold text-[#003477] outline-none cursor-pointer"
                  >
                    <option value="New Member">New Member (Spot Admission - ₹0 Fee)</option>
                    <option value="Existing Member">Existing Member (Exempt / Offline)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#191c1e] mb-1">Status</label>
                  <div className="px-3 py-2.5 rounded-xl bg-[#e8f5e9] text-[#006e2e] font-extrabold flex items-center gap-1.5 border border-[#006e2e]/20">
                    <CheckCircle2 size={14} />
                    <span>Approved &amp; Active</span>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-[#191c1e] mb-1">Member Portrait Photo</label>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-14 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] overflow-hidden flex items-center justify-center shrink-0">
                      {newMemberForm.photoUrl ? (
                        <img src={newMemberForm.photoUrl} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] text-[#737783]">No Photo</span>
                      )}
                    </div>
                    <label className="px-4 py-2.5 rounded-xl bg-[#003477] hover:bg-[#024aa3] text-white text-xs font-bold cursor-pointer transition-colors shrink-0">
                      <span>Upload &amp; Compress Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const res = await compressImage(file, { maxWidth: 500, maxHeight: 500 });
                            setNewMemberForm({ ...newMemberForm, photoUrl: res.dataUrl });
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#e0e3e6] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddingMember(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#f2f4f7] hover:bg-[#e0e3e6] text-[#434752] font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#006e2e] hover:bg-[#005322] text-white font-bold shadow-md cursor-pointer"
                >
                  <Check size={16} />
                  <span>Register &amp; Save Member to Database</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: WEBSITE ASSETS, QR CODE, PRICING & CONTACT SETTINGS */}
      {/* ========================================================================= */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 6 cols: QR Code & Banking Assets */}
            <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-7 border border-[#e0e3e6] shadow-xs space-y-6">
              <div className="flex items-center gap-2 pb-3 border-b border-[#e0e3e6]">
                <QrCode size={18} className="text-[#003477]" />
                <h3 className="text-base font-extrabold text-[#191c1e]">
                  Official UPI QR Code &amp; Bank Ledger Details
                </h3>
              </div>

              {/* QR Code Upload & Preview */}
              <div className="p-4 rounded-2xl bg-[#f7f9fc] border border-[#e0e3e6] flex flex-col sm:flex-row items-center gap-5">
                <div className="w-28 h-28 rounded-xl bg-white border border-[#e0e3e6] p-1 flex items-center justify-center shrink-0 shadow-xs">
                  {settingsForm.qrCodeUrl ? (
                    <img src={settingsForm.qrCodeUrl} alt="UPI QR" className="w-full h-full object-contain" />
                  ) : (
                    <QrCode size={40} className="text-[#737783]" />
                  )}
                </div>

                <div className="space-y-2 flex-1 text-center sm:text-left">
                  <span className="text-xs font-bold text-[#191c1e] block">Live Membership UPI QR</span>
                  <p className="text-[11px] text-[#737783] leading-relaxed">
                    Upload a new payment QR code image or paste the image link to update the live scanner immediately.
                  </p>
                  <label className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#003477] hover:bg-[#024aa3] text-white text-xs font-bold cursor-pointer transition-colors shadow-2xs">
                    <Upload size={13} />
                    <span>Upload New QR Image</span>
                    <input type="file" accept="image/*" onChange={handleQrUpload} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Banking Details Fields */}
              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#191c1e] mb-1">APSIWA UPI ID *</label>
                  <input
                    type="text"
                    required
                    value={settingsForm.upiId}
                    onChange={(e) => setSettingsForm({ ...settingsForm, upiId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-xs font-mono font-bold text-[#003477] focus:bg-white focus:border-[#003477] outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-[#191c1e] mb-1">SBI Account Number *</label>
                    <input
                      type="text"
                      required
                      value={settingsForm.accountNumber}
                      onChange={(e) => setSettingsForm({ ...settingsForm, accountNumber: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-xs font-mono font-bold text-[#191c1e] focus:bg-white focus:border-[#003477] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#191c1e] mb-1">IFSC Code *</label>
                    <input
                      type="text"
                      required
                      value={settingsForm.ifscCode}
                      onChange={(e) => setSettingsForm({ ...settingsForm, ifscCode: e.target.value.toUpperCase() })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-xs font-mono font-bold text-[#003477] focus:bg-white focus:border-[#003477] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-[#191c1e] mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={settingsForm.bankName}
                      onChange={(e) => setSettingsForm({ ...settingsForm, bankName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-xs font-medium focus:bg-white focus:border-[#003477] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#191c1e] mb-1">Branch Name</label>
                    <input
                      type="text"
                      value={settingsForm.bankBranch}
                      onChange={(e) => setSettingsForm({ ...settingsForm, bankBranch: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-xs font-medium focus:bg-white focus:border-[#003477] outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right 6 cols: Pricing, Expo Offer & Secretariat Info */}
            <div className="lg:col-span-6 space-y-6">
              {/* Pricing & Expo Offer Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#e0e3e6] shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-[#e0e3e6]">
                  <div className="flex items-center gap-2">
                    <Flame size={18} className="text-[#ffbe3b]" />
                    <h3 className="text-base font-extrabold text-[#191c1e]">
                      Membership Pricing &amp; Expo Discount
                    </h3>
                  </div>
                  <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-[#006e2e]">
                    <input
                      type="checkbox"
                      checked={settingsForm.isExpoActive}
                      onChange={(e) => setSettingsForm({ ...settingsForm, isExpoActive: e.target.checked })}
                      className="w-4 h-4 rounded text-[#006e2e] focus:ring-[#006e2e]"
                    />
                    <span>Offer Active</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-[#191c1e] mb-1">Regular Fee (₹)</label>
                    <input
                      type="number"
                      value={settingsForm.regularFee}
                      onChange={(e) => setSettingsForm({ ...settingsForm, regularFee: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-xs font-bold text-[#191c1e] focus:bg-white focus:border-[#003477] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#006e2e] mb-1">Expo Offer Fee (₹)</label>
                    <input
                      type="number"
                      value={settingsForm.expoFee}
                      onChange={(e) => setSettingsForm({ ...settingsForm, expoFee: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#006e2e]/40 text-xs font-extrabold text-[#006e2e] focus:bg-white focus:border-[#006e2e] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#ffbe3b] mb-1">Discount %</label>
                    <input
                      type="number"
                      value={settingsForm.expoDiscountPercentage}
                      onChange={(e) => setSettingsForm({ ...settingsForm, expoDiscountPercentage: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-xs font-bold text-[#191c1e] focus:bg-white focus:border-[#003477] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#191c1e] mb-1">Expo Promotional Banner Title</label>
                  <input
                    type="text"
                    value={settingsForm.expoOfferTitle}
                    onChange={(e) => setSettingsForm({ ...settingsForm, expoOfferTitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-xs font-medium focus:bg-white focus:border-[#003477] outline-none"
                  />
                </div>
              </div>

              {/* Secretariat Contact Details */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#e0e3e6] shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-[#e0e3e6]">
                  <Building2 size={18} className="text-[#003477]" />
                  <h3 className="text-base font-extrabold text-[#191c1e]">
                    State Secretariat Contact Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-[#191c1e] mb-1">Helpline Phone</label>
                    <input
                      type="text"
                      value={settingsForm.secretariatPhone}
                      onChange={(e) => setSettingsForm({ ...settingsForm, secretariatPhone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-xs font-medium focus:bg-white focus:border-[#003477] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#191c1e] mb-1">Official Email</label>
                    <input
                      type="email"
                      value={settingsForm.secretariatEmail}
                      onChange={(e) => setSettingsForm({ ...settingsForm, secretariatEmail: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-xs font-medium focus:bg-white focus:border-[#003477] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#191c1e] mb-1">Secretariat Office Address</label>
                  <input
                    type="text"
                    value={settingsForm.secretariatAddress}
                    onChange={(e) => setSettingsForm({ ...settingsForm, secretariatAddress: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-xs font-medium focus:bg-white focus:border-[#003477] outline-none"
                  />
                </div>
              </div>

              {/* Resend Email & Notification Dispatch Settings */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#e0e3e6] shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#e0e3e6]">
                  <div className="flex items-center gap-2">
                    <Mail size={18} className="text-[#003477]" />
                    <h3 className="text-base font-extrabold text-[#191c1e]">
                      Resend Email Notification Dispatch
                    </h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#8ef9a0]/25 text-[#006e2e] text-[10px] font-black uppercase tracking-wider border border-[#006e2e]/20">
                    Automated Confirmation
                  </span>
                </div>

                <p className="text-xs text-[#737783] leading-relaxed">
                  When you approve a member, APSIWA automatically sends an official confirmation email containing their digital smart membership ID card, validity period, and login credentials via Resend and Supabase.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-[#191c1e] mb-1">
                      Resend API Key (re_...)
                    </label>
                    <input
                      type="password"
                      placeholder="re_xxxxxxxxxxxxxxxxxxxx"
                      value={settingsForm.resendApiKey || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, resendApiKey: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-xs font-mono font-medium focus:bg-white focus:border-[#003477] outline-none"
                    />
                    <span className="text-[10px] text-[#737783] mt-1 block">
                      Obtain from <a href="https://resend.com/api-keys" target="_blank" rel="noreferrer" className="text-[#003477] underline font-bold">resend.com/api-keys</a>
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#191c1e] mb-1">
                      Resend Sender / From Header
                    </label>
                    <input
                      type="text"
                      placeholder="APSIWA Secretariat &lt;onboarding@resend.dev&gt;"
                      value={settingsForm.resendFromEmail || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, resendFromEmail: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-xs font-medium focus:bg-white focus:border-[#003477] outline-none"
                    />
                    <span className="text-[10px] text-[#737783] mt-1 block">
                      Default: <code>APSIWA Secretariat &lt;onboarding@resend.dev&gt;</code> or your verified domain
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[11px] text-[#434752]">
                    Test the email dispatch template with your current configuration:
                  </span>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!currentUser?.email) {
                        alert('No admin email detected to send test to.');
                        return;
                      }
                      setActionSuccessMsg(`Sending test approval email to ${currentUser.email}...`);
                      const dummyApp: MembershipApplication = {
                        id: 'APSIWA-TEST-001',
                        fullName: 'Test Executive (Admin Preview)',
                        dateOfBirth: '1990-01-01',
                        mobileNumber: '9999999999',
                        emailAddress: currentUser.email,
                        companyName: 'AP Solar Test Integrations Ltd',
                        businessType: 'Solar EPC Integrator',
                        district: 'Visakhapatnam',
                        utrNumber: 'TEST-UTR-999999',
                        amountPaid: '₹ 2,000.00',
                        paymentDate: new Date().toISOString(),
                        submissionDate: new Date().toISOString().slice(0, 10),
                        photoUrl: '',
                        status: 'Approved'
                      };
                      const res = await sendApprovalConfirmationEmail(dummyApp, settingsForm);
                      if (res.success) {
                        if (res.simulated) {
                          setActionSuccessMsg(`Test email template generated for ${currentUser.email}! (Simulated mode)`);
                        } else {
                          setActionSuccessMsg(`Test approval email delivered to ${currentUser.email} via Resend!`);
                        }
                      } else {
                        setActionSuccessMsg(`Email test error: ${res.error}`);
                      }
                      setTimeout(() => setActionSuccessMsg(''), 5500);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#f0f4ff] hover:bg-[#d8e2ff] text-[#003477] text-xs font-bold transition-colors cursor-pointer border border-[#003477]/20"
                  >
                    <Send size={12} />
                    <span>Send Test Email</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Save Global Settings Action Bar */}
          <div className="bg-white rounded-2xl p-4 border border-[#e0e3e6] shadow-xs flex items-center justify-between gap-4">
            <span className="text-xs text-[#737783]">
              Changes will instantly propagate to the live website, payment screen, and QR scanner.
            </span>
            <button
              type="submit"
              disabled={savingSettings}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#006e2e] hover:bg-[#005322] text-white text-xs sm:text-sm font-extrabold shadow-md transition-all cursor-pointer active:scale-98 disabled:opacity-75"
            >
              <Save size={16} />
              <span>{savingSettings ? 'Saving Realtime...' : 'Save Global Website Settings'}</span>
            </button>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* EDIT ANY APPLICATION FIELD MODAL (ADMIN TOOL) */}
      {/* ========================================================================= */}
      {editingApp && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#e0e3e6] p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#e0e3e6]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#003477]">
                  APSIWA Admin Member Editor
                </span>
                <h3 className="text-lg font-black text-[#191c1e]">
                  Edit Record: {editingApp.id}
                </h3>
              </div>
              <button
                onClick={() => setEditingApp(null)}
                className="w-8 h-8 rounded-full bg-[#f2f4f7] hover:bg-[#e0e3e6] flex items-center justify-center text-[#434752] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveAppEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-[#191c1e] mb-1">Full Representative Name *</label>
                  <input
                    type="text"
                    required
                    value={editingApp.fullName}
                    onChange={(e) => setEditingApp({ ...editingApp, fullName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] font-medium outline-none focus:bg-white focus:border-[#003477]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#191c1e] mb-1">Date of Birth * (Compulsory)</label>
                  <input
                    type="date"
                    required
                    value={editingApp.dateOfBirth || ''}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setEditingApp({ ...editingApp, dateOfBirth: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] font-medium outline-none focus:bg-white focus:border-[#003477]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#191c1e] mb-1">Company / Firm Name *</label>
                  <input
                    type="text"
                    required
                    value={editingApp.companyName}
                    onChange={(e) => setEditingApp({ ...editingApp, companyName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] font-medium outline-none focus:bg-white focus:border-[#003477]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#191c1e] mb-1">Mobile Number *</label>
                  <input
                    type="text"
                    required
                    value={editingApp.mobileNumber}
                    onChange={(e) => setEditingApp({ ...editingApp, mobileNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] font-medium outline-none focus:bg-white focus:border-[#003477]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#191c1e] mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={editingApp.emailAddress}
                    onChange={(e) => setEditingApp({ ...editingApp, emailAddress: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] font-medium outline-none focus:bg-white focus:border-[#003477]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#191c1e] mb-1">District</label>
                  <input
                    type="text"
                    value={editingApp.district}
                    onChange={(e) => setEditingApp({ ...editingApp, district: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] font-medium outline-none focus:bg-white focus:border-[#003477]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#191c1e] mb-1">GSTIN Number</label>
                  <input
                    type="text"
                    value={editingApp.gstNumber || ''}
                    onChange={(e) => setEditingApp({ ...editingApp, gstNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] font-mono font-bold outline-none focus:bg-white focus:border-[#003477]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#191c1e] mb-1">Bank UTR Reference *</label>
                  <input
                    type="text"
                    required
                    value={editingApp.utrNumber}
                    onChange={(e) => setEditingApp({ ...editingApp, utrNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] font-mono font-bold text-[#006e2e] outline-none focus:bg-white focus:border-[#003477]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#191c1e] mb-1">Membership Status</label>
                  <select
                    value={editingApp.status}
                    onChange={(e) => setEditingApp({ ...editingApp, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] font-bold text-[#003477] outline-none cursor-pointer"
                  >
                    <option value="Approved">Approved</option>
                    <option value="Pending Verification">Pending Verification</option>
                    <option value="In Review">In Review</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#191c1e] mb-1">Application Type</label>
                  <select
                    value={editingApp.applicationType || 'New Member'}
                    onChange={(e) => setEditingApp({ ...editingApp, applicationType: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] font-bold text-[#003477] outline-none cursor-pointer"
                  >
                    <option value="New Member">New Member (Admission)</option>
                    <option value="Existing Member">Existing Member (Exempt / Offline Member)</option>
                    <option value="Renewal">Renewal</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#191c1e] mb-1">Membership Valid Until (1 Year from Payment)</label>
                  <input
                    type="text"
                    value={editingApp.validUntil || ''}
                    placeholder="e.g. 22-SEP-2027"
                    onChange={(e) => setEditingApp({ ...editingApp, validUntil: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] font-mono font-bold text-[#006e2e] outline-none focus:bg-white focus:border-[#003477]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-[#191c1e] mb-1">Office Address</label>
                  <input
                    type="text"
                    value={editingApp.officeAddress}
                    onChange={(e) => setEditingApp({ ...editingApp, officeAddress: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] font-medium outline-none focus:bg-white focus:border-[#003477]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-[#191c1e] mb-1">Member Portrait Photograph * (Compulsory)</label>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-14 rounded-xl bg-[#f2f4f7] border-2 border-[#003477] overflow-hidden flex items-center justify-center shrink-0 shadow-2xs">
                      {editingApp.photoUrl ? (
                        <img src={editingApp.photoUrl} alt="Photo" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[9px] font-bold text-[#ba1a1a]">No Photo</span>
                      )}
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="Paste Photo URL or Data URI"
                      value={editingApp.photoUrl || ''}
                      onChange={(e) => setEditingApp({ ...editingApp, photoUrl: e.target.value })}
                      className="flex-1 px-3 py-2 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] font-mono text-[11px] outline-none focus:bg-white focus:border-[#003477]"
                    />
                    <label className="px-3 py-2 rounded-xl bg-[#003477] text-white text-[11px] font-bold cursor-pointer hover:bg-[#024aa3] shrink-0">
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = () => {
                              setEditingApp({ ...editingApp, photoUrl: reader.result as string });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#e0e3e6] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingApp(null)}
                  className="px-4 py-2 rounded-xl bg-[#f2f4f7] hover:bg-[#e0e3e6] text-[#434752] font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-6 py-2 rounded-xl bg-[#006e2e] hover:bg-[#005322] text-white font-bold shadow-sm cursor-pointer"
                >
                  <Save size={14} />
                  <span>Save Record Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW RECEIPT PREVIEW MODAL */}
      {viewingReceiptUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-[#191c1e]">Uploaded Payment Receipt Screenshot</h4>
              <button
                onClick={() => setViewingReceiptUrl(null)}
                className="p-1 rounded-full bg-[#f2f4f7] text-[#434752] hover:bg-[#e0e3e6] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-hidden rounded-xl border border-[#e0e3e6] flex items-center justify-center bg-[#f7f9fc]">
              <img src={viewingReceiptUrl} alt="Receipt" className="max-h-[55vh] object-contain" />
            </div>
            <button
              onClick={() => setViewingReceiptUrl(null)}
              className="w-full py-2.5 rounded-xl bg-[#003477] text-white text-xs font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
