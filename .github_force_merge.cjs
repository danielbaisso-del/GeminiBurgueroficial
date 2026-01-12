const https = require('https');
const gh = process.env.GITHUB_TOKEN;
const owner = 'danielbaisso-del';
const repo = 'GeminiBurgueroficial';
const head = 'embed-frontend-into-backend';
const base = 'main';
const vtoken = process.env.VERCEL_TOKEN;
if(!gh){ console.error('Missing GITHUB_TOKEN env var'); process.exit(2); }
function request(options, data){
  return new Promise((resolve,reject)=>{
    const r = https.request(options, res=>{
      let b=''; res.on('data', c=> b+=c); res.on('end', ()=>{
        try{ resolve({status: res.statusCode, body: JSON.parse(b)}); }
        catch(e){ resolve({status: res.statusCode, body: b}); }
      });
    });
    r.on('error', reject);
    if(data) r.write(JSON.stringify(data));
    r.end();
  });
}
(async()=>{
  try{
    console.log('Calling /merges to create merge commit...');
    const opts={ hostname:'api.github.com', path:`/repos/${owner}/${repo}/merges`, method:'POST', headers: {'User-Agent':'node','Authorization':'token '+gh,'Accept':'application/vnd.github.v3+json','Content-Type':'application/json'} };
    const merge = await request(opts, {base, head, commit_message: `Merge ${head} via assistant`} );
    console.log('Status', merge.status);
    console.log(merge.body);
    if(merge.status===201){
      console.log('Merge created. Triggering Vercel deploy...');
      if(!vtoken){ console.log('No VERCEL_TOKEN env set; stopping.'); process.exit(0); }
      const data = { name:'gemini-burgueroficial', target:'production', gitSource:{type:'github', org:owner, repo:repo, ref:base} };
      const vopts={ hostname:'api.vercel.com', path:'/v13/now/deployments', method:'POST', headers:{'Authorization':'Bearer '+vtoken,'User-Agent':'node','Content-Type':'application/json'} };
      const d = await request(vopts, data);
      console.log('Vercel response', d.status, d.body && d.body.id ? {id:d.body.id, url:d.body.url, readyState:d.body.readyState} : d.body);
      process.exit(0);
    } else if(merge.status===409){
      console.log('Already up-to-date or conflict', merge.body);
    } else {
      console.log('Merge not created; likely branch protection or permission issue.');
    }
  }catch(e){ console.error('Error', e); process.exit(2); }
})();
