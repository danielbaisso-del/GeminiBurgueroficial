(async ()=>{
  const urls = [
    'http://localhost:3333/02.png',
    'http://localhost:3333/agua.jpg',
    'http://localhost:3333/uploads/batata-com-cheddar.png',
    'http://localhost:3333/uploads/02.png',
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800',
  ];
  for(const u of urls){
    try{
      const r = await fetch(u);
      console.log(u, '=>', r.status, r.headers['content-type'] || r.headers.get && r.headers.get('content-type'), 'len', (r.headers['content-length']||r.headers.get&&r.headers.get('content-length')));
    }catch(e){
      console.log(u, '=> ERROR', e.message || e);
    }
  }
})();
