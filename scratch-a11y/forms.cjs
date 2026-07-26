const { launch, BASE, ratio, parseRGB, over, hex } = require('./lib.cjs');
const fs = require('fs');
const SP = '/tmp/claude-0/-home-user-fleetfix/2a6f7e9c-fbab-5bd8-9ece-1b0d509d913c/scratchpad/';

(async () => {
  const { browser, page } = await launch({ width: 1440, height: 900 });
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });

  // ===== 1. focus ring on form controls, transitions settled =====
  console.log('=== FOCUS INDICATOR (settled) ===');
  for (const sel of ['#f-name', '#f-service', '#f-vehicle', '#ff-submit']) {
    await page.focus(sel);
    await page.evaluate(s => document.querySelector(s).blur(), sel);
    await page.focus(sel);
    // force :focus-visible via real keyboard
    await page.keyboard.press('Shift+Tab'); await page.keyboard.press('Tab');
    await page.waitForTimeout(400);
    const d = await page.evaluate(s => {
      const el = document.querySelector(s); const cs = getComputedStyle(el);
      return { fv: el.matches(':focus-visible'), outline: cs.outlineStyle + ' ' + cs.outlineWidth + ' ' + cs.outlineColor,
               shadow: cs.boxShadow, border: cs.borderTopColor, bg: cs.backgroundColor };
    }, sel);
    console.log(sel, JSON.stringify(d));
  }
  // unfocused border for comparison
  console.log('unfocused input border:', await page.evaluate(() => getComputedStyle(document.getElementById('f-email')).borderTopColor));

  // ===== 2. sequential focus after skip link =====
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await page.keyboard.press('Tab');            // skip link
  await page.keyboard.press('Enter');
  await page.waitForTimeout(400);
  await page.keyboard.press('Tab');
  console.log('\n=== SKIP LINK: next Tab after activation ===');
  console.log(await page.evaluate(() => {
    const a = document.activeElement;
    return a.tagName + '#' + (a.id || '') + ' "' + (a.textContent || a.value || '').trim().slice(0, 40) + '"';
  }));
  console.log('target #quote tabindex:', await page.evaluate(() => {
    const t = document.getElementById('quote');
    return t ? t.tagName + ' tabindex=' + t.getAttribute('tabindex') : 'MISSING';
  }));

  // ===== 3. label association for every control =====
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  console.log('\n=== FORM CONTROLS / LABELS ===');
  console.log(await page.evaluate(() => {
    return [...document.querySelectorAll('#ff-form input, #ff-form select, #ff-form textarea, #ff-form button')].map(el => ({
      id: el.id, type: el.type, name: el.name,
      labelFor: [...document.querySelectorAll('label[for="' + el.id + '"]')].map(l => l.textContent.trim()),
      wrappedLabel: !!el.closest('label'),
      ariaLabel: el.getAttribute('aria-label'),
      ariaLabelledby: el.getAttribute('aria-labelledby'),
      ariaDescribedby: el.getAttribute('aria-describedby'),
      required: el.hasAttribute('required'),
      ariaRequired: el.getAttribute('aria-required'),
      tabindex: el.getAttribute('tabindex'),
      hiddenByAriaHidden: !!el.closest('[aria-hidden="true"]'),
      display: getComputedStyle(el).display,
      offscreen: el.getBoundingClientRect().right < 0,
    }));
  }).then(r => JSON.stringify(r, null, 1)));

  // ===== 4. trigger REAL validation failure =====
  console.log('\n=== VALIDATION FAILURE (submit empty form via keyboard) ===');
  await page.focus('#ff-submit');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(600);
  const failState = await page.evaluate(() => {
    const alertEl = document.getElementById('ff-alert');
    return {
      activeElement: document.activeElement.id || document.activeElement.tagName,
      fields: [...document.querySelectorAll('#ff-form .field')].map(f => {
        const ctl = f.querySelector('input,select,textarea');
        const err = f.querySelector('.err');
        return {
          id: ctl && ctl.id,
          hasBadClass: f.classList.contains('bad'),
          ariaInvalid: ctl && ctl.getAttribute('aria-invalid'),
          ariaDescribedby: ctl && ctl.getAttribute('aria-describedby'),
          errText: err && err.textContent.trim(),
          errId: err && (err.id || null),
          errRole: err && err.getAttribute('role'),
          errAriaLive: err && err.getAttribute('aria-live'),
          errDisplay: err && getComputedStyle(err).display,
        };
      }).filter(f => f.id),
      alert: alertEl && {
        role: alertEl.getAttribute('role'), ariaLive: alertEl.getAttribute('aria-live'),
        display: getComputedStyle(alertEl).display, classes: alertEl.className,
        text: alertEl.textContent.trim(),
      },
    };
  });
  console.log(JSON.stringify(failState, null, 1));
  fs.writeFileSync(SP + 'validation-fail.png', await page.screenshot({ fullPage: false }));

  // ===== 5. fill the form entirely by keyboard, submit =====
  console.log('\n=== KEYBOARD FORM COMPLETION ===');
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await page.focus('#f-name');
  await page.keyboard.type('Jane Doe');
  await page.keyboard.press('Tab'); await page.keyboard.type('7205550134');
  await page.keyboard.press('Tab'); await page.keyboard.type('jane@company.com');
  await page.keyboard.press('Tab'); await page.keyboard.type('80214');
  await page.keyboard.press('Tab');                                  // select
  const selBefore = await page.evaluate(() => document.getElementById('f-service').value);
  await page.keyboard.press('ArrowDown');                            // choose option by keyboard
  await page.waitForTimeout(150);
  const selAfter = await page.evaluate(() => document.getElementById('f-service').value);
  console.log('select via ArrowDown: "' + selBefore + '" -> "' + selAfter + '"');
  await page.keyboard.press('Tab'); await page.keyboard.type('2021 Ford F-250');
  await page.keyboard.press('Tab');   // insurance select
  await page.keyboard.press('Tab');   // carrier
  await page.keyboard.press('Tab');   // vin
  await page.keyboard.press('Tab');   // should be submit (honeypot must be skipped)
  console.log('after Tab from VIN, focus =', await page.evaluate(() => document.activeElement.id || document.activeElement.tagName));
  await page.keyboard.press('Enter');
  await page.waitForTimeout(800);
  console.log('post-submit state:', JSON.stringify(await page.evaluate(() => ({
    activeElement: document.activeElement.id || document.activeElement.tagName,
    alertOn: document.getElementById('ff-alert').classList.contains('on'),
    alertText: document.getElementById('ff-alert').textContent.trim().slice(0, 90),
    alertDisplay: getComputedStyle(document.getElementById('ff-alert')).display,
    thanksOn: document.getElementById('ff-thanks').classList.contains('on'),
    anyInvalid: [...document.querySelectorAll('[aria-invalid="true"]')].map(e => e.id),
  }))));
  fs.writeFileSync(SP + 'submit-result.png', await page.screenshot());
  await browser.close();
})();
