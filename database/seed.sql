-- =============================================================================
-- SUPABASE SEED DATASET FOR NEIGHBOR-SHARE / RESOURCESHARE
-- =============================================================================

-- 1. PROFILES SEED
INSERT INTO public.profiles (id, full_name, avatar_url, location, phone_number, created_at)
VALUES 
  ('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Mike Taylor', 'https://ui-avatars.com/api/?name=Mike+T&background=0284c7&color=fff', 'Oakwood Apartments, Blk B', '+919876543210', NOW()),
  ('b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', 'Sarah Jenkins', 'https://ui-avatars.com/api/?name=Sarah+J&background=db2777&color=fff', 'Sunrise Heights, Apt 402', '+919876543211', NOW()),
  ('c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', 'Dan Carter', 'https://ui-avatars.com/api/?name=Dan+C&background=7c3aed&color=fff', 'Green Valley Residency', '+919876543212', NOW()),
  ('d4e5f6a7-b89c-0d1e-2f3a-4b5c6d7e8f9a', 'Alex Rivera', 'https://ui-avatars.com/api/?name=Alex+R&background=84cc16&color=fff', 'Maple Wood Lane', '+919876543213', NOW())
ON CONFLICT (id) DO NOTHING;

-- 2. ORDERS / PAYMENTS SEED
INSERT INTO public.orders (user_id, payment_intent_id, amount, currency, status, payment_method, items, metadata, created_at)
VALUES 
  (
    'd4e5f6a7-b89c-0d1e-2f3a-4b5c6d7e8f9a',
    'pi_3MtwB2LkdIwHu7ix08w3B5xZ',
    1500,
    'inr',
    'succeeded',
    'upi',
    '[{"id": 5, "title": "DeWalt 20V Cordless Power Drill Set", "days": 1, "price": 1500}]'::jsonb,
    '{"upi_app": "Google Pay", "upi_id": "alex@okaxis"}'::jsonb,
    NOW() - INTERVAL '2 days'
  ),
  (
    'd4e5f6a7-b89c-0d1e-2f3a-4b5c6d7e8f9a',
    'pi_3MtwC4LkdIwHu7ix19y4C6yA',
    3000,
    'inr',
    'succeeded',
    'card',
    '[{"id": 9, "title": "4-Person Camping Tent", "days": 1, "price": 3000}]'::jsonb,
    '{"card_brand": "Visa", "last4": "4242"}'::jsonb,
    NOW() - INTERVAL '5 days'
  ),
  (
    'd4e5f6a7-b89c-0d1e-2f3a-4b5c6d7e8f9a',
    'pi_3MtwD6LkdIwHu7ix20z5D7zB',
    2500,
    'inr',
    'pending',
    'cash_on_pickup',
    '[{"id": 8, "title": "Kärcher High Pressure Washer", "days": 1, "price": 2500}]'::jsonb,
    '{"mode": "cash"}'::jsonb,
    NOW() - INTERVAL '1 day'
  );

-- 3. SAVED PAYMENT METHODS SEED
INSERT INTO public.saved_payment_methods (user_id, type, brand, last4, exp_month, exp_year, upi_id, is_default)
VALUES 
  ('d4e5f6a7-b89c-0d1e-2f3a-4b5c6d7e8f9a', 'card', 'Visa', '4242', 12, 2028, NULL, TRUE),
  ('d4e5f6a7-b89c-0d1e-2f3a-4b5c6d7e8f9a', 'upi', 'UPI', NULL, NULL, NULL, 'alex.rivera@okaxis', FALSE);
