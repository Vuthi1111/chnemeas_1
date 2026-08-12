-- Migration: Add customer_pending_actions table and cancel_reason column

CREATE TABLE IF NOT EXISTS customer_pending_actions (
  id SERIAL PRIMARY KEY,
  customer_id INT NOT NULL REFERENCES customers(id),
  action TEXT NOT NULL,
  order_id INT NOT NULL REFERENCES orders(id),
  created_at TIMESTAMP DEFAULT now()
);

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS cancel_reason TEXT;
