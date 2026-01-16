(async ()=>{
  try{
    const r = await fetch('http://localhost:3333/');
    console.log('status', r.status);
    console.log('CSP:', r.headers.get('content-security-policy'));
  }catch(e){
    console.error('ERROR', e.message||e);
  }
})();
