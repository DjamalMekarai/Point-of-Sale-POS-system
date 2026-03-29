const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});
const upload = multer({ storage });

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

function mapImg(p) {
  if (!p.image || p.image === 'null') return { ...p, image: null };
  // If it's already a full URL (e.g. Unsplash), leave it as-is
  if (p.image.startsWith('http://') || p.image.startsWith('https://')) {
    return p;
  }
  // Otherwise it's a local upload filename — prepend server URL
  return { ...p, image: `${BASE_URL}/uploads/${p.image}` };
}


// GET /api/products
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    const where = {};
    if (category) where.categoryName = category;
    if (search) where.name = { contains: search, mode: 'insensitive' };
    const products = await prisma.product.findMany({
      where,
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }]
    });
    res.json(products.map(mapImg));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// POST /api/products
router.post('/', upload.any(), async (req, res) => {
  try {
    const { name, nameAr, nameFr, description, price, categoryId, categoryName, stock, isAvailable, preparationTime, calories, tags, barcode } = req.body;
    const file = req.files?.[0] || null;
    const product = await prisma.product.create({
      data: {
        name: name || 'Unnamed',
        nameAr: nameAr || null,
        nameFr: nameFr || null,
        description: description || null,
        price: parseFloat(price) || 0,
        categoryId: categoryId ? parseInt(categoryId) : null,
        categoryName: categoryName || 'Uncategorized',
        stock: parseInt(stock) || 0,
        image: file ? file.filename : null,
        isAvailable: isAvailable === 'false' ? false : true,
        preparationTime: parseInt(preparationTime) || 5,
        calories: calories ? parseInt(calories) : null,
        tags: tags ? JSON.parse(tags) : [],
        barcode: barcode || null,
      }
    });
    res.status(201).json(mapImg(product));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// PUT /api/products/:id
router.put('/:id', upload.any(), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, nameAr, nameFr, description, price, categoryId, categoryName, stock, isAvailable, preparationTime, calories, tags, barcode } = req.body;
    const file = req.files?.[0] || null;
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Product not found' });

    let imageFileName = existing.image;
    if (file) {
      imageFileName = file.filename;
      if (existing.image && existing.image !== 'null') {
        fs.unlink(path.join(uploadDir, existing.image), () => {});
      }
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name: name || existing.name,
        nameAr: nameAr ?? existing.nameAr,
        nameFr: nameFr ?? existing.nameFr,
        description: description ?? existing.description,
        price: price ? parseFloat(price) : existing.price,
        categoryId: categoryId ? parseInt(categoryId) : existing.categoryId,
        categoryName: categoryName || existing.categoryName,
        stock: stock !== undefined ? parseInt(stock) : existing.stock,
        image: imageFileName,
        isAvailable: isAvailable !== undefined ? isAvailable === 'true' || isAvailable === true : existing.isAvailable,
        preparationTime: preparationTime ? parseInt(preparationTime) : existing.preparationTime,
        calories: calories ? parseInt(calories) : existing.calories,
        tags: tags ? JSON.parse(tags) : existing.tags,
        barcode: barcode ?? existing.barcode,
      }
    });
    res.json(mapImg(updated));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// PATCH /api/products/:id/toggle — toggle isAvailable
router.patch('/:id/toggle', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Product not found' });
    const updated = await prisma.product.update({
      where: { id },
      data: { isAvailable: !existing.isAvailable }
    });
    res.json(mapImg(updated));
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle product' });
  }
});

// DELETE /api/products/:id
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Product not found' });
    if (existing.image && existing.image !== 'null') {
      fs.unlink(path.join(uploadDir, existing.image), () => {});
    }
    await prisma.product.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

module.exports = router;
