const fs = require('fs');
const files = [
  'frontend/dist/assets/index-DtOTd6kV.js',
  'backend/public/assets/index-BcduoK5P.js'
];
const oldPrefix = 'https://png.pngtree.com/png-vector/20250813/ourlarge/';
for (const f of files) {
  try {
    const full = require('path').join(__dirname, '..', f);
    let s = fs.readFileSync(full, 'utf8');
    if (s.includes(oldPrefix)) {
      s = s.split(oldPrefix).join('');
      fs.writeFileSync(full, s, 'utf8');
      console.log('Replaced prefix in', f);
    } else {
      console.log('No prefix in', f);
    }
  } catch (e) {
    console.error('ERR', f, e.message);
  }
}
