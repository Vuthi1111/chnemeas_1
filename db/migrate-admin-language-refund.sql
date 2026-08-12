-- Migration: Admin language support and refund tracking for paid cancellations
-- The `language_code` column already exists on `admins` table.
-- This adds refund_status to orders for tracking after-payment cancellations.

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS refund_status TEXT DEFAULT 'none';

-- Note: refund_status values: 'none' (default), 'pending' (cancel approved, refund due),
--       'refunded' (refund completed manually via ABA dashboard)
