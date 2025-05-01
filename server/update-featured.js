const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

// Array of product IDs to set as featured
const productsToFeature = [
  "6812812a49cd2db80f67b0fb", // Gaming Laptop (already featured)
  "6812812a49cd2db80f67b0fc", // Mechanical Keyboard (already featured)
  "68138c1b78c661bfc5bddcf9", // Asus Astral RTX 5090
  "68138d2d78c661bfc5bde28d"  // Asus TUF RTX 5090
];

// For this test script, we'll update all products to be featured
// In real use, you would provide specific IDs in the array above

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    
    // Update specific products by ID to be featured
    return Product.updateMany(
      { _id: { $in: productsToFeature } },
      { $set: { featured: true } }
    );
  })
  .then(result => {
    console.log(`Updated ${result.modifiedCount} products to featured status`);
    return Product.find().select('name featured');
  })
  .then(products => {
    console.log('\nUpdated product status:');
    products.forEach(p => {
      console.log(`Name: ${p.name}, Featured: ${p.featured}`);
    });
    
    const featuredCount = products.filter(p => p.featured).length;
    console.log(`\nTotal featured products now: ${featuredCount}`);
    
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('Error:', err);
    mongoose.disconnect();
  }); 