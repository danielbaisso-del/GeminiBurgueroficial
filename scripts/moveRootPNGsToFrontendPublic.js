#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const root = process.cwd();
const files = fs.readdirSync(root);
const exts = ['.png', '.jpg', '.jpeg', '.webp', '.gif'];
const images = files.filter((f) => exts.includes(path.extname(f).toLowerCase()));
const destDir = path.join(root, 'frontend', 'public');
if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
if (images.length === 0) {
  console.log('No image files found in repo root.');
  process.exit(0);
}
for (const file of images) {
  const src = path.join(root, file);
  const dest = path.join(destDir, file);
  try {
    // If dest exists, skip
    if (fs.existsSync(dest)) {
      console.log(`Skipping ${file} — already exists in frontend/public`);
      // Remove original to clean root if desired
      fs.unlinkSync(src);
      console.log(`Removed root duplicate ${file}`);
      continue;
    }
    fs.renameSync(src, dest);
    console.log(`Moved ${file} -> frontend/public/${file}`);
  } catch (err) {
    console.error(`Failed to move ${file}:`, err.message);
  }
}
console.log('Done.');
