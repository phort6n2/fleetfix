const { chromium } = require('/home/user/fleetfix/node_modules/playwright');
const EXEC = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const BASE = 'http://localhost:4173';

async function launch(opts = {}) {
  const browser = await chromium.launch({ executablePath: EXEC, args: ['--no-sandbox'] });
  const context = await browser.newContext({
    viewport: { width: opts.width || 1440, height: opts.height || 900 },
    deviceScaleFactor: 1,
    reducedMotion: opts.reducedMotion,
    isMobile: false,
  });
  const page = await context.newPage();
  return { browser, context, page };
}

// ---- contrast math ----
function srgb(c) { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
function lum([r, g, b]) { return 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b); }
function ratio(a, b) { const l1 = lum(a), l2 = lum(b); const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1]; return (hi + 0.05) / (lo + 0.05); }
function hex(c) { return '#' + c.slice(0, 3).map(v => Math.round(v).toString(16).padStart(2, '0')).join(''); }
function parseRGB(s) {
  const m = String(s).match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const p = m[1].split(/[ ,\/]+/).filter(Boolean).map(Number);
  return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1];
}
function over(fg, bg) { // fg has alpha
  const a = fg[3];
  return [fg[0] * a + bg[0] * (1 - a), fg[1] * a + bg[1] * (1 - a), fg[2] * a + bg[2] * (1 - a), 1];
}
function fromHex(h) {
  h = h.replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16), 1];
}

module.exports = { launch, ratio, hex, parseRGB, over, fromHex, BASE, lum };
