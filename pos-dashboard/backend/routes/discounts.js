const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/discounts
router.get('/', async (req, res) => {
  try {
    const discounts = await prisma.discount.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(discounts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch discounts' });
  }
});

// POST /api/discounts
router.post('/', async (req, res) => {
  try {
    const { name, code, type, value, minOrder, maxUses, itemIds, categoryIds, startTime, endTime, validDays, expiresAt } = req.body;
    const discount = await prisma.discount.create({
      data: {
        name,
        code: code || null,
        type: type || 'PERCENTAGE',
        value: parseFloat(value),
        minOrder: minOrder ? parseFloat(minOrder) : null,
        maxUses: maxUses ? parseInt(maxUses) : null,
        itemIds: itemIds || [],
        categoryIds: categoryIds || [],
        startTime: startTime || null,
        endTime: endTime || null,
        validDays: validDays || [],
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      }
    });
    res.status(201).json(discount);
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'Promo code already exists' });
    res.status(500).json({ error: 'Failed to create discount' });
  }
});

// PUT /api/discounts/:id
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, code, type, value, minOrder, maxUses, itemIds, categoryIds, startTime, endTime, validDays, expiresAt } = req.body;
    const discount = await prisma.discount.update({
      where: { id },
      data: {
        name, code: code || null, type, value: parseFloat(value),
        minOrder: minOrder ? parseFloat(minOrder) : null,
        maxUses: maxUses ? parseInt(maxUses) : null,
        itemIds: itemIds || [], categoryIds: categoryIds || [],
        startTime: startTime || null, endTime: endTime || null,
        validDays: validDays || [], expiresAt: expiresAt ? new Date(expiresAt) : null,
      }
    });
    res.json(discount);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update discount' });
  }
});

// PATCH /api/discounts/:id/toggle
router.patch('/:id/toggle', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const existing = await prisma.discount.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Discount not found' });
    const discount = await prisma.discount.update({ where: { id }, data: { isActive: !existing.isActive } });
    res.json(discount);
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle discount' });
  }
});

// POST /api/discounts/validate — validate promo code
router.post('/validate', async (req, res) => {
  try {
    const { code, orderTotal } = req.body;
    const discount = await prisma.discount.findUnique({ where: { code } });
    if (!discount || !discount.isActive) return res.status(404).json({ error: 'Invalid or inactive promo code' });
    if (discount.expiresAt && new Date() > discount.expiresAt) return res.status(400).json({ error: 'Promo code has expired' });
    if (discount.maxUses && discount.usedCount >= discount.maxUses) return res.status(400).json({ error: 'Promo code usage limit reached' });
    if (discount.minOrder && parseFloat(orderTotal) < discount.minOrder) {
      return res.status(400).json({ error: `Minimum order of ${discount.minOrder} required` });
    }
    res.json({ valid: true, discount });
  } catch (err) {
    res.status(500).json({ error: 'Failed to validate promo code' });
  }
});

// DELETE /api/discounts/:id
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.discount.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete discount' });
  }
});

module.exports = router;
