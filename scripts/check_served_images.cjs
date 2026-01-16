const http = require('http');
const https = require('https');

function fetch(url){
  return new Promise((resolve,reject)=>{
    const lib = url.startsWith('https')?https:http;
    lib.get(url, (res)=>{
      let data='';
      res.on('data', c=>data+=c);
      res.on('end', ()=>resolve({status: res.statusCode, body: data, headers: res.headers}));
    }).on('error', reject);
  });
}

(async ()=>{
  try{
    const root = 'http://localhost:3333/';
    const r = await fetch(root);
    console.log('root status', r.status, 'len', r.body.length);
    const html = r.body;
    const imgs = new Set();
    const reImg = /<img[^>]+src=["']([^"']+)["']/ig;
    let m;
    while((m=reImg.exec(html))){ imgs.add(m[1]); }
    const reUrl = /url\(([^)]+)\)/ig;
    while((m=reUrl.exec(html))){ imgs.add(m[1].replace(/['"]/g,'')); }

    console.log('found images:', imgs.size);
    for(const src of imgs){
      const u = src.startsWith('/')?('http://localhost:3333'+src): (src.startsWith('http')?src:('http://localhost:3333/'+src));
      try{
        const res = await fetch(u);
        console.log(u, '=>', res.status);
      }catch(e){
        console.log(u, '=> ERROR', e.message);
      }
    }
  }catch(e){
    console.error('ERROR', e);
    process.exit(2);
  }
})();
