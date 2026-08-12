CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS menu_items (
  id SERIAL PRIMARY KEY,
  category_id INT REFERENCES categories(id),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  photo_file_id TEXT,
  is_available BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  telegram_chat_id BIGINT UNIQUE NOT NULL,
  telegram_username TEXT,
  full_name TEXT,
  phone TEXT,
  default_address TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  customer_id INT REFERENCES customers(id),
  fulfillment TEXT CHECK (fulfillment IN ('pickup','delivery')) NOT NULL,
  address TEXT,
  pickup_time TIMESTAMP,
  customer_remark TEXT,
  status TEXT CHECK (status IN (
    'pending_approval','approved','paid','preparing','ready','fulfilled','cancelled','rejected'
  )) DEFAULT 'pending_approval',
  subtotal DECIMAL(10,2) NOT NULL,
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('aba_qr')) DEFAULT 'aba_qr',
  payment_status TEXT CHECK (payment_status IN ('unpaid','paid','failed')) DEFAULT 'unpaid',
  aba_transaction_id TEXT,
  cancel_reason TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS customer_pending_actions (
  id SERIAL PRIMARY KEY,
  customer_id INT REFERENCES customers(id),
  admin_chat_id BIGINT,
  action TEXT NOT NULL,
  order_id INT NOT NULL REFERENCES orders(id),
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INT REFERENCES orders(id),
  menu_item_id INT REFERENCES menu_items(id),
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  line_total DECIMAL(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS carts (
  id SERIAL PRIMARY KEY,
  customer_id INT REFERENCES customers(id),
  menu_item_id INT REFERENCES menu_items(id),
  quantity INT NOT NULL,
  updated_at TIMESTAMP DEFAULT now()
);
