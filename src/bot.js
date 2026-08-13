import { Telegraf, Markup } from 'telegraf';
import { getPool } from './db.js';
import { generateABAPayWayQR } from './payment.js';
import { t, getUserLanguage, getAdminLanguage, setUserLanguage, setAdminLanguage, isLanguageSet, buildLanguageKeyboard, getLanguageName, supportedLanguages } from './i18n.js';

let bot;

// ─── Language middleware ───
// Attaches ctx.t(key, ...args) for translating user-facing strings
// and ctx.lang for the user's current language code.
bot = null; // will be set in getBot()

async function isAdminUser(chatId) {
  const ownerId = process.env.ADMIN_CHAT_ID;
  if (ownerId && String(chatId) === String(ownerId)) return true;
  try {
    const pool = getPool();
    const result = await pool.query('SELECT 1 FROM admins WHERE telegram_chat_id = $1', [chatId]);
    return result.rows.length > 0;
  } catch { return false; }
}

function customerWebUrl(chatId) {
  const webAppUrl = process.env.WEB_APP_URL || 'https://example.com';
  return chatId ? `${webAppUrl}?chat_id=${chatId}` : webAppUrl;
}

function customerReplyKeyboard(lang = 'en', chatId = '') {
  return Markup.keyboard([
    [Markup.button.webApp(t('open_menu', lang), customerWebUrl(chatId))],
    [Markup.button.text(t('my_orders', lang)), Markup.button.text(t('help', lang))],
    [Markup.button.text(t('settings', lang))],
  ]).resize().persistent();
}

function removeCustomerKeyboard() {
  return Markup.removeKeyboard();
}

/** Route user to the main menu: set chat menu button, send open_menu_prompt + reply keyboard */
async function routeToMenu(ctx) {
  try {
    await ctx.setChatMenuButton({
      type: 'web_app',
      text: 'Open Menu',
      web_app: { url: customerWebUrl(ctx.chat.id) },
    });
  } catch (_) {}

  await ctx.reply(
    ctx.t('open_menu_prompt'),
    Markup.inlineKeyboard([[Markup.button.webApp(ctx.t('menu_button'), customerWebUrl(ctx.chat.id))]]),
  );
  await ctx.reply(ctx.t('navigation_hint'), customerReplyKeyboard(ctx.lang, ctx.chat.id));
}

/**
 * Build a regex that matches any translation of a locale key.
 * Used with bot.hears() so button presses work in all languages.
 */
function hearAny(key) {
  const choices = supportedLanguages.map(l =>
    t(key, l).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  );
  return new RegExp(`^(${choices.join('|')})$`);
}

export function getBot() {
  if (bot) return bot;

  if (!process.env.BOT_TOKEN) {
    throw new Error('BOT_TOKEN is missing');
  }

  bot = new Telegraf(process.env.BOT_TOKEN);
  const webAppUrl = process.env.WEB_APP_URL || 'https://example.com';

  // ─── Language middleware: attach ctx.t() and ctx.lang ───
  bot.use(async (ctx, next) => {
    if (ctx.chat?.id) {
      ctx.lang = await getUserLanguage(ctx.chat.id);
      ctx.t = (key, ...args) => t(key, ctx.lang, ...args);
    } else {
      ctx.lang = 'en';
      ctx.t = (key, ...args) => t(key, 'en', ...args);
    }
    await next();
  });

  // ─── /start — merged welcome + language selection ───
  bot.start(async (ctx) => {
    try {
      const customerId = await ensureCustomer(ctx);

      // Dedup: if /start was processed within the last 10 seconds, skip duplicate
      const pool = getPool();
      const recent = await pool.query(
        `SELECT 1 FROM customers WHERE id = $1 AND last_start_at > NOW() - INTERVAL '10 seconds'`,
        [customerId],
      );
      if (recent.rows.length > 0) {
        console.log(`Dedup: skipping duplicate /start for chat ${ctx.chat.id}`);
        return;
      }
      await pool.query(
        `UPDATE customers SET last_start_at = NOW() WHERE id = $1`,
        [customerId],
      );

      // Remove any previous reply keyboard
      await ctx.reply('...', Markup.removeKeyboard()).then(m => ctx.deleteMessage(m.message_id).catch(() => {}));

      // If returning user (language already set), go straight to menu
      if (await isLanguageSet(ctx.chat.id)) {
        await routeToMenu(ctx);
        return;
      }

      // New user: ONE message with welcome + language buttons merged
      const welcomeName = ctx.from?.first_name || '';
      const startText = welcomeName
        ? `${ctx.t('welcome', welcomeName)}\n\n${ctx.t('language_prompt')}`
        : `${ctx.t('welcome')}\n\n${ctx.t('language_prompt')}`;

      await ctx.reply(startText, {
        reply_markup: { inline_keyboard: buildLanguageKeyboard('lang_set') },
      });
    } catch (error) {
      console.error('Failed to register customer:', error);
      await ctx.reply(ctx.t ? ctx.t('registration_failed') : t('registration_failed', 'en'));
    }
  });

  // ─── Language selection callback (from /start) — edit same message, then menu ───
  bot.action(/^lang_set:(.+)$/, async (ctx) => {
    const lang = ctx.match[1];
    if (!supportedLanguages.includes(lang)) {
      await ctx.answerCbQuery('Invalid language.', { show_alert: true });
      return;
    }
    await setUserLanguage(ctx.chat.id, lang);
    ctx.lang = lang;
    ctx.t = (key, ...args) => t(key, lang, ...args);

    // Edit the SAME message: keep the welcome text, remove buttons
    await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
    await ctx.answerCbQuery(ctx.t('language_set', getLanguageName(lang)));

    // Then route to menu (no separate welcome — it's already in the edited message)
    await routeToMenu(ctx);
  });

  // ─── Language change callback (from /language or Settings) ───
  bot.action(/^lang_change:(.+)$/, async (ctx) => {
    const lang = ctx.match[1];
    if (!supportedLanguages.includes(lang)) {
      await ctx.answerCbQuery('Invalid language.', { show_alert: true });
      return;
    }
    await setUserLanguage(ctx.chat.id, lang);
    ctx.lang = lang;
    ctx.t = (key, ...args) => t(key, lang, ...args);

    await ctx.answerCbQuery(ctx.t('language_changed', getLanguageName(lang)));
    await ctx.deleteMessage();
    await ctx.reply(ctx.t('language_changed', getLanguageName(lang)), customerReplyKeyboard(ctx.lang, ctx.chat.id));
  });

  // ─── /language — change language ───
  bot.command('language', async (ctx) => {
    await ctx.reply(ctx.t('language_choose'), {
      reply_markup: { inline_keyboard: buildLanguageKeyboard('lang_change') },
    });
  });

  bot.command('menu', async (ctx) => {
    await routeToMenu(ctx);
  });

  bot.hears(hearAny('open_menu'), async (ctx) => {
    await ensureCustomer(ctx);
    try {
      await ctx.setChatMenuButton({
        type: 'web_app',
        text: 'Open Menu',
        web_app: { url: customerWebUrl(ctx.chat.id) },
      });
    } catch (_) {}
    await ctx.reply(ctx.t('open_menu_prompt'), Markup.inlineKeyboard([[Markup.button.webApp(ctx.t('menu_button'), customerWebUrl(ctx.chat.id))]]));
  });

  bot.hears(hearAny('my_orders'), async (ctx) => {
    await sendCustomerOrders(ctx);
  });

  bot.hears(hearAny('help'), async (ctx) => {
    if (await isAdminUser(ctx.chat.id)) {
      await ctx.reply(ctx.t('help_admin'));
    } else {
      await ctx.reply(ctx.t('help_text'), customerReplyKeyboard(ctx.lang, ctx.chat.id));
    }
  });

  // ─── /help — shows all commands (admin/owner get the full admin list) ───
  bot.command('help', async (ctx) => {
    if (await isAdminUser(ctx.chat.id)) {
      await ctx.reply(ctx.t('help_admin'));
    } else {
      await ctx.reply(ctx.t('help_text'), customerReplyKeyboard(ctx.lang, ctx.chat.id));
    }
  });

  // ─── Settings button ───
  bot.hears(hearAny('settings'), async (ctx) => {
    await ctx.reply(ctx.t('settings_title'), {
      reply_markup: {
        inline_keyboard: [
          [{ text: ctx.t('settings_language'), callback_data: 'show_language_menu' }],
        ],
      },
    });
  });

  bot.action('show_language_menu', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.editMessageText(ctx.t('language_choose'), {
      reply_markup: { inline_keyboard: buildLanguageKeyboard('lang_change') },
    });
  });

  // ─── Admin panel command ───
  bot.command('admin', async (ctx) => {
    if (!(await isAdminUser(ctx.chat.id))) {
      return ctx.reply(ctx.t('not_authorized_admin'));
    }
    const adminUrl = `${webAppUrl}/admin?chat_id=${ctx.chat.id}`;
    await ctx.reply(
      ctx.t('admin_panel_prompt'),
      Markup.inlineKeyboard([[Markup.button.webApp(ctx.t('admin_panel_button'), adminUrl)]]),
    );
  });

  // ─── Admin management commands ───
  // Owner and admins share the same permissions; management commands are
  // gated by isAdminUser() so any admin (not just the owner) can manage the list.
  bot.command('add_admin', async (ctx) => {
    if (!(await isAdminUser(ctx.chat.id))) {
      return ctx.reply(ctx.t('not_authorized_admin'));
    }
    const target = ctx.message.text.split(' ').slice(1).join(' ').trim();
    if (!target) return ctx.reply(ctx.t('usage_add_admin'));
    const pool = getPool();
    if (target.startsWith('@')) {
      const result = await pool.query(
        'SELECT telegram_chat_id, full_name FROM customers WHERE telegram_username = $1',
        [target.replace('@', '')],
      );
      if (!result.rows.length) return ctx.reply(ctx.t('user_not_started'));
      await pool.query(
        'INSERT INTO admins (telegram_chat_id, name, added_by) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
        [result.rows[0].telegram_chat_id, result.rows[0].full_name || target, ctx.chat.id],
      );
      return ctx.reply(ctx.t('admin_added', target));
    }
    const chatId = Number(target);
    if (isNaN(chatId)) return ctx.reply(ctx.t('invalid_chat_id'));
    await pool.query(
      'INSERT INTO admins (telegram_chat_id, added_by) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [chatId, ctx.chat.id],
    );
    return ctx.reply(ctx.t('admin_added_id', String(chatId)));
  });

  bot.command('remove_admin', async (ctx) => {
    if (!(await isAdminUser(ctx.chat.id))) {
      return ctx.reply(ctx.t('not_authorized_admin'));
    }
    const target = ctx.message.text.split(' ').slice(1).join(' ').trim();
    if (!target) return ctx.reply(ctx.t('usage_remove_admin'));
    const pool = getPool();
    if (target.startsWith('@')) {
      await pool.query(
        `DELETE FROM admins WHERE telegram_chat_id = (
          SELECT telegram_chat_id FROM customers WHERE telegram_username = $1
        )`,
        [target.replace('@', '')],
      );
    } else {
      await pool.query('DELETE FROM admins WHERE telegram_chat_id = $1', [Number(target)]);
    }
    return ctx.reply(ctx.t('admin_removed', target));
  });

  bot.command('admins', async (ctx) => {
    if (!(await isAdminUser(ctx.chat.id))) return ctx.reply(ctx.t('not_authorized'));
    const pool = getPool();
    const result = await pool.query(
      `SELECT a.telegram_chat_id, a.name, a.added_at,
              COALESCE(c.full_name, c.telegram_username, '\u2014') AS customer_name
         FROM admins a
         LEFT JOIN customers c ON c.telegram_chat_id = a.telegram_chat_id
         ORDER BY a.added_at`,
    );
    const ownerId = process.env.ADMIN_CHAT_ID;
    const lines = result.rows.map(
      a => `\u2022 ${a.customer_name} (${a.telegram_chat_id}) \u2014 added ${new Date(a.added_at).toLocaleDateString()}`,
    );
    return ctx.reply(ctx.t('admins_list', ownerId || '?', lines));
  });

  // ─── /admin_language — switch admin panel language ───
  bot.command('admin_language', async (ctx) => {
    if (!(await isAdminUser(ctx.chat.id))) return ctx.reply(ctx.t('not_authorized_admin'));
    const currentLang = await getAdminLanguage(ctx.chat.id);
    const displayLang = getLanguageName(currentLang);
    await ctx.reply(
      `${t('language_current', 'en', displayLang)}\n\n${t('language_choose', 'en')}`,
      { reply_markup: { inline_keyboard: buildLanguageKeyboard('admin_lang_set') } },
    );
  });

  bot.action(/^admin_lang_set:(.+)$/, async (ctx) => {
    try {
      if (!(await isAdminUser(ctx.chat?.id))) {
        await ctx.answerCbQuery(ctx.t('not_authorized'), { show_alert: true });
        return;
      }
      const lang = ctx.match[1];
      await setAdminLanguage(ctx.chat.id, lang);
      const displayLang = getLanguageName(lang);
      await ctx.answerCbQuery(t('language_set', 'en', displayLang));
      // Update message
      try {
        await ctx.editMessageText(t('language_set', 'en', displayLang));
      } catch (_) {}
    } catch (err) {
      console.error('admin_lang_set error:', err);
      // Always stop the loading indicator, even on error
      await ctx.answerCbQuery('Error setting language').catch(() => {});
    }
  });

  // ─── Status transition button handlers ───
  bot.action(/^accept_order:(\d+)$/, (ctx) => handleOrderApproval(ctx));
  bot.action(/^reject_order:(\d+)$/, async (ctx) => {
    if (!(await isAdminUser(ctx.chat?.id))) {
      await ctx.answerCbQuery(ctx.t('not_authorized'), { show_alert: true });
      return;
    }

    const orderId = Number(ctx.match[1]);
    const adminLang = await getAdminLanguage(ctx.chat.id);
    const pool = getPool();

    // Check order is still pending_approval
    const orderResult = await pool.query(
      `SELECT id FROM orders WHERE id = $1 AND status = ANY($2::text[])`,
      [orderId, ['pending_approval']],
    );

    if (!orderResult.rows.length) {
      await ctx.answerCbQuery(ctx.t('admin_order_already_processed'), { show_alert: true });
      return;
    }

    // "Don't Approve" → show sub-menu: Cancel Order OR Select Pickup Time
    await ctx.answerCbQuery();
    await ctx.editMessageReplyMarkup({
      inline_keyboard: [
        [Markup.button.callback(t('cancel_order_btn', adminLang), `admin_reject_confirm:${orderId}`)],
        [Markup.button.callback(t('select_pickup_time', adminLang), `select_pickup_time:${orderId}`)],
      ],
    });
  });

  // "Don't Approve" → Cancel Order: existing rejection reason flow
  bot.action(/^admin_reject_confirm:(\d+)$/, async (ctx) => {
    if (!(await isAdminUser(ctx.chat?.id))) {
      await ctx.answerCbQuery(ctx.t('not_authorized'), { show_alert: true });
      return;
    }

    const orderId = Number(ctx.match[1]);
    const pool = getPool();

    // Check order is still pending_approval
    const orderResult = await pool.query(
      `SELECT id FROM orders WHERE id = $1 AND status = ANY($2::text[])`,
      [orderId, ['pending_approval']],
    );

    if (!orderResult.rows.length) {
      await ctx.answerCbQuery(ctx.t('admin_order_already_processed'), { show_alert: true });
      return;
    }

    // Insert pending action so the text handler can pick up the admin's reply
    await pool.query(
      `INSERT INTO customer_pending_actions (customer_id, admin_chat_id, action, order_id)
       SELECT customer_id, $1, 'admin_reject_reason', $2
         FROM orders WHERE id = $2`,
      [ctx.chat.id, orderId],
    );

    await ctx.answerCbQuery();
    await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
    await ctx.editMessageText(`${ctx.callbackQuery.message.text}\n\n${ctx.t('admin_reject_awaiting_reason')}`);

    await ctx.reply(
      ctx.t('admin_reject_reason_prompt', orderId),
      Markup.inlineKeyboard([[Markup.button.callback(ctx.t('keep_order'), `admin_keep_reject:${orderId}`)]]),
    );
  });

  // "Don't Approve" → Select Pickup Time: show time options
  bot.action(/^select_pickup_time:(\d+)$/, async (ctx) => {
    if (!(await isAdminUser(ctx.chat?.id))) {
      await ctx.answerCbQuery(ctx.t('not_authorized'), { show_alert: true });
      return;
    }

    const orderId = Number(ctx.match[1]);
    const adminLang = await getAdminLanguage(ctx.chat.id);
    const pool = getPool();

    const orderResult = await pool.query(
      "SELECT to_char(pickup_time, 'YYYY-MM-DD HH24:MI:SS') AS pickup_time FROM orders WHERE id = $1 AND status = 'pending_approval'",
      [orderId],
    );
    if (!orderResult.rows.length) {
      await ctx.answerCbQuery(ctx.t('admin_order_already_processed'), { show_alert: true });
      return;
    }

    const requested = orderResult.rows[0].pickup_time
      ? formatOrderTime(formatDbTimeString(orderResult.rows[0].pickup_time), adminLang)
      : null;

    await ctx.answerCbQuery();
    await ctx.editMessageReplyMarkup({
      inline_keyboard: [
        [
          Markup.button.callback(t('pickup_20min', adminLang), `confirm_pickup_time:${orderId}:20`),
          Markup.button.callback(t('pickup_25min', adminLang), `confirm_pickup_time:${orderId}:25`),
        ],
        [
          Markup.button.callback(t('pickup_30min', adminLang), `confirm_pickup_time:${orderId}:30`),
          Markup.button.callback(t('pickup_35min', adminLang), `confirm_pickup_time:${orderId}:35`),
        ],
        [Markup.button.callback(t('pickup_use_requested', adminLang, requested || ''), `confirm_pickup_time:${orderId}:use_requested`)],
        [Markup.button.callback(t('pickup_custom', adminLang), `pickup_custom_time:${orderId}`)],
      ],
    });
  });

  // Approve order with a chosen pickup time (now + minutes, or customer's requested time)
  bot.action(/^confirm_pickup_time:(\d+):(20|25|30|35|use_requested)$/, async (ctx) => {
    if (!(await isAdminUser(ctx.chat?.id))) {
      await ctx.answerCbQuery(ctx.t('not_authorized'), { show_alert: true });
      return;
    }

    const orderId = Number(ctx.match[1]);
    const option = ctx.match[2];
    const adminLang = await getAdminLanguage(ctx.chat.id);
    const pool = getPool();

    // Resolve confirmed pickup time.
    // For "+X min" we add the minutes to the CUSTOMER's requested pickup time
    // (orders.pickup_time), so the admin can pad the customer's chosen time
    // (e.g. customer wants 11:00 → +15 gives 11:15). If the order is ASAP
    // (no requested time) we fall back to "now + X min" in Phnom Penh time.
    // Guard: if the padded time would already be in the past, fall back to
    // "now + X min" so we never confirm a pickup time that has already passed.
    let confirmedTime = null;
    if (option === 'use_requested') {
      const res = await pool.query(
        "SELECT to_char(pickup_time, 'YYYY-MM-DD HH24:MI:SS') AS pickup_time FROM orders WHERE id = $1",
        [orderId],
      );
      confirmedTime = res.rows.length ? res.rows[0].pickup_time : null;
    } else {
      const minutes = Number(option);
      const res = await pool.query(
        `SELECT
           CASE
             WHEN pickup_time IS NOT NULL
                  AND pickup_time + ($1::int || ' minutes')::interval > (now() AT TIME ZONE 'Asia/Phnom_Penh')
               THEN to_char(pickup_time + ($1::int || ' minutes')::interval, 'YYYY-MM-DD HH24:MI:SS')
             ELSE to_char((now() AT TIME ZONE 'Asia/Phnom_Penh') + ($1::int || ' minutes')::interval, 'YYYY-MM-DD HH24:MI:SS')
           END AS confirmed_time
         FROM orders WHERE id = $2`,
        [minutes, orderId],
      );
      confirmedTime = res.rows.length ? res.rows[0].confirmed_time : null;
    }

    const result = await pool.query(
      `UPDATE orders
          SET status = 'approved', confirmed_pickup_time = $2, updated_at = now()
        WHERE id = $1 AND status = 'pending_approval'
        RETURNING id, customer_id`,
      [orderId, confirmedTime],
    );

    if (!result.rows.length) {
      await ctx.answerCbQuery(ctx.t('admin_order_already_processed'), { show_alert: true });
      return;
    }

    const timeLabel = confirmedTime
      ? formatOrderTime(confirmedTime, adminLang)
      : t('asap', adminLang);

    await ctx.answerCbQuery(t('pickup_confirm_done', adminLang, orderId, timeLabel));
    try {
      await ctx.editMessageText(`${ctx.callbackQuery.message.text}\n\n\u2705 ${t('admin_status_approved', adminLang)}\n${t('pickup_confirm_done', adminLang, orderId, timeLabel)}`, {
        reply_markup: { inline_keyboard: [[Markup.button.callback(t('mark_paid', adminLang), `admin_mark_paid:${orderId}`)]] }
      });
    } catch (_) {}

    // Notify customer in background with their language
    try {
      const customerResult = await pool.query(
        'SELECT telegram_chat_id FROM customers WHERE id = $1',
        [result.rows[0].customer_id],
      );
      if (customerResult.rows.length) {
        const custChatId = customerResult.rows[0].telegram_chat_id;
        const custLang = await getUserLanguage(custChatId);
        const fullOrder = await loadOrder(orderId);
        await getBot().telegram.sendMessage(
          custChatId,
          formatCustomerReceipt(fullOrder, custLang),
          Markup.inlineKeyboard([
            [Markup.button.callback(t('proceed_to_pay', custLang), `pay_order:${orderId}`),
             Markup.button.callback(t('cancel_order', custLang), `customer_cancel:${orderId}`)],
          ]),
        );
      }
    } catch (err) {
      console.error('Failed to send customer receipt after pickup-time approval:', err);
    }
  });

  // Custom pickup time: ask admin to type HH:mm
  bot.action(/^pickup_custom_time:(\d+)$/, async (ctx) => {
    if (!(await isAdminUser(ctx.chat?.id))) {
      await ctx.answerCbQuery(ctx.t('not_authorized'), { show_alert: true });
      return;
    }

    const orderId = Number(ctx.match[1]);
    const pool = getPool();

    const orderResult = await pool.query(
      'SELECT id FROM orders WHERE id = $1 AND status = \'pending_approval\'',
      [orderId],
    );
    if (!orderResult.rows.length) {
      await ctx.answerCbQuery(ctx.t('admin_order_already_processed'), { show_alert: true });
      return;
    }

    // Insert pending action so the text handler picks up the typed time
    await pool.query(
      `INSERT INTO customer_pending_actions (customer_id, admin_chat_id, action, order_id)
       SELECT customer_id, $1, 'admin_pickup_custom', $2
         FROM orders WHERE id = $2`,
      [ctx.chat.id, orderId],
    );

    await ctx.answerCbQuery();
    await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
    await ctx.reply(ctx.t('pickup_custom_prompt', orderId));
  });

  bot.action(/^start_preparing:(\d+)$/, (ctx) => handleStatusTransition(ctx, 'paid', 'preparing', 'start_preparing'));
  bot.action(/^mark_ready:(\d+)$/, (ctx) => handleStatusTransition(ctx, 'preparing', 'ready', 'mark_ready'));
  bot.action(/^mark_fulfilled:(\d+)$/, (ctx) => handleStatusTransition(ctx, 'ready', 'fulfilled', 'mark_fulfilled'));
  bot.action(/^admin_keep_order:(\d+)$/, async (ctx) => {
    if (!(await isAdminUser(ctx.chat?.id))) {
      await ctx.answerCbQuery(ctx.t('not_authorized'), { show_alert: true });
      return;
    }

    const pool = getPool();
    await pool.query(
      `DELETE FROM customer_pending_actions
        WHERE admin_chat_id = $1 AND order_id = $2 AND action = 'admin_cancel_reason'`,
      [ctx.chat.id, Number(ctx.match[1])],
    );
    await ctx.answerCbQuery(ctx.t('admin_cancel_inline_kept'));
    await ctx.reply(ctx.t('admin_cancel_kept', ctx.match[1]));
  });

  bot.action(/^admin_keep_reject:(\d+)$/, async (ctx) => {
    if (!(await isAdminUser(ctx.chat?.id))) {
      await ctx.answerCbQuery(ctx.t('not_authorized'), { show_alert: true });
      return;
    }

    const pool = getPool();
    await pool.query(
      `DELETE FROM customer_pending_actions
        WHERE admin_chat_id = $1 AND order_id = $2 AND action = 'admin_reject_reason'`,
      [ctx.chat.id, Number(ctx.match[1])],
    );
    await ctx.answerCbQuery(ctx.t('admin_reject_inline_kept'));
    await ctx.reply(ctx.t('admin_reject_kept', ctx.match[1]));
  });

  bot.action(/^admin_review_cancel:(approve|keep):(\d+)$/, async (ctx) => {
    if (!(await isAdminUser(ctx.chat?.id))) {
      await ctx.answerCbQuery(ctx.t('not_authorized'), { show_alert: true });
      return;
    }

    const decision = ctx.match[1];
    const orderId = Number(ctx.match[2]);
    const pool = getPool();

    if (decision === 'keep') {
      await ctx.answerCbQuery(ctx.t('admin_cancel_inline_kept'));
      await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
      await ctx.reply(ctx.t('admin_cancel_declined', orderId));
      const orderResult = await pool.query(
        `SELECT c.telegram_chat_id FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.id = $1`,
        [orderId],
      );
      if (orderResult.rows.length) {
        const custChatId = orderResult.rows[0].telegram_chat_id;
        const custLang = await getUserLanguage(custChatId);
        await getBot().telegram.sendMessage(
          custChatId,
          t('admin_cancel_notify_keep', custLang, orderId),
          customerReplyKeyboard(custLang, custChatId),
        );
      }
      return;
    }

    const orderResult = await pool.query(
      `SELECT id FROM orders WHERE id = $1 AND status IN ('paid', 'preparing', 'ready')`,
      [orderId],
    );
    if (!orderResult.rows.length) {
      await ctx.answerCbQuery(ctx.t('admin_order_already_processed'), { show_alert: true });
      return;
    }

    await pool.query(
      `DELETE FROM customer_pending_actions
        WHERE admin_chat_id = $1 AND order_id = $2 AND action = 'admin_cancel_reason'`,
      [ctx.chat.id, orderId],
    );
    await pool.query(
      `INSERT INTO customer_pending_actions (customer_id, admin_chat_id, action, order_id)
       SELECT customer_id, $1, 'admin_cancel_reason', $2
         FROM orders WHERE id = $2`,
      [ctx.chat.id, orderId],
    );
    await ctx.answerCbQuery(ctx.t('admin_cancel_inline_kept'));
    await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
    await ctx.reply(
      ctx.t('admin_cancel_reason_prompt', orderId),
      Markup.inlineKeyboard([[Markup.button.callback(ctx.t('keep_order'), `admin_keep_order:${orderId}`)]]),
    );
  });

  // Admin cancel flow: ask for reason before cancelling
  bot.action(/^cancel_order:(\d+)$/, async (ctx) => {
    if (!(await isAdminUser(ctx.chat?.id))) {
      await ctx.answerCbQuery(ctx.t('not_authorized'), { show_alert: true });
      return;
    }

    const orderId = Number(ctx.match[1]);
    const pool = getPool();
    const allowedStatuses = ['approved', 'paid', 'preparing', 'ready'];

    const orderResult = await pool.query(
      `SELECT id FROM orders WHERE id = $1 AND status = ANY($2::text[])`,
      [orderId, allowedStatuses],
    );

    if (!orderResult.rows.length) {
      await ctx.answerCbQuery(ctx.t('admin_order_already_processed'), { show_alert: true });
      return;
    }

    await pool.query(
      `INSERT INTO customer_pending_actions (customer_id, admin_chat_id, action, order_id)
       SELECT customer_id, $1, 'admin_cancel_reason', $2
         FROM orders WHERE id = $2`,
      [ctx.chat.id, orderId],
    );

    await ctx.answerCbQuery();
    await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
    await ctx.editMessageText(`${ctx.callbackQuery.message.text}\n\n${ctx.t('admin_cancel_awaiting_reason')}`);

    await ctx.reply(
      ctx.t('admin_cancel_reason_prompt', orderId),
      Markup.inlineKeyboard([[Markup.button.callback(ctx.t('keep_order'), `admin_keep_order:${orderId}`)]]),
    );
  });

  bot.action(/^pay_order:(\d+)$/, (ctx) => handleCustomerPayOrder(ctx));

  
  bot.action(/^admin_mark_paid:(\d+)$/, async (ctx) => {
    if (!(await isAdminUser(ctx.chat?.id))) {
      await ctx.answerCbQuery(ctx.t('not_authorized'), { show_alert: true });
      return;
    }

    const orderId = Number(ctx.match[1]);
    const adminLang = await getAdminLanguage(ctx.chat.id);
    const pool = getPool();

    const result = await pool.query(
      `UPDATE orders SET status = 'paid', payment_status = 'paid', updated_at = now() WHERE id = $1 AND status = 'approved' RETURNING id, customer_id, fulfillment, total`,
      [orderId]
    );

    if (!result.rows.length) {
      await ctx.answerCbQuery(ctx.t('admin_order_already_processed'), { show_alert: true });
      return;
    }

    await ctx.answerCbQuery('Order marked as paid!');
    try {
      await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
      await ctx.editMessageText(`${ctx.callbackQuery.message.text}\n\n✅ ${t('payment_status_paid', adminLang)}`);
    } catch (_) {}

    // Notify customer
    try {
      const orderData = result.rows[0];
      const custResult = await pool.query('SELECT telegram_chat_id, language_code FROM customers WHERE id = $1', [orderData.customer_id]);
      if (custResult.rows.length) {
        const custLang = custResult.rows[0].language_code || 'en';
        await getBot().telegram.sendMessage(custResult.rows[0].telegram_chat_id, t('paid_notification', custLang));
      }
    } catch (e) {
      console.error('Failed to notify customer after mark paid', e);
    }
  });

  bot.action(/^customer_keep_order:(\d+)$/, async (ctx) => {
    const pool = getPool();
    await pool.query(
      `DELETE FROM customer_pending_actions pa
        USING customers c
        WHERE pa.customer_id = c.id
          AND c.telegram_chat_id = $1
          AND pa.order_id = $2`,
      [ctx.chat.id, Number(ctx.match[1])],
    );
    await ctx.answerCbQuery(ctx.t('admin_cancel_inline_kept'));
    await ctx.reply(ctx.t('customer_cancel_keep'), customerReplyKeyboard(ctx.lang, ctx.chat.id));
  });

  // Customer cancel flow: ask for reason, then wait for text reply
  bot.action(/^customer_cancel:(\d+)$/, async (ctx) => {
    const orderId = Number(ctx.match[1]);
    const pool = getPool();

    const orderResult = await pool.query(
      `SELECT o.id, o.status, o.payment_status, c.telegram_chat_id, c.id AS customer_id
         FROM orders o
         JOIN customers c ON c.id = o.customer_id
        WHERE o.id = $1 AND o.status <> 'cancelled'`,
      [orderId],
    );

    if (!orderResult.rows.length) {
      await ctx.answerCbQuery(ctx.t('customer_cancel_order_not_found'), { show_alert: true });
      return;
    }

    const order = orderResult.rows[0];
    if (String(ctx.chat?.id) !== String(order.telegram_chat_id)) {
      await ctx.answerCbQuery(ctx.t('customer_not_authorized'), { show_alert: true });
      return;
    }

    const isUnpaid = order.status === 'approved' && order.payment_status === 'unpaid';
    const action = isUnpaid ? 'cancel_reason' : 'cancel_request_reason';
    const prompt = isUnpaid
      ? ctx.t('customer_cancel_unpaid_prompt', orderId)
      : ctx.t('customer_cancel_paid_prompt', orderId);

    await pool.query(
      `DELETE FROM customer_pending_actions
        WHERE customer_id = $1 AND order_id = $2`,
      [order.customer_id, orderId],
    );
    await pool.query(
      `INSERT INTO customer_pending_actions (customer_id, action, order_id)
       VALUES ($1, $2, $3)`,
      [order.customer_id, action, orderId],
    );

    const promptKeyboard = Markup.inlineKeyboard([
      [Markup.button.callback(ctx.t('customer_keep_order_button'), `customer_keep_order:${orderId}`)],
    ]);
    await ctx.answerCbQuery();
    await ctx.reply(prompt, removeCustomerKeyboard());
    await ctx.reply(ctx.t('customer_keep_order_button'), promptKeyboard);
  });

  // Handle photo replies for refund proofs
  bot.on('photo', async (ctx) => {
    if (ctx.message.reply_to_message) {
      const handled = await handleRefundReply(ctx, 'photo');
      if (handled) return;
    }
    const largestPhoto = ctx.message.photo.at(-1);
    await ctx.reply(ctx.t('photo_file_id', largestPhoto.file_id));
  });

  // Handle text messages for pending customer / admin actions (cancel reason, etc.)
  bot.on('text', async (ctx) => {
    // Ignore commands — they have their own handlers
    if (ctx.message.text.startsWith('/') && !ctx.message.text.startsWith('/skip')) return;

    const pool = getPool();
    const adminChatId = process.env.ADMIN_CHAT_ID;
    const isAdmin = adminChatId && String(ctx.chat?.id) === String(adminChatId);

    let pendingResult;

    if (isAdmin) {
      pendingResult = await pool.query(
        `SELECT pa.id, pa.action, pa.order_id
           FROM customer_pending_actions pa
          WHERE pa.admin_chat_id = $1
          ORDER BY pa.created_at DESC
          LIMIT 1`,
        [ctx.chat.id],
      );
    } else {
      pendingResult = await pool.query(
        `SELECT pa.id, pa.action, pa.order_id
           FROM customer_pending_actions pa
           JOIN customers c ON c.id = pa.customer_id
          WHERE c.telegram_chat_id = $1
          ORDER BY pa.created_at DESC
          LIMIT 1`,
        [ctx.chat.id],
      );
    }

    if (!pendingResult.rows.length) return;

    const pending = pendingResult.rows[0];
    const reason = ctx.message.text.startsWith('/skip') ? null : ctx.message.text;

    if (pending.action === 'cancel_reason') {
      await processCancelReason(ctx, pending.order_id, reason);
      await pool.query('DELETE FROM customer_pending_actions WHERE id = $1', [pending.id]);
    } else if (pending.action === 'cancel_request_reason') {
      await processCustomerCancelRequest(ctx, pending.order_id, reason);
      await pool.query('DELETE FROM customer_pending_actions WHERE id = $1', [pending.id]);
    } else if (pending.action === 'admin_cancel_reason') {
      await processAdminCancelReason(ctx, pending.order_id, reason);
      await pool.query('DELETE FROM customer_pending_actions WHERE id = $1', [pending.id]);
    } else if (pending.action === 'admin_reject_reason') {
      await processAdminRejectReason(ctx, pending.order_id, reason);
      await pool.query('DELETE FROM customer_pending_actions WHERE id = $1', [pending.id]);
    } else if (pending.action === 'admin_pickup_custom') {
      const deletePending = await processAdminCustomPickupTime(ctx, pending.order_id, reason);
      if (deletePending) await pool.query('DELETE FROM customer_pending_actions WHERE id = $1', [pending.id]);
    }
  });

  // Handle text replies for refund notes
  bot.on('text', async (ctx) => {
    if (ctx.message.reply_to_message) {
      const handled = await handleRefundReply(ctx, 'text');
      if (handled) return;
    }
    // Existing logic...
    const pool = getPool();
    const adminChatId = process.env.ADMIN_CHAT_ID;
    const isAdmin = adminChatId && String(ctx.chat?.id) === String(adminChatId);
    let pendingResult;
    if (isAdmin) {
      pendingResult = await pool.query(
        `SELECT pa.id, pa.action, pa.order_id
           FROM customer_pending_actions pa
          WHERE pa.admin_chat_id = $1
          ORDER BY pa.created_at DESC
          LIMIT 1`,
        [ctx.chat.id],
      );
    } else {
      pendingResult = await pool.query(
        `SELECT pa.id, pa.action, pa.order_id
           FROM customer_pending_actions pa
           JOIN customers c ON c.id = pa.customer_id
          WHERE c.telegram_chat_id = $1
          ORDER BY pa.created_at DESC
          LIMIT 1`,
        [ctx.chat.id],
      );
    }
    if (!pendingResult.rows.length) return;
    const pending = pendingResult.rows[0];
    const reason = ctx.message.text.startsWith('/skip') ? null : ctx.message.text;
    if (pending.action === 'cancel_reason') {
      await processCancelReason(ctx, pending.order_id, reason);
      await pool.query('DELETE FROM customer_pending_actions WHERE id = $1', [pending.id]);
    } else if (pending.action === 'cancel_request_reason') {
      await processCustomerCancelRequest(ctx, pending.order_id, reason);
      await pool.query('DELETE FROM customer_pending_actions WHERE id = $1', [pending.id]);
    } else if (pending.action === 'admin_cancel_reason') {
      await processAdminCancelReason(ctx, pending.order_id, reason);
      await pool.query('DELETE FROM customer_pending_actions WHERE id = $1', [pending.id]);
    } else if (pending.action === 'admin_reject_reason') {
      await processAdminRejectReason(ctx, pending.order_id, reason);
      await pool.query('DELETE FROM customer_pending_actions WHERE id = $1', [pending.id]);
    } else if (pending.action === 'admin_pickup_custom') {
      const deletePending = await processAdminCustomPickupTime(ctx, pending.order_id, reason);
      if (deletePending) await pool.query('DELETE FROM customer_pending_actions WHERE id = $1', [pending.id]);
    }
  });

  bot.catch((error, ctx) => {
    console.error(`Unhandled bot error while processing ${ctx.updateType}:`, error);
  });

  return bot;
}

// ─── Exported: notify admin of new order ───
export async function notifyAdminOfOrder(orderId) {
  const order = await loadOrder(orderId);
  await notifyAllAdmins(
    (lang) => formatOrderMessage(order, lang),
    (lang) =>
      Markup.inlineKeyboard([
        [Markup.button.callback(t('approve_order', lang), `accept_order:${order.id}`),
         Markup.button.callback(t('dont_approve', lang), `reject_order:${order.id}`)],
      ]),
  );
}

// ─── Order approval (from bot inline button) ───
async function handleOrderApproval(ctx) {
  if (!(await isAdminUser(ctx.chat?.id))) {
    await ctx.answerCbQuery(ctx.t('not_authorized'), { show_alert: true });
    return;
  }

  const orderId = Number(ctx.match[1]);
  const adminLang = await getAdminLanguage(ctx.chat.id);
  const pool = getPool();

  const result = await pool.query(
    `UPDATE orders
        SET status = 'approved', updated_at = now()
      WHERE id = $1 AND status = 'pending_approval'
      RETURNING id, customer_id`,
    [orderId],
  );

  if (!result.rows.length) {
    await ctx.answerCbQuery(ctx.t('admin_order_already_processed'), { show_alert: true });
    return;
  }

  // Answer callback EARLY
  await ctx.answerCbQuery(`Order #${orderId} ${t('admin_status_approved', adminLang)}`);
  try {
    // Message will be updated with receipt_sent below
  } catch (_) {}

  // Notify customer in background with their language
  try {
    const customerResult = await pool.query(
      'SELECT telegram_chat_id FROM customers WHERE id = $1',
      [result.rows[0].customer_id],
    );
    if (customerResult.rows.length) {
      const custChatId = customerResult.rows[0].telegram_chat_id;
      const custLang = await getUserLanguage(custChatId);
      const fullOrder = await loadOrder(orderId);
      await getBot().telegram.sendMessage(
        custChatId,
        formatCustomerReceipt(fullOrder, custLang),
        Markup.inlineKeyboard([
          [Markup.button.callback(t('proceed_to_pay', custLang), `pay_order:${orderId}`),
           Markup.button.callback(t('cancel_order', custLang), `customer_cancel:${orderId}`)],
        ]),
      );
      try {
        await ctx.editMessageText(`${ctx.callbackQuery.message.text}\n\n\u2705 ${t('admin_status_approved', adminLang)}\n${t('receipt_sent', adminLang)}`, {
          reply_markup: { inline_keyboard: [[Markup.button.callback(t('mark_paid', adminLang), `admin_mark_paid:${orderId}`)]] }
        });
      } catch (_) {}
    }
  } catch (err) {
    console.error('Failed to send customer receipt:', err);
  }
}


// ─── Generic status transition (from bot inline buttons) ───
async function handleStatusTransition(ctx, allowedFrom, nextStatus, actionKey) {
  await handleStatusAction(ctx, allowedFrom, nextStatus, actionKey);
}

async function handleStatusAction(ctx, allowedFrom, nextStatus, actionKey) {
  if (!(await isAdminUser(ctx.chat?.id))) {
    await ctx.answerCbQuery(ctx.t('not_authorized'), { show_alert: true });
    return;
  }

  const orderId = Number(ctx.match[1]);
  const adminLang = await getAdminLanguage(ctx.chat.id);
  const pool = getPool();
  const allowedStatuses = Array.isArray(allowedFrom) ? allowedFrom : [allowedFrom];

  const result = await pool.query(
    `UPDATE orders
        SET status = $1, updated_at = now()
      WHERE id = $2 AND status = ANY($3::text[])
      RETURNING id, customer_id`,
    [nextStatus, orderId, allowedStatuses],
  );

  if (!result.rows.length) {
    await ctx.answerCbQuery(ctx.t('admin_order_already_processed'), { show_alert: true });
    return;
  }

  // Determine which notification key to use for the customer
  const customerNotificationKey =
    nextStatus === 'rejected' ? 'rejected_notification' :
    nextStatus === 'preparing' ? 'preparing_notification' :
    nextStatus === 'ready' ? 'ready_notification' :
    nextStatus === 'fulfilled' ? 'fulfilled_notification' : null;

  // Map nextStatus to admin status locale key
  const adminStatusKey = `admin_status_${nextStatus}`;
  const adminStatusLabel = t(adminStatusKey, adminLang);

  // Answer callback EARLY
  const actionLabel = t(actionKey, adminLang);
  await ctx.answerCbQuery(`Order #${orderId} ${actionLabel}.`);
  try {
    await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
    await ctx.editMessageText(`${ctx.callbackQuery.message.text}\n\n${adminStatusLabel}`);
  } catch (_) {}

  // Notify customer in background with their language
  if (customerNotificationKey) {
    try {
      const customerResult = await pool.query(
        'SELECT telegram_chat_id FROM customers WHERE id = $1',
        [result.rows[0].customer_id],
      );
      if (customerResult.rows.length) {
        const custLang = await getUserLanguage(customerResult.rows[0].telegram_chat_id);
        await getBot().telegram.sendMessage(
          customerResult.rows[0].telegram_chat_id,
          t(customerNotificationKey, custLang),
        );
      }
    } catch (err) {
      console.error(`Failed to notify customer for order ${orderId}:`, err);
    }
  }
}

async function handleCustomerPayOrder(ctx) {
  const orderId = Number(ctx.match[1]);
  const pool = getPool();

  const orderResult = await pool.query(
    `SELECT o.id, o.total, o.customer_id, c.telegram_chat_id
       FROM orders o
       JOIN customers c ON c.id = o.customer_id
      WHERE o.id = $1 AND o.status = 'approved'`,
    [orderId],
  );

  if (!orderResult.rows.length) {
    await ctx.answerCbQuery(ctx.t('pay_order_not_found'), { show_alert: true });
    return;
  }

  const order = orderResult.rows[0];

  if (String(ctx.chat?.id) !== String(order.telegram_chat_id)) {
    await ctx.answerCbQuery(ctx.t('customer_not_authorized'), { show_alert: true });
    return;
  }

  try {
    // TEMPORARY MANUAL PAYMENT OVERRIDE
    // const qrData = await generateABAPayWayQR(orderId, Number(order.total));

    /*
    const savedOrder = await pool.query(
      'UPDATE orders SET aba_transaction_id = $1 WHERE id = $2 AND status = $3 AND payment_status = $4 RETURNING id, aba_transaction_id',
      [qrData.transactionId, orderId, 'approved', 'unpaid'],
    );

    if (!savedOrder.rows.length || savedOrder.rows[0].aba_transaction_id !== qrData.transactionId) {
      throw new Error(`Failed to save ABA transaction ID for order ${orderId}`);
    }
    */

    // Remove the button so they can't tap twice
    await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
    await ctx.editMessageText(ctx.t('pay_caption_updated', ctx.callbackQuery.message.text));

    // Send STATIC QR as a new message with cancel option
    const qrUrl = (process.env.WEB_APP_URL || '') + '/assets/payment_qr.jpg';
    await ctx.replyWithPhoto(
      { url: qrUrl },
      {
        caption: ctx.t('pay_qr_caption', orderId, Number(order.total)),
        reply_markup: {
          inline_keyboard: [
            [{ text: ctx.t('cancel_order'), callback_data: `customer_cancel:${orderId}` }],
          ],
        },
      },
    );

    await ctx.answerCbQuery(ctx.t('pay_qr_sent'));
  } catch (error) {
    console.error('Failed to generate payment QR:', error);
    await ctx.answerCbQuery(ctx.t('pay_qr_failed'), { show_alert: true });
  }
}

// ─── Order loading ───
export async function loadOrder(orderId) {
  const pool = getPool();
  const result = await pool.query(
     `SELECT o.id, o.fulfillment, o.address,
            to_char(o.pickup_time, 'YYYY-MM-DD HH24:MI:SS') AS pickup_time,
            to_char(o.confirmed_pickup_time, 'YYYY-MM-DD HH24:MI:SS') AS confirmed_pickup_time,
            o.customer_remark, o.cancel_reason, o.status, o.total, o.payment_status,
            c.telegram_chat_id, c.telegram_username, c.full_name, c.phone,
            COALESCE(
              json_agg(
                json_build_object(
                  'name', mi.name,
                  'name_km', mi.name_km,
                  'name_zh', mi.name_zh,
                  'quantity', oi.quantity,
                  'unit_price', oi.unit_price,
                  'line_total', oi.line_total
                ) ORDER BY oi.id
              ) FILTER (WHERE oi.id IS NOT NULL),
              '[]'::json
            ) AS items
       FROM orders o
       JOIN customers c ON c.id = o.customer_id
       LEFT JOIN order_items oi ON oi.order_id = o.id
       LEFT JOIN menu_items mi ON mi.id = oi.menu_item_id
      WHERE o.id = $1
      GROUP BY o.id, c.telegram_chat_id, c.telegram_username, c.full_name, c.phone`,
    [orderId],
  );

  if (!result.rows.length) {
    throw new Error(`Order ${orderId} not found`);
  }

  return result.rows[0];
}

// ─── Format order for admin notification (language-aware) ───
function formatOrderMessage(order, lang = 'en') {
  const itemLines = order.items
    .map((item) => `- ${localizedItemName(item, lang)} x${item.quantity} = $${Number(item.line_total).toFixed(2)}`)
    .join('\n');
  const customer = order.full_name || (order.telegram_username ? `@${order.telegram_username}` : 'Customer');
  const displayTime = order.confirmed_pickup_time || order.pickup_time;
  const paymentLabel = t(`payment_status_${order.payment_status}`, lang);
  const fulfillment = order.fulfillment === 'delivery'
    ? `\u{1F4CD} ${t('fulfillment_delivery', lang)}: ${order.address || t('address_not_provided', lang)}`
    : `\u{1F6CD}\uFE0F ${t('fulfillment_pickup', lang)}: ${formatOrderTime(displayTime, lang)}`;

  const specialInstructions = order.customer_remark || t('special_none', lang);
  const statusText = t('admin_status_' + order.status, lang);
  const safeStatus = statusText === ('admin_status_' + order.status)
    ? String(order.status).toUpperCase().replace('_', ' ')
    : statusText;

  return t('new_order_title', lang, order.id, customer, fulfillment, paymentLabel, itemLines, specialInstructions, Number(order.total), safeStatus);
}

// ─── Format receipt for customer (language-aware) ───
export function formatCustomerReceipt(order, lang) {
  const itemLines = order.items
    .map((item) => `\u2022 ${localizedItemName(item, lang)} x${item.quantity} = $${Number(item.line_total).toFixed(2)}`)
    .join('\n');
  const displayTime = order.confirmed_pickup_time || order.pickup_time;
  const fulfillment = order.fulfillment === 'delivery'
    ? `\u{1F4CD} ${t('fulfillment_delivery', lang)}: ${order.address}`
    : `\u{1F6CD}\uFE0F ${t('fulfillment_pickup', lang)}: ${formatOrderTime(displayTime, lang)}`;

  return t('customer_receipt', lang, order.id, fulfillment, itemLines, order.customer_remark || t('special_none', lang), Number(order.total));
}

// ─── Localized item name (fallback to English) ───
export function localizedItemName(item, lang) {
  if (lang === 'km' && item.name_km) return item.name_km;
  if (lang === 'zh' && item.name_zh) return item.name_zh;
  return item.name;
}

// ─── Format pickup time for display (literal wall-clock, no timezone shifts) ───
function formatOrderTime(value, lang = 'en') {
  if (!value) return t('asap', lang);

  // Normalize to a wall-clock Date anchored at UTC so timeZone: 'UTC'
  // renders the exact digits stored in the DB (Phnom Penh wall-clock).
  let d;
  if (typeof value === 'string' && value.includes(' ')) {
    // "YYYY-MM-DD HH:mm:ss" → literal components, no TZ interpretation
    const [datePart, timePart] = value.split(' ');
    const [year, month, day] = datePart.split('-');
    const [hour, min, sec] = timePart.split(':');
    d = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(min), Number(sec)));
  } else {
    // Date object (e.g. pg-parsed timestamp). On Vercel (UTC) the Date's
    // UTC fields equal the wall-clock digits we want to show.
    const date = value instanceof Date ? value : new Date(value);
    d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds()));
  }

  const localeMap = { en: 'en-US', km: 'km-KH', zh: 'zh-CN' };
  return d.toLocaleString(localeMap[lang] || 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'UTC',
  });
}

// ─── Current Phnom Penh wall-clock as "YYYY-MM-DD HH:mm:ss" (for storing) ───
function phnomPenhWallClockString(date = new Date(), overrides = {}) {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Phnom_Penh',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  });
  const parts = Object.fromEntries(fmt.formatToParts(date).map((p) => [p.type, p.value]));
  const pad = (n) => String(n).padStart(2, '0');
  const hh = overrides.hours ?? parts.hour;
  const mm = overrides.minutes ?? parts.minute;
  const ss = overrides.seconds ?? parts.second;
  return `${parts.year}-${parts.month}-${parts.day} ${pad(hh)}:${pad(mm)}:${pad(ss)}`;
}

// ─── Normalize a pg value (Date or "YYYY-MM-DD HH:mm:ss") to a wall-clock string ───
function formatDbTimeString(value) {
  if (!value) return null;
  if (typeof value === 'string' && value.includes(' ')) {
    // already the expected format
    return value.slice(0, 19);
  }
  // pg returns Date objects parsed in the server's local tz (UTC on Vercel),
  // so the UTC fields match the original wall-clock digits.
  const d = value instanceof Date ? value : new Date(value);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
}

// ─── Retry helper for sending messages ───
async function sendWithRetry(bot, chatId, text, keyboard, maxRetries = 3) {
  for (let i = 1; i <= maxRetries; i++) {
    try {
      await bot.telegram.sendMessage(chatId, text, keyboard);
      return;
    } catch (err) {
      console.error(`sendMessage to ${chatId} attempt ${i}/${maxRetries}:`, err.message);
      if (i < maxRetries) await new Promise(r => setTimeout(r, 1000));
    }
  }
}

// ─── Refund reply capture ───
async function handleRefundReply(ctx, type) {
  const repliedMessage = ctx.message.reply_to_message;
  // Look for Order #N in the original message text
  const match = repliedMessage.text.match(/Order #(\d+)/);
  if (!match) return false;

  const orderId = Number(match[1]);
  const pool = getPool();

  // Verify order has pending refund
  const orderRes = await pool.query(
    "SELECT id FROM orders WHERE id = $1 AND refund_status = 'pending'",
    [orderId]
  );
  if (!orderRes.rows.length) {
    await ctx.reply("Order not found or no pending refund.");
    return true; // Stop propagation
  }

  try {
    if (type === 'photo') {
      const largestPhoto = ctx.message.photo.at(-1);
      const fileLink = await getBot().telegram.getFileLink(largestPhoto.file_id);
      
      // Update order
      await pool.query(
        "UPDATE orders SET refund_status = 'completed', refunded_at = now(), refund_proof_url = $1 WHERE id = $2",
        [fileLink.href, orderId]
      );
      await ctx.reply(`✅ Refund completed for Order #${orderId} (Proof attached)`);
      
    } else if (type === 'text') {
      const note = ctx.message.text;
      await pool.query(
        "UPDATE orders SET refund_status = 'completed', refunded_at = now(), refund_note = $1 WHERE id = $2",
        [note, orderId]
      );
      await ctx.reply(`✅ Refund completed for Order #${orderId} (Note saved)`);
    }
  } catch (err) {
    console.error('Failed to process refund:', err);
    await ctx.reply("❌ Error processing refund.");
  }
  
  return true; // Handled
}

// ─── Notify ALL admins with retry and per-language keyboard ───
// Sends the same text to every admin but translates keyboard buttons
// to each admin's preferred language.
//   text        — the message string (includes order details)
//   keyboardFn  — (lang) => Markup.inlineKeyboard([...]) | undefined
// ─── Notify ALL admins with retry and per-language message + keyboard ───
// textOrFn: either a static string, or a function (lang) => string so each
// admin receives the message in their own preferred language.
export async function notifyAllAdmins(textOrFn, keyboardFn) {
  const pool = getPool();
  const bot = getBot();
  const adminChatIds = [];

  // Primary owner
  const ownerId = process.env.ADMIN_CHAT_ID;
  if (ownerId) adminChatIds.push(String(ownerId));

  // Other admins from DB
  try {
    const admins = await pool.query('SELECT telegram_chat_id FROM admins');
    for (const a of admins.rows) {
      const id = String(a.telegram_chat_id);
      if (!adminChatIds.includes(id)) adminChatIds.push(id);
    }
  } catch (e) {
    console.error('Failed to fetch admins for broadcast:', e);
  }

  // Send in each admin's language
  for (const chatId of adminChatIds) {
    const lang = await getAdminLanguage(chatId);
    const text = typeof textOrFn === 'function' ? textOrFn(lang) : textOrFn;
    const keyboard = keyboardFn ? keyboardFn(lang) : undefined;
    await sendWithRetry(bot, chatId, text, keyboard);
  }
}

// ─── Send customer their orders ───
async function sendCustomerOrders(ctx) {
  const pool = getPool();
  const result = await pool.query(
    `SELECT o.id, o.status, o.payment_status, o.total, o.fulfillment, o.created_at
       FROM orders o
       JOIN customers c ON c.id = o.customer_id
      WHERE c.telegram_chat_id = $1
      ORDER BY o.created_at DESC
      LIMIT 5`,
    [ctx.chat.id],
  );

  if (!result.rows.length) {
    await ctx.reply(ctx.t('no_orders'), customerReplyKeyboard(ctx.lang, ctx.chat.id));
    return;
  }

  for (const order of result.rows) {
    const payment = String(order.payment_status || 'unknown').replaceAll('_', ' ');
    const fulfillment = order.fulfillment === 'delivery'
      ? ctx.t('fulfillment_delivery')
      : ctx.t('fulfillment_pickup');
    const orderKeyboard = [];
    if (order.status === 'approved' && order.payment_status === 'unpaid') {
      orderKeyboard.push([
        Markup.button.callback(ctx.t('pay_now'), `pay_order:${order.id}`),
        Markup.button.callback(ctx.t('cancel_order'), `customer_cancel:${order.id}`),
      ]);
    } else if (order.status !== 'cancelled' && order.status !== 'fulfilled') {
      orderKeyboard.push([Markup.button.callback(ctx.t('request_cancellation'), `customer_cancel:${order.id}`)]);
    }

    await ctx.reply(
      `Order #${order.id}\n${statusLabel(ctx.lang, order.status)}\n${fulfillment} \u00B7 Payment: ${payment}\nTotal: $${Number(order.total).toFixed(2)}`,
      orderKeyboard.length
        ? Markup.inlineKeyboard(orderKeyboard)
        : undefined,
    );
  }

  await ctx.reply(ctx.t('navigation_hint'), customerReplyKeyboard(ctx.lang, ctx.chat.id));
}

// ─── Order status label helper (language-aware) ───
function statusLabel(lang, status) {
  const key = `status_${status}`;
  const translated = t(key, lang);
  // If the key doesn't have a translation (fallback returns key itself), use a hardcoded fallback
  return translated !== key ? translated : `Status: ${status}`;
}

// ─── Cancel: customer cancels unpaid order ───
async function processCancelReason(ctx, orderId, reason) {
  const pool = getPool();

  const result = await pool.query(
    `UPDATE orders
        SET status = 'cancelled',
            payment_status = 'unpaid',
            cancel_reason = $1,
            updated_at = now()
      WHERE id = $2 AND status = 'approved' AND payment_status = 'unpaid'
      RETURNING id, customer_id`,
    [reason, orderId],
  );

  if (!result.rows.length) {
    await ctx.reply(ctx.t('customer_cancel_order_not_found'), customerReplyKeyboard(ctx.lang, ctx.chat.id));
    return;
  }

  const reasonLine = reason ? `\n\n${ctx.t('reason_label')}: ${reason}` : '';
  await ctx.reply(ctx.t('customer_cancel_confirmed', orderId, reason), customerReplyKeyboard(ctx.lang, ctx.chat.id));

  // Notify ALL admins with the cancellation details
  try {
    const order = await loadOrder(orderId);
    await notifyAllAdmins((lang) => {
      const itemLines = order.items
        .map((item) => `- ${localizedItemName(item, lang)} x${item.quantity} = $${Number(item.line_total).toFixed(2)}`)
        .join('\n');
      const customerName = order.full_name || '—';
      const customerUsername = order.telegram_username ? `@${order.telegram_username}` : '—';
      const customerPhone = order.phone || '—';
      const customer = `${customerName}\n📱 ${customerUsername}\n📞 ${customerPhone}`;
      const fulfillment = order.fulfillment === 'delivery'
        ? `${t('fulfillment_delivery', lang)}\nAddress: ${order.address || t('address_not_provided', lang)}`
        : `${t('fulfillment_pickup', lang)}\nTime: ${formatOrderTime(order.pickup_time, lang)}`;

      const reasonMessage = reason
        ? `\n\n${t('reason_label', lang)}:\n${reason}`
        : `\n\n${t('reason_not_provided', lang)}`;

      return t('admin_notify_customer_cancelled', lang, orderId, customer, fulfillment, itemLines, Number(order.total), reasonMessage);
    });
  } catch (err) {
    console.error('Failed to send admin cancellation notification:', err);
  }
}

// ─── Cancel: customer requests cancellation for paid/processed order ───
async function processCustomerCancelRequest(ctx, orderId, reason) {
  const pool = getPool();
  const orderResult = await pool.query(
    `SELECT o.id, o.status, o.payment_status, o.total, c.telegram_chat_id,
            c.full_name, c.telegram_username
       FROM orders o
       JOIN customers c ON c.id = o.customer_id
      WHERE o.id = $1 AND o.status <> 'cancelled'`,
    [orderId],
  );

  if (!orderResult.rows.length) {
    await ctx.reply(ctx.t('customer_cancel_order_not_found'), customerReplyKeyboard(ctx.lang, ctx.chat.id));
    return;
  }

  const order = orderResult.rows[0];
  const customer = order.full_name || (order.telegram_username ? `@${order.telegram_username}` : 'Telegram customer');

  await ctx.reply(ctx.t('customer_cancel_request_sent', orderId), customerReplyKeyboard(ctx.lang, ctx.chat.id));

  // Notify ALL admins with language-aware message and buttons
  await notifyAllAdmins(
    (lang) => {
      const reasonMessage = reason || t('reason_not_provided', lang);
      return t('admin_cancel_request_title', lang, orderId, customer, Number(order.total), reasonMessage);
    },
    (lang) => Markup.inlineKeyboard([
      [
        Markup.button.callback(t('admin_approve_cancel', lang), `admin_review_cancel:approve:${orderId}`),
        Markup.button.callback(t('admin_keep_cancel', lang), `admin_review_cancel:keep:${orderId}`),
      ],
    ]),
  );
}

// ─── Cancel: admin cancels order with reason ───
async function processAdminCancelReason(ctx, orderId, reason) {
  const pool = getPool();
  const allowedStatuses = ['approved', 'paid', 'preparing', 'ready'];

  const result = await pool.query(
    `UPDATE orders
        SET status = 'cancelled',
            cancel_reason = $1,
            refund_status = CASE WHEN payment_status = 'paid' THEN 'pending' ELSE refund_status END,
            updated_at = now()
      WHERE id = $2 AND status = ANY($3::text[])
      RETURNING id, customer_id, payment_status`,
    [reason, orderId, allowedStatuses],
  );

  if (!result.rows.length) {
    await ctx.reply(ctx.t('customer_cancel_order_not_found'));
    return;
  }

  const order = result.rows[0];
  const refundNotice = order.payment_status === 'paid' ? '\n\n⚠️ REFUND REQUIRED — Process refund manually via ABA dashboard.' : '';

  await ctx.reply(ctx.t('admin_cancel_approved', orderId) + refundNotice);

  // Notify owner if refund is pending
  if (order.payment_status === 'paid') {
    const ownerId = process.env.ADMIN_CHAT_ID;
    if (ownerId) {
      try {
        const fullOrder = await loadOrder(orderId);
        await getBot().telegram.sendMessage(
          ownerId,
          `⚠️ Refund pending for Order #${orderId} ($${Number(fullOrder.total).toFixed(2)})\n\n` +
          `Please reply to this message with a screenshot of the transfer or a text note.`
        );
      } catch (err) {
        console.error('Failed to notify owner for refund:', err);
      }
    }
  }

  // Notify the customer with the reason (in their language)
  const customerResult = await pool.query(
    'SELECT telegram_chat_id FROM customers WHERE id = $1',
    [order.customer_id],
  );

  if (customerResult.rows.length) {
    const custLang = await getUserLanguage(customerResult.rows[0].telegram_chat_id);
    await getBot().telegram.sendMessage(
      customerResult.rows[0].telegram_chat_id,
      t('admin_cancelled_notification', custLang, orderId, reason),
    );
  }
}

// ─── Reject: admin rejects order with reason ───
async function processAdminRejectReason(ctx, orderId, reason) {
  const pool = getPool();

  const result = await pool.query(
    `UPDATE orders
        SET status = 'rejected',
            cancel_reason = $1,
            updated_at = now()
      WHERE id = $2 AND status = 'pending_approval'
      RETURNING id, customer_id`,
    [reason, orderId],
  );

  if (!result.rows.length) {
    await ctx.reply(ctx.t('admin_order_already_processed'));
    return;
  }

  const order = result.rows[0];

  const reasonLine = reason ? `\n\n${ctx.t('reason_label')}: ${reason}` : '';
  await ctx.reply(ctx.t('admin_reject_approved', orderId));

  // Notify the customer with the reason (in their language)
  const customerResult = await pool.query(
    'SELECT telegram_chat_id FROM customers WHERE id = $1',
    [order.customer_id],
  );

  if (customerResult.rows.length) {
    const custLang = await getUserLanguage(customerResult.rows[0].telegram_chat_id);
    await getBot().telegram.sendMessage(
      customerResult.rows[0].telegram_chat_id,
      t('rejected_notification', custLang, reason),
    );
  }
}

// ─── Admin types a custom pickup time (HH:mm, same-day) ───
// Returns true when the pending action should be cleared (success or /skip),
// false when the input was invalid so the admin can retry.
async function processAdminCustomPickupTime(ctx, orderId, reason) {
  const adminLang = await getAdminLanguage(ctx.chat.id);
  const pool = getPool();

  if (!reason) {
    // /skip cancels the custom-time flow; order stays pending_approval
    await ctx.reply(t('pickup_custom_skipped', adminLang));
    return true;
  }

  // Parse HH:mm (e.g. 14:30, 9:05)
  const match = String(reason).trim().match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
  if (!match) {
    await ctx.reply(t('pickup_custom_invalid', adminLang));
    return false;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  // Build the confirmed time as a Phnom Penh wall-clock string for TODAY
  const confirmedTime = phnomPenhWallClockString(new Date(), { hours, minutes });

  const result = await pool.query(
    `UPDATE orders
        SET status = 'approved', confirmed_pickup_time = $2, updated_at = now()
      WHERE id = $1 AND status = 'pending_approval'
      RETURNING id, customer_id`,
    [orderId, confirmedTime],
  );

  if (!result.rows.length) {
    await ctx.reply(ctx.t('admin_order_already_processed'));
    return true;
  }

  const timeLabel = formatOrderTime(confirmedTime, adminLang);
  await ctx.reply(t('pickup_confirm_done', adminLang, orderId, timeLabel), {
    reply_markup: { inline_keyboard: [[Markup.button.callback(t('mark_paid', adminLang), `admin_mark_paid:${orderId}`)]] }
  });

  // Notify customer with receipt (their language)
  try {
    const customerResult = await pool.query(
      'SELECT telegram_chat_id FROM customers WHERE id = $1',
      [result.rows[0].customer_id],
    );
    if (customerResult.rows.length) {
      const custChatId = customerResult.rows[0].telegram_chat_id;
      const custLang = await getUserLanguage(custChatId);
      const fullOrder = await loadOrder(orderId);
      await getBot().telegram.sendMessage(
        custChatId,
        formatCustomerReceipt(fullOrder, custLang),
        Markup.inlineKeyboard([
          [Markup.button.callback(t('proceed_to_pay', custLang), `pay_order:${orderId}`),
           Markup.button.callback(t('cancel_order', custLang), `customer_cancel:${orderId}`)],
        ]),
      );
    }
  } catch (err) {
    console.error('Failed to send customer receipt after custom pickup time:', err);
  }
}

// ─── Ensure customer exists in DB (returns customer id) ───
async function ensureCustomer(ctx) {
  const pool = getPool();
  const telegramChatId = ctx.chat.id;
  const telegramUsername = ctx.from?.username ?? null;
  const fullName = [ctx.from?.first_name, ctx.from?.last_name]
    .filter(Boolean)
    .join(' ') || null;

  const result = await pool.query(
    `INSERT INTO customers (telegram_chat_id, telegram_username, full_name)
     VALUES ($1, $2, $3)
     ON CONFLICT (telegram_chat_id)
     DO UPDATE SET telegram_username = EXCLUDED.telegram_username,
                   full_name = EXCLUDED.full_name
     RETURNING id`,
    [telegramChatId, telegramUsername, fullName],
  );
  return result.rows[0].id;
}
