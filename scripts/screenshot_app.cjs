#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const url = process.argv[2] || 'http://localhost:3333';
const out = process.argv[3] || path.join(__dirname, '..', 'screenshots', 'app.png');

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
  try {
    const chromePath = findChrome();
    const opts = { headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] };
    if (chromePath) opts.executablePath = chromePath;
    const browser = await puppeteer.launch(opts);
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    await new Promise(res => setTimeout(res, 1200));
    const outDir = path.dirname(out);
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    await page.screenshot({ path: out, fullPage: true });
    console.log('Saved screenshot to', out);
    await browser.close();
  } catch (e) {
    console.error('Error taking screenshot:', e && e.stack ? e.stack : e);
    process.exit(1);
  }
})();
