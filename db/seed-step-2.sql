-- Step 2 test menu data.
-- Replace each REPLACE_WITH_TELEGRAM_FILE_ID value with a real Telegram file_id
-- before running this script in Supabase SQL Editor.
-- To obtain a file_id, send a photo to the bot, then inspect the bot update/log.

INSERT INTO categories (name, sort_order, is_active)
SELECT 'Rice Dishes', 1, true
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Rice Dishes');

INSERT INTO categories (name, sort_order, is_active)
SELECT 'Drinks', 2, true
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Drinks');

INSERT INTO menu_items (category_id, name, description, price, photo_file_id, sort_order, is_available)
SELECT c.id, 'Chicken Rice', 'Steamed rice with grilled chicken.', 4.50, 'REPLACE_WITH_TELEGRAM_FILE_ID', 1, true
FROM categories c
WHERE c.name = 'Rice Dishes'
  AND NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Chicken Rice');

INSERT INTO menu_items (category_id, name, description, price, photo_file_id, sort_order, is_available)
SELECT c.id, 'Beef Fried Rice', 'Fried rice with beef and vegetables.', 5.50, 'REPLACE_WITH_TELEGRAM_FILE_ID', 2, true
FROM categories c
WHERE c.name = 'Rice Dishes'
  AND NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Beef Fried Rice');

INSERT INTO menu_items (category_id, name, description, price, photo_file_id, sort_order, is_available)
SELECT c.id, 'Iced Tea', 'Cold black tea with lemon.', 1.50, 'REPLACE_WITH_TELEGRAM_FILE_ID', 1, true
FROM categories c
WHERE c.name = 'Drinks'
  AND NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Iced Tea');
