const fs = require('fs');
const path = require('path');
const files = [
  'backend/uploads/batata_rustica.png',
  'backend/uploads/batata-com-cheddar.png',
  'backend/uploads/02.png'
];
for(const f of files){
  try{
    const buf = fs.readFileSync(path.join(__dirname,'..',f));
    const sig = buf.slice(0,8).toString('hex');
    console.log(f, '->', 'sig:', sig, 'size:', buf.length);
  }catch(e){
    console.error('ERR', f, e.message);
  }
}
