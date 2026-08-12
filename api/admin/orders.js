import { getPool } from '../../src/db.js';
import { getBot, loadOrder, formatCustomerReceipt } from '../../src/bot.js';
import { Markup } from 'telegraf';
import { t, getUserLanguage, supportedLanguages } from '../../src/i18n.js';

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

    const status = request.query.status || null;

    try {
      let query = `
        SELECT o.id, o.customer_id, o.fulfillment, o.address,
               to_char(o.pickup_time, 'YYYY-MM-DD HH24:MI:SS') AS pickup_time,
               o.customer_remark, o.status, o.total, o.payment_status,
               o.payment_method, o.cancel_reason, o.created_at, o.updated_at,
               c.telegram_chat_id, c.telegram_username, c.full_name,
               COALESCE(
                 json_agg(
                   json_build_object(
                     'id', oi.id,
                     'name', mi.name,
                     'variant_name', mv.name,
                     'quantity', oi.quantity,
                     'unit_price', oi.unit_price,
                     'line_total', oi.line_total
                   ) ORDER BY oi.id
                 ) FILTER (WHERE oi.id IS NOT NULL),
                 '[]'::json
               ) AS items
          FROM orders o
          JOIN customers c ON c.id = o.customer_id
          LEFT JOIN order_items oi ON oi.order_id = o.id
          LEFT JOIN menu_items mi ON mi.id = oi.menu_item_id
          LEFT JOIN menu_item_variants mv ON mv.id = oi.variant_id
      `;

      const params = [];
      if (status) {
        query += ` WHERE o.status = $1`;
        params.push(status);
      }

      query += ` GROUP BY o.id, c.telegram_chat_id, c.telegram_username, c.full_name
                  ORDER BY o.created_at DESC LIMIT 50`;

      const result = await pool.query(query, params);

      return response.status(200).json({ orders: result.rows.map(formatOrder) });
    } catch (error) {
      console.error('Admin orders GET error:', error);
      return response.status(500).json({ error: 'Internal server error' });
    }
  }

  if (request.method === 'POST') {
    const { action, chatId, orderId, ...data } = request.body;
    if (!chatId || !action) return response.status(400).json({ error: 'Missing required fields' });

    const ownerId = process.env.ADMIN_CHAT_ID;
    const isOwner = ownerId && String(chatId) === String(ownerId);
    let isAdmin = isOwner;
    if (!isAdmin) {
      const authResult = await pool.query('SELECT 1 FROM admins WHERE telegram_chat_id = $1', [chatId]);
      isAdmin = authResult.rows.length > 0;
    }
    if (!isAdmin) return response.status(403).json({ error: 'Not authorized' });

    try {
      switch (action) {
        case 'approve': {
          const result = await pool.query(
            `UPDATE orders SET status = 'approved', updated_at = now() WHERE id = $1 AND status = 'pending_approval' RETURNING id, customer_id`,
            [orderId],
          );
          if (!result.rows.length) return response.status(400).json({ error: 'Order already processed' });

          // Send success response immediately
          response.status(200).json({ success: true, status: 'approved' });

          // Notify customer (non-blocking)
          notifyCustomerApproved(orderId, result.rows[0].customer_id).catch(err =>
            console.error('Failed to notify customer on approve:', err)
          );
          return;
        }

        case 'reject': {
          const result = await pool.query(
            `UPDATE orders SET status = 'rejected', updated_at = now() WHERE id = $1 AND status = 'pending_approval' RETURNING id, customer_id`,
            [orderId],
          );
          if (!result.rows.length) return response.status(400).json({ error: 'Order already processed' });

          response.status(200).json({ success: true, status: 'rejected' });

          notifyCustomerStatus(orderId, result.rows[0].customer_id, 'rejected_notification').catch(err =>
            console.error('Failed to notify customer on reject:', err)
          );
          return;
        }

        case 'mark_paid': {
          const result = await pool.query(
            `UPDATE orders SET status = 'paid', payment_status = 'paid', updated_at = now() WHERE id = $1 AND status = 'approved' RETURNING id, customer_id`,
            [orderId],
          );
          if (!result.rows.length) return response.status(400).json({ error: 'Order already processed' });

          response.status(200).json({ success: true, status: 'paid' });

          notifyCustomerStatus(orderId, result.rows[0].customer_id, 'paid_notification').catch(err =>
            console.error('Failed to notify customer on mark_paid:', err)
          );
          return;
        }

        case 'start_preparing': {
          const result = await pool.query(
            `UPDATE orders SET status = 'preparing', updated_at = now() WHERE id = $1 AND status = 'paid' RETURNING id, customer_id`,
            [orderId],
          );
          if (!result.rows.length) return response.status(400).json({ error: 'Order already processed' });

          response.status(200).json({ success: true, status: 'preparing' });

          notifyCustomerStatus(orderId, result.rows[0].customer_id, 'preparing_notification').catch(err =>
            console.error('Failed to notify customer on start_preparing:', err)
          );
          return;
        }

        case 'mark_ready': {
          const result = await pool.query(
            `UPDATE orders SET status = 'ready', updated_at = now() WHERE id = $1 AND status = 'preparing' RETURNING id, customer_id`,
            [orderId],
          );
          if (!result.rows.length) return response.status(400).json({ error: 'Order already processed' });

          response.status(200).json({ success: true, status: 'ready' });

          notifyCustomerStatus(orderId, result.rows[0].customer_id, 'ready_notification').catch(err =>
            console.error('Failed to notify customer on mark_ready:', err)
          );
          return;
        }

        case 'mark_fulfilled': {
          const result = await pool.query(
            `UPDATE orders SET status = 'fulfilled', updated_at = now() WHERE id = $1 AND status = 'ready' RETURNING id, customer_id`,
            [orderId],
          );
          if (!result.rows.length) return response.status(400).json({ error: 'Order already processed' });

          response.status(200).json({ success: true, status: 'fulfilled' });

          notifyCustomerStatus(orderId, result.rows[0].customer_id, 'fulfilled_notification').catch(err =>
            console.error('Failed to notify customer on mark_fulfilled:', err)
          );
          return;
        }

        default:
          return response.status(400).json({ error: `Unknown action: ${action}` });
      }
    } catch (error) {
      console.error('Admin orders POST error:', error);
      return response.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  return response.status(405).json({ error: 'Method not allowed' });
}

function formatOrder(order) {
  return {
    ...order,
    total: Number(order.total),
    items: order.items.map(i => ({
      ...i,
      quantity: Number(i.quantity),
      unit_price: Number(i.unit_price),
      line_total: Number(i.line_total),
    })),
  };
}

// ─── Helper: send a translated status notification to the customer ───
async function notifyCustomerStatus(orderId, customerId, notificationKey) {
  const pool = getPool();
  const custResult = await pool.query(
    'SELECT telegram_chat_id, language_code FROM customers WHERE id = $1',
    [customerId],
  );
  if (!custResult.rows.length) return;
  const { telegram_chat_id: chatId, language_code: lang } = custResult.rows[0];
  const userLang = supportedLanguages.includes(lang) ? lang : 'en';
  const bot = getBot();
  await bot.telegram.sendMessage(chatId, t(notificationKey, userLang));
}

// ─── Helper: notify customer that their order was approved (sends receipt) ───
async function notifyCustomerApproved(orderId, customerId) {
  const pool = getPool();
  const custResult = await pool.query(
    'SELECT telegram_chat_id, language_code FROM customers WHERE id = $1',
    [customerId],
  );
  if (!custResult.rows.length) return;
  const { telegram_chat_id: chatId, language_code: lang } = custResult.rows[0];
  const userLang = supportedLanguages.includes(lang) ? lang : 'en';
  const bot = getBot();
  const fullOrder = await loadOrder(orderId);
  await bot.telegram.sendMessage(
    chatId,
    formatCustomerReceipt(fullOrder, userLang),
    Markup.inlineKeyboard([
      [Markup.button.callback(t('proceed_to_pay', userLang), `pay_order:${orderId}`),
       Markup.button.callback(t('cancel_order', userLang), `customer_cancel:${orderId}`)],
    ]),
  );
}
