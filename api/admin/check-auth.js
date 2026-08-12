import { getPool } from '../../src/db.js';

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const chatId = request.query.chat_id;
  if (!chatId) {
    return response.status(400).json({ error: 'Missing chat_id' });
  }

  const ownerId = process.env.ADMIN_CHAT_ID;
  if (ownerId && String(chatId) === String(ownerId)) {
    return response.status(200).json({ isAdmin: true, isOwner: true });
  }

  try {
    const pool = getPool();
    const result = await pool.query(
      'SELECT 1 FROM admins WHERE telegram_chat_id = $1',
      [chatId],
    );
    if (result.rows.length > 0) {
      return response.status(200).json({ isAdmin: true, isOwner: false });
    }
    return response.status(200).json({ isAdmin: false });
  } catch (error) {
    console.error('Auth check error:', error);
    return response.status(500).json({ error: 'Internal server error' });
  }
}
