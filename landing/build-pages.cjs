#!/usr/bin/env node
/**
 * Generates the static site from landing/fleetfix.html + landing/pages.config.cjs.
 *
 *   node landing/build-pages.cjs
 *   BASE=/preview OUTDIR=/tmp/out node landing/build-pages.cjs
 *
 * The output directory is disposable — never edit anything inside it by hand.
 * The build fails loudly on duplicate metadata, orphan pages, broken internal
 * links or over-similar city copy, so a regression cannot ship quietly.
 */
const fs = require('fs');
const path = require('path');

const SITE = require('./site.config.cjs');
const { SERVICES, CITIES, PAGES } = require('./pages.config.cjs');

const BASE = process.env.BASE !== undefined ? process.env.BASE : '';
const OUTDIR = process.env.OUTDIR
  ? path.resolve(process.env.OUTDIR)
  : path.join(__dirname, '..', 'quote-site');

const B = SITE.BUSINESS;
const SLASH = SITE.TRAILING_SLASH ? '/' : '';

/* ------------------------------------------------------------------ utils */
const esc = (s) => String(s).replace(/&(?![a-zA-Z#0-9]+;)/g, '&amp;')
  .replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const href = (slug) => (slug ? `${BASE}/${slug}${SLASH}` : `${BASE}/`);
const abs = (slug) => SITE.ORIGIN + href(slug);
const stripTags = (h) => h.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

function rmrf(p) { fs.rmSync(p, { recursive: true, force: true }); }
function write(rel, content) {
  const full = path.join(OUTDIR, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
}

/* ------------------------------------------------------------- reviews.json */
let reviews = null;
const reviewsPath = path.join(__dirname, 'reviews.json');
if (fs.existsSync(reviewsPath)) {
  try {
    const r = JSON.parse(fs.readFileSync(reviewsPath, 'utf8'));
    // Only trust it if it actually carries a sane rating and count.
    if (r && Number(r.rating) >= 1 && Number(r.rating) <= 5 && Number(r.count) >= 1) {
      reviews = r;
    } else {
      console.warn('! reviews.json present but failed sanity check — building without ratings');
    }
  } catch (e) {
    console.warn('! reviews.json unreadable — building without ratings');
  }
}

/* ---------------------------------------------------------- shared markup */
const CONTENT_PAGES = PAGES.filter((p) => !p.legal);
const LEGAL_PAGES = PAGES.filter((p) => p.legal);

const navItems = [
  { slug: '', label: 'Home' },
  ...SERVICES.map((s) => ({ slug: s.slug, label: s.nav })),
  ...CITIES.map((c) => ({ slug: c.slug, label: c.nav })),
];

function navHtml(current) {
  // Header nav is desktop-only and has a hard width budget — it uses the short
  // labels so the row still fits inside the 1160px content width at 1280.
  // The footer carries the full link set; this is a convenience nav.
  const items = [
    { slug: '', label: 'Home' },
    ...SERVICES.slice(0, 4).map((s) => ({ slug: s.slug, label: s.short || s.nav })),
    { slug: 'denver', label: 'Denver' },
  ];
  return items.map((i) =>
    `<a href="${href(i.slug)}"${i.slug === current ? ' aria-current="page"' : ''}>${i.label}</a>`
  ).join('');
}

const ARROW = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6"/></svg>';

const SVC_ICON = {
  'windshield-replacement': '<path d="M3 15 5.5 8A2 2 0 0 1 7.4 6.6h9.2A2 2 0 0 1 18.5 8L21 15"/><path d="M2 15h20v3H2z"/><path d="M12 6.6V15"/>',
  'windshield-repair': '<path d="M12 3v6l4 2-4 2v8"/><path d="m8 7 4 2M16 7l-4 2M7 14l5-1M17 14l-5-1"/>',
  'fleet-auto-glass': '<path d="M3 7h11v10H3z"/><path d="M14 10h4l3 3v4h-7"/><circle cx="6.5" cy="18" r="1.8"/><circle cx="17.5" cy="18" r="1.8"/>',
  'truck-windshield-replacement': '<path d="M3 16V7h10v9"/><path d="M13 10h4.5l3.5 3.5V16h-8"/><circle cx="7" cy="18" r="1.9"/><circle cx="17" cy="18" r="1.9"/>',
  'semi-truck-windshield-replacement': '<path d="M2 15V6h9v9"/><path d="M11 9h5l4 4v2h-9"/><circle cx="5.5" cy="17.5" r="1.9"/><circle cx="15" cy="17.5" r="1.9"/><circle cx="19" cy="17.5" r="1.9"/>',
  'mobile-auto-glass': '<path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 1 1 18 0Z"/><circle cx="12" cy="10" r="3"/>',
};

/* Every card always renders, including the one for the page you are on — which
   is marked as current instead of being dropped. Filtering it out made the card
   COUNT vary per page (6 or 5 services, 4 or 3 cities) while the grid kept a
   fixed column count, so a city page put 3 cards in a 4-column track and left a
   295px hole on the right. Constant counts make every row fill at every
   breakpoint, and "you are here" is useful orientation besides. */
function serviceCards(currentSlug) {
  return SERVICES.map((s) => {
    const inner = `
          <span class="ico"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${SVC_ICON[s.slug]}</svg></span>
          <h3>${s.card}</h3>
          <p>${s.blurb}</p>`;
    return s.slug === currentSlug
      ? `<div class="card is-current" aria-current="page">${inner}
          <span class="more is-here">You’re on this page</span>
        </div>`
      : `<a class="card" href="${href(s.slug)}">${inner}
          <span class="more">See details ${ARROW}</span>
        </a>`;
  }).join('');
}

function cityCards(currentSlug) {
  return CITIES.map((c) => {
    const inner = `
          <span class="card-num">Service area</span>
          <h3>${c.card}</h3>
          <p>${c.blurb}</p>`;
    return c.slug === currentSlug
      ? `<div class="card is-current" aria-current="page">${inner}
          <span class="more is-here">You’re on this page</span>
        </div>`
      : `<a class="card" href="${href(c.slug)}">${inner}
          <span class="more">Local details ${ARROW}</span>
        </a>`;
  }).join('');
}

const STAR = '<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m12 2.6 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3-5.8 3 1.1-6.5L2.6 9.4l6.5-.9L12 2.6Z"/></svg>';

const RV = SITE.REVIEWS;
/* Non-empty when the reviews belong to a different business than this site.
   The value in reviews.json WINS over the config: fetch-reviews.cjs stamps the
   provenance onto the data it wrote, so clearing the config field alone can
   never turn a borrowed 4.8 into this site's own rating. Config only supplies
   it as a fallback for hand-seeded data. */
const ATTRIB = ((reviews && reviews.attributedTo) || RV.attributedTo || '').trim();

function mapsLink() {
  if (reviews && reviews.mapsUri) return reviews.mapsUri;
  if (RV.mapsCid) return `https://www.google.com/maps?cid=${encodeURIComponent(RV.mapsCid)}`;
  return 'https://www.google.com/search?q=FleetFix+Glass+Denver';
}

function reviewsSection() {
  if (!reviews) {
    // No verified data -> no rating claims anywhere on the page.
    return `<section class="band band-alt" aria-labelledby="rev-h">
  <div class="wrap">
    <div class="sec-hd mid"><h2 id="rev-h">What customers say</h2></div>
    <div class="noreviews">
      <p>Our customer reviews live on our Google Business Profile, where you can read them in full and see who wrote them.</p>
      <p><a class="btn btn-outline" href="${mapsLink()}" rel="noopener nofollow" target="_blank">Read our Google reviews</a></p>
    </div>
  </div>
</section>`;
  }

  const who = ATTRIB || B.name;
  const quotes = (reviews.quotes || []).slice(0, 3).map((q) => `
      <figure class="quote">
        <span class="stars" aria-label="${q.rating} out of 5 stars">${STAR.repeat(q.rating)}</span>
        <blockquote>${esc(q.text)}</blockquote>
        <cite>${esc(q.author)}<span class="src">Google review for ${esc(who)}${q.when ? ` · ${esc(q.when)}` : ''}</span></cite>
      </figure>`).join('');

  // With no quotes yet, the rating still stands on its own — but it must never
  // appear without saying whose rating it is.
  const body = quotes
    ? `<div class="grid grid-3">${quotes}</div>`
    : `<p class="rev-note">Individual reviews are on ${esc(who)}’s Google listing,
         where you can read them in full and see who wrote them.</p>`;

  return `<section class="band band-alt" aria-labelledby="rev-h">
  <div class="wrap">
    <div class="sec-hd mid">
      <h2 id="rev-h">${ATTRIB ? 'What customers say about our team' : 'What customers say'}</h2>
      ${ATTRIB ? `<p>${esc(RV.attributionNote)}</p>` : ''}
    </div>
    <div class="rating-hd is-centred">
      <span class="stars" aria-hidden="true">${STAR.repeat(Math.round(reviews.rating))}</span>
      <span class="score">${reviews.rating.toFixed(1)}</span>
      <span class="count">from ${reviews.count} Google review${reviews.count === 1 ? '' : 's'}
        for ${esc(who)}</span>
      <a href="${mapsLink()}" rel="noopener nofollow" target="_blank">Read them on Google</a>
    </div>
    ${body}
  </div>
</section>`;
}

function faqHtml(faq) {
  return faq.map((f) => `
      <details>
        <summary>${f.q}</summary>
        <div class="ans"><p>${f.a}</p></div>
      </details>`).join('');
}

function heroPoints(points) {
  const tick = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m4 12.5 5 5L20 6.5"/></svg>';
  return points.map((p) => `<li>${tick}<span>${p}</span></li>`).join('');
}

function serviceOptions(selected) {
  return ['<option value="">Choose one…</option>']
    .concat(SITE.SERVICE_OPTIONS.map((o) =>
      `<option value="${esc(o)}"${o === selected ? ' selected' : ''}>${esc(o)}</option>`))
    .join('');
}

/* -------------------------------------------------------------- footer bits */
const footerServices = SERVICES.map((s) =>
  `<li><a href="${href(s.slug)}">${s.nav}</a></li>`).join('');
const footerCities = CITIES.map((c) =>
  `<li><a href="${href(c.slug)}">${c.nav}</a></li>`).join('');
// Every output page must be reachable from every other page — this is the list
// that guarantees it, and the orphan assertion below verifies it.
const footerAll = [{ slug: '', nav: 'Home' }]
  .concat(LEGAL_PAGES.map((p) => ({ slug: p.slug, nav: p.nav })))
  .map((p) => `<li><a href="${href(p.slug)}">${p.nav}</a></li>`).join('');

const callAsset = B.callAssetPhone ? `<li>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4h5l2 5-2.5 1.5a12 12 0 0 0 5 5L15 13l5 2v5a15 15 0 0 1-16-16Z"/></svg>
            <a class="ghl-no-swap" data-no-swap="true" href="tel:${B.callAssetE164}">${B.callAssetPhone}</a>
          </li>` : '';

const footerNote = [
  `FleetFix Glass is an independent auto glass company. Vehicle manufacturer and insurance company names are used only to describe the vehicles we service and the carriers we bill, and do not imply endorsement, affiliation or approved-supplier status.`,
  SITE.INDEXABLE ? '' : `This is our advertising quote site. Our main website is <a href="https://fleetfixglass.com/">fleetfixglass.com</a>.`,
].filter(Boolean).join(' ');

const ghlScripts = (SITE.GHL.locationId && SITE.GHL.numberPoolId)
  ? `<script src="https://backend.leadconnectorhq.com/appengine/loc/${SITE.GHL.locationId}/pool/${SITE.GHL.numberPoolId}/number_pool.js"></script>
<script src="https://backend.leadconnectorhq.com/appengine/js/user_session.js"></script>`
  : '<!-- GHL number pool not configured: set GHL.locationId and GHL.numberPoolId in landing/site.config.cjs -->';

/* ----------------------------------------------------------------- JSON-LD */
function localBusiness(page) {
  const node = {
    '@type': 'AutoGlassShop',
    '@id': `${SITE.ORIGIN}/#business`,
    name: B.name,
    // Pinned to the site root, NOT the current page. The @id is constant across
    // every page, so a per-page url would assert one entity with 13 conflicting
    // url values. The business entity is the site, not the page describing it.
    url: abs(''),
    telephone: B.phoneE164,
    priceRange: B.priceRange,
    image: `${SITE.ORIGIN}${BASE}/img/og-card.jpg`,
    logo: `${SITE.ORIGIN}${BASE}/img/fleetfix-logo.png`,
    foundingDate: B.established,
    address: {
      '@type': 'PostalAddress',
      streetAddress: B.street,
      addressLocality: B.city,
      addressRegion: B.state,
      postalCode: B.zip,
      addressCountry: 'US',
    },
    geo: { '@type': 'GeoCoordinates', latitude: B.lat, longitude: B.lng },
    openingHoursSpecification: B.hours.map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: h.days, opens: h.opens, closes: h.closes,
    })),
    areaServed: CITIES.map((c) => ({ '@type': 'City', name: c.card }))
      .concat([{ '@type': 'City', name: 'Longmont' }, { '@type': 'City', name: 'Parker' }]),
    knowsLanguage: ['en', 'es'],
    paymentAccepted: ['Cash', 'Credit Card', 'Debit Card', 'Insurance', 'Purchase Order', 'Invoice'],
    currenciesAccepted: 'USD',
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Auto glass services',
      itemListElement: SERVICES.map((s) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: s.card, url: abs(s.slug) },
      })),
    },
  };
  // aggregateRating is attached ONLY when live review data exists AND the
  // reviews are actually this business's. Claiming another company's rating in
  // your own LocalBusiness markup is what earns a structured-data manual action.
  if (reviews && !ATTRIB) {
    node.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: reviews.rating,
      reviewCount: reviews.count,
      bestRating: 5, worstRating: 1,
    };
  }
  return node;
}

function jsonLd(page) {
  const graph = [localBusiness(page)];
  if (page.faq && page.faq.length) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${abs(page.slug)}#faq`,
      mainEntity: page.faq.map((f) => ({
        '@type': 'Question',
        name: stripTags(f.q),
        acceptedAnswer: { '@type': 'Answer', text: stripTags(f.a) },
      })),
    });
  }
  // Only on sub-pages: a single-item breadcrumb on the home page is inert —
  // Google will not render a trail that goes nowhere.
  if (page.slug) {
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: abs('') },
        { '@type': 'ListItem', position: 2, name: stripTags(page.h1 || page.nav || page.slug), item: abs(page.slug) },
      ],
    });
  }
  return `<script type="application/ld+json">${
    JSON.stringify({ '@context': 'https://schema.org', '@graph': graph })
      .replace(/</g, '\\u003c')
  }</script>`;
}

/* ------------------------------------------------------------ page render */
const template = fs.readFileSync(path.join(__dirname, 'fleetfix.html'), 'utf8');

function applyBase(s) {
  // /PREFIX is a sentinel that appears nowhere else, so replace it wherever it
  // occurs rather than anchoring to `="`. Anchoring misses the 2nd and 3rd URL
  // of a srcset (they follow ", ", not `="`) and any url() inside inline CSS.
  // Handle the "/PREFIX/..." form first, then any bare "/PREFIX".
  return s
    .replace(/\/PREFIX\//g, `${BASE}/`)
    .replace(/\/PREFIX\b/g, BASE || '/');
}

function render(page) {
  const isLegal = !!page.legal;
  let html = template;

  if (isLegal) {
    const content = fs.readFileSync(path.join(__dirname, page.legal), 'utf8');
    // Attribute-tolerant: matching the literal `<main id="main">` broke the
    // moment a tabindex was added to it, and legal pages silently rendered the
    // whole marketing shell instead of their prose.
    html = html.replace(
      /<main id="main"[^>]*>[\s\S]*?<\/main>/,
      `<main id="main" tabindex="-1">
<section class="band">
  <div class="wrap"><div class="prose legal">${content}</div></div>
</section>
</main>`
    );
  }

  const map = {
    TITLE: esc(page.title),
    DESC: esc(page.desc),
    OG_TITLE: esc(page.ogTitle || page.title),
    OG_IMAGE: `${SITE.ORIGIN}${BASE}/img/og-card.jpg`,
    CANONICAL: abs(page.slug),
    ROBOTS: SITE.INDEXABLE
      ? 'index,follow,max-image-preview:large'
      : 'noindex,follow',
    HOME_HREF: href(''),
    QUOTE_HREF: isLegal ? `${href('')}#quote` : '#quote',
    PRIVACY_HREF: href('privacy'),
    TERMS_HREF: href('terms-and-conditions'),
    NAV: navHtml(page.slug),
    EYEBROW: page.eyebrow || '',
    H1: page.h1 || '',
    SUB: page.sub || '',
    HERO_POINTS: page.heroPoints ? heroPoints(page.heroPoints) : '',
    SERVICE_OPTIONS: serviceOptions(page.service),
    REVIEWS_SECTION: isLegal ? '' : reviewsSection(),
    BODY: page.body || '',
    SERVICES_HEADING: page.servicesHeading || 'Our services',
    SERVICE_CARDS: serviceCards(page.slug),
    AREAS_HEADING: page.areasHeading || 'Service areas',
    CITY_CARDS: cityCards(page.slug),
    FAQ: page.faq ? faqHtml(page.faq) : '',
    CTA_HEADING: page.ctaHeading || 'Get a free quote',
    FOOTER_SERVICES: footerServices,
    FOOTER_CITIES: footerCities,
    FOOTER_ALL: footerAll,
    CALL_ASSET: callAsset,
    FOOTER_NOTE: footerNote,
    JSONLD: jsonLd(page),
    GHL_SCRIPTS: ghlScripts,
  };

  html = html.replace(/\{\{([A-Z0-9_]+)\}\}/g, (m, k) => {
    if (!(k in map)) throw new Error(`Unknown template token {{${k}}}`);
    return map[k];
  });

  return applyBase(html);
}

/* ------------------------------------------------------------------ build */
rmrf(OUTDIR);
fs.mkdirSync(OUTDIR, { recursive: true });

const built = [];
for (const page of PAGES) {
  const rel = page.slug ? path.join(page.slug, 'index.html') : 'index.html';
  write(rel, render(page));
  built.push(page);
}

/* assets */
const imgSrc = path.join(__dirname, 'img');
for (const f of fs.readdirSync(imgSrc)) {
  const full = path.join(imgSrc, f);
  if (fs.statSync(full).isDirectory()) continue;        // skip img/src originals
  if (f === 'favicon.ico') { write('favicon.ico', fs.readFileSync(full)); continue; }
  write(path.join('img', f), fs.readFileSync(full));
}

write('site.webmanifest', JSON.stringify({
  name: `${B.name} — Commercial Auto Glass`,
  short_name: B.name,
  description: 'Mobile windshield replacement and auto glass repair across Colorado’s Front Range.',
  start_url: href(''),
  display: 'standalone',
  background_color: '#ffffff',
  theme_color: '#12294b',
  icons: [
    { src: `${BASE}/img/icon-192.png`, sizes: '192x192', type: 'image/png' },
    { src: `${BASE}/img/icon-512.png`, sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
  ],
}, null, 2));

write('sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  PAGES.map((p) => `  <url><loc>${abs(p.slug)}</loc><changefreq>monthly</changefreq>` +
    `<priority>${p.slug === '' ? '1.0' : p.legal ? '0.2' : '0.8'}</priority></url>`).join('\n') +
  `\n</urlset>\n`);

// robots.txt must ALLOW crawling even when the pages carry noindex: Googlebot
// has to fetch a page to see the noindex, and the Ads landing-page crawler
// needs access for Quality Score. Disallowing here would defeat both.
write('robots.txt',
  `User-agent: *\nAllow: /\n\nSitemap: ${SITE.ORIGIN}${BASE}/sitemap.xml\n`);

const vercelCommon = {
  trailingSlash: SITE.TRAILING_SLASH,
  headers: [
    { source: '/img/(.*)', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
    {
      source: '/(.*)', headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      ],
    },
  ],
};

// For the documented setup: Vercel Root Directory = quote-site, so this is the
// config it reads.
write('vercel.json', JSON.stringify(vercelCommon, null, 2));

// And a repo-root config, so a project linked to the repo with Root Directory
// left at the default still builds and serves the generated folder. Emitted
// from the same object as the one above so the two cannot drift apart.
// The page build has zero npm dependencies (sharp is only used by
// make-assets.cjs, whose output is committed), so installing nothing is both
// correct and fast.
fs.writeFileSync(
  path.join(__dirname, '..', 'vercel.json'),
  JSON.stringify({
    buildCommand: 'node landing/build-pages.cjs',
    installCommand: 'echo "no dependencies required for the page build"',
    outputDirectory: 'quote-site',
    ...vercelCommon,
  }, null, 2) + '\n'
);

/* ================================================================ asserts */
const problems = [];
const seen = { title: new Map(), desc: new Map(), h1: new Map() };

for (const p of PAGES) {
  const file = path.join(OUTDIR, p.slug || '.', 'index.html');
  const html = fs.readFileSync(file, 'utf8');

  const t = (html.match(/<title>([\s\S]*?)<\/title>/) || [])[1];
  const d = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1];
  const h = (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1];

  [['title', t], ['desc', d], ['h1', h && stripTags(h)]].forEach(([k, v]) => {
    if (!v) { problems.push(`${p.slug || '/'}: missing ${k}`); return; }
    if (seen[k].has(v)) problems.push(`duplicate ${k}: "/${p.slug}" and "/${seen[k].get(v)}"`);
    else seen[k].set(v, p.slug);
  });

  // Keep these inside the width Google will actually render, so this stays
  // correct if INDEXABLE is ever flipped on. Measure the DECODED text: "&amp;"
  // is five characters of markup but a single character to a search engine.
  const decode = (s) => String(s)
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
  if (d && decode(d).length > 158) problems.push(`${p.slug || '/'}: meta description ${decode(d).length} chars (max 158)`);
  if (t && decode(t).length > 62) problems.push(`${p.slug || '/'}: title ${decode(t).length} chars (max 62)`);

  if (!/rel="canonical"/.test(html)) problems.push(`${p.slug || '/'}: no canonical`);
  if (!/application\/ld\+json/.test(html)) problems.push(`${p.slug || '/'}: no JSON-LD`);
  if (!/property="og:title"/.test(html)) problems.push(`${p.slug || '/'}: no Open Graph`);
  if (/\/PREFIX/.test(html)) problems.push(`${p.slug || '/'}: unrewritten /PREFIX path`);
  if (/\{\{[A-Z0-9_]+\}\}/.test(html)) problems.push(`${p.slug || '/'}: unreplaced token`);
  if (!reviews && /\b\d\.\d\s*(★|stars?\b)/i.test(stripTags(html))) {
    problems.push(`${p.slug || '/'}: rating claim present with no review data`);
  }
  // Borrowed reviews must be attributed wherever they appear, and must never
  // reach this site's structured data.
  if (reviews && ATTRIB && !p.legal) {
    const text = stripTags(html);
    if (!text.includes(ATTRIB)) {
      problems.push(`${p.slug || '/'}: shows a rating but never names ${ATTRIB}`);
    }
    if (/aggregateRating/.test(html)) {
      problems.push(`${p.slug || '/'}: aggregateRating present while reviews are attributed to ${ATTRIB}`);
    }
  }
}

/* orphans: every output directory must be linked from every page */
const outDirs = PAGES.map((p) => p.slug).filter(Boolean);
for (const p of PAGES) {
  const html = fs.readFileSync(path.join(OUTDIR, p.slug || '.', 'index.html'), 'utf8');
  const linked = new Set(
    [...html.matchAll(/href="([^"#]*?)"/g)].map((m) => m[1])
      .filter((u) => u.startsWith(BASE + '/'))
      .map((u) => u.slice((BASE + '/').length).replace(/\/$/, ''))
  );
  const missing = outDirs.filter((s) => s !== p.slug && !linked.has(s));
  if (missing.length) problems.push(`${p.slug || '/'}: does not link to ${missing.join(', ')}`);
}

/* every internal href and src resolves to a real file */
for (const p of PAGES) {
  const html = fs.readFileSync(path.join(OUTDIR, p.slug || '.', 'index.html'), 'utf8');
  for (const m of html.matchAll(/(?:href|src)="(\/[^"]*)"/g)) {
    const u = m[1].split('#')[0];
    if (!u || !u.startsWith(BASE + '/')) continue;
    const rel = u.slice(BASE.length);
    const candidates = [
      path.join(OUTDIR, rel),
      path.join(OUTDIR, rel, 'index.html'),
    ];
    if (!candidates.some((c) => fs.existsSync(c))) {
      problems.push(`${p.slug || '/'}: dead link ${u}`);
    }
  }
}

/* Dialect guard. This is a US business; "windscreen" and "tyre" are its core
   product nouns and must never appear. A sweep once fixed 47 of these, so the
   check exists to stop them creeping back in. */
const BRITISH = /\b(windscreen|tyres?|car parks?|postcodes?|roadworks|centre|centres|itemised|organis(ed|ation|ations)|prioritise|sceptical|levelled|ageing|programme|favour|favours|manoeuvre|specialism|fortnight|honour|honoured|recognise|enquir(y|ies)|behaviour|travelled|authorise|unauthorised|multi-storey|whilst|amongst)\b/gi;
for (const p of PAGES) {
  const html = fs.readFileSync(path.join(OUTDIR, p.slug || '.', 'index.html'), 'utf8');
  const hits = [...new Set((stripTags(html).match(BRITISH) || []).map((h) => h.toLowerCase()))];
  if (hits.length) problems.push(`${p.slug || '/'}: British spelling — ${hits.join(', ')}`);
}

/* city-page body overlap — the doorway-page guard */
function shingles(text, n = 5) {
  const w = text.toLowerCase().match(/[a-z0-9']+/g) || [];
  const out = new Set();
  for (let i = 0; i + n <= w.length; i++) out.add(w.slice(i, i + n).join(' '));
  return out;
}
const cityBodies = PAGES.filter((p) => p.city)
  .map((p) => ({ slug: p.slug, s: shingles(stripTags(p.body)) }));
let worst = 0, worstPair = '';
for (let i = 0; i < cityBodies.length; i++) {
  for (let j = i + 1; j < cityBodies.length; j++) {
    const a = cityBodies[i].s, b = cityBodies[j].s;
    const inter = [...a].filter((x) => b.has(x)).length;
    const pct = (inter / new Set([...a, ...b]).size) * 100;
    if (pct > worst) { worst = pct; worstPair = `${cityBodies[i].slug} vs ${cityBodies[j].slug}`; }
  }
}
if (worst >= 5) problems.push(`city body overlap ${worst.toFixed(1)}% (${worstPair}) — target <5%`);

/* ---------------------------------------------------------------- report */
console.log(`\nBuilt ${built.length} pages -> ${path.relative(process.cwd(), OUTDIR) || OUTDIR}`);
console.log(`  base path        ${BASE || '/'}`);
console.log(`  indexable        ${SITE.INDEXABLE}`);
console.log(`  reviews          ${reviews ? `${reviews.rating}★ from ${reviews.count}` : 'none — rating claims stripped'}`);
console.log(`  city overlap     ${worst.toFixed(2)}% worst pair (${worstPair})`);

if (problems.length) {
  console.error(`\n✗ ${problems.length} problem(s):`);
  problems.forEach((p) => console.error('  - ' + p));
  process.exit(1);
}
console.log('\n✓ all build assertions passed\n');
