import sharp from 'sharp';
import { getPool } from '../src/db.js';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const { menuItemId, image, chatId } = request.body;

  if (!menuItemId || !image || !chatId) {
    return response.status(400).json({ error: 'Missing required fields: menuItemId, image, chatId' });
  }

  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

    const pool = getPool();

    // Fetch the old photo_url so we can clean up the previous file
    const oldResult = await pool.query('SELECT photo_url FROM menu_items WHERE id = $1', [menuItemId]);
    const oldPhotoUrl = oldResult.rows[0]?.photo_url;

    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Convert to WebP (~30% smaller than JPEG at similar quality)
    const webpBuffer = await sharp(buffer)
      .webp({ quality: 80 })
      .toBuffer();

    const fileName = `menu-item-${menuItemId}-${Date.now()}.webp`;
    const bucketName = 'menu-photos';

    // Upload new photo (WebP format)
    const uploadRes = await fetch(
      `${supabaseUrl}/storage/v1/object/${bucketName}/${fileName}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'image/webp',
        },
        body: webpBuffer,
      },
    );

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      console.error('Supabase upload failed:', uploadRes.status, errText);
      return response.status(502).json({ error: 'Failed to upload image to storage' });
    }

    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${fileName}`;

    // Delete the old photo from storage (if any)
    if (oldPhotoUrl) {
      const oldFileName = oldPhotoUrl.split('/').pop();
      try {
        await fetch(
          `${supabaseUrl}/storage/v1/object/${bucketName}/${oldFileName}`,
          { method: 'DELETE', headers: { 'Authorization': `Bearer ${supabaseKey}` } },
        );
      } catch (deleteErr) {
        console.error('Failed to delete old photo (non-fatal):', deleteErr.message);
      }
    }

    await pool.query(
      'UPDATE menu_items SET photo_url = $1 WHERE id = $2',
      [publicUrl, menuItemId],
    );

    return response.status(200).json({ photoUrl: publicUrl });
  } catch (error) {
    console.error('Upload photo error:', error);
    return response.status(500).json({ error: error.message || 'Internal server error' });
  }
}
