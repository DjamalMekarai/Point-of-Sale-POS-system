const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. CLEAR EXISTING DATA (ORDER MATTERS)
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
      openingHours: 'Sat-Thu: 07:00 - 23:00\nFri: 14:00 - 00:00'
    }
  });

  // 3. CATEGORIES
  const cats = await Promise.all([
    prisma.category.create({ data: { name: 'Espresso Bar', icon: '☕', color: '#343e2c' } }),
    prisma.category.create({ data: { name: 'Signature Lattes', icon: '✨', color: '#4C6B50' } }),
    prisma.category.create({ data: { name: 'Pastries', icon: '🥐', color: '#D4A373' } }),
    prisma.category.create({ data: { name: 'Cold Brews', icon: '🧊', color: '#A3B18A' } }),
  ]);

  // 4. PRODUCTS
  await prisma.product.createMany({
    data: [
      { 
        name: 'Classic Espresso', categoryName: 'Espresso Bar', price: 150, 
        image: 'https://images.unsplash.com/photo-1510707577719-f7c181f8e09b?w=400',
        stock: 999, isAvailable: true, prepTime: 3
      },
      { 
        name: 'Cappuccino', categoryName: 'Espresso Bar', price: 280, 
        image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53a?w=400',
        stock: 999, isAvailable: true, prepTime: 5
      },
      { 
        name: 'Spanish Latte', categoryName: 'Signature Lattes', price: 450, 
        image: 'https://images.unsplash.com/photo-1541167760496-162955ed8a9f?w=400',
        stock: 999, isAvailable: true, prepTime: 7, isFeatured: true
      },
      { 
        name: 'Butter Croissant', categoryName: 'Pastries', price: 220, 
        image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400',
        stock: 15, isAvailable: true, prepTime: 1
      },
      { 
        name: 'Pistachio Cronut', categoryName: 'Pastries', price: 380, 
        image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400',
        stock: 8, isAvailable: true, prepTime: 2, tags: ['Sweet', 'Best Seller']
      },
      { 
        name: 'Nitro Cold Brew', categoryName: 'Cold Brews', price: 550, 
        image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400',
        stock: 20, isAvailable: true, prepTime: 3
      },
    ]
  });

  // 5. TABLES
  await prisma.table.createMany({
    data: [
      { number: 'T01', zone: 'Indoor Window', capacity: 2, status: 'AVAILABLE', posX: 10, posY: 10 },
      { number: 'T02', zone: 'Indoor Main', capacity: 4, status: 'OCCUPIED', posX: 30, posY: 10 },
      { number: 'T03', zone: 'Indoor Main', capacity: 4, status: 'AVAILABLE', posX: 50, posY: 10 },
      { number: 'V01', zone: 'VIP Lounge', capacity: 6, status: 'RESERVED', posX: 10, posY: 40 },
      { number: 'O01', zone: 'Terrace', capacity: 4, status: 'AVAILABLE', posX: 30, posY: 60 },
    ]
  });

  // 6. STAFF
  await prisma.staff.createMany({
    data: [
      { name: 'Amine Admin', email: 'amine@greengrounds.com', role: 'ADMIN', pin: '1234', isActive: true },
      { name: 'Sarah Barista', email: 'sarah@greengrounds.com', role: 'BARISTA', pin: '0000', isActive: true },
    ]
  });

  // 7. CUSTOMERS
  await prisma.customer.createMany({
    data: [
      { name: 'Karim Benali', phone: '0550123456', loyaltyTier: 'Gold', loyaltyPoints: 1250, totalSpent: 15000 },
      { name: 'Lydia Mansouri', phone: '0661987654', loyaltyTier: 'Bronze', loyaltyPoints: 150, totalSpent: 2200 },
    ]
  });

  // 8. DISCOUNTS
  await prisma.discount.createMany({
    data: [
      { name: 'Opening Special', code: 'GROW10', type: 'PERCENTAGE', value: 10, minOrder: 500, isActive: true },
      { name: 'Happy Hour', type: 'FIXED_AMOUNT', value: 100, startTime: '16:00', endTime: '18:00', validDays: [1, 2, 3], isActive: true },
    ]
  });

  // 9. INVENTORY
  await prisma.inventoryItem.createMany({
    data: [
      { name: 'Arabica Beans', category: 'Coffee & Beans', currentStock: 25.5, minimumStock: 5.0, unit: 'kg', costPerUnit: 1200, supplier: 'GreenSource Imports' },
      { name: 'Whole Milk', category: 'Dairy', currentStock: 12.0, minimumStock: 6.0, unit: 'L', costPerUnit: 95, supplier: 'Local Dairy' },
      { name: 'Vanilla Syrup', category: 'Syrups', currentStock: 3.0, minimumStock: 1.0, unit: 'box', costPerUnit: 2400 },
    ]
  });

  // 10. GENERATE HISTORICAL ORDERS (Last 7 Days)
  const productsResult = await prisma.product.findMany();
  const staff = await prisma.staff.findFirst({ where: { role: 'BARISTA' } });
  const paymentMethods = ['CASH', 'CARD'];
  const orderTypes = ['DINE_IN', 'TAKEAWAY', 'DELIVERY'];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Create ~5-10 orders per day
    const dailyCount = Math.floor(Math.random() * 6) + 4;
    
    for (let j = 0; j < dailyCount; j++) {
       const orderTime = new Date(date);
       orderTime.setHours(Math.floor(Math.random() * 12) + 8, Math.floor(Math.random() * 60));

       const randomProduct = productsResult[Math.floor(Math.random() * productsResult.length)];
       const qty = Math.floor(Math.random() * 2) + 1;
       const subtotal = Number(randomProduct.price) * qty;
       const tax = subtotal * 0.19;
       
       await prisma.order.create({
         data: {
           orderNumber: `ORD-${i}-${j}-${Math.floor(Math.random() * 900)}`,
           status: 'SERVED',
           type: orderTypes[Math.floor(Math.random() * orderTypes.length)],
           paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
           subtotal,
           tax,
           total: subtotal + tax,
           staffId: staff.id,
           createdAt: orderTime,
           items: {
             create: [
               {
                 productId: randomProduct.id,
                 quantity: qty,
                 unitPrice: randomProduct.price,
               }
             ]
           }
         }
       });
    }
  }

  console.log('✅ Seeding complete! Database is now populated with history.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
