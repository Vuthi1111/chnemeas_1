import { getPool } from '../src/db.js';

export default async function handler(request, response) {
  const pool = getPool();

  // GET — fetch the customer's saved language
  if (request.method === 'GET') {
    const chatId = request.query.chat_id;
    if (!chatId) {
      return response.status(400).json({ error: 'chat_id is required' });
    }

    try {
      const result = await pool.query(
        'SELECT language_code FROM customers WHERE telegram_chat_id = $1',
        [chatId],
      );
      const lang = result.rows[0]?.language_code;
      if (['en', 'km', 'zh'].includes(lang)) {
        response.json({ lang });
      } else {
        response.json({ lang: 'en' });
      }
    } catch (error) {
      console.error('Failed to fetch user language:', error);
      response.json({ lang: 'en' });
    }
    return;
  }

  // POST — persist the language chosen in the web app so Telegram
  // notifications (receipts, status updates) match the web app language.
  if (request.method === 'POST') {
    const { chat_id: chatId, lang } = request.body || {};
    if (!chatId) {
      return response.status(400).json({ error: 'chat_id is required' });
    }
    if (!['en', 'km', 'zh'].includes(lang)) {
      return response.status(400).json({ error: 'Invalid language' });
    }

    try {
      await pool.query(
        `INSERT INTO customers (telegram_chat_id, language_code, created_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (telegram_chat_id)
         DO UPDATE SET language_code = EXCLUDED.language_code`,
        [chatId, lang],
      );
      return response.status(200).json({ ok: true, lang });
    } catch (error) {
      console.error('Failed to save user language:', error);
      return response.status(500).json({ error: 'Failed to save language' });
    }
  }

  return response.status(405).json({ error: 'Method not allowed' });
}
