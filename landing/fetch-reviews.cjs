#!/usr/bin/env node
/**
 * Pulls the real Google rating, review count and a few quotes once a week from
 * CI, and writes landing/reviews.json. Visitors never trigger the API and the
 * key never reaches the browser.
 *
 *   GOOGLE_PLACES_API_KEY=... node landing/fetch-reviews.cjs
 *
 * Setup:
 *   1. Enable "Places API (New)" — places.googleapis.com. NOT the legacy
 *      places-backend.googleapis.com, which 403s.
 *   2. Create a key with application restrictions NONE (this runs from CI, not
 *      a browser) and API restrictions limited to Places API (New).
 *   3. Add it as the repo secret GOOGLE_PLACES_API_KEY.
 *   4. Put the Place ID in landing/site.config.cjs. Place IDs are public.
 *
 * This script NEVER fails the build. Any error, missing key or failed identity
 * check exits 0 and leaves the previous reviews.json untouched, so a transient
 * API problem can never blank the ratings on a live site.
 */
const fs = require('fs');
const path = require('path');
const SITE = require('./site.config.cjs');

const OUT = path.join(__dirname, 'reviews.json');
const KEY = process.env.GOOGLE_PLACES_API_KEY;
const PLACE_ID = SITE.BUSINESS.googlePlaceId;

/* The identity guard. A wrong Place ID fails completely silently, because the
   numbers it returns look perfectly plausible — it will happily publish another
   company's rating across every page. Assert who we actually resolved. */
const EXPECT_NAME = /fleet\s*fix/i;
const EXPECT_REGION = /(,\s*CO\b|\bColorado\b)/i;
const EXPECT_LOCALITY = /(Denver|Lakewood|Edgewater|Wheat Ridge)/i;

function bail(msg) {
  console.error(`fetch-reviews: ${msg}`);
  console.error('fetch-reviews: leaving existing reviews.json untouched.');
  process.exit(0);                       // never fail the build
}

async function main() {
  if (!KEY) return bail('GOOGLE_PLACES_API_KEY is not set.');
  if (!PLACE_ID) return bail('BUSINESS.googlePlaceId is empty in site.config.cjs.');

  const fields = [
    'id', 'displayName', 'formattedAddress', 'rating',
    'userRatingCount', 'googleMapsUri', 'reviews',
  ].join(',');

  let res, data;
  try {
    res = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(PLACE_ID)}`,
      { headers: { 'X-Goog-Api-Key': KEY, 'X-Goog-FieldMask': fields } }
    );
    data = await res.json();
  } catch (e) {
    return bail(`request failed: ${e.message}`);
  }
  if (!res.ok) {
    return bail(`API returned ${res.status}: ${JSON.stringify(data).slice(0, 300)}`);
  }

  const name = (data.displayName && data.displayName.text) || '';
  const address = data.formattedAddress || '';

  console.log(`fetch-reviews: resolved "${name}" — ${address}`);

  /* ---- Gotcha #1: verify the listing before trusting a single number ---- */
  if (!EXPECT_NAME.test(name)) {
    return bail(`resolved listing is "${name}" — that is not FleetFix Glass. ` +
                'Check the Place ID against the business\'s own Google Maps link.');
  }
  if (!EXPECT_REGION.test(address)) {
    return bail(`resolved address "${address}" is not in Colorado.`);
  }
  if (!EXPECT_LOCALITY.test(address)) {
    return bail(`resolved address "${address}" is not in the Denver area.`);
  }
  if (!address.includes(SITE.BUSINESS.street.split(' ')[0])) {
    // Street number mismatch is a warning, not a hard stop — Google sometimes
    // formats the address differently — but it must be visible in the log.
    console.warn(`fetch-reviews: WARNING street number differs from ` +
                 `site.config.cjs ("${SITE.BUSINESS.street}"). Verify manually.`);
  }

  /* ---- sanity-check the values before overwriting anything ---- */
  const rating = Number(data.rating);
  const count = Number(data.userRatingCount);
  if (!(rating >= 1 && rating <= 5)) return bail(`implausible rating: ${data.rating}`);
  if (!(count >= 1)) return bail(`implausible review count: ${data.userRatingCount}`);

  const quotes = (data.reviews || [])
    .map((r) => ({
      author: (r.authorAttribution && r.authorAttribution.displayName) || 'Google user',
      text: ((r.originalText && r.originalText.text) || (r.text && r.text.text) || '').trim(),
      rating: Number(r.rating) || 0,
      when: r.relativePublishTimeDescription || '',
    }))
    .filter((q) => q.rating === 5 && q.text.length >= 60 && q.text.length <= 400)
    .slice(0, 3);

  const payload = {
    rating: Math.round(rating * 10) / 10,
    count,
    mapsUri: data.googleMapsUri || '',
    placeName: name,
    address,
    fetchedAt: new Date().toISOString(),
    quotes,
  };

  const prev = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
  const next = JSON.stringify(payload, null, 2) + '\n';
  if (prev === next) {
    console.log('fetch-reviews: no change.');
    return;
  }
  fs.writeFileSync(OUT, next);
  console.log(`fetch-reviews: wrote ${rating}★ from ${count} reviews, ${quotes.length} quote(s).`);
}

main().catch((e) => bail(e.message));
