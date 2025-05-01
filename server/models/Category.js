const mongoose = require('mongoose');

const specificationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'number', 'select', 'checkbox'],
    required: true
  },
  options: [{
    type: String
  }],
  required: {
    type: Boolean,
    default: false
  },
  unit: {
    type: String,
    default: ''
  }
});

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v);
      },
      message: props => `${props.value} is not a valid slug! Use only lowercase letters, numbers, and hyphens.`
    }
  },
  image: {
    type: String,
    required: true
  },
  specifications: [specificationSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Pre-save middleware to generate slug from name if not provided
categorySchema.pre('save', function(next) {
  if (!this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Pre-save middleware to ensure slug is unique
categorySchema.pre('save', async function(next) {
  if (this.isModified('slug')) {
    const slugRegex = new RegExp(`^${this.slug}((-[0-9]*)?)$`, 'i');
    const categoriesWithSlug = await this.constructor.find({ slug: slugRegex });
    
    if (categoriesWithSlug.length > 0) {
      const lastCategory = categoriesWithSlug[0];
      const lastSlug = lastCategory.slug;
      const lastNumber = parseInt(lastSlug.split('-').pop());
      
      if (isNaN(lastNumber)) {
        this.slug = `${this.slug}-1`;
      } else {
        this.slug = `${this.slug}-${lastNumber + 1}`;
      }
    }
  }
  next();
});

module.exports = mongoose.model('Category', categorySchema);
