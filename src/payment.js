import crypto from 'crypto';

export async function generateABAPayWayQR(orderId, amount) {
  const merchantId = process.env.ABA_MERCHANT_ID;
  const publicKey = process.env.ABA_PUBLIC_KEY;
  const apiUrl = process.env.ABA_API_URL || 'https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/payments/generate-qr';

  if (!merchantId || !publicKey) {
    throw new Error('ABA credentials not configured');
  }

  const now = new Date();
  const reqTime = now.toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
  const tranId = `${orderId}-${Date.now()}`;

  const itemsData = Buffer.from(
    JSON.stringify([
      {
        name: `Order #${orderId}`,
        quantity: 1,
        price: amount,
      },
    ]),
  ).toString('base64');

  const callbackUrl = `${process.env.WEB_APP_URL}/api/payment-callback`;
  const callbackUrlBase64 = Buffer.from(callbackUrl).toString('base64');

  const hashData = [
    String(reqTime),
    String(merchantId),
    String(tranId),
    String(amount),
    String(itemsData),
    '',
    '',
    '',
    '',
    'purchase',
    'abapay_khqr',
    String(callbackUrlBase64),
    '',
    'USD',
    '',
    '',
    '',
    String('30'),
    'template3_color',
  ].join('');

  const hash = crypto
    .createHmac('sha512', publicKey)
    .update(hashData)
    .digest('base64');

  const payload = {
    req_time: reqTime,
    merchant_id: merchantId,
    tran_id: tranId,
    amount: Number(amount),
    items: itemsData,
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    purchase_type: 'purchase',
    payment_option: 'abapay_khqr',
    callback_url: callbackUrlBase64,
    return_deeplink: '',
    currency: 'USD',
    custom_fields: '',
    return_params: '',
    payout: '',
    lifetime: 30,
    qr_image_template: 'template3_color',
    hash,
  };

  console.log('ABA Payload:', JSON.stringify({
    ...payload,
    items: payload.items.slice(0, 20) + '...',
    callback_url: payload.callback_url.slice(0, 20) + '...',
    hash: hash.slice(0, 20) + '...',
  }, null, 2));

  const abaResponse = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const abaText = await abaResponse.text();
  let abaData;
  try {
    abaData = JSON.parse(abaText);
  } catch (error) {
    console.error('ABA Response is not JSON:', abaText);
    throw new Error(`ABA returned invalid JSON: ${abaText.substring(0, 500)}`);
  }

  console.log('ABA Full Response:', JSON.stringify(abaData, null, 2));

  if (abaData.status?.code !== '0') {
    const errorMsg = abaData.status?.message || 'Unknown error';
    const errorCode = abaData.status?.code || 'UNKNOWN';
    const traceId = abaData.status?.trace_id || 'NO_TRACE_ID';
    const errors = abaData.status?.errors || {};

    console.error('ABA Error Details:', {
      code: errorCode,
      message: errorMsg,
      traceId,
      errors,
      fullResponse: abaData,
    });

    throw new Error(`ABA error: ${errorMsg} (code: ${errorCode}, trace: ${traceId})`);
  }

  const transactionId = abaData.tran_id || abaData.status?.tran_id || tranId;

  if (!transactionId) {
    throw new Error('ABA response did not include a transaction ID');
  }

  return {
    qrImage: abaData.qrImage.replace(/^data:image\/png;base64,/, ''),
    transactionId,
  };
}
