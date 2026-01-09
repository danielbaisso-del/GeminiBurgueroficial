#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const root = process.cwd();
const publicDir = path.join(root, 'public');
if (!fs.existsSync(publicDir)) {
  console.log('No root public directory found.');
  process.exit(0);
}
const files = fs.readdirSync(publicDir);
for (const f of files) {
  const p = path.join(publicDir, f);
  try {
    fs.unlinkSync(p);
    console.log('Deleted', p);
  } catch (err) {
    console.error('Failed to delete', p, err.message);
  }
}
try {
  fs.rmdirSync(publicDir);
  console.log('Removed directory', publicDir);
} catch (err) {
  console.error('Failed to remove directory:', err.message);
}
console.log('Done.');
