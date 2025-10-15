import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const products = [
  {
    name: "Wireless Bluetooth Headphones",
    description: "Premium noise-cancelling headphones with 30-hour battery life",
    category: "Electronics",
    price: 149.99,
    tags: ["audio", "wireless", "bluetooth", "noise-cancelling"],
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
  },
  {
    name: "Smart Watch Series 5",
    description: "Fitness tracker with heart rate monitor and GPS",
    category: "Electronics",
    price: 299.99,
    tags: ["wearable", "fitness", "smartwatch", "gps"],
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
  },
  {
    name: "Ergonomic Office Chair",
    description: "Adjustable lumbar support and breathable mesh back",
    category: "Furniture",
    price: 249.99,
    tags: ["office", "ergonomic", "chair", "furniture"],
    imageUrl: "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=500",
  },
  {
    name: "Mechanical Gaming Keyboard",
    description: "RGB backlit mechanical keyboard with tactile switches",
    category: "Electronics",
    price: 129.99,
    tags: ["gaming", "keyboard", "rgb", "mechanical"],
    imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500",
  },
  {
    name: "4K Webcam Pro",
    description: "Ultra HD webcam with auto-focus and built-in microphone",
    category: "Electronics",
    price: 89.99,
    tags: ["webcam", "4k", "streaming", "video"],
    imageUrl: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=500",
  },
  {
    name: "Leather Laptop Bag",
    description: "Premium genuine leather bag fits up to 15-inch laptops",
    category: "Accessories",
    price: 79.99,
    tags: ["leather", "bag", "laptop", "accessories"],
    imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500",
  },
  {
    name: "Standing Desk Converter",
    description: "Adjustable height desk converter for ergonomic workspace",
    category: "Furniture",
    price: 199.99,
    tags: ["desk", "standing", "ergonomic", "furniture"],
    imageUrl: "https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=500",
  },
  {
    name: "USB-C Docking Station",
    description: "12-in-1 hub with dual HDMI, ethernet, and SD card reader",
    category: "Electronics",
    price: 69.99,
    tags: ["usb-c", "hub", "docking", "accessories"],
    imageUrl: "https://images.unsplash.com/photo-1625948515291-69613efd103f?w=500",
  },
  {
    name: "Wireless Mouse Pro",
    description: "Precision wireless mouse with ergonomic design",
    category: "Electronics",
    price: 49.99,
    tags: ["mouse", "wireless", "ergonomic", "accessories"],
    imageUrl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500",
  },
  {
    name: "LED Desk Lamp",
    description: "Adjustable brightness LED lamp with USB charging port",
    category: "Furniture",
    price: 39.99,
    tags: ["lamp", "led", "desk", "lighting"],
    imageUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500",
  },
  {
    name: "Portable SSD 1TB",
    description: "High-speed external storage with USB-C interface",
    category: "Electronics",
    price: 119.99,
    tags: ["storage", "ssd", "portable", "usb-c"],
    imageUrl: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500",
  },
  {
    name: "Noise Cancelling Earbuds",
    description: "True wireless earbuds with active noise cancellation",
    category: "Electronics",
    price: 179.99,
    tags: ["earbuds", "wireless", "noise-cancelling", "audio"],
    imageUrl: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500",
  },
  {
    name: "Monitor Stand Organizer",
    description: "Bamboo monitor stand with storage compartments",
    category: "Furniture",
    price: 44.99,
    tags: ["monitor", "stand", "organizer", "bamboo"],
    imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500",
  },
  {
    name: "Webcam Light Ring",
    description: "Clip-on LED ring light for video calls and streaming",
    category: "Accessories",
    price: 29.99,
    tags: ["lighting", "webcam", "ring-light", "streaming"],
    imageUrl: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=500",
  },
  {
    name: "Cable Management Kit",
    description: "Complete cable organization solution for desks",
    category: "Accessories",
    price: 19.99,
    tags: ["cable", "organization", "management", "desk"],
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500",
  },
  {
    name: "Laptop Cooling Pad",
    description: "Adjustable laptop cooler with 6 quiet fans",
    category: "Accessories",
    price: 34.99,
    tags: ["cooling", "laptop", "fan", "accessories"],
    imageUrl: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=500",
  },
  {
    name: "Bluetooth Speaker",
    description: "Portable waterproof speaker with 12-hour battery",
    category: "Electronics",
    price: 59.99,
    tags: ["speaker", "bluetooth", "portable", "waterproof"],
    imageUrl: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500",
  },
  {
    name: "Desk Organizer Set",
    description: "5-piece wooden desk organizer set",
    category: "Accessories",
    price: 24.99,
    tags: ["organizer", "desk", "wooden", "accessories"],
    imageUrl: "https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?w=500",
  },
  {
    name: "Wireless Charger Pad",
    description: "Fast wireless charging pad for Qi-enabled devices",
    category: "Electronics",
    price: 27.99,
    tags: ["wireless", "charger", "qi", "fast-charging"],
    imageUrl: "https://images.unsplash.com/photo-1591290619762-d6bd4e1e6c1c?w=500",
  },
  {
    name: "Footrest Under Desk",
    description: "Ergonomic footrest with massage texture",
    category: "Furniture",
    price: 32.99,
    tags: ["footrest", "ergonomic", "massage", "comfort"],
    imageUrl: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=500",
  },
  {
    name: "HD Monitor 27-inch",
    description: "Ultra-thin bezel 27-inch Full HD IPS monitor",
    category: "Electronics",
    price: 279.99,
    tags: ["monitor", "display", "hd", "ips"],
    imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500",
  },
  {
    name: "Adjustable Laptop Stand",
    description: "Aluminum laptop stand with 360° rotation",
    category: "Accessories",
    price: 39.99,
    tags: ["laptop", "stand", "aluminum", "adjustable"],
    imageUrl: "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=500",
  },
  {
    name: "Graphics Tablet",
    description: "Digital drawing tablet with pressure-sensitive pen",
    category: "Electronics",
    price: 189.99,
    tags: ["drawing", "tablet", "graphics", "digital-art"],
    imageUrl: "https://images.unsplash.com/photo-1576097449798-7c7f90e1248a?w=500",
  },
  {
    name: "Smart Plug 4-Pack",
    description: "WiFi-enabled smart plugs with voice control",
    category: "Electronics",
    price: 44.99,
    tags: ["smart-home", "wifi", "plug", "automation"],
    imageUrl: "https://images.unsplash.com/photo-1558089687-4d3b9d9d9a9d?w=500",
  },
  {
    name: "Wrist Rest Pad Set",
    description: "Memory foam wrist rest for keyboard and mouse",
    category: "Accessories",
    price: 16.99,
    tags: ["wrist-rest", "ergonomic", "memory-foam", "comfort"],
    imageUrl: "https://images.unsplash.com/photo-1595241919510-64c8efa6e6e8?w=500",
  },
  {
    name: "Portable Power Bank 20000mAh",
    description: "High-capacity power bank with fast charging",
    category: "Electronics",
    price: 42.99,
    tags: ["power-bank", "portable", "charging", "battery"],
    imageUrl: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500",
  },
  {
    name: "Mesh File Organizer",
    description: "Desktop file organizer with 5 compartments",
    category: "Accessories",
    price: 21.99,
    tags: ["organizer", "file", "mesh", "desktop"],
    imageUrl: "https://images.unsplash.com/photo-1584552332309-26a2e1e4e880?w=500",
  },
  {
    name: "USB Microphone",
    description: "Professional USB condenser microphone for streaming",
    category: "Electronics",
    price: 99.99,
    tags: ["microphone", "usb", "streaming", "recording"],
    imageUrl: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=500",
  },
  {
    name: "Blue Light Blocking Glasses",
    description: "Computer glasses that reduce eye strain",
    category: "Accessories",
    price: 24.99,
    tags: ["glasses", "blue-light", "eye-protection", "health"],
    imageUrl: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=500",
  },
  {
    name: "Desk Mat Extended",
    description: "Large waterproof desk mat with stitched edges",
    category: "Accessories",
    price: 18.99,
    tags: ["desk-mat", "mouse-pad", "extended", "waterproof"],
    imageUrl: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=500",
  },
];

async function main() {
  console.log('🌱 Starting seed...');

  // Create test user
  const hashedPassword = await bcrypt.hash('password123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
      password: hashedPassword,
    },
  });

  console.log('✅ Created test user:', user.email);

  // Create products
  for (const product of products) {
    await prisma.product.create({
      data: product,
    });
  }

  console.log(`✅ Created ${products.length} products`);

  // Create some sample interactions
  const allProducts = await prisma.product.findMany();
  const sampleInteractions = [
    { productId: allProducts[0].id, type: 'view' },
    { productId: allProducts[1].id, type: 'view' },
    { productId: allProducts[3].id, type: 'like' },
    { productId: allProducts[0].id, type: 'click' },
    { productId: allProducts[10].id, type: 'view' },
  ];

  for (const interaction of sampleInteractions) {
    await prisma.userInteraction.create({
      data: {
        userId: user.id,
        productId: interaction.productId,
        interactionType: interaction.type,
      },
    });
  }

  console.log('✅ Created sample user interactions');
  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
