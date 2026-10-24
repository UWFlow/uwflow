import { parseArgs } from 'node:util';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const { values } = parseArgs({ options: {
  url: { type: 'string' },
  ready: { type: 'string' },
  label: { type: 'string', default: 'after' },
  out: { type: 'string' },
  'storage-state': { type: 'string' },
  mask: { type: 'string', multiple: true, default: [] },
  'full-page': { type: 'boolean', default: false },
  help: { type: 'boolean', default: false },
} });
if (values.help) {
  console.log('node capture.mjs --url URL --ready SELECTOR [--label before|after] [--out DIR] [--mask SELECTOR] [--storage-state FILE] [--full-page]');
  process.exit(0);
}
if (!values.url || !values.ready || !/^[a-zA-Z0-9_-]+$/.test(values.label)) {
  throw new Error('Supply --url, --ready, and a label containing only letters, numbers, underscores or hyphens.');
}
const url = new URL(values.url);
if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
  throw new Error('Use an HTTP(S) URL without embedded credentials.');
}
const output = resolve(values.out ?? resolve(dirname(fileURLToPath(import.meta.url)), '../../artifacts/ui'));
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const results = [];
try {
  for (const [name, viewport] of Object.entries({ desktop: { width: 1440, height: 1000 }, phone: { width: 390, height: 844 } })) {
    const context = await browser.newContext({
      viewport, deviceScaleFactor: 1, isMobile: name === 'phone', hasTouch: name === 'phone',
      reducedMotion: 'reduce', locale: 'en-CA', timezoneId: 'America/Toronto',
      storageState: values['storage-state'],
    });
    try {
      const page = await context.newPage();
      page.setDefaultTimeout(15_000);
      const errors = [];
      page.on('pageerror', error => errors.push(error.name));
      const response = await page.goto(url.href, { waitUntil: 'domcontentloaded', timeout: 30_000 });
      if (!response?.ok()) throw new Error(`Navigation failed: HTTP ${response?.status()}`);
      await page.locator(values.ready).waitFor({ state: 'visible' });
      await page.evaluate(() => document.fonts.ready);
      const path = resolve(output, `${values.label}-${name}.png`);
      await page.screenshot({ path, fullPage: values['full-page'], animations: 'disabled',
        mask: values.mask.map(selector => page.locator(selector)) });
      const timing = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        return { domContentLoadedMs: Math.round(navigation.domContentLoadedEventEnd),
          horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth };
      });
      results.push({ viewport: name, file: path, ...timing, pageErrors: errors });
      console.log(`${name}: ${path}`);
    } finally {
      await context.close();
    }
  }
  await writeFile(resolve(output, `${values.label}.json`), JSON.stringify({
    path: url.pathname, browser: browser.version(), results,
  }, null, 2) + '\n');
  if (results.some(result => result.pageErrors.length)) throw new Error('Page errors occurred; inspect the browser before using these screenshots.');
} finally {
  await browser.close();
}
