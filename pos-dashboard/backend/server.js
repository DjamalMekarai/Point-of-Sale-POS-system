const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure upload directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});

const upload = multer({ storage });

// ------------- API Endpoints -------------

// GET /api/products
app.get('/api/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    });
    // Append full URL for accessible images
    const mapped = products.map(p => ({
      ...p,
      image: p.image && p.image !== 'null' ? `http://localhost:${process.env.PORT || 5000}/uploads/${p.image}` : null
    }));
    res.json(mapped);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error while fetching products' });
  }
});

// POST /api/products
// We use upload.any() defensively in case the form appends multiple fields or renames it
app.post('/api/products', upload.any(), async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;
    
    // Inspect uploaded files
    const file = req.files && req.files.length > 0 ? req.files[0] : null;

    const product = await prisma.product.create({
      data: {
        name: name || "Unnamed Product",
        description: description || null,
        price: parseFloat(price) || 0,
        category: category || "Uncategorized",
        stock: parseInt(stock, 10) || 0,
        image: file ? file.filename : null,
      }
    });

    // append URL path 
    const mappedProduct = {
        ...product,
        image: product.image ? `http://localhost:${process.env.PORT || 5000}/uploads/${product.image}` : null
    };

    res.status(201).json(mappedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error while creating product' });
  }
});

// PUT /api/products/:id
app.put('/api/products/:id', upload.any(), async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, description, price, category, stock } = req.body;
    
    const file = req.files && req.files.length > 0 ? req.files[0] : null;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Product not found' });

    let imageFileName = existing.image;
    
    // If a new photo is physically attached
    if (file) {
      imageFileName = file.filename;
      // Optionally clean up Old image
      if (existing.image && typeof existing.image === 'string' && existing.image !== 'null') {
        fs.unlink(path.join(uploadDir, existing.image), (err) => {
          if (err) console.error("Failed to delete old image:", err);
        });
      }
    } else {
        // If frontend removed the photo via a string representation "null" or null
        // we could potentially parse `req.body.photo` or similar if needed.
        // For now, if no physical file replaces it, we keep the previous one unless explicitly ordered to drop it.
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name: name || existing.name,
        description: description || null,
        price: price ? parseFloat(price) : existing.price,
        category: category || existing.category,
        stock: stock ? parseInt(stock, 10) : existing.stock,
        image: imageFileName,
      }
    });

    const mappedProduct = {
      ...updated,
      image: updated.image ? `http://localhost:${process.env.PORT || 5000}/uploads/${updated.image}` : null
    };

    res.json(mappedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error while updating product' });
  }
});

// DELETE /api/products/:id
app.delete('/api/products/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Product not found' });

    if (existing.image && existing.image !== 'null') {
      fs.unlink(path.join(uploadDir, existing.image), (err) => {
        if (err) console.error("Failed to delete image physical file:", err);
      });
    }

    await prisma.product.delete({ where: { id } });
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error while deleting product' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend POS API listening exactly on port ${PORT}`);
});
