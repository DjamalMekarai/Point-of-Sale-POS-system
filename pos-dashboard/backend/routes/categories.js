const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/categories
router.get('/', async (req, res) => {
  try {
    const cats = await prisma.category.findMany({ orderBy: { displayOrder: 'asc' } });
    res.json(cats);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// POST /api/categories
router.post('/', async (req, res) => {
  try {
    const { name, nameAr, icon, color, displayOrder } = req.body;
    const cat = await prisma.category.create({
      data: { name, nameAr: nameAr || null, icon: icon || null, color: color || null, displayOrder: parseInt(displayOrder) || 0 }
    });
    res.status(201).json(cat);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// PUT /api/categories/:id
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, nameAr, icon, color, displayOrder } = req.body;
    const cat = await prisma.category.update({
      where: { id },
      data: { name, nameAr: nameAr || null, icon: icon || null, color: color || null, displayOrder: parseInt(displayOrder) || 0 }
    });
    res.json(cat);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// DELETE /api/categories/:id
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.category.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

module.exports = router;
