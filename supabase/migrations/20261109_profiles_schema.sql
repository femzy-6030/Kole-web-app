-- supabase/migrations/20261109_profiles_schema.sql
-- Custom Profiles table with Role-Based Access Control (RBAC)
-- Permits SUPER_ADMIN, COLLECTOR, CUSTOMER, ORGANIZATION

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone TEXT,
    company_name TEXT,
    role TEXT NOT NULL CHECK (role IN ('SUPER_ADMIN', 'COLLECTOR', 'CUSTOMER', 'ORGANIZATION')),
    area TEXT DEFAULT 'Oke-Fia',
    cluster TEXT DEFAULT 'Oke-Fia Zone',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for speedy role and email lookup
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own profile
CREATE POLICY "Users can read own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

-- Allow Super Admins to view all profiles
CREATE POLICY "Super Admins can read all profiles"
    ON public.profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
        )
    );

-- Allow service role full access
CREATE POLICY "Service role full access on profiles"
    ON public.profiles FOR ALL
    USING (auth.role() = 'service_role');

