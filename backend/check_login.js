const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
(async () => {
  const p = new PrismaClient();
  try {
    const u = await p.user.findFirst({ where: { email: 'admin@geminiburger.com' }, include: { tenant: true } });
    console.log('user', !!u);
    const ok = await bcrypt.compare('admin123', u.password);
    console.log('pwd ok', ok);
    const token = jwt.sign({ sub: u.id, tenantId: u.tenantId, role: u.role }, process.env.JWT_SECRET || 'default-secret', { expiresIn: '7d' });
    console.log('token len', token.length);
  } catch (e) {
    console.error('ERR', e);
  } finally {
    await p.$disconnect();
  }
})();
