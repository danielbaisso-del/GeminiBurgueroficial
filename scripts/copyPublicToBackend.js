#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else if (exists) {
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
    fs.copyFileSync(src, dest);
    console.log(`copied: ${src} -> ${dest}`);
  }
}

const root = process.cwd();
const src = path.join(root, 'frontend', 'public');
const dest = path.join(root, 'backend', 'uploads');

if (!fs.existsSync(src)) {
  console.error('Source folder not found:', src);
  process.exit(1);
}

console.log('Syncing files from', src, 'to', dest);
copyRecursiveSync(src, dest);

// Commit changes if any
try {
  const status = execSync('git status --porcelain').toString().trim();
  if (status) {
    execSync('git add backend/uploads', { stdio: 'inherit' });
    execSync("git config user.email \"github-actions[bot]@users.noreply.github.com\"", { stdio: 'inherit' });
    execSync("git config user.name \"github-actions[bot]\"", { stdio: 'inherit' });
    execSync('git commit -m "chore: sync frontend public -> backend/uploads [skip ci]"', { stdio: 'inherit' });
    execSync('git push', { stdio: 'inherit' });
    console.log('Changes committed and pushed.');
  } else {
    console.log('No changes to commit.');
  }
} catch (err) {
  console.error('Error while committing changes:', err.message);
  process.exit(1);
}
