const express = require('express');
const Product = require('../models/Product');
const Category = require('../models/Category');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find()
      .populate('category', 'name slug')
      .populate('brand', 'name logo');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Search products
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const searchRegex = new RegExp(q, 'i');
    
    const products = await Product.find({
      $or: [
        { name: searchRegex },
        { description: searchRegex },
        { modelName: searchRegex }
      ]
    })
    .populate('category', 'name slug')
    .populate('brand', 'name logo');
    
    console.log(`Search for "${q}" found ${products.length} products`);
    res.json(products);
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get featured products
router.get('/featured', async (req, res) => {
  try {
    console.log('Fetching featured products...');
    const products = await Product.find({ featured: true })
      .populate('category', 'name slug')
      .populate('brand', 'name logo');
    
    console.log(`Found ${products.length} featured products:`);
    products.forEach(p => console.log(` - ${p.name} (${p._id})`));
    
    res.json(products);
  } catch (error) {
    console.error('Error fetching featured products:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get products by category
router.get('/category/:slug', async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    const products = await Product.find({ category: category._id }).populate('category', 'name slug');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug')
      .populate('brand', 'name logo');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new product
router.post('/', auth, upload.array('images', 5), async (req, res) => {
  try {
    const { name, brand, modelName, description, price, category, stock, specifications } = req.body;
    
    // Validate required fields
    if (!name || !brand || !modelName || !description || !price || !category || !stock) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Handle image uploads
    const images = req.files.map(file => `/uploads/products/${file.filename}`);

    // Parse specifications if provided
    let parsedSpecifications = [];
    if (specifications) {
      parsedSpecifications = JSON.parse(specifications).map(spec => ({
        name: spec.name,
        value: spec.value,
        unit: spec.unit || undefined
      }));
    }

    const product = new Product({
      name,
      brand,
      modelName,
      description,
      price,
      category,
      stock,
      images,
      specifications: parsedSpecifications
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update a product
router.put('/:id', auth, upload.array('images', 5), async (req, res) => {
  try {
    const { name, brand, modelName, description, price, category, stock, specifications, existingImages } = req.body;
    
    // Get the product
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Handle image updates
    let images = [];
    if (existingImages) {
      images = JSON.parse(existingImages);
    }

    // Add new images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/products/${file.filename}`);
      images = [...images, ...newImages];
    }

    // Parse specifications if provided
    let parsedSpecifications = product.specifications;
    if (specifications) {
      parsedSpecifications = JSON.parse(specifications).map(spec => ({
        name: spec.name,
        value: spec.value,
        unit: spec.unit || undefined
      }));
    }

    // Update product
    product.name = name || product.name;
    product.brand = brand || product.brand;
    product.modelName = modelName || product.modelName;
    product.description = description || product.description;
    product.price = price || product.price;
    product.category = category || product.category;
    product.stock = stock || product.stock;
    product.images = images;
    product.specifications = parsedSpecifications;
    product.featured = req.body.featured !== undefined ? req.body.featured : product.featured;

    await product.save();
    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete a product
router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Delete associated images
    product.images.forEach(image => {
      const imagePath = path.join(__dirname, '..', 'public', image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    });

    await product.remove();
    res.json({ message: 'Product deleted' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete a specific image from a product
router.delete('/:id/images/:imageIndex', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const imageIndex = parseInt(req.params.imageIndex);
    if (isNaN(imageIndex) || imageIndex < 0 || imageIndex >= product.images.length) {
      return res.status(400).json({ message: 'Invalid image index' });
    }

    // Delete the image file
    const imagePath = path.join(__dirname, '..', 'public', product.images[imageIndex]);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    // Remove the image from the array
    product.images.splice(imageIndex, 1);
    await product.save();

    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
