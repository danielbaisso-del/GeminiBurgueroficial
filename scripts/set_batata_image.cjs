#!/usr/bin/env node
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    console.log('Looking for product with slug or name containing "batata"...');
    const candidates = await prisma.product.findMany({ where: { OR: [{ slug: { contains: 'batata', mode: 'insensitive' } }, { name: { contains: 'batata', mode: 'insensitive' } }] } });
    if (!candidates || candidates.length === 0) {
      console.log('No matching products found.');
      process.exit(0);
    }
    for (const p of candidates) {
      console.log('Updating product', p.id, p.name, '-> image uploads/batata_rustica.png');
      await prisma.product.update({ where: { id: p.id }, data: { image: 'uploads/batata_rustica.png' } });
    }
    console.log('Update complete.');
  } catch (err) {
    console.error('Error:', err && err.message ? err.message : err);
  } finally {
    await prisma.$disconnect();
  }
})();
