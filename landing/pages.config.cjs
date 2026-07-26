/**
 * Every page's content. One entry per output page.
 *
 * Claim policy: nothing in here asserts anything the owner can't substantiate.
 * No review counts, no star ratings, no "preferred carrier" status, no
 * guaranteed $0 pricing, and no business-age claim beyond the EST. 2022 on the
 * company's own logo. Ratings only ever appear when landing/reviews.json holds
 * real data fetched from the Google Places API.
 */

const SERVICES = [
  { slug: 'windshield-replacement',            nav: 'Windshield Replacement', short: 'Windshields', card: 'Windshield Replacement',      blurb: 'Full replacement for cars, trucks and commercial vehicles, with camera recalibration where the vehicle needs it.' },
  { slug: 'windshield-repair',                 nav: 'Chip &amp; Crack Repair', short: 'Chip Repair', card: 'Windshield Chip Repair',      blurb: 'Rock chips and short cracks filled on site in about half an hour, keeping your original factory seal intact.' },
  { slug: 'fleet-auto-glass',                  nav: 'Fleet Programs', short: 'Fleet Glass', card: 'Fleet Auto Glass',            blurb: 'Yard-side service days, PO invoicing, net-30 terms and per-unit service records for commercial accounts.' },
  { slug: 'truck-windshield-replacement',      nav: 'Truck Glass', short: 'Trucks', card: 'Truck Windshield Replacement', blurb: 'Pickups, box trucks and upfitted work trucks — including vehicles with racks, service bodies and toppers.' },
  { slug: 'semi-truck-windshield-replacement', nav: 'Semi Truck Glass', short: 'Semi Trucks', card: 'Semi Truck Windshields',      blurb: 'Class 7 and 8 tractors — Freightliner, Peterbilt, Kenworth, Volvo, Mack and International — serviced at your terminal.' },
  { slug: 'mobile-auto-glass',                 nav: 'Mobile Service', short: 'Mobile', card: 'Mobile Auto Glass',           blurb: 'Every job is a mobile job. We bring the glass, the adhesive and the power to wherever the vehicle is parked.' },
];

const CITIES = [
  { slug: 'denver',      nav: 'Denver',      card: 'Denver',      blurb: 'Our home base. Metro-wide mobile service from the Sheridan corridor to DIA.' },
  { slug: 'boulder',     nav: 'Boulder',     card: 'Boulder',     blurb: 'Boulder County campus fleets, canyon commuters and Pearl Street delivery vans.' },
  { slug: 'greeley',     nav: 'Greeley',     card: 'Greeley',     blurb: 'Weld County ag equipment, oilfield pickups and US-85 freight.' },
  { slug: 'castle-rock', nav: 'Castle Rock', card: 'Castle Rock', blurb: 'Douglas County and the I-25 Gap, where the gravel and the weather both bite.' },
];

/* Shared FAQ entries reused where they genuinely apply. Each page still gets a
   majority of questions written for that page alone. */
const FAQ_INSURANCE = {
  q: 'Will my insurance cover this?',
  a: 'Often, yes. If you carry comprehensive coverage, glass is usually included, and many Colorado policies are written with a reduced or waived glass deductible. We check your specific policy before we schedule and tell you exactly what you will owe, if anything — we would rather have that conversation up front than surprise you afterwards. We file the claim and bill the carrier directly, so the paperwork is ours, not yours.',
};

module.exports = { SERVICES, CITIES, PAGES: [

/* ======================================================================= */
/* HOME                                                                    */
/* ======================================================================= */
{
  slug: '',
  title: 'FleetFix Glass | Mobile & Fleet Auto Glass, Denver CO',
  desc: 'Mobile windshield replacement and auto glass repair across Colorado’s Front Range. Fleet programs, truck and equipment glass. We bill insurance direct. Free quote.',
  ogTitle: 'FleetFix Glass — Mobile & Fleet Auto Glass, Denver CO',
  eyebrow: 'Mobile service · Greeley to Castle Rock',
  h1: 'Commercial & fleet auto glass across Denver and the Front Range',
  sub: 'Mobile windshield replacement, chip repair, heavy equipment and semi truck glass. We come to your yard, your job site or your driveway — and we bill your insurer direct.',
  heroPoints: [
    'Mobile on every job — no shop visit, no extra charge inside our service area',
    'Fleet programs with PO invoicing and net-30 terms on approved accounts',
    'Lifetime workmanship warranty on every installation',
  ],
  servicesHeading: 'What we replace and repair',
  areasHeading: 'Where we work',
  ctaHeading: 'Get a firm price on your glass',
  body: `
<h2>Auto glass built around commercial vehicles</h2>
<p>Most auto glass shops are set up for one car at a time and treat commercial work as an occasional extra. FleetFix runs the other way round. The scheduling, the billing and the van stock are all organised for operators — fleets, contractors, haulers and trades — which is why we can put a technician in your yard and work through six vehicles in an afternoon rather than booking six separate appointments.</p>
<p>That said, we have never turned away a single cracked windshield. The same technician who spends the morning on a distribution fleet spends the afternoon in someone's driveway in Wheat Ridge, and the work is done to the same standard either way.</p>

<h2>What we actually do</h2>
<p>Windshields are the bulk of it — replacements and chip repairs on everything from a Civic to a Peterbilt. Beyond that we handle door and quarter glass, back glass including heated and sliding rear windows, RV and motorhome windshields, and cab glass on excavators, loaders, skid steers and backhoes. If a vehicle has glass in it and it is broken, it is in scope.</p>
<p>Where a vehicle has a forward-facing camera mounted to the windshield — which now covers most vehicles built in the last several years — the camera has to be recalibrated after the glass is replaced. We handle that as part of the job rather than sending you somewhere else to finish it.</p>

<h2>Colorado is hard on glass</h2>
<p>There is a reason windshield work is steady year-round here. Front Range hail season runs through late spring and summer and regularly produces stones large enough to break laminated glass outright. Winter brings sand and magnesium chloride onto every arterial in the state, and both are brutal on a windscreen that already has a chip in it. And the daily temperature swing does the rest: a 60-degree afternoon followed by a hard overnight freeze will turn a chip the size of a pea into a crack running the width of the glass, often without anything hitting it at all.</p>
<div class="callout">
<p><b>If you have a chip, deal with it early.</b> A chip that can be filled in half an hour becomes a full replacement once the crack reaches the edge of the glass or crosses the driver's line of sight. Repairs are also considerably cheaper, and many insurers waive the deductible on a repair specifically because it saves them a replacement later.</p>
</div>

<h2>What it costs</h2>
<p>Glass pricing depends on the vehicle, what is bonded to the windshield and whether you are claiming. As a rough guide before you get a real quote:</p>
<ul>
<li><b>Cars and light pickups</b> — most replacements land in the $200–$500 range, and more when there is a camera, heating element or acoustic interlayer involved.</li>
<li><b>Work trucks and commercial vans</b> — typically $250–$700 depending on the model and the glass specification.</li>
<li><b>Class 7 and 8 tractors</b> — usually $300–$1,000 or more, varying widely by make and whether the truck takes a one-piece or two-piece windshield.</li>
<li><b>RVs and heavy equipment</b> — quoted per job, because the glass often has to be sourced specifically for the unit.</li>
</ul>
<p>Those are ranges, not quotes. Tell us the year, make and model — or better, the VIN — and we will come back with a firm number that includes the mobile visit, the glass, the fitting and any calibration the vehicle needs. What we quote is what you pay.</p>
`,
  faq: [
    { q: 'Do you charge extra to come to me?', a: 'No. Mobile service is how we work rather than an add-on, and there is no travel charge anywhere inside our normal service area — that runs from Greeley in the north to Castle Rock in the south, and across the metro from Golden to Aurora. If you are outside that, call and ask; we will either quote the trip honestly or tell you that someone closer makes more sense.' },
    FAQ_INSURANCE,
    { q: 'How long does a replacement take?', a: 'Around 45 to 60 minutes of fitting time for a typical car or light pickup, and 60 to 90 minutes for larger commercial vehicles. The part that catches people out is the adhesive cure — the urethane needs time to reach the strength where the windshield can do its structural job in a crash. Your technician will give you a specific safe drive-away time on the day, because it depends on the adhesive used and the temperature it cured at.' },
    { q: 'What vehicles do you work on?', a: 'Passenger cars, pickups, vans, box trucks, semi tractors, buses, motorhomes, and construction plant such as excavators, loaders, skid steers and backhoes. Farm equipment cab glass too. The awkward ones are usually a sourcing question rather than a fitting question, so the sooner we have the VIN or the serial plate the sooner we can confirm a date.' },
    { q: 'Do you offer fleet accounts?', a: 'Yes, and it is most of what we do. An account gets you priority scheduling, pricing based on volume rather than per-job, purchase-order invoicing, net-30 terms once the account is approved, and a service record against each unit so you can see what has been done to which vehicle. It works the same whether you run five vans or several hundred.' },
    { q: 'Do you speak Spanish?', a: 'Sí. We handle scheduling, the on-site work and the paperwork in English or Spanish.' },
  ],
},

/* ======================================================================= */
/* SERVICES                                                                */
/* ======================================================================= */
{
  slug: 'windshield-replacement',
  service: 'Windshield replacement',
  title: 'Windshield Replacement Denver CO | Mobile | FleetFix Glass',
  desc: 'Mobile windshield replacement across Denver and the Front Range. OEM-equivalent glass, camera recalibration included, insurance billed direct. Free quote.',
  ogTitle: 'Mobile Windshield Replacement — Denver & the Front Range',
  eyebrow: 'Replacement · Mobile across the Front Range',
  h1: 'Mobile windshield replacement in Denver and across the Front Range',
  sub: 'We replace the glass where the vehicle is parked, recalibrate the camera if it has one, and bill your insurer direct. Cars, work trucks, tractors and everything between.',
  heroPoints: [
    'OEM and OEM-equivalent glass matched to your exact VIN',
    'Forward-facing camera recalibration handled as part of the job',
    'Lifetime workmanship warranty against leaks and seal failure',
  ],
  servicesHeading: 'Other glass work we handle',
  areasHeading: 'Where we replace windshields',
  ctaHeading: 'Ready to get the glass replaced?',
  body: `
<h2>When a windshield has to be replaced rather than repaired</h2>
<p>Not every crack means new glass, and we will tell you when a repair will do. But replacement becomes the only sensible option once damage reaches the edge of the glass, once a crack runs longer than about six inches, once there are multiple breaks close together, or once the damage sits in the area of the glass the driver actually looks through. Damage to the inner layer of the laminate is also a replacement, because resin cannot reach it.</p>
<p>It matters more than people expect. A bonded windshield is a structural part of the vehicle: it contributes to roof crush resistance in a rollover and it provides the backboard the passenger airbag inflates against. A compromised windshield is not just a visibility problem.</p>

<h2>The glass we fit</h2>
<p>We use OEM glass where a job calls for it and OEM-equivalent glass otherwise — both meet the federal safety standards for automotive glazing. Equivalent glass is made to the same specification and is what most insurers approve; genuine manufacturer-branded glass costs more and is usually specified for newer vehicles or where a fleet's policy requires it. We will tell you which we are quoting and why, and if you have a preference we will price it either way.</p>
<p>Matching matters more than brand. A modern windshield may carry a rain sensor, a humidity sensor, a heated wiper park, an acoustic interlayer, a heads-up display area, a shade band or an antenna — and the same model year of the same vehicle can have several different windshields depending on options. That is why we ask for the VIN: it removes the guesswork and stops a technician arriving with glass that will not do the job.</p>

<h2>Camera recalibration</h2>
<p>If your vehicle has lane departure warning, automatic emergency braking, adaptive cruise or a forward collision alert, there is a camera looking through the windshield. Move that glass and the camera's aim changes with it — even by a fraction of a degree, which is enough to matter at the distances these systems measure.</p>
<p>So the camera has to be recalibrated after the glass goes in. Some vehicles calibrate statically against a target board, some need a dynamic drive cycle at road speed, and plenty need both. We carry the equipment to do this and we treat it as part of the replacement, not an upsell — a vehicle we have replaced glass on leaves with its driver assistance systems working as the manufacturer intended.</p>

<div class="callout">
<p><b>Ask about safe drive-away time.</b> Urethane adhesive needs to reach a minimum strength before the vehicle is crash-safe, and how long that takes depends on the adhesive, the temperature and the humidity. In a Colorado winter it is longer than in July. Your technician will give you a specific time before leaving — please do not treat it as a formality.</p>
</div>

<h2>How the appointment runs</h2>
<p>We confirm the glass against your VIN and bring it with us. On site the technician protects the interior and paintwork, cuts out the old glass, cleans and primes the pinch weld, lays fresh urethane and sets the new windshield. Old glass leaves with us for recycling. Then the camera is calibrated if the vehicle needs it, and you get an itemised invoice and the safe drive-away time.</p>
<p>Level ground and reasonable access are all we need. There is no requirement for a power outlet — the van carries its own.</p>
`,
  faq: [
    { q: 'Can you replace glass outdoors in winter?', a: 'Usually, yes. We carry cold-weather urethane rated for low-temperature application and we work under cover where we can. What we will not do is fit glass in conditions that stop the adhesive curing properly — driving snow, or temperatures below what the product is rated for. If that is the situation on the day we will say so and rebook rather than hand you a windshield that is not bonded correctly.' },
    { q: 'Is OEM-equivalent glass as safe as manufacturer glass?', a: 'Yes, in the sense that matters: both have to meet the same federal safety standard for automotive glazing, and both are laminated to the same construction. The genuine article carries the vehicle maker’s branding and is built on their tooling, which occasionally gives a closer fit on optical distortion near the edges. For most vehicles the equivalent is what your insurer will approve and what we would fit to our own vehicles.' },
    { q: 'Will my ADAS camera definitely need recalibrating?', a: 'If the vehicle has a windshield-mounted forward camera, then yes — manufacturers specify recalibration after glass replacement, without exception. We confirm what your specific vehicle requires when we quote, so there is no surprise line item afterwards.' },
    FAQ_INSURANCE,
    { q: 'What does the warranty actually cover?', a: 'Our workmanship, for as long as you own the vehicle. If the installation leaks, whistles, or the seal fails, we come back and put it right at no cost. It does not cover new impact damage — a fresh rock is a fresh rock — and it does not cover a defect in the glass itself, which is handled under the manufacturer’s warranty.' },
  ],
},

{
  slug: 'windshield-repair',
  service: 'Windshield chip / crack repair',
  title: 'Windshield Chip Repair Denver | Mobile Rock Chip Repair',
  desc: 'Mobile rock chip and crack repair across Denver and the Front Range — about 30 minutes on site, keeps your factory seal, and often covered with no deductible.',
  ogTitle: 'Windshield Chip & Crack Repair — Mobile, Front Range',
  eyebrow: 'Repair · About 30 minutes on site',
  h1: 'Windshield chip and crack repair in Denver, done where you park',
  sub: 'A rock chip caught early is a half-hour job that saves your original factory seal — and many insurers waive the deductible on a repair because it saves them a replacement.',
  heroPoints: [
    'Most repairs finished in about 30 minutes, wherever the vehicle is',
    'Keeps the factory-bonded glass and its original seal in place',
    'Frequently covered with no deductible — we check your policy first',
  ],
  servicesHeading: 'If it turns out to need replacing',
  areasHeading: 'Where we repair chips',
  ctaHeading: 'Get that chip dealt with',
  body: `
<h2>Why repairing beats replacing when you can</h2>
<p>The glass your vehicle left the factory with was bonded in a controlled environment by robots, and that original seal is genuinely difficult to improve on. Every replacement, however well done, means cutting that bond out and creating a new one. If the damage can be repaired instead, you keep the factory seal, you keep the original glass, and you avoid recalibrating any camera mounted to it.</p>
<p>It is also faster and cheaper by a wide margin, and it does not put your vehicle out of action for a cure period. For a fleet, that difference compounds: a repair is a half-hour stop, a replacement is most of a working day once cure time is counted.</p>

<h2>What can actually be repaired</h2>
<p>The honest answer is that it depends on size, location and age, and there is no substitute for looking at it. As a general guide, we can usually fill:</p>
<ul>
<li>Bullseyes, stars and combination breaks up to roughly the size of a quarter</li>
<li>Single cracks up to about six inches long that have not reached the edge of the glass</li>
<li>Surface pits and chips that have not penetrated to the inner laminate layer</li>
</ul>
<p>What we generally cannot repair: damage sitting directly in the driver's primary line of sight, where even a well-executed repair leaves slight distortion; cracks that have run to the edge of the glass, because the edge is where the structural load sits; damage over a sensor or camera mount; and breaks that have been open long enough to fill with dirt and moisture, because the resin cannot bond to a contaminated cavity.</p>

<div class="callout">
<p><b>Time is the enemy.</b> A chip is a sealed void until it isn't. Once water gets in, freezes overnight and expands, the break spreads — and Colorado's overnight temperature swings do this reliably. The gap between "half-hour repair" and "full replacement" is often a single cold night.</p>
</div>

<h2>How the repair is done</h2>
<p>The technician cleans the break out and removes moisture and loose glass from the cavity. A bridge is fixed over the damage and the air is drawn out under vacuum — this is the part that matters, because a repair is only as good as how completely the void is emptied before resin goes in. Optically-matched resin is then injected under pressure, worked into the legs of the break, and cured with ultraviolet light. The surface is levelled flush and polished.</p>
<p>You should expect the damage to become much less visible and structurally stable — you should not expect it to vanish completely. Anyone promising an invisible repair is overselling it. What you are buying is a break that has stopped spreading and glass that keeps its strength.</p>

<h2>Multiple vehicles, one visit</h2>
<p>Chip repair suits fleet work particularly well, because the whole job happens in the time a driver takes a break. We will happily walk a yard, assess every windshield on the lot, and repair what is repairable in a single visit — flagging separately anything that has gone too far and needs quoting as a replacement.</p>
`,
  faq: [
    { q: 'How long before I can drive?', a: 'Straight away. The resin is cured with UV light during the appointment, so there is no waiting period — unlike a replacement, where the adhesive needs time to reach strength. You can drive off as soon as the technician has polished the surface.' },
    { q: 'Will the chip disappear completely?', a: 'No, and be sceptical of anyone who says it will. A good repair typically removes most of the visible damage and leaves a faint mark where the impact point was. The point of the repair is structural — it stops the break spreading and restores the strength of the glass. Cosmetic improvement is a welcome side effect rather than the goal.' },
    { q: 'Is a repair really covered with no deductible?', a: 'Frequently, yes — many carriers waive the deductible on a chip repair specifically because filling a chip for a small sum is cheaper for them than a full replacement later. It depends on your policy rather than on state law, so we verify your coverage before we come out and tell you exactly where you stand.' },
    { q: 'How many chips can you fill at once?', a: 'There is no fixed limit, but the breaks need to be far enough apart that the glass between them is not already compromised. Several separate chips across a windshield are usually all repairable. A cluster of breaks in one area often is not, because the glass in that zone has lost too much integrity — in that case we would recommend replacement and say so plainly.' },
    { q: 'What if you get here and it cannot be repaired?', a: 'We tell you, we explain why, and we quote the replacement. You are under no obligation to book it with us on the spot. We would much rather lose a job than fill a break that is going to spread anyway and have you back in a fortnight.' },
  ],
},

{
  slug: 'fleet-auto-glass',
  service: 'Fleet or multi-vehicle program',
  title: 'Fleet Auto Glass Denver | PO Billing & Net-30 | FleetFix',
  desc: 'Fleet auto glass programs across Colorado’s Front Range. Yard-side service days, priority scheduling, PO invoicing and net-30 terms on approved accounts.',
  ogTitle: 'Fleet Auto Glass Programs — Denver & the Front Range',
  eyebrow: 'Fleet programs · Five vehicles or five hundred',
  h1: 'Fleet auto glass programs for Denver and Front Range operators',
  sub: 'Priority scheduling, volume-based pricing, purchase-order invoicing and per-unit service records — with the technician coming to your yard instead of your vehicles going to a shop.',
  heroPoints: [
    'Yard-side service days — multiple units handled in one visit',
    'PO invoicing and net-30 terms once the account is approved',
    'Documented service history against every unit we touch',
  ],
  servicesHeading: 'What we cover under a fleet account',
  areasHeading: 'Fleet coverage area',
  ctaHeading: 'Set up a fleet account',
  body: `
<h2>The real cost of a cracked windshield is not the windshield</h2>
<p>For an operator, glass is rarely the expensive part. The expensive part is the vehicle sitting still, the driver reassigned, the job rescheduled and the dispatcher spending an afternoon on it. A $350 windshield on a unit that bills $900 a day is not a $350 problem.</p>
<p>That is the whole design brief for our fleet programme. Everything about it is aimed at compressing downtime rather than shaving a few dollars off the glass.</p>

<h2>How a fleet account works</h2>
<h3>Service days instead of appointments</h3>
<p>Rather than booking vehicles in one at a time, we schedule a block at your yard and work through the list. A technician arrives with the glass for every unit already sourced against its VIN, and units get handled as they become free — a driver returning at eleven does not lose their slot because they were not there at nine. Most operators find this alone removes the majority of the coordination overhead.</p>

<h3>Priority scheduling for breakdowns</h3>
<p>Planned work is one thing; a truck that took a rock this morning is another. Account holders go to the front of the queue for urgent work, and where the damage is repairable we will usually get someone out the same day.</p>

<h3>Billing that fits a purchase-order process</h3>
<p>We invoice against your PO numbers, reference your unit numbers on every line, and offer net-30 terms once the account is approved. Statements can be consolidated monthly rather than arriving per job, which makes reconciliation something one person does once rather than something accounts payable does forty times.</p>

<h3>A record against each unit</h3>
<p>Every job is logged against the vehicle: what was done, when, which glass went in, and whether a camera was recalibrated. When a unit comes up for inspection, gets sold on, or a question arises about a previous repair, the history exists. This turns out to matter far more to fleet managers than anyone expects at the point of setting the account up.</p>

<h2>Fleets we look after</h2>
<p>The mix is broad: delivery and last-mile operations, plumbing, electrical and HVAC trades running vans out of metro yards, general contractors with pickups and plant spread over multiple sites, regional haulers running the I-25 corridor, municipal and utility fleets, agricultural operations in Weld County, and equipment rental yards. Vehicle types run from Transit vans through to Class 8 tractors and tracked excavators.</p>

<div class="callout">
<p><b>Compliance angle worth knowing.</b> Windshield damage in the driver's primary viewing area can put a commercial vehicle out of service at a roadside inspection. If you are running DOT-regulated units, glass belongs on the pre-trip checklist — and a chip caught in a yard walkthrough is dramatically cheaper than one caught at a scale house.</p>
</div>

<h2>Getting set up</h2>
<p>It is not a heavy process. Tell us roughly how many units you run, what they are and where they live. We will walk the yard if that helps, quote your typical vehicle types so you have real numbers to plan against, and set the account terms up. There is no minimum spend and no contract that locks you in — if the service does not do what we said it would, you stop using it.</p>
`,
  faq: [
    { q: 'How many vehicles do I need to open an account?', a: 'There is no minimum. We run accounts for operators with three vans and for operators with several hundred units. What changes with size is the pricing tier and whether scheduled service days make more sense than ad-hoc visits — below roughly ten vehicles most operators are better served just calling when something breaks.' },
    { q: 'Can you invoice against our purchase orders?', a: 'Yes. We reference your PO number and your internal unit number on every line item, so the invoice reconciles against your system rather than ours. Consolidated monthly statements are available if you would rather not process individual invoices.' },
    { q: 'Do you handle commercial insurance claims?', a: 'Yes, both commercial policies and personal ones. For fleet claims we deal with your carrier or your broker directly and bill them, and we will work to whatever claim-reporting process you already have in place rather than asking you to adopt ours.' },
    { q: 'What if a vehicle is out on a job when you arrive?', a: 'It gets picked up later in the same visit, or rolled to the next one. Service days are scheduled with enough slack that vehicles returning mid-session still get handled. We would rather build that flexibility in than have your dispatcher pulling drivers off routes to hit an appointment time.' },
    { q: 'Can you service vehicles across multiple sites?', a: 'Yes. Multi-site operators are common — we will either run separate service days per yard or route a technician between sites in one day, depending on the distances and how many units are at each. Anywhere between Greeley and Castle Rock is workable.' },
  ],
},

{
  slug: 'truck-windshield-replacement',
  service: 'Truck windshield (pickup, box truck)',
  title: 'Truck Windshield Replacement Denver | Work Trucks & Vans',
  desc: 'Mobile truck windshield replacement across the Denver Front Range — pickups, box trucks, cargo vans and upfitted work trucks. Insurance billed direct.',
  ogTitle: 'Truck Windshield Replacement — Denver Front Range',
  eyebrow: 'Work trucks · Pickups, box trucks, vans',
  h1: 'Truck windshield replacement in Denver for pickups, vans and box trucks',
  sub: 'Half-ton to heavy-duty, cargo van to box truck, including vehicles carrying racks, service bodies and upfits that a general shop would rather not deal with.',
  heroPoints: [
    'Ford, Chevrolet, GMC, Ram, Toyota, Isuzu, Hino and Freightliner chassis',
    'Upfitted trucks welcome — racks, toppers, service bodies and liftgates',
    'Serviced at your yard or job site, so the truck stays where the work is',
  ],
  servicesHeading: 'Other work we do on commercial vehicles',
  areasHeading: 'Where we service work trucks',
  ctaHeading: 'Get your truck back to work',
  body: `
<h2>Work trucks are not just big cars</h2>
<p>A three-quarter-ton pickup with a ladder rack and a utility body is a different proposition from a sedan, and pretending otherwise is how glass gets damaged during fitting. The windshields are larger and heavier, which frequently makes it a two-person set rather than a one-person one. The A-pillar geometry is different. And there is usually something bolted near the glass — a rack upright, a light bar, a beacon, an antenna mount — that has to come off carefully and go back on correctly.</p>
<p>We do this daily, so the awkward parts are planned for rather than discovered on site. If your truck has an upfit, tell us what it is when you call and the technician arrives with the right hands and the right kit.</p>

<h2>What we work on</h2>
<p>Half-ton through one-ton pickups across all the usual makes — F-150 through F-450, Silverado and Sierra including 2500HD and 3500HD, Ram 1500 through 5500, Tundra, Titan. Cargo and passenger vans: Transit, E-Series, Sprinter, ProMaster, Express and Savana. Box trucks and cutaway chassis from Isuzu, Hino, Freightliner and the domestic manufacturers. Flatbeds, dumps, stake beds, tow trucks and service rigs.</p>
<p>Box truck cabs deserve a specific mention: the glass is often a flat or lightly curved unit sitting in a rubber gasket rather than bonded in urethane, which is a genuinely different fitting method. Both are routine for us, but they are not interchangeable skills, and a shop that only does passenger cars will struggle with the gasket-set ones.</p>

<h2>Getting the right glass first time</h2>
<p>Trim level drives the windshield on a modern truck far more than most owners expect. Within a single model year you might be choosing between glass with or without a rain sensor, with or without a heated wiper park area, with or without an acoustic layer, and with or without a bracket for a forward camera. Guess wrong and the technician arrives with a windshield that physically fits but leaves a sensor unmounted.</p>
<p>The VIN settles all of it. Give us the VIN when you book and we will confirm the exact part before the van loads.</p>

<div class="callout">
<p><b>Heavy-duty pickups increasingly have cameras.</b> Lane keeping and adaptive cruise are now common well up the weight range, and any of those systems means recalibration after replacement. We check this against the VIN at quote stage so it is priced in from the start rather than appearing as an extra afterwards.</p>
</div>

<h2>Downtime, and how we keep it short</h2>
<p>Fitting a truck windshield takes roughly 60 to 90 minutes depending on the vehicle and what has to come off first. Add the adhesive cure before the truck is safe to drive, and you are looking at a couple of hours out of a working day rather than a whole one.</p>
<p>Because we come to you, none of that time is spent driving to a shop or waiting in one. Book the truck for a morning it is not scheduled tight, and it goes back on the road the same day. If you have several trucks needing glass, ask about a fleet account and we will do them together in a single visit.</p>
`,
  faq: [
    { q: 'Can you replace glass with a ladder rack fitted?', a: 'Yes. In most cases the rack stays on and we work around it; occasionally an upright sits close enough to the A-pillar that removing one leg makes the set safe, in which case we take it off and refit it. Tell us what is on the truck when you book so the technician arrives prepared rather than improvising.' },
    { q: 'Do you do box truck and cutaway cabs?', a: 'Yes, including the gasket-set flat glass common on Isuzu, Hino and older Freightliner cabs, which is a different fitting method from a bonded windshield. Both are routine — just say which chassis it is when you call so we source the right unit.' },
    { q: 'Can you come to a job site rather than the yard?', a: 'Yes, provided the truck is on reasonably level ground and there is space to work around the front of the vehicle. Active construction sites are fine — we work on them constantly. We do not need a power supply; the van carries its own.' },
    FAQ_INSURANCE,
    { q: 'How soon can the truck be driven?', a: 'Once the urethane has reached its safe drive-away strength, which the technician will specify on the day. It is not a fixed number — it depends on the adhesive used and the temperature it is curing at, so it is meaningfully longer on a January morning than a July afternoon. You will be told a real time before we leave, not a generic one.' },
  ],
},

{
  slug: 'semi-truck-windshield-replacement',
  service: 'Semi truck windshield',
  title: 'Semi Truck Windshield Replacement Denver | Class 7 & 8',
  desc: 'Mobile semi truck windshield replacement across Colorado’s Front Range — Freightliner, Peterbilt, Kenworth, Volvo, Mack, International. Serviced at your terminal.',
  ogTitle: 'Semi Truck Windshield Replacement — Colorado Front Range',
  eyebrow: 'Class 7 & 8 · Serviced at your terminal',
  h1: 'Semi truck windshield replacement across Denver and the I-25 corridor',
  sub: 'Freightliner, Peterbilt, Kenworth, Volvo, Mack and International — one-piece and two-piece glass, fitted at your terminal, your yard or wherever the tractor is parked up.',
  heroPoints: [
    'One-piece and split two-piece windshields sourced to the tractor',
    'We come to the terminal — no deadheading a tractor to a glass shop',
    'Damage in the driver’s viewing area can put a unit out of service',
  ],
  servicesHeading: 'Other heavy vehicle glass',
  areasHeading: 'Where we service tractors',
  ctaHeading: 'Get the tractor rolling again',
  body: `
<h2>Glass is a roadside inspection item</h2>
<p>This is the part that turns a cosmetic annoyance into an operational problem. Federal inspection standards restrict damage in the area of the windshield the driver actually looks through, and an inspector who decides a crack falls in that zone can place the unit out of service on the spot. That is a load not delivered, a driver stranded and a violation on the carrier's record.</p>
<p>Which is why we treat semi glass as urgent work by default. A cracked tractor windshield is not something to schedule for next week.</p>

<h2>One-piece, two-piece, and why it matters</h2>
<p>Heavy tractors split into two camps. Some take a single large curved windshield; others take two flat or lightly curved halves divided by a centre post. The distinction is not cosmetic — it changes the sourcing, the fitting method and the price, and it is usually possible to replace just the damaged half on a two-piece truck, which is a meaningful saving.</p>
<p>Broadly: Peterbilt and Kenworth conventionals are commonly two-piece, while many Freightliner Cascadia, Volvo VNL and International LT configurations run one-piece. There is enough variation by model year and cab that we confirm against the VIN rather than assuming. Older cabovers and vocational trucks add further permutations.</p>

<h2>Makes we handle</h2>
<p>Freightliner Cascadia, Columbia, Coronado and M2. Peterbilt 379, 389, 567, 579 and 587. Kenworth W900, T680, T800 and T880. Volvo VNL and VNR. Mack Anthem, Pinnacle and Granite. International LT, ProStar, LoneStar and HX. Western Star across the 47, 49 and 57 series. Vocational and vocational-adjacent units — mixers, dumps, refuse, cranes — are all in scope too.</p>

<h2>Working at a terminal</h2>
<p>Bringing a tractor to a glass shop is expensive in a way that is easy to underestimate: you are moving an 80,000-pound-capable vehicle, paying a driver to sit through the job, and losing most of a shift. So we come to you — terminals, drop yards, truck stops, distribution centres, or the shoulder of your own lot.</p>
<p>What we need is straightforward: the tractor on level ground, clearance to work across the full width of the cab, and ideally the unit not blocked in by trailers. We bring everything else. Heavy glass is a two-technician job and we staff it that way rather than having one person wrestle a windshield the size of a door.</p>

<div class="callout">
<p><b>Cure time on a tractor is not optional either.</b> The urethane bonding a heavy truck windshield needs the same respect as on a car, and the glass is considerably heavier. We will give you a safe drive-away time — dispatching a tractor before it is reached is a genuine safety risk, not a formality.</p>
</div>

<h2>Fleet terminals and multiple units</h2>
<p>If you are running a yard with several tractors needing glass, we will schedule a block and work through them. Units get sourced against their individual VINs beforehand so there is no waiting on parts mid-visit, and each one is invoiced against your unit number and PO. For carriers running the corridor between Greeley and Castle Rock this is usually the cheapest way to clear a backlog of deferred glass work.</p>
`,
  faq: [
    { q: 'Can you replace just one half of a two-piece windshield?', a: 'Yes, and on a split-glass tractor that is usually exactly what we do — there is no reason to replace undamaged glass. It brings the cost down substantially compared with doing both sides. If the centre seal or the post gasket is also perished we will flag it, because replacing the glass and leaving a failed seal behind just produces a leak.' },
    { q: 'How quickly can you get a tractor back in service?', a: 'The fitting itself is usually 60 to 90 minutes with two technicians, plus the adhesive cure before the unit can be dispatched. The variable is glass availability: common Cascadia and T680 units we can often source same-day or next-day, while an older or vocational cab may take longer. Give us the VIN as early as you can and we will tell you honestly when we can be there.' },
    { q: 'Will a cracked windshield fail a DOT inspection?', a: 'It can. Federal standards restrict damage in the driver’s primary viewing area, and an inspector has discretion to place the vehicle out of service over it. Damage outside that zone is judged on size and whether it intrudes on the swept area. We are glass fitters rather than compliance officers, so treat this as a reason to get it looked at rather than as a legal opinion.' },
    { q: 'Do you service owner-operators as well as fleets?', a: 'Absolutely. A single truck gets the same technicians and the same glass as a hundred-unit carrier. Fleet accounts exist for the billing and scheduling side, not because we prioritise big customers over small ones.' },
    { q: 'Can you work at a truck stop or on the road?', a: 'Often, yes, provided the tractor is parked safely on level ground with room to work. We will not fit glass on a live shoulder — it is not safe for our technicians or for you. If you are stuck somewhere unsuitable, call and we will work out the nearest sensible place to meet.' },
  ],
},

{
  slug: 'mobile-auto-glass',
  service: 'Windshield replacement',
  title: 'Mobile Auto Glass Denver | We Come To You | FleetFix Glass',
  desc: 'Mobile auto glass service across Denver and Colorado’s Front Range. We replace and repair glass at your home, office, job site or fleet yard at no extra charge.',
  ogTitle: 'Mobile Auto Glass Service — Denver & the Front Range',
  eyebrow: 'Mobile · No extra charge in our service area',
  h1: 'Mobile auto glass service across Denver and the Front Range',
  sub: 'Every job we do is a mobile job. The van carries the glass, the adhesive, the tools and its own power — so the vehicle never has to leave your driveway, your yard or your site.',
  heroPoints: [
    'No travel charge anywhere inside our normal service area',
    'Home, office car park, construction site or fleet yard — all routine',
    'No power outlet needed; the van runs everything it brings',
  ],
  servicesHeading: 'What we can do on site',
  areasHeading: 'Where we come to you',
  ctaHeading: 'Book a mobile visit',
  body: `
<h2>Mobile is the default, not the upgrade</h2>
<p>Plenty of glass companies offer mobile service as a paid extra on top of a shop-based business. We built the other way round: the vans are the operation, and they are stocked and equipped on that basis. There is no travel surcharge inside our service area because there is no shop appointment to compare it against.</p>
<p>Practically, that means you do not lose half a day. The windshield gets replaced while your van is parked at the job, while your car sits outside your office, or while the tractor waits at the terminal between loads.</p>

<h2>Where we work</h2>
<p>Residential driveways and street parking, apartment and condominium car parks, office and business park lots, construction sites, fleet yards and depots, truck terminals and drop yards, dealership and rental lots, agricultural yards and equipment pads. If a vehicle can be parked there safely and legally, we can usually work on it there.</p>
<p>The exceptions are worth being direct about. We will not work on a live traffic shoulder or in a lane, because it is not safe for anyone. Tight underground car parks with low clearance can be a problem for setting large glass. And we cannot fit on a steep slope — the vehicle needs to be reasonably level for the glass to seat correctly while the adhesive sets.</p>

<h2>What we need from you</h2>
<ul>
<li><b>Level ground</b> and roughly a car's width of clear space around the front of the vehicle.</li>
<li><b>Access to the keys</b>, or someone who can move the vehicle if it needs repositioning.</li>
<li><b>Nothing else.</b> No power outlet, no water, no cover, no bay. The van carries its own generator, vacuum, adhesive warmer and lighting.</li>
</ul>
<p>You do not need to be present for the whole appointment on most jobs, provided we can access the vehicle and reach you by phone. Plenty of our residential work happens while people are indoors working.</p>

<h2>Weather, and being straight about it</h2>
<p>Urethane adhesive cures within a temperature and humidity range, and Colorado spends a good part of the year outside the comfortable end of it. We carry cold-weather-rated adhesive and portable shelter, and the great majority of winter appointments go ahead exactly as booked.</p>
<p>What we will not do is fit glass in conditions where the bond cannot form properly — heavy driving snow, rain onto an open pinch weld, or temperatures below what the product is rated for. In that situation we will tell you on the day and rebook rather than hand back a vehicle with a windshield that is not structurally bonded. It is inconvenient once; the alternative is a safety problem you cannot see.</p>

<div class="callout">
<p><b>Plan for the cure, not just the fitting.</b> The appointment is 45 to 90 minutes depending on the vehicle, but the windshield is not at full strength the moment the technician steps back. Ask for your safe drive-away time and build it into the day — particularly in winter, when it is longer.</p>
</div>

<h2>Multiple vehicles in one visit</h2>
<p>The economics of mobile work strongly favour doing several vehicles at once, which is why fleet service days exist. If you have more than a couple of units needing glass, grouping them into one visit is cheaper for you and more efficient for us — and we will price it accordingly.</p>
`,
  faq: [
    { q: 'Is mobile service really free?', a: 'Inside our normal service area, yes — there is no separate travel or call-out charge, and the price we quote for the glass is the price you pay. Outside that area we will quote the trip honestly rather than hiding it, or tell you if someone closer to you makes better sense.' },
    { q: 'Do I need to be there the whole time?', a: 'Usually not. As long as the technician can access the vehicle and reach you by phone, you can carry on with your day. We will call before arriving and again when the job is finished, and the invoice and safe drive-away time come through the same way.' },
    { q: 'Can you work in an apartment or underground car park?', a: 'Surface car parks are no problem at all. Underground and multi-storey car parks depend on clearance and ventilation — there is often not enough headroom to manoeuvre a large windshield safely. Tell us the situation when you book and we will either confirm it works or suggest moving the vehicle to street level for the appointment.' },
    { q: 'What happens if the weather turns on the day?', a: 'We call you. If the conditions will stop the adhesive curing properly we rebook rather than fitting anyway — a windshield that has not bonded correctly is a structural problem, not a cosmetic one. For chip repairs the bar is lower, since those cure under UV light and are far less weather-sensitive.' },
    { q: 'How far do you travel?', a: 'Greeley in the north to Castle Rock in the south, and across the metro from Golden through to Aurora — plus everything between, including Boulder, Longmont, Parker, Broomfield, Thornton, Arvada, Westminster, Lakewood, Littleton, Centennial and Commerce City. If you are not sure whether you are in range, call and ask.' },
  ],
},

/* ======================================================================= */
/* CITIES                                                                  */
/* ======================================================================= */
{
  slug: 'denver',
  city: 'Denver',
  service: 'Windshield replacement',
  title: 'Denver Windshield Replacement & Fleet Auto Glass | FleetFix',
  desc: 'Mobile windshield replacement and auto glass repair across the Denver metro. Based on Sheridan Boulevard, serving fleets, trades and drivers. Free quote.',
  ogTitle: 'Denver Windshield Replacement & Fleet Auto Glass',
  eyebrow: 'Denver metro · Our home base',
  h1: 'Denver windshield replacement and fleet auto glass',
  sub: 'We are based at 1440 Sheridan Boulevard and work right across the metro — from the warehouse belt out toward DIA to the office parks in the Tech Center and every driveway in between.',
  heroPoints: [
    'Metro-wide mobile service, from Golden across to Aurora',
    'Same-day chip repairs where the schedule allows',
    'Fleet service days at yards across the Denver metro',
  ],
  servicesHeading: 'Glass services across Denver',
  areasHeading: 'Beyond Denver',
  ctaHeading: 'Get a Denver quote',
  body: `
<h2>Auto glass across the Denver metro</h2>
<p>Our premises sit at 1440 Sheridan Boulevard, on the boundary between Denver and Lakewood — though the building is mostly where glass is stored and vans are loaded. The actual work happens wherever your vehicle already is: a loading dock in RiNo, a car park in the Tech Center, a driveway in Park Hill, a contractor's yard off Sixth Avenue.</p>
<p>Being metro-based means short drives, which is why Denver postcodes tend to get the tightest arrival windows and the best odds on a same-day chip repair.</p>

<h2>Why Denver eats windshields</h2>
<h3>The Valley Highway</h3>
<p>I-25 through the middle of the city carries a punishing volume of aggregate and construction traffic, and the section between Sixth Avenue and Alameda has been in some state of roadworks for years. Temporary concrete barriers narrow the shoulders, loose material collects along them, and passing traffic flings it. Following a loaded dump truck through there is one of the more reliable ways to acquire a chip in this city.</p>

<h3>I-70 and the mountain corridor</h3>
<p>Every load of gravel and aggregate coming down from the high country moves through the metro, and trucks shed material at highway speed. Damage picked up on the westbound climb tends to arrive as a star break rather than a tidy bullseye, because the closing speed is higher.</p>

<h3>Winter chemistry</h3>
<p>From October onwards the city's arterials get sand and magnesium chloride. Sand abrades and pits the glass surface over a season. Mag chloride is worse for anyone already carrying a chip — the solution wicks into the break, freezes overnight and levers it open. It is the single most common reason a Denver chip noticed on Tuesday is a twelve-inch crack by Thursday.</p>

<h3>Hail</h3>
<p>The metro sits inside the Front Range hail belt, and the storms that come off the foothills on summer afternoons are capable of producing stones large enough to break laminated glass outright. Hail seasons here produce genuine surges in glass demand, and after a significant storm the constraint becomes glass availability rather than fitting capacity.</p>

<h2>Commercial work in Denver</h2>
<p>Most of our metro volume is commercial. There is the warehouse and distribution corridor running east along I-70 toward the airport, the trades operating out of yards in Globeville and Commerce City, the service vans working out of the Tech Center and the Interlocken side, and the contractor fleets following the residential build-out on the metro's edges.</p>
<p>What those operators have in common is that they cannot spare vehicles for shop appointments. So we run yard-side service days — a technician arrives with glass sourced against each unit's VIN, and works through the list while the vehicles that are out on jobs come back in their own time.</p>

<div class="callout">
<p><b>Parking in Denver is the practical constraint.</b> Downtown, LoDo and Cherry Creek jobs need a spot where we can work across the front of the vehicle for the best part of an hour. Street parking is usually workable outside peak hours; a surface car park is easier. Tell us where the vehicle will be and we will tell you honestly whether it works.</p>
</div>
`,
  faq: [
    { q: 'Which parts of the Denver metro do you cover?', a: 'All of it. Central Denver, the northeast out toward the airport, Park Hill, Stapleton, Green Valley Ranch, the Highlands, Washington Park and Cherry Creek, plus Lakewood, Wheat Ridge, Golden, Arvada, Westminster, Thornton, Commerce City, Aurora, Glendale, Englewood, Littleton and Centennial. There is no travel charge anywhere inside that.' },
    { q: 'Can you come downtown?', a: 'Yes, and we do constantly. The only real question is parking — the technician needs space across the front of the vehicle for roughly an hour. Surface lots and garage spaces with headroom are ideal, street parking works outside the busiest hours, and a loading dock is perfect if you have access to one.' },
    { q: 'How quickly can someone get to me in Denver?', a: 'Being metro-based, Denver postcodes usually get the shortest lead times we offer. Chip repairs can often be fitted in same-day when the schedule allows. Replacements depend mainly on glass availability for your specific vehicle rather than on our capacity — give us the VIN and we can tell you the same day.' },
    { q: 'Do you handle hail damage claims?', a: 'Yes, and we bill the carrier directly. Worth knowing: after a major hail event across the metro, demand for glass spikes hard and specific windshields can go on backorder nationally. Reporting the claim and getting the vehicle booked early makes a real difference to how long you wait.' },
    { q: 'Is your Sheridan Boulevard location a drop-in shop?', a: 'It is primarily our base for stock and vans rather than a walk-in retail counter, and essentially all of our work is done mobile. Call before coming by — in almost every case it is faster and easier for us to come to you instead.' },
  ],
},

{
  slug: 'boulder',
  city: 'Boulder',
  service: 'Windshield replacement',
  title: 'Boulder Windshield Replacement | Mobile Auto Glass CO',
  desc: 'Mobile windshield replacement and chip repair across Boulder and Boulder County — campus fleets, canyon commuters and downtown delivery vans. Free quote.',
  ogTitle: 'Boulder Windshield Replacement — Mobile Auto Glass',
  eyebrow: 'Boulder County · Mobile service',
  h1: 'Boulder windshield replacement, wherever you park it',
  sub: 'Mobile glass for Boulder County — campus and research park fleets, canyon commuters, downtown delivery vans and everyone dealing with what the Diagonal throws up.',
  heroPoints: [
    'Gunbarrel and research park fleets serviced on site',
    'Canyon-road chip damage repaired before the freeze spreads it',
    'Downtown and Hill appointments planned around loading access',
  ],
  servicesHeading: 'Glass services in Boulder',
  areasHeading: 'Beyond Boulder',
  ctaHeading: 'Get a Boulder quote',
  body: `
<h2>Glass work in Boulder County</h2>
<p>Boulder generates a distinctive mix of glass work. There are the institutional fleets — university vehicles, research park vans out at Gunbarrel, lab couriers moving samples between buildings. There are the trades and delivery operators threading vans through downtown alleys. And there are several thousand people who drive a canyon road twice a day and pay for it in windshield damage.</p>

<h2>Three roads that account for most of it</h2>
<h3>The Diagonal</h3>
<p>CO-119 between Boulder and Longmont carries dense commuter traffic at speed on a surface that has been patched, milled and resurfaced repeatedly. Loose chip from the patching sits in the wheel tracks and gets thrown by everything that passes. It is comfortably the most common single origin story we hear from Boulder customers.</p>

<h3>Boulder Canyon</h3>
<p>Canyon Boulevard turning into CO-119 heading up toward Nederland is a different mechanism entirely. Here the material comes off the canyon walls rather than the road surface — rockfall and scree accumulate on the narrow shoulders and get redistributed by traffic. The tight lanes mean you often pass oncoming vehicles at close quarters with no room to move over, and the damage tends to be higher-energy than a straightforward highway chip.</p>

<h3>US-36 and Foothills</h3>
<p>The turnpike down to Denver and Foothills Parkway both run high-speed commuter volume. Nothing exotic about the mechanism — just a lot of vehicles at 65 miles an hour and the arithmetic of how often something gets kicked up.</p>

<h2>Wind, which nobody expects</h2>
<p>Boulder's downslope windstorms are a genuine local hazard and a real cause of glass damage. When conditions line up over the Front Range, gusts coming off the foothills routinely reach speeds that lift gravel, strip branches and send construction material across car parks. Damage from a windstorm frequently shows up as multiple small impacts across a windshield rather than one clean chip — and a cluster of breaks in one area is often past the point where repair is sensible.</p>

<h2>Altitude and ultraviolet</h2>
<p>At around 5,400 feet Boulder gets meaningfully more ultraviolet exposure than a sea-level city. That does not break glass on its own, but it does accelerate the ageing of the polyvinyl butyral interlayer bonding a laminated windshield and it degrades the resin in an older repair. A chip filled several years ago on a vehicle that lives outdoors here is worth a look, particularly if the repair has started to yellow or lift.</p>

<div class="callout">
<p><b>Access is the thing to plan in Boulder.</b> Downtown and the Hill mean narrow alleys, permit parking and loading windows. Give us a rough idea of where the vehicle sits and when it is reachable, and we will schedule around the restriction rather than arriving into one.</p>
</div>

<h2>Where we work in the county</h2>
<p>Boulder proper including downtown, the Hill, Table Mesa, North Boulder and Gunbarrel, plus Louisville, Lafayette, Superior, Erie, Niwot and Longmont. We will go up the canyons to Nederland, Jamestown and Ward, though for those we ask for a bit more scheduling flexibility — the drive is slow and the weather changes the plan more often than it does on the flat.</p>
`,
  faq: [
    { q: 'Do you service the university and research park fleets?', a: 'Yes. Institutional and research fleets are a good fit for our account structure, which handles purchase-order invoicing and per-unit service records — usually a requirement rather than a nicety for organisations with procurement processes. We will run a service day on site and work through the vehicles in one visit.' },
    { q: 'Can you come up the canyon?', a: 'Yes, to Nederland, Jamestown, Ward and the surrounding communities. We just ask for a little more flexibility on timing, because the drive is slow and canyon weather changes plans more readily than it does down on the flat. Winter appointments up there occasionally get moved a day.' },
    { q: 'I have several small chips from a windstorm. Can they all be filled?', a: 'Sometimes, but it depends on how tightly clustered they are. Individually separated breaks across a windshield are usually all repairable. A cluster in one area often is not, because the glass in that zone has already lost too much integrity for the repairs to hold. We will look and tell you honestly which way it falls.' },
    { q: 'Does high-altitude sun really affect a windshield?', a: 'Not by breaking it, but by ageing it. Extra ultraviolet exposure degrades the plastic interlayer bonding a laminated windshield over time and it breaks down the resin in older repairs. If you have a repair from several years ago on a vehicle that lives outside, and it has started to yellow or lift at the edges, it is worth a look.' },
    { q: 'Do you cover Louisville, Lafayette and Erie?', a: 'Yes — all of them, along with Superior, Niwot and Longmont, at no extra charge. Those communities sit comfortably inside our normal service area and often get shorter lead times than Boulder itself, because access and parking are simpler.' },
  ],
},

{
  slug: 'greeley',
  city: 'Greeley',
  service: 'Windshield replacement',
  title: 'Greeley Windshield Replacement | Ag, Oilfield & Truck Glass',
  desc: 'Mobile windshield replacement in Greeley and Weld County — agricultural equipment, oilfield pickups, trucking fleets and daily drivers. We come to you.',
  ogTitle: 'Greeley Windshield Replacement — Ag, Oilfield & Fleet Glass',
  eyebrow: 'Weld County · Ag, oilfield & freight',
  h1: 'Greeley windshield replacement for fleets, farms and trucks',
  sub: 'Mobile glass across Weld County — tractor and combine cabs, oilfield pickups running lease roads, freight on US-85, and every commuter windshield the gravel finds.',
  heroPoints: [
    'Cab glass for tractors, combines, sprayers and telehandlers',
    'On-site service at lease roads, feedlots and equipment yards',
    'Hail claims billed direct to your carrier',
  ],
  servicesHeading: 'Glass services in Greeley',
  areasHeading: 'Beyond Greeley',
  ctaHeading: 'Get a Greeley quote',
  body: `
<h2>Weld County is unusually hard on glass</h2>
<p>Greeley produces more windshield damage per vehicle than almost anywhere else we work, and it is not one cause but four stacking on top of each other: heavy freight, energy traffic, an enormous unpaved road network, and some of the most severe hail in the country.</p>

<h2>The freight corridors</h2>
<p>US-85 through Greeley and US-34 running east-west carry a heavy mix of agricultural haulage, energy service vehicles and regional freight. These are high-speed roads with a lot of loaded trucks, and loaded trucks shed material. During harvest the pattern intensifies sharply — grain, sugar beet and silage haulage runs at volume, and the trailers throw crop debris and road material for weeks at a time.</p>

<h2>Gravel, and a lot of it</h2>
<p>Weld County maintains a vast grid of unpaved county roads, and a large share of the working traffic here spends part of every day on them. Gravel road damage behaves differently from highway damage: the impacts are lower-speed but far more frequent, and they cluster low on the windshield where the tyre spray reaches. Vehicles that live on lease roads often accumulate a scatter of small pits over a season rather than taking one dramatic hit, and that pitting eventually causes enough glare at low sun angles to warrant replacement in its own right.</p>

<h2>Energy sector vehicles</h2>
<p>Weld County's oil and gas activity puts a lot of pickups, water haulers, vacuum trucks and service rigs on rough access roads all day. Those units run hard, they are expensive to have standing idle, and their drivers rarely have a spare afternoon for a shop appointment. Site-based service is the only thing that works, so that is what we do — pad, yard or wherever the unit is parked between jobs.</p>

<h2>Agricultural equipment glass</h2>
<p>Tractor, combine, sprayer and telehandler cabs are a specialism of their own. The glass is frequently curved, sometimes tinted, often bonded in ways that differ significantly from automotive practice, and it is almost always sourced against the machine's serial number rather than a VIN. Lead times run longer than automotive glass as a result.</p>
<p>The practical implication: if a cab window breaks in the middle of harvest you want it reported immediately rather than at the end of the week, because the sourcing is the long pole. Send us the make, model and serial plate and we will start chasing the part the same day.</p>

<div class="callout">
<p><b>Hail is the big one here.</b> Weld County sits in one of the most hail-exposed areas in the United States, and severe storms regularly damage vehicles and equipment across wide areas in a single afternoon. After an event, glass supply becomes the bottleneck nationally — reporting the claim quickly and getting into the queue early is genuinely worth doing.</p>
</div>

<h2>Where we cover</h2>
<p>Greeley and the surrounding Weld County communities — Evans, Garden City, LaSalle, Gilcrest, Platteville, Kersey, Eaton, Ault, Pierce, Windsor, Severance, Johnstown and Milliken. Farm and feedlot addresses are routine for us; if the location is easier to describe by county road than by street address, that is completely fine.</p>
`,
  faq: [
    { q: 'Do you replace glass on tractors and combines?', a: 'Yes — cab glass on tractors, combines, sprayers, telehandlers and loaders. It is sourced against the machine’s serial number rather than a VIN, and lead times are longer than automotive glass. Send us the make, model and serial plate as early as you can and we will start chasing the part immediately.' },
    { q: 'Can you come out to a lease road or a field?', a: 'Yes, and we do it regularly. What we need is the machine or vehicle on reasonably level ground with room to work at the front, and directions that actually get us there — county road references are perfectly fine. We carry our own power, so there is no requirement for a supply on site.' },
    { q: 'My windshield is pitted rather than cracked. Is that fixable?', a: 'Pitting cannot be repaired — resin fills a discrete break, not thousands of tiny surface impacts. Once pitting scatters enough light to cause real glare at sunrise and sunset, replacement is the only fix. It is one of the most common reasons gravel-road vehicles in Weld County need glass without ever having taken a single serious hit.' },
    { q: 'How fast can you handle hail damage across a fleet?', a: 'We will come out and assess every unit, repair what is repairable on the spot, and quote the replacements as one job. The honest constraint after a widespread storm is glass supply rather than our capacity — specific windshields can go on national backorder for weeks. Getting the claim reported and the units in the queue early is what shortens the wait.' },
    { q: 'Do you cover Windsor, Eaton and the smaller towns?', a: 'Yes — Evans, Garden City, LaSalle, Gilcrest, Platteville, Kersey, Eaton, Ault, Pierce, Windsor, Severance, Johnstown and Milliken are all inside our normal service area with no travel charge. Farm and feedlot addresses included.' },
  ],
},

{
  slug: 'castle-rock',
  city: 'Castle Rock',
  service: 'Windshield replacement',
  title: 'Castle Rock Windshield Replacement | Mobile Auto Glass CO',
  desc: 'Mobile windshield replacement and chip repair in Castle Rock and Douglas County — I-25 Gap commuters, construction fleets and Palmer Divide weather damage.',
  ogTitle: 'Castle Rock Windshield Replacement — Mobile Auto Glass',
  eyebrow: 'Douglas County · The I-25 Gap',
  h1: 'Castle Rock windshield replacement, done at your door',
  sub: 'Mobile glass for Castle Rock and Douglas County — commuters running the Gap, construction fleets working the new subdivisions, and everything the Palmer Divide throws down.',
  heroPoints: [
    'Gap commuter chip damage caught before the overnight freeze spreads it',
    'Construction and site fleets serviced at the development',
    'Southernmost point of our corridor — no travel charge',
  ],
  servicesHeading: 'Glass services in Castle Rock',
  areasHeading: 'Beyond Castle Rock',
  ctaHeading: 'Get a Castle Rock quote',
  body: `
<h2>The Gap does most of the damage</h2>
<p>If you live in Castle Rock and commute, you know the stretch of I-25 running south toward Monument as the Gap. It has been through years of major widening work, and the legacy of that is a corridor where concrete barriers sit close to the running lanes, shoulders are narrow and frequently gravelled, and there is nowhere for loose material to go except back under the traffic.</p>
<p>The combination is close to ideal for windshield damage: high speeds, minimal lateral separation between vehicles, and a steady supply of aggregate in the wheel tracks. It is the single most common source of the chips we fill in this town.</p>

<h2>Sitting on the Palmer Divide</h2>
<p>Castle Rock is at roughly 6,200 feet, up on the Palmer Divide — the ridge separating the Denver and Colorado Springs basins. That elevation has consequences for glass that catch people out when they move here from lower down the corridor.</p>
<h3>Upslope storms</h3>
<p>The Divide forces moist air upward, which is why Castle Rock gets snow when Denver gets rain and why summer afternoon storms here build fast and hit hard. Hail off these storms is often small but comes in high volume, which produces scattered impact damage across a windshield rather than a single clean break.</p>
<h3>Wind</h3>
<p>Exposed ground along the Divide sees strong and persistent wind, particularly in spring. In an area with this much active construction that means airborne grit and site debris are a routine part of the environment, not an occasional event.</p>
<h3>Temperature swing</h3>
<p>The daily temperature range at this elevation is wider than in the metro — a warm afternoon can be followed by a hard overnight freeze in the same twenty-four hours. That cycle is precisely what turns a small chip into a running crack, and it is why chips here should be dealt with quickly rather than left for a convenient week.</p>

<h2>Construction traffic</h2>
<p>Castle Rock has been building steadily for years, and areas like the Meadows and Crystal Valley generate constant dump truck, concrete and materials movement on roads that are frequently unfinished. Anyone commuting past active development, or working on it, is exposed to considerably more airborne material than the traffic volume alone would suggest.</p>
<p>We do a lot of work with contractors here for exactly that reason, servicing pickups and site vehicles at the development rather than pulling them off the job for a shop appointment.</p>

<div class="callout">
<p><b>Castle Rock is the southern end of our corridor.</b> There is no travel charge to get here, and no surcharge for Franktown, Larkspur, Sedalia or Elizabeth either. Further south than Larkspur we will be straight with you about whether the trip makes sense or whether someone in the Springs is a better call.</p>
</div>

<h2>Where we cover in Douglas County</h2>
<p>Castle Rock including the Meadows, Founders Village, Crystal Valley and the Plum Creek area, plus Castle Pines, Sedalia, Franktown, Larkspur, Parker, Lone Tree and Highlands Ranch. Job site and development addresses are routine — a lot subdivision reference or a set of coordinates works just as well as a street address if the road is not on the map yet.</p>
`,
  faq: [
    { q: 'Do you charge extra to come to Castle Rock?', a: 'No. Castle Rock is the southern end of our normal service corridor and there is no travel charge, and the same goes for Castle Pines, Sedalia, Franktown, Larkspur and Elizabeth. Beyond Larkspur toward Monument we will tell you honestly whether the trip makes sense or whether a Colorado Springs company is the better call.' },
    { q: 'Can you come to a construction site or a new development?', a: 'Yes, and it is a good part of what we do here. We need the vehicle on level ground with clear space at the front, and directions that work — a lot number or a pin dropped on a map is completely fine when the road does not exist on the map yet.' },
    { q: 'I picked up a chip on the Gap. How urgent is it?', a: 'More urgent than at lower elevation. The daily temperature swing on the Palmer Divide is wide, and the freeze-thaw cycle is what drives a chip into a crack. A break that would sit stable for weeks in Denver can run overnight up here. If you can get it looked at within a few days, do.' },
    { q: 'Do you cover Parker and Highlands Ranch too?', a: 'Yes, both, along with Lone Tree and Castle Pines — all inside the normal service area with no travel charge. They are generally easier to schedule than Castle Rock itself because they are closer to the metro and closer to our vans.' },
    { q: 'What about small hail damage across the whole windshield?', a: 'Scattered small impacts are the classic Palmer Divide pattern, and they are harder to deal with than one clean break. If the impacts are well separated we can often fill them individually. If they are dense or clustered the glass has lost too much integrity and replacement is the honest answer. We will look before quoting either way.' },
  ],
},

/* ======================================================================= */
/* LEGAL — rendered from standalone templates, listed here for the nav      */
/* ======================================================================= */
{ slug: 'privacy',             legal: 'legal-privacy.html', title: 'Privacy Policy | FleetFix Glass', desc: 'How FleetFix Glass collects, uses and protects information submitted through our quote form, including advertising click identifiers and call tracking.', ogTitle: 'Privacy Policy — FleetFix Glass', nav: 'Privacy Policy' },
{ slug: 'terms-and-conditions', legal: 'legal-terms.html',  title: 'Terms & Conditions | FleetFix Glass', desc: 'Terms and conditions governing use of the FleetFix Glass quote site, quotes, workmanship warranty, insurance billing and scheduling.', ogTitle: 'Terms & Conditions — FleetFix Glass', nav: 'Terms' },

]};
