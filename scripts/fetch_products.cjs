(async ()=>{
  try{
    const r = await fetch('http://localhost:3333/api/products');
    console.log('status', r.status);
    const txt = await r.text();
    console.log(txt.slice(0,1000));
  }catch(e){
    console.error('ERROR', e.message||e);
  }
})();
