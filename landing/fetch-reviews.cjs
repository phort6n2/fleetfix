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
const RV = SITE.REVIEWS;
const PLACE_ID = RV.placeId;

/* The identity guard. A wrong Place ID fails completely silently, because the
   numbers it returns look perfectly plausible — it will happily publish another
   company's rating across every page. Assert who we actually resolved.
   These expectations come from site.config.cjs, so they stay correct when the
   review source changes (currently HV Auto Glass Denver, later FleetFix). */
const EXPECT_NAME = RV.expectName;
const EXPECT_REGION = RV.expectRegion;
const EXPECT_LOCALITY = RV.expectLocality;

function bail(msg) {
  console.error(`fetch-reviews: ${msg}`);
  console.error('fetch-reviews: leaving existing reviews.json untouched.');
  process.exit(0);                       // never fail the build
}

async function main() {
  if (!KEY) return bail('GOOGLE_PLACES_API_KEY is not set.');
  if (!PLACE_ID) return bail('REVIEWS.placeId is empty in site.config.cjs.');

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
    return bail(`resolved listing is "${name}", which does not match ` +
                `REVIEWS.expectName (${EXPECT_NAME}). Check the Place ID against ` +
                'the business\'s own Google Maps link before trusting any number.');
  }
  if (!EXPECT_REGION.test(address)) {
    return bail(`resolved address "${address}" is not in Colorado.`);
  }
  if (!EXPECT_LOCALITY.test(address)) {
    return bail(`resolved address "${address}" is not in the Denver area.`);
  }
  if (RV.attributedTo) {
    console.log(`fetch-reviews: these are ${RV.attributedTo}'s reviews and will be ` +
                'published with visible attribution; aggregateRating stays off this site.');
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
    attributedTo: RV.attributedTo || '',
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
