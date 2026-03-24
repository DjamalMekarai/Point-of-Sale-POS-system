const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/customers
router.get('/', async (req, res) => {
  try {
    const { search, tier } = req.query;
    const where = {};
    if (tier) where.loyaltyTier = tier;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }
    const customers = await prisma.customer.findMany({ where, orderBy: { lastVisit: 'desc' } });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// GET /api/customers/:id
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: { items: { include: { product: { select: { name: true } } } } }
        }
      }
    });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
});

// POST /api/customers
router.post('/', async (req, res) => {
  try {
    const { name, phone, email, birthdate, notes, tags } = req.body;
    const customer = await prisma.customer.create({
      data: {
        name,
        phone,
        email: email || null,
        birthdate: birthdate ? new Date(birthdate) : null,
        notes: notes || null,
        tags: tags || [],
      }
    });
    res.status(201).json(customer);
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'Phone number already registered' });
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

// PUT /api/customers/:id
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, phone, email, birthdate, notes, tags } = req.body;
    const customer = await prisma.customer.update({
      where: { id },
      data: { name, phone, email: email || null, birthdate: birthdate ? new Date(birthdate) : null, notes: notes || null, tags: tags || [] }
    });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update customer' });
  }
});

// POST /api/customers/:id/points — add or redeem points
router.post('/:id/points', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { delta } = req.body; // positive = add, negative = redeem
    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Customer not found' });
    const newPoints = Math.max(0, existing.loyaltyPoints + parseInt(delta));
    // Auto tier upgrade
    let tier = 'Bronze';
    if (existing.totalSpent >= 5000) tier = 'Gold';
    else if (existing.totalSpent >= 2000) tier = 'Silver';
    const customer = await prisma.customer.update({
      where: { id },
      data: { loyaltyPoints: newPoints, loyaltyTier: tier }
    });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update loyalty points' });
  }
});

module.exports = router;
