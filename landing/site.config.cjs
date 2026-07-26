/**
 * Business facts, tracking placeholders and build-wide settings.
 *
 * Everything a human needs to change after handover lives in this file or in
 * the FF_CONFIG block at the top of landing/fleetfix.html. Nothing else in the
 * repo should need editing to point the site at a real Ads account or CRM.
 */
module.exports = {
  /* ---------------------------------------------------------------- domain */
  // The Ads landing site runs on its own subdomain so it can never compete
  // with the main WordPress site for organic traffic.
  ORIGIN: 'https://quote.fleetfixglass.com',

  // Ads landing pages do not need to be indexed, and indexing them would put
  // near-duplicate content in front of fleetfixglass.com. robots.txt still
  // ALLOWS crawling — Googlebot has to fetch the page to see the noindex, and
  // the Google Ads landing-page crawler needs access for Quality Score.
  INDEXABLE: false,

  // Existing Ads final URLs all carry a trailing slash. Matching that exactly
  // means repointing an ad is a hostname change and nothing more.
  TRAILING_SLASH: true,

  /* -------------------------------------------------------------- business */
  BUSINESS: {
    name: 'FleetFix Glass',
    legalName: 'FleetFix Glass',
    // VERIFY BEFORE LAUNCH — taken from the existing site's structured data.
    phone: '(720) 605-0727',
    phoneE164: '+17206050727',
    // Second, fixed number registered as a Google Ads call asset. Google checks
    // that this number appears on the landing page; if dynamic number insertion
    // rewrites it, that check fails and the call asset stops serving. It is
    // rendered in the footer only, carrying ghl-no-swap / data-no-swap so the
    // number pool script leaves it alone. Build assertions enforce that it is
    // present, marked no-swap, and appears exactly once.
    callAssetPhone: '(720) 477-4896',
    callAssetE164: '+17204774896',
    email: '',                                   // none published on the current site
    street: '1440 Sheridan Boulevard',
    city: 'Denver',
    state: 'CO',
    stateName: 'Colorado',
    zip: '80214',
    lat: 39.7375,
    lng: -105.0334,
    established: '2022',                         // from the logo mark: EST. 2022
    priceRange: '$$',
    hours: [
      { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '07:00', closes: '18:00' },
      { days: ['Saturday'], opens: '08:00', closes: '17:00' },
    ],
    hoursHuman: 'Mon–Fri 7am–6pm, Sat 8am–5pm, Sun closed',
  },

  /* --------------------------------------------------------------- reviews */
  /**
   * FleetFix is new and has no Google Business Profile of its own yet, so the
   * reviews shown are HV Auto Glass Denver's — the same team runs both.
   *
   * `attributedTo` is what keeps that honest. While it is set, the build:
   *   - names the source business in the section heading and on every card,
   *   - links the rating to THAT business's Google listing,
   *   - and refuses to put aggregateRating in FleetFix's structured data.
   *
   * Presenting another business's reviews as your own is review hijacking
   * under the FTC's Consumer Reviews rule (16 CFR 465) and a Google Ads
   * misrepresentation risk. Attribution is what makes this legitimate — do not
   * remove it to tidy up the design.
   *
   * WHEN FLEETFIX HAS ITS OWN PROFILE: set placeId/mapsCid/expectName to
   * FleetFix's, clear `attributedTo`, and the site automatically switches to
   * first-person wording and starts emitting aggregateRating again.
   */
  REVIEWS: {
    attributedTo: 'HV Auto Glass Denver',
    attributionNote: 'FleetFix Glass is run by the team behind HV Auto Glass Denver. '
      + 'FleetFix is newer and is still building its own review profile, so these are '
      + 'HV Auto Glass Denver’s Google reviews.',
    // Needed for the weekly refresh. Find it in Google's Place ID finder.
    placeId: '',
    // From HV's own published listing link — used for the "read them" link.
    mapsCid: '13934619566903784372',
    // Identity guard for fetch-reviews.cjs. This must describe the business the
    // Place ID is expected to resolve to, so a wrong ID fails loudly.
    expectName: /hv\s*auto\s*glass/i,
    expectLocality: /(Denver|Lakewood|Edgewater|Wheat Ridge|Arvada)/i,
    expectRegion: /(,\s*CO\b|\bColorado\b)/i,
  },

  /* ------------------------------------------------------- GHL integration */
  // Number pool (dynamic number insertion). Both must be set for the call
  // tracking scripts to be injected at all.
  GHL: {
    locationId: '',
    numberPoolId: '',
  },

  /* ---------------------------------------------------- form service picker */
  // Captures full intent even where a service has no dedicated page.
  SERVICE_OPTIONS: [
    'Windshield replacement',
    'Windshield chip / crack repair',
    'Fleet or multi-vehicle program',
    'Truck windshield (pickup, box truck)',
    'Semi truck windshield',
    'RV / motorhome windshield',
    'Construction equipment glass',
    'Side window / door glass',
    'Back glass',
    'ADAS camera calibration',
    'Something else',
  ],
};
