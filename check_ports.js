(async ()=>{
  const ports = [3000,3333,3334];
  for(const p of ports){
    const url = `http://localhost:${p}/`;
    try{
      const res = await fetch(url);
      console.log(url, '=>', res.status);
      const txt = await res.text();
      console.log('len', txt.length);
    }catch(e){
      console.error(url, 'ERROR', e.message || e);
    }
  }
})();
