const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB directly without using models
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Get direct access to the products collection
    const db = mongoose.connection.db;
    const productsCollection = db.collection('products');
    
    // List of product IDs to ensure are featured
    const productsToFeature = [
      "6812812a49cd2db80f67b0fb", // Gaming Laptop
      "6812812a49cd2db80f67b0fc", // Mechanical Keyboard
      "68138c1b78c661bfc5bddcf9", // Asus Astral RTX 5090
      "68138d2d78c661bfc5bde28d"  // Asus TUF RTX 5090
    ];
    
    // Convert string IDs to MongoDB ObjectId
    const objectIds = productsToFeature.map(id => new mongoose.Types.ObjectId(id));
    
    // Update all products in the list to be featured
    const updateResult = await productsCollection.updateMany(
      { _id: { $in: objectIds } },
      { $set: { featured: true } }
    );
    
    console.log(`Updated ${updateResult.modifiedCount} products to be featured`);
    
    // Verify current featured products
    const featuredProducts = await productsCollection.find({ featured: true }).toArray();
    
    console.log(`\nVerified featured products (${featuredProducts.length} total):`);
    featuredProducts.forEach((p, index) => {
      console.log(`${index + 1}. ID: ${p._id}, Name: ${p.name}`);
    });
    
    mongoose.disconnect();
    console.log('\nDatabase connection closed');
  })
  .catch(err => {
    console.error('Error:', err);
    mongoose.disconnect();
  }); 