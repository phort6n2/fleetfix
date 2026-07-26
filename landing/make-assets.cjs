#!/usr/bin/env node
/**
 * Generates the derived image + favicon set from the three source assets in
 * landing/img/src. Run manually when a source asset changes:
 *
 *   node landing/make-assets.cjs
 *
 * Output lands in landing/img/ and is committed, so the site build itself
 * stays a pure copy step with no image processing on the critical path.
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SRC = path.join(__dirname, 'img', 'src');
const OUT = path.join(__dirname, 'img');

const NAVY = '#12294b';
const BLUE = '#2f7ec4';

/* The shield mark is far too detailed to read at 16px, so the favicon is a
   derived monogram instead — legible on both light and dark browser chrome. */
const monogram = (size) => Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64">
     <rect width="64" height="64" rx="13" fill="${NAVY}"/>
     <rect x="3" y="3" width="58" height="58" rx="10.5" fill="none" stroke="${BLUE}" stroke-width="2.5"/>
     <text x="32" y="43.5" text-anchor="middle" font-family="Helvetica,Arial,sans-serif"
           font-size="30" font-weight="700" letter-spacing="-1.5" fill="#ffffff">FF</text>
   </svg>`
);

/* Minimal ICO writer: packs PNG-encoded frames into an .ico container. */
function buildIco(frames) {
  const count = frames.length;
  const header = Buffer.alloc(6 + count * 16);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(count, 4);
  let offset = header.length;
  frames.forEach((f, i) => {
    const e = 6 + i * 16;
    header.writeUInt8(f.size >= 256 ? 0 : f.size, e);
    header.writeUInt8(f.size >= 256 ? 0 : f.size, e + 1);
    header.writeUInt8(0, e + 2);
    header.writeUInt8(0, e + 3);
    header.writeUInt16LE(1, e + 4);
    header.writeUInt16LE(32, e + 6);
    header.writeUInt32LE(f.data.length, e + 8);
    header.writeUInt32LE(offset, e + 12);
    offset += f.data.length;
  });
  return Buffer.concat([header, ...frames.map((f) => f.data)]);
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });

  // ---- Header logo: trim the transparent margin so it optically centres ----
  await sharp(path.join(SRC, 'FF-Logo.png'))
    .trim()
    .resize({ width: 640, withoutEnlargement: true })
    .png({ compressionLevel: 9, palette: true })
    .toFile(path.join(OUT, 'fleetfix-logo.png'));

  // ---- Hero photo, responsive widths, WebP + JPEG fallback ----
  const hero = path.join(SRC, 'fleet-yard.png');
  for (const w of [560, 840, 1120]) {
    await sharp(hero).resize({ width: w })
      .webp({ quality: 76 }).toFile(path.join(OUT, `hero-${w}.webp`));
    await sharp(hero).resize({ width: w })
      .jpeg({ quality: 80, progressive: true, mozjpeg: true })
      .toFile(path.join(OUT, `hero-${w}.jpg`));
  }

  // ---- Open Graph card: shield centred on brand navy ----
  const shield = await sharp(path.join(SRC, 'Collision.png'))
    .trim().resize({ width: 460, height: 460, fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png().toBuffer();
  await sharp({
    create: { width: 1200, height: 630, channels: 4,
      background: { r: 18, g: 41, b: 75, alpha: 1 } },
  })
    .composite([{ input: shield, gravity: 'centre' }])
    .png({ compressionLevel: 9 })
    .toFile(path.join(OUT, 'og-card.png'));

  // ---- PWA + Apple icons ----
  for (const s of [192, 512]) {
    await sharp(monogram(s)).png({ compressionLevel: 9 })
      .toFile(path.join(OUT, `icon-${s}.png`));
  }
  await sharp(monogram(180)).png({ compressionLevel: 9 })
    .toFile(path.join(OUT, 'apple-touch-icon.png'));

  // ---- favicon.ico (16/32/48) ----
  const frames = [];
  for (const size of [16, 32, 48]) {
    frames.push({ size, data: await sharp(monogram(size)).png().toBuffer() });
  }
  fs.writeFileSync(path.join(OUT, 'favicon.ico'), buildIco(frames));
  await sharp(monogram(32)).png().toFile(path.join(OUT, 'favicon-32.png'));
  await sharp(monogram(16)).png().toFile(path.join(OUT, 'favicon-16.png'));

  const list = fs.readdirSync(OUT).filter((f) => !fs.statSync(path.join(OUT, f)).isDirectory());
  console.log(`Generated ${list.length} assets in landing/img:`);
  list.sort().forEach((f) => {
    console.log(`  ${f.padEnd(26)} ${(fs.statSync(path.join(OUT, f)).size / 1024).toFixed(1)} KB`);
  });
})().catch((e) => { console.error(e); process.exit(1); });
