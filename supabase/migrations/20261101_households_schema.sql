-- supabase/migrations/20261101_households_schema.sql
-- Migration: Create households table for collector-assisted client onboarding, customer codes, and ledger billing

-- 1. Create households table
CREATE TABLE IF NOT EXISTS public.households (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_code TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    cluster_zone TEXT NOT NULL DEFAULT 'Oke-Fia Zone',
    monthly_tariff NUMERIC(12, 2) NOT NULL DEFAULT 4000.00,
    permanent_password TEXT NOT NULL,
    collector_id TEXT,
    collector_name TEXT,
    payment_status TEXT NOT NULL DEFAULT 'UP_TO_DATE', -- 'UP_TO_DATE' | 'DEBTOR' | 'PAID_IN_ADVANCE'
    balance_due NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    months_overdue INTEGER DEFAULT 0,
    advance_months INTEGER DEFAULT 0,
    last_payment_date TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all required columns exist if the table was previously created
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'households' AND column_name = 'customer_code') THEN
        ALTER TABLE public.households ADD COLUMN customer_code TEXT UNIQUE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'households' AND column_name = 'permanent_password') THEN
        ALTER TABLE public.households ADD COLUMN permanent_password TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'households' AND column_name = 'collector_id') THEN
        ALTER TABLE public.households ADD COLUMN collector_id TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'households' AND column_name = 'collector_name') THEN
        ALTER TABLE public.households ADD COLUMN collector_name TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'households' AND column_name = 'payment_status') THEN
        ALTER TABLE public.households ADD COLUMN payment_status TEXT NOT NULL DEFAULT 'UP_TO_DATE';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'households' AND column_name = 'balance_due') THEN
        ALTER TABLE public.households ADD COLUMN balance_due NUMERIC(12, 2) NOT NULL DEFAULT 0.00;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'households' AND column_name = 'months_overdue') THEN
        ALTER TABLE public.households ADD COLUMN months_overdue INTEGER DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'households' AND column_name = 'advance_months') THEN
        ALTER TABLE public.households ADD COLUMN advance_months INTEGER DEFAULT 0;
    END IF;
END $$;

-- 2. Indexes for customer lookup, phone, collector ownership, and cluster filtering
CREATE INDEX IF NOT EXISTS idx_households_customer_code ON public.households(customer_code);
CREATE INDEX IF NOT EXISTS idx_households_phone ON public.households(phone);
CREATE INDEX IF NOT EXISTS idx_households_collector_id ON public.households(collector_id);
CREATE INDEX IF NOT EXISTS idx_households_cluster_zone ON public.households(cluster_zone);
CREATE INDEX IF NOT EXISTS idx_households_payment_status ON public.households(payment_status);

-- 3. Row Level Security (RLS) Policies
ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;

-- Allow collectors and authenticated users to view households
DROP POLICY IF EXISTS "Households are viewable by authenticated collectors" ON public.households;
CREATE POLICY "Households are viewable by authenticated collectors"
    ON public.households
    FOR SELECT
    TO authenticated
    USING (TRUE);

-- Allow collectors to insert households
DROP POLICY IF EXISTS "Households are insertable by authenticated collectors" ON public.households;
CREATE POLICY "Households are insertable by authenticated collectors"
    ON public.households
    FOR INSERT
    TO authenticated
    WITH CHECK (TRUE);

-- Allow collectors to update households (e.g. updating balance / payment status)
DROP POLICY IF EXISTS "Households are updatable by authenticated collectors" ON public.households;
CREATE POLICY "Households are updatable by authenticated collectors"
    ON public.households
    FOR UPDATE
    TO authenticated
    USING (TRUE)
    WITH CHECK (TRUE);

