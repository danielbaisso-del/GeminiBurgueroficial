(async ()=>{
  try{
    const { AutenticacaoController } = require('./dist/controllers/AutenticacaoController');
    const ctrl = new AutenticacaoController();
    const req = { body: { email: 'admin@geminiburger.com', password: 'admin123' } };
    const res = { json: (d)=>{ console.log('RES JSON', JSON.stringify(d)); return d; }, status: function(s){ this._status=s; return this; } };
    await ctrl.login(req, res);
  }catch(e){ console.error('ERROR', e && e.stack ? e.stack : e); }
})();
