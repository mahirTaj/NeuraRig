const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true
  },
  logo: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Generate slug from name before saving
brandSchema.pre('save', function(next) {
  if (this.name && (!this.slug || this.isModified('name'))) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  }
  next();
});

module.exports = mongoose.model('Brand', brandSchema); 