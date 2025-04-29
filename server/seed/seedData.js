
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');
const Category = require('../models/Category');

// Load environment variables
dotenv.config();

// Initial data
const categories = [
  {
    name: "Laptops",
    slug: "laptops",
    image: "/placeholder.svg"
  },
  {
    name: "Desktops",
    slug: "desktops",
    image: "/placeholder.svg"
  },
  {
    name: "Components",
    slug: "components",
    image: "/placeholder.svg"
  },
  {
    name: "Peripherals",
    slug: "peripherals",
    image: "/placeholder.svg"
  },
  {
    name: "Accessories",
    slug: "accessories",
    image: "/placeholder.svg"
  }
];

const products = [
  {
    name: "NeuraBook Pro",
    description: "Powerful laptop for professionals with high-end specifications.",
    price: 1299.99,
    category: "laptops",
    image: "/placeholder.svg",
    rating: 4.5,
    stock: 15,
    featured: true,
    specs: {
      processor: "Intel Core i7-12700H",
      ram: "16GB DDR5",
      storage: "512GB NVMe SSD",
      display: "15.6\" 2K IPS",
      graphics: "NVIDIA RTX 3060 6GB"
    }
  },
  {
    name: "NeuraTower Gaming",
    description: "High-performance gaming desktop with RGB lighting.",
    price: 1899.99,
    category: "desktops",
    image: "/placeholder.svg",
    rating: 4.7,
    stock: 8,
    featured: true,
    specs: {
      processor: "AMD Ryzen 9 5900X",
      ram: "32GB DDR4",
      storage: "1TB NVMe SSD + 2TB HDD",
      graphics: "NVIDIA RTX 4070 12GB",
      cooling: "Liquid Cooling"
    }
  },
  {
    name: "NeuraBook Air",
    description: "Ultrathin and lightweight laptop for everyday use.",
    price: 899.99,
    category: "laptops",
    image: "/placeholder.svg",
    rating: 4.2,
    stock: 22,
    specs: {
      processor: "Intel Core i5-1135G7",
      ram: "8GB DDR4",
      storage: "256GB NVMe SSD",
      display: "13.3\" FHD IPS",
      graphics: "Intel Iris Xe Graphics"
    }
  },
  {
    name: "NeuraStation Workstation",
    description: "Professional desktop for content creation and heavy workloads.",
    price: 2299.99,
    category: "desktops",
    image: "/placeholder.svg",
    rating: 4.9,
    stock: 5,
    featured: true,
    specs: {
      processor: "Intel Core i9-12900K",
      ram: "64GB DDR5",
      storage: "2TB NVMe SSD + 4TB HDD",
      graphics: "NVIDIA RTX 4080 16GB",
      cooling: "Advanced Liquid Cooling"
    }
  },
  {
    name: "NeuraTower Essential",
    description: "Budget-friendly desktop for everyday computing needs.",
    price: 699.99,
    category: "desktops",
    image: "/placeholder.svg",
    rating: 4.0,
    stock: 18,
    specs: {
      processor: "AMD Ryzen 5 5600G",
      ram: "16GB DDR4",
      storage: "512GB NVMe SSD",
      graphics: "AMD Radeon Graphics",
      cooling: "Air Cooling"
    }
  },
  {
    name: "NeuraBook Gaming",
    description: "Powerful gaming laptop with high refresh rate display.",
    price: 1599.99,
    category: "laptops",
    image: "/placeholder.svg",
    rating: 4.6,
    stock: 10,
    featured: true,
    specs: {
      processor: "AMD Ryzen 7 7800X",
      ram: "32GB DDR5",
      storage: "1TB NVMe SSD",
      display: "17.3\" QHD 165Hz",
      graphics: "NVIDIA RTX 4070 8GB Mobile"
    }
  },
  {
    name: "NeuraRGB Keyboard",
    description: "Mechanical gaming keyboard with customizable RGB lighting.",
    price: 129.99,
    category: "peripherals",
    image: "/placeholder.svg",
    rating: 4.4,
    stock: 30,
    specs: {
      type: "Mechanical",
      switches: "Cherry MX Brown",
      lighting: "RGB",
      connectivity: "USB-C",
      layout: "Full size"
    }
  },
  {
    name: "NeuraPrecision Mouse",
    description: "High-precision gaming mouse with adjustable DPI.",
    price: 79.99,
    category: "peripherals",
    image: "/placeholder.svg",
    rating: 4.3,
    stock: 25,
    specs: {
      sensor: "16000 DPI Optical",
      buttons: "8 Programmable",
      lighting: "RGB",
      connectivity: "USB / Wireless",
      weight: "Adjustable"
    }
  }
];

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB for seeding'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Seed function
const seedDatabase = async () => {
  try {
    // Clear existing data
    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log('Existing data cleared');

    // Insert categories
    const insertedCategories = await Category.insertMany(categories);
    console.log(`${insertedCategories.length} categories inserted`);

    // Insert products
    const insertedProducts = await Product.insertMany(products);
    console.log(`${insertedProducts.length} products inserted`);

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();
