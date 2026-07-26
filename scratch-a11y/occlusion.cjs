const { launch, BASE } = require('./lib.cjs');
const fs = require('fs');
const SP = '/tmp/claude-0/-home-user-fleetfix/2a6f7e9c-fbab-5bd8-9ece-1b0d509d913c/scratchpad/';

(async () => {
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    const { browser, page } = await launch({ width: w, height: h });
    await page.goto(BASE + '/', { waitUntil: 'networkidle' });
    await page.evaluate(() => window.scrollTo(0, 0));
    console.log(`\n===== SC 2.4.11 FOCUS NOT OBSCURED @ ${w}w =====`);
    const bad = [];
    for (let i = 0; i < 90; i++) {
      await page.keyboard.press('Tab');
      const d = await page.evaluate(() => {
        const a = document.activeElement; if (a === document.body) return null;
        const r = a.getBoundingClientRect();
        const stickies = [...document.querySelectorAll('.hdr, .callbar, .topbar')]
          .filter(s => { const c = getComputedStyle(s); return (c.position === 'fixed' || c.position === 'sticky') && c.display !== 'none'; })
          .filter(s => !a.closest('.' + s.className.trim().split(/\s+/)[0]));
        let fullyHidden = null, partly = null;
        for (const s of stickies) {
          const sr = s.getBoundingClientRect();
          const ov = Math.max(0, Math.min(r.bottom, sr.bottom) - Math.max(r.top, sr.top));
          if (ov <= 0) continue;
          const frac = ov / r.height;
          if (frac >= 0.999) fullyHidden = { by: s.className, frac: 1 };
          else partly = { by: s.className, frac: +frac.toFixed(2) };
        }
        // also fully below/above the viewport?
        const offViewport = r.bottom <= 0 || r.top >= innerHeight;
        return {
          t: a.tagName + (a.id ? '#' + a.id : '') + (typeof a.className === 'string' && a.className ? '.' + a.className.trim().split(/\s+/).join('.') : ''),
          txt: (a.textContent || a.value || '').trim().replace(/\s+/g, ' ').slice(0, 34),
          y: Math.round(r.top), b: Math.round(r.bottom), fullyHidden, partly, offViewport,
        };
      });
      if (!d) break;
      if (d.fullyHidden || d.offViewport) bad.push({ ...d, sev: 'FULLY OBSCURED' });
      else if (d.partly && d.partly.frac > 0.25) bad.push({ ...d, sev: 'partly obscured' });
    }
    console.log(JSON.stringify(bad, null, 1));
    if (bad.length) {
      // screenshot the worst one
      const worst = bad.find(b => b.sev === 'FULLY OBSCURED') || bad[0];
      console.log('worst:', worst.t, worst.txt);
    }
    await browser.close();
  }

  // privacy page skip link
  const { browser, page } = await launch({ width: 1440, height: 900 });
  await page.goto(BASE + '/privacy/', { waitUntil: 'networkidle' });
  await page.keyboard.press('Tab');
  const s = await page.evaluate(() => { const a = document.activeElement; return { cls: a.className, text: a.textContent.trim(), href: a.getAttribute('href'), resolved: a.href }; });
  console.log('\n===== /privacy/ skip link =====');
  console.log(JSON.stringify(s));
  console.log('#quote exists on /privacy/?', await page.evaluate(() => !!document.getElementById('quote')));
  console.log('#main exists?', await page.evaluate(() => !!document.getElementById('main')));
  console.log('anything links to #main?', await page.evaluate(() => [...document.querySelectorAll('a[href*="#main"]')].length));
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1200);
  console.log('after Enter, url =', page.url());
  fs.writeFileSync(SP + 'privacy-skip.png', await page.screenshot({ clip: { x: 0, y: 0, width: 500, height: 90 } }));
  await browser.close();
})();
