export type NavTab = 'home' | 'gallery' | 'membership' | 'about' | 'contact' | 'auth';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  avatarUrl?: string;
  membershipId?: string;
  joinedDate?: string;
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
