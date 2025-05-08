const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Get user's cart
router.get('/', async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id })
      .populate({
        path: 'items.product',
        select: 'name price images modelName brand description',
        populate: {
          path: 'category',
          select: 'name'
        }
      });
    
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
      await cart.save();
    }
    
    res.json(cart.items);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: error.message });
  }
});

// Add item to cart
router.post('/', async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    let cart = await Cart.findOne({ user: req.user.id });
    
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }
    
    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );
    
    if (existingItemIndex !== -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({
        product: productId,
        quantity,
        price: product.price
      });
    }
    
    await cart.save();
    
    // Populate the cart items before sending the response
    await cart.populate({
      path: 'items.product',
      select: 'name price images modelName brand description',
      populate: {
        path: 'category',
        select: 'name'
      }
    });
    
    res.json(cart.items);
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update cart item quantity
router.put('/:productId', async (req, res) => {
  try {
    const { quantity } = req.body;
    const { productId } = req.params;
    
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );
    
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }
    
    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }
    
    await cart.save();
    
    // Populate the cart items before sending the response
    await cart.populate({
      path: 'items.product',
      select: 'name price images modelName brand description',
      populate: {
        path: 'category',
        select: 'name'
      }
    });
    
    res.json(cart.items);
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(400).json({ message: error.message });
  }
});

// Remove item from cart
router.delete('/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    cart.items = cart.items.filter(
      item => item.product.toString() !== productId
    );
    
    await cart.save();
    
    // Populate the cart items before sending the response
    await cart.populate({
      path: 'items.product',
      select: 'name price images modelName brand description',
      populate: {
        path: 'category',
        select: 'name'
      }
    });
    
    res.json(cart.items);
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(400).json({ message: error.message });
  }
});

// Clear cart
router.delete('/', async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    cart.items = [];
    await cart.save();
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 