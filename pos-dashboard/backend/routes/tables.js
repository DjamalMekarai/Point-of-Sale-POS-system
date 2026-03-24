const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/tables
router.get('/', async (req, res) => {
  try {
    const tables = await prisma.table.findMany({
      orderBy: { number: 'asc' },
      include: {
        orders: {
          where: { status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'READY', 'SERVED'] } },
          select: { id: true, orderNumber: true, status: true, total: true, createdAt: true }
        }
      }
    });
    res.json(tables);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tables' });
  }
});

// POST /api/tables
router.post('/', async (req, res) => {
  try {
    const { number, zone, capacity, posX, posY } = req.body;
    const table = await prisma.table.create({
      data: {
        number,
        zone: zone || 'Indoor',
        capacity: parseInt(capacity) || 4,
        posX: posX ? parseFloat(posX) : null,
        posY: posY ? parseFloat(posY) : null,
      }
    });
    res.status(201).json(table);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create table' });
  }
});

// PUT /api/tables/:id
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { number, zone, capacity, posX, posY } = req.body;
    const table = await prisma.table.update({
      where: { id },
      data: {
        number,
        zone: zone || 'Indoor',
        capacity: parseInt(capacity) || 4,
        posX: posX ? parseFloat(posX) : null,
        posY: posY ? parseFloat(posY) : null,
      }
    });
    res.json(table);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update table' });
  }
});

// PATCH /api/tables/:id/status
router.patch('/:id/status', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    const table = await prisma.table.update({ where: { id }, data: { status } });
    res.json(table);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update table status' });
  }
});

// DELETE /api/tables/:id
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.table.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete table' });
  }
});

module.exports = router;
