const http = require('http');
const fs = require('fs');
const url = 'http://localhost:3333/';
http.get(url, res => {
  let data = '';
  res.setEncoding('utf8');
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const has = data.includes('pngtree');
    console.log('Root contains pngtree?', has);
    if (has) {
      const idx = data.indexOf('pngtree');
      console.log(data.slice(Math.max(0, idx-200), idx+200));
    }
    fs.writeFileSync('.\\temp_root.html', data, 'utf8');
    console.log('Saved to .\\temp_root.html');
  });
}).on('error', e => console.error('Fetch error', e));
