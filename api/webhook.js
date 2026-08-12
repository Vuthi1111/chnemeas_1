import { getBot } from '../src/bot.js';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  // Security: Check for WEBHOOK_SECRET (optional header set by Telegram)
  const secret = request.headers['x-telegram-bot-api-secret-token'];
  if (process.env.WEBHOOK_SECRET && secret !== process.env.WEBHOOK_SECRET) {
    console.error('Unauthorized webhook attempt');
    return response.status(403).json({ error: 'Unauthorized' });
  }

  try {
    const bot = getBot();
    // Telegraf's handleUpdate handles the incoming Telegram JSON payload
    await bot.handleUpdate(request.body);
    return response.status(200).send('OK');
  } catch (error) {
    console.error('Webhook error:', error);
    return response.status(500).send('Internal server error');
  }
}
