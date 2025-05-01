const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    return Product.find().select('name featured');
  })
  .then(products => {
    console.log('Total products:', products.length);
    console.log('Products with featured status:');
    
    products.forEach(p => {
      console.log(`Name: ${p.name}, Featured: ${p.featured}`);
    });
    
    const featuredProducts = products.filter(p => p.featured === true);
    console.log('\nFeatured products count:', featuredProducts.length);
    console.log('Featured product names:');
    featuredProducts.forEach(p => console.log(`- ${p.name}`));
    
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('Error:', err);
    mongoose.disconnect();
  }); 