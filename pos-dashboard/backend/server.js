const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Static uploads
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
app.use('/uploads', express.static(uploadDir));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/products',   require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/orders',     require('./routes/orders'));
app.use('/api/tables',     require('./routes/tables'));
app.use('/api/staff',      require('./routes/staff'));
app.use('/api/inventory',  require('./routes/inventory'));
app.use('/api/customers',  require('./routes/customers'));
app.use('/api/discounts',  require('./routes/discounts'));
app.use('/api/reports',    require('./routes/reports'));
app.use('/api/settings',   require('./routes/settings'));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// ─── Error handler ────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ POS API running on http://localhost:${PORT}`);
});
