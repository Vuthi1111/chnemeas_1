-- Migration: Add admin_chat_id to customer_pending_actions for admin cancel flow

ALTER TABLE customer_pending_actions
ADD COLUMN IF NOT EXISTS admin_chat_id BIGINT;
