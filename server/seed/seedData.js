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
    image: "/placeholder.svg",
    specifications: [
      {
        name: "Processor",
        type: "text",
        required: true
      },
      {
        name: "RAM",
        type: "number",
        required: true,
        unit: "GB"
      },
      {
        name: "Storage",
        type: "select",
        options: ["256GB SSD", "512GB SSD", "1TB SSD", "2TB SSD"],
        required: true
      },
      {
        name: "Graphics",
        type: "text",
        required: true
      }
    ]
  },
  {
    name: "Desktops",
    slug: "desktops",
    image: "/placeholder.svg",
    specifications: [
      {
        name: "Processor",
        type: "text",
        required: true
      },
      {
        name: "RAM",
        type: "number",
        required: true,
        unit: "GB"
      },
      {
        name: "Storage",
        type: "select",
        options: ["256GB SSD", "512GB SSD", "1TB SSD", "2TB SSD", "1TB HDD", "2TB HDD"],
        required: true
      },
      {
        name: "Graphics",
        type: "text",
        required: true
      }
    ]
  },
  {
    name: "Components",
    slug: "components",
    image: "/placeholder.svg",
    specifications: [
      {
        name: "Type",
        type: "select",
        options: ["CPU", "GPU", "RAM", "Motherboard", "Power Supply", "Case"],
        required: true
      },
      {
        name: "Compatibility",
        type: "text",
        required: true
      }
    ]
  },
  {
    name: "Peripherals",
    slug: "peripherals",
    image: "/placeholder.svg",
    specifications: [
      {
        name: "Type",
        type: "select",
        options: ["Keyboard", "Mouse", "Monitor", "Headset", "Webcam"],
        required: true
      },
      {
        name: "Connectivity",
        type: "select",
        options: ["Wired", "Wireless", "Bluetooth"],
        required: true
      }
    ]
  },
  {
    name: "Accessories",
    slug: "accessories",
    image: "/placeholder.svg",
    specifications: [
      {
        name: "Type",
        type: "select",
        options: ["Cables", "Adapters", "Cooling", "Cleaning", "Storage"],
        required: true
      },
      {
        name: "Compatibility",
        type: "text",
        required: true
      }
    ]
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

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();
