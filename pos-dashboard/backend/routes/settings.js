const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/settings
router.get('/', async (req, res) => {
  try {
    let settings = await prisma.settings.findUnique({ where: { id: 1 } });
    if (!settings) {
      settings = await prisma.settings.create({ data: { id: 1 } });
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// PUT /api/settings
router.put('/', async (req, res) => {
  try {
    const { cafeName, logo, address, phone, taxRate, taxInclusive, currency, receiptHeader, receiptFooter, openingHours } = req.body;
    const settings = await prisma.settings.upsert({
      where: { id: 1 },
      create: {
        id: 1, cafeName, logo, address, phone,
        taxRate: parseFloat(taxRate) || 19,
        taxInclusive: taxInclusive || false,
        currency: currency || 'DZD',
        receiptHeader, receiptFooter, openingHours
      },
      update: {
        cafeName, logo, address, phone,
        taxRate: parseFloat(taxRate) || 19,
        taxInclusive: taxInclusive || false,
        currency: currency || 'DZD',
        receiptHeader, receiptFooter, openingHours
      }
    });
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

module.exports = router;
