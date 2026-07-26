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
    // Second, fixed number registered as a Google Ads call asset. It must never
    // be swapped by dynamic number insertion or Google's verification fails.
    // Leave empty until one exists — the footer entry renders only when set.
    callAssetPhone: '',
    callAssetE164: '',
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
    // Populate to switch on the weekly Google reviews refresh. The fetcher
    // asserts the resolved name and address before writing anything.
    googlePlaceId: '',
    googleMapsCid: '',
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
