#!/usr/bin/env node
/**
 * Tiny static server for local checks — mirrors Vercel's trailingSlash
 * behaviour so links and redirects behave the same as production.
 *
 *   npm run serve:landing            # http://localhost:4173
 *   PORT=5000 npm run serve:landing
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const SITE = require('./site.config.cjs');

const ROOT = path.resolve(process.env.ROOT || path.join(__dirname, '..', 'quote-site'));
const PORT = Number(process.env.PORT) || 4173;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',   // must be JS, or the page dies on a parse error
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
};

http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  const safe = path.normalize(url).replace(/^(\.\.[/\\])+/, '');
  let file = path.join(ROOT, safe);

  // Enforce the configured trailing-slash convention with a real redirect.
  const isFile = fs.existsSync(file) && fs.statSync(file).isFile();
  if (!isFile && !path.extname(safe)) {
    const want = SITE.TRAILING_SLASH;
    const has = safe.endsWith('/');
    if (safe !== '/' && want !== has) {
      res.writeHead(308, { Location: want ? safe + '/' : safe.replace(/\/$/, '') });
      return res.end();
    }
    file = path.join(ROOT, safe, 'index.html');
  }

  fs.readFile(file, (err, buf) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('404 ' + safe);
    }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    res.end(buf);
  });
}).listen(PORT, () => {
  console.log(`Serving ${path.relative(process.cwd(), ROOT)} at http://localhost:${PORT}`);
});
