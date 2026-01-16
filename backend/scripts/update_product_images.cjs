const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async ()=>{
  try{
    const map = {
      'batata-frita': 'uploads/batata-com-cheddar.png',
      'onion-rings': 'uploads/batata_rustica.png',
      'coca-cola-350ml': 'uploads/02.png',
      'suco-natural': 'uploads/agua.jpg',
      'x-burger-classico': 'uploads/arranjo-com-deliciosa-cerveja-americana.jpg',
      'x-bacon': 'uploads/arranjo-com-deliciosa-cerveja-americana.jpg',
      'x-egg': 'uploads/arranjo-com-deliciosa-cerveja-americana.jpg',
      'x-salada': 'uploads/arranjo-com-deliciosa-cerveja-americana.jpg'
    };

    for(const [slug,img] of Object.entries(map)){
      const prod = await prisma.product.findFirst({ where: { slug } });
      if(prod){
        await prisma.product.update({ where: { id: prod.id }, data: { image: img } });
        console.log('Updated', slug, '->', img);
      } else {
        console.log('Product not found', slug);
      }
    }

    console.log('Done');
  }catch(e){
    console.error('ERROR', e);
  }finally{
    await prisma.$disconnect();
  }
})();
