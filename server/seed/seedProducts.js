const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');
const Category = require('../models/Category');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB for seeding products'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Seed function
const seedProducts = async () => {
  try {
    // Get all categories
    const categories = await Category.find();
    if (categories.length === 0) {
      console.error('No categories found. Please seed categories first.');
      process.exit(1);
    }

    // Create a map of category slugs to their ObjectIds
    const categoryMap = {};
    categories.forEach(category => {
      categoryMap[category.slug] = category._id;
    });

    // Sample products
    const products = [
      {
        name: "Gaming Laptop",
        description: "High-performance gaming laptop with RTX graphics",
        price: 1299.99,
        category: categoryMap.laptops,
        image: "/placeholder.svg",
        rating: 4.5,
        stock: 10,
        featured: true,
        specs: {
          processor: "Intel Core i7",
          ram: "16GB",
          storage: "512GB SSD",
          graphics: "RTX 3060"
        }
      },
      {
        name: "Mechanical Keyboard",
        description: "RGB mechanical keyboard with custom switches",
        price: 99.99,
        category: categoryMap.peripherals,
        image: "/placeholder.svg",
        rating: 4.3,
        stock: 20,
        featured: true,
        specs: {
          type: "Mechanical",
          switches: "Cherry MX Red",
          lighting: "RGB"
        }
      },
      {
        name: "Gaming Mouse",
        description: "High-precision gaming mouse with adjustable DPI",
        price: 59.99,
        category: categoryMap.peripherals,
        image: "/placeholder.svg",
        rating: 4.2,
        stock: 15,
        featured: true,
        specs: {
          dpi: "16000",
          buttons: "6",
          lighting: "RGB"
        }
      }
    ];

    // Clear existing products
    await Product.deleteMany({});
    console.log('Existing products cleared');

    // Insert new products
    const insertedProducts = await Product.insertMany(products);
    console.log(`${insertedProducts.length} products inserted`);

    console.log('Products seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
};

// Run the seed function
seedProducts(); 