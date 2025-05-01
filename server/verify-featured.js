const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    return Product.find({ featured: true }).select('_id name');
  })
  .then(products => {
    console.log('Products marked as featured in the database:');
    console.log(`Found ${products.length} featured products:`);
    
    products.forEach((p, index) => {
      console.log(`${index + 1}. ID: ${p._id}, Name: ${p.name}`);
    });
    
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('Error:', err);
    mongoose.disconnect();
  }); 