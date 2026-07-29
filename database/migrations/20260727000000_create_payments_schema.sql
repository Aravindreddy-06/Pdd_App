-- =============================================================================
-- SUPABASE MIGRATION: PAYMENTS, ORDERS & PAYMENT METHODS
-- =============================================================================

-- Enums
CREATE TYPE payment_status AS ENUM ('pending', 'succeeded', 'failed', 'refunded');
CREATE TYPE payment_method_type AS ENUM ('card', 'upi', 'netbanking', 'cash_on_pickup');

-- 1. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    payment_intent_id TEXT UNIQUE,
    amount INTEGER NOT NULL CHECK (amount >= 0), -- Amount in smallest currency unit (e.g. cents/paise)
    currency VARCHAR(3) NOT NULL DEFAULT 'inr',
    status payment_status NOT NULL DEFAULT 'pending',
    payment_method payment_method_type NOT NULL DEFAULT 'card',
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_intent_id ON public.orders(payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);

-- 2. SAVED PAYMENT METHODS TABLE
CREATE TABLE IF NOT EXISTS public.saved_payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type payment_method_type NOT NULL DEFAULT 'card',
    brand VARCHAR(50),             -- e.g. Visa, Mastercard, RuPay
    last4 VARCHAR(4),               -- Last 4 digits
    exp_month INT,                  -- Expiry month
    exp_year INT,                   -- Expiry year
    upi_id VARCHAR(100),            -- e.g. user@okaxis
    stripe_pm_id VARCHAR(100),      -- Stripe payment method ID
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_saved_pm_user_id ON public.saved_payment_methods(user_id);

-- 3. AUTOMATIC UPDATED_AT TRIGGER
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_orders_updated_at ON public.orders;
CREATE TRIGGER set_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_payment_methods ENABLE ROW LEVEL SECURITY;

-- Orders: Users can view their own orders
CREATE POLICY "Users can view own orders"
    ON public.orders FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Saved Payment Methods: Users can view and manage their own payment methods
CREATE POLICY "Users can view own payment methods"
    ON public.saved_payment_methods FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payment methods"
    ON public.saved_payment_methods FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own payment methods"
    ON public.saved_payment_methods FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own payment methods"
    ON public.saved_payment_methods FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);
