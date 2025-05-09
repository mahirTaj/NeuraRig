const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

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
    
    // Validate product stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    if (product.stock < quantity) {
      return res.status(400).json({ 
        message: `Not enough stock available. Available: ${product.stock}, Requested: ${quantity}` 
      });
    }
    
    let cart = await Cart.findOne({ user: req.user.id });
    
    if (!cart) {
      // Create new cart if it doesn't exist
      cart = new Cart({
        user: req.user.id,
        items: [{ 
          product: productId, 
          quantity,
          price: product.price
        }]
      });
    } else {
      // Check if product exists in cart
      const itemIndex = cart.items.findIndex(
        item => item.product.toString() === productId
      );
      
      if (itemIndex > -1) {
        // Product exists in cart, update the quantity
        const newQuantity = cart.items[itemIndex].quantity + quantity;
        
        // Check if the new total quantity exceeds available stock
        if (product.stock < newQuantity) {
          return res.status(400).json({ 
            message: `Cannot add ${quantity} more of this item. Current cart: ${cart.items[itemIndex].quantity}, Available stock: ${product.stock}` 
          });
        }
        
        cart.items[itemIndex].quantity = newQuantity;
        // Ensure price is updated to current price
        cart.items[itemIndex].price = product.price;
      } else {
        // Product does not exist in cart, add new item
        cart.items.push({ 
          product: productId, 
          quantity,
          price: product.price
        });
      }
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
    
    res.status(200).json(cart.items);
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
    
    // Check product stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check if requested quantity exceeds available stock
    if (quantity > product.stock) {
      return res.status(400).json({ 
        message: `Cannot update quantity. Requested: ${quantity}, Available stock: ${product.stock}` 
      });
    }
    
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
      // Ensure price is updated to the current price
      cart.items[itemIndex].price = product.price;
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