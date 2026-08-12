import { getPool } from '../src/db.js';
import { getBot, loadOrder, notifyAllAdmins, localizedItemName } from '../src/bot.js';
import { Markup } from 'telegraf';
import { t } from '../src/i18n.js';

// Format "YYYY-MM-DD HH:mm:ss" (Phnom Penh wall-clock) as-is, no timezone shifts.
function formatLiteralTime(value) {
  if (!value) return 'ASAP';
  const [datePart, timePart] = value.split(' ');
  const [year, month, day] = datePart.split('-');
  const [hour, min, sec] = timePart.split(':');
  const d = new Date(Date.UTC(year, month - 1, day, hour, min, sec));
  return d.toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'UTC',
  });
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { aba_transaction_id, status } = request.body;

    if (!aba_transaction_id || !status) {
      return response.status(400).json({ error: 'Missing required fields' });
    }

    const pool = getPool();

    const orderResult = await pool.query(
      'SELECT id, payment_status, status FROM orders WHERE aba_transaction_id = $1',
      [aba_transaction_id],
    );

    if (orderResult.rows.length === 0) {
      return response.status(404).json({ error: 'Order not found' });
    }

    const order = orderResult.rows[0];

    if (order.payment_status !== 'unpaid') {
      return response.status(200).json({ message: 'Payment already processed' });
    }

    let paymentStatus = 'failed';
    if (status === 'success' || status === 'completed') {
      paymentStatus = 'paid';
    }

    await pool.query(
      'UPDATE orders SET payment_status = $1, status = CASE WHEN $1 = \'paid\' THEN \'paid\' ELSE status END, updated_at = now() WHERE id = $2',
      [paymentStatus, order.id],
    );

    if (paymentStatus === 'paid') {
      try {
        const fullOrder = await loadOrder(order.id);

        const customer = fullOrder.full_name
          || (fullOrder.telegram_username ? `@${fullOrder.telegram_username}` : 'Telegram customer');
        const displayTime = fullOrder.confirmed_pickup_time || fullOrder.pickup_time;

        // Notify ALL admins with language-aware message + buttons
        await notifyAllAdmins(
          (lang) => {
            const fulfillment = fullOrder.fulfillment === 'delivery'
              ? `${t('fulfillment_delivery', lang)}\nAddress: ${fullOrder.address || t('address_not_provided', lang)}`
              : `${t('fulfillment_pickup', lang)}\nTime: ${formatLiteralTime(displayTime)}`;
            const itemLines = fullOrder.items
              .map((item) => `- ${localizedItemName(item, lang)} x${item.quantity} = $${Number(item.line_total).toFixed(2)}`)
              .join('\n');
            const instructions = fullOrder.customer_remark || t('special_none', lang);

            return t('payment_received_admin', lang, fullOrder.id, customer, fulfillment, itemLines, instructions, Number(fullOrder.total));
          },
          (lang) =>
            Markup.inlineKeyboard([
              [
                Markup.button.callback(t('start_preparing', lang), `start_preparing:${fullOrder.id}`),
                Markup.button.callback(t('cancel_order', lang), `cancel_order:${fullOrder.id}`),
              ],
            ]),
        );
      } catch (err) {
        console.error('Failed to send admin payment notification:', err);
      }
    }

    return response.status(200).json({ message: 'Payment processed', orderId: order.id });
  } catch (error) {
    console.error('Payment callback error:', error);
    return response.status(500).json({ error: 'Internal server error' });
  }
}
