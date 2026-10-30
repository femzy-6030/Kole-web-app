-- supabase/migrations/20261030_organization_schema.sql
-- Migration: Extend organizations table for multi-frequency tariffs, OWMA levy split, and RLS policies

-- 1. Create or Extend organizations table
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_name TEXT NOT NULL,
    business_category TEXT NOT NULL DEFAULT 'Other',
    clearance_frequency TEXT NOT NULL DEFAULT '1x / week',
    base_tariff NUMERIC(12, 2) NOT NULL DEFAULT 15000.00,
    owma_levy_amount NUMERIC(12, 2) NOT NULL DEFAULT 450.00,
    kole_tech_fee NUMERIC(12, 2) NOT NULL DEFAULT 200.00,
    total_monthly_bill NUMERIC(12, 2),
    paystack_subaccount_ref TEXT NOT NULL DEFAULT 'ACCT_owmatreasury123',
    payment_reference TEXT,
    area_cluster TEXT NOT NULL DEFAULT 'Oke-Fia Zone',
    address TEXT,
    phone TEXT,
    email TEXT,
    officer_name TEXT,
    staging_bay_notes TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all required columns exist if the table was previously created
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'organizations' AND column_name = 'business_category') THEN
        ALTER TABLE public.organizations ADD COLUMN business_category TEXT NOT NULL DEFAULT 'Other';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'organizations' AND column_name = 'clearance_frequency') THEN
        ALTER TABLE public.organizations ADD COLUMN clearance_frequency TEXT NOT NULL DEFAULT '1x / week';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'organizations' AND column_name = 'base_tariff') THEN
        ALTER TABLE public.organizations ADD COLUMN base_tariff NUMERIC(12, 2) NOT NULL DEFAULT 15000.00;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'organizations' AND column_name = 'owma_levy_amount') THEN
        ALTER TABLE public.organizations ADD COLUMN owma_levy_amount NUMERIC(12, 2) NOT NULL DEFAULT 450.00;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'organizations' AND column_name = 'kole_tech_fee') THEN
        ALTER TABLE public.organizations ADD COLUMN kole_tech_fee NUMERIC(12, 2) NOT NULL DEFAULT 200.00;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'organizations' AND column_name = 'paystack_subaccount_ref') THEN
        ALTER TABLE public.organizations ADD COLUMN paystack_subaccount_ref TEXT NOT NULL DEFAULT 'ACCT_owmatreasury123';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'organizations' AND column_name = 'total_monthly_bill') THEN
        ALTER TABLE public.organizations ADD COLUMN total_monthly_bill NUMERIC(12, 2);
    END IF;
END $$;

-- 2. Indexes for user lookups and business category aggregation
CREATE INDEX IF NOT EXISTS idx_organizations_user_id ON public.organizations(user_id);
CREATE INDEX IF NOT EXISTS idx_organizations_business_category ON public.organizations(business_category);
CREATE INDEX IF NOT EXISTS idx_organizations_area_cluster ON public.organizations(area_cluster);

-- 3. Row Level Security (RLS) Policies
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Allow authenticated organization owners to view their own profile data
DROP POLICY IF EXISTS "Organizations are viewable by owner" ON public.organizations;
CREATE POLICY "Organizations are viewable by owner"
    ON public.organizations
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Allow authenticated users to insert their organization profile data
DROP POLICY IF EXISTS "Organizations are insertable by owner" ON public.organizations;
CREATE POLICY "Organizations are insertable by owner"
    ON public.organizations
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Allow authenticated organization owners to update their profile data
DROP POLICY IF EXISTS "Organizations are updatable by owner" ON public.organizations;
CREATE POLICY "Organizations are updatable by owner"
    ON public.organizations
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 4. Commercial Site Inspection Requests Table (Custom Bulk Tier)
CREATE TABLE IF NOT EXISTS public.organization_inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    organization_name TEXT NOT NULL,
    business_category TEXT NOT NULL,
    area_cluster TEXT NOT NULL,
    address TEXT,
    contact_officer TEXT,
    phone TEXT NOT NULL,
    email TEXT,
    estimated_volume TEXT,
    preferred_date TEXT,
    staging_bay TEXT,
    status TEXT DEFAULT 'INSPECTION_PENDING',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.organization_inspections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Inspections are viewable by owner" ON public.organization_inspections;
CREATE POLICY "Inspections are viewable by owner"
    ON public.organization_inspections
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Inspections are insertable by all" ON public.organization_inspections;
CREATE POLICY "Inspections are insertable by all"
    ON public.organization_inspections
    FOR INSERT
    TO public
    WITH CHECK (true);

