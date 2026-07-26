const { launch, BASE } = require('./lib.cjs');
const fs = require('fs');
const SP = '/tmp/claude-0/-home-user-fleetfix/2a6f7e9c-fbab-5bd8-9ece-1b0d509d913c/scratchpad/';

const DESCRIBE = () => {
  const el = document.activeElement;
  if (!el || el === document.body) return { tag: 'BODY' };
  const cs = getComputedStyle(el);
  const r = el.getBoundingClientRect();
  return {
    tag: el.tagName, id: el.id || null,
    cls: (typeof el.className === 'string' ? el.className : '') || null,
    text: (el.textContent || el.value || '').trim().replace(/\s+/g, ' ').slice(0, 42),
    href: el.getAttribute('href'), ariaLabel: el.getAttribute('aria-label'),
    tabindex: el.getAttribute('tabindex'),
    outline: cs.outlineStyle + ' ' + cs.outlineWidth + ' ' + cs.outlineColor,
    outlineOffset: cs.outlineOffset, boxShadow: cs.boxShadow.slice(0, 100),
    borderColor: cs.borderTopColor, matchesFV: el.matches(':focus-visible'),
    rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
    onscreen: r.width > 0 && r.height > 0 && r.right > 0 && r.bottom > 0 && r.left < innerWidth && r.top < innerHeight,
  };
};

(async () => {
  const path = process.argv[2] || '/';
  const width = Number(process.argv[3] || 1440);
  const { browser, page } = await launch({ width, height: 900 });
  await page.goto(BASE + path, { waitUntil: 'networkidle' });
  console.log(`\n########## ${path} @ ${width}w ##########`);

  // ---------- SKIP LINK ----------
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.keyboard.press('Tab');
  const skip = await page.evaluate(DESCRIBE);
  console.log('\n--- SKIP LINK (first Tab) ---');
  console.log(JSON.stringify(skip));
  fs.writeFileSync(SP + 'skip_' + width + path.replace(/\//g, '_') + '.png',
    await page.screenshot({ clip: { x: 0, y: 0, width: 500, height: 90 } }));
  await page.keyboard.press('Enter');
  await page.waitForTimeout(600);
  console.log('after Enter:', JSON.stringify(await page.evaluate(() => ({
    url: location.href, scrollY: Math.round(scrollY),
    active: document.activeElement.tagName + '#' + (document.activeElement.id || '') + '.' + (typeof document.activeElement.className === 'string' ? document.activeElement.className : ''),
  }))));

  // ---------- FULL TAB ORDER ----------
  await page.goto(BASE + path, { waitUntil: 'networkidle' });
  await page.evaluate(() => window.scrollTo(0, 0));
  const order = []; const seen = new Map(); let first = null;
  for (let i = 0; i < 140; i++) {
    await page.keyboard.press('Tab');
    const d = await page.evaluate(DESCRIBE);
    if (d.tag === 'BODY') { order.push({ i, note: 'focus left document (browser UI)' }); break; }
    const key = [d.tag, d.id, d.cls, d.text, d.href].join('|');
    if (i === 0) first = key;
    else if (key === first) { order.push({ i, note: 'wrapped to first focusable' }); break; }
    if (seen.has(key) && i - seen.get(key) <= 1) { order.push({ i, note: 'TRAP: repeated ' + key }); break; }
    seen.set(key, i);
    order.push({ i, ...d });
  }
  console.log('\n--- TAB ORDER (' + order.length + ' stops) ---');
  order.forEach(o => {
    if (o.note) return console.log(`  ${o.i}: ** ${o.note} **`);
    const ring = !o.outline.startsWith('none') ? 'OUTLINE ' + o.outline + ' off=' + o.outlineOffset
      : (o.boxShadow !== 'none' ? 'shadow-only: ' + o.boxShadow : '>>> NO VISIBLE RING <<<');
    console.log(`  ${String(o.i).padStart(3)}: ${o.tag}${o.id ? '#' + o.id : ''}${o.cls ? '.' + o.cls.trim().split(/\s+/).join('.') : ''} @y=${o.rect.y}${o.onscreen ? '' : ' [OFFSCREEN]'} fv=${o.matchesFV} | ${ring} | "${o.text}"`);
  });

  // ---------- FAQ details keyboard ----------
  console.log('\n--- FAQ <details> KEYBOARD ---');
  const sums = await page.$$('.faq summary');
  console.log('summary count:', sums.length);
  if (sums.length) {
    const s = sums[0];
    await s.evaluate(n => n.scrollIntoView({ block: 'center' }));
    await s.focus();
    const st = async () => await s.evaluate(n => ({ open: n.parentElement.open, focused: document.activeElement === n }));
    console.log('initial:', JSON.stringify(await st()));
    await page.keyboard.press('Enter'); await page.waitForTimeout(200);
    console.log('after Enter:', JSON.stringify(await st()));
    await page.keyboard.press('Enter'); await page.waitForTimeout(200);
    console.log('after Enter again:', JSON.stringify(await st()));
    await page.keyboard.press('Space'); await page.waitForTimeout(200);
    console.log('after Space:', JSON.stringify(await st()));
    await page.keyboard.press('Space'); await page.waitForTimeout(200);
    console.log('after Space again:', JSON.stringify(await st()));
    // does answer content become tab-reachable when open?
    await page.keyboard.press('Enter'); await page.waitForTimeout(150);
    await page.keyboard.press('Tab');
    console.log('Tab from open summary lands on:', JSON.stringify(await page.evaluate(DESCRIBE)).slice(0, 200));
  }
  await browser.close();
})();
