-- Run db/migrate-photo-url.sql first.

INSERT INTO categories (name, sort_order, is_active)
SELECT 'Example Meals', 1, true
WHERE NOT EXISTS (
  SELECT 1 FROM categories WHERE name = 'Example Meals'
);

INSERT INTO menu_items (
  category_id,
  name,
  description,
  price,
  photo_url,
  sort_order,
  is_available
)
SELECT
  c.id,
  'Example Meal',
  'A sample meal for testing the Telegram Web App.',
  4.50,
  '/assets/example-meal.jpg',
  1,
  true
FROM categories c
WHERE c.name = 'Example Meals'
  AND NOT EXISTS (
    SELECT 1 FROM menu_items WHERE name = 'Example Meal'
  );
