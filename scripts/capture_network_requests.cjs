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
  const launchOpts = { headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] };
  if (chromePath) launchOpts.executablePath = chromePath;

  console.log('Launching browser, visiting', url);
  const browser = await puppeteer.launch(launchOpts);
  const page = await browser.newPage();

  const requests = [];
  const responses = [];
  page.on('request', req => {
    requests.push({
      id: req._requestId || null,
      url: req.url(),
      method: req.method(),
      resourceType: req.resourceType(),
      headers: req.headers()
    });
  });

  page.on('requestfailed', rf => {
    console.log('REQUEST FAILED:', rf.url(), rf.failure && rf.failure.errorText);
  });

  page.on('response', resp => {
    const req = resp.request();
    const info = { url: resp.url(), status: resp.status(), resourceType: req.resourceType(), headers: resp.headers(), body: null };
    // only capture body for document or script resources to search for pngtree
    if (req.resourceType() === 'script' || req.resourceType() === 'document') {
      responses.push(resp.text().then(text => { info.body = text; return info; }).catch(() => { return info; }));
    } else {
      responses.push(Promise.resolve(info));
    }
  });

  await page.setCacheEnabled(false);
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
  } catch (e) {
    console.warn('goto error', e && e.message);
  }

  // wait a bit for lazy loads
  await new Promise(res => setTimeout(res, 1500));

  // wait for responses to be collected
  const resolvedResponses = await Promise.all(responses);
  await browser.close();

  // Filter requests for pngtree or external images not on localhost
  const pngtree = requests.filter(r => r.url.includes('pngtree'));
  const externalImages = requests.filter(r => (r.resourceType === 'image' || /\.png$/.test(r.url)) && !r.url.includes('localhost') && !r.url.includes('127.0.0.1'));

  // Search captured script/document bodies for pngtree
  const bodiesWithPngtree = resolvedResponses.filter(r => r.body && r.body.includes('pngtree'));

  console.log('\nTotal requests captured:', requests.length);
  console.log('pngtree matches (request URLs):', pngtree.length);
  pngtree.slice(0,20).forEach(r => console.log(' -', r.url));
  console.log('\nExternal image requests (non-localhost):', externalImages.length);
  externalImages.slice(0,20).forEach(r => console.log(' -', r.url));

  console.log('\nCaptured script/document responses containing "pngtree":', bodiesWithPngtree.length);
  bodiesWithPngtree.slice(0,20).forEach(r => console.log(' -', r.url));

  if (pngtree.length === 0 && externalImages.length === 0 && bodiesWithPngtree.length === 0) {
    console.log('\nNo external PNGTree or external image requests detected from headless run, and no script/doc bodies contained the string.');
  } else {
    console.log('\nIf external requests remain in your real browser, open DevTools Network to see the Initiator and response headers and paste them here.');
  }
})();
