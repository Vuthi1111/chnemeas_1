import { getPool } from '../../src/db.js';

export default async function handler(request, response) {
  const pool = getPool();

  if (request.method === 'GET') {
    const chatId = request.query.chat_id;
    if (!chatId) return response.status(401).json({ error: 'Missing chat_id' });

    const ownerId = process.env.ADMIN_CHAT_ID;
    const isOwner = ownerId && String(chatId) === String(ownerId);
    let isAdmin = isOwner;
    if (!isAdmin) {
      const authResult = await pool.query('SELECT 1 FROM admins WHERE telegram_chat_id = $1', [chatId]);
      isAdmin = authResult.rows.length > 0;
    }
    if (!isAdmin) return response.status(403).json({ error: 'Not authorized' });

    try {
      const categoriesResult = await pool.query(
        'SELECT id, name, name_km, name_zh, sort_order, is_active FROM categories ORDER BY sort_order, id',
      );

      const itemsResult = await pool.query(
        `SELECT id, category_id, name, name_km, name_zh,
                description, description_km, description_zh,
                price, photo_url, is_available, sort_order
           FROM menu_items ORDER BY sort_order, id`,
      );

      const itemIds = itemsResult.rows.filter(r => r.id !== null).map(r => r.id);
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

      return response.status(200).json({
        categories: categoriesResult.rows,
        items: itemsResult.rows.map(i => ({ ...i, price: Number(i.price) })),
        variants: variants.map(v => ({ ...v, price: Number(v.price) })),
      });
    } catch (error) {
      console.error('Admin menu GET error:', error);
      return response.status(500).json({ error: 'Internal server error' });
    }
  }

  if (request.method === 'POST') {
    const { action, chatId, ...data } = request.body;

    if (!chatId) {
      return response.status(401).json({ error: 'Not authenticated' });
    }

    const ownerId = process.env.ADMIN_CHAT_ID;
    const isOwner = ownerId && String(chatId) === String(ownerId);
    let isAdmin = isOwner;
    if (!isAdmin) {
      const result = await pool.query('SELECT 1 FROM admins WHERE telegram_chat_id = $1', [chatId]);
      isAdmin = result.rows.length > 0;
    }
    if (!isAdmin) {
      return response.status(403).json({ error: 'Not authorized' });
    }

    try {
      switch (action) {
        case 'create_category': {
          const { name, nameKm, nameZh, sortOrder } = data;
          const maxSort = await pool.query('SELECT COALESCE(MAX(sort_order), 0) + 1 AS next FROM categories');
          const result = await pool.query(
            'INSERT INTO categories (name, name_km, name_zh, sort_order) VALUES ($1, $2, $3, $4) RETURNING id',
            [name, nameKm || null, nameZh || null, sortOrder ?? maxSort.rows[0].next],
          );
          return response.status(201).json({ id: result.rows[0].id });
        }

        case 'update_category': {
          const { id, name, nameKm, nameZh, sortOrder, isActive } = data;
          await pool.query(
            `UPDATE categories SET name = COALESCE($1, name), name_km = COALESCE($2, name_km),
                name_zh = COALESCE($3, name_zh), sort_order = COALESCE($4, sort_order),
                is_active = COALESCE($5, is_active) WHERE id = $6`,
            [name, nameKm || null, nameZh || null, sortOrder, isActive, id],
          );
          return response.status(200).json({ success: true });
        }

        case 'delete_category': {
          const { id } = data;
          // Single pass: delete variants of all items, then items, then category
          await pool.query(
            `DELETE FROM menu_item_variants WHERE menu_item_id IN (SELECT id FROM menu_items WHERE category_id = $1)`,
            [id],
          );
          await pool.query('DELETE FROM menu_items WHERE category_id = $1', [id]);
          await pool.query('DELETE FROM categories WHERE id = $1', [id]);
          return response.status(200).json({ success: true });
        }

        case 'create_item': {
          const { categoryId, name, nameKm, nameZh, description, descriptionKm, descriptionZh, price } = data;
          const maxSort = await pool.query(
            'SELECT COALESCE(MAX(sort_order), 0) + 1 AS next FROM menu_items WHERE category_id = $1',
            [categoryId],
          );
          const result = await pool.query(
            `INSERT INTO menu_items (category_id, name, name_km, name_zh, description, description_km, description_zh, price, sort_order)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
            [categoryId, name, nameKm || null, nameZh || null, description || null, descriptionKm || null, descriptionZh || null, price, maxSort.rows[0].next],
          );
          const itemId = result.rows[0].id;
          await pool.query(
            `INSERT INTO menu_item_variants (menu_item_id, name, price, sort_order)
             VALUES ($1, 'Regular', $2, 0)`,
            [itemId, price],
          );
          return response.status(201).json({ id: itemId });
        }

        case 'update_item': {
          const { id, categoryId, name, nameKm, nameZh, description, descriptionKm, descriptionZh, price, isAvailable, sortOrder } = data;
          await pool.query(
            `UPDATE menu_items
                SET category_id = COALESCE($1, category_id),
                    name = COALESCE($2, name),
                    name_km = COALESCE($3, name_km),
                    name_zh = COALESCE($4, name_zh),
                    description = COALESCE($5, description),
                    description_km = COALESCE($6, description_km),
                    description_zh = COALESCE($7, description_zh),
                    price = COALESCE($8, price),
                    is_available = COALESCE($9, is_available),
                    sort_order = COALESCE($10, sort_order)
              WHERE id = $11`,
            [categoryId, name, nameKm || null, nameZh || null, description, descriptionKm || null, descriptionZh || null, price, isAvailable, sortOrder, id],
          );
          return response.status(200).json({ success: true });
        }

        case 'delete_item': {
          const { id } = data;
          await pool.query('DELETE FROM menu_item_variants WHERE menu_item_id = $1', [id]);
          await pool.query('DELETE FROM menu_items WHERE id = $1', [id]);
          return response.status(200).json({ success: true });
        }

        case 'create_variant': {
          const { menuItemId, name, nameKm, nameZh, price, isWeightBased } = data;
          const maxSort = await pool.query(
            'SELECT COALESCE(MAX(sort_order), 0) + 1 AS next FROM menu_item_variants WHERE menu_item_id = $1',
            [menuItemId],
          );
          const result = await pool.query(
            `INSERT INTO menu_item_variants (menu_item_id, name, name_km, name_zh, price, is_weight_based, sort_order)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
            [menuItemId, name, nameKm || null, nameZh || null, price, isWeightBased || false, maxSort.rows[0].next],
          );
          return response.status(201).json({ id: result.rows[0].id });
        }

        case 'update_variant': {
          const { id, name, nameKm, nameZh, price, isWeightBased, sortOrder } = data;
          await pool.query(
            `UPDATE menu_item_variants
                SET name = COALESCE($1, name),
                    name_km = COALESCE($2, name_km),
                    name_zh = COALESCE($3, name_zh),
                    price = COALESCE($4, price),
                    is_weight_based = COALESCE($5, is_weight_based),
                    sort_order = COALESCE($6, sort_order)
              WHERE id = $7`,
            [name, nameKm || null, nameZh || null, price, isWeightBased, sortOrder, id],
          );
          return response.status(200).json({ success: true });
        }

        case 'delete_variant': {
          const { id } = data;
          await pool.query('DELETE FROM menu_item_variants WHERE id = $1', [id]);
          return response.status(200).json({ success: true });
        }

        case 'bulk_price_update': {
          const { categoryId, percentage } = data;
          const pct = parseFloat(percentage) / 100;
          await pool.query(
            `UPDATE menu_item_variants
             SET price = ROUND((price * (1 + $1))::numeric, 2)
             WHERE menu_item_id IN (SELECT id FROM menu_items WHERE category_id = $2)`,
            [pct, categoryId],
          );
          return response.status(200).json({ success: true });
        }


        case 'reorder_item': {
          const { id: itemId, direction, categoryId } = data;
          const itemResult = await pool.query(
            'SELECT sort_order, category_id FROM menu_items WHERE id = $1',
            [itemId],
          );
          if (!itemResult.rows.length) return response.status(404).json({ error: 'Item not found' });
          const itemSort = itemResult.rows[0].sort_order;
          const itemCat = itemResult.rows[0].category_id;
          let swapItem;
          if (direction === 'up') {
            swapItem = await pool.query(
              'SELECT id, sort_order FROM menu_items WHERE category_id = $1 AND sort_order < $2 ORDER BY sort_order DESC LIMIT 1',
              [itemCat, itemSort],
            );
          } else {
            swapItem = await pool.query(
              'SELECT id, sort_order FROM menu_items WHERE category_id = $1 AND sort_order > $2 ORDER BY sort_order ASC LIMIT 1',
              [itemCat, itemSort],
            );
          }
          if (!swapItem.rows.length) return response.status(400).json({ error: 'Cannot move further' });
          const swapItemId = swapItem.rows[0].id;
          const swapItemSort = swapItem.rows[0].sort_order;
          await pool.query('UPDATE menu_items SET sort_order = $1 WHERE id = $2', [swapItemSort, itemId]);
          await pool.query('UPDATE menu_items SET sort_order = $1 WHERE id = $2', [itemSort, swapItemId]);
          return response.status(200).json({ success: true });
        }

        default:
          return response.status(400).json({ error: `Unknown action: ${action}` });
      }
    } catch (error) {
      console.error('Admin menu POST error:', error);
      return response.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  return response.status(405).json({ error: 'Method not allowed' });
}
