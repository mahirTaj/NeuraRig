const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

// Create a new order
router.post('/', auth, async (req, res) => {
  try {
    // Validate required fields
    const { items, total, shippingAddress, paymentMethod } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain items' });
    }
    
    if (total === undefined || total <= 0) {
      return res.status(400).json({ message: 'Invalid order total' });
    }
    
    if (!shippingAddress) {
      return res.status(400).json({ message: 'Shipping address is required' });
    }
    
    if (!paymentMethod) {
      return res.status(400).json({ message: 'Payment method is required' });
    }
    
    // Check product stock before proceeding
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product with ID ${item.product} not found` });
      }
      
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Not enough stock available for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}` 
        });
      }
    }
    
    // Create order with user ID from auth middleware
    const order = new Order({
      user: req.user.id,
      items,
      total,
      shippingAddress,
      paymentMethod,
      status: req.body.status || 'processing'
    });
    
    // Save the order
    const savedOrder = await order.save();
    
    // Update product stock
    for (const item of items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.quantity } },
        { new: true }
      );
    }
    
    // Return the created order
    res.status(201).json(savedOrder);
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Get all orders (admin only)
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const orders = await Order.find().populate('user', 'username email').populate('items.product', 'name');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's orders
router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate({
        path: 'items.product',
        select: 'name price images category',
        populate: {
          path: 'category',
          select: 'name'
        }
      })
      .sort({ createdAt: -1 }); // Sort by newest first
    
    res.json(orders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get order by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product', 'name');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update order status (admin only)
router.patch('/:id/status', auth, async (req, res) => {
  try {
    // Verify admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Only admins can update order status' });
    }

    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['processing', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const order = await Order.findById(req.params.id)
      .populate('items.product');
      
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // If changing to cancelled status and order was not already cancelled,
    // restore product stock
    if (status === 'cancelled' && order.status !== 'cancelled') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(
          item.product._id,
          { $inc: { stock: item.quantity } },
          { new: true }
        );
        console.log(`Restored ${item.quantity} units to product ${item.product.name} (${item.product._id})`);
      }
    }

    // Update the order status
    order.status = status;
    await order.save();

    // Populate user info before returning
    await order.populate('user', 'name email');
    await order.populate('items.product', 'name');

    res.json(order);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: error.message });
  }
});

// Cancel user's own order
router.patch('/:id/cancel', auth, async (req, res) => {
  console.log(`Cancel order request received for order ID: ${req.params.id}`);
  console.log(`User making the request: ${req.user.id}`);
  
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product');
    
    if (!order) {
      console.log(`Order not found: ${req.params.id}`);
      return res.status(404).json({ message: 'Order not found' });
    }
    
    console.log(`Order found: ${order._id}, status: ${order.status}, user: ${order.user}`);
    
    // Check if this order belongs to the authenticated user
    if (order.user.toString() !== req.user.id) {
      console.log(`Access denied. Order user: ${order.user}, Request user: ${req.user.id}`);
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Only allow cancellation if order is still processing
    if (order.status !== 'processing') {
      console.log(`Cannot cancel order with status: ${order.status}`);
      return res.status(400).json({ message: 'Only processing orders can be cancelled' });
    }
    
    // Restore product stock for each item in the order
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product._id,
        { $inc: { stock: item.quantity } },
        { new: true }
      );
      console.log(`Restored ${item.quantity} units to product ${item.product.name} (${item.product._id})`);
    }
    
    // Update the status to cancelled
    order.status = 'cancelled';
    await order.save();
    console.log(`Order ${order._id} successfully cancelled`);
    
    // Return the updated order
    res.json(order);
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ message: error.message });
  }
});

// Admin: Get all orders (for admin management)
router.get('/', auth, async (req, res) => {
  try {
    // Verify admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Only admins can view all orders' });
    }

    const orders = await Order.find()
      .populate('user', 'name email') // Include user info (name and email)
      .populate('items.product', 'name') // Include product names
      .sort({ createdAt: -1 }); // Sort by newest first

    res.json(orders);
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 