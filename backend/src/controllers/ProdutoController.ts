import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { ErroApp } from '../middlewares/tratadorErros';

const createProductSchema = z.object({
  name: z.string(),
  description: z.string(),
  price: z.number().positive(),
  categoryId: z.string(),
  image: z.string().optional(),
  tags: z.array(z.string()).optional(),
  available: z.boolean().optional(),
  stock: z.number().optional(),
  calories: z.number().optional(),
  ingredients: z.array(z.string()).optional(),
  allergens: z.array(z.string()).optional(),
});

export class ProdutoController {
  async create(req: Request, res: Response) {
    try {
      console.log('📦 Criando produto com dados:', req.body);
      console.log('👤 User:', req.user);
      
      const data = createProductSchema.parse(req.body);
      const tenantId = req.user!.tenantId;

      if (!tenantId) {
        throw new ErroApp('User tenant not found', 400);
      }

      const slug = data.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

      const product = await prisma.product.create({
        data: {
          ...data,
          slug,
          tenantId,
        },
        include: {
          category: true,
        },
      });

      console.log('✅ Produto criado:', product.id);
      return res.status(201).json(product);
    } catch (error) {
      console.error('❌ Erro ao criar produto:', error);
      throw error;
    }
  }

  async list(req: Request, res: Response) {
    const tenantId = req.user!.tenantId;
    const { categoryId, available } = req.query;

    const products = await prisma.product.findMany({
      where: {
        tenantId,
        ...(categoryId && { categoryId: String(categoryId) }),
        ...(available !== undefined && { available: available === 'true' }),
      },
      include: {
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.json(products);
  }

  async listPublic(req: Request, res: Response) {
    const tenant = req.tenant!;

    const products = await prisma.product.findMany({
      where: {
        tenantId: tenant.id,
        available: true,
      },
      include: {
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.json(products);
  }

  async listAllPublic(req: Request, res: Response) {
    // Listar todos os produtos públicos de todos os tenants
    // Usado pelo app mobile para listar produtos da plataforma
    const products = await prisma.product.findMany({
      where: {
        available: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        categoryId: true,
        image: true,
        stock: true,
        available: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 100, // Limitar para performance
    });

    return res.json(products);
  }

  async getById(req: Request, res: Response) {
    const { id } = req.params;
    const tenantId = req.user!.tenantId;

    const product = await prisma.product.findFirst({
      where: {
        id,
        tenantId,
      },
      include: {
        category: true,
      },
    });

    if (!product) {
      throw new ErroApp('Product not found', 404);
    }

    return res.json(product);
  }

  async getBySlug(req: Request, res: Response) {
    const { slug } = req.params;
    const tenant = req.tenant!;

    const product = await prisma.product.findFirst({
      where: {
        slug,
        tenantId: tenant.id,
      },
      include: {
        category: true,
      },
    });

    if (!product) {
      throw new ErroApp('Product not found', 404);
    }

    return res.json(product);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const data = createProductSchema.partial().parse(req.body);
    const tenantId = req.user!.tenantId;

    const product = await prisma.product.findFirst({
      where: { id, tenantId },
    });

    if (!product) {
      throw new ErroApp('Product not found', 404);
    }

    const updated = await prisma.product.update({
      where: { id },
      data,
      include: {
        category: true,
      },
    });

    return res.json(updated);
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;
    const tenantId = req.user!.tenantId;

    const product = await prisma.product.findFirst({
      where: { id, tenantId },
    });

    if (!product) {
      throw new ErroApp('Product not found', 404);
    }

    await prisma.product.delete({
      where: { id },
    });

    return res.status(204).send();
  }
}
