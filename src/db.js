import pg from 'pg';

let pool;
let lastCircuitBreakerLog = 0;

/**
 * If the connection string uses the Supabase pooler (port 6543) but the
 * username is just "postgres" (missing the project-ref suffix), reconstruct
 * it using the project ref from SUPABASE_URL (or its hardcoded fallback).
 *
 * This makes the app resilient even if the DATABASE_URL env var isn't quite
 * correct — the code fixes it automatically.
 */
function normalizeUrl(url) {
  if (!url.includes(':6543')) return url; // direct connection, no fix needed

  // Use URL parser to reliably extract the username
  let parsed;
  try { parsed = new URL(url); } catch { return url; }

  // Already has a dot in the username → assume correct (e.g. postgres.xxxx)
  if (parsed.username !== 'postgres') return url;

  // Extract project ref from SUPABASE_URL env var (or hardcoded fallback)
  const supabaseUrl = process.env.SUPABASE_URL || 'https://brnrhhlcaoujlmgzxynq.supabase.co';
  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  if (!projectRef) return url; // can't fix — should not happen

  // Reconstruct with correct username
  parsed.username = `postgres.${projectRef}`;
  const fixed = parsed.toString();

  // URL class re-encodes %-encoded chars; restore original port if needed
  console.log(`[DB] Auto-fixed pooler username → postgres.${projectRef}`);
  return fixed;
}

export function getPool() {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is missing');
    }

    let dbUrl = normalizeUrl(process.env.DATABASE_URL);

    // Detect if using Supabase pooler (port 6543)
    const isPooler = dbUrl.includes(':6543');

    // PgBouncer transaction mode requires pgbouncer=true to disable prepared statements.
    // Auto-append if using port 6543 but missing the parameter.
    if (isPooler && !dbUrl.includes('pgbouncer=true')) {
      dbUrl += (dbUrl.includes('?') ? '&' : '?') + 'pgbouncer=true';
    }

    pool = new pg.Pool({
      connectionString: dbUrl,
      // Serverless: keep connections minimal per instance.
      // Supabase free tier limits to 15 total; each Vercel instance only needs 1-2.
      max: 2,
      // Close idle connections fast — Vercel instances can be killed at any time,
      // and zombie connections would otherwise block the pool.
      idleTimeoutMillis: 5000,
      // Don't wait forever for a connection
      connectionTimeoutMillis: 5000,
      // Supabase requires SSL (works for both direct and pooled connections)
      ssl: { rejectUnauthorized: false },
      // Automatically clean up idle connections when using the pooler
      allowExitOnIdle: isPooler,
    });

    // Log pool errors so we can debug connection issues
    pool.on('error', (err) => {
      console.error('pg-pool unexpected error on idle client:', err.message);
    });
  }
  return pool;
}

/**
 * Reset the pool (destroy all connections) — useful when the circuit breaker
 * trips and we need to start fresh.
 */
export function resetPool() {
  if (pool) {
    pool.end().catch(() => {});
    pool = null;
  }
}

/**
 * Helper: execute a query with automatic error wrapping and circuit-breaker
 * recovery. When PgBouncer temporarily blocks new connections after too many
 * auth failures, this waits and retries once.
 */
export async function query(text, params) {
  const p = getPool();
  try {
    const result = await p.query(text, params);
    return result;
  } catch (err) {
    // ── Circuit breaker: PgBouncer blocks after too many auth failures ──
    if (err.code === 'XX000' && err.message?.includes('too many authentication failures')) {
      const now = Date.now();
      if (now - lastCircuitBreakerLog > 60_000) {
        lastCircuitBreakerLog = now;
        console.error(
          '[DB] PgBouncer circuit breaker tripped — too many auth failures.\n' +
          '       This usually means the DATABASE_URL username is wrong.\n' +
          '       Expected format for pooler: postgres.<project_ref>\n' +
          `       Current URL: ${process.env.DATABASE_URL ? process.env.DATABASE_URL.replace(/\/\/[^:]+:[^@]+@/, '//USER:PASS@') : 'NOT SET'}\n` +
          '       The circuit breaker auto-resets after ~30s.'
        );
      }
      // Reset pool so the next call creates a fresh connection
      resetPool();
      throw new Error('Database temporarily unavailable. Please try again in a moment.');
    }

    // ── Pool exhaustion ──
    if (err.code === 'XX000' && err.message?.includes('max clients reached')) {
      console.error('DB pool exhausted — consider reducing pool max or using Supabase connection pooler (port 6543).');
    }

    throw err;
  }
}
