-- ==============================================================================
-- APSIWA (Andhra Pradesh Solar Integrators Welfare Association)
-- Supabase Database Schema: Membership & Payment Verification
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- TABLE: profiles
-- Extends Supabase auth.users with institutional member details
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT UNIQUE,
  phone_number TEXT,
  avatar_url TEXT,
  company_name TEXT,
  designation TEXT,
  district TEXT,
  gst_number TEXT,
  business_type TEXT,
  blood_group TEXT,
  office_address TEXT,
  membership_id TEXT UNIQUE,
  membership_tier TEXT DEFAULT 'Life Member (EPC Tier-1)',
  membership_status TEXT DEFAULT 'Pending Verification',
  valid_until DATE DEFAULT (CURRENT_DATE + INTERVAL '3 years'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- TABLE: membership_applications
-- Stores all applicant representative and business firm credentials
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.membership_applications (
  id TEXT PRIMARY KEY, -- e.g. APSIWA-2026-48192
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  mobile_number TEXT NOT NULL,
  email_address TEXT NOT NULL,
  dob DATE,
  company_name TEXT NOT NULL,
  designation TEXT,
  gst_number TEXT,
  business_type TEXT DEFAULT 'Private Limited Company',
  experience TEXT DEFAULT '1 - 3 Years',
  district TEXT NOT NULL,
  office_address TEXT NOT NULL,
  pincode TEXT NOT NULL,
  solar_scopes TEXT[],
  photo_url TEXT,
  utr_number TEXT NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount_paid TEXT NOT NULL DEFAULT '₹ 2,000.00',
  payment_screenshot_url TEXT,
  submission_date TEXT NOT NULL DEFAULT TO_CHAR(NOW(), 'Mon DD, YYYY'),
  status TEXT NOT NULL DEFAULT 'Pending Verification' CHECK (status IN ('Pending Verification', 'In Review', 'Approved', 'Rejected')),
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- TABLE: payments
-- Dedicated ledger for membership admission & expo welfare fee payments
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id TEXT REFERENCES public.membership_applications(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  utr_number TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL DEFAULT 2000.00,
  currency TEXT NOT NULL DEFAULT 'INR',
  original_fee NUMERIC(10, 2) DEFAULT 5000.00,
  discount_percentage NUMERIC(5, 2) DEFAULT 60.00,
  offer_title TEXT DEFAULT 'Solar Expo Inaugural Offer (60% OFF)',
  payment_mode TEXT DEFAULT 'UPI / Direct Bank Transfer',
  bank_account_used TEXT DEFAULT 'APSIWA SBI Account 394801002934',
  upi_id_used TEXT DEFAULT 'apsiwa.welfare@sbi',
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  screenshot_url TEXT,
  verification_status TEXT NOT NULL DEFAULT 'Pending' CHECK (verification_status IN ('Pending', 'Verified', 'Rejected')),
  verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR OPTIMAL QUERY PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_membership_id ON public.profiles(membership_id);
CREATE INDEX IF NOT EXISTS idx_membership_apps_user_id ON public.membership_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_membership_apps_email ON public.membership_applications(email_address);
CREATE INDEX IF NOT EXISTS idx_membership_apps_status ON public.membership_applications(status);
CREATE INDEX IF NOT EXISTS idx_membership_apps_utr ON public.membership_applications(utr_number);
CREATE INDEX IF NOT EXISTS idx_payments_app_id ON public.payments(application_id);
CREATE INDEX IF NOT EXISTS idx_payments_utr ON public.payments(utr_number);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- 2. Membership Applications Policies
CREATE POLICY "Allow public select for verified status checks" 
  ON public.membership_applications FOR SELECT 
  USING (true);

CREATE POLICY "Allow authenticated or public insert for application filing" 
  ON public.membership_applications FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow update for application approval" 
  ON public.membership_applications FOR UPDATE 
  USING (true);

-- 3. Payments Policies
CREATE POLICY "Payments viewable by everyone or owner" 
  ON public.payments FOR SELECT 
  USING (true);

CREATE POLICY "Allow inserting payment proof" 
  ON public.payments FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow updating payment verification" 
  ON public.payments FOR UPDATE 
  USING (true);

-- ==============================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER ON AUTH SIGNUP
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    full_name,
    email,
    phone_number,
    membership_id,
    membership_status
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', SPLIT_PART(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', NEW.raw_user_meta_data->>'phoneNumber', NEW.phone),
    COALESCE(NEW.raw_user_meta_data->>'membership_id', 'APSIWA-' || UPPER(SUBSTRING(NEW.id::TEXT FROM 1 FOR 6))),
    'Pending Verification'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if already exists then recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- ENABLE SUPABASE REALTIME REPLICATION
-- ==============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.membership_applications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

-- ==============================================================================
-- STORAGE BUCKETS (Optional for member photos and payment screenshots)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('apsiwa_assets', 'apsiwa_assets', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access to apsiwa_assets" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'apsiwa_assets');

CREATE POLICY "Allow upload to apsiwa_assets" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'apsiwa_assets');
