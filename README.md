# FleetFix Glass — Google Ads landing site

A static, multi-page landing site for **FleetFix Glass** (Denver, CO), built to
the local-service landing playbook. Plain HTML/CSS/JS, no framework, one Node
script to generate the pages.

Target domain: **quote.fleetfixglass.com** — its own Vercel project, separate
from the existing WordPress site at fleetfixglass.com.

```
npm install                  # only needed for asset generation
npm run build:landing        # generate quote-site/ (runs all build assertions)
npm run serve:landing        # http://localhost:4173
node landing/verify.cjs      # browser checks: layout, tap targets, tracking
```

---

## Before this can take live ad traffic

Five things are unset. The site is safe to deploy without them — the tracking
block no-ops on empty config and the review section degrades to a link to the
real Google listing — but ads should not point at it until at least the first
two are filled in.

| What | Where it goes | Until it's set |
|---|---|---|
| **GHL Inbound Webhook URL** | `GHL_WEBHOOK_URL` in `landing/fleetfix.html` | Form shows "call us instead" rather than silently dropping the lead |
| **Google Ads conversion ID + label** | `GOOGLE_ADS_ID` / `GOOGLE_ADS_LABEL`, same block | No tag loads at all, no conversions reported |
| **Google Place ID** | `BUSINESS.googlePlaceId` in `landing/site.config.cjs` | No rating, count or quotes anywhere on the site |
| **GHL location + number pool ID** | `GHL` in `landing/site.config.cjs` | No dynamic number insertion; the static number shows |
| **Google Ads call asset number** | `BUSINESS.callAssetPhone` / `callAssetE164` | Footer call-asset entry is omitted entirely |

`GOOGLE_PLACES_API_KEY` also needs adding as a repo secret for the weekly
review refresh — see below.

---

## Repository layout

```
landing/
  fleetfix.html           master template — home page and the shell for every other page
  site.config.cjs         business facts, domain, tracking placeholders
  pages.config.cjs        all page content: title, desc, h1, body, FAQ
  build-pages.cjs         the generator (and every build assertion)
  fetch-reviews.cjs       weekly Google Places fetch, with the identity guard
  make-assets.cjs         derives logo/hero/favicon set from landing/img/src
  verify.cjs              Playwright checks: layout, tap targets, tracking
  serve.cjs               local static server matching Vercel's trailingSlash
  legal-privacy.html      prose fragment
  legal-terms.html        prose fragment
  img/src/                the three original source assets
  img/                    generated, committed

quote-site/               GENERATED — never edit by hand
.github/workflows/refresh-reviews.yml
```

## Pages

13 pages, on slugs that match the existing site so repointing an ad is a
hostname change and nothing else.

**Home** · 6 services (`windshield-replacement`, `windshield-repair`,
`fleet-auto-glass`, `truck-windshield-replacement`,
`semi-truck-windshield-replacement`, `mobile-auto-glass`) · 4 cities (`denver`,
`boulder`, `greeley`, `castle-rock`) · `privacy` · `terms-and-conditions`.

**Not carried over** from the existing site — any ad pointing at one of these
needs its final URL changed before the switch: `/about/`, `/contact/`, `/faq/`,
`/quote/`, `/reviews/`, `/financing/`, `/adas-calibration/`,
`/back-glass-replacement/`, `/side-window-replacement/`,
`/commercial-vehicle-glass/`, `/construction-equipment-glass/`,
`/rv-windshield-replacement/`, `/insurance-claims-assistance/`, `/longmont/`,
`/parker/`. The form's service picker still captures all of that intent.

## Indexing

The site ships **`noindex,follow`** (`INDEXABLE: false` in `site.config.cjs`).
It is near-duplicate in topic to fleetfixglass.com and should not compete with
it organically. `robots.txt` deliberately **allows** crawling — Googlebot has to
fetch a page to see the noindex, and the Ads landing-page crawler needs access
for Quality Score. Flip `INDEXABLE` to `true` and rebuild if that changes.

## Tracking

- **Form submissions are reported by the page**, via `gtag`, with enhanced
  conversions and the click ID. Not by the CRM.
- **Phone calls are reported by GHL**, via its Number Pool Calling trigger.
- If GHL has an "Add to Google Ads" action on the form workflow, **turn it off**
  or every lead counts twice.
- Set the Ads conversion action to **page load**, not click.
- 8 click IDs (`gclid`, `gbraid`, `wbraid`, `gclsrc`, `msclkid`, `fbclid`,
  `ttclid`, `li_fat_id`) and 5 UTMs are captured into `sessionStorage` and sent
  with every lead. `gbraid`/`wbraid` matter — Google sends those instead of
  `gclid` on iOS and consent-mode traffic.
- The conversion fires **only after the webhook confirms delivery**, and is
  deduped on `transaction_id` + `sessionStorage`.

## Google reviews

`fetch-reviews.cjs` runs weekly in CI, writes `landing/reviews.json`, and the
build bakes the numbers into the HTML. One API call a week; the key never
reaches the browser.

Setup: enable **Places API (New)** (`places.googleapis.com` — *not* the legacy
`places-backend.googleapis.com`, which 403s), create a key with application
restrictions **None** and API restrictions limited to Places API (New), add it
as the repo secret `GOOGLE_PLACES_API_KEY`, and put the Place ID in
`site.config.cjs`.

The fetcher **asserts the resolved listing is FleetFix Glass in the Denver
area** before writing anything, and exits 0 on any failure so a transient API
error leaves the last good data in place. Do not remove that guard — a wrong
Place ID fails silently and will publish another company's rating across every
page.

Note: **scheduled workflows only run from the default branch.** On a feature
branch GitHub does not register the workflow at all.

## Deploying

One Vercel project for this business.

1. Vercel → Add New → Project → import this repo
2. **Root Directory → `quote-site`** ← the setting that matters
3. Framework Preset **Other**; build, output and install commands all empty
4. Deploy, then Settings → Domains → add `quote.fleetfixglass.com`
5. DNS: `CNAME quote → cname.vercel-dns.com`

Because Root Directory is set, Vercel reads `quote-site/vercel.json`, not any
repo-root config. The Root Directory picker only reads the **default branch**,
so merge before importing or the folder will not appear.

## Build assertions

`npm run build:landing` exits non-zero on any of: duplicate title, meta
description or H1; a missing canonical, Open Graph block or JSON-LD; an
unreplaced template token; a surviving `/PREFIX` path; a rating claim with no
review data; an orphan page; a dead internal link; or city-page body overlap at
or above 5%.

Current worst city-page overlap: **0.19%** (the existing WordPress city pages
average 45.2%).

## Content and claims

Nothing on this site asserts anything the owner can't substantiate. There are
no invented ratings, review counts or testimonials; no "preferred carrier"
status; no guaranteed $0 pricing (insurance coverage is framed as verified per
policy before scheduling); and no business-age claim beyond the EST. 2022 on
the company's own logo. Price ranges are labelled as ranges, not quotes.

Facts taken from the existing site's structured data and **worth confirming
with the owner**: the 1440 Sheridan Boulevard address, the (720) 605-0727
number, the opening hours, and the 2022 founding date.
