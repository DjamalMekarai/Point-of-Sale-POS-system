const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/staff
router.get('/', async (req, res) => {
  try {
    const { role, isActive } = req.query;
    const where = {};
    if (role) where.role = role;
    if (isActive !== undefined) where.isActive = isActive === 'true';
    const staff = await prisma.staff.findMany({
      where,
      select: { id: true, name: true, email: true, phone: true, role: true, avatar: true, isActive: true, hireDate: true, createdAt: true },
      orderBy: { name: 'asc' }
    });
    res.json(staff);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch staff' });
  }
});

// GET /api/staff/:id
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const member = await prisma.staff.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, phone: true, role: true, avatar: true, isActive: true, hireDate: true, permissions: true, createdAt: true }
    });
    if (!member) return res.status(404).json({ error: 'Staff not found' });
    res.json(member);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch staff member' });
  }
});

// POST /api/staff
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, role, pin, avatar, hireDate, permissions } = req.body;
    const member = await prisma.staff.create({
      data: {
        name,
        email,
        phone: phone || null,
        role: role || 'CASHIER',
        pin: pin || null,
        avatar: avatar || null,
        hireDate: hireDate ? new Date(hireDate) : new Date(),
        permissions: permissions || null,
      }
    });
    const { pin: _, ...safe } = member;
    res.status(201).json(safe);
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'Email already in use' });
    res.status(500).json({ error: 'Failed to create staff member' });
  }
});

// PUT /api/staff/:id
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, email, phone, role, pin, avatar, hireDate, permissions } = req.body;
    const data = { name, email, phone: phone || null, role, avatar: avatar || null, permissions: permissions || null };
    if (pin) data.pin = pin;
    if (hireDate) data.hireDate = new Date(hireDate);
    const member = await prisma.staff.update({ where: { id }, data });
    const { pin: _, ...safe } = member;
    res.json(safe);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update staff member' });
  }
});

// PATCH /api/staff/:id/toggle
router.patch('/:id/toggle', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const existing = await prisma.staff.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Staff not found' });
    const member = await prisma.staff.update({ where: { id }, data: { isActive: !existing.isActive } });
    const { pin: _, ...safe } = member;
    res.json(safe);
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle staff status' });
  }
});

// GET /api/staff/:id/logs
router.get('/:id/logs', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const logs = await prisma.activityLog.findMany({
      where: { staffId: id },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch activity logs' });
  }
});

// DELETE /api/staff/:id
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.staff.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete staff member' });
  }
});

module.exports = router;
