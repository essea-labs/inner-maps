#!/usr/bin/env node
/**
 * export-carousel.js
 *
 * Renders HTML carousel slides as individual PNGs for TikTok and Instagram.
 *
 * Usage:
 *   node export-carousel.js <html-file> <output-name> [--tiktok] [--instagram] [--both]
 *
 * Examples:
 *   node export-carousel.js tiktok/no-worries-carousel.html 2026-03-27_no-worries --both
 *   node export-carousel.js tiktok/no-worries-carousel.html 2026-03-27_no-worries --tiktok
 *   node export-carousel.js tiktok/no-worries-carousel.html 2026-03-27_no-worries --instagram
 *
 * Output:
 *   marketing/content/<name>/tiktok/slide-1.png ... (1080x1920)
 *   marketing/content/<name>/instagram/slide-1.png ... (1080x1350)
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const FORMATS = {
  tiktok:    { width: 1080, height: 1920, label: 'TikTok (9:16)' },
  instagram: { width: 1080, height: 1350, label: 'Instagram (4:5)' },
};

async function exportSlides(htmlPath, outputDir, format) {
  const { width, height, label } = FORMATS[format];
  const formatDir = path.join(outputDir, format);
  if (!fs.existsSync(formatDir)) fs.mkdirSync(formatDir, { recursive: true });

  console.log(`\n📐 ${label} — ${width}x${height}`);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 1 });

  // Load once to count slides
  await page.goto(`file://${htmlPath}?slide=1`, { waitUntil: 'networkidle0', timeout: 30000 });
  await page.evaluate(() => document.fonts.ready);

  const slideCount = await page.evaluate(() => document.querySelectorAll('.slide').length);
  console.log(`   Found ${slideCount} slides`);

  for (let i = 1; i <= slideCount; i++) {
    await page.goto(`file://${htmlPath}?slide=${i}`, { waitUntil: 'networkidle0', timeout: 30000 });
    await page.evaluate(() => document.fonts.ready);

    // For Instagram (shorter), inject compact overrides
    if (format === 'instagram') {
      await page.addStyleTag({ content: `
        .imsg-contact { padding: 0 0 0.5vh !important; }
        .imsg-avatar { width: 10vw !important; height: 10vw !important; font-size: 4vw !important; margin-bottom: 0.2vh !important; }
        .imsg-name { font-size: 2.6vw !important; }
        .imsg-body { padding: 0.4vh 3.5vw !important; gap: 0.3vh !important; }
        .bubble { padding: 1vh 3.2vw !important; font-size: 3.2vw !important; }
        .b-time { font-size: 2.2vw !important; padding: 0.3vh 0 0.1vh !important; }
        .b-meta { font-size: 2vw !important; }
        .drafts-label { font-size: 1.8vw !important; margin-top: 0.3vh !important; }
        .draft-b { padding: 0.8vh 3.2vw !important; font-size: 2.7vw !important; }
        .drafts-area { gap: 0.2vh !important; }
        .imsg-bar { padding: 0.6vh 3vw 2vh !important; }
        .imsg-plus, .imsg-send { width: 6vw !important; height: 6vw !important; font-size: 3.5vw !important; }
        .imsg-field { height: 6vw !important; font-size: 2.8vw !important; }
        .status-bar { height: 4vh !important; padding: 0.8vh 5vw 0 !important; }
        .status-time { font-size: 3.2vw !important; }
        .imsg-nav { padding: 0.3vh 4vw 0.4vh !important; }
        .notes-title { font-size: 5.5vw !important; }
        .notes-line, .notes-struck { font-size: 3.5vw !important; line-height: 1.55 !important; }
        .notes-date { font-size: 2.4vw !important; margin-bottom: 1.5vh !important; }
        .notes-body { padding: 1.5vh 5vw !important; }
        .notif { padding: 1vh 2.5vw !important; }
        .notif-icon { width: 7vw !important; height: 7vw !important; }
        .notif-text { font-size: 2.4vw !important; }
        .notif-sub { font-size: 2vw !important; }
        .hook-text { font-size: 7vw !important; }
        .hook-emoji { font-size: 10vw !important; margin-bottom: 2vh !important; }
        .cta-h { font-size: 8vw !important; }
      `});
    }

    await new Promise(r => setTimeout(r, 600));

    const filename = `slide-${i}.png`;
    const filepath = path.join(formatDir, filename);

    await page.screenshot({
      path: filepath,
      type: 'png',
      clip: { x: 0, y: 0, width, height },
    });

    console.log(`   ✓ ${filename}`);
  }

  await browser.close();
  return slideCount;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log('Usage: node export-carousel.js <html-file> <output-name> [--tiktok] [--instagram] [--both]');
    console.log('Default: --both');
    process.exit(0);
  }

  const htmlFile = path.resolve(args[0]);
  const outputName = args[1];
  const flags = args.slice(2).map(f => f.replace('--', ''));

  if (!fs.existsSync(htmlFile)) {
    console.error(`❌ File not found: ${htmlFile}`);
    process.exit(1);
  }

  // Determine formats
  let formats = [];
  if (flags.includes('both') || flags.length === 0) {
    formats = ['tiktok', 'instagram'];
  } else {
    if (flags.includes('tiktok')) formats.push('tiktok');
    if (flags.includes('instagram')) formats.push('instagram');
  }

  const contentDir = path.join(__dirname, 'content');
  const outputDir = path.join(contentDir, outputName);
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  console.log(`🎨 Exporting: ${path.basename(htmlFile)}`);
  console.log(`📁 Output:    ${outputDir}`);

  let totalSlides = 0;
  for (const format of formats) {
    totalSlides = await exportSlides(htmlFile, outputDir, format);
  }

  console.log(`\n✅ Done! ${totalSlides} slides × ${formats.length} format(s) = ${totalSlides * formats.length} PNGs`);
  console.log(`📁 ${outputDir}`);
  formats.forEach(f => {
    console.log(`   └─ ${f}/ (${FORMATS[f].width}x${FORMATS[f].height})`);
  });
}

main().catch(err => {
  console.error('❌ Export failed:', err.message);
  process.exit(1);
});
