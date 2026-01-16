const fs = require('fs');
const paths = [
  'frontend/dist/assets/index-DtOTd6kV.js',
  'backend/public/assets/index-BcduoK5P.js'
];
const target = 'pngtree-golden-brown-rustic-potato-wedges-served-with-spices-on-vivid-orange-png-image_16719846.png';
for(const p of paths){
  try{
    const full = require('path').join(__dirname,'..',p);
    let s = fs.readFileSync(full,'utf8');
    if(s.includes(target)){
      s = s.split(target).join('batata_rustica.png');
      fs.writeFileSync(full,s,'utf8');
      console.log('Patched', p);
    }else{
      console.log('No match in', p);
    }
  }catch(e){
    console.error('ERR', p, e.message);
  }
}
