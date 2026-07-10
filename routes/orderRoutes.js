const express = require('express');
const router = express.Router();

const {
  createOrder,
  getOrderById,
  getMyOrders,
  getAllOrders,
  updateOrderToDelivered
} = require('../controllers/orderController');

const { authenticate, authorizeRoles } = require('../middleware/auth');


router.use(authenticate);

/**
 * @route   POST /api/orders
 * @desc    Submit a checkout basket and generate a new pending order
 * @access  Private (Logged-in Customers)
 * * @route   GET /api/orders
 * @desc    Retrieve all store orders across all users for analytics/fulfillment
 * @access  Private/Admin
 */
router.route('/')
  .post(createOrder)
  .get(authorizeRoles('admin'), getAllOrders);

/**
 * @route   GET /api/orders/myorders
 * @desc    Fetch the full order history profile of the logged-in user
 * @access  Private (Logged-in Customers)
 */
router.get('/myorders', getMyOrders);

/**
 * @route   GET /api/orders/:id
 * @desc    Fetch specific structural details of an order via its database ID
 * @access  Private (Order Owner or Admin only)
 */
router.get('/:id', getOrderById);

/**
 * @route   PUT /api/orders/:id/deliver
 * @desc    Update order status to completed/delivered when shipment arrives
 * @access  Private/Admin
 */
router.put('/:id/deliver', authorizeRoles('admin'), updateOrderToDelivered);

module.exports = router;