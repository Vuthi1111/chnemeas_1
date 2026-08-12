import 'dotenv/config';

async function setupWebhook() {
  const token = process.env.BOT_TOKEN;
  const webAppUrl = process.env.WEB_APP_URL;

  if (!token) throw new Error('BOT_TOKEN is missing');
  if (!webAppUrl) throw new Error('WEB_APP_URL is missing. Please set it to your Vercel deployment URL.');

  // The webhook endpoint we created in api/webhook.js
  const webhookUrl = `${webAppUrl.replace(/\/$/, '')}/api/webhook`;

  console.log(`Setting Telegram webhook to: ${webhookUrl}`);

  const response = await fetch(`https://api.telegram.org/bot${token}/setWebhook?url=${encodeURIComponent(webhookUrl)}`);
  const data = await response.json();

  if (data.ok) {
    console.log('✅ Webhook set successfully!');
  } else {
    console.error('❌ Failed to set webhook:', data);
  }
}

setupWebhook().catch(console.error);
