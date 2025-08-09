const express = require('express');
const { prisma } = require('../db/prisma');
const seedData = require('../../database/seeds/categories.json');

const router = express.Router();

// GET /api/catalog/categories
router.get('/categories', async (req, res, next) => {
  try {
    const count = await prisma.category.count();
    if (count === 0) {
      for (const cat of seedData) {
        await prisma.category.create({
          data: {
            name: cat.name,
            subcategories: {
              create: cat.subcategories.map(sc => ({ name: sc.name, slug: sc.slug })),
            },
          },
        });
      }
    }
    const categories = await prisma.category.findMany({
      include: { subcategories: true },
      orderBy: { id: 'asc' },
    });
    res.json(categories);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
