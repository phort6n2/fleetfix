#!/usr/bin/env node
/**
 * Browser verification pass over the generated site.
 *
 *   npm run serve:landing &            # or set BASE_URL
 *   node landing/verify.cjs
 *
 * Checks, per the build playbook's verification checklist:
 *   - no horizontal overflow at 320/360/390/414/768/1024/1280/1440
 *   - no tap target under 24px
 *   - no console errors
 *   - the full tracking sequence on a real form submit with ?gclid=TEST123
 *   - dedupe: a second submit fires no second conversion
 *   - nothing fires when the tracking config is empty
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SITE = require('./site.config.cjs');
const BASE = process.env.BASE_URL || 'http://localhost:4173';
// GHL's number pool is optional and currently disabled in favour of Google's
// own call tracking. Derive the expectation from config so switching either way
// does not leave a stale hardcoded count failing the suite.
const GHL_POOL_ON = !!(SITE.GHL.locationId && SITE.GHL.numberPoolId);
const EXEC = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const SHOTS = path.join(__dirname, '..', '.verify-shots');

const WIDTHS = [320, 360, 390, 414, 768, 1024, 1280, 1440];
const PAGES = ['/', '/windshield-replacement/', '/windshield-repair/', '/fleet-auto-glass/',
  '/truck-windshield-replacement/', '/semi-truck-windshield-replacement/', '/mobile-auto-glass/',
  '/denver/', '/boulder/', '/greeley/', '/castle-rock/', '/privacy/', '/terms-and-conditions/'];

const fails = [];
const note = (m) => { fails.push(m); console.log('  ✗ ' + m); };

(async () => {
  fs.rmSync(SHOTS, { recursive: true, force: true });
  fs.mkdirSync(SHOTS, { recursive: true });

  const browser = await chromium.launch({ executablePath: EXEC, args: ['--no-sandbox'] });

  /* Safety net. The shipped config contains a live HighLevel webhook, so any
     accidental real submission from this suite would create a contact in the
     client's CRM. Fail loudly instead. */
  const guardCtx = (ctx) => ctx.route('**://services.leadconnectorhq.com/**', (r) => {
    note('verify attempted a REAL request to the live GHL webhook — blocked');
    return r.abort();
  });

  /* ---------------- 1. layout + console across widths ---------------- */
  console.log('\nLayout & console');
  for (const w of WIDTHS) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, deviceScaleFactor: 1 });
    await guardCtx(ctx);
    const page = await ctx.newPage();
    // The shipped config loads a real Google tag. This sandbox has no outbound
    // network, so without a stub every page reports ERR_CONNECTION_RESET and
    // the console check drowns in false positives.
    await page.route('**/*', (r) => r.request().url().startsWith(BASE)
      ? r.continue()
      : r.fulfill({ status: 200, contentType: 'text/javascript', body: '' }));
    const errors = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', (e) => errors.push(String(e)));

    for (const p of PAGES) {
      const res = await page.goto(BASE + p, { waitUntil: 'load' });
      if (!res || res.status() !== 200) { note(`${p} @${w} returned ${res && res.status()}`); continue; }

      const overflow = await page.evaluate(() => {
        const de = document.documentElement;
        const over = de.scrollWidth - de.clientWidth;
        if (over <= 1) return null;
        // Name the widest offender so the failure is actionable.
        let worst = null, worstW = 0;
        document.querySelectorAll('*').forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.right > de.clientWidth + 1 && r.width > worstW) {
            worstW = r.width;
            worst = el.tagName.toLowerCase() + (el.className ? '.' + String(el.className).split(' ')[0] : '');
          }
        });
        return { over, worst };
      });
      if (overflow) note(`${p} @${w}px overflows by ${overflow.over}px (widest: ${overflow.worst})`);

      // No card row may leave a hole on the right. A fixed column count with a
      // varying card count once left a 295px gap on every city page.
      const gaps = await page.evaluate(() => {
        const out = [];
        document.querySelectorAll('#services .grid, #areas .grid').forEach((g) => {
          const gb = g.getBoundingClientRect();
          const rows = {};
          [...g.children].forEach((k) => {
            const b = k.getBoundingClientRect();
            (rows[Math.round(b.top)] = rows[Math.round(b.top)] || []).push(b);
          });
          Object.values(rows).forEach((row) => {
            const gap = gb.right - Math.max(...row.map((b) => b.right));
            if (gap > 2) out.push(`${g.parentElement.parentElement.id || '?'} row gap ${Math.round(gap)}px`);
          });
        });
        return out;
      });
      gaps.forEach((g) => note(`${p} @${w}px card ${g}`));
    }

    // Tap targets on the two most interaction-dense pages.
    for (const p of ['/', '/denver/']) {
      await page.goto(BASE + p, { waitUntil: 'load' });
      const small = await page.evaluate(() => {
        const out = [];
        document.querySelectorAll('a[href],button,summary,input,select,textarea').forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.width === 0 && r.height === 0) return;              // hidden
          const cs = getComputedStyle(el);
          if (cs.display === 'none' || cs.visibility === 'hidden') return;
          if (el.closest('[aria-hidden="true"]')) return;           // honeypot, decorative
          if (r.right < 0 || r.bottom < 0) return;                  // positioned off-screen

          // WCAG 2.5.8 "Inline" exception: a link flowing inside a sentence is
          // sized by its text and is explicitly exempt from the minimum.
          const inline = cs.display.startsWith('inline') && cs.display !== 'inline-block';
          const inSentence = inline && el.parentElement &&
            [...el.parentElement.childNodes].some(
              (n) => n.nodeType === 3 && n.textContent.trim().length > 0);
          if (inSentence) return;

          if (r.height < 24 || r.width < 24) {
            out.push(`${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]} ${Math.round(r.width)}x${Math.round(r.height)} "${(el.textContent || '').trim().slice(0, 24)}"`);
          }
        });
        return out;
      });
      small.forEach((s) => note(`${p} @${w}px tap target under 24px: ${s}`));
    }

    if (errors.length) errors.forEach((e) => note(`console error @${w}px: ${e.slice(0, 160)}`));

    await page.goto(BASE + '/', { waitUntil: 'load' });
    await page.screenshot({ path: path.join(SHOTS, `home-${w}.png`), fullPage: w <= 414 });
    await ctx.close();
    console.log(`  ${w}px checked`);
  }

  /* ---------------- 2. tracking with config populated ---------------- */
  console.log('\nTracking (config populated, ?gclid=TEST123)');
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    await guardCtx(ctx);
    const page = await ctx.newPage();

    // Broad stub FIRST, specific handlers AFTER — Playwright uses the LAST
    // matching route, so specific must be registered last or it never runs.
    await page.route('**/*', (r) => {
      const u = r.request().url();
      if (u.startsWith(BASE)) return r.continue();
      return r.fulfill({ status: 200, contentType: 'text/javascript', body: '' });
    });
    let webhookBody = null;
    await page.route('**/googletagmanager.com/**', (r) =>
      r.fulfill({ status: 200, contentType: 'text/javascript', body: 'window.__gtagLoaded=1;' }));
    await page.route('**/hooks.example.test/**', (r) => {
      webhookBody = JSON.parse(r.request().postData() || '{}');
      return r.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
    });

    await page.addInitScript(() => {
      window.__cfgPatch = {
        GOOGLE_ADS_ID: 'AW-1234567890',
        GOOGLE_ADS_LABEL: 'AbC-D_efGh12',
        LEAD_VALUE: 250,
        CURRENCY: 'USD',
        GHL_WEBHOOK_URL: 'https://hooks.example.test/webhook-trigger/abc',
      };
      // Patch the config the instant it appears, before the IIFE reads it.
      Object.defineProperty(window, 'FF_CONFIG', {
        configurable: true,
        set(v) { Object.assign(v, window.__cfgPatch); this.__v = v; },
        get() { return this.__v; },
      });
    });

    await page.goto(BASE + '/denver/?gclid=TEST123&utm_source=google&utm_medium=cpc&utm_campaign=fleet-den', { waitUntil: 'load' });

    const cfgOk = await page.evaluate(() =>
      !!(window.dataLayer || []).find((a) => a[0] === 'config' && a[1] === 'AW-1234567890' &&
        a[2] && a[2].allow_enhanced_conversions === true));
    if (!cfgOk) note('dataLayer missing config with allow_enhanced_conversions');

    await page.fill('#f-name', 'Jane Tester');
    await page.fill('#f-phone', '720-555-0134');
    await page.fill('#f-email', 'jane@fleet.test');
    await page.fill('#f-zip', '80214');
    await page.evaluate(() => { document.querySelector('.qc-more').open = true; });
    await page.selectOption('#f-service', 'Fleet or multi-vehicle program');
    await page.fill('#f-vehicle', '2021 Ford F-250');
    await page.click('#ff-submit');
    await page.waitForSelector('#ff-thanks.on', { timeout: 8000 });

    if (!webhookBody) note('webhook was not called');
    else {
      if (webhookBody.gclid !== 'TEST123') note(`webhook gclid = ${webhookBody.gclid}`);
      if (webhookBody.utm_source !== 'google') note('webhook missing utm_source');
      if (webhookBody.utm_campaign !== 'fleet-den') note('webhook missing utm_campaign');
      if (webhookBody.phone !== '+17205550134') note(`webhook phone not E.164: ${webhookBody.phone}`);
      if (webhookBody.phone_formatted !== '(720) 555-0134') note(`bad phone_formatted: ${webhookBody.phone_formatted}`);
      if (webhookBody.page_path !== '/denver/') note(`bad page_path: ${webhookBody.page_path}`);
      if (!webhookBody.landing_page) note('webhook missing landing_page');
    }

    const dl = await page.evaluate(() => (window.dataLayer || []).map((a) => Array.from(a)));
    const ud = dl.find((a) => a[0] === 'set' && a[1] === 'user_data');
    if (!ud) note('no gtag set user_data');
    else {
      if (ud[2].email !== 'jane@fleet.test') note('user_data email wrong');
      if (ud[2].phone_number !== '+17205550134') note('user_data phone not E.164');
    }
    const conv = dl.filter((a) => a[0] === 'event' && a[1] === 'conversion');
    if (conv.length !== 1) note(`expected 1 conversion event, got ${conv.length}`);
    else {
      const c = conv[0][2];
      if (c.send_to !== 'AW-1234567890/AbC-D_efGh12') note(`bad send_to: ${c.send_to}`);
      if (!String(c.transaction_id).includes('TEST123')) note(`gclid missing from transaction_id: ${c.transaction_id}`);
      if (c.value !== 250) note(`bad conversion value: ${c.value}`);
    }
    console.log(`  webhook + conversion verified (txn ${conv[0] && conv[0][2].transaction_id})`);

    /* dedupe: submit again in the same session */
    await page.goto(BASE + '/denver/?gclid=TEST123', { waitUntil: 'load' });
    await page.fill('#f-name', 'Jane Tester');
    await page.fill('#f-phone', '720-555-0134');
    await page.fill('#f-email', 'jane@fleet.test');
    await page.fill('#f-zip', '80214');
    await page.evaluate(() => { document.querySelector('.qc-more').open = true; });
    await page.selectOption('#f-service', 'Fleet or multi-vehicle program');
    await page.fill('#f-vehicle', '2021 Ford F-250');
    await page.click('#ff-submit');
    await page.waitForSelector('#ff-thanks.on', { timeout: 8000 });
    const conv2 = await page.evaluate(() =>
      (window.dataLayer || []).filter((a) => a[0] === 'event' && a[1] === 'conversion').length);
    if (conv2 !== 0) note(`second submit fired ${conv2} conversion(s) — dedupe failed`);
    else console.log('  dedupe verified (second submit fired no conversion)');

    await ctx.close();
  }

  /* ---------------- 3. nothing fires with empty config ---------------- */
  console.log('\nTracking (config empty — shipped default)');
  {
    const ctx = await browser.newContext();
    await guardCtx(ctx);
    const page = await ctx.newPage();
    // The GHL number-pool scripts are build-time <script src> tags driven by
    // site.config.cjs, NOT by the runtime FF_CONFIG this scenario blanks, so
    // they load either way. That is intended: dynamic number insertion has to
    // run for call attribution regardless of whether the Ads tag is live.
    // Count them separately instead of failing on them.
    let external = 0, dni = 0, tagLoads = 0;
    page.on('request', (r) => {
      const u = r.url();
      if (u.startsWith(BASE)) return;
      if (u.includes('backend.leadconnectorhq.com')) { dni++; return; }
      // gtag.js is loaded by a literal <script> tag emitted at BUILD time so
      // Google Ads' HTML-scanning tag detector can see it. It therefore loads
      // regardless of the runtime FF_CONFIG this scenario blanks. That is safe:
      // the guard that matters is that no gtag CALLS fire, asserted below by
      // dataLayer being empty, so the script loads and reports nothing.
      if (u.includes('googletagmanager.com')) { tagLoads++; return; }
      external++;
    });
    // Blank the live IDs for this scenario so the no-op path can be exercised
    // without loading a real tag or posting a real lead into the CRM.
    await page.addInitScript(() => {
      Object.defineProperty(window, 'FF_CONFIG', {
        configurable: true,
        set(v) {
          v.GHL_WEBHOOK_URL = ''; v.GOOGLE_ADS_ID = ''; v.GA4_ID = '';
          this.__v = v;
        },
        get() { return this.__v; },
      });
    });
    await page.goto(BASE + '/?gclid=TEST123', { waitUntil: 'load' });
    const dl = await page.evaluate(() => (window.dataLayer || []).length);
    if (dl !== 0) note(`dataLayer populated with empty config (${dl} entries)`);
    if (external !== 0) note(`${external} non-DNI external request(s) with empty config`);
    const expectDni = GHL_POOL_ON ? 2 : 0;
    if (dni !== expectDni) note(`expected ${expectDni} GHL number-pool request(s), saw ${dni}`);

    // The form must refuse to silently drop a lead when no webhook is set.
    await page.fill('#f-name', 'Jane Tester');
    await page.fill('#f-phone', '7205550134');
    await page.fill('#f-email', 'jane@fleet.test');
    await page.fill('#f-zip', '80214');
    await page.click('#ff-submit');
    const alerted = await page.isVisible('#ff-alert.on');
    if (!alerted) note('empty webhook config did not surface an error to the user');
    else console.log(`  no tags fired, no non-DNI external requests, lead not silently dropped, ${dni} DNI scripts loaded`);
    await ctx.close();
  }

  /* ------- 3b. the REAL shipped config, end to end ------- */
  console.log('\nTracking (shipped config — real Ads ID + label)');
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    await guardCtx(ctx);
    const page = await ctx.newPage();
    await page.route('**/*', (r) => {
      const u = r.request().url();
      if (u.startsWith(BASE)) return r.continue();
      return r.fulfill({ status: 200, contentType: 'text/javascript', body: '' });
    });
    await page.route('**/googletagmanager.com/**', (r) =>
      r.fulfill({ status: 200, contentType: 'text/javascript', body: 'window.__gtagLoaded=1;' }));
    let posted = false;
    await page.route('**/hooks.example.test/**', (r) => {
      posted = true;
      return r.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
    });
    // Redirect only the webhook; leave the Ads config exactly as shipped.
    await page.addInitScript(() => {
      Object.defineProperty(window, 'FF_CONFIG', {
        configurable: true,
        set(v) { v.GHL_WEBHOOK_URL = 'https://hooks.example.test/x'; this.__v = v; },
        get() { return this.__v; },
      });
    });

    await page.goto(BASE + '/?gclid=SHIPPED1', { waitUntil: 'load' });

    /* ---- Google call tracking (dynamic number insertion) ---- */
    const CALL_SEND_TO = 'AW-18345617633/vGb3CN2g8NYcEOHR76tE';
    const CALL_NUMBER = '(720) 605-0727';
    const phoneCfg = await page.evaluate(() => (window.dataLayer || [])
      .map((a) => Array.from(a))
      .find((a) => a[0] === 'config' && a[2] && a[2].phone_conversion_number));
    if (!phoneCfg) note('no phone_conversion config — call tracking is not wired');
    else {
      if (phoneCfg[1] !== CALL_SEND_TO) note(`call send_to is "${phoneCfg[1]}"`);
      if (phoneCfg[2].phone_conversion_number !== CALL_NUMBER) {
        note(`phone_conversion_number is "${phoneCfg[2].phone_conversion_number}"`);
      }
      if (phoneCfg[2].phone_conversion_css_class !== 'ads-phone') {
        note('phone_conversion_css_class missing — swap would not be scoped, and the call asset could be rewritten');
      }
    }
    const swap = await page.evaluate((num) => {
      const inScope = [...document.querySelectorAll('.ads-phone')];
      const asset = document.querySelector('a[href="tel:+17204774896"]');
      return {
        total: inScope.length,
        // Google matches on the number as TEXT. An in-scope element without it
        // may not be rewritten, silently losing that call's attribution.
        withoutNumber: inScope.filter((e) => !e.textContent.includes(num))
          .map((e) => (e.textContent || '').trim().slice(0, 30)),
        assetInScope: !!asset && asset.classList.contains('ads-phone'),
      };
    }, CALL_NUMBER);
    if (swap.total === 0) note('no elements carry ads-phone — nothing would be swapped');
    if (swap.assetInScope) note('call asset carries ads-phone and would be rewritten by Google');
    if (swap.withoutNumber.length) {
      note(`ads-phone element(s) without the number as text: ${swap.withoutNumber.join(' | ')}`);
    }
    if (!fails.length) {
      console.log(`  call tracking: ${swap.total} numbers in swap scope, call asset excluded`);
    }
    const cfg = await page.evaluate(() => (window.dataLayer || [])
      .map((a) => Array.from(a))
      .find((a) => a[0] === 'config' && String(a[1]).startsWith('AW-')));
    if (!cfg) note('shipped config did not fire a gtag config');
    else if (!cfg[2] || cfg[2].allow_enhanced_conversions !== true) {
      note('shipped config missing allow_enhanced_conversions');
    }

    await page.fill('#f-name', 'Shipped Test');
    await page.fill('#f-phone', '7205550134');
    await page.fill('#f-email', 'shipped@fleet.test');
    await page.fill('#f-zip', '80214');
    await page.click('#ff-submit');
    await page.waitForSelector('#ff-thanks.on', { timeout: 8000 });

    if (!posted) note('shipped config did not deliver the lead');

    // Assert the ACTUAL send_to the live site will report, not a stand-in.
    const EXPECT_SEND_TO = 'AW-18345617633/dVIiCI-6vdYcEOHR76tE';
    const dl = await page.evaluate(() => (window.dataLayer || []).map((a) => Array.from(a)));
    const convs = dl.filter((a) => a[0] === 'event' && a[1] === 'conversion');
    if (convs.length !== 1) {
      note(`expected exactly 1 conversion from the shipped config, got ${convs.length}`);
    } else {
      const c = convs[0][2];
      if (c.send_to !== EXPECT_SEND_TO) note(`send_to is "${c.send_to}", expected "${EXPECT_SEND_TO}"`);
      if (!String(c.transaction_id).includes('SHIPPED1')) {
        note(`gclid missing from transaction_id: ${c.transaction_id}`);
      }
    }
    const ud = dl.find((a) => a[0] === 'set' && a[1] === 'user_data');
    if (!ud) note('shipped config sent no user_data for enhanced conversions');
    else if (ud[2].phone_number !== '+17205550134') note('user_data phone not E.164');
    if (!fails.length) console.log(`  real send_to verified: ${EXPECT_SEND_TO}`);
    await ctx.close();
  }

  /* ---------------- 4. validation ---------------- */
  console.log('\nForm validation');
  {
    const ctx = await browser.newContext();
    await guardCtx(ctx);
    const page = await ctx.newPage();
    await page.goto(BASE + '/', { waitUntil: 'load' });
    await page.click('#ff-submit');
    const bad = await page.$$eval('.field.bad', (n) => n.length);
    if (bad < 4) note(`empty submit flagged only ${bad} of 4 required fields`);
    await page.fill('#f-phone', '123');
    await page.click('#ff-submit');
    const phoneBad = await page.getAttribute('#f-phone', 'aria-invalid');
    if (phoneBad !== 'true') note('short phone number not rejected');
    else console.log('  required fields and phone format enforced');
    await ctx.close();
  }

  await browser.close();

  console.log(`\nScreenshots -> ${path.relative(process.cwd(), SHOTS)}`);
  if (fails.length) { console.error(`\n✗ ${fails.length} problem(s)\n`); process.exit(1); }
  console.log('\n✓ all browser checks passed\n');
})();
