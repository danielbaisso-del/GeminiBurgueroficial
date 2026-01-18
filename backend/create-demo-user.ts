import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createDemoUser() {
  try {
    const tenant = await prisma.tenant.findFirst({
      where: { slug: 'gemini-burger' }
    });

    if (!tenant) {
      console.log('❌ Tenant não encontrado');
      return;
    }

    const existingUser = await prisma.user.findFirst({
      where: { email: 'admin@demo.com' }
    });

    if (existingUser) {
      console.log('✅ Usuário admin@demo.com já existe');
      return;
    }

    const hashedPassword = await bcrypt.hash('demo123', 10);
    
    const user = await prisma.user.create({
      data: {
        email: 'admin@demo.com',
        name: 'Admin Demo',
        password: hashedPassword,
        role: 'OWNER',
        tenantId: tenant.id
      }
    });

    console.log('✅ Usuário criado: admin@demo.com / demo123');
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDemoUser();
