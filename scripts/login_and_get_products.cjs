(async ()=>{
  try{
    const login = await fetch('http://localhost:3333/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'admin@geminiburger.com',password:'admin123'})});
    console.log('login status', login.status);
    if(!login.ok){ console.log(await login.text()); return; }
    const j = await login.json();
    const token = j.token;
    console.log('token length', token?token.length:0);
    const prods = await fetch('http://localhost:3333/api/products',{headers:{Authorization:`Bearer ${token}`}});
    console.log('products status', prods.status);
    const pjson = await prods.json();
    console.log('products count', Array.isArray(pjson)?pjson.length:typeof pjson);
    console.log(JSON.stringify(pjson.slice? pjson.slice(0,10) : pjson, null, 2));
  }catch(e){ console.error('ERROR', e.message||e); }
})();
