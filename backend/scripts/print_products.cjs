const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

(async () => {
  try {
    const products = await prisma.product.findMany();
    products.forEach(p => {
      console.log(p.id, '|', p.name, '|', p.image);
    });
  } catch (err) {
    console.error('Error querying products:', err);
  } finally {
    await prisma.$disconnect();
  }
})();
