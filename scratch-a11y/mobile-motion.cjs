const { launch, BASE, ratio, hex, parseRGB, over } = require('./lib.cjs');
const fs = require('fs');
const SP = '/tmp/claude-0/-home-user-fleetfix/2a6f7e9c-fbab-5bd8-9ece-1b0d509d913c/scratchpad/';

(async () => {
  // ================= A. 390px keyboard =================
  {
    const { browser, page } = await launch({ width: 390, height: 844 });
    await page.goto(BASE + '/', { waitUntil: 'networkidle' });
    console.log('===== 390w: callbar & header phone =====');
    console.log(await page.evaluate(() => {
      const cb = document.querySelector('.callbar');
      const tel = document.querySelector('.hdr-tel');
      return JSON.stringify({
        callbarDisplay: getComputedStyle(cb).display,
        callbarRect: cb.getBoundingClientRect().toJSON(),
        callbarLinks: [...cb.querySelectorAll('a')].map(a => ({ text: a.textContent.trim(), href: a.href, ariaLabel: a.getAttribute('aria-label'), rect: { w: Math.round(a.getBoundingClientRect().width), h: Math.round(a.getBoundingClientRect().height) } })),
        hdrTelVisibleLabel: getComputedStyle(document.querySelector('.hdr-tel .lbl')).display,
        hdrTelSrText: document.querySelector('.hdr-tel .sr').textContent,
        hdrTelRect: { w: Math.round(tel.getBoundingClientRect().width), h: Math.round(tel.getBoundingClientRect().height) },
        bodyPaddingBottom: getComputedStyle(document.body).paddingBottom,
        hdrQuoteDisplay: getComputedStyle(document.querySelector('.hdr-quote')).display,
        navDisplay: getComputedStyle(document.querySelector('.nav')).display,
        topbarItem2Display: getComputedStyle(document.querySelectorAll('.topbar-i')[1]).display,
      }, null, 1);
    }));

    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Accessibility.enable');
    const { nodes } = await cdp.send('Accessibility.getFullAXTree');
    console.log('\n390w AX names for phone/callbar controls:');
    nodes.filter(n => !n.ignored && n.role && n.role.value === 'link').forEach(n => {
      const nm = (n.name && n.name.value) || '';
      if (/720|Call|quote|Quote/i.test(nm) || !nm) console.log('  link: "' + nm + '"');
    });
    await cdp.detach();

    // is the primary nav reachable at all at 390? (nav display:none)
    console.log('\n390w: primary nav links reachable by keyboard?');
    await page.evaluate(() => window.scrollTo(0, 0));
    const stops = [];
    for (let i = 0; i < 90; i++) {
      await page.keyboard.press('Tab');
      const d = await page.evaluate(() => {
        const a = document.activeElement; if (a === document.body) return null;
        const r = a.getBoundingClientRect();
        const cs = getComputedStyle(a);
        // sticky header / fixed callbar occlusion
        const hdr = document.querySelector('.hdr').getBoundingClientRect();
        const cb = document.querySelector('.callbar');
        const cbr = getComputedStyle(cb).display === 'none' ? null : cb.getBoundingClientRect();
        return {
          t: a.tagName + (a.id ? '#' + a.id : '') + (typeof a.className === 'string' && a.className ? '.' + a.className.trim().split(/\s+/).join('.') : ''),
          txt: (a.textContent || a.value || '').trim().replace(/\s+/g, ' ').slice(0, 32),
          y: Math.round(r.y), b: Math.round(r.bottom),
          occludedByHeader: r.top < hdr.bottom && r.bottom > hdr.top && a.closest('.hdr') === null && a.closest('.topbar') === null && a.className !== 'skip',
          occludedByCallbar: !!cbr && r.bottom > cbr.top && r.top < cbr.bottom && !a.closest('.callbar'),
          outline: cs.outlineStyle + ' ' + cs.outlineWidth,
        };
      });
      if (!d) { stops.push('-- left document at ' + i); break; }
      stops.push(d);
    }
    const occ = stops.filter(s => s.occludedByHeader || s.occludedByCallbar);
    console.log('  total stops:', stops.length);
    console.log('  first 6:', JSON.stringify(stops.slice(0, 6)));
    console.log('  callbar stops:', JSON.stringify(stops.filter(s => s.t && s.t.includes('callbar') === false && /Call now|Free quote/.test(s.txt || ''))));
    console.log('  OCCLUDED focus stops (SC 2.4.11):', occ.length, JSON.stringify(occ.slice(0, 12), null, 1));
    console.log('  no-outline stops:', JSON.stringify(stops.filter(s => s.outline && s.outline.startsWith('none')).map(s => s.t)));
    await browser.close();
  }

  // ================= B. reduced motion =================
  {
    console.log('\n\n===== PREFERS-REDUCED-MOTION =====');
    for (const rm of ['no-preference', 'reduce']) {
      const { browser, page } = await launch({ width: 1440, height: 900, reducedMotion: rm });
      await page.goto(BASE + '/', { waitUntil: 'networkidle' });
      const css = await page.evaluate(() => ({
        mqMatches: matchMedia('(prefers-reduced-motion: reduce)').matches,
        btnTransition: getComputedStyle(document.querySelector('.btn')).transitionDuration,
        cardTransition: getComputedStyle(document.querySelector('.card')).transitionDuration,
        inputTransition: getComputedStyle(document.getElementById('f-name')).transitionDuration,
        summaryAfter: getComputedStyle(document.querySelector('.faq summary'), '::after').transitionDuration,
        htmlScrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
        bodyScrollBehavior: getComputedStyle(document.body).scrollBehavior,
      }));
      // does JS smooth-scroll still run? instrument scrollIntoView
      await page.evaluate(() => {
        window.__smooth = [];
        const orig = Element.prototype.scrollIntoView;
        Element.prototype.scrollIntoView = function (o) { window.__smooth.push(o && o.behavior); return orig.apply(this, arguments); };
      });
      // force a validation failure -> triggers bad.scrollIntoView({behavior:'smooth'})
      await page.click('#ff-submit');
      await page.waitForTimeout(500);
      const smooth = await page.evaluate(() => window.__smooth);
      console.log(`  reducedMotion=${rm}: mq=${css.mqMatches} ${JSON.stringify(css)}`);
      console.log(`     JS scrollIntoView behaviors observed: ${JSON.stringify(smooth)}`);
      // grep source for any guard
      await browser.close();
    }
    const src = fs.readFileSync('/home/user/fleetfix/landing/fleetfix.html', 'utf8');
    console.log('  source contains matchMedia(prefers-reduced-motion) guard in JS?', /matchMedia\([^)]*reduced-motion/.test(src));
    console.log('  occurrences of behavior: \'smooth\':', (src.match(/behavior:\s*'smooth'/g) || []).length);
  }

  // ================= C. focus-ring pixel measurement on pristine input =====
  {
    console.log('\n\n===== FOCUS RING PIXELS (pristine, valid input) =====');
    const { browser, page } = await launch({ width: 1440, height: 900 });
    await page.goto(BASE + '/', { waitUntil: 'networkidle' });
    await page.fill('#f-name', 'Jane Doe');
    await page.evaluate(() => document.getElementById('f-name').blur());
    await page.waitForTimeout(300);
    const rect = await page.evaluate(() => { const r = document.getElementById('f-name').getBoundingClientRect(); return { x: Math.round(r.x) - 8, y: Math.round(r.y) - 8, width: Math.round(r.width) + 16, height: Math.round(r.height) + 16 }; });
    fs.writeFileSync(SP + 'input-unfocused.png', await page.screenshot({ clip: rect }));
    await page.focus('#f-name');
    await page.keyboard.press('Shift+Tab'); await page.keyboard.press('Tab');
    await page.waitForTimeout(400);
    const st = await page.evaluate(() => { const el = document.getElementById('f-name'); const cs = getComputedStyle(el); return { fv: el.matches(':focus-visible'), invalid: el.getAttribute('aria-invalid'), outline: cs.outlineStyle + ' ' + cs.outlineWidth, shadow: cs.boxShadow, border: cs.borderTopColor }; });
    console.log('  pristine+valid focused:', JSON.stringify(st));
    fs.writeFileSync(SP + 'input-focused.png', await page.screenshot({ clip: rect }));
    // pixel diff row through the border
    const diff = await page.evaluate(async () => null);
    const ringColor = over(parseRGB('rgba(47, 126, 196, 0.18)'), [255, 255, 255, 1]);
    console.log('  computed ring colour over white:', hex(ringColor), 'contrast vs white =', ratio(ringColor, [255, 255, 255, 1]).toFixed(2) + ':1');
    console.log('  focused border #2f7ec4 vs white card:', ratio([47, 126, 196, 1], [255, 255, 255, 1]).toFixed(2) + ':1');
    console.log('  unfocused border #dde4ed vs white:', ratio([221, 228, 237, 1], [255, 255, 255, 1]).toFixed(2) + ':1');
    console.log('  focused vs unfocused border change:', ratio([47, 126, 196, 1], [221, 228, 237, 1]).toFixed(2) + ':1');
    await browser.close();
  }
})();
