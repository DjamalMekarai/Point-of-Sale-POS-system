const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. CLEAR EXISTING DATA (ORDER MATTERS)
  await prisma.activityLog.deleteMany();
  await prisma.restockLog.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.table.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.discount.deleteMany();
  await prisma.settings.deleteMany();

  // 2. SETTINGS
  await prisma.settings.create({
    data: {
      id: 1,
      cafeName: 'Green Grounds Cafe',
      logo: 'https://images.unsplash.com/photo-1501339819358-ee83aea5ad2f?w=400&h=400&fit=crop',
      address: 'Lot 108, Draria, Algiers, Algeria',
      phone: '+213 555 12 34 56',
      taxRate: 19.0,
      taxInclusive: false,
      currency: 'DZD',
      receiptHeader: 'Welcome to Green Grounds!',
      receiptFooter: 'Follow us @greengrounds_dz',
      openingHours: { sat_thu: '07:00 - 23:00', fri: '14:00 - 00:00' }
    }
  });

  // 3. CATEGORIES
  await Promise.all([
    prisma.category.create({ data: { name: 'Espresso Bar',      icon: '☕', color: '#343e2c', displayOrder: 1 } }),
    prisma.category.create({ data: { name: 'Signature Lattes',  icon: '✨', color: '#4C6B50', displayOrder: 2 } }),
    prisma.category.create({ data: { name: 'Pastries',          icon: '🥐', color: '#D4A373', displayOrder: 3 } }),
    prisma.category.create({ data: { name: 'Cold Brews',        icon: '🧊', color: '#A3B18A', displayOrder: 4 } }),
  ]);

  // 4. PRODUCTS  (use `preparationTime`, no `prepTime` or `isFeatured`)
  await prisma.product.createMany({
    data: [
      {
        name: 'Classic Espresso', categoryName: 'Espresso Bar', price: 150,
        image: 'https://images.unsplash.com/photo-1510707577719-f7c181f8e09b?w=400',
        stock: 999, isAvailable: true, preparationTime: 3, displayOrder: 1,
      },
      {
        name: 'Cappuccino', categoryName: 'Espresso Bar', price: 280,
        image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53a?w=400',
        stock: 999, isAvailable: true, preparationTime: 5, displayOrder: 2,
      },
      {
        name: 'Americano', categoryName: 'Espresso Bar', price: 200,
        image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=400',
        stock: 999, isAvailable: true, preparationTime: 4, displayOrder: 3,
      },
      {
        name: 'Spanish Latte', categoryName: 'Signature Lattes', price: 450,
        image: 'https://images.unsplash.com/photo-1541167760496-162955ed8a9f?w=400',
        stock: 999, isAvailable: true, preparationTime: 7, displayOrder: 1,
        tags: ['Featured', 'Best Seller'],
      },
      {
        name: 'Matcha Latte', categoryName: 'Signature Lattes', price: 420,
        image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=400',
        stock: 999, isAvailable: true, preparationTime: 6, displayOrder: 2,
      },
      {
        name: 'Butter Croissant', categoryName: 'Pastries', price: 220,
        image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400',
        stock: 15, isAvailable: true, preparationTime: 1, displayOrder: 1,
      },
      {
        name: 'Pistachio Cronut', categoryName: 'Pastries', price: 380,
        image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400',
        stock: 8, isAvailable: true, preparationTime: 2, displayOrder: 2,
        tags: ['Sweet', 'Best Seller'],
      },
      {
        name: 'Nitro Cold Brew', categoryName: 'Cold Brews', price: 550,
        image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400',
        stock: 20, isAvailable: true, preparationTime: 3, displayOrder: 1,
      },
      {
        name: 'Iced Vanilla Brew', categoryName: 'Cold Brews', price: 480,
        image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400',
        stock: 20, isAvailable: true, preparationTime: 4, displayOrder: 2,
      },
    ]
  });

  // 5. TABLES
  await prisma.table.createMany({
    data: [
      { number: 'T01', zone: 'Indoor Window', capacity: 2, status: 'AVAILABLE', posX: 10, posY: 10 },
      { number: 'T02', zone: 'Indoor Main',   capacity: 4, status: 'OCCUPIED',  posX: 30, posY: 10 },
      { number: 'T03', zone: 'Indoor Main',   capacity: 4, status: 'AVAILABLE', posX: 50, posY: 10 },
      { number: 'V01', zone: 'VIP Lounge',    capacity: 6, status: 'RESERVED',  posX: 10, posY: 40 },
      { number: 'O01', zone: 'Terrace',       capacity: 4, status: 'AVAILABLE', posX: 30, posY: 60 },
    ]
  });

  // 6. STAFF
  await prisma.staff.createMany({
    data: [
      { name: 'Amine Admin',   email: 'amine@greengrounds.com', role: 'ADMIN',   pin: '1234', isActive: true },
      { name: 'Sarah Barista', email: 'sarah@greengrounds.com', role: 'BARISTA', pin: '0000', isActive: true },
      { name: 'Yacine Waiter', email: 'yacine@greengrounds.com',role: 'WAITER',  pin: '1111', isActive: true },
    ]
  });

  // 7. CUSTOMERS
  await prisma.customer.createMany({
    data: [
      { name: 'Karim Benali',   phone: '0550123456', loyaltyTier: 'Gold',   loyaltyPoints: 1250, totalSpent: 15000 },
      { name: 'Lydia Mansouri', phone: '0661987654', loyaltyTier: 'Bronze', loyaltyPoints: 150,  totalSpent: 2200 },
      { name: 'Djamal Mekarai', phone: '0770456789', loyaltyTier: 'Silver', loyaltyPoints: 540,  totalSpent: 7800 },
    ]
  });

  // 8. DISCOUNTS
  await prisma.discount.createMany({
    data: [
      { name: 'Opening Special', code: 'GROW10',  type: 'PERCENTAGE',  value: 10,  minOrder: 500, isActive: true },
      { name: 'Happy Hour',      type: 'FIXED_AMOUNT', value: 100, startTime: '16:00', endTime: '18:00', validDays: [1, 2, 3], isActive: true },
    ]
  });

  // 9. INVENTORY
  await prisma.inventoryItem.createMany({
    data: [
      { name: 'Arabica Beans',  category: 'Coffee & Beans', currentStock: 25.5, minimumStock: 5.0,  unit: 'kg',  costPerUnit: 1200, supplier: 'GreenSource Imports' },
      { name: 'Whole Milk',     category: 'Dairy',          currentStock: 12.0, minimumStock: 6.0,  unit: 'L',   costPerUnit: 95,   supplier: 'Local Dairy' },
      { name: 'Vanilla Syrup',  category: 'Syrups',         currentStock: 3.0,  minimumStock: 1.0,  unit: 'box', costPerUnit: 2400 },
      { name: 'Croissant Dough',category: 'Bakery',         currentStock: 20.0, minimumStock: 10.0, unit: 'pcs', costPerUnit: 80,   supplier: 'Boulangerie Atlas' },
    ]
  });

  // 10. GENERATE HISTORICAL ORDERS (Last 7 Days)
  const products = await prisma.product.findMany();
  const staff = await prisma.staff.findFirst({ where: { role: 'BARISTA' } });
  const orderTypes = ['DINE_IN', 'TAKEAWAY', 'DELIVERY'];

  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    const dailyCount = Math.floor(Math.random() * 6) + 4;

    for (let j = 0; j < dailyCount; j++) {
      const orderTime = new Date(date);
      orderTime.setHours(Math.floor(Math.random() * 12) + 8, Math.floor(Math.random() * 60));

      const randomProduct = products[Math.floor(Math.random() * products.length)];
      const qty = Math.floor(Math.random() * 2) + 1;
      const subtotal = Number(randomProduct.price) * qty;
      const tax = subtotal * 0.19;

      await prisma.order.create({
        data: {
          orderNumber: `ORD-${Date.now()}-${i}-${j}`,
          status: 'SERVED',
          type: orderTypes[Math.floor(Math.random() * orderTypes.length)],
          subtotal,
          tax,
          total: subtotal + tax,
          staffId: staff?.id,
          createdAt: orderTime,
          items: {
            create: [{
              productId: randomProduct.id,
              quantity: qty,
              unitPrice: randomProduct.price,
            }]
          }
        }
      });
    }
  }

  console.log('✅ Seeding complete! Database is now populated with sample data.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
