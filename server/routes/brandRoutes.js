const express = require('express');
const Brand = require('../models/Brand');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/brands'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Get all brands
router.get('/', async (req, res) => {
  try {
    const brands = await Brand.find();
    res.json(brands);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get brand by ID
router.get('/:id', async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      return res.status(404).json({ message: 'Brand not found' });
    }
    res.json(brand);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new brand
router.post('/', auth, upload.single('logo'), async (req, res) => {
  try {
    console.log('Creating brand with data:', req.body);
    console.log('File:', req.file);
    
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Brand name is required' });
    }
    
    // Check if brand with same name already exists
    const existingBrand = await Brand.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existingBrand) {
      return res.status(400).json({ message: 'A brand with this name already exists' });
    }
    
    let logo = null;
    if (req.file) {
      logo = `/uploads/brands/${req.file.filename}`;
    } else {
      // Use a default logo if none is provided
      logo = '/uploads/brands/default-brand.png';
      console.log('No logo provided, using default');
    }

    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

    const brand = new Brand({
      name,
      slug,
      logo
    });

    const newBrand = await brand.save();
    console.log('Brand created successfully:', newBrand);
    res.status(201).json(newBrand);
  } catch (error) {
    console.error('Error creating brand:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      if (error.keyPattern && error.keyPattern.name) {
        return res.status(400).json({ message: 'A brand with this name already exists' });
      }
      if (error.keyPattern && error.keyPattern.slug) {
        return res.status(400).json({ message: 'A brand with a similar name already exists' });
      }
      return res.status(400).json({ message: 'Duplicate key error' });
    }
    
    res.status(400).json({ message: error.message });
  }
});

// Update a brand
router.put('/:id', auth, upload.single('logo'), async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Brand name is required' });
    }
    
    // Check for duplicate name (excluding the current brand)
    const existingBrand = await Brand.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      _id: { $ne: req.params.id }
    });
    
    if (existingBrand) {
      return res.status(400).json({ message: 'A brand with this name already exists' });
    }
    
    const logo = req.file ? `/uploads/brands/${req.file.filename}` : null;

    // Generate slug from the name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

    const updateData = { 
      name,
      slug
    };
    
    if (logo) {
      updateData.logo = logo;
    }

    const updatedBrand = await Brand.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedBrand) {
      return res.status(404).json({ message: 'Brand not found' });
    }

    res.json(updatedBrand);
  } catch (error) {
    console.error('Error updating brand:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      if (error.keyPattern && error.keyPattern.name) {
        return res.status(400).json({ message: 'A brand with this name already exists' });
      }
      if (error.keyPattern && error.keyPattern.slug) {
        return res.status(400).json({ message: 'A brand with a similar name already exists' });
      }
      return res.status(400).json({ message: 'Duplicate key error' });
    }
    
    res.status(400).json({ message: error.message });
  }
});

// Delete a brand
router.delete('/:id', auth, async (req, res) => {
  try {
    const brand = await Brand.findByIdAndDelete(req.params.id);
    if (!brand) {
      return res.status(404).json({ message: 'Brand not found' });
    }
    res.json({ message: 'Brand deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 