#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');
const url = process.argv[2] || 'http://localhost:3333';

(async () => {
  console.log('Starting browser cleanup for', url);
  // Try to find an installed Chrome/Edge executable on Windows
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

  const chromePath = findChrome();
  const launchOpts = { headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] };
  if (chromePath) launchOpts.executablePath = chromePath;
  const browser = await puppeteer.launch(launchOpts);
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE:', msg.text()));
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    console.log('Unregistering service workers, clearing caches and storages...');
    await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        try {
          const regs = await navigator.serviceWorker.getRegistrations();
          for (const r of regs) {
            await r.unregister();
            console.log('unregistered', r.scope);
          }
        } catch (e) { console.log('sw unregister error', e && e.message); }
      }

      if ('caches' in window) {
        try {
          const keys = await caches.keys();
          for (const k of keys) {
            await caches.delete(k);
            console.log('cache deleted', k);
          }
        } catch (e) { console.log('caches error', e && e.message); }
      }

      try { localStorage.clear(); sessionStorage.clear(); console.log('localStorage+sessionStorage cleared'); } catch (e) { console.log('storage clear error', e && e.message); }

      try {
        if (indexedDB && indexedDB.databases) {
          const dbs = await indexedDB.databases();
          for (const db of dbs) {
            try {
              await new Promise((res) => {
                const req = indexedDB.deleteDatabase(db.name);
                req.onsuccess = () => res();
                req.onerror = () => res();
                req.onblocked = () => res();
              });
              console.log('deleted indexedDB', db.name);
            } catch (e) { console.log('delete indexedDB error', db.name, e && e.message); }
          }
        }
      } catch (e) { console.log('indexedDB enumeration error', e && e.message); }
    });

    console.log('Reloading page to fetch updated assets...');
    await page.reload({ waitUntil: 'networkidle2', timeout: 60000 });
    await new Promise(res => setTimeout(res, 1500));
    console.log('Cleanup + reload completed');
  } catch (err) {
    console.error('Script error:', err && err.stack ? err.stack : err);
  } finally {
    await browser.close();
    console.log('Browser closed.');
  }
})();
