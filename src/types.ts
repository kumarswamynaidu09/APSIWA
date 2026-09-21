export type NavTab = 'home' | 'gallery' | 'membership' | 'payment' | 'about' | 'contact' | 'auth' | 'profile' | 'admin';

export interface WebsiteSettings {
  regularFee: number;
  expoFee: number;
  expoDiscountPercentage: number;
  expoOfferTitle: string;
  isExpoActive: boolean;
  upiId: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  bankBranch: string;
  qrCodeUrl: string;
  secretariatAddress: string;
  secretariatPhone: string;
  secretariatEmail: string;
  announcementText: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  avatarUrl?: string;
  membershipId?: string;
  joinedDate?: string;
  companyName?: string;
  designation?: string;
  district?: string;
  gstNumber?: string;
  businessType?: string;
  bloodGroup?: string;
  address?: string;
  validUntil?: string;
  membershipTier?: string;
  membershipStatus?: 'Active' | 'Pending Verification' | 'In Review' | 'Expired';
  role?: 'admin' | 'member';
}

export interface GalleryItem {
  id: string;
  src: string;
  category: string;
  categorySlug: 'events' | 'meetings' | 'workshops' | 'conferences' | 'activities';
  title: string;
  desc: string;
  date: string;
  location: string;
  dataAlt?: string;
}

export interface MembershipApplication {
  id: string;
  fullName: string;
  mobileNumber: string;
  emailAddress: string;
  dob?: string;
  companyName?: string;
  gstNumber?: string;
  businessType?: string;
  experience?: string;
  district?: string;
  officeAddress?: string;
  pincode?: string;
  photoUrl?: string;
  utrNumber: string;
  paymentDate: string;
  amountPaid: string;
  paymentScreenshotUrl?: string;
  submissionDate: string;
  status: 'Pending Verification' | 'Approved' | 'In Review';
}

export interface DirectoryMember {
  id: string;
  companyName: string;
  contactPerson: string;
  district: string;
  businessType: string;
  experience: string;
  verified: boolean;
  phone: string;
  email: string;
  capacityInstalled: string;
}
