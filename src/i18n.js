// ─── i18n helper ───
// Provides translation lookup, language cache, and DB persistence.

import { getPool } from './db.js';
import { locales, supportedLanguages, languageNames, languageLabels } from './locales.js';

// Simple in-memory cache to avoid DB lookups on every message
const langCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Translate a key into the given language, passing optional args.
 * @param {string} key - The locale key (dot notation for nested)
 * @param {string} lang - Language code ('en', 'km', 'zh')
 * @param {...any} args - Arguments for template functions
 * @returns {string}
 */
export function t(key, lang, ...args) {
  const locale = locales[lang] || locales.en;
  const value = locale[key];
  if (typeof value === 'function') {
    return value(...args);
  }
  if (typeof value === 'string') {
    return value;
  }
  // Fallback to English
  const enValue = locales.en[key];
  if (typeof enValue === 'function') {
    return enValue(...args);
  }
  return enValue || key;
}

/**
 * Get a display name for a language code.
 */
export function getLanguageName(code) {
  return languageNames[code] || code;
}

/**
 * Get the Telegram button text for each language option.
 */
export function getLanguageButton(lang) {
  const label = languageLabels[lang];
  if (!label) return languageNames[lang] || lang;
  return `\u{1F310} ${label.en}/${label.zh}/${label.km}`;
}

/**
 * Look up a user's saved language from DB (with cache).
 * @param {number|string} chatId
 * @returns {Promise<string>} Language code, default 'en'
 */
export async function getUserLanguage(chatId) {
  if (!chatId) return 'en';

  // Check cache
  const cached = langCache.get(chatId);
  if (cached && Date.now() < cached.expires) {
    return cached.lang;
  }

  try {
    const pool = getPool();
    const result = await pool.query(
      'SELECT language_code FROM customers WHERE telegram_chat_id = $1',
      [chatId],
    );
    const lang =
      result.rows.length && supportedLanguages.includes(result.rows[0].language_code)
        ? result.rows[0].language_code
        : 'en';

    // Update cache
    langCache.set(chatId, { lang, expires: Date.now() + CACHE_TTL_MS });
    return lang;
  } catch {
    return 'en';
  }
}

/**
 * Set a user's language in DB and update cache.
 * @param {number|string} chatId
 * @param {string} lang - Language code
 */
export async function setUserLanguage(chatId, lang) {
  if (!supportedLanguages.includes(lang)) lang = 'en';
  try {
    const pool = getPool();
    await pool.query(
      'UPDATE customers SET language_code = $1 WHERE telegram_chat_id = $2',
      [lang, chatId],
    );
  } catch (err) {
    console.error(`Failed to set language for ${chatId}:`, err);
  }
  // Update cache
  langCache.set(chatId, { lang, expires: Date.now() + CACHE_TTL_MS });
}

/**
 * Build the inline keyboard for language selection.
 * @param {string} callbackPrefix - Prefix for callback data (e.g. 'lang_set' or 'lang_change')
 * @returns {Array}
 */
export function buildLanguageKeyboard(prefix = 'lang_set') {
  return supportedLanguages.map((code) => [
    { text: getLanguageButton(code), callback_data: `${prefix}:${code}` },
  ]);
}

/**
 * Check if a user has explicitly chosen a language (language_code is not NULL).
 * @param {number|string} chatId
 * @returns {Promise<boolean>}
 */
export async function isLanguageSet(chatId) {
  if (!chatId) return false;
  try {
    const pool = getPool();
    const result = await pool.query(
      'SELECT language_code FROM customers WHERE telegram_chat_id = $1',
      [chatId],
    );
    return result.rows.length > 0 && result.rows[0].language_code != null;
  } catch {
    return false;
  }
}

/**
 * Invalidate cache for a chat ID (useful if DB changes externally)
 */
// Re-export from locales for convenience
export { supportedLanguages, languageNames, languageLabels } from './locales.js';

export function clearLanguageCache(chatId) {
  if (chatId) {
    langCache.delete(chatId);
    adminLangCache.delete(chatId);
  } else {
    langCache.clear();
    adminLangCache.clear();
  }
}

// ─── Admin language support ───

const adminLangCache = new Map();

/**
 * Look up an admin's saved language from DB (with cache).
 * Falls back to 'en' if not set.
 * @param {number|string} chatId
 * @returns {Promise<string>} Language code, default 'en'
 */
export async function getAdminLanguage(chatId) {
  if (!chatId) return 'en';

  const cached = adminLangCache.get(chatId);
  if (cached && Date.now() < cached.expires) {
    return cached.lang;
  }

  try {
    const pool = getPool();
    const result = await pool.query(
      'SELECT language_code FROM admins WHERE telegram_chat_id = $1',
      [chatId],
    );
    let lang = 'en';
    if (result.rows.length && supportedLanguages.includes(result.rows[0].language_code)) {
      lang = result.rows[0].language_code;
    }

    adminLangCache.set(chatId, { lang, expires: Date.now() + CACHE_TTL_MS });
    return lang;
  } catch {
    return 'en';
  }
}

/**
 * Set an admin's language in DB and update cache.
 * @param {number|string} chatId
 * @param {string} lang - Language code
 */
export async function setAdminLanguage(chatId, lang) {
  if (!supportedLanguages.includes(lang)) lang = 'en';
  try {
    const pool = getPool();
    // UPSERT so admins who are only recognized via ADMIN_CHAT_ID env var
    // (not present in the admins table yet) still get their language saved.
    await pool.query(
      `INSERT INTO admins (telegram_chat_id, language_code, added_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (telegram_chat_id)
       DO UPDATE SET language_code = EXCLUDED.language_code`,
      [chatId, lang],
    );
  } catch (err) {
    console.error(`Failed to set admin language for ${chatId}:`, err);
  }
  adminLangCache.set(chatId, { lang, expires: Date.now() + CACHE_TTL_MS });
}
