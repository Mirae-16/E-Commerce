const express = require('express');
const router = express.Router();

const {
  createCategory,
  getCategories,
  getCategoryBySlug,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');

const { authenticate, authorizeRoles } = require('../middleware/auth');

/**
 * @route   
 * @desc    
 * @access  
 * * @route   
 * @desc    
 * @access  
 */
router.route('/')
  .get(getCategories)
  .post(authenticate, authorizeRoles('admin'), createCategory);

/**
 * @route  
 * @desc    
 * @access
 */
router.get('/:slug', getCategoryBySlug);

/**
 * @route  
 * @desc   
 * @access  
 * * @route  
 * @desc    
 * @access
 */
router.route('/:id')
  .put(authenticate, authorizeRoles('admin'), updateCategory)
  .delete(authenticate, authorizeRoles('admin'), deleteCategory);

module.exports = router;