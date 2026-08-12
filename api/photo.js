import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { getPool } from '../src/db.js';

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const id = Number(request.query.id);
  if (!id) {
    return response.status(400).send('Missing or invalid menu item ID');
  }

  try {
    const pool = getPool();
    const result = await pool.query(
      'SELECT photo_file_id, photo_url FROM menu_items WHERE id = $1 AND is_available = true',
      [id],
    );
    const photo = result.rows[0];

    if (photo?.photo_url) {
      if (photo.photo_url.startsWith('http')) {
        return response.redirect(302, photo.photo_url);
      }
      const assetPath = join(process.cwd(), 'public', photo.photo_url.replace(/^\//, ''));
      try {
        const body = await readFile(assetPath);
        response.setHeader('Content-Type', 'image/jpeg');
        response.setHeader('Cache-Control', 'public, max-age=86400');
        return response.status(200).send(body);
      } catch (err) {
        console.error('Failed to read local photo:', err);
        return response.status(404).send('Local photo file not found');
      }
    }

    const fileId = photo?.photo_file_id;
    if (!fileId) {
      return response.status(404).send('Photo not found');
    }

    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${process.env.BOT_TOKEN}/getFile?file_id=${encodeURIComponent(fileId)}`,
    );
    const telegramPayload = await telegramResponse.json();
    if (!telegramPayload.ok || !telegramPayload.result?.file_path) {
      return response.status(502).send('Telegram photo unavailable');
    }

    const imageResponse = await fetch(
      `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${telegramPayload.result.file_path}`,
    );
    if (!imageResponse.ok) {
      return response.status(502).send('Telegram photo unavailable');
    }

    response.setHeader('Content-Type', imageResponse.headers.get('content-type') || 'image/jpeg');
    response.setHeader('Cache-Control', 'public, max-age=86400');
    return response.status(200).send(Buffer.from(await imageResponse.arrayBuffer()));

  } catch (error) {
    console.error('Photo API error:', error);
    return response.status(500).send('Internal server error');
  }
}
