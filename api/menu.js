import { getPool } from '../src/db.js';

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const pool = getPool();
    const result = await pool.query(
      `SELECT c.id AS category_id, c.name AS category_name,
              c.name_km AS category_name_km, c.name_zh AS category_name_zh,
              m.id, m.name, m.name_km, m.name_zh,
              m.description, m.description_km, m.description_zh,
              m.photo_url,
              (m.photo_file_id IS NOT NULL OR m.photo_url IS NOT NULL) AS has_photo
       FROM categories c
       LEFT JOIN menu_items m ON m.category_id = c.id
         AND m.is_available = true
       WHERE c.is_active = true
       ORDER BY c.sort_order, c.id, m.sort_order, m.id`,
    );

    const itemIds = result.rows.filter(r => r.id !== null).map(r => r.id);
    let variants = [];
    if (itemIds.length) {
      const variantResult = await pool.query(
        `SELECT id, menu_item_id, name, name_km, name_zh, price, is_weight_based, sort_order
           FROM menu_item_variants
          WHERE menu_item_id = ANY($1)
          ORDER BY sort_order, id`,
        [itemIds],
      );
      variants = variantResult.rows;
    }

    const variantsByItem = {};
    for (const v of variants) {
      if (!variantsByItem[v.menu_item_id]) variantsByItem[v.menu_item_id] = [];
      variantsByItem[v.menu_item_id].push({
        id: v.id,
        name: v.name,
        name_km: v.name_km,
        name_zh: v.name_zh,
        price: Number(v.price),
        isWeightBased: v.is_weight_based,
      });
    }

    const categories = [];
    for (const row of result.rows) {
      let category = categories.at(-1);
      if (!category || category.id !== row.category_id) {
        category = {
          id: row.category_id,
          name: row.category_name,
          name_km: row.category_name_km,
          name_zh: row.category_name_zh,
          items: [],
        };
        categories.push(category);
      }
      if (row.id !== null) {
        const itemVariants = variantsByItem[row.id] || [];
        category.items.push({
          id: row.id,
          name: row.name,
          name_km: row.name_km,
          name_zh: row.name_zh,
          description: row.description,
          description_km: row.description_km,
          description_zh: row.description_zh,
          price: itemVariants.length ? itemVariants[0].price : 0,
          photoUrl: row.photo_url,
          hasPhoto: row.has_photo,
          variants: itemVariants,
        });
      }
    }

    return response.status(200).json({ categories });
  } catch (error) {
    console.error('Menu API error:', error);
    return response.status(500).json({ error: 'Internal server error' });
  }
}
