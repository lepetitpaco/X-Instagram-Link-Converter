// Rend l'icône de l'extension et les visuels des stores avec Chromium (Playwright).
// Lancer via store/render.sh (Docker), depuis n'importe où.
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const STORE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.dirname(STORE);
const url = file => 'file://' + path.join(ROOT, file);
fs.mkdirSync(path.join(STORE, 'build'), { recursive: true });
fs.mkdirSync(path.join(STORE, 'screenshots'), { recursive: true });

const browser = await chromium.launch();

// Icônes du manifest, fond transparent
for (const size of [16, 32, 48, 128]) {
  const page = await browser.newPage({ viewport: { width: size, height: size } });
  const svg = fs.readFileSync(path.join(STORE, 'icon.svg'), 'utf8').replace('<svg ', `<svg width="${size}" height="${size}" `);
  await page.setContent(`<style>html,body{margin:0;background:transparent}svg{display:block}</style>${svg}`);
  await page.screenshot({ path: path.join(ROOT, `icons/icon${size}.png`), omitBackground: true });
  await page.close();
}

// Popup réel de l'extension, avec une API navigateur simulée
const popup = await browser.newPage({ viewport: { width: 344, height: 600 }, deviceScaleFactor: 2 });
await popup.addInitScript(() => {
  const area = (data) => ({
    get(keys, cb) {
      const list = typeof keys === 'string' ? [keys] : Array.isArray(keys) ? keys : Object.keys(data);
      const out = {};
      list.forEach(k => { if (k in data) out[k] = data[k]; });
      setTimeout(() => cb(out));
    },
    set(items, cb) { Object.assign(data, items); cb && setTimeout(cb); }
  });
  const now = Date.now();
  window.chrome = {
    runtime: { getManifest: () => ({ version: '1.2.1' }), sendMessage() {} },
    storage: {
      local: area({
        conversionStats: { total: 342, today: 7, byPlatform: { x: 198, instagram: 61, tiktok: 83 } },
        conversionHistory: [
          { originalUrl: 'https://www.tiktok.com/@dance.lab/video/7429813706419522847', convertedUrl: 'https://tnktok.com/@dance.lab/video/7429813706419522847', domain: 'tnktok.com', platform: 'tiktok', timestamp: now - 60e3 },
          { originalUrl: 'https://x.com/alexr/status/1849204417726103', convertedUrl: 'https://fixvx.com/alexr/status/1849204417726103', domain: 'fixvx.com', platform: 'x', timestamp: now - 600e3 }
        ]
      }),
      sync: area({}),
      onChanged: { addListener() {} }
    },
    tabs: {
      query: (q, cb) => cb([{ id: 1, url: 'https://x.com/alexr/status/1849204417726103' }]),
      sendMessage: (id, m, cb) => cb && cb(null)
    }
  };
});
await popup.goto(url('popup.html'));
await popup.waitForTimeout(400);
const clip = await popup.evaluate(() => {
  document.body.style.maxHeight = 'none';
  // Éditeur X ouvert pour montrer les services, historique masqué pour tenir dans la capture
  document.querySelector('.services-platform').open = true;
  document.querySelector('.history-section').style.display = 'none';
  document.querySelector('.history-section').previousElementSibling.style.display = 'none';
  const top = document.querySelector('.settings-section').getBoundingClientRect().top - 12;
  // Jusqu'à la fin de l'éditeur des services, sans le changelog
  const bottom = document.getElementById('changelog').getBoundingClientRect().top - 2;
  return { x: 0, y: top, width: document.documentElement.scrollWidth, height: bottom - top };
});
await popup.screenshot({ path: path.join(STORE, 'build/popup.png'), clip, fullPage: true });
await popup.close();

// Scènes des stores
const scenes = [
  ['hero', 1280, 800, 'screenshots/1-share-links-that-embed.png'],
  ['x', 1280, 800, 'screenshots/2-x-twitter.png'],
  ['tiktok', 1280, 800, 'screenshots/3-tiktok.png'],
  ['instagram', 1280, 800, 'screenshots/4-instagram.png'],
  ['popup', 1280, 800, 'screenshots/5-custom-services.png'],
  ['promo', 440, 280, 'promo-small-440x280.png'],
  ['marquee', 1400, 560, 'promo-marquee-1400x560.png']
];
for (const [scene, width, height, out] of scenes) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto(url('store/scenes.html') + '#' + scene);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(STORE, out) });
  await page.close();
}

await browser.close();
console.log('rendered');
