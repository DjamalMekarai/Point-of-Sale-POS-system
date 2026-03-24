const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Generate unique order number: ORD-YYYYMMDD-XXXXX
function genOrderNumber() {
  const d = new Date();
  const date = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const rand = Math.floor(Math.random() * 90000) + 10000;
  return `ORD-${date}-${rand}`;
}

// GET /api/orders
router.get('/', async (req, res) => {
  try {
    const { status, type, date, staffId, tableId, page = 1, limit = 50 } = req.query;
    const where = {};
    if (status) where.status = status;
    if (type) where.type = type;
    if (staffId) where.staffId = parseInt(staffId);
    if (tableId) where.tableId = parseInt(tableId);
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      where.createdAt = { gte: start, lte: end };
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: { include: { product: { select: { id: true, name: true, image: true } } } },
          table: { select: { id: true, number: true, zone: true } },
          staff: { select: { id: true, name: true, role: true } },
          customer: { select: { id: true, name: true, phone: true } },
          discount: { select: { id: true, name: true, type: true, value: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.order.count({ where })
    ]);
    res.json({ orders, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET /api/orders/:id
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
        table: true,
        staff: { select: { id: true, name: true, role: true, avatar: true } },
        customer: true,
        discount: true
      }
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// POST /api/orders
router.post('/', async (req, res) => {
  try {
    const { type, tableId, staffId, customerId, discountId, items, notes, isPriority } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Order must have at least one item' });
    }

    // Fetch product prices
    const productIds = items.map(i => i.productId);
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
    const productMap = Object.fromEntries(products.map(p => [p.id, p]));

    let subtotal = 0;
    const orderItems = items.map(item => {
      const product = productMap[item.productId];
      if (!product) throw new Error(`Product ${item.productId} not found`);
      const unitPrice = item.unitPrice ?? product.price;
      subtotal += unitPrice * item.quantity;
      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice,
        modifiers: item.modifiers || null,
        variant: item.variant || null,
        notes: item.notes || null,
        status: 'PENDING'
      };
    });

    // Fetch settings for tax
    const settings = await prisma.settings.findUnique({ where: { id: 1 } });
    const taxRate = settings?.taxRate ?? 19;
    const tax = parseFloat(((subtotal * taxRate) / 100).toFixed(2));
    const total = parseFloat((subtotal + tax).toFixed(2));

    const order = await prisma.order.create({
      data: {
        orderNumber: genOrderNumber(),
        type: type || 'DINE_IN',
        status: 'PENDING',
        tableId: tableId ? parseInt(tableId) : null,
        staffId: staffId ? parseInt(staffId) : null,
        customerId: customerId ? parseInt(customerId) : null,
        discountId: discountId ? parseInt(discountId) : null,
        subtotal,
        discountAmt: 0,
        tax,
        total,
        isPriority: isPriority || false,
        notes: notes || null,
        items: { create: orderItems }
      },
      include: {
        items: { include: { product: { select: { id: true, name: true } } } },
        table: { select: { id: true, number: true } },
        staff: { select: { id: true, name: true } }
      }
    });

    // Update table status if dine-in
    if (tableId && type === 'DINE_IN') {
      await prisma.table.update({ where: { id: parseInt(tableId) }, data: { status: 'OCCUPIED' } });
    }

    res.status(201).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Failed to create order' });
  }
});

// PATCH /api/orders/:id/status
router.patch('/:id/status', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'Status is required' });

    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Order not found' });

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: { include: { product: { select: { id: true, name: true } } } },
        table: { select: { id: true, number: true } }
      }
    });

    // Free the table when order is completed/cancelled
    if (['COMPLETED', 'CANCELLED', 'REFUNDED'].includes(status) && existing.tableId) {
      await prisma.table.update({ where: { id: existing.tableId }, data: { status: 'AVAILABLE' } });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// PATCH /api/orders/:id/priority
router.patch('/:id/priority', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Order not found' });
    const order = await prisma.order.update({ where: { id }, data: { isPriority: !existing.isPriority } });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle priority' });
  }
});

// DELETE /api/orders/:id  (cancel)
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Order not found' });
    await prisma.order.update({ where: { id }, data: { status: 'CANCELLED' } });
    if (existing.tableId) {
      await prisma.table.update({ where: { id: existing.tableId }, data: { status: 'AVAILABLE' } });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to cancel order' });
  }
});

module.exports = router;
