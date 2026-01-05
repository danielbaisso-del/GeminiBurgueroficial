import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export class AnaliticasController {
  async getDashboard(req: Request, res: Response) {
    const tenantId = req.user!.tenantId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      todayOrders,
      todayRevenue,
      totalCustomers,
      pendingOrders,
    ] = await Promise.all([
      prisma.order.count({
        where: {
          tenantId,
          createdAt: { gte: today },
        },
      }),
      prisma.order.aggregate({
        where: {
          tenantId,
          createdAt: { gte: today },
          status: { not: 'CANCELLED' },
        },
        _sum: { total: true },
      }),
      prisma.customer.count({
        where: { tenantId },
      }),
      prisma.order.count({
        where: {
          tenantId,
          status: { in: ['PENDING', 'CONFIRMED', 'PREPARING'] },
        },
      }),
    ]);

    return res.json({
      todayOrders,
      todayRevenue: Number(todayRevenue._sum.total || 0),
      totalCustomers,
      pendingOrders,
    });
  }

  async getByPeriod(req: Request, res: Response) {
    const tenantId = req.user!.tenantId;
    const { startDate, endDate } = req.query;

    const orders = await prisma.order.findMany({
      where: {
        tenantId,
        createdAt: {
          gte: new Date(String(startDate)),
          lte: new Date(String(endDate)),
        },
        status: { not: 'CANCELLED' },
      },
      select: {
        total: true,
        createdAt: true,
      },
    });

    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total), 0);
    const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

    return res.json({
      totalOrders: orders.length,
      totalRevenue,
      avgOrderValue,
    });
  }

  async getTopProducts(req: Request, res: Response) {
    const tenantId = req.user!.tenantId;

    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: {
          tenantId,
          status: { not: 'CANCELLED' },
        },
      },
      _sum: {
        quantity: true,
        subtotal: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: 10,
    });

    const productsWithDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { id: true, name: true, price: true, image: true },
        });

        return {
          ...product,
          quantitySold: item._sum.quantity,
          revenue: Number(item._sum.subtotal),
        };
      })
    );

    return res.json(productsWithDetails);
  }
}
