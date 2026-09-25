import React, { useState, useEffect } from 'react';
import { MembershipApplication, UserProfile, WebsiteSettings, GalleryItem, AssociationEvent } from '../types';
import { GALLERY_ITEMS, DEFAULT_EVENTS } from '../data/mockData';
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
  FileCheck,
  ArrowLeft,
  Image as ImageIcon,
  Flame,
  Power,
  ToggleLeft,
  ToggleRight,
  User,
  Layers
} from 'lucide-react';
import {
  ADMIN_EMAILS,
  isAdminUser,
  updateApplicationDetails,
  deleteApplication,
  saveWebsiteSettings,
  saveMembershipApplication,
  calculateValidityDate,
  isEventExpired,
  cleanupExpiredEvents
} from '../lib/supabase';
import {
  sendApprovalConfirmationEmail,
  generateApprovalEmailHtml,
  generateApprovalEmailPlainText,
  generateGmailWebLink,
  generateMailtoLink
} from '../lib/emailService';
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

export const SOLAR_SCOPES = [
  'Residential Rooftop (PM Surya Ghar)',
  'Commercial & Industrial (C&I)',
  'Ground-Mounted Solar EPC',
  'Agricultural Solar Pumps (PM KUSUM)',
  'Solar O&M & Testing Services'
];

interface AdminDashboardProps {
  currentUser: UserProfile | null;
  applications: MembershipApplication[];
  onRefreshApplications: () => void;
  onDeleteApplication?: (id: string) => Promise<void>;
  websiteSettings: WebsiteSettings;
  onUpdateWebsiteSettings: (newSettings: WebsiteSettings) => void;
  onNavigateHome: () => void;
  onSwitchToAdminUser: (adminEmail: string) => void;
  onLogout?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  applications,
  onRefreshApplications,
  onDeleteApplication,
  websiteSettings,
  onUpdateWebsiteSettings,
  onNavigateHome,
  onSwitchToAdminUser,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<'applications' | 'onspot' | 'settings' | 'events'>('applications');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<'All' | 'New Member' | 'Existing Member'>('All');
  const [districtFilter, setDistrictFilter] = useState<string>('All');

  // Modal states
  const [viewingApp, setViewingApp] = useState<MembershipApplication | null>(null);
  const [editingApp, setEditingApp] = useState<MembershipApplication | null>(null);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [isAddingGalleryPhoto, setIsAddingGalleryPhoto] = useState(false);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [editingEvent, setEditingEvent] = useState<AssociationEvent | null>(null);
  const [eventCategoryFilter, setEventCategoryFilter] = useState<string>('All');
  const [eventSearch, setEventSearch] = useState<string>('');
  const [viewingReceiptUrl, setViewingReceiptUrl] = useState<string | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);
  const [isRefreshingList, setIsRefreshingList] = useState(false);

  // Settings form state (Synchronized with websiteSettings prop)
  const [settingsForm, setSettingsForm] = useState<WebsiteSettings>(websiteSettings);

  useEffect(() => {
    setSettingsForm(websiteSettings);
  }, [websiteSettings]);

  // On-Spot Registration Form State (Full matching actual membership structure)
  const initialSpotForm = {
    fullName: '',
    dateOfBirth: '',
    designation: '',
    mobileNumber: '',
    emailAddress: '',
    companyName: '',
    district: 'Visakhapatnam',
    businessType: 'Private Limited Company',
    experience: '1 - 3 Years',
    gstNumber: '',
    officeAddress: '',
    pincode: '',
    photoUrl: '',
    sendEmailConfirmation: true,
  };

  const [spotForm, setSpotForm] = useState(initialSpotForm);
  const [spotPhotoFileName, setSpotPhotoFileName] = useState('');
  const [spotScopes, setSpotScopes] = useState<string[]>([
    'Residential Rooftop (PM Surya Ghar)',
    'Commercial & Industrial (C&I)'
  ]);
  const [isSubmittingSpot, setIsSubmittingSpot] = useState(false);
  const [spotRegisteredApp, setSpotRegisteredApp] = useState<MembershipApplication | null>(null);

  const toggleSpotScope = (scope: string) => {
    setSpotScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]
    );
  };

  // New Member Form State (for Manual Admin Onboarding Modal)
  const [newMemberForm, setNewMemberForm] = useState({
    fullName: '',
    dateOfBirth: '',
    designation: 'Managing Director',
    mobileNumber: '',
    emailAddress: '',
    companyName: '',
    businessType: 'Private Limited Company',
    district: 'Visakhapatnam',
    experience: '1 - 3 Years',
    gstNumber: '',
    officeAddress: '',
    pincode: '',
    applicationType: 'New Member' as 'New Member' | 'Existing Member',
    utrNumber: 'OFFLINE-ADM-' + Math.floor(100000 + Math.random() * 900000),
    amountPaid: '₹ 2,000.00',
    status: 'Active' as 'Active' | 'Approved' | 'Pending Verification',
    photoUrl: ''
  });

  // New Gallery Item Modal State
  const [newGalleryItem, setNewGalleryItem] = useState<Partial<GalleryItem>>({
    title: '',
    category: 'Events',
    categorySlug: 'events',
    desc: '',
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    location: 'Vijayawada',
    src: ''
  });

  const isAdmin = isAdminUser(currentUser?.email);

  // Stats calculations
  const totalApps = applications.length;
  const newMemberApps = applications.filter((a) => a.applicationType !== 'Existing Member');
  const existingMemberApps = applications.filter((a) => a.applicationType === 'Existing Member');

  const activeCount = applications.filter((a) => a.status === 'Active' || a.status === 'Approved').length;
  const inactiveCount = applications.filter((a) => a.status === 'Inactive').length;
  const pendingCount = applications.filter((a) => a.status === 'Pending Verification' || a.status === 'In Review').length;
  const rejectedCount = applications.filter((a) => a.status === 'Rejected').length;

  const approvedNewCount = newMemberApps.filter((a) => a.status === 'Approved' || a.status === 'Active').length;
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

    let matchesStatus = true;
    if (statusFilter === 'Active') {
      matchesStatus = app.status === 'Active' || app.status === 'Approved';
    } else if (statusFilter === 'Inactive') {
      matchesStatus = app.status === 'Inactive';
    } else if (statusFilter !== 'All') {
      matchesStatus = app.status === statusFilter;
    }

    const matchesDistrict = districtFilter === 'All' || app.district === districtFilter;

    const matchesType =
      typeFilter === 'All' ||
      (typeFilter === 'Existing Member' && app.applicationType === 'Existing Member') ||
      (typeFilter === 'New Member' && app.applicationType !== 'Existing Member');

    return matchesSearch && matchesStatus && matchesDistrict && matchesType;
  });

  // Email Dispatch & Preview Modal State
  const [emailModalApp, setEmailModalApp] = useState<MembershipApplication | null>(null);
  const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);
  const [copiedEmailText, setCopiedEmailText] = useState(false);

  // Direct 1-Click Send Email Confirmation & Official A4 Digital Card via Resend
  const handleSendEmailConfirmation = async (app: MembershipApplication) => {
    if (!app.emailAddress) {
      alert('This member does not have an email address recorded.');
      return;
    }
    setSendingEmailId(app.id);
    setActionSuccessMsg(`Dispatching official A4 membership certificate & ID card email to ${app.emailAddress}...`);
    
    try {
      const result = await sendApprovalConfirmationEmail(app, websiteSettings);

      if (result.success) {
        setActionSuccessMsg(`Official approval email & A4 digital ID card delivered to ${app.emailAddress} via Resend! (ID: ${result.messageId || 'Delivered'})`);
      } else {
        // Open the dispatch modal with 1-click Gmail Web and diagnostic details
        setEmailModalApp(app);
        setActionSuccessMsg(`Email Notice: ${result.error}`);
      }
    } catch (err: any) {
      setEmailModalApp(app);
      setActionSuccessMsg(`Email Notice: ${err?.message || 'Please use Gmail 1-Click dispatch.'}`);
    } finally {
      setSendingEmailId(null);
      setTimeout(() => setActionSuccessMsg(''), 7000);
    }
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
      setSendingEmailId(app.id);
      setActionSuccessMsg(`Approved ${app.id}! Dispatching confirmation email with digital card to ${updated.emailAddress}...`);
      try {
        const emailResult = await sendApprovalConfirmationEmail(updated, websiteSettings);
        if (emailResult.success) {
          setActionSuccessMsg(`Member ${app.fullName} approved and official confirmation email delivered to ${updated.emailAddress} via Resend!`);
        } else {
          setEmailModalApp(updated);
          setActionSuccessMsg(`Member approved! ${emailResult.error}`);
        }
      } catch (err: any) {
        setEmailModalApp(updated);
        setActionSuccessMsg(`Member approved! Open Gmail to deliver certificate to ${updated.emailAddress}.`);
      } finally {
        setSendingEmailId(null);
      }
    } else {
      setActionSuccessMsg(`Application ${app.id} (${app.fullName}) approved! Membership is active & valid until ${validUntilDate}.`);
    }

    setTimeout(() => setActionSuccessMsg(''), 7000);
  };

  // 1-Click Toggle Active / Inactive Status
  const handleToggleActiveStatus = async (app: MembershipApplication) => {
    const isCurrentlyActive = app.status === 'Active' || app.status === 'Approved';
    const newStatus = isCurrentlyActive ? 'Inactive' : 'Active';
    const updated: MembershipApplication = {
      ...app,
      status: newStatus,
      validUntil: newStatus === 'Active' ? (app.validUntil || calculateValidityDate(app.paymentDate)) : app.validUntil
    };
    await updateApplicationDetails(updated);
    if (viewingApp?.id === app.id) {
      setViewingApp(updated);
    }
    if (editingApp?.id === app.id) {
      setEditingApp(updated);
    }
    setActionSuccessMsg(`Membership ${app.id} (${app.fullName}) status updated to ${newStatus}!`);
    onRefreshApplications();
    setTimeout(() => setActionSuccessMsg(''), 4000);
  };

  // Direct Member Photo Replacement Handler (From Dossier or Table)
  const handleReplaceMemberPhoto = async (app: MembershipApplication, file: File) => {
    try {
      const compressed = await compressImage(file, { maxWidth: 600, maxHeight: 600, quality: 0.8 });
      const updated: MembershipApplication = {
        ...app,
        photoUrl: compressed.dataUrl
      };
      await updateApplicationDetails(updated);
      if (viewingApp?.id === app.id) {
        setViewingApp(updated);
      }
      if (editingApp?.id === app.id) {
        setEditingApp(updated);
      }
      setActionSuccessMsg(`ID Card photo replaced for ${app.fullName}!`);
      onRefreshApplications();
      setTimeout(() => setActionSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Photo replacement error:', err);
      alert('Failed to replace photo. Please try another image.');
    }
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
    const message = `*APSIWA Membership Notice*\n\nDear *${app.fullName}* (${app.companyName}),\n\nYour membership with Andhra Pradesh Solar Integrators Welfare Association (APSIWA) is *${app.status.toUpperCase()}*.\n\n*Membership ID:* ${app.id}\n*Valid Until:* ${validDate}\n*Status:* ${app.status}\n\nYou can access and verify your Smart ID Card at our state portal: ${window.location.origin}\n\n_Andhra Pradesh Solar Integrators Welfare Association (APSIWA)_`;
    navigator.clipboard.writeText(message);
    setActionSuccessMsg('WhatsApp notification message copied to clipboard!');
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
    if (!spotForm.fullName.trim() || !spotForm.mobileNumber.trim()) {
      alert('Please enter Representative Full Name and Mobile Number.');
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
      status: 'Active',
    };

    const saveResult = await saveMembershipApplication(newSpotApp);
    setIsSubmittingSpot(false);

    if (saveResult.error) {
      console.warn('Supabase save notice:', saveResult.error);
    }

    setSpotRegisteredApp(newSpotApp);
    onRefreshApplications();
    setActionSuccessMsg(`⚡ On-Spot Member Registered & Saved to Database! ID: ${newSpotApp.id}`);

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
    if (!newMemberForm.fullName || !newMemberForm.mobileNumber) {
      alert('Please enter Name and Mobile Number.');
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
      designation: newMemberForm.designation || 'Managing Director',
      businessType: newMemberForm.businessType,
      district: newMemberForm.district,
      experience: newMemberForm.experience,
      gstNumber: newMemberForm.gstNumber.trim() || undefined,
      officeAddress: newMemberForm.officeAddress.trim() || `${newMemberForm.district}, Andhra Pradesh`,
      pincode: newMemberForm.pincode.trim() || '530001',
      applicationType: newMemberForm.applicationType,
      utrNumber: newMemberForm.utrNumber,
      amountPaid: newMemberForm.applicationType === 'Existing Member' ? '₹ 0.00' : newMemberForm.amountPaid,
      paymentScreenshotUrl: undefined,
      photoUrl: newMemberForm.photoUrl || '',
      status: newMemberForm.status as any,
      validUntil: validUntilDate,
      paymentDate: new Date().toISOString(),
      submissionDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
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
    if (window.confirm(`Are you sure you want to permanently delete application ${id} for ${name}? This action will permanently remove the record.`)) {
      if (viewingApp?.id === id) {
        setViewingApp(null);
      }
      if (onDeleteApplication) {
        await onDeleteApplication(id);
      } else {
        const res = await deleteApplication(id);
        if (res.error) {
          setActionSuccessMsg(`Delete notice: ${res.error}`);
        } else {
          setActionSuccessMsg(`Application ${id} permanently deleted.`);
        }
        onRefreshApplications();
      }
      setActionSuccessMsg(`Application ${id} permanently deleted.`);
      setTimeout(() => setActionSuccessMsg(''), 3500);
    }
  };

  // Save Website Settings (Realtime DB & State)
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    await saveWebsiteSettings(settingsForm);
    onUpdateWebsiteSettings(settingsForm);
    setSavingSettings(false);
    setActionSuccessMsg('Global website settings, fees, QR code & photos updated in realtime!');
    setTimeout(() => setActionSuccessMsg(''), 4000);
  };

  // QR Code Image file upload with canvas compression
  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, { maxWidth: 800, maxHeight: 800, quality: 0.9 });
        const updated = { ...settingsForm, qrCodeUrl: compressed.dataUrl };
        setSettingsForm(updated);
        await saveWebsiteSettings(updated);
        onUpdateWebsiteSettings(updated);
        setActionSuccessMsg('QR Code uploaded and saved to live scanner!');
        setTimeout(() => setActionSuccessMsg(''), 3500);
      } catch {
        const reader = new FileReader();
        reader.onload = async () => {
          const updated = { ...settingsForm, qrCodeUrl: reader.result as string };
          setSettingsForm(updated);
          await saveWebsiteSettings(updated);
          onUpdateWebsiteSettings(updated);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Gallery Management Handlers (Replace, Add, Delete Photos)
  const currentGalleryItems = settingsForm.galleryItems && settingsForm.galleryItems.length > 0
    ? settingsForm.galleryItems
    : GALLERY_ITEMS;

  const handleReplaceGalleryPhoto = async (itemId: string, file: File) => {
    try {
      const compressed = await compressImage(file, { maxWidth: 1200, maxHeight: 900, quality: 0.85 });
      const updatedItems = currentGalleryItems.map((item) =>
        item.id === itemId ? { ...item, src: compressed.dataUrl } : item
      );
      const updatedSettings = { ...settingsForm, galleryItems: updatedItems };
      setSettingsForm(updatedSettings);
      await saveWebsiteSettings(updatedSettings);
      onUpdateWebsiteSettings(updatedSettings);
      setActionSuccessMsg('Website gallery photo replaced and saved!');
      setTimeout(() => setActionSuccessMsg(''), 3500);
    } catch (err) {
      console.error('Gallery photo replace error:', err);
      alert('Failed to process image file.');
    }
  };

  const handleAddGalleryItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGalleryItem.title || !newGalleryItem.src) {
      alert('Please provide a Photo Title and upload or paste an Image URL.');
      return;
    }

    const itemToAdd: GalleryItem = {
      id: `g_${Date.now()}`,
      title: newGalleryItem.title.trim(),
      category: newGalleryItem.category || 'Events',
      categorySlug: (newGalleryItem.categorySlug as any) || 'events',
      desc: newGalleryItem.desc || '',
      date: newGalleryItem.date || new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      location: newGalleryItem.location || 'Andhra Pradesh',
      src: newGalleryItem.src
    };

    const updatedItems = [itemToAdd, ...currentGalleryItems];
    const updatedSettings = { ...settingsForm, galleryItems: updatedItems };
    setSettingsForm(updatedSettings);
    await saveWebsiteSettings(updatedSettings);
    onUpdateWebsiteSettings(updatedSettings);

    setIsAddingGalleryPhoto(false);
    setNewGalleryItem({
      title: '',
      category: 'Events',
      categorySlug: 'events',
      desc: '',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      location: 'Vijayawada',
      src: ''
    });
    setActionSuccessMsg('New photo successfully added to the website gallery!');
    setTimeout(() => setActionSuccessMsg(''), 3500);
  };

  const handleDeleteGalleryItem = async (itemId: string, title: string) => {
    if (window.confirm(`Are you sure you want to remove "${title}" from the website gallery?`)) {
      const updatedItems = currentGalleryItems.filter((i) => i.id !== itemId);
      const updatedSettings = { ...settingsForm, galleryItems: updatedItems };
      setSettingsForm(updatedSettings);
      await saveWebsiteSettings(updatedSettings);
      onUpdateWebsiteSettings(updatedSettings);
      setActionSuccessMsg('Photo removed from website gallery.');
      setTimeout(() => setActionSuccessMsg(''), 3000);
    }
  };

  const handleResetGalleryToDefaults = async () => {
    if (window.confirm('Reset all website gallery photos to initial default state?')) {
      const updatedSettings = { ...settingsForm, galleryItems: GALLERY_ITEMS };
      setSettingsForm(updatedSettings);
      await saveWebsiteSettings(updatedSettings);
      onUpdateWebsiteSettings(updatedSettings);
      setActionSuccessMsg('Website gallery reset to official default photos.');
      setTimeout(() => setActionSuccessMsg(''), 3500);
    }
  };

  // Current events list
  const currentEvents: AssociationEvent[] = settingsForm.events && settingsForm.events.length > 0
    ? settingsForm.events
    : DEFAULT_EVENTS;

  // New Event Initial Form State
  const initialEventForm: Omit<AssociationEvent, 'id'> = {
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:30 AM - 05:00 PM',
    endDate: '',
    expiresAt: '',
    location: 'Vijayawada',
    venue: 'Convention Centre, Andhra Pradesh',
    category: 'Expo',
    bannerUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBUPiMpgphb5uiyHX0JrShc3o7QpcQF063-MZA2MAakcIUQAjOLKgYkFKfTvDgdctoTdSbyXqCc_aqTXI6etkdVimL63rPw7CEZVaCygRR6_sk6DS9mzBbebocZdGeZ_pOnIf_L26bonPcrHZqcrVTZ6OK3u7M8vXut50MZp0rTzp5v-HrhFHRezPbKwY9EUNxFov5O16LW4SArpqRHQjO28uxL6B8V2Di7XP6sc0LkSy1YfXneEAqloA',
    registrationLink: '#membership',
    autoRemoveOnExpiry: true,
    status: 'Upcoming',
    featured: false,
    organizer: 'APSIWA State Council',
    contactPhone: '+91 866 248 9000',
  };

  const [newEventForm, setNewEventForm] = useState(initialEventForm);

  // Handle Create Event
  const handleCreateEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventForm.title.trim() || !newEventForm.date) {
      alert('Please provide at least the Event Title and Date.');
      return;
    }

    const newEvent: AssociationEvent = {
      ...newEventForm,
      id: `evt-${Date.now()}`,
      createdAt: new Date().toISOString(),
      expiresAt: newEventForm.expiresAt || (newEventForm.endDate ? `${newEventForm.endDate}T23:59:59` : `${newEventForm.date}T23:59:59`)
    };

    const updatedEvents = [newEvent, ...currentEvents];
    const updatedSettings = { ...settingsForm, events: updatedEvents };
    setSettingsForm(updatedSettings);
    await saveWebsiteSettings(updatedSettings);
    onUpdateWebsiteSettings(updatedSettings);

    setIsAddingEvent(false);
    setNewEventForm(initialEventForm);
    setActionSuccessMsg(`Event "${newEvent.title}" created and published in realtime!`);
    setTimeout(() => setActionSuccessMsg(''), 3500);
  };

  // Handle Update Event
  const handleUpdateEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;

    const updatedEvents = currentEvents.map((evt) =>
      evt.id === editingEvent.id ? editingEvent : evt
    );

    const updatedSettings = { ...settingsForm, events: updatedEvents };
    setSettingsForm(updatedSettings);
    await saveWebsiteSettings(updatedSettings);
    onUpdateWebsiteSettings(updatedSettings);

    setEditingEvent(null);
    setActionSuccessMsg(`Event "${editingEvent.title}" updated successfully!`);
    setTimeout(() => setActionSuccessMsg(''), 3500);
  };

  // Handle Delete Event
  const handleDeleteEvent = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete the event "${title}"?`)) {
      const updatedEvents = currentEvents.filter((evt) => evt.id !== id);
      const updatedSettings = { ...settingsForm, events: updatedEvents };
      setSettingsForm(updatedSettings);
      await saveWebsiteSettings(updatedSettings);
      onUpdateWebsiteSettings(updatedSettings);

      setActionSuccessMsg(`Event "${title}" removed.`);
      setTimeout(() => setActionSuccessMsg(''), 3000);
    }
  };

  // Handle Purge Expired Events
  const handlePurgeExpiredEvents = async () => {
    const expiredEvents = currentEvents.filter((evt) => isEventExpired(evt));
    if (expiredEvents.length === 0) {
      alert('No expired events found. All listed events are currently active or upcoming.');
      return;
    }

    if (window.confirm(`Found ${expiredEvents.length} expired event(s). Remove them from the portal now?`)) {
      const updatedSettings = cleanupExpiredEvents(settingsForm);
      setSettingsForm(updatedSettings);
      await saveWebsiteSettings(updatedSettings);
      onUpdateWebsiteSettings(updatedSettings);

      setActionSuccessMsg(`Cleaned up ${expiredEvents.length} completed/expired event(s)!`);
      setTimeout(() => setActionSuccessMsg(''), 3500);
    }
  };

  // Handle Reset Events to Defaults
  const handleResetEventsToDefaults = async () => {
    if (window.confirm('Reset events schedule to initial official APSIWA default calendar?')) {
      const updatedSettings = { ...settingsForm, events: DEFAULT_EVENTS };
      setSettingsForm(updatedSettings);
      await saveWebsiteSettings(updatedSettings);
      onUpdateWebsiteSettings(updatedSettings);
      setActionSuccessMsg('Events calendar reset to official default state.');
      setTimeout(() => setActionSuccessMsg(''), 3500);
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
                    placeholder="Enter admin email (e.g. kumarswamynaidu0906@gmail.com)"
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
                className="text-xs text-[#003477] hover:underline font-bold cursor-pointer inline-flex items-center gap-1.5"
              >
                <ArrowLeft size={14} />
                <span>Return to Public Website</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-margin py-8 space-y-8 animate-in fade-in duration-300">
      {/* Top Action Bar with Back to Website & SIGNOUT BUTTON */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-2">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onNavigateHome}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-[#f2f4f7] text-[#003477] font-extrabold text-xs border border-[#e0e3e6] shadow-2xs transition-all cursor-pointer hover:-translate-x-0.5 active:scale-95"
          >
            <ArrowLeft size={16} />
            <span>← Back to Public Website</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-[#737783] bg-white px-3 py-1.5 rounded-xl border border-[#e0e3e6]">
            <span className="w-2 h-2 rounded-full bg-[#006e2e] animate-pulse"></span>
            <span className="font-semibold text-[#191c1e]">{currentUser?.name || 'Administrator'}</span>
            <span className="text-[#737783] hidden sm:inline">({currentUser?.email})</span>
          </div>

          {/* Prominent Admin Portal Sign Out Button */}
          <button
            type="button"
            onClick={() => {
              if (onLogout) {
                onLogout();
              } else {
                onSwitchToAdminUser('');
              }
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#ffdad6] hover:bg-[#ffb4ab] text-[#ba1a1a] font-black text-xs transition-all cursor-pointer shadow-2xs active:scale-95 border border-[#ba1a1a]/20"
            title="Sign out of Admin Session"
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* ADMIN HEADER BANNER */}
      <div className="relative bg-gradient-to-r from-[#001d4a] via-[#003477] to-[#00285e] rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-[#024aa3]/40 overflow-hidden">
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
              State Membership Governance &amp; Assets Control
            </h1>

            <p className="text-xs sm:text-sm text-white/80 max-w-2xl leading-relaxed">
              Manage Active/Inactive memberships, replace photos, update QR code &amp; pricing in realtime, and issue Smart ID Cards.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto shrink-0">
            <button
              onClick={() => setIsAddingMember(true)}
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#006e2e] to-[#008738] text-white text-xs font-black shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95"
            >
              <UserPlus size={16} />
              <span>+ Add Member</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all cursor-pointer"
            >
              <Download size={15} />
              <span>Export CSV</span>
            </button>

            {/* Header Sign Out button */}
            <button
              onClick={() => {
                if (onLogout) {
                  onLogout();
                } else {
                  onSwitchToAdminUser('');
                }
              }}
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-[#ffdad6]/20 hover:bg-[#ffdad6]/30 text-white text-xs font-bold border border-[#ffdad6]/40 transition-all cursor-pointer"
            >
              <LogOut size={15} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* ACTION CONFIRMATION TOAST NOTIFICATION */}
      {actionSuccessMsg && (
        <div className="p-4 rounded-2xl bg-[#e8f5e9] border border-[#006e2e]/40 text-[#006e2e] text-xs font-bold flex items-center justify-between gap-3 shadow-md animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="shrink-0 text-[#006e2e]" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button
            onClick={() => setActionSuccessMsg('')}
            className="p-1 rounded-lg hover:bg-[#006e2e]/10 text-[#006e2e] cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Total Registered Members */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#e0e3e6] shadow-xs">
          <div className="flex items-center justify-between text-[#737783] mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Members</span>
            <Users size={18} className="text-[#003477]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#191c1e]">{totalApps}</div>
          <span className="text-[10px] text-[#737783] font-semibold block mt-1">
            {existingMemberApps.length} Existing • {newMemberApps.length} New
          </span>
        </div>

        {/* Active Members */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#006e2e]/30 shadow-xs bg-gradient-to-b from-[#f0f9f4] to-white">
          <div className="flex items-center justify-between text-[#006e2e] mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Members</span>
            <CheckCircle2 size={18} className="text-[#006e2e]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#006e2e]">{activeCount}</div>
          <span className="text-[10px] text-[#006e2e] font-semibold block mt-1">
            Official Active Credentials
          </span>
        </div>

        {/* Inactive Members */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#ba1a1a]/20 shadow-xs bg-gradient-to-b from-[#fff8f7] to-white">
          <div className="flex items-center justify-between text-[#ba1a1a] mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Inactive Members</span>
            <Power size={18} className="text-[#ba1a1a]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#ba1a1a]">{inactiveCount}</div>
          <span className="text-[10px] text-[#ba1a1a] font-semibold block mt-1">
            Suspended / Expired
          </span>
        </div>

        {/* Pending Verification */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#e0e3e6] shadow-xs">
          <div className="flex items-center justify-between text-[#737783] mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pending Audit</span>
            <Clock size={18} className="text-[#ffbe3b]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#ffbe3b]">{pendingCount}</div>
          <span className="text-[10px] text-[#737783] font-semibold block mt-1">
            Requires Approval
          </span>
        </div>

        {/* Total Revenue */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#e0e3e6] shadow-xs col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-[#737783] mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Revenue Collected</span>
            <CreditCard size={18} className="text-[#006e2e]" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#006e2e]">
            ₹ {totalRevenue.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-[#737783] font-semibold block mt-1">
            Verified Subscriptions
          </span>
        </div>
      </div>

      {/* DASHBOARD TAB CONTROLS */}
      <div className="flex items-center gap-2 border-b border-[#e0e3e6] overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('applications')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${activeTab === 'applications'
              ? 'border-[#003477] text-[#003477] bg-[#f0f4ff]/60 rounded-t-xl shadow-xs'
              : 'border-transparent text-[#434752] hover:text-[#191c1e]'
            }`}
        >
          <Users size={18} />
          <span>Membership Registry &amp; Active / Inactive Controls</span>
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
              ? 'border-[#003477] text-[#003477] bg-[#f0f4ff]/60 rounded-t-xl shadow-xs'
              : 'border-transparent text-[#434752] hover:text-[#191c1e]'
            }`}
        >
          <Settings size={18} />
          <span>Website Assets, QR Code, Pricing &amp; Photos</span>
        </button>

        <button
          onClick={() => setActiveTab('events')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${activeTab === 'events'
              ? 'border-[#003477] text-[#003477] bg-[#f0f4ff]/60 rounded-t-xl shadow-xs'
              : 'border-transparent text-[#434752] hover:text-[#003477]'
            }`}
        >
          <Calendar size={18} className="text-[#003477]" />
          <span>Events &amp; Summits Desk</span>
          <span className="px-2 py-0.5 rounded-full bg-[#006e2e] text-white text-[10px] font-black">
            {currentEvents.length} Events
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: MEMBERSHIP APPLICATIONS & ACTIVE / INACTIVE TABLE */}
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
                <option value="Active">Active Members ({activeCount})</option>
                <option value="Inactive">Inactive Members ({inactiveCount})</option>
                <option value="Pending Verification">Pending Verification ({pendingCount})</option>
                <option value="Rejected">Rejected ({rejectedCount})</option>
              </select>

              <button
                type="button"
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsRefreshingList(true);
                  try {
                    await onRefreshApplications();
                  } catch (err) {
                    console.error('Failed to refresh members:', err);
                  } finally {
                    setTimeout(() => setIsRefreshingList(false), 500);
                  }
                }}
                disabled={isRefreshingList}
                className={`p-2 rounded-xl bg-[#f2f4f7] hover:bg-[#e0e3e6] text-[#003477] transition-all cursor-pointer flex items-center justify-center ${
                  isRefreshingList ? 'opacity-70 pointer-events-none' : 'active:scale-95'
                }`}
                title="Refresh Member List"
              >
                <RefreshCw size={15} className={isRefreshingList ? 'animate-spin text-[#006e2e]' : ''} />
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
                    <th className="py-3.5 px-4">Active Status &amp; Validity</th>
                    <th className="py-3.5 px-4 text-right">Admin Actions</th>
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
                      const isAppActive = app.status === 'Active' || app.status === 'Approved';
                      const isAppInactive = app.status === 'Inactive';
                      const isExistingMember = app.applicationType === 'Existing Member';
                      const validUntilDate = app.validUntil || calculateValidityDate(app.paymentDate);

                      return (
                        <tr key={app.id} className="hover:bg-[#fbfcfe] transition-colors">
                          {/* Member Details */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="relative group/avatar">
                                <div
                                  onClick={() => setViewingApp(app)}
                                  className="w-11 h-12 rounded-xl bg-[#003477] text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden shadow-2xs border border-[#003477]/20 cursor-pointer hover:opacity-90"
                                  title="Click to view full dossier"
                                >
                                  {app.photoUrl ? (
                                    <img src={app.photoUrl} alt={app.fullName} className="w-full h-full object-cover" />
                                  ) : (
                                    app.fullName.charAt(0)
                                  )}
                                </div>
                                <label
                                  className="absolute -bottom-1 -right-1 p-1 rounded-full bg-[#003477] text-white shadow-xs cursor-pointer hover:scale-110 transition-transform"
                                  title="Quick Replace Photo"
                                >
                                  <Upload size={10} />
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) handleReplaceMemberPhoto(app, file);
                                    }}
                                    className="hidden"
                                  />
                                </label>
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

                          {/* Active / Inactive Status & Validity with 1-Click Toggle */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-black text-[10.5px] ${isAppActive
                                      ? 'bg-[#8ef9a0]/25 text-[#006e2e] border border-[#006e2e]/30'
                                      : isAppInactive
                                        ? 'bg-[#ffdad6] text-[#ba1a1a] border border-[#ba1a1a]/30'
                                        : app.status === 'In Review'
                                          ? 'bg-[#d8e2ff] text-[#001a42] border border-[#003477]/20'
                                          : app.status === 'Rejected'
                                            ? 'bg-[#ffdad6] text-[#ba1a1a] border border-[#ba1a1a]/30'
                                            : 'bg-[#ffbe3b]/25 text-[#00285e] border border-[#ffbe3b]/40'
                                    }`}
                                >
                                  {isAppActive ? <Check size={11} /> : isAppInactive ? <Power size={11} /> : <Clock size={11} />}
                                  <span>{app.status === 'Approved' ? 'Active' : app.status}</span>
                                </span>

                                {/* 1-Click Active / Inactive Status Switch Button */}
                                <button
                                  type="button"
                                  onClick={() => handleToggleActiveStatus(app)}
                                  className={`px-2 py-0.5 rounded-md text-[9.5px] font-extrabold border transition-all cursor-pointer ${
                                    isAppActive
                                      ? 'bg-[#fff0ed] text-[#ba1a1a] border-[#ffdad6] hover:bg-[#ffdad6]'
                                      : 'bg-[#e8f5e9] text-[#006e2e] border-[#8ef9a0]/40 hover:bg-[#8ef9a0]/30'
                                  }`}
                                  title={isAppActive ? 'Click to deactivate membership' : 'Click to activate membership'}
                                >
                                  {isAppActive ? 'Set Inactive' : 'Set Active'}
                                </button>
                              </div>

                              <span className="text-[10px] text-[#737783] block font-mono">
                                Valid: {validUntilDate}
                              </span>
                            </div>
                          </td>

                          {/* Admin Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                              <button
                                type="button"
                                onClick={() => setViewingApp(app)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#003477] hover:bg-[#024aa3] text-white text-[11px] font-extrabold shadow-xs transition-all cursor-pointer active:scale-95"
                                title="Open Complete Application Dossier & Photo Controls"
                              >
                                <Eye size={13} />
                                <span>Details &amp; Dossier</span>
                              </button>

                              {!isAppActive && app.status !== 'Inactive' && (
                                <button
                                  type="button"
                                  onClick={() => handleQuickApprove(app)}
                                  disabled={sendingEmailId === app.id}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#006e2e] hover:bg-[#005322] text-white text-[11px] font-bold transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-75"
                                  title="1-Click Approve Application & Activate Live Card"
                                >
                                  {sendingEmailId === app.id ? (
                                    <RefreshCw size={12} className="animate-spin" />
                                  ) : (
                                    <Check size={12} />
                                  )}
                                  <span>{sendingEmailId === app.id ? 'Approving...' : 'Approve'}</span>
                                </button>
                              )}

                              {app.emailAddress && (
                                <button
                                  type="button"
                                  onClick={() => setEmailModalApp(app)}
                                  className="p-1.5 rounded-xl bg-[#f0f4ff] hover:bg-[#d8e2ff] text-[#003477] border border-[#003477]/20 transition-colors cursor-pointer"
                                  title="Open Email Dispatcher & Live Certificate Preview"
                                >
                                  <Send size={13} />
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => setEditingApp({ ...app })}
                                className="p-1.5 rounded-xl bg-[#f2f4f7] hover:bg-[#d8e2ff] text-[#003477] border border-[#e0e3e6] transition-colors cursor-pointer"
                                title="Edit Full Member Record"
                              >
                                <Edit3 size={13} />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteApp(app.id, app.fullName)}
                                className="p-1.5 rounded-xl bg-[#ffdad6]/60 hover:bg-[#ffdad6] text-[#ba1a1a] transition-colors cursor-pointer"
                                title="Delete Member Record"
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
      {/* TAB 2: ON-SPOT REGISTRATION DESK (CLEAN, RICH, JUST LIKE ACTUAL MEMBERSHIP) */}
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
                    Zero Fee / Direct Active Registration
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  On-Spot Member Registration &amp; Instant Active ID Desk
                </h2>
                <p className="text-xs sm:text-sm text-white/80 max-w-2xl leading-relaxed">
                  Fast on-spot registration for exhibitions, conferences &amp; secretariat walk-ins. Form fields strictly adhere to the official state membership format, with instant Active status and Smart ID Card issuance.
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

          {/* SUCCESS STATE VIEW */}
          {spotRegisteredApp ? (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#006e2e] shadow-xl space-y-6 animate-in zoom-in-95 duration-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#e0e3e6]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#006e2e] text-white flex items-center justify-center font-bold">
                    <CheckCircle2 size={28} />
                  </div>
                  <div>
                    <span className="text-xs font-black text-[#006e2e] uppercase tracking-wider">
                      Registration Complete &amp; Active
                    </span>
                    <h3 className="text-xl font-black text-[#191c1e]">{spotRegisteredApp.fullName}</h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 rounded-xl bg-[#003477] text-white font-mono font-bold text-xs">
                    ID: {spotRegisteredApp.id}
                  </span>
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
                    <span>Register Next Member</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* ON-SPOT REGISTRATION FORM - RICH MULTI-SECTION MATCHING ACTUAL MEMBERSHIP */
            <div className="bg-white rounded-3xl border border-[#e0e3e6] shadow-xl overflow-hidden">
              {/* Form Header Banner */}
              <div className="bg-[#003477] text-white px-6 sm:px-8 py-5 flex items-center justify-between border-b border-[#00285e]">
                <div className="flex items-center gap-3">
                  <img src="/logo.png" alt="APSIWA" className="h-9 w-auto object-contain bg-white rounded p-0.5" />
                  <div>
                    <h3 className="text-base font-extrabold leading-tight">Secretariat Member On-Spot Registration</h3>
                    <span className="text-[11px] text-[#8ef9a0] font-semibold">
                      Andhra Pradesh Solar Integrators Welfare Association
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#8ef9a0] uppercase font-bold block">Enrolment Mode</span>
                  <span className="text-xs font-black text-[#ffbe3b] bg-white/10 px-2.5 py-1 rounded-lg border border-white/20">
                    ⚡ Instant Active (₹0 Fee)
                  </span>
                </div>
              </div>

              <form onSubmit={handleSpotRegistration} className="p-6 sm:p-8 space-y-8">
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
                          value={spotForm.fullName}
                          onChange={(e) => setSpotForm({ ...spotForm, fullName: e.target.value })}
                          placeholder="Enter Full Name"
                          className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-xs font-medium focus:bg-white focus:border-[#003477] outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#191c1e] mb-1">
                        Date of Birth <span className="text-[#737783] font-normal text-xs">(Optional)</span>
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3.5 top-3 text-[#737783]" size={15} />
                        <input
                          type="date"
                          value={spotForm.dateOfBirth}
                          max={new Date().toISOString().split('T')[0]}
                          onChange={(e) => setSpotForm({ ...spotForm, dateOfBirth: e.target.value })}
                          className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-xs font-medium focus:bg-white focus:border-[#003477] outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#191c1e] mb-1">Designation</label>
                      <div className="relative">
                        <Building2 className="absolute left-3.5 top-3 text-[#737783]" size={15} />
                        <input
                          type="text"
                          value={spotForm.designation}
                          onChange={(e) => setSpotForm({ ...spotForm, designation: e.target.value })}
                          placeholder="Managing Director / Partner / Lead EPC"
                          className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-xs font-medium focus:bg-white focus:border-[#003477] outline-none"
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
                          value={spotForm.emailAddress}
                          onChange={(e) => setSpotForm({ ...spotForm, emailAddress: e.target.value })}
                          placeholder="member@company.com"
                          className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-xs font-medium focus:bg-white focus:border-[#003477] outline-none"
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
                          maxLength={10}
                          value={spotForm.mobileNumber}
                          onChange={(e) => setSpotForm({ ...spotForm, mobileNumber: e.target.value })}
                          placeholder="10-digit mobile number"
                          className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-xs font-medium focus:bg-white focus:border-[#003477] outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION 2: REPRESENTATIVE PHOTOGRAPH (COMPULSORY FOR SMART ID CARD) */}
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
                    spotForm.photoUrl ? 'border-[#006e2e]/40 bg-[#f4faf6]' : 'border-[#ffb4ab]/70'
                  }`}>
                    <div className={`w-20 h-24 rounded-xl bg-white border-2 overflow-hidden shadow-sm flex items-center justify-center shrink-0 ${
                      spotForm.photoUrl ? 'border-[#006e2e]' : 'border-[#ba1a1a] border-dashed'
                    }`}>
                      {spotForm.photoUrl ? (
                        <img src={spotForm.photoUrl} alt="Representative" className="w-full h-full object-cover" />
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
                          {spotPhotoFileName || (spotForm.photoUrl ? 'Photograph Ready' : 'Upload Passport Size Photograph')}
                        </h4>
                        {spotForm.photoUrl && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#006e2e]">
                            <CheckCircle2 size={12} />
                            Uploaded
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#737783]">
                        This official photo will appear on the government-recognized APSIWA Smart Identity Card &amp; State Registry.
                      </p>
                    </div>

                    <label className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer shadow-2xs transition-colors shrink-0 ${
                      spotForm.photoUrl
                        ? 'bg-white border border-[#e0e3e6] text-[#003477] hover:bg-[#f2f4f7]'
                        : 'bg-[#003477] hover:bg-[#024aa3] text-white'
                    }`}>
                      <Upload size={14} />
                      <span>{spotForm.photoUrl ? 'Change Photo' : 'Upload Photo *'}</span>
                      <input type="file" accept="image/*" onChange={handleSpotPhotoUpload} className="hidden" />
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
                        Company / Solar Enterprise Name <span className="text-[#ba1a1a]">*</span>
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-3.5 top-3 text-[#737783]" size={15} />
                        <input
                          type="text"
                          required
                          value={spotForm.companyName}
                          onChange={(e) => setSpotForm({ ...spotForm, companyName: e.target.value })}
                          placeholder="e.g. Swamy Solar Systems Pvt Ltd"
                          className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-xs font-medium focus:bg-white focus:border-[#003477] outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#191c1e] mb-1">
                        District (Andhra Pradesh) <span className="text-[#ba1a1a]">*</span>
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3.5 top-3 text-[#737783]" size={15} />
                        <select
                          value={spotForm.district}
                          onChange={(e) => setSpotForm({ ...spotForm, district: e.target.value })}
                          className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-xs font-bold text-[#003477] outline-none cursor-pointer"
                        >
                          {AP_DISTRICTS.map((dist) => (
                            <option key={dist} value={dist}>
                              {dist}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#191c1e] mb-1">Business Entity Type</label>
                      <select
                        value={spotForm.businessType}
                        onChange={(e) => setSpotForm({ ...spotForm, businessType: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-xs font-medium outline-none cursor-pointer"
                      >
                        {BUSINESS_TYPES.map((bt) => (
                          <option key={bt} value={bt}>
                            {bt}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#191c1e] mb-1">Solar Industry Experience</label>
                      <div className="relative">
                        <Award className="absolute left-3.5 top-3 text-[#737783]" size={15} />
                        <select
                          value={spotForm.experience}
                          onChange={(e) => setSpotForm({ ...spotForm, experience: e.target.value })}
                          className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-xs font-medium outline-none cursor-pointer"
                        >
                          {EXPERIENCE_LEVELS.map((exp) => (
                            <option key={exp} value={exp}>
                              {exp}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#191c1e] mb-1">
                        GSTIN Number <span className="text-[#737783] text-[10px] font-normal">(Optional)</span>
                      </label>
                      <div className="relative">
                        <FileText className="absolute left-3.5 top-3 text-[#737783]" size={15} />
                        <input
                          type="text"
                          value={spotForm.gstNumber}
                          onChange={(e) => setSpotForm({ ...spotForm, gstNumber: e.target.value.toUpperCase() })}
                          placeholder="37AAAAA0000A1Z5"
                          className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-xs font-mono font-bold text-[#003477] outline-none"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-[#191c1e] mb-1">
                        Registered Office Street Address <span className="text-[#ba1a1a]">*</span>
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3.5 top-3 text-[#737783]" size={15} />
                        <input
                          type="text"
                          required
                          value={spotForm.officeAddress}
                          onChange={(e) => setSpotForm({ ...spotForm, officeAddress: e.target.value })}
                          placeholder="Door No, Street Name, Commercial Complex, Landmark"
                          className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-xs font-medium focus:bg-white focus:border-[#003477] outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#191c1e] mb-1">
                        Pincode <span className="text-[#ba1a1a]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={spotForm.pincode}
                        onChange={(e) => setSpotForm({ ...spotForm, pincode: e.target.value })}
                        placeholder="530001"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] text-xs font-mono font-semibold outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 4: SOLAR OPERATIONAL SCOPE & EXPERTISE */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-[#e0e3e6]">
                    <div className="w-7 h-7 rounded-lg bg-[#003477] text-white flex items-center justify-center font-bold text-xs">
                      4
                    </div>
                    <h3 className="text-base font-extrabold text-[#003477]">
                      Solar Operational Scope &amp; Expertise
                    </h3>
                  </div>

                  <p className="text-xs text-[#737783]">
                    Select the operational segments your enterprise actively executes in Andhra Pradesh:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {SOLAR_SCOPES.map((scope) => {
                      const isSelected = spotScopes.includes(scope);
                      return (
                        <div
                          key={scope}
                          onClick={() => toggleSpotScope(scope)}
                          className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-[#e8f5e9] border-[#006e2e] text-[#004d1c] font-bold shadow-2xs'
                              : 'bg-[#f7f9fc] border-[#e0e3e6] text-[#434752] hover:bg-white'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                            isSelected ? 'bg-[#006e2e] border-[#006e2e] text-white' : 'border-[#737783]'
                          }`}>
                            {isSelected && <Check size={12} />}
                          </div>
                          <span className="text-xs leading-snug">{scope}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* SECTION 5: ZERO PAYMENT ENROLMENT POLICY */}
                <div className="p-4 rounded-2xl bg-[#e8f5e9]/70 border border-[#006e2e]/30 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={18} className="text-[#006e2e]" />
                      <span className="font-extrabold text-[#004d1c] text-sm">
                        Zero Fee Secretariat On-Spot Admission Policy
                      </span>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-[#006e2e] text-white text-[11px] font-black uppercase">
                      Fee: ₹ 0.00 (Active)
                    </span>
                  </div>

                  <p className="text-[#004d1c]/80 text-xs leading-relaxed">
                    This registration will be saved directly into the database with <strong>Active</strong> status and 1-year institutional validity ({calculateValidityDate(new Date().toISOString())}).
                  </p>

                  <label className="inline-flex items-center gap-2 cursor-pointer font-bold text-[#004d1c] text-xs pt-1 border-t border-[#006e2e]/20">
                    <input
                      type="checkbox"
                      checked={spotForm.sendEmailConfirmation}
                      onChange={(e) => setSpotForm({ ...spotForm, sendEmailConfirmation: e.target.checked })}
                      className="w-4 h-4 rounded text-[#006e2e] focus:ring-[#006e2e]"
                    />
                    <span>Dispatch official welcome confirmation email &amp; Smart ID Card link to member</span>
                  </label>
                </div>

                {/* Submit Action Buttons */}
                <div className="pt-4 border-t border-[#e0e3e6] flex flex-col sm:flex-row items-center justify-between gap-4">
                  <span className="text-xs text-[#737783]">
                    Member can instantly access their card at <strong>www.apsiwa.in</strong> after saving.
                  </span>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={handleResetSpotForm}
                      className="flex-1 sm:flex-initial px-5 py-3 rounded-xl bg-[#f2f4f7] hover:bg-[#e0e3e6] text-[#434752] text-xs font-bold transition-colors cursor-pointer"
                    >
                      Clear Form
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmittingSpot}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-[#006e2e] via-[#008738] to-[#006e2e] text-white text-xs sm:text-sm font-black shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-98 disabled:opacity-75"
                    >
                      {isSubmittingSpot ? (
                        <>
                          <RefreshCw size={16} className="animate-spin" />
                          <span>Saving &amp; Activating...</span>
                        </>
                      ) : (
                        <>
                          <Zap size={16} className="text-[#ffbe3b]" />
                          <span>Complete Registration &amp; Activate</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: WEBSITE ASSETS, QR CODE, PRICING & PHOTOS MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="space-y-8">
          {/* Top Bar for Settings */}
          <div className="bg-white rounded-2xl p-4 border border-[#e0e3e6] shadow-xs flex items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-[#191c1e] text-sm sm:text-base">Website Assets &amp; Global Pricing Configuration</h3>
              <p className="text-xs text-[#737783]">Realtime controls for UPI QR Code, Membership Pricing, Expo Offers, and Website Photos.</p>
            </div>
            <button
              type="submit"
              disabled={savingSettings}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#006e2e] hover:bg-[#005322] text-white text-xs sm:text-sm font-extrabold shadow-md transition-all cursor-pointer active:scale-98 disabled:opacity-75 shrink-0"
            >
              <Save size={16} />
              <span>{savingSettings ? 'Saving Realtime...' : 'Save All Settings'}</span>
            </button>
          </div>

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

          {/* ========================================================================= */}
          {/* SECTION: FULL WEBSITE PHOTOS & GALLERY ASSETS MANAGER */}
          {/* ========================================================================= */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e0e3e6] shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e0e3e6]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#003477] text-white flex items-center justify-center font-bold">
                  <ImageIcon size={20} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-[#191c1e]">
                    Website Photos &amp; Gallery Assets Manager
                  </h3>
                  <p className="text-xs text-[#737783]">
                    Replace existing photos, upload new event pictures, or update gallery descriptions across the entire website.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleResetGalleryToDefaults}
                  className="px-3 py-2 rounded-xl bg-[#f2f4f7] hover:bg-[#e0e3e6] text-[#434752] text-xs font-bold transition-colors cursor-pointer"
                >
                  Reset Defaults
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingGalleryPhoto(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#003477] hover:bg-[#024aa3] text-white text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-95"
                >
                  <Plus size={14} />
                  <span>+ Add New Photo</span>
                </button>
              </div>
            </div>

            {/* Gallery Photos Grid with Replace Photo Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {currentGalleryItems.map((item) => (
                <div key={item.id} className="rounded-2xl bg-[#f7f9fc] border border-[#e0e3e6] p-3.5 space-y-3 flex flex-col justify-between hover:shadow-xs transition-shadow">
                  <div className="space-y-2">
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-black/10 group">
                      <img src={item.src} alt={item.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2 gap-2">
                        <label className="px-3 py-1.5 rounded-lg bg-white text-[#003477] text-[11px] font-black cursor-pointer shadow-md hover:bg-[#f0f4ff] transition-colors flex items-center gap-1">
                          <Upload size={12} />
                          <span>Replace Photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleReplaceGalleryPhoto(item.id, file);
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-[#003477]/10 text-[#003477] text-[10px] font-black uppercase">
                        {item.category}
                      </span>
                      <span className="text-[10px] text-[#737783] font-semibold">{item.date}</span>
                    </div>

                    <h4 className="font-extrabold text-[#191c1e] text-xs line-clamp-1">{item.title}</h4>
                    <p className="text-[11px] text-[#737783] line-clamp-2 leading-relaxed">{item.desc}</p>
                  </div>

                  <div className="pt-2 border-t border-[#e0e3e6] flex items-center justify-between gap-2">
                    <label className="text-[11px] text-[#003477] font-bold hover:underline cursor-pointer inline-flex items-center gap-1">
                      <Upload size={12} />
                      <span>Replace Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleReplaceGalleryPhoto(item.id, file);
                        }}
                        className="hidden"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => handleDeleteGalleryItem(item.id, item.title)}
                      className="p-1 rounded-lg text-[#ba1a1a] hover:bg-[#ffdad6] transition-colors cursor-pointer"
                      title="Delete this photo"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: EVENTS & SUMMITS MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'events' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top Bar for Events */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#e0e3e6] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Calendar size={20} className="text-[#003477]" />
                <h3 className="font-black text-[#191c1e] text-lg sm:text-xl">
                  Events &amp; Summits Management Desk
                </h3>
              </div>
              <p className="text-xs text-[#737783] leading-relaxed">
                Add upcoming state conferences, manage event details, replace banners, and automatically remove expired events after time completes.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={handlePurgeExpiredEvents}
                className="px-4 py-2.5 rounded-xl bg-[#f2f4f7] hover:bg-[#ffdad6] text-[#ba1a1a] text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border border-[#e0e3e6]"
                title="Remove events whose end dates/times have already passed"
              >
                <Trash2 size={14} />
                <span>Auto-Clean Expired</span>
              </button>

              <button
                type="button"
                onClick={handleResetEventsToDefaults}
                className="px-3.5 py-2.5 rounded-xl bg-[#f2f4f7] hover:bg-[#e0e3e6] text-[#434752] text-xs font-bold transition-all cursor-pointer"
                title="Reset to official association event calendar"
              >
                Reset Defaults
              </button>

              <button
                type="button"
                onClick={() => setIsAddingEvent(true)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#003477] to-[#024aa3] text-white text-xs font-extrabold shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2 active:scale-98"
              >
                <Plus size={16} />
                <span>+ Add New Event</span>
              </button>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3.5 rounded-2xl border border-[#e0e3e6] shadow-2xs">
            <div className="relative flex-1 w-full">
              <Search size={16} className="absolute left-3.5 top-3 text-[#737783]" />
              <input
                type="text"
                placeholder="Search event title, venue, city, or topic..."
                value={eventSearch}
                onChange={(e) => setEventSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#f2f4f7] rounded-xl text-xs font-medium border border-[#e0e3e6] focus:bg-white focus:border-[#003477] outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter size={15} className="text-[#737783] shrink-0" />
              <select
                value={eventCategoryFilter}
                onChange={(e) => setEventCategoryFilter(e.target.value)}
                className="w-full sm:w-auto px-3.5 py-2 bg-[#f2f4f7] rounded-xl text-xs font-bold text-[#003477] border border-[#e0e3e6] outline-none cursor-pointer"
              >
                <option value="All">All Categories ({currentEvents.length})</option>
                <option value="Expo">Expos</option>
                <option value="Workshop">Workshops</option>
                <option value="Conference">Conferences</option>
                <option value="Meeting">Meetings</option>
                <option value="Solar Summit">Solar Summits</option>
                <option value="Training">Trainings</option>
              </select>
            </div>
          </div>

          {/* Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentEvents
              .filter((evt) => {
                const matchesCategory = eventCategoryFilter === 'All' || evt.category === eventCategoryFilter;
                const matchesSearch =
                  !eventSearch ||
                  evt.title.toLowerCase().includes(eventSearch.toLowerCase()) ||
                  evt.location.toLowerCase().includes(eventSearch.toLowerCase()) ||
                  (evt.venue && evt.venue.toLowerCase().includes(eventSearch.toLowerCase())) ||
                  evt.description.toLowerCase().includes(eventSearch.toLowerCase());
                return matchesCategory && matchesSearch;
              })
              .map((evt) => {
                const expired = isEventExpired(evt);
                return (
                  <div
                    key={evt.id}
                    className={`bg-white rounded-3xl overflow-hidden border shadow-sm hover:shadow-md transition-all flex flex-col ${
                      expired ? 'border-[#ffdad6] opacity-90' : 'border-[#e0e3e6]'
                    }`}
                  >
                    {/* Event Banner */}
                    <div className="relative h-44 bg-slate-900 overflow-hidden group">
                      <img
                        src={evt.bannerUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBUPiMpgphb5uiyHX0JrShc3o7QpcQF063-MZA2MAakcIUQAjOLKgYkFKfTvDgdctoTdSbyXqCc_aqTXI6etkdVimL63rPw7CEZVaCygRR6_sk6DS9mzBbebocZdGeZ_pOnIf_L26bonPcrHZqcrVTZ6OK3u7M8vXut50MZp0rTzp5v-HrhFHRezPbKwY9EUNxFov5O16LW4SArpqRHQjO28uxL6B8V2Di7XP6sc0LkSy1YfXneEAqloA'}
                        alt={evt.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                      {/* Category & Expiry Badges */}
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                        <span className="px-2.5 py-1 rounded-full bg-[#003477]/90 backdrop-blur-xs text-white text-[10.5px] font-black uppercase tracking-wider shadow-xs">
                          {evt.category}
                        </span>
                        {evt.featured && (
                          <span className="px-2.5 py-1 rounded-full bg-[#ffbe3b] text-[#00285e] text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs">
                            <Sparkles size={11} /> Featured
                          </span>
                        )}
                      </div>

                      {/* Expiry Status Badge */}
                      <div className="absolute top-3 right-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-xs ${
                            expired
                              ? 'bg-[#ba1a1a] text-white'
                              : 'bg-[#006e2e] text-white'
                          }`}
                        >
                          {expired ? 'Expired / Ended' : 'Active & Upcoming'}
                        </span>
                      </div>

                      {/* Quick Banner Replace Button */}
                      <div className="absolute bottom-3 right-3 opacity-90 group-hover:opacity-100 transition-opacity">
                        <label className="px-2.5 py-1.5 rounded-xl bg-white/90 hover:bg-white text-[#003477] text-[10.5px] font-bold cursor-pointer inline-flex items-center gap-1 shadow-md transition-all">
                          <Upload size={11} />
                          <span>Replace Banner</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const compressed = await compressImage(file, { maxWidth: 1200, maxHeight: 800, quality: 0.85 });
                                const updatedEvents = currentEvents.map((item) =>
                                  item.id === evt.id ? { ...item, bannerUrl: compressed.dataUrl } : item
                                );
                                const updatedSettings = { ...settingsForm, events: updatedEvents };
                                setSettingsForm(updatedSettings);
                                await saveWebsiteSettings(updatedSettings);
                                onUpdateWebsiteSettings(updatedSettings);
                                setActionSuccessMsg(`Banner updated for "${evt.title}"!`);
                                setTimeout(() => setActionSuccessMsg(''), 3000);
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Event Content Body */}
                    <div className="p-5 flex-1 flex flex-col space-y-3.5">
                      {/* Date & Time Pill */}
                      <div className="flex items-center gap-2 text-xs font-bold text-[#003477] bg-[#f0f4ff] px-3 py-1.5 rounded-xl w-fit">
                        <Calendar size={14} className="text-[#003477]" />
                        <span>{evt.date} {evt.endDate ? `to ${evt.endDate}` : ''}</span>
                        {evt.time && <span className="text-[#737783]">• {evt.time}</span>}
                      </div>

                      <h4 className="font-black text-[#191c1e] text-sm sm:text-base leading-snug line-clamp-2">
                        {evt.title}
                      </h4>

                      {/* Venue & Location */}
                      <div className="space-y-1 text-xs text-[#434752]">
                        <div className="flex items-start gap-1.5 font-semibold">
                          <MapPin size={14} className="text-[#006e2e] shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{evt.venue || evt.location}</span>
                        </div>
                        {evt.location && evt.venue && (
                          <span className="text-[11px] text-[#737783] pl-5 block">
                            City: <strong>{evt.location}</strong>
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-[#737783] line-clamp-2 leading-relaxed flex-1">
                        {evt.description}
                      </p>

                      {/* Auto-Remove Status Tag */}
                      <div className="pt-2 border-t border-[#e0e3e6] flex items-center justify-between gap-2 text-[11px]">
                        <span
                          className={`font-semibold inline-flex items-center gap-1 ${
                            evt.autoRemoveOnExpiry ? 'text-[#006e2e]' : 'text-[#737783]'
                          }`}
                        >
                          <Clock size={12} />
                          {evt.autoRemoveOnExpiry ? 'Auto-removes on completion' : 'Permanent on portal'}
                        </span>

                        {evt.organizer && (
                          <span className="text-[#737783] font-medium truncate max-w-[120px]">
                            {evt.organizer}
                          </span>
                        )}
                      </div>

                      {/* Card Action Buttons */}
                      <div className="pt-2 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingEvent(evt)}
                          className="flex-1 py-2 px-3 rounded-xl bg-[#f2f4f7] hover:bg-[#e0e3e6] text-[#003477] text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Edit3 size={13} />
                          <span>Edit Event</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteEvent(evt.id, evt.title)}
                          className="py-2 px-3 rounded-xl bg-[#fff8f7] hover:bg-[#ffdad6] text-[#ba1a1a] text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1"
                          title="Delete Event"
                        >
                          <Trash2 size={13} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          {currentEvents.length === 0 && (
            <div className="text-center py-12 bg-white rounded-3xl border border-[#e0e3e6] p-8 space-y-3">
              <Calendar size={36} className="mx-auto text-[#737783]" />
              <h4 className="font-bold text-[#191c1e] text-base">No Events Scheduled</h4>
              <p className="text-xs text-[#737783] max-w-md mx-auto">
                No active events found. Click "+ Add New Event" to publish upcoming summits, workshops, or conclaves.
              </p>
              <button
                type="button"
                onClick={() => setIsAddingEvent(true)}
                className="px-5 py-2.5 rounded-xl bg-[#003477] text-white text-xs font-bold cursor-pointer"
              >
                Create First Event
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD NEW EVENT MODAL */}
      {/* ========================================================================= */}
      {isAddingEvent && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-5 animate-in zoom-in-95 duration-150 shadow-2xl border border-[#e0e3e6]">
            <div className="flex items-center justify-between border-b border-[#e0e3e6] pb-3">
              <div className="flex items-center gap-2">
                <Calendar size={20} className="text-[#003477]" />
                <h3 className="text-base sm:text-lg font-black text-[#191c1e]">
                  Add New Solar Summit / Event
                </h3>
              </div>
              <button
                onClick={() => setIsAddingEvent(false)}
                className="p-1.5 rounded-full bg-[#f2f4f7] hover:bg-[#e0e3e6] text-[#434752] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateEventSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#191c1e] mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Andhra Pradesh Solar Leadership Summit 2026"
                  value={newEventForm.title}
                  onChange={(e) => setNewEventForm({ ...newEventForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] font-medium outline-none focus:bg-white focus:border-[#003477]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block font-bold text-[#191c1e] mb-1">Category *</label>
                  <select
                    value={newEventForm.category}
                    onChange={(e) => setNewEventForm({ ...newEventForm, category: e.target.value as any })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] font-bold text-[#003477] outline-none cursor-pointer"
                  >
                    <option value="Expo">Expo</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Conference">Conference</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Solar Summit">Solar Summit</option>
                    <option value="General Body">General Body</option>
                    <option value="Training">Training</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#191c1e] mb-1">Event Start Date *</label>
                  <input
                    type="date"
                    required
                    value={newEventForm.date}
                    onChange={(e) => setNewEventForm({ ...newEventForm, date: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] font-semibold outline-none focus:bg-white focus:border-[#003477]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#191c1e] mb-1">End Date (Optional)</label>
                  <input
                    type="date"
                    value={newEventForm.endDate || ''}
                    onChange={(e) => setNewEventForm({ ...newEventForm, endDate: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] font-semibold outline-none focus:bg-white focus:border-[#003477]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-[#191c1e] mb-1">Timing / Hours</label>
                  <input
                    type="text"
                    placeholder="e.g. 09:30 AM - 05:30 PM"
                    value={newEventForm.time}
                    onChange={(e) => setNewEventForm({ ...newEventForm, time: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] font-medium outline-none focus:bg-white focus:border-[#003477]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#191c1e] mb-1">City / District *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vijayawada / Visakhapatnam / Amaravati"
                    value={newEventForm.location}
                    onChange={(e) => setNewEventForm({ ...newEventForm, location: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] font-medium outline-none focus:bg-white focus:border-[#003477]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#191c1e] mb-1">Full Venue Address</label>
                <input
                  type="text"
                  placeholder="e.g. A-Plus Convention Centre, MG Road, Vijayawada"
                  value={newEventForm.venue || ''}
                  onChange={(e) => setNewEventForm({ ...newEventForm, venue: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] font-medium outline-none focus:bg-white focus:border-[#003477]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#191c1e] mb-1">Event Description *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe the summit objectives, keynote speakers, agendas, and participant benefits..."
                  value={newEventForm.description}
                  onChange={(e) => setNewEventForm({ ...newEventForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] font-medium outline-none focus:bg-white focus:border-[#003477]"
                />
              </div>

              {/* Banner Upload */}
              <div>
                <label className="block font-bold text-[#191c1e] mb-1">Event Banner Image</label>
                <div className="flex items-center gap-3">
                  {newEventForm.bannerUrl ? (
                    <div className="w-20 h-14 rounded-lg bg-black/10 overflow-hidden shrink-0 border border-[#e0e3e6]">
                      <img src={newEventForm.bannerUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  ) : null}
                  <label className="px-4 py-2.5 rounded-xl bg-[#003477] hover:bg-[#024aa3] text-white text-xs font-bold cursor-pointer transition-colors inline-flex items-center gap-1.5">
                    <Upload size={13} />
                    <span>Upload Banner Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const res = await compressImage(file, { maxWidth: 1200, maxHeight: 800, quality: 0.85 });
                          setNewEventForm({ ...newEventForm, bannerUrl: res.dataUrl });
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Auto Remove & Featured Toggles */}
              <div className="p-3.5 rounded-2xl bg-[#f7f9fc] border border-[#e0e3e6] space-y-2.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newEventForm.autoRemoveOnExpiry}
                    onChange={(e) => setNewEventForm({ ...newEventForm, autoRemoveOnExpiry: e.target.checked })}
                    className="w-4 h-4 rounded text-[#006e2e] focus:ring-[#006e2e]"
                  />
                  <span className="font-bold text-[#191c1e]">
                    Auto-remove this event from the website once time/date completes
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newEventForm.featured}
                    onChange={(e) => setNewEventForm({ ...newEventForm, featured: e.target.checked })}
                    className="w-4 h-4 rounded text-[#ffbe3b] focus:ring-[#ffbe3b]"
                  />
                  <span className="font-bold text-[#191c1e]">
                    Highlight as Featured Summit
                  </span>
                </label>
              </div>

              <div className="pt-3 border-t border-[#e0e3e6] flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddingEvent(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#f2f4f7] hover:bg-[#e0e3e6] text-[#434752] font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#006e2e] hover:bg-[#005322] text-white font-bold shadow-md cursor-pointer"
                >
                  Publish Event Live
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EDIT EVENT MODAL */}
      {/* ========================================================================= */}
      {editingEvent && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-5 animate-in zoom-in-95 duration-150 shadow-2xl border border-[#e0e3e6]">
            <div className="flex items-center justify-between border-b border-[#e0e3e6] pb-3">
              <div className="flex items-center gap-2">
                <Edit3 size={18} className="text-[#003477]" />
                <h3 className="text-base sm:text-lg font-black text-[#191c1e]">
                  Edit Event: {editingEvent.title}
                </h3>
              </div>
              <button
                onClick={() => setEditingEvent(null)}
                className="p-1.5 rounded-full bg-[#f2f4f7] hover:bg-[#e0e3e6] text-[#434752] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleUpdateEventSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#191c1e] mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  value={editingEvent.title}
                  onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] font-medium outline-none focus:bg-white focus:border-[#003477]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block font-bold text-[#191c1e] mb-1">Category</label>
                  <select
                    value={editingEvent.category}
                    onChange={(e) => setEditingEvent({ ...editingEvent, category: e.target.value as any })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] font-bold text-[#003477] outline-none cursor-pointer"
                  >
                    <option value="Expo">Expo</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Conference">Conference</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Solar Summit">Solar Summit</option>
                    <option value="General Body">General Body</option>
                    <option value="Training">Training</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#191c1e] mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={editingEvent.date}
                    onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] font-semibold outline-none focus:bg-white focus:border-[#003477]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#191c1e] mb-1">End Date</label>
                  <input
                    type="date"
                    value={editingEvent.endDate || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, endDate: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] font-semibold outline-none focus:bg-white focus:border-[#003477]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-[#191c1e] mb-1">Timing / Hours</label>
                  <input
                    type="text"
                    value={editingEvent.time || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, time: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] font-medium outline-none focus:bg-white focus:border-[#003477]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#191c1e] mb-1">City / District</label>
                  <input
                    type="text"
                    value={editingEvent.location}
                    onChange={(e) => setEditingEvent({ ...editingEvent, location: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] font-medium outline-none focus:bg-white focus:border-[#003477]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#191c1e] mb-1">Venue Address</label>
                <input
                  type="text"
                  value={editingEvent.venue || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, venue: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] font-medium outline-none focus:bg-white focus:border-[#003477]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#191c1e] mb-1">Event Description</label>
                <textarea
                  rows={3}
                  value={editingEvent.description}
                  onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] font-medium outline-none focus:bg-white focus:border-[#003477]"
                />
              </div>

              {/* Banner Upload */}
              <div>
                <label className="block font-bold text-[#191c1e] mb-1">Replace Banner Image</label>
                <div className="flex items-center gap-3">
                  {editingEvent.bannerUrl ? (
                    <div className="w-20 h-14 rounded-lg bg-black/10 overflow-hidden shrink-0 border border-[#e0e3e6]">
                      <img src={editingEvent.bannerUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  ) : null}
                  <label className="px-4 py-2.5 rounded-xl bg-[#003477] hover:bg-[#024aa3] text-white text-xs font-bold cursor-pointer transition-colors inline-flex items-center gap-1.5">
                    <Upload size={13} />
                    <span>Upload New Banner</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const res = await compressImage(file, { maxWidth: 1200, maxHeight: 800, quality: 0.85 });
                          setEditingEvent({ ...editingEvent, bannerUrl: res.dataUrl });
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Auto Remove & Featured Toggles */}
              <div className="p-3.5 rounded-2xl bg-[#f7f9fc] border border-[#e0e3e6] space-y-2.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingEvent.autoRemoveOnExpiry}
                    onChange={(e) => setEditingEvent({ ...editingEvent, autoRemoveOnExpiry: e.target.checked })}
                    className="w-4 h-4 rounded text-[#006e2e] focus:ring-[#006e2e]"
                  />
                  <span className="font-bold text-[#191c1e]">
                    Auto-remove this event from the website once time/date completes
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingEvent.featured || false}
                    onChange={(e) => setEditingEvent({ ...editingEvent, featured: e.target.checked })}
                    className="w-4 h-4 rounded text-[#ffbe3b] focus:ring-[#ffbe3b]"
                  />
                  <span className="font-bold text-[#191c1e]">
                    Highlight as Featured Summit
                  </span>
                </label>
              </div>

              <div className="pt-3 border-t border-[#e0e3e6] flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingEvent(null)}
                  className="px-4 py-2.5 rounded-xl bg-[#f2f4f7] hover:bg-[#e0e3e6] text-[#434752] font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#006e2e] hover:bg-[#005322] text-white font-bold shadow-md cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD GALLERY PHOTO MODAL */}
      {/* ========================================================================= */}
      {isAddingGalleryPhoto && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-4 animate-in zoom-in-95 duration-150 shadow-2xl border border-[#e0e3e6]">
            <div className="flex items-center justify-between border-b border-[#e0e3e6] pb-3">
              <h3 className="text-base font-black text-[#191c1e]">Add New Photo to Website Gallery</h3>
              <button
                onClick={() => setIsAddingGalleryPhoto(false)}
                className="p-1 rounded-full bg-[#f2f4f7] hover:bg-[#e0e3e6] text-[#434752] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddGalleryItemSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#191c1e] mb-1">Photo Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Solar Industry Summit 2026"
                  value={newGalleryItem.title}
                  onChange={(e) => setNewGalleryItem({ ...newGalleryItem, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] font-medium outline-none focus:bg-white focus:border-[#003477]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#191c1e] mb-1">Category</label>
                  <select
                    value={newGalleryItem.category}
                    onChange={(e) => setNewGalleryItem({
                      ...newGalleryItem,
                      category: e.target.value,
                      categorySlug: e.target.value.toLowerCase() as any
                    })}
                    className="w-full px-3 py-2 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] font-bold text-[#003477] outline-none cursor-pointer"
                  >
                    <option value="Events">Events</option>
                    <option value="Conferences">Conferences</option>
                    <option value="Workshops">Workshops</option>
                    <option value="Meetings">Meetings</option>
                    <option value="Activities">Activities</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#191c1e] mb-1">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Amaravati"
                    value={newGalleryItem.location}
                    onChange={(e) => setNewGalleryItem({ ...newGalleryItem, location: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] font-medium outline-none focus:bg-white focus:border-[#003477]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#191c1e] mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief description of the event or solar project"
                  value={newGalleryItem.desc}
                  onChange={(e) => setNewGalleryItem({ ...newGalleryItem, desc: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] font-medium outline-none focus:bg-white focus:border-[#003477]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#191c1e] mb-1">Upload Photo / Image *</label>
                <div className="flex items-center gap-3">
                  {newGalleryItem.src ? (
                    <div className="w-16 h-12 rounded-lg bg-black/10 overflow-hidden shrink-0 border border-[#e0e3e6]">
                      <img src={newGalleryItem.src} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  ) : null}
                  <label className="px-4 py-2 rounded-xl bg-[#003477] hover:bg-[#024aa3] text-white text-xs font-bold cursor-pointer transition-colors">
                    <span>Upload Image File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const res = await compressImage(file, { maxWidth: 1200, maxHeight: 900, quality: 0.85 });
                          setNewGalleryItem({ ...newGalleryItem, src: res.dataUrl });
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-[#e0e3e6] flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddingGalleryPhoto(false)}
                  className="px-4 py-2 rounded-xl bg-[#f2f4f7] hover:bg-[#e0e3e6] text-[#434752] font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#006e2e] hover:bg-[#005322] text-white font-bold shadow-xs cursor-pointer"
                >
                  Add Photo to Gallery
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MEMBER DOSSIER & PHOTO CONTROLS MODAL */}
      {/* ========================================================================= */}
      {viewingApp && (() => {
        const isViewingAppActive = viewingApp.status === 'Active' || viewingApp.status === 'Approved';
        return (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#e0e3e6] p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#e0e3e6]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-14 rounded-xl bg-[#003477] text-white flex items-center justify-center font-bold text-sm overflow-hidden shrink-0 shadow-xs">
                  {viewingApp.photoUrl ? (
                    <img src={viewingApp.photoUrl} alt={viewingApp.fullName} className="w-full h-full object-cover" />
                  ) : (
                    viewingApp.fullName.charAt(0)
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-[#191c1e]">{viewingApp.fullName}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      viewingApp.status === 'Active' || viewingApp.status === 'Approved'
                        ? 'bg-[#8ef9a0]/30 text-[#006e2e]'
                        : viewingApp.status === 'Inactive'
                          ? 'bg-[#ffdad6] text-[#ba1a1a]'
                          : 'bg-[#ffbe3b]/30 text-[#00285e]'
                    }`}>
                      {viewingApp.status === 'Approved' ? 'Active' : viewingApp.status}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-[#003477] font-bold">ID: {viewingApp.id}</span>
                </div>
              </div>
              <button
                onClick={() => setViewingApp(null)}
                className="w-8 h-8 rounded-full bg-[#f2f4f7] hover:bg-[#e0e3e6] flex items-center justify-center text-[#434752] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Quick Photo Replacement Bar inside Dossier */}
            <div className="p-3.5 rounded-2xl bg-[#f0f4ff] border border-[#003477]/20 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <ImageIcon size={16} className="text-[#003477]" />
                <span className="text-xs font-bold text-[#003477]">ID Card Photograph</span>
              </div>
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#003477] hover:bg-[#024aa3] text-white text-xs font-bold cursor-pointer transition-colors shadow-2xs">
                <Upload size={12} />
                <span>Replace Member Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleReplaceMemberPhoto(viewingApp, file);
                  }}
                  className="hidden"
                />
              </label>
            </div>

            {/* Member Details Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-[#f7f9fc] border border-[#e0e3e6] space-y-1">
                <span className="text-[10px] text-[#737783] uppercase font-bold">Company / Enterprise</span>
                <span className="font-extrabold text-[#191c1e] text-sm block">{viewingApp.companyName}</span>
                <span className="text-[11px] text-[#003477] font-semibold block">{viewingApp.district} • {viewingApp.businessType}</span>
              </div>

              <div className="p-3 rounded-xl bg-[#f7f9fc] border border-[#e0e3e6] space-y-1">
                <span className="text-[10px] text-[#737783] uppercase font-bold">Representative Phone &amp; Email</span>
                <span className="font-mono font-bold text-[#191c1e] block">+91 {viewingApp.mobileNumber}</span>
                <span className="text-[11px] text-[#003477] block truncate">{viewingApp.emailAddress}</span>
              </div>

              <div className="p-3 rounded-xl bg-[#f7f9fc] border border-[#e0e3e6] space-y-1">
                <span className="text-[10px] text-[#737783] uppercase font-bold">Date of Birth &amp; GST</span>
                <span className="font-bold text-[#191c1e] block">DOB: {viewingApp.dateOfBirth || 'N/A'}</span>
                <span className="text-[11px] font-mono text-[#737783] block">GST: {viewingApp.gstNumber || 'N/A'}</span>
              </div>

              <div className="p-3 rounded-xl bg-[#f7f9fc] border border-[#e0e3e6] space-y-1">
                <span className="text-[10px] text-[#737783] uppercase font-bold">Payment &amp; UTR Ref</span>
                <span className="font-mono font-black text-[#006e2e] block">{viewingApp.utrNumber}</span>
                <span className="text-[11px] text-[#191c1e] font-bold block">{viewingApp.amountPaid}</span>
              </div>
            </div>

            {/* Dossier Action Buttons */}
            <div className="pt-4 border-t border-[#e0e3e6] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                {(!isViewingAppActive && viewingApp.status !== 'Inactive') && (
                  <button
                    type="button"
                    onClick={() => handleQuickApprove(viewingApp)}
                    disabled={sendingEmailId === viewingApp.id}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#006e2e] hover:bg-[#005322] text-white font-black text-xs cursor-pointer shadow-sm active:scale-95 disabled:opacity-75"
                  >
                    {sendingEmailId === viewingApp.id ? (
                      <>
                        <RefreshCw size={13} className="animate-spin" />
                        <span>Approving &amp; Sending Email...</span>
                      </>
                    ) : (
                      <>
                        <Check size={14} />
                        <span>Approve &amp; Activate ID</span>
                      </>
                    )}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleToggleActiveStatus(viewingApp)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    isViewingAppActive
                      ? 'bg-[#fff0ed] text-[#ba1a1a] border-[#ffdad6] hover:bg-[#ffdad6]'
                      : 'bg-[#e8f5e9] text-[#006e2e] border-[#8ef9a0]/40 hover:bg-[#8ef9a0]/30'
                  }`}
                >
                  <Power size={13} />
                  <span>{isViewingAppActive ? 'Set Inactive' : 'Set Active'}</span>
                </button>

                {viewingApp.emailAddress && (
                  <button
                    type="button"
                    onClick={() => setEmailModalApp(viewingApp)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#f0f4ff] hover:bg-[#d8e2ff] text-[#003477] font-bold text-xs cursor-pointer border border-[#003477]/30"
                    title="Open Email Dispatch & Live Preview"
                  >
                    <Send size={13} />
                    <span>Dispatch / Preview Email</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setEditingApp({ ...viewingApp });
                    setViewingApp(null);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#f2f4f7] hover:bg-[#e0e3e6] text-[#434752] font-bold text-xs cursor-pointer"
                >
                  <Edit3 size={13} />
                  <span>Edit Full Record</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewingApp(null)}
                  className="px-4 py-2 rounded-xl bg-[#f2f4f7] text-[#434752] font-bold text-xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* EDIT ANY APPLICATION FIELD MODAL */}
      {/* ========================================================================= */}
      {editingApp && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#e0e3e6] p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-200">
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
                  <label className="block font-bold text-[#191c1e] mb-1">Membership Status</label>
                  <select
                    value={editingApp.status}
                    onChange={(e) => setEditingApp({ ...editingApp, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] font-bold text-[#003477] outline-none cursor-pointer"
                  >
                    <option value="Active">Active (Official Member)</option>
                    <option value="Inactive">Inactive (Suspended / Expired)</option>
                    <option value="Pending Verification">Pending Verification</option>
                    <option value="In Review">In Review</option>
                    <option value="Rejected">Rejected</option>
                  </select>
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

                <div className="sm:col-span-2">
                  <label className="block font-bold text-[#191c1e] mb-1">Member Portrait Photograph (Replacement)</label>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-14 rounded-xl bg-[#f2f4f7] border-2 border-[#003477] overflow-hidden flex items-center justify-center shrink-0 shadow-2xs">
                      {editingApp.photoUrl ? (
                        <img src={editingApp.photoUrl} alt="Photo" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[9px] font-bold text-[#ba1a1a]">No Photo</span>
                      )}
                    </div>
                    <label className="px-4 py-2 rounded-xl bg-[#003477] text-white text-[11px] font-bold cursor-pointer hover:bg-[#024aa3] shrink-0">
                      <span>Upload &amp; Replace Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const res = await compressImage(file, { maxWidth: 600, maxHeight: 600 });
                            setEditingApp({ ...editingApp, photoUrl: res.dataUrl });
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

      {/* ========================================================================= */}
      {/* MANUAL MEMBER ADDITION MODAL - MATCHING EXACT RICH MEMBERSHIP FIELDS */}
      {/* ========================================================================= */}
      {isAddingMember && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-150 my-8 shadow-2xl border border-[#e0e3e6]">
            <div className="flex items-center justify-between border-b border-[#e0e3e6] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#006e2e]/15 text-[#006e2e] flex items-center justify-center font-bold">
                  <UserPlus size={20} className="text-[#006e2e]" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#191c1e]">Add New Member to Registry</h3>
                  <p className="text-xs text-[#737783]">Direct registration with instant Active status &amp; database persistence</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddingMember(false)}
                className="p-1.5 rounded-full bg-[#f2f4f7] hover:bg-[#e0e3e6] text-[#434752] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateMember} className="space-y-6 text-xs">
              {/* 1. Representative Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-1.5 border-b border-[#e0e3e6]">
                  <div className="w-6 h-6 rounded-lg bg-[#003477] text-white flex items-center justify-center font-bold text-[11px]">
                    1
                  </div>
                  <h4 className="font-extrabold text-[#003477] text-sm">Authorized Representative Details</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block font-bold text-[#191c1e] mb-1">Full Representative Name *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 text-[#737783]" size={14} />
                      <input
                        type="text"
                        required
                        placeholder="Enter Full Name"
                        value={newMemberForm.fullName}
                        onChange={(e) => setNewMemberForm({ ...newMemberForm, fullName: e.target.value })}
                        className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] font-medium outline-none focus:bg-white focus:border-[#003477]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-[#191c1e] mb-1">Date of Birth <span className="text-[#737783] font-normal text-xs">(Optional)</span></label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-2.5 text-[#737783]" size={14} />
                      <input
                        type="date"
                        max={new Date().toISOString().split('T')[0]}
                        value={newMemberForm.dateOfBirth}
                        onChange={(e) => setNewMemberForm({ ...newMemberForm, dateOfBirth: e.target.value })}
                        className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] font-medium outline-none focus:bg-white focus:border-[#003477]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-[#191c1e] mb-1">Designation</label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-2.5 text-[#737783]" size={14} />
                      <input
                        type="text"
                        placeholder="Managing Director"
                        value={newMemberForm.designation}
                        onChange={(e) => setNewMemberForm({ ...newMemberForm, designation: e.target.value })}
                        className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] font-medium outline-none focus:bg-white focus:border-[#003477]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-[#191c1e] mb-1">Mobile Phone Number *</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 text-[#737783]" size={14} />
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        placeholder="10-digit mobile number"
                        value={newMemberForm.mobileNumber}
                        onChange={(e) => setNewMemberForm({ ...newMemberForm, mobileNumber: e.target.value })}
                        className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] font-medium outline-none focus:bg-white focus:border-[#003477]"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-[#191c1e] mb-1">Email Address *</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 text-[#737783]" size={14} />
                      <input
                        type="email"
                        required
                        placeholder="member@example.com"
                        value={newMemberForm.emailAddress}
                        onChange={(e) => setNewMemberForm({ ...newMemberForm, emailAddress: e.target.value })}
                        className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] font-medium outline-none focus:bg-white focus:border-[#003477]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Photo Upload */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-1.5 border-b border-[#e0e3e6]">
                  <div className="w-6 h-6 rounded-lg bg-[#003477] text-white flex items-center justify-center font-bold text-[11px]">
                    2
                  </div>
                  <h4 className="font-extrabold text-[#003477] text-sm">Representative Portrait Photograph</h4>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#f7f9fc] border border-[#e0e3e6] flex items-center gap-4">
                  <div className="w-14 h-16 rounded-xl bg-white border-2 border-[#003477]/30 overflow-hidden flex items-center justify-center shrink-0 shadow-2xs">
                    {newMemberForm.photoUrl ? (
                      <img src={newMemberForm.photoUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <User size={24} className="text-[#737783]" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <span className="font-bold text-[#191c1e] block">Passport Size ID Photograph</span>
                    <p className="text-[10.5px] text-[#737783]">Used for generating the digital ID card &amp; certificate.</p>
                  </div>
                  <label className="px-4 py-2 rounded-xl bg-[#003477] hover:bg-[#024aa3] text-white text-xs font-bold cursor-pointer transition-colors shrink-0">
                    <span>Upload Photo</span>
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

              {/* 3. Business Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-1.5 border-b border-[#e0e3e6]">
                  <div className="w-6 h-6 rounded-lg bg-[#003477] text-white flex items-center justify-center font-bold text-[11px]">
                    3
                  </div>
                  <h4 className="font-extrabold text-[#003477] text-sm">Business &amp; Enterprise Profile</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-[#191c1e] mb-1">Company / Enterprise Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Swamy Solar Systems Pvt Ltd"
                      value={newMemberForm.companyName}
                      onChange={(e) => setNewMemberForm({ ...newMemberForm, companyName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] font-medium outline-none focus:bg-white focus:border-[#003477]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#191c1e] mb-1">District (Andhra Pradesh) *</label>
                    <select
                      value={newMemberForm.district}
                      onChange={(e) => setNewMemberForm({ ...newMemberForm, district: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] font-bold text-[#003477] outline-none cursor-pointer"
                    >
                      {AP_DISTRICTS.map((dist) => (
                        <option key={dist} value={dist}>
                          {dist}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-[#191c1e] mb-1">Business Entity Type</label>
                    <select
                      value={newMemberForm.businessType}
                      onChange={(e) => setNewMemberForm({ ...newMemberForm, businessType: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] font-medium outline-none cursor-pointer"
                    >
                      {BUSINESS_TYPES.map((bt) => (
                        <option key={bt} value={bt}>
                          {bt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-[#191c1e] mb-1">Experience</label>
                    <select
                      value={newMemberForm.experience}
                      onChange={(e) => setNewMemberForm({ ...newMemberForm, experience: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] font-medium outline-none cursor-pointer"
                    >
                      {EXPERIENCE_LEVELS.map((exp) => (
                        <option key={exp} value={exp}>
                          {exp}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-[#191c1e] mb-1">GSTIN Number (Optional)</label>
                    <input
                      type="text"
                      placeholder="37AAAAA0000A1Z5"
                      value={newMemberForm.gstNumber}
                      onChange={(e) => setNewMemberForm({ ...newMemberForm, gstNumber: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] font-mono font-bold text-[#003477] outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-[#191c1e] mb-1">Office Street Address *</label>
                    <input
                      type="text"
                      required
                      placeholder="Door No, Street Name, Commercial Complex"
                      value={newMemberForm.officeAddress}
                      onChange={(e) => setNewMemberForm({ ...newMemberForm, officeAddress: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] font-medium outline-none focus:bg-white focus:border-[#003477]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#191c1e] mb-1">Pincode *</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="530001"
                      value={newMemberForm.pincode}
                      onChange={(e) => setNewMemberForm({ ...newMemberForm, pincode: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#f2f4f7] border border-[#e0e3e6] font-mono font-semibold outline-none"
                    />
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
                  <span>Register &amp; Save Member</span>
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
              className="w-full py-2.5 rounded-xl bg-[#003477] text-white text-xs font-bold cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* EMAIL DISPATCH & LIVE PREVIEW MODAL */}
      {emailModalApp && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-[#e0e3e6] p-6 sm:p-8 space-y-5 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-[#e0e3e6]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#003477] text-white flex items-center justify-center font-bold">
                  <Mail size={20} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-[#191c1e]">
                    Official Membership Certificate Email Dispatcher
                  </h3>
                  <p className="text-xs text-[#737783]">
                    Recipient: <strong className="text-[#003477]">{emailModalApp.fullName}</strong> ({emailModalApp.emailAddress || 'No Email'})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEmailModalApp(null)}
                className="p-1.5 rounded-full bg-[#f2f4f7] hover:bg-[#e0e3e6] text-[#434752] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Quick Dispatch Action Bar */}
            <div className="bg-[#f0f7ff] border border-[#bcd7ff] rounded-2xl p-4 space-y-3">
              <span className="text-xs font-bold text-[#003477] block">
                Choose Dispatch Delivery Mode:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* 1-Click Send via API (Resend) */}
                <button
                  type="button"
                  onClick={() => handleSendEmailConfirmation(emailModalApp)}
                  disabled={sendingEmailId === emailModalApp.id}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#006e2e] hover:bg-[#005322] text-white font-extrabold text-xs shadow-xs cursor-pointer active:scale-98 disabled:opacity-75"
                >
                  {sendingEmailId === emailModalApp.id ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Sending via Resend...</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>Send via Resend API</span>
                    </>
                  )}
                </button>

                {/* 1-Click Gmail Web Compose */}
                <a
                  href={generateGmailWebLink(emailModalApp, websiteSettings)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#ea4335] hover:bg-[#d93025] text-white font-extrabold text-xs shadow-xs cursor-pointer active:scale-98 transition-all"
                >
                  <ExternalLink size={14} />
                  <span>1-Click Gmail Web</span>
                </a>

                {/* Open in Mail Client */}
                <a
                  href={generateMailtoLink(emailModalApp, websiteSettings)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#003477] hover:bg-[#024aa3] text-white font-extrabold text-xs shadow-xs cursor-pointer active:scale-98 transition-all"
                >
                  <Mail size={14} />
                  <span>System Mail App</span>
                </a>
              </div>

              {/* Copy Plaintext Option */}
              <div className="flex items-center justify-between pt-1 border-t border-[#bcd7ff] text-xs">
                <span className="text-[11.5px] text-[#475569]">
                  Need text for WhatsApp or SMS?
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const text = generateApprovalEmailPlainText(emailModalApp, websiteSettings);
                    navigator.clipboard.writeText(text);
                    setCopiedEmailText(true);
                    setTimeout(() => setCopiedEmailText(false), 3000);
                  }}
                  className="text-xs font-bold text-[#003477] hover:underline cursor-pointer inline-flex items-center gap-1"
                >
                  {copiedEmailText ? (
                    <>
                      <Check size={13} className="text-[#006e2e]" />
                      <span className="text-[#006e2e]">Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span>Copy Dossier Text</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Live HTML Email Preview Window */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#191c1e] block">
                Live Certificate Email Preview:
              </span>
              <div className="border border-[#e0e3e6] rounded-2xl overflow-hidden bg-[#e9ecef] shadow-inner">
                <iframe
                  title="Approval Email Preview"
                  srcDoc={generateApprovalEmailHtml(emailModalApp, websiteSettings)}
                  className="w-full h-[380px] border-none"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setEmailModalApp(null)}
                className="px-5 py-2 rounded-xl bg-[#f2f4f7] hover:bg-[#e0e3e6] text-[#434752] font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
