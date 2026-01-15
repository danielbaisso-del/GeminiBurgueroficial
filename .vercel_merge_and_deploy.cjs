const https = require('https');
const owner = process.env.OWNER || 'danielbaisso-del';
const repo = process.env.REPO || 'GeminiBurgueroficial';
const branch = process.env.BRANCH || 'embed-frontend-into-backend';
// IMPORTANT: do NOT hardcode tokens in the repository.
// Read tokens from environment variables instead.
const gh = process.env.GITHUB_TOKEN;
const vtoken = process.env.VERCEL_TOKEN;
if(!gh || !vtoken){ console.error('Missing GITHUB_TOKEN or VERCEL_TOKEN env vars'); process.exit(2);} 
function request(options, data){
  return new Promise((resolve, reject)=>{
    const req = https.request(options, res=>{
      let b='';
      res.on('data', c=> b+=c);
      res.on('end', ()=>{
        try{ resolve({status: res.statusCode, body: JSON.parse(b)}); }
        catch(e){ resolve({status: res.statusCode, body: b}); }
      });
    });
    req.on('error', reject);
    if(data) req.write(JSON.stringify(data));
    req.end();
  });
}
(async()=>{
  try{
    console.log('Listing open PRs for', owner + '/' + repo, '— will look for branch:', branch);
    const prs = await request({hostname:'api.github.com', path:`/repos/${owner}/${repo}/pulls?state=open`, method:'GET', headers: {'User-Agent':'node','Authorization':'token '+gh,'Accept':'application/vnd.github.v3+json'}});
    if (Array.isArray(prs.body)){
      console.log('Open PRs and their head refs:');
      prs.body.forEach(p=>{
        const ref = p.head && p.head.ref ? p.head.ref : '(no head.ref)';
        console.log('#'+p.number, '-', ref, '-', p.title);
      });
    }
    if(prs.status !== 200){ console.error('Failed listing PRs', prs.status, prs.body); process.exit(2);} 
    const found = Array.isArray(prs.body) ? prs.body.find(p=>p.head && (p.head.ref===branch || (p.head.ref && p.head.ref.includes(branch)))) : null;
    if(!found){
      console.log('PR not found for branch', branch, '- will proceed to deploy `main` without merging.');
    } else {
      console.log('Found PR #'+found.number+':', found.title);
      console.log('Merging PR...');
      const merge = await request({hostname:'api.github.com', path:`/repos/${owner}/${repo}/pulls/${found.number}/merge`, method:'PUT', headers: {'User-Agent':'node','Authorization':'token '+gh,'Accept':'application/vnd.github.v3+json','Content-Type':'application/json'}}, {commit_title:`Merge ${branch} via assistant`, merge_method:'merge'});
      console.log('Merge response status', merge.status);
      if(!(merge.status===200 || merge.status===201)){
        console.error('Merge failed or not allowed', merge.body);
        process.exit(2);
      }
      console.log('Merged PR', found.number);
    }

    console.log('Triggering Vercel deployment...');
    const vercelProjectName = process.env.VERCEL_PROJECT_NAME || 'gemini-burgueroficial';
    const data = { name: vercelProjectName, target: 'production', gitSource: { type: 'github', org: owner, repo: repo, ref: 'main' } };
    const deploy = await request({hostname:'api.vercel.com', path:'/v13/now/deployments', method:'POST', headers: {'Authorization':'Bearer '+vtoken,'User-Agent':'node','Content-Type':'application/json'}}, data);
    if(deploy.status!==200){ console.error('Vercel deploy request failed', deploy.status, deploy.body); process.exit(2); }
    console.log('Deployment created:', JSON.stringify({id: deploy.body.id, url: deploy.body.url, readyState: deploy.body.readyState}, null, 2));

    const id = deploy.body.id;
    console.log('Polling deployment status...');
    for(let i=0;i<120;i++){
      await new Promise(r=>setTimeout(r,5000));
      const d = await request({hostname:'api.vercel.com', path:`/v13/now/deployments/${id}`, method:'GET', headers: {'Authorization':'Bearer '+vtoken,'User-Agent':'node'}});
      if(d.status===200 && d.body && d.body.readyState){
        console.log('[poll]', d.body.readyState);
        if(d.body.readyState==='READY'){
          console.log('Deployment READY:', d.body.url);
          process.exit(0);
        }
        if(d.body.readyState==='ERROR'){
          console.error('Deployment ERROR:', d.body.readyStateReason || d.body.errorMessage || d.body);
          process.exit(2);
        }
      }
    }
    console.error('Timed out waiting for deployment to become READY');
    process.exit(2);
  }catch(e){ console.error('Error', e); process.exit(2); }
})();
