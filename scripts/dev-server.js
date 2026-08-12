/**
 * Local dev server — serves static files from /public
 * and proxies /api/* requests to the deployed Vercel backend.
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.resolve(__dirname, '../public');
const BACKEND = 'https://telegram-food-ordering-bot.vercel.app';
const PORT = process.env.PORT || 3000;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  // Proxy API calls to the real backend
  if (url.pathname.startsWith('/api/')) {
    try {
      const backendUrl = `${BACKEND}${url.pathname}${url.search}`;
      const options = {
        method: req.method,
        headers: {
          'Content-Type': req.headers['content-type'] || 'application/json',
        },
      };

      // Forward body for POST/PUT
      let body = null;
      if (req.method === 'POST' || req.method === 'PUT') {
        body = await new Promise((resolve) => {
          let data = '';
          req.on('data', (chunk) => (data += chunk));
          req.on('end', () => resolve(data));
        });
      }

      const backendRes = await fetch(backendUrl, {
        ...options,
        body: body || undefined,
      });

      res.writeHead(backendRes.status, {
        'Content-Type': backendRes.headers.get('content-type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
      });

      const text = await backendRes.text();
      res.end(text);
    } catch (err) {
      console.error('Proxy error:', err.message);
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Backend unreachable' }));
    }
    return;
  }

  // Serve static files
  let filePath = path.join(PUBLIC, url.pathname === '/' ? 'index.html' : url.pathname);

  // Default to index.html for SPA-like routing (though we don't use it)
  if (!fs.existsSync(filePath)) {
    filePath = path.join(PUBLIC, 'index.html');
  }

  const ext = path.extname(filePath);
  const mime = MIME[ext] || 'application/octet-stream';

  try {
    const content = fs.readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': mime });
    res.end(content);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`\n  ✦ Dev server running: http://localhost:${PORT}`);
  console.log(`  ✦ API proxied to: ${BACKEND}\n`);
});
