#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const url = process.argv[2] || 'http://localhost:3333';

function findChrome() {
  const candidates = [
    process.env.CHROME_EXECUTABLE,
    path.join(process.env['PROGRAMFILES'] || 'C:\\Program Files', 'Google\\Chrome\\Application\\chrome.exe'),
    path.join(process.env['PROGRAMFILES(X86)'] || 'C:\\Program Files (x86)', 'Google\\Chrome\\Application\\chrome.exe'),
    path.join(process.env['PROGRAMFILES'] || 'C:\\Program Files', 'Microsoft\\Edge\\Application\\msedge.exe'),
    path.join(process.env.LOCALAPPDATA || '', 'Google\\Chrome\\Application\\chrome.exe')
  ].filter(Boolean);
  for (const p of candidates) {
    try { if (fs.existsSync(p)) return p; } catch (e) {}
  }
  return null;
}

(async () => {
  const chromePath = findChrome();
  const opts = { headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] };
  if (chromePath) opts.executablePath = chromePath;
  const browser = await puppeteer.launch(opts);
  const page = await browser.newPage();
  const requests = [];
  const responses = new Map();

  page.on('request', req => {
    if (req.resourceType() === 'image' || /\\.png$/.test(req.url())) {
      requests.push({ url: req.url(), type: req.resourceType(), method: req.method() });
    }
  });
  page.on('response', async resp => {
    try {
      if (resp.request().resourceType() === 'image' || /\\.png$/.test(resp.url())) {
        responses.set(resp.url(), { status: resp.status(), headers: resp.headers() });
      }
    } catch (e) {}
  });

  const consoleMessages = [];
  page.on('console', msg => consoleMessages.push({ type: msg.type(), text: msg.text() }));

  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 }).catch(()=>{});
  await new Promise(res => setTimeout(res, 1200));

  const imgs = await page.evaluate(() => {
    const list = [];
    document.querySelectorAll('img').forEach(img => {
      const rect = img.getBoundingClientRect();
      list.push({ src: img.src, naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight, width: rect.width, height: rect.height, alt: img.alt });
    });
    // background images
    const bg = [];
    document.querySelectorAll('*').forEach(el => {
      const s = getComputedStyle(el).getPropertyValue('background-image') || '';
      if (s && s !== 'none' && s.includes('url(')) bg.push({ selector: el.tagName.toLowerCase(), bg });
    });
    return { imgs: list, bgCount: bg.length };
  });

  console.log('\nConsole messages from page:');
  consoleMessages.forEach(m => console.log('-', m.type, m.text));

  console.log('\nFound images in DOM:', imgs.imgs.length);
  imgs.imgs.forEach(i => console.log('-', i.src, `natural=${i.naturalWidth}x${i.naturalHeight}`, `display=${i.width}x${i.height}`));

  console.log('\nCaptured image requests:', requests.length);
  requests.forEach(r => {
    const resp = responses.get(r.url) || {};
    console.log('-', r.url, r.type, resp.status || 'no-response');
  });

  if (responses.size === 0 && requests.length === 0) console.log('\nNo image network requests observed from headless run.');

  await page.screenshot({ path: './screenshots/debug_page.png', fullPage: true }).catch(()=>{});
  console.log('\nSaved debug screenshot to ./screenshots/debug_page.png');

  await browser.close();
})();
