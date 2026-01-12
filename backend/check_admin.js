const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
(async () => {
  const p = new PrismaClient();
  try {
    const u = await p.user.findFirst({ where: { email: 'admin@geminiburger.com' } });
    console.log('userExists', !!u);
    if (u) {
      console.log('passwordHash:', u.password);
      const ok = await bcrypt.compare('admin123', u.password);
      console.log('compare', ok);
    }
  } catch (e) {
    console.error('ERR', e);
  } finally {
    await p.$disconnect();
  }
})();
