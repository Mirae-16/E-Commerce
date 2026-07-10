const Cart = require('../models/Cart');
const Product = require('../models/Product');

/**
 * @desc    Get logged-in user's cart
 * @route   GET /api/cart
 * @access  Private
 */
const getCart = async (req, res, next) => {
  try {
    // Find the cart belonging to the user and populate product details
    let cart = await Cart.findOne({ user: req.user.id }).populate('items.product', 'name price image countInStock');

    // If no cart exists yet for this user, create an empty one
    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }

    res.status(200).json({
      success: true,
      cart
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add item to cart (or increase quantity if it already exists)
 * @route   POST /api/cart
 * @access  Private
 */
const addItemToCart = async (req, res, next) => {
  try {
    const { productId, qty } = req.body;
    const quantity = Number(qty) || 1;

    // 1. Verify product exists and check inventory limits
    const product = await Product.findById(productId);
    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }

    if (product.countInStock < quantity) {
      const error = new Error(`Only ${product.countInStock} units left in stock.`);
      error.statusCode = 400;
      throw error;
    }

    // 2. Retrieve user's cart or initialize a new one
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }

    // 3. Check if product already exists in the cart array
    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

    if (itemIndex > -1) {
      // Product exists -> check total combined quantity against stock levels
      const newQty = cart.items[itemIndex].qty + quantity;
      if (product.countInStock < newQty) {
        const error = new Error(`Cannot add more. Max available stock reached.`);
        error.statusCode = 400;
        throw error;
      }
      cart.items[itemIndex].qty = newQty;
    } else {
      // Product doesn't exist -> push new line item
      cart.items.push({ product: productId, qty: quantity });
    }

    await cart.save();
    
    // Return the updated cart with fully populated product details
    const updatedCart = await Cart.findOne({ user: req.user.id }).populate('items.product', 'name price image countInStock');

    res.status(200).json({
      success: true,
      message: 'Item added to cart',
      cart: updatedCart
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update specific item quantity from the cart
 * @route   PUT /api/cart/update-qty
 * @access  Private
 */
const updateCartItemQty = async (req, res, next) => {
  try {
    const { productId, qty } = req.body;
    const targetQty = Number(qty);

    if (targetQty <= 0) {
      const error = new Error('Quantity must be greater than 0. Use delete to remove.');
      error.statusCode = 400;
      throw error;
    }

    // Verify stock availability first
    const product = await Product.findById(productId);
    if (!product || product.countInStock < targetQty) {
      const error = new Error('Requested quantity exceeds available stock.');
      error.statusCode = 400;
      throw error;
    }

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      const error = new Error('Cart not found');
      error.statusCode = 404;
      throw error;
    }

    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
    if (itemIndex === -1) {
      const error = new Error('Item not found in your cart');
      error.statusCode = 404;
      throw error;
    }

    // Assign the explicit new quantity
    cart.items[itemIndex].qty = targetQty;
    await cart.save();

    const updatedCart = await Cart.findOne({ user: req.user.id }).populate('items.product', 'name price image countInStock');

    res.status(200).json({
      success: true,
      message: 'Cart updated successfully',
      cart: updatedCart
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove an item entirely from cart
 * @route   DELETE /api/cart/:productId
 * @access  Private
 */
const removeItemFromCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    
    if (!cart) {
      const error = new Error('Cart not found');
      error.statusCode = 404;
      throw error;
    }

    // Filter out the item to delete it
    cart.items = cart.items.filter(item => item.product.toString() !== req.params.productId);
    
    await cart.save();
    const updatedCart = await Cart.findOne({ user: req.user.id }).populate('items.product', 'name price image countInStock');

    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      cart: updatedCart
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Clear entire cart (Useful after successful checkout)
 * @route   DELETE /api/cart
 * @access  Private
 */
const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      cart
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addItemToCart,
  updateCartItemQty,
  removeItemFromCart,
  clearCart
};