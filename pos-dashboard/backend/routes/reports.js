const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/reports/sales?from=2024-01-01&to=2024-01-31
router.get('/sales', async (req, res) => {
  try {
    const { from, to } = req.query;
    const start = from ? new Date(from) : new Date(new Date().setHours(0, 0, 0, 0));
    const end = to ? new Date(new Date(to).setHours(23, 59, 59, 999)) : new Date(new Date().setHours(23, 59, 59, 999));

    const orders = await prisma.order.findMany({
      where: {
        status: { in: ['COMPLETED', 'SERVED'] },
        createdAt: { gte: start, lte: end }
      },
      include: { items: { include: { product: { select: { categoryName: true } } } } }
    });

    const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Revenue by type
    const byType = { DINE_IN: 0, TAKEAWAY: 0, DELIVERY: 0 };
    orders.forEach(o => { byType[o.type] = (byType[o.type] || 0) + o.total; });

    // Revenue by day (for chart)
    const byDay = {};
    orders.forEach(o => {
      const day = o.createdAt.toISOString().slice(0, 10);
      byDay[day] = (byDay[day] || 0) + o.total;
    });

    // Revenue by category
    const byCategory = {};
    orders.forEach(o => {
      o.items.forEach(item => {
        const cat = item.product?.categoryName || 'Other';
        byCategory[cat] = (byCategory[cat] || 0) + (item.unitPrice * item.quantity);
      });
    });

    res.json({
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      totalOrders,
      avgOrderValue: parseFloat(avgOrderValue.toFixed(2)),
      byType,
      byDay,
      byCategory
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate sales report' });
  }
});

// GET /api/reports/top-items?from=&to=&limit=10
router.get('/top-items', async (req, res) => {
  try {
    const { from, to, limit = 10 } = req.query;
    const start = from ? new Date(from) : new Date(new Date().setDate(new Date().getDate() - 30));
    const end = to ? new Date(new Date(to).setHours(23, 59, 59, 999)) : new Date();

    const items = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: { order: { createdAt: { gte: start, lte: end }, status: { in: ['COMPLETED', 'SERVED'] } } },
      _sum: { quantity: true, unitPrice: true },
      _count: { id: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: parseInt(limit)
    });

    const productIds = items.map(i => i.productId);
    const products = await prisma.product.findMany({ where: { id: { in: productIds } }, select: { id: true, name: true, categoryName: true, image: true } });
    const productMap = Object.fromEntries(products.map(p => [p.id, p]));

    const result = items.map(i => ({
      product: productMap[i.productId],
      totalQuantity: i._sum.quantity,
      totalRevenue: parseFloat(((i._sum.unitPrice || 0) * (i._sum.quantity || 0)).toFixed(2)),
      orderCount: i._count.id
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch top items' });
  }
});

// GET /api/reports/orders-by-hour?date=2024-01-14
router.get('/orders-by-hour', async (req, res) => {
  try {
    const { date } = req.query;
    const d = date ? new Date(date) : new Date();
    const start = new Date(d.setHours(0, 0, 0, 0));
    const end = new Date(d);
    end.setHours(23, 59, 59, 999);

    const orders = await prisma.order.findMany({
      where: { createdAt: { gte: start, lte: end } },
      select: { createdAt: true, total: true }
    });

    const byHour = Array.from({ length: 24 }, (_, h) => ({ hour: h, orders: 0, revenue: 0 }));
    orders.forEach(o => {
      const h = new Date(o.createdAt).getHours();
      byHour[h].orders += 1;
      byHour[h].revenue += o.total;
    });

    res.json(byHour);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch hourly data' });
  }
});

// GET /api/reports/staff?from=&to=
router.get('/staff', async (req, res) => {
  try {
    const { from, to } = req.query;
    const start = from ? new Date(from) : new Date(new Date().setDate(new Date().getDate() - 30));
    const end = to ? new Date(new Date(to).setHours(23, 59, 59, 999)) : new Date();

    const grouped = await prisma.order.groupBy({
      by: ['staffId'],
      where: { createdAt: { gte: start, lte: end }, status: { in: ['COMPLETED', 'SERVED'] } },
      _sum: { total: true },
      _count: { id: true }
    });

    const staffIds = grouped.map(g => g.staffId).filter(Boolean);
    const staffList = await prisma.staff.findMany({ where: { id: { in: staffIds } }, select: { id: true, name: true, role: true, avatar: true } });
    const staffMap = Object.fromEntries(staffList.map(s => [s.id, s]));

    const result = grouped.map(g => ({
      staff: staffMap[g.staffId],
      totalRevenue: parseFloat((g._sum.total || 0).toFixed(2)),
      totalOrders: g._count.id
    })).filter(r => r.staff);

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch staff report' });
  }
});

module.exports = router;
