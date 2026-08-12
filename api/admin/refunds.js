import { getPool } from '../../db.js';

export default async function handler(req, res) {
  const pool = getPool();
  const { chat_id, action, order_id, refund_note } = req.body || req.query;

  // Basic Auth Check
  if (!chat_id || String(chat_id) !== String(process.env.ADMIN_CHAT_ID)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    if (req.method === 'GET') {
      const result = await pool.query(
        `SELECT o.id, o.total, o.cancel_reason, o.refund_status, o.refunded_at, o.refund_note, c.full_name
         FROM orders o
         JOIN customers c ON c.id = o.customer_id
         WHERE o.refund_status IS NOT NULL AND o.refund_status != 'none'
         ORDER BY o.refunded_at DESC NULLS FIRST`
      );
      return res.json({ refunds: result.rows });
    }

    if (req.method === 'POST' && action === 'mark_refunded') {
      await pool.query(
        `UPDATE orders 
         SET refund_status = 'completed', refunded_at = now(), refund_note = $1 
         WHERE id = $2`,
        [refund_note || 'Manually marked refunded', order_id]
      );
      return res.json({ success: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Refunds API Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
