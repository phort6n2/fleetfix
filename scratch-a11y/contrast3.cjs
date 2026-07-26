const { launch, ratio, hex, parseRGB, over, BASE } = require('./lib.cjs');

const TARGETS = [
  ['.hero .eyebrow', 'hero eyebrow (uppercase pill)'],
  ['.hero h1', 'hero h1'],
  ['.hero-sub', 'hero sub-text'],
  ['.hero-pts li', 'hero bullet'],
  ['.ctaband h2', 'CTA band h2'],
  ['.ctaband p', 'CTA band body'],
  ['.ctaband', 'CTA band (container color)'],
];

(async () => {
  const { browser, page } = await launch({ width: 1440, height: 1000 });
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  for (const [sel, label] of TARGETS) {
    const el = await page.$(sel);
    if (!el) { console.log('missing ' + sel); continue; }
    await el.evaluate(n => n.scrollIntoView({ block: 'center' }));
    await page.waitForTimeout(80);
    const info = await el.evaluate(n => {
      const cs = getComputedStyle(n); const r = n.getBoundingClientRect();
      return { color: cs.color, px: parseFloat(cs.fontSize), w: parseInt(cs.fontWeight) || 400,
               rect: { x: r.x, y: r.y, w: r.width, h: r.height },
               text: (n.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40) };
    });
    // blank out ALL text on the page so mode-sample yields pure background
    await page.addStyleTag({ content: '*{color:transparent!important;text-shadow:none!important}' });
    await page.waitForTimeout(60);
    const clip = { x: Math.max(0, Math.round(info.rect.x)), y: Math.max(0, Math.round(info.rect.y)),
                   width: Math.max(2, Math.min(Math.round(info.rect.w), 1400)),
                   height: Math.max(2, Math.min(Math.round(info.rect.h), 100)) };
    if (clip.y + clip.height > 1000) clip.height = 1000 - clip.y;
    const buf = await page.screenshot({ clip });
    const bg = await mode(page, buf);
    await page.reload({ waitUntil: 'networkidle' });
    if (!bg) { console.log('no bg for ' + sel); continue; }
    const fg = over(parseRGB(info.color), bg);
    const large = info.px >= 24 || (info.px >= 18.66 && info.w >= 700);
    const req = large ? 3 : 4.5; const rr = +ratio(fg, bg).toFixed(2);
    console.log(`${rr >= req ? 'PASS' : 'FAIL'} ${String(rr).padStart(6)}:1 (need ${req})  ${hex(fg)} on ${hex(bg)}  ${info.px}px/${info.w}${large ? ' LARGE' : ''}  ${label}  "${info.text}"`);
  }

  // placeholder colour
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  const ph = await page.evaluate(() => {
    const i = document.getElementById('f-name');
    const cs = getComputedStyle(i, '::placeholder');
    return { color: cs.color, bg: getComputedStyle(i).backgroundColor, px: cs.fontSize || getComputedStyle(i).fontSize };
  });
  console.log('\nplaceholder computed:', JSON.stringify(ph));
  const pfg = parseRGB(ph.color), pbg = parseRGB(ph.bg);
  if (pfg && pbg) {
    const f = over(pfg, pbg), rr = +ratio(f, pbg).toFixed(2);
    console.log(`placeholder text: ${rr}:1 (need 4.5)  ${hex(f)} on ${hex(pbg)}  ${ph.px}  => ${rr >= 4.5 ? 'PASS' : 'FAIL'}`);
  }
  await browser.close();
})();

async function mode(page, buf) {
  const b64 = buf.toString('base64');
  return await page.evaluate(async (b64) => {
    const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
    const ctx = c.getContext('2d'); ctx.drawImage(img, 0, 0);
    const d = ctx.getImageData(0, 0, c.width, c.height).data;
    const counts = new Map();
    for (let i = 0; i < d.length; i += 4) { const k = d[i] + ',' + d[i + 1] + ',' + d[i + 2]; counts.set(k, (counts.get(k) || 0) + 1); }
    let best = null, bestN = 0; for (const [k, v] of counts) if (v > bestN) { bestN = v; best = k; }
    return best ? best.split(',').map(Number).concat([1]) : null;
  }, b64);
}
