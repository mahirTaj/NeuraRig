const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    return Product.find().select('_id name featured');
  })
  .then(products => {
    console.log('All products with IDs:');
    products.forEach(p => {
      console.log(`ID: ${p._id}, Name: ${p.name}, Featured: ${p.featured}`);
    });
    
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('Error:', err);
    mongoose.disconnect();
  }); 