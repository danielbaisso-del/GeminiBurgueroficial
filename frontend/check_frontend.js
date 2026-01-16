(async ()=>{
  try{
    const urls = ['http://localhost:3000','http://127.0.0.1:3000','http://192.168.1.38:3000'];
    for(const u of urls){
      try{
        const res = await fetch(u, { method: 'GET' });
        console.log(u, '=>', res.status);
        console.log('len', (await res.text()).length);
        return;
      }catch(e){
        console.error(u, 'ERROR', e.message || e);
      }
    }
    process.exit(2);
  }catch(e){
    console.error('ERROR', e.message || e);
    process.exit(2);
  }
})();
