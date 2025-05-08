const express = require('express');
const Category = require('../models/Category');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const slugify = require('slugify');

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads/categories');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'category-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
    req.fileValidationError = 'Only image files are allowed!';
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  }
}).single('image');

// Get all categories
router.get('/', async (req, res) => {
  try {
    console.log('Fetching all categories...');
    const categories = await Category.find().select('name slug image specifications createdAt updatedAt');
    // Transform image paths to include full URL
    const transformedCategories = categories.map(category => ({
      ...category.toObject(),
      image: category.image.startsWith('http') ? category.image : `http://localhost:5000${category.image}`
    }));
    console.log('Found categories:', transformedCategories);
    res.json(transformedCategories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get category by ID
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).select('name slug image specifications createdAt updatedAt');
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    // Transform image path to include full URL
    const transformedCategory = {
      ...category.toObject(),
      image: category.image.startsWith('http') ? category.image : `http://localhost:5000${category.image}`
    };
    res.json(transformedCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get category by slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug }).select('name slug image specifications createdAt updatedAt');
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    // Transform image path to include full URL
    const transformedCategory = {
      ...category.toObject(),
      image: category.image.startsWith('http') ? category.image : `http://localhost:5000${category.image}`
    };
    res.json(transformedCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new category
router.post('/', (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error('Multer error:', err);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File size too large. Maximum size is 5MB.' });
      }
      return res.status(400).json({ message: err.message });
    }

    if (req.fileValidationError) {
      return res.status(400).json({ message: req.fileValidationError });
    }

    try {
      console.log('Request received:', {
        body: req.body,
        file: req.file ? {
          fieldname: req.file.fieldname,
          originalname: req.file.originalname,
          encoding: req.file.encoding,
          mimetype: req.file.mimetype,
          destination: req.file.destination,
          filename: req.file.filename,
          path: req.file.path,
          size: req.file.size
        } : null
      });

      const { name, specifications } = req.body;
      const image = req.file;

      if (!name) {
        console.error('Name is missing');
        return res.status(400).json({ message: 'Name is required' });
      }

      if (!image) {
        console.error('Image is missing');
        return res.status(400).json({ message: 'Image is required' });
      }

      // Parse specifications if provided
      let parsedSpecifications = [];
      if (specifications) {
        try {
          parsedSpecifications = JSON.parse(specifications);
          if (!Array.isArray(parsedSpecifications)) {
            console.error('Specifications is not an array:', specifications);
            return res.status(400).json({ message: 'Specifications must be an array' });
          }
        } catch (error) {
          console.error('Error parsing specifications:', error);
          return res.status(400).json({ message: 'Invalid specifications format' });
        }
      }

      // Create the category with the correct image path
      const category = new Category({
        name,
        slug: req.body.slug || name.toLowerCase().replace(/\s+/g, '-'),
        image: `/uploads/categories/${image.filename}`,
        specifications: parsedSpecifications
      });

      console.log('Attempting to save category:', category);

      try {
        const savedCategory = await category.save();
        // Transform image path to include full URL
        const transformedCategory = {
          ...savedCategory.toObject(),
          image: `http://localhost:5000${savedCategory.image}`
        };
        console.log('Category created successfully:', transformedCategory);
        res.status(201).json(transformedCategory);
      } catch (saveError) {
        console.error('Error saving category to database:', saveError);
        console.error('Error details:', {
          name: saveError.name,
          message: saveError.message,
          code: saveError.code,
          keyPattern: saveError.keyPattern,
          keyValue: saveError.keyValue
        });
        res.status(500).json({ 
          message: 'Failed to save category to database',
          error: saveError.message,
          details: {
            name: saveError.name,
            code: saveError.code,
            keyPattern: saveError.keyPattern,
            keyValue: saveError.keyValue
          }
        });
      }
    } catch (error) {
      console.error('Error in category creation:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({ 
        message: 'Failed to create category',
        error: error.message,
        stack: error.stack
      });
    }
  });
});

// Update a category
router.put('/:id', auth, upload, async (req, res) => {
  try {
    const { name, specifications } = req.body;
    const image = req.file ? `/uploads/categories/${req.file.filename}` : null;

    const updateData = { name };
    if (image) {
      updateData.image = image;
    }
    if (specifications) {
      try {
        const parsedSpecifications = JSON.parse(specifications);
        if (!Array.isArray(parsedSpecifications)) {
          return res.status(400).json({ message: 'Specifications must be an array' });
        }
        updateData.specifications = parsedSpecifications;
      } catch (error) {
        console.error('Error parsing specifications:', error);
        return res.status(400).json({ message: 'Invalid specifications format' });
      }
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Transform image path to include full URL
    const transformedCategory = {
      ...updatedCategory.toObject(),
      image: updatedCategory.image.startsWith('http') ? updatedCategory.image : `http://localhost:5000${updatedCategory.image}`
    };

    res.json(transformedCategory);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ 
      message: 'Failed to update category',
      error: error.message 
    });
  }
});

// Delete a category
router.delete('/:id', auth, async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
