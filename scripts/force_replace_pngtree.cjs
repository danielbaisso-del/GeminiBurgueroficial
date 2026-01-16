#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const rootDirs = [
  path.join(__dirname, '..', 'frontend', 'dist'),
  path.join(__dirname, '..', 'backend', 'public')
];

const targetPatterns = [
  new RegExp('https?:\\/\\/[^\\s"\']*pngtree[^\\s"\']*','g'), // full URLs containing pngtree
  new RegExp('pngtree[^\\s"\'\\)\\]]*\\.png','g') // filenames starting with pngtree and ending with .png
];

const replacement = '/uploads/batata_rustica.png';

function isBinary(buffer) {
  for (let i = 0; i < Math.min(buffer.length, 1000); i++) {
    if (buffer[i] === 0) return true;
  }
  return false;
}

function walkDir(dir) {
  const entries = [];
  try { for (const name of fs.readdirSync(dir)) entries.push(path.join(dir, name)); } catch (e) { return []; }
  const files = [];
  for (const p of entries) {
    try {
      const stat = fs.statSync(p);
      if (stat.isDirectory()) files.push(...walkDir(p));
      else files.push(p);
    } catch (e) {}
  }
  return files;
}

let totalReplacements = 0;

for (const dir of rootDirs) {
  if (!fs.existsSync(dir)) continue;
  const files = walkDir(dir);
  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    // Only process text-like files
    if (!['.js', '.html', '.css', '.json', '.map', '.mjs'].includes(ext)) continue;
    try {
      const buf = fs.readFileSync(file);
      if (isBinary(buf)) continue;
      let s = buf.toString('utf8');
      let replaced = false;
      for (const pat of targetPatterns) {
        if (pat.test(s)) {
          s = s.replace(pat, replacement);
          replaced = true;
        }
      }
      if (replaced) {
        fs.writeFileSync(file, s, 'utf8');
        console.log('Patched', file);
        totalReplacements++;
      }
    } catch (e) {
      console.error('Error processing', file, e && e.message);
    }
  }
}

console.log('Total files patched:', totalReplacements);
if (totalReplacements === 0) console.log('No occurrences found to replace.');
