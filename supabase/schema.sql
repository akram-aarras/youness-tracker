-- ==============================================================================
-- AtlasNet / YounessNet WISP - Database Schema & Role-Based Access Control (RBAC)
-- Supabase Migration Script
-- ==============================================================================

-- 1. Create User Role Enum
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'technician');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. User Profiles Table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'technician',
  technician_id TEXT,
  phone TEXT,
  avatar TEXT DEFAULT '👤',
  specialty TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Technicians Table
CREATE TABLE IF NOT EXISTS public.technicians (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  specialty TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'in_field', 'off_duty')),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Clients Table
CREATE TABLE IF NOT EXISTS public.clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  neighborhood TEXT,
  address TEXT,
  gps_coordinates TEXT,
  google_maps_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'due_soon', 'overdue', 'suspended')),
  monthly_fee NUMERIC NOT NULL DEFAULT 100,
  subscription_plan TEXT DEFAULT 'Standard Wi-Fi Plan (100 MAD)',
  next_due_date DATE NOT NULL,
  last_payment_date DATE,
  installation_date DATE,
  hardware JSONB DEFAULT '{}'::jsonb,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tickets Table
CREATE TABLE IF NOT EXISTS public.tickets (
  id TEXT PRIMARY KEY,
  ticket_number TEXT UNIQUE NOT NULL,
  client_id TEXT REFERENCES public.clients(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  client_neighborhood TEXT,
  client_address TEXT,
  google_maps_url TEXT,
  category TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('urgent', 'high', 'normal')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
  assigned_to_technician_id TEXT,
  assigned_technician_name TEXT,
  description TEXT NOT NULL,
  resolution_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ
);

-- 6. Payment Logs Table
CREATE TABLE IF NOT EXISTS public.payment_logs (
  id TEXT PRIMARY KEY,
  receipt_number TEXT UNIQUE NOT NULL,
  client_id TEXT REFERENCES public.clients(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  base_fee NUMERIC DEFAULT 100,
  extra_amount NUMERIC DEFAULT 0,
  extra_reason TEXT,
  method TEXT NOT NULL CHECK (method IN ('cash', 'bank_transfer', 'cih_bank', 'wafacash')),
  payment_date DATE NOT NULL,
  previous_due_date DATE NOT NULL,
  new_due_date DATE NOT NULL,
  recorded_by TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 7. Row Level Security (RLS) Policies
-- ==============================================================================

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_logs ENABLE ROW LEVEL SECURITY;

-- Helper function: is current user an admin?
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'admin' AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles:
-- Any authenticated user can read their own profile
CREATE POLICY "Users can read own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Admins can view and manage all profiles
CREATE POLICY "Admins have full access to profiles" ON public.user_profiles
  FOR ALL USING (public.is_admin());

-- Technicians table:
CREATE POLICY "Admins full access to technicians" ON public.technicians
  FOR ALL USING (public.is_admin());

CREATE POLICY "Technicians can read technicians directory" ON public.technicians
  FOR SELECT USING (auth.role() = 'authenticated');

-- Clients:
-- Only admins have full access to client subscriptions and records
CREATE POLICY "Admins full access to clients" ON public.clients
  FOR ALL USING (public.is_admin());

CREATE POLICY "Technicians can read client hardware info for tasks" ON public.clients
  FOR SELECT USING (auth.role() = 'authenticated');

-- Tickets:
-- Admins can manage all tickets
CREATE POLICY "Admins full access to tickets" ON public.tickets
  FOR ALL USING (public.is_admin());

-- Technicians can ONLY view tickets assigned to them
CREATE POLICY "Technicians view assigned tickets" ON public.tickets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid()
        AND (p.role = 'admin' OR p.technician_id = tickets.assigned_to_technician_id)
    )
  );

-- Technicians can update ticket status and notes for tickets assigned to them
CREATE POLICY "Technicians update assigned tickets" ON public.tickets
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid()
        AND (p.role = 'admin' OR p.technician_id = tickets.assigned_to_technician_id)
    )
  );

-- Payment Logs:
-- Strictly accessible to Admins
CREATE POLICY "Admins full access to payment logs" ON public.payment_logs
  FOR ALL USING (public.is_admin());

-- ==============================================================================
-- 8. Auto-Create Profile on Supabase Auth Signup Trigger
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  assigned_role user_role;
BEGIN
  assigned_role := COALESCE((new.raw_user_meta_data->>'role')::user_role, 'technician');

  INSERT INTO public.user_profiles (id, email, username, name, role, technician_id, phone, avatar, status)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'name', 'Staff Member'),
    assigned_role,
    new.raw_user_meta_data->>'technician_id',
    new.raw_user_meta_data->>'phone',
    COALESCE(new.raw_user_meta_data->>'avatar', '👤'),
    'active'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==============================================================================
-- 9. Initial Seed Users (Optional reference for manual testing)
-- ==============================================================================
-- Youness (Admin): youness@atlasnet.ma / Admin123!
-- Yassine (Lead Tech): yassine@atlasnet.ma / Tech123!
-- Omar (Field Tech): omar@atlasnet.ma / Tech123!
