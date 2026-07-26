const { launch, ratio, hex, parseRGB, over, BASE } = require('./lib.cjs');

const PAGES = ['/', '/denver/', '/fleet-auto-glass/', '/privacy/'];

const COLLECT = () => {
  const out = [];
  const seenSig = new Set();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const els = new Set();
  let n;
  while ((n = walker.nextNode())) {
    if (!n.nodeValue.trim()) continue;
    els.add(n.parentElement);
  }
  els.forEach(el => {
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none' || cs.opacity === '0') return;
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return;
    // off-screen sr-only?
    if (r.right < -1000 || r.bottom < -1000) return;
    const size = parseFloat(cs.fontSize);
    const weight = parseInt(cs.fontWeight, 10) || 400;
    const large = size >= 24 || (size >= 18.66 && weight >= 700);
    // effective background chain
    const chain = [];
    let p = el, gradient = null;
    while (p) {
      const pcs = getComputedStyle(p);
      if (pcs.backgroundImage && pcs.backgroundImage !== 'none' && !gradient) {
        gradient = { sel: sel(p), img: pcs.backgroundImage.slice(0, 90) };
      }
      const bc = pcs.backgroundColor;
      if (bc && bc !== 'rgba(0, 0, 0, 0)' && bc !== 'transparent') chain.push(bc);
      const op = parseFloat(pcs.opacity);
      if (bc && bc !== 'rgba(0, 0, 0, 0)') { const m = bc.match(/rgba?\(([^)]+)\)/); const parts = m[1].split(/[ ,\/]+/).filter(Boolean); if (parts.length < 4 || Number(parts[3]) === 1) break; }
      p = p.parentElement;
    }
    const rec = {
      sel: sel(el),
      text: (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 55),
      color: cs.color,
      fontSize: size, fontWeight: weight, large,
      bgChain: chain,
      gradient,
      rect: { x: r.x, y: r.y, w: r.width, h: r.height },
    };
    const sig = rec.color + '|' + chain.join('|') + '|' + size + '|' + weight + '|' + rec.sel;
    if (seenSig.has(sig)) return;
    seenSig.add(sig);
    out.push(rec);
  });

  function sel(el) {
    if (!el) return '';
    let s = el.tagName.toLowerCase();
    if (el.id) s += '#' + el.id;
    if (el.className && typeof el.className === 'string') s += '.' + el.className.trim().split(/\s+/).join('.');
    return s;
  }
  return out;
};

(async () => {
  const { browser, page } = await launch({ width: 1440, height: 1000 });
  const results = {};
  for (const path of PAGES) {
    await page.goto(BASE + path, { waitUntil: 'networkidle' });
    const recs = await page.evaluate(COLLECT);
    // resolve backgrounds
    for (const r of recs) {
      let bg = [255, 255, 255, 1];
      for (let i = r.bgChain.length - 1; i >= 0; i--) {
        const c = parseRGB(r.bgChain[i]);
        bg = over(c, bg);
      }
      r.resolvedBg = bg;
      if (r.gradient) {
        // sample the dominant rendered pixel in the element's box
        const clip = { x: Math.max(0, r.rect.x), y: Math.max(0, r.rect.y), width: Math.min(r.rect.w, 1400), height: Math.min(r.rect.h, 200) };
        if (clip.width > 2 && clip.height > 2 && clip.y < 950) {
          try {
            const buf = await page.screenshot({ clip });
            const mode = await sampleMode(page, buf);
            if (mode) { r.sampledBg = mode; bg = mode; }
          } catch (e) { r.sampleErr = String(e).slice(0, 60); }
        }
      }
      const fg = over(parseRGB(r.color), bg);
      r.fgHex = hex(fg); r.bgHex = hex(bg);
      r.ratio = +ratio(fg, bg).toFixed(2);
      r.required = r.large ? 3 : 4.5;
      r.pass = r.ratio >= r.required;
    }
    results[path] = recs;
  }
  await browser.close();
  console.log(JSON.stringify(results, null, 1));
})();

async function sampleMode(page, buf) {
  const b64 = buf.toString('base64');
  return await page.evaluate(async (b64) => {
    const img = new Image();
    img.src = 'data:image/png;base64,' + b64;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = img.width; c.height = img.height;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const d = ctx.getImageData(0, 0, c.width, c.height).data;
    const counts = new Map();
    for (let i = 0; i < d.length; i += 4) {
      const k = d[i] + ',' + d[i + 1] + ',' + d[i + 2];
      counts.set(k, (counts.get(k) || 0) + 1);
    }
    let best = null, bestN = 0;
    for (const [k, v] of counts) if (v > bestN) { bestN = v; best = k; }
    const total = d.length / 4;
    if (bestN / total < 0.15) return null;
    return best.split(',').map(Number).concat([1]);
  }, b64);
}
