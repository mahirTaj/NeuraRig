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
    const { name } = req.body;
    const logo = req.file ? `/uploads/brands/${req.file.filename}` : null;

    if (!name || !logo) {
      return res.status(400).json({ message: 'Name and logo are required' });
    }

    const brand = new Brand({
      name,
      logo
    });

    const newBrand = await brand.save();
    res.status(201).json(newBrand);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a brand
router.put('/:id', auth, upload.single('logo'), async (req, res) => {
  try {
    const { name } = req.body;
    const logo = req.file ? `/uploads/brands/${req.file.filename}` : null;

    const updateData = { name };
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