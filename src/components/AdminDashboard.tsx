import React, { useState } from 'react';
import { MembershipApplication, UserProfile, WebsiteSettings } from '../types';
import {
  ShieldAlert,
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
  Flame,
  Save,
  Eye,
  Lock,
  ExternalLink,
  RefreshCw,
  Award,
  AlertTriangle
} from 'lucide-react';
import {
  ADMIN_EMAILS,
  isAdminUser,
  updateApplicationDetails,
  deleteApplication,
  saveWebsiteSettings,
  saveMembershipApplication
} from '../lib/supabase';

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
  const [activeTab, setActiveTab] = useState<'applications' | 'settings' | 'users'>('applications');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [districtFilter, setDistrictFilter] = useState<string>('All');

  // Modal editing states
  const [editingApp, setEditingApp] = useState<MembershipApplication | null>(null);
  const [viewingReceiptUrl, setViewingReceiptUrl] = useState<string | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);

  // Settings form state
  const [settingsForm, setSettingsForm] = useState<WebsiteSettings>(websiteSettings);

  const isAdmin = isAdminUser(currentUser?.email);

  // Stats calculations
  const totalApps = applications.length;
  const approvedCount = applications.filter((a) => a.status === 'Approved').length;
  const pendingCount = applications.filter((a) => a.status === 'Pending Verification' || a.status === 'In Review').length;
  const totalRevenue = approvedCount * (websiteSettings.isExpoActive ? websiteSettings.expoFee : websiteSettings.regularFee);

  // Filtered applications list
  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      (app.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.companyName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.utrNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.emailAddress || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
    const matchesDistrict = districtFilter === 'All' || app.district === districtFilter;

    return matchesSearch && matchesStatus && matchesDistrict;
  });

  // 1-Click Approve Handler
  const handleQuickApprove = async (app: MembershipApplication) => {
    const updated: MembershipApplication = {
      ...app,
      status: 'Approved'
    };
    await updateApplicationDetails(updated);
    setActionSuccessMsg(`Application ${app.id} (${app.fullName}) approved successfully!`);
    onRefreshApplications();
    setTimeout(() => setActionSuccessMsg(''), 3000);
  };

  // 1-Click Reject / In Review Handler
  const handleQuickReject = async (app: MembershipApplication) => {
    const updated: MembershipApplication = {
      ...app,
      status: 'In Review'
    };
    await updateApplicationDetails(updated);
    setActionSuccessMsg(`Application ${app.id} marked as In Review.`);
    onRefreshApplications();
    setTimeout(() => setActionSuccessMsg(''), 3000);
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

  return (
    <div className="max-w-7xl mx-auto px-margin py-8 space-y-8 animate-in fade-in duration-300">
      {/* ADMIN HEADER BANNER */}
      <div className="relative bg-gradient-to-r from-[#001d4a] via-[#003477] to-[#00285e] rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-[#024aa3]/40 overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-[#ffbe3b]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 -bottom-20 w-64 h-64 bg-[#8ef9a0]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffbe3b] text-[#00285e] text-xs font-black uppercase tracking-wider shadow-xs">
                <ShieldAlert size={14} />
                APSIWA Secretariat Admin Portal
              </span>
              {isAdmin ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#8ef9a0]/25 text-[#8ef9a0] text-[11px] font-bold border border-[#8ef9a0]/40">
                  <CheckCircle2 size={12} />
                  Authorized Admin Session
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#ffdad6]/20 text-[#ffb4ab] text-[11px] font-bold border border-[#ffb4ab]/40">
                  <AlertTriangle size={12} />
                  Demo Mode
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              State Membership Governance &amp; Management
            </h1>

            <p className="text-xs sm:text-sm text-white/80 max-w-2xl leading-relaxed">
              Verify UTR payments, approve official memberships, edit member profile records, and configure global website fees and QR assets.
            </p>
          </div>

          {/* Admin Account Controls */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 space-y-2 w-full md:w-auto shrink-0">
            <span className="text-[10px] text-white/70 uppercase font-bold block tracking-wider">
              Authorized Administrators
            </span>
            <div className="space-y-1">
              {ADMIN_EMAILS.map((email) => {
                const isCurrent = currentUser?.email?.toLowerCase() === email.toLowerCase();
                return (
                  <button
                    key={email}
                    onClick={() => onSwitchToAdminUser(email)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                      isCurrent
                        ? 'bg-[#8ef9a0] text-[#00285e] shadow-xs'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    <span className="truncate">{email}</span>
                    {isCurrent && <span className="text-[10px] font-black uppercase">Active</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* QUICK STATS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Applications */}
        <div className="bg-white rounded-2xl p-5 border border-[#e0e3e6] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[#737783]">
            <span className="text-xs font-bold uppercase tracking-wider">Total Enrolments</span>
            <FileText size={18} className="text-[#003477]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#191c1e]">{totalApps}</div>
          <span className="text-[11px] text-[#737783] block">Lifetime submitted</span>
        </div>

        {/* Pending Verification */}
        <div className="bg-white rounded-2xl p-5 border border-[#e0e3e6] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[#ffbe3b]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#b25e00]">Pending Action</span>
            <Clock size={18} className="text-[#ffbe3b]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#b25e00]">{pendingCount}</div>
          <span className="text-[11px] text-[#737783] block">Awaiting admin review</span>
        </div>

        {/* Approved Members */}
        <div className="bg-white rounded-2xl p-5 border border-[#e0e3e6] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[#006e2e]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#006e2e]">Approved Members</span>
            <CheckCircle2 size={18} className="text-[#006e2e]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#006e2e]">{approvedCount}</div>
          <span className="text-[11px] text-[#737783] block">ID Cards active</span>
        </div>

        {/* Collections */}
        <div className="bg-white rounded-2xl p-5 border border-[#e0e3e6] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[#003477]">
            <span className="text-xs font-bold uppercase tracking-wider">Total Collections</span>
            <CreditCard size={18} className="text-[#003477]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#003477]">
            ₹ {totalRevenue.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-[#006e2e] font-semibold block">Expo Rate ₹2,000</span>
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
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'applications'
              ? 'border-[#003477] text-[#003477] bg-[#f0f4ff]/60 rounded-t-xl'
              : 'border-transparent text-[#434752] hover:text-[#191c1e]'
          }`}
        >
          <Users size={18} />
          <span>Membership Applications &amp; Approvals</span>
          {pendingCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-[#ffbe3b] text-[#00285e] text-[10.5px] font-black animate-pulse">
              {pendingCount} Pending
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'settings'
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
          {/* Search & Filter Toolbar */}
          <div className="bg-white rounded-2xl p-4 border border-[#e0e3e6] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Search */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-3 text-[#737783]" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Name, Firm, ID or UTR..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-xs font-medium focus:bg-white focus:border-[#003477] outline-none"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
              <div className="flex items-center gap-1.5 text-xs text-[#737783]">
                <Filter size={14} />
                <span className="font-semibold">Status:</span>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-xs font-bold text-[#003477] outline-none cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Pending Verification">Pending Verification</option>
                <option value="Approved">Approved</option>
                <option value="In Review">In Review</option>
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
                    <th className="py-3.5 px-4">Member / Representative</th>
                    <th className="py-3.5 px-4">Firm / Company</th>
                    <th className="py-3.5 px-4">District</th>
                    <th className="py-3.5 px-4">Bank UTR &amp; Fee</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e0e3e6]">
                  {filteredApps.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-[#737783]">
                        No membership applications matching your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredApps.map((app) => {
                      const isAppApproved = app.status === 'Approved';
                      return (
                        <tr key={app.id} className="hover:bg-[#fbfcfe] transition-colors">
                          {/* Member */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-[#003477] text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden shadow-2xs">
                                {app.photoUrl ? (
                                  <img src={app.photoUrl} alt={app.fullName} className="w-full h-full object-cover" />
                                ) : (
                                  app.fullName.charAt(0)
                                )}
                              </div>
                              <div className="min-w-0">
                                <span className="font-extrabold text-[#191c1e] text-[13px] block truncate">
                                  {app.fullName}
                                </span>
                                <span className="text-[11px] text-[#737783] block truncate font-mono">
                                  {app.id} • {app.mobileNumber}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Firm */}
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-[#003477] block truncate max-w-[180px]">
                              {app.companyName}
                            </span>
                            <span className="text-[10.5px] text-[#737783] block truncate">
                              {app.businessType}
                            </span>
                          </td>

                          {/* District */}
                          <td className="py-3.5 px-4">
                            <span className="font-medium text-[#191c1e]">{app.district}</span>
                            <span className="text-[10px] text-[#737783] block font-mono">
                              GST: {app.gstNumber || 'N/A'}
                            </span>
                          </td>

                          {/* Bank UTR & Amount */}
                          <td className="py-3.5 px-4">
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
                          </td>

                          {/* Status Badge */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10.5px] ${
                                isAppApproved
                                  ? 'bg-[#8ef9a0]/25 text-[#006e2e] border border-[#006e2e]/30'
                                  : app.status === 'In Review'
                                  ? 'bg-[#d8e2ff] text-[#001a42] border border-[#003477]/20'
                                  : 'bg-[#ffbe3b]/25 text-[#00285e] border border-[#ffbe3b]/40'
                              }`}
                            >
                              {isAppApproved ? <Check size={11} /> : <Clock size={11} />}
                              <span>{app.status}</span>
                            </span>
                          </td>

                          {/* Action Buttons */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                              {!isAppApproved && (
                                <button
                                  type="button"
                                  onClick={() => handleQuickApprove(app)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#006e2e] hover:bg-[#005322] text-white text-[11px] font-bold transition-all cursor-pointer active:scale-95"
                                  title="Approve Membership"
                                >
                                  <Check size={12} />
                                  <span>Approve</span>
                                </button>
                              )}

                              {isAppApproved && (
                                <button
                                  type="button"
                                  onClick={() => handleQuickReject(app)}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#f2f4f7] hover:bg-[#e0e3e6] text-[#434752] text-[11px] font-medium transition-colors cursor-pointer"
                                  title="Change to In Review"
                                >
                                  <Clock size={12} />
                                  <span>Review</span>
                                </button>
                              )}

                              {/* Edit Modal Button */}
                              <button
                                type="button"
                                onClick={() => setEditingApp({ ...app })}
                                className="p-1.5 rounded-lg bg-[#f2f4f7] hover:bg-[#d8e2ff] text-[#003477] transition-colors cursor-pointer"
                                title="Edit Any Field of this Application"
                              >
                                <Edit3 size={14} />
                              </button>

                              {/* Delete Button */}
                              <button
                                type="button"
                                onClick={() => handleDeleteApp(app.id, app.fullName)}
                                className="p-1.5 rounded-lg bg-[#f2f4f7] hover:bg-[#ffdad6] text-[#ba1a1a] transition-colors cursor-pointer"
                                title="Delete Application"
                              >
                                <Trash2 size={14} />
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
      {/* TAB 2: WEBSITE ASSETS, QR CODE, PRICING & CONTACT SETTINGS */}
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
                  <label className="block font-bold text-[#191c1e] mb-1">Full Representative Name</label>
                  <input
                    type="text"
                    required
                    value={editingApp.fullName}
                    onChange={(e) => setEditingApp({ ...editingApp, fullName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] font-medium outline-none focus:bg-white focus:border-[#003477]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#191c1e] mb-1">Company / Firm Name</label>
                  <input
                    type="text"
                    required
                    value={editingApp.companyName}
                    onChange={(e) => setEditingApp({ ...editingApp, companyName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] font-medium outline-none focus:bg-white focus:border-[#003477]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#191c1e] mb-1">Mobile Number</label>
                  <input
                    type="text"
                    required
                    value={editingApp.mobileNumber}
                    onChange={(e) => setEditingApp({ ...editingApp, mobileNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] font-medium outline-none focus:bg-white focus:border-[#003477]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#191c1e] mb-1">Email Address</label>
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
                  <label className="block font-bold text-[#191c1e] mb-1">Bank UTR Reference</label>
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
                  <label className="block font-bold text-[#191c1e] mb-1">Member Portrait Photo URL</label>
                  <input
                    type="text"
                    value={editingApp.photoUrl || ''}
                    onChange={(e) => setEditingApp({ ...editingApp, photoUrl: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] font-mono text-[11px] outline-none focus:bg-white focus:border-[#003477]"
                  />
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
