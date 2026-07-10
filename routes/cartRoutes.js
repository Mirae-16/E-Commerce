const express = require('express');
const router = express.Router();

const {
  getCart,
  addItemToCart,
  updateCartItemQty,
  removeItemFromCart,
  clearCart
} = require('../controllers/cartController');

const { authenticate } = require('../middleware/auth');


router.use(authenticate);

/**
 * @route   GET /api/cart
 * @desc    Fetch the logged-in user's cart items
 * * @route   POST /api/cart
 * @desc    Add an item to the cart (or increment quantity if it exists)
 * * @route   DELETE /api/cart
 * @desc    Empty out the user's entire cart basket
 */
router.route('/')
  .get(getCart)
  .post(addItemToCart)
  .delete(clearCart);

/**
 * @route   PUT /api/cart/update-qty
 * @desc    Explicitly update an item's target quantity (expects body: { productId, qty })
 */
router.put('/update-qty', updateCartItemQty);

/**
 * @route   DELETE /api/cart/:productId
 * @desc    Remove an entire product item completely from the cart array via its ID URL parameter
 */
router.delete('/:productId', removeItemFromCart);

module.exports = router;