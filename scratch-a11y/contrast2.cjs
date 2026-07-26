const { launch, ratio, hex, parseRGB, over, BASE } = require('./lib.cjs');

// Targeted: elements sitting on gradients / dark surfaces. Scroll into view, sample rendered bg.
const TARGETS = [
  ['.topbar .topbar-i span', 'topbar text'],
  ['.topbar strong', 'topbar strong'],
  ['.hero .eyebrow', 'hero eyebrow'],
  ['.hero h1', 'hero h1'],
  ['.hero-sub', 'hero sub'],
  ['.hero-pts li', 'hero bullet'],
  ['.btn-ghost', 'hero ghost btn label'],
  ['.hero .btn-primary', 'hero amber btn'],
  ['.ctaband h2', 'ctaband h2'],
  ['.ctaband p', 'ctaband body'],
  ['.ctaband .btn-primary', 'ctaband amber btn'],
  ['.ctaband .btn-ghost', 'ctaband ghost btn'],
  ['.ftr-brand p', 'footer body text'],
  ['.ftr h3', 'footer heading'],
  ['.ftr-list a', 'footer link'],
  ['.ftr-nap span', 'footer NAP text'],
  ['.ftr-bot span', 'footer copyright'],
  ['.ftr-bot a', 'footer bottom link'],
  ['.ftr-note', 'footer small print'],
  ['.hdr-tel', 'header phone button'],
  ['.hdr-quote', 'header Free Quote btn'],
  ['.callbar .btn-blue', 'callbar call btn'],
  ['.callbar .btn-primary', 'callbar quote btn'],
  ['.card .more', 'card "more" link'],
  ['.card p', 'card muted p'],
  ['.field label', 'form label'],
  ['.err', 'field error text'],
  ['.form-alert', 'form alert text'],
  ['.callout b', 'callout bold'],
  ['.prose a', 'prose link'],
  ['.faq summary', 'faq summary'],
  ['.faq .ans', 'faq answer'],
  ['.quote blockquote', 'review quote'],
  ['.quote .src', 'review source'],
  ['.trust-i b', 'trust heading'],
  ['.trust-i span span', 'trust muted'],
];

(async () => {
  const { browser, page } = await launch({ width: 1440, height: 1000 });
  const out = [];
  for (const path of ['/', '/privacy/']) {
    await page.goto(BASE + path, { waitUntil: 'networkidle' });
    // force error + alert states visible so we can measure them
    await page.evaluate(() => {
      const f = document.querySelector('.field'); if (f) f.classList.add('bad');
      const a = document.getElementById('ff-alert');
      if (a) { document.getElementById('ff-alert-msg').textContent = 'Sample error message text'; a.classList.add('on'); }
    });
    for (const [sel, label] of TARGETS) {
      const el = await page.$(sel);
      if (!el) continue;
      try { await el.scrollIntoViewIfNeeded(); } catch (e) { continue; }
      await page.waitForTimeout(60);
      const info = await el.evaluate(node => {
        const cs = getComputedStyle(node);
        const r = node.getBoundingClientRect();
        return { color: cs.color, fontSize: parseFloat(cs.fontSize), fontWeight: parseInt(cs.fontWeight) || 400,
                 rect: { x: r.x, y: r.y, w: r.width, h: r.height },
                 text: (node.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 45) };
      });
      if (info.rect.w < 2 || info.rect.h < 2) continue;
      const clip = { x: Math.max(0, Math.round(info.rect.x)), y: Math.max(0, Math.round(info.rect.y)),
                     width: Math.min(Math.round(info.rect.w), 1400), height: Math.min(Math.round(info.rect.h), 120) };
      if (clip.y + clip.height > 1000) clip.height = 1000 - clip.y;
      if (clip.height < 2) continue;
      const buf = await page.screenshot({ clip });
      const bg = await sampleMode(page, buf);
      if (!bg) { out.push({ path, label, sel, note: 'no dominant bg pixel' }); continue; }
      const fg = over(parseRGB(info.color), bg);
      const large = info.fontSize >= 24 || (info.fontSize >= 18.66 && info.fontWeight >= 700);
      const req = large ? 3 : 4.5;
      const rr = +ratio(fg, bg).toFixed(2);
      out.push({ path, label, sel, fg: hex(fg), bg: hex(bg), px: info.fontSize, w: info.fontWeight,
                 large, ratio: rr, req, pass: rr >= req, text: info.text });
    }
  }
  await browser.close();
  for (const o of out) {
    if (o.note) { console.log(`[${o.path}] ${o.label.padEnd(24)} -- ${o.note}`); continue; }
    console.log(`${o.pass ? 'PASS' : 'FAIL'} ${String(o.ratio).padStart(6)}:1 (need ${o.req})  ${o.fg} on ${o.bg}  ${String(o.px).padStart(6)}px/${o.w}${o.large ? ' LARGE' : ''}  [${o.path}] ${o.label}  "${o.text}"`);
  }
})();

async function sampleMode(page, buf) {
  const b64 = buf.toString('base64');
  return await page.evaluate(async (b64) => {
    const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
    const ctx = c.getContext('2d'); ctx.drawImage(img, 0, 0);
    const d = ctx.getImageData(0, 0, c.width, c.height).data;
    const counts = new Map();
    for (let i = 0; i < d.length; i += 4) { const k = d[i] + ',' + d[i + 1] + ',' + d[i + 2]; counts.set(k, (counts.get(k) || 0) + 1); }
    let best = null, bestN = 0;
    for (const [k, v] of counts) if (v > bestN) { bestN = v; best = k; }
    if (bestN / (d.length / 4) < 0.12) return null;
    return best.split(',').map(Number).concat([1]);
  }, b64);
}
