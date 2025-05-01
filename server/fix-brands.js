const mongoose = require('mongoose');
const Brand = require('./models/Brand');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('Connected to MongoDB');
  try {
    // Find all brands with null or undefined slug
    const brands = await Brand.find({ $or: [{ slug: null }, { slug: { $exists: false } }] });
    console.log(`Found ${brands.length} brands without slug`);
    
    for (const brand of brands) {
      // Generate slug from name
      brand.slug = brand.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      console.log(`Fixing brand ${brand.name}, setting slug to ${brand.slug}`);
      await brand.save();
    }
    
    console.log('All brands have been fixed');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
})
.catch(err => console.error('MongoDB connection error:', err)); 