require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const products = [
  {
    name: 'UltraBook Pro 14',
    description:
      'A feather-light 14-inch laptop with a 3K display, 16GB of unified memory and all-day battery life. Built for creators who need power without the weight.',
    category: 'Laptop',
    price: 1299.99,
    stock: 15,
    rating: 4.8,
    image: '/products/ultrabook-pro.svg',
  },
  {
    name: 'PixelBook Max 16',
    description:
      'A 16-inch flagship workstation with a stunning mini-LED panel, RTX-class graphics and an ultra-quiet cooling system for heavy workloads.',
    category: 'Laptop',
    price: 1799.99,
    stock: 8,
    rating: 4.9,
    image: '/products/pixelbook-max.svg',
  },
  {
    name: 'ThinkBook Air 13',
    description:
      'Lightweight, durable and incredibly affordable. The ThinkBook Air is perfect for students and everyday productivity with 12 hours of battery.',
    category: 'Laptop',
    price: 899.99,
    stock: 22,
    rating: 4.5,
    image: '/products/thinkbook-air.svg',
  },
  {
    name: 'NovaPhone 15 Pro',
    description:
      'A pro-grade smartphone featuring a 120Hz OLED display, triple-lens camera system and an industry-leading 5,000mAh battery.',
    category: 'Smartphone',
    price: 999.99,
    stock: 30,
    rating: 4.7,
    image: '/products/novaphone-pro.svg',
  },
  {
    name: 'NovaPhone SE',
    description:
      'All the essentials, beautifully designed. A compact smartphone with a brilliant display, great camera and two-day battery life.',
    category: 'Smartphone',
    price: 499.99,
    stock: 45,
    rating: 4.4,
    image: '/products/novaphone-se.svg',
  },
  {
    name: 'GalaxyNote Ultra',
    description:
      'A note-taking powerhouse with an S-Pen, crystal-clear display and flagship performance for multitaskers and creatives.',
    category: 'Smartphone',
    price: 1199.99,
    stock: 12,
    rating: 4.6,
    image: '/products/galaxynote-ultra.svg',
  },
  {
    name: 'AuraBuds Pro',
    description:
      'Wireless earbuds with adaptive noise cancellation, spatial audio and a comfortable ergonomic fit for all-day listening.',
    category: 'Headphones',
    price: 199.99,
    stock: 60,
    rating: 4.6,
    image: '/products/aurabuds-pro.svg',
  },
  {
    name: 'SoundMax Wireless',
    description:
      'Over-ear wireless headphones delivering punchy bass and crystal-clear vocals, with a 40-hour playtime and plush cushioning.',
    category: 'Headphones',
    price: 129.99,
    stock: 55,
    rating: 4.3,
    image: '/products/soundmax-wireless.svg',
  },
  {
    name: 'StudioTone ANC',
    description:
      'Premium studio-grade headphones with advanced hybrid noise cancellation and a balanced, reference-grade sound profile.',
    category: 'Headphones',
    price: 349.99,
    stock: 18,
    rating: 4.9,
    image: '/products/studiotone-anc.svg',
  },
  {
    name: 'HyperCharge 65W GaN',
    description:
      'A compact 65W GaN wall charger that powers your laptop, phone and tablet simultaneously from a single plug.',
    category: 'Accessories',
    price: 49.99,
    stock: 100,
    rating: 4.5,
    image: '/products/hypercharge-gan.svg',
  },
  {
    name: 'WaveKey Mechanical Keyboard',
    description:
      'A tactile mechanical keyboard with hot-swappable switches, per-key RGB and a minimal aluminium frame.',
    category: 'Accessories',
    price: 79.99,
    stock: 40,
    rating: 4.7,
    image: '/products/wavekey-keyboard.svg',
  },
  {
    name: 'GlideMouse Pro',
    description:
      'An ultra-precise wireless mouse with a 4K optical sensor, silent clicks and 90 days of battery life.',
    category: 'Accessories',
    price: 39.99,
    stock: 85,
    rating: 4.4,
    image: '/products/glidemouse-pro.svg',
  },
];

async function main() {
  console.log('Seeding database...');

  const customer = await prisma.user.upsert({
    where: { email: 'demo@shopsphere.com' },
    update: {},
    create: {
      firstName: 'Demo',
      lastName: 'User',
      email: 'demo@shopsphere.com',
      password: await bcrypt.hash('password123', 10),
      role: 'customer',
    },
  });
  console.log(`Customer ready: ${customer.email}`);

  const seller = await prisma.user.upsert({
    where: { email: 'seller@shopsphere.com' },
    update: {},
    create: {
      firstName: 'Demo',
      lastName: 'Seller',
      email: 'seller@shopsphere.com',
      password: await bcrypt.hash('password123', 10),
      role: 'seller',
    },
  });
  console.log(`Seller ready: ${seller.email}`);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@shopsphere.com' },
    update: {},
    create: {
      firstName: 'Demo',
      lastName: 'Admin',
      email: 'admin@shopsphere.com',
      password: await bcrypt.hash('password123', 10),
      role: 'admin',
    },
  });
  console.log(`Admin ready: ${admin.email}`);

  for (let index = 0; index < products.length; index++) {
    const product = products[index];
    const existing = await prisma.product.findFirst({
      where: { name: product.name },
    });

    const data = {
      ...product,
      sellerId: index < 3 ? seller.id : null,
    };

    if (existing) {
      await prisma.product.update({
        where: { id: existing.id },
        data,
      });
    } else {
      await prisma.product.create({ data });
    }
  }

  const count = await prisma.product.count();
  console.log(`Products ready: ${count}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
