import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const products = [
  // Electronics - Computers & Laptops (15 items)
  {
    name: "MacBook Pro 16-inch M3",
    description: "Powerful laptop with M3 chip, 32GB RAM, and stunning Retina display",
    category: "Electronics",
    price: 2499.99,
    tags: ["laptop", "apple", "macbook", "m3-chip", "professional"],
    imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500",
  },
  {
    name: "Dell XPS 15 Gaming Laptop",
    description: "High-performance gaming laptop with RTX 4060 and 15.6-inch OLED display",
    category: "Electronics",
    price: 1899.99,
    tags: ["laptop", "gaming", "dell", "rtx", "oled"],
    imageUrl: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500",
  },
  {
    name: "iPad Pro 12.9-inch",
    description: "Versatile tablet with M2 chip, Apple Pencil support, and all-day battery",
    category: "Electronics",
    price: 1099.99,
    tags: ["tablet", "ipad", "apple", "m2-chip", "touch-screen"],
    imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500",
  },
  {
    name: "Microsoft Surface Pro 9",
    description: "2-in-1 laptop and tablet with detachable keyboard and Surface Pen",
    category: "Electronics",
    price: 999.99,
    tags: ["tablet", "laptop", "microsoft", "2-in-1", "touchscreen"],
    imageUrl: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=500",
  },
  {
    name: "ASUS ROG Gaming Desktop",
    description: "Ultimate gaming PC with RTX 4090, Intel i9, and RGB lighting",
    category: "Electronics",
    price: 3499.99,
    tags: ["desktop", "gaming", "asus", "rtx-4090", "rgb"],
    imageUrl: "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=500",
  },

  // Electronics - Audio (15 items)
  {
    name: "Sony WH-1000XM5 Headphones",
    description: "Industry-leading noise cancellation with premium sound quality",
    category: "Electronics",
    price: 399.99,
    tags: ["headphones", "sony", "noise-cancelling", "wireless", "bluetooth"],
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
  },
  {
    name: "AirPods Pro 2nd Generation",
    description: "Apple's premium wireless earbuds with adaptive transparency",
    category: "Electronics",
    price: 249.99,
    tags: ["earbuds", "apple", "airpods", "wireless", "noise-cancelling"],
    imageUrl: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500",
  },
  {
    name: "Bose QuietComfort Earbuds II",
    description: "Premium earbuds with world-class noise cancellation",
    category: "Electronics",
    price: 299.99,
    tags: ["earbuds", "bose", "wireless", "noise-cancelling", "premium"],
    imageUrl: "https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=500",
  },
  {
    name: "JBL Flip 6 Bluetooth Speaker",
    description: "Portable waterproof speaker with powerful bass and 12-hour battery",
    category: "Electronics",
    price: 129.99,
    tags: ["speaker", "bluetooth", "portable", "waterproof", "jbl"],
    imageUrl: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500",
  },
  {
    name: "Sonos One Smart Speaker",
    description: "Smart speaker with Alexa built-in and incredible sound",
    category: "Electronics",
    price: 219.99,
    tags: ["speaker", "smart-home", "alexa", "wifi", "sonos"],
    imageUrl: "https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=500",
  },

  // Electronics - Smart Home (10 items)
  {
    name: "Ring Video Doorbell Pro",
    description: "Smart doorbell with 1080p HD video and two-way talk",
    category: "Electronics",
    price: 249.99,
    tags: ["smart-home", "security", "doorbell", "camera", "wifi"],
    imageUrl: "https://images.unsplash.com/photo-1558002038-1055907df827?w=500",
  },
  {
    name: "Nest Learning Thermostat",
    description: "Smart thermostat that learns your schedule and saves energy",
    category: "Electronics",
    price: 249.99,
    tags: ["smart-home", "thermostat", "nest", "energy-saving", "wifi"],
    imageUrl: "https://images.unsplash.com/photo-1545259742-24c4970110fe?w=500",
  },
  {
    name: "Philips Hue Smart Bulbs 4-Pack",
    description: "Color-changing smart bulbs with app and voice control",
    category: "Electronics",
    price: 79.99,
    tags: ["smart-home", "lighting", "philips-hue", "rgb", "wifi"],
    imageUrl: "https://images.unsplash.com/photo-1550985616-10810253b84d?w=500",
  },
  {
    name: "Amazon Echo Dot 5th Gen",
    description: "Compact smart speaker with Alexa voice assistant",
    category: "Electronics",
    price: 49.99,
    tags: ["smart-home", "alexa", "speaker", "voice-assistant", "amazon"],
    imageUrl: "https://images.unsplash.com/photo-1543512214-318c7553f230?w=500",
  },
  {
    name: "TP-Link Kasa Smart Plug 4-Pack",
    description: "WiFi-enabled smart plugs with voice control and scheduling",
    category: "Electronics",
    price: 39.99,
    tags: ["smart-home", "plug", "wifi", "automation", "tp-link"],
    imageUrl: "https://images.unsplash.com/photo-1558089687-4d3b9d9d9a9d?w=500",
  },

  // Electronics - Photography (10 items)
  {
    name: "Canon EOS R6 Mark II",
    description: "Professional mirrorless camera with 24.2MP sensor and 4K video",
    category: "Electronics",
    price: 2499.99,
    tags: ["camera", "photography", "mirrorless", "canon", "4k"],
    imageUrl: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500",
  },
  {
    name: "Sony Alpha A7 IV",
    description: "Full-frame mirrorless camera with exceptional image quality",
    category: "Electronics",
    price: 2498.99,
    tags: ["camera", "photography", "mirrorless", "sony", "full-frame"],
    imageUrl: "https://images.unsplash.com/photo-1606980395352-6f4c5f0aa2c8?w=500",
  },
  {
    name: "DJI Mini 3 Pro Drone",
    description: "Lightweight drone with 4K HDR video and intelligent flight modes",
    category: "Electronics",
    price: 759.99,
    tags: ["drone", "dji", "4k", "aerial", "photography"],
    imageUrl: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=500",
  },
  {
    name: "GoPro HERO11 Black",
    description: "Action camera with 5.3K video and waterproof design",
    category: "Electronics",
    price: 399.99,
    tags: ["camera", "action-camera", "gopro", "waterproof", "5k"],
    imageUrl: "https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=500",
  },

  // Furniture - Office (15 items)
  {
    name: "Herman Miller Aeron Chair",
    description: "Ergonomic office chair with lumbar support and breathable mesh",
    category: "Furniture",
    price: 1445.00,
    tags: ["office", "chair", "ergonomic", "herman-miller", "premium"],
    imageUrl: "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=500",
  },
  {
    name: "Autonomous SmartDesk Pro",
    description: "Electric standing desk with memory presets and cable management",
    category: "Furniture",
    price: 599.99,
    tags: ["desk", "standing-desk", "electric", "office", "adjustable"],
    imageUrl: "https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=500",
  },
  {
    name: "IKEA BEKANT Corner Desk",
    description: "Spacious L-shaped desk perfect for home offices",
    category: "Furniture",
    price: 279.99,
    tags: ["desk", "corner-desk", "office", "ikea", "spacious"],
    imageUrl: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=500",
  },
  {
    name: "Uplift V2 Standing Desk",
    description: "Premium standing desk with bamboo top and quiet motors",
    category: "Furniture",
    price: 799.99,
    tags: ["desk", "standing-desk", "bamboo", "office", "premium"],
    imageUrl: "https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=500",
  },
  {
    name: "Secretlab TITAN Evo Gaming Chair",
    description: "Premium gaming chair with magnetic memory foam head pillow",
    category: "Furniture",
    price: 549.99,
    tags: ["chair", "gaming", "ergonomic", "secretlab", "comfort"],
    imageUrl: "https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=500",
  },

  // Furniture - Living Room (15 items)
  {
    name: "West Elm Mid-Century Sofa",
    description: "Modern 3-seater sofa with velvet upholstery",
    category: "Furniture",
    price: 1999.99,
    tags: ["sofa", "living-room", "mid-century", "velvet", "modern"],
    imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500",
  },
  {
    name: "IKEA POÄNG Armchair",
    description: "Comfortable bentwood armchair with cushion",
    category: "Furniture",
    price: 179.99,
    tags: ["chair", "armchair", "living-room", "ikea", "comfort"],
    imageUrl: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=500",
  },
  {
    name: "CB2 Peekaboo Acrylic Coffee Table",
    description: "Modern clear acrylic coffee table with clean lines",
    category: "Furniture",
    price: 299.99,
    tags: ["table", "coffee-table", "living-room", "acrylic", "modern"],
    imageUrl: "https://images.unsplash.com/photo-1550254478-ead40cc54513?w=500",
  },
  {
    name: "Article Sven Sectional Sofa",
    description: "Scandinavian-inspired sectional with tufted cushions",
    category: "Furniture",
    price: 2499.99,
    tags: ["sofa", "sectional", "living-room", "scandinavian", "luxury"],
    imageUrl: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=500",
  },
  {
    name: "Floyd Shelf System",
    description: "Modular wall-mounted shelving with powder-coated steel",
    category: "Furniture",
    price: 495.00,
    tags: ["shelf", "storage", "living-room", "modular", "modern"],
    imageUrl: "https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?w=500",
  },

  // Furniture - Bedroom (10 items)
  {
    name: "Casper Wave Hybrid Mattress Queen",
    description: "Premium hybrid mattress with zoned support and cooling",
    category: "Furniture",
    price: 1895.00,
    tags: ["mattress", "bedroom", "queen", "hybrid", "cooling"],
    imageUrl: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500",
  },
  {
    name: "Tuft & Needle Platform Bed Frame",
    description: "Modern platform bed with wood slats and minimalist design",
    category: "Furniture",
    price: 595.00,
    tags: ["bed", "bedroom", "platform", "wood", "modern"],
    imageUrl: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=500",
  },
  {
    name: "IKEA PAX Wardrobe System",
    description: "Customizable wardrobe with soft-close doors and interior fittings",
    category: "Furniture",
    price: 799.99,
    tags: ["wardrobe", "bedroom", "storage", "customizable", "ikea"],
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500",
  },
  {
    name: "West Elm Modern Nightstand",
    description: "Solid wood nightstand with drawer and open shelf",
    category: "Furniture",
    price: 349.00,
    tags: ["nightstand", "bedroom", "wood", "storage", "modern"],
    imageUrl: "https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=500",
  },

  // Accessories - Tech Accessories (15 items)
  {
    name: "Anker PowerCore 20000mAh Power Bank",
    description: "High-capacity portable charger with fast charging",
    category: "Accessories",
    price: 49.99,
    tags: ["power-bank", "charger", "portable", "anker", "fast-charging"],
    imageUrl: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500",
  },
  {
    name: "CalDigit TS4 Thunderbolt 4 Dock",
    description: "18-in-1 docking station with 98W charging",
    category: "Accessories",
    price: 399.99,
    tags: ["dock", "thunderbolt", "usb-c", "charging", "hub"],
    imageUrl: "https://images.unsplash.com/photo-1625948515291-69613efd103f?w=500",
  },
  {
    name: "Logitech MX Master 3S Mouse",
    description: "Ergonomic wireless mouse with ultra-fast scrolling",
    category: "Accessories",
    price: 99.99,
    tags: ["mouse", "wireless", "ergonomic", "logitech", "productivity"],
    imageUrl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500",
  },
  {
    name: "Keychron K8 Mechanical Keyboard",
    description: "Wireless mechanical keyboard with hot-swappable switches",
    category: "Accessories",
    price: 109.99,
    tags: ["keyboard", "mechanical", "wireless", "rgb", "gaming"],
    imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500",
  },
  {
    name: "Samsung T7 Portable SSD 2TB",
    description: "Fast external SSD with USB 3.2 Gen 2 speeds",
    category: "Accessories",
    price: 199.99,
    tags: ["ssd", "storage", "portable", "samsung", "fast"],
    imageUrl: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500",
  },

  // Accessories - Fashion & Lifestyle (15 items)
  {
    name: "Bellroy Leather Laptop Sleeve 15-inch",
    description: "Premium leather sleeve with magnetic closure",
    category: "Accessories",
    price: 129.00,
    tags: ["sleeve", "laptop", "leather", "bellroy", "premium"],
    imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500",
  },
  {
    name: "Fjällräven Kånken Backpack",
    description: "Iconic Swedish backpack with laptop compartment",
    category: "Accessories",
    price: 90.00,
    tags: ["backpack", "laptop", "fjallraven", "travel", "durable"],
    imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500",
  },
  {
    name: "Peak Design Everyday Messenger 13L",
    description: "Weatherproof messenger bag for photographers and commuters",
    category: "Accessories",
    price: 249.95,
    tags: ["bag", "messenger", "camera", "weatherproof", "peak-design"],
    imageUrl: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500",
  },
  {
    name: "Nomad Base Station Pro Wireless Charger",
    description: "Premium 3-in-1 wireless charger with ambient light",
    category: "Accessories",
    price: 149.95,
    tags: ["charger", "wireless", "qi", "3-in-1", "premium"],
    imageUrl: "https://images.unsplash.com/photo-1591290619762-d6bd4e1e6c1c?w=500",
  },
  {
    name: "Blue Light Blocking Glasses",
    description: "Stylish glasses that reduce digital eye strain",
    category: "Accessories",
    price: 39.99,
    tags: ["glasses", "blue-light", "eye-protection", "health", "style"],
    imageUrl: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=500",
  },

  // Accessories - Desk Organization (10 items)
  {
    name: "Grovemade Desk Shelf",
    description: "Minimalist wood and steel desk shelf for monitor elevation",
    category: "Accessories",
    price: 280.00,
    tags: ["shelf", "desk", "organizer", "wood", "minimal"],
    imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500",
  },
  {
    name: "Ugmonk Gather Desk Collection",
    description: "Modular desktop organization system with trays",
    category: "Accessories",
    price: 98.00,
    tags: ["organizer", "desk", "modular", "minimal", "tray"],
    imageUrl: "https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?w=500",
  },
  {
    name: "Elago Cable Management Box",
    description: "Hide and organize cables with this sleek box",
    category: "Accessories",
    price: 19.99,
    tags: ["cable-management", "organizer", "desk", "minimal", "box"],
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500",
  },
  {
    name: "3M Desk Drawer Organizer Set",
    description: "Expandable drawer organizer with multiple compartments",
    category: "Accessories",
    price: 24.99,
    tags: ["organizer", "drawer", "desk", "expandable", "storage"],
    imageUrl: "https://images.unsplash.com/photo-1584552332309-26a2e1e4e880?w=500",
  },
  {
    name: "Oakywood Wooden Desk Mat",
    description: "Premium cork and leather desk mat with felt bottom",
    category: "Accessories",
    price: 149.00,
    tags: ["desk-mat", "leather", "cork", "premium", "wood"],
    imageUrl: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=500",
  },

  // Additional unique products for variety
  {
    name: "Wacom Intuos Pro Digital Drawing Tablet",
    description: "Professional graphics tablet with 8192 pressure levels",
    category: "Electronics",
    price: 379.95,
    tags: ["tablet", "drawing", "wacom", "graphics", "creative"],
    imageUrl: "https://images.unsplash.com/photo-1576097449798-7c7f90e1248a?w=500",
  },
  {
    name: "BenQ ScreenBar LED Monitor Light",
    description: "Space-saving monitor light bar with auto-dimming",
    category: "Accessories",
    price: 109.00,
    tags: ["lighting", "monitor", "led", "desk", "ergonomic"],
    imageUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500",
  },
  {
    name: "Ergotron LX Desk Monitor Arm",
    description: "Premium monitor arm with smooth height adjustment",
    category: "Accessories",
    price: 199.99,
    tags: ["monitor-arm", "ergonomic", "desk", "adjustable", "premium"],
    imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500",
  },
  {
    name: "Elgato Stream Deck",
    description: "Customizable control panel with 15 LCD keys for streaming",
    category: "Electronics",
    price: 149.99,
    tags: ["streaming", "controller", "elgato", "customizable", "content-creation"],
    imageUrl: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=500",
  },
  {
    name: "Shure MV7 USB/XLR Microphone",
    description: "Professional hybrid microphone for podcasting and streaming",
    category: "Electronics",
    price: 249.00,
    tags: ["microphone", "usb", "xlr", "podcasting", "streaming"],
    imageUrl: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=500",
  },
  {
    name: "Neewer RGB LED Video Light Panel",
    description: "Adjustable color temperature video light for content creators",
    category: "Electronics",
    price: 89.99,
    tags: ["lighting", "video", "rgb", "content-creation", "photography"],
    imageUrl: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=500",
  },
  {
    name: "Humanscale Freedom Task Chair",
    description: "Self-adjusting ergonomic chair with recline mechanism",
    category: "Furniture",
    price: 1099.00,
    tags: ["chair", "office", "ergonomic", "task-chair", "premium"],
    imageUrl: "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=500",
  },
  {
    name: "Steelcase Gesture Office Chair",
    description: "Advanced ergonomic chair designed for modern work styles",
    category: "Furniture",
    price: 1187.00,
    tags: ["chair", "office", "ergonomic", "steelcase", "professional"],
    imageUrl: "https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=500",
  },
  {
    name: "Rain Design mStand Laptop Stand",
    description: "Aluminum laptop stand with cable organizer",
    category: "Accessories",
    price: 49.95,
    tags: ["laptop-stand", "aluminum", "desk", "ergonomic", "minimal"],
    imageUrl: "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=500",
  },
  {
    name: "Topre Realforce R2 Keyboard",
    description: "Premium mechanical keyboard with variable actuation force",
    category: "Accessories",
    price: 229.00,
    tags: ["keyboard", "mechanical", "topre", "premium", "typing"],
    imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500",
  },
];

async function main() {
  console.log('🌱 Starting enhanced seed with 100+ products...');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await prisma.userInteraction.deleteMany({});
  await prisma.userPreference.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.user.deleteMany({});

  // Create test users
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const user1 = await prisma.user.create({
    data: {
      email: 'test@example.com',
      name: 'Test User',
      password: hashedPassword,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'john@example.com',
      name: 'John Doe',
      password: hashedPassword,
    },
  });

  const user3 = await prisma.user.create({
    data: {
      email: 'jane@example.com',
      name: 'Jane Smith',
      password: hashedPassword,
    },
  });

  console.log(`✅ Created ${3} test users`);

  // Create all products
  const createdProducts = [];
  for (const product of products) {
    const created = await prisma.product.create({
      data: product,
    });
    createdProducts.push(created);
  }

  console.log(`✅ Created ${createdProducts.length} products`);

  // Create diverse sample interactions for user1 (test@example.com)
  const user1Interactions = [
    // Electronics enthusiast - views laptops and audio
    { productId: createdProducts[0].id, type: 'view' },  // MacBook Pro
    { productId: createdProducts[1].id, type: 'view' },  // Dell XPS
    { productId: createdProducts[5].id, type: 'like' },  // Sony Headphones
    { productId: createdProducts[6].id, type: 'view' },  // AirPods
    { productId: createdProducts[7].id, type: 'click' }, // Bose Earbuds
    { productId: createdProducts[0].id, type: 'like' },  // MacBook Pro liked
    { productId: createdProducts[10].id, type: 'view' }, // Ring Doorbell
    { productId: createdProducts[2].id, type: 'view' },  // iPad Pro
    { productId: createdProducts[8].id, type: 'like' },  // JBL Speaker
  ];

  // Create interactions for user2 - office furniture focus
  const user2Interactions = [
    { productId: createdProducts[20].id, type: 'view' }, // Herman Miller Chair
    { productId: createdProducts[21].id, type: 'like' }, // Standing Desk
    { productId: createdProducts[24].id, type: 'view' }, // Gaming Chair
    { productId: createdProducts[20].id, type: 'like' }, // Herman Miller liked
    { productId: createdProducts[40].id, type: 'view' }, // Anker Power Bank
  ];

  // Create interactions for user3 - mixed interests
  const user3Interactions = [
    { productId: createdProducts[30].id, type: 'view' }, // Sofa
    { productId: createdProducts[15].id, type: 'like' }, // Camera
    { productId: createdProducts[45].id, type: 'view' }, // Backpack
    { productId: createdProducts[25].id, type: 'view' }, // Mid-Century Sofa
  ];

  // Insert all interactions
  for (const interaction of user1Interactions) {
    await prisma.userInteraction.create({
      data: {
        userId: user1.id,
        productId: interaction.productId,
        interactionType: interaction.type,
      },
    });
  }

  for (const interaction of user2Interactions) {
    await prisma.userInteraction.create({
      data: {
        userId: user2.id,
        productId: interaction.productId,
        interactionType: interaction.type,
      },
    });
  }

  for (const interaction of user3Interactions) {
    await prisma.userInteraction.create({
      data: {
        userId: user3.id,
        productId: interaction.productId,
        interactionType: interaction.type,
      },
    });
  }

  console.log(`✅ Created sample interactions for all users`);

  // Category breakdown
  const categoryCount: Record<string, number> = {};
  createdProducts.forEach(p => {
    categoryCount[p.category] = (categoryCount[p.category] || 0) + 1;
  });

  console.log('\n📊 Product Distribution:');
  Object.entries(categoryCount).forEach(([category, count]) => {
    console.log(`   ${category}: ${count} products`);
  });

  console.log('\n👥 Test Accounts:');
  console.log('   Email: test@example.com | Password: password123');
  console.log('   Email: john@example.com | Password: password123');
  console.log('   Email: jane@example.com | Password: password123');

  console.log('\n🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

