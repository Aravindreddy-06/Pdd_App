# 🔌 API & Database Reference Documentation

This document describes the backend endpoints, serverless functions, database schema, and Row Level Security (RLS) policies used by both the Web Application (`/web`) and Native Mobile App (`/android`).

---

## 🗄️ Database Schema (`/database`)

### 1. `public.orders` Table
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | PRIMARY KEY, DEFAULT `gen_random_uuid()` | Order identifier |
| `user_id` | `UUID` | REFERENCES `auth.users(id)` ON DELETE CASCADE | Buyer/Borrower user ID |
| `payment_intent_id` | `TEXT` | UNIQUE | Stripe Payment Intent ID |
| `amount` | `INTEGER` | CHECK (`amount >= 0`) | Amount in paise/cents |
| `currency` | `VARCHAR(3)` | DEFAULT `'inr'` | Currency ISO code |
| `status` | `payment_status` | ENUM ('pending', 'succeeded', 'failed', 'refunded') | Current status |
| `payment_method` | `payment_method_type` | ENUM ('card', 'upi', 'netbanking', 'cash_on_pickup') | Selected method |
| `items` | `JSONB` | DEFAULT `'[]'::jsonb` | Cart line items |
| `metadata` | `JSONB` | DEFAULT `'{}'::jsonb` | Additional metadata |
| `created_at` | `TIMESTAMPTZ` | DEFAULT `NOW()` | Creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | DEFAULT `NOW()` | Auto-updated timestamp |

### 2. `public.saved_payment_methods` Table
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | PRIMARY KEY | Saved PM identifier |
| `user_id` | `UUID` | REFERENCES `auth.users(id)` | User owner |
| `type` | `payment_method_type` | NOT NULL | Card, UPI, etc. |
| `brand` | `VARCHAR(50)` | | Visa, Mastercard, RuPay |
| `last4` | `VARCHAR(4)` | | Last 4 digits |
| `stripe_pm_id` | `VARCHAR(100)` | | Stripe Payment Method ID |
| `is_default` | `BOOLEAN` | DEFAULT `FALSE` | Primary default card |

---

## ⚡ Serverless Edge Functions (`/backend`)

### 1. `create-payment-intent`
- **Path**: `supabase/functions/create-payment-intent`
- **Method**: `POST`
- **Authentication**: Required (`Bearer <JWT>`)
- **Body**:
  ```json
  {
    "amount": 50000,
    "currency": "inr",
    "payment_method": "card",
    "items": [{ "id": "item-123", "title": "Drill Machine", "price": 500 }],
    "metadata": { "lender_id": "user-456" }
  }
  ```
- **Response**:
  ```json
  {
    "clientSecret": "pi_3M..._secret_...",
    "orderId": "550e8400-e29b-41d4-a716-446655440000",
    "paymentIntentId": "pi_3M..."
  }
  ```

### 2. `payment-webhook`
- **Path**: `supabase/functions/payment-webhook`
- **Method**: `POST`
- **Headers**: `stripe-signature`
- **Events Handled**:
  - `payment_intent.succeeded` -> Updates `orders.status` to `'succeeded'`
  - `payment_intent.payment_failed` / `payment_intent.canceled` -> Updates `orders.status` to `'failed'`
  - `charge.refunded` -> Updates `orders.status` to `'refunded'`

---

## 🔐 Security & RLS Policies
- **Row Level Security**: Enabled on all tables.
- **Authenticated Access**: Users can only query or update their own orders (`auth.uid() = user_id`).
- **Service Role**: Edge functions perform administrative updates using `SUPABASE_SERVICE_ROLE_KEY`.
