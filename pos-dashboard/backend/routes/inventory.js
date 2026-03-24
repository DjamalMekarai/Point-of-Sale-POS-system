const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/inventory
router.get('/', async (req, res) => {
  try {
    const { category, lowStock } = req.query;
    const where = {};
    if (category) where.category = category;
    if (lowStock === 'true') where.currentStock = { lte: prisma.inventoryItem.fields.minimumStock };
    const items = await prisma.inventoryItem.findMany({ where, orderBy: { name: 'asc' } });
    // Mark low stock
    const mapped = items.map(item => ({ ...item, isLowStock: item.currentStock <= item.minimumStock }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

// GET /api/inventory/low-stock
router.get('/low-stock', async (req, res) => {
  try {
    const items = await prisma.$queryRaw`
      SELECT * FROM "InventoryItem" WHERE "currentStock" <= "minimumStock" ORDER BY name ASC
    `;
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch low stock items' });
  }
});

// POST /api/inventory
router.post('/', async (req, res) => {
  try {
    const { name, unit, currentStock, minimumStock, costPerUnit, supplier, category, expiryDate } = req.body;
    const item = await prisma.inventoryItem.create({
      data: {
        name,
        unit: unit || 'pieces',
        currentStock: parseFloat(currentStock) || 0,
        minimumStock: parseFloat(minimumStock) || 5,
        costPerUnit: parseFloat(costPerUnit) || 0,
        supplier: supplier || null,
        category: category || 'General',
        expiryDate: expiryDate ? new Date(expiryDate) : null,
      }
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create inventory item' });
  }
});

// PUT /api/inventory/:id
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, unit, currentStock, minimumStock, costPerUnit, supplier, category, expiryDate } = req.body;
    const item = await prisma.inventoryItem.update({
      where: { id },
      data: {
        name,
        unit: unit || 'pieces',
        currentStock: parseFloat(currentStock),
        minimumStock: parseFloat(minimumStock),
        costPerUnit: parseFloat(costPerUnit),
        supplier: supplier || null,
        category: category || 'General',
        expiryDate: expiryDate ? new Date(expiryDate) : null,
      }
    });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update inventory item' });
  }
});

// POST /api/inventory/:id/restock
router.post('/:id/restock', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { quantity, note } = req.body;
    const qty = parseFloat(quantity);
    if (!qty || qty <= 0) return res.status(400).json({ error: 'Quantity must be positive' });

    const [item] = await prisma.$transaction([
      prisma.inventoryItem.update({
        where: { id },
        data: { currentStock: { increment: qty }, lastRestockedAt: new Date() }
      }),
      prisma.restockLog.create({ data: { itemId: id, quantity: qty, note: note || null } })
    ]);
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Failed to restock item' });
  }
});

// DELETE /api/inventory/:id
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.inventoryItem.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete inventory item' });
  }
});

module.exports = router;
