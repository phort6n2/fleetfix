const { launch, BASE, ratio, hex, parseRGB, over } = require('./lib.cjs');

(async () => {
  const { browser, page } = await launch({ width: 1440, height: 900 });
  for (const path of ['/', '/denver/', '/fleet-auto-glass/', '/privacy/']) {
    await page.goto(BASE + path, { waitUntil: 'networkidle' });
    console.log('\n################ ' + path + ' ################');

    console.log('\n--- LANDMARKS ---');
    console.log(await page.evaluate(() => JSON.stringify({
      header: document.querySelectorAll('header').length,
      main: document.querySelectorAll('main').length,
      footer: document.querySelectorAll('footer').length,
      nav: [...document.querySelectorAll('nav')].map(n => ({ label: n.getAttribute('aria-label'), labelledby: n.getAttribute('aria-labelledby') })),
      aside: document.querySelectorAll('aside').length,
      roleAttrs: [...document.querySelectorAll('[role]')].map(e => e.tagName + '[role=' + e.getAttribute('role') + ']' + (e.id ? '#' + e.id : '')),
      lang: document.documentElement.lang,
      title: document.title,
    }, null, 1)));

    console.log('\n--- CONTENT OUTSIDE ANY LANDMARK ---');
    console.log(await page.evaluate(() => {
      const out = [];
      const landmarkSel = 'header,main,footer,nav,aside,[role=banner],[role=main],[role=contentinfo],[role=navigation],[role=complementary],[role=search],[role=form],[role=region]';
      const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let n; const seen = new Set();
      while ((n = w.nextNode())) {
        const t = n.nodeValue.trim(); if (!t) continue;
        const p = n.parentElement;
        if (p.closest(landmarkSel)) continue;
        if (getComputedStyle(p).display === 'none') continue;
        let top = p; while (top.parentElement && top.parentElement !== document.body) top = top.parentElement;
        const k = top.tagName + '.' + (typeof top.className === 'string' ? top.className : '');
        if (seen.has(k)) continue; seen.add(k);
        out.push({ container: k, sampleText: t.slice(0, 60) });
      }
      return JSON.stringify(out, null, 1);
    }));

    console.log('\n--- HEADING OUTLINE ---');
    console.log(await page.evaluate(() => [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(h => {
      const cs = getComputedStyle(h);
      const vis = cs.display !== 'none' && cs.visibility !== 'hidden' && !!h.offsetParent;
      return '  '.repeat(+h.tagName[1] - 1) + h.tagName + (vis ? '' : ' [HIDDEN]') + ': ' + h.textContent.trim().replace(/\s+/g, ' ').slice(0, 60);
    }).join('\n')));

    console.log('\n--- IMAGES ---');
    console.log(await page.evaluate(() => JSON.stringify([...document.querySelectorAll('img')].map(i => ({
      src: i.getAttribute('src').split('/').pop(), alt: i.getAttribute('alt'),
      hasAltAttr: i.hasAttribute('alt'), role: i.getAttribute('role'),
      inLink: !!i.closest('a'), linkLabel: i.closest('a') && (i.closest('a').getAttribute('aria-label') || i.closest('a').textContent.trim().slice(0, 30)),
    })), null, 1)));

    console.log('\n--- SVG (decorative?) ---');
    console.log(await page.evaluate(() => {
      const all = [...document.querySelectorAll('svg')];
      return JSON.stringify({
        total: all.length,
        missingAriaHidden: all.filter(s => s.getAttribute('aria-hidden') !== 'true' && !s.getAttribute('role') && !s.querySelector('title')).map(s => (s.parentElement.tagName + '.' + (typeof s.parentElement.className === 'string' ? s.parentElement.className : '')).slice(0, 50)),
      }, null, 1);
    }));

    console.log('\n--- LINK/BUTTON ACCESSIBLE NAMES (icon-heavy) ---');
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Accessibility.enable');
    const { nodes } = await cdp.send('Accessibility.getFullAXTree');
    const KEEP = new Set(['link', 'button', 'banner', 'main', 'contentinfo', 'navigation', 'form', 'textbox', 'combobox', 'region', 'complementary', 'alert', 'image', 'group', 'disclosure triangle']);
    const lines = [];
    for (const n of nodes) {
      const role = n.role && n.role.value;
      if (!KEEP.has(role)) continue;
      if (n.ignored) continue;
      const name = (n.name && n.name.value) || '';
      lines.push(`  ${role}: "${name.slice(0, 80)}"${name ? '' : '   <<< NO ACCESSIBLE NAME'}`);
    }
    console.log(lines.join('\n'));
    // also: landmarks as seen by AX
    console.log('\n  AX landmark roles:', nodes.filter(n => !n.ignored && ['banner', 'main', 'contentinfo', 'navigation', 'region', 'complementary'].includes(n.role && n.role.value)).map(n => (n.role.value) + '["' + ((n.name && n.name.value) || '') + '"]').join(', '));
    await cdp.detach();

    console.log('\n--- DUPLICATE IDs / ARIA REFS ---');
    console.log(await page.evaluate(() => {
      const ids = {}; [...document.querySelectorAll('[id]')].forEach(e => { ids[e.id] = (ids[e.id] || 0) + 1; });
      const dupes = Object.entries(ids).filter(([, n]) => n > 1);
      const broken = [];
      ['aria-describedby', 'aria-labelledby', 'aria-controls'].forEach(a => {
        document.querySelectorAll('[' + a + ']').forEach(e => {
          e.getAttribute(a).split(/\s+/).forEach(id => { if (id && !document.getElementById(id)) broken.push(a + '="' + id + '" on ' + e.tagName); });
        });
      });
      return JSON.stringify({ dupes, brokenAriaRefs: broken });
    }));
  }
  await browser.close();
})();
