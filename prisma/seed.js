const { PrismaClient } = require('@prisma/client');
const categories = require('../database/seeds/categories.json');

const prisma = new PrismaClient();

async function main() {
  // Clear existing categories and subcategories
  await prisma.subcategory.deleteMany();
  await prisma.category.deleteMany();

  for (const category of categories) {
    await prisma.category.create({
      data: {
        id: category.id,
        name: category.name,
        subcategories: {
          create: category.subcategories.map(sub => ({
            id: sub.id,
            name: sub.name,
            slug: sub.slug,
          })),
        },
      },
    });
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
