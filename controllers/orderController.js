const Order = require('../models/Order');
const Product = require('../models/Product');

/**
 * @desc    Create a new order (Checkout)
 * @route   POST /api/orders
 * @access  Private
 */
const createOrder = async (req, res, next) => {
  try {
    const { orderItems, shippingAddress, paymentMethod } = req.body;

    if (!orderItems || orderItems.length === 0) {
      const error = new Error('No order items provided');
      error.statusCode = 400;
      throw error;
    }

    let itemsPrice = 0;
    const verifiedOrderItems = [];

    for (const item of orderItems) {
      const dbProduct = await Product.findById(item.product);
      
      if (!dbProduct) {
        const error = new Error(`Product with ID ${item.product} not found`);
        error.statusCode = 404;
        throw error;
      }

      if (dbProduct.countInStock < item.qty) {
        const error = new Error(`Insufficient stock for product: ${dbProduct.name}`);
        error.statusCode = 400;
        throw error;
      }

      itemsPrice += dbProduct.price * item.qty;

      dbProduct.countInStock -= item.qty;
      await dbProduct.save();

      verifiedOrderItems.push({
        name: dbProduct.name,
        qty: item.qty,
        image: dbProduct.image || dbProduct.images[0],
        price: dbProduct.price,
        product: dbProduct._id
      });
    }

    const shippingPrice = itemsPrice > 100 ? 0 : 10;
    const taxPrice = Number((0.08 * itemsPrice).toFixed(2));
    const totalPrice = itemsPrice + shippingPrice + taxPrice;

    const order = await Order.create({
      user: req.user.id, 
      orderItems: verifiedOrderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      isPaid: false 
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get order by ID
 * @route   GET /api/orders/:id
 * @access  Private (Owner or Admin)
 */
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      const error = new Error('Order not found');
      error.statusCode = 404;
      throw error;
    }

    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      const error = new Error('Not authorized to view this order');
      error.statusCode = 403;
      throw error;
    }

    res.status(200).json({
      success: true,
      order
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get logged-in user's orders
 * @route   GET /api/orders/myorders
 * @access  Private
 */
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all orders (Admin Dashboard view)
 * @route   GET /api/orders
 * @access  Private/Admin
 */
const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'id name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update order status to delivered/shipped
 * @route   PUT /api/orders/:id/deliver
 * @access  Private/Admin
 */
const updateOrderToDelivered = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      const error = new Error('Order not found');
      error.statusCode = 404;
      throw error;
    }

    order.isDelivered = true;
    order.deliveredAt = Date.now();
    order.status = 'Delivered'; 

    const updatedOrder = await order.save();

    res.status(200).json({
      success: true,
      message: 'Order marked as delivered',
      order: updatedOrder
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getOrderById,
  getMyOrders,
  getAllOrders,
  updateOrderToDelivered
};