import { getPool } from '../src/db.js';
import { notifyAdminOfOrder } from '../src/bot.js';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const client = await getPool().connect();
  try {
    const { fulfillment, address, pickupTime, confirmedPickupTime, customerRemark, items, initData, telegramUserId, clientChatId, phone } = request.body;
    const normalizedRemark = typeof customerRemark === 'string'
      ? customerRemark.trim().slice(0, 500)
      : '';

    // Validate required fields
    if (!fulfillment || !items || items.length === 0) {
      return response.status(400).json({ error: 'Missing required fields' });
    }

    if (fulfillment === 'delivery' && !address) {
      return response.status(400).json({ error: 'Address required for delivery' });
    }

    if (fulfillment === 'pickup' && !pickupTime) {
      return response.status(400).json({ error: 'Pickup time required' });
    }

    // Parse Telegram initData to get customer
    let telegramChatId = null;
    if (initData) {
      try {
        const params = new URLSearchParams(initData);
        const user = JSON.parse(params.get('user') || '{}');
        telegramChatId = user.id;
      } catch (e) {
        console.warn('Failed to parse Telegram initData:', e);
      }
    }

    // Fallback: use telegramUserId from initDataUnsafe when initData lacks user
    if (!telegramChatId && telegramUserId) {
      telegramChatId = telegramUserId;
    }

    // Fallback: use clientChatId from URL parameter (reply keyboard on unsupported clients)
    if (!telegramChatId && clientChatId) {
      telegramChatId = clientChatId;
    }

    if (!telegramChatId) {
      return response.status(401).json({ error: 'Telegram identity required' });
    }

    // Start transaction
    await client.query('BEGIN');

    // Get customer by telegram_chat_id
    const customerResult = await client.query(
      'SELECT id FROM customers WHERE telegram_chat_id = $1',
      [telegramChatId],
    );

    if (customerResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return response.status(404).json({ error: 'Customer not found' });
    }

    const customerId = customerResult.rows[0].id;

    // Update phone number if provided
    if (phone && phone.trim()) {
      await client.query(
        'UPDATE customers SET phone = $1 WHERE id = $2',
        [phone.trim(), customerId],
      );
    }

    // Load variant prices
    const variantIds = items.map(item => item.variantId).filter(Boolean);
    let variantPriceMap = {};
    if (variantIds.length) {
      const variantResult = await client.query(
        'SELECT id, price FROM menu_item_variants WHERE id = ANY($1)',
        [variantIds],
      );
      variantPriceMap = Object.fromEntries(variantResult.rows.map(r => [r.id, Number(r.price)]));
    }

    // Recalculate total server-side
    let calculatedTotal = 0;
    for (const item of items) {
      const quantity = Number(item.quantity) || 1;
      let unitPrice;
      if (item.variantId) {
        unitPrice = variantPriceMap[item.variantId];
        if (!unitPrice) {
          await client.query('ROLLBACK');
          return response.status(400).json({ error: `Variant ${item.variantId} not found` });
        }
      } else {
        const menuResult = await client.query('SELECT price FROM menu_items WHERE id = $1', [item.menuItemId]);
        if (!menuResult.rows.length) {
          await client.query('ROLLBACK');
          return response.status(400).json({ error: `Menu item ${item.menuItemId} not found` });
        }
        unitPrice = Number(menuResult.rows[0].price);
      }
      item._unitPrice = unitPrice;
      calculatedTotal += unitPrice * quantity;
    }

    // confirmed_pickup_time stays NULL until the admin confirms the final
    // pickup time during order approval (Feature: admin-confirmed pickup time).
    const finalConfirmedTime = null;

    // Insert order
    const orderResult = await client.query(
      `INSERT INTO orders (customer_id, fulfillment, address, pickup_time, confirmed_pickup_time, customer_remark, status, subtotal, total, payment_method, payment_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING id`,
      [
        customerId,
        fulfillment,
        address || null,
        pickupTime || null,
        finalConfirmedTime,
        normalizedRemark || null,
        'pending_approval',
        calculatedTotal,
        calculatedTotal,
        'aba_qr',
        'unpaid',
      ],
    );

    const orderId = orderResult.rows[0].id;

    // Insert order items with server prices (single batch INSERT)
    const orderItemValues = items.map((item, i) => {
      const quantity = Number(item.quantity) || 1;
      const lineTotal = item._unitPrice * quantity;
      const offset = i * 6;
      return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6})`;
    });
    const orderItemParams = items.flatMap(item => {
      const quantity = Number(item.quantity) || 1;
      const lineTotal = item._unitPrice * quantity;
      return [orderId, item.menuItemId, item.variantId || null, quantity, item._unitPrice, lineTotal];
    });
    await client.query(
      `INSERT INTO order_items (order_id, menu_item_id, variant_id, quantity, unit_price, line_total)
       VALUES ${orderItemValues.join(', ')}`,
      orderItemParams,
    );

    // Commit transaction before sending notifications.
    await client.query('COMMIT');

    try {
      await notifyAdminOfOrder(orderId);
    } catch (notificationError) {
      console.error('Admin notification failed:', notificationError);
    }

    return response.status(201).json({ 
      orderId,
    });
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      console.error('Rollback error:', rollbackError);
    }
    console.error('Checkout error:', error);
    return response.status(500).json({ error: error.message || 'Internal server error' });
  } finally {
    client.release();
  }
}
