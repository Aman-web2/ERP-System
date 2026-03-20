const express = require('express');
const router = express.Router();
const {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  adjustStock,
  getStockMovements,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier
} = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/categories')
  .get(protect, getCategories)
  .post(protect, authorize('Admin', 'Accountant'), createCategory);
router.route('/categories/:id')
  .put(protect, authorize('Admin', 'Accountant'), updateCategory)
  .delete(protect, authorize('Admin'), deleteCategory);

router.route('/suppliers')
  .get(protect, getSuppliers)
  .post(protect, authorize('Admin', 'Accountant'), createSupplier);
router.route('/suppliers/:id')
  .put(protect, authorize('Admin', 'Accountant'), updateSupplier)
  .delete(protect, authorize('Admin'), deleteSupplier);

router.route('/products')
  .get(protect, getProducts)
  .post(protect, authorize('Admin', 'Accountant'), createProduct);
router.route('/products/:id')
  .put(protect, authorize('Admin', 'Accountant'), updateProduct)
  .delete(protect, authorize('Admin'), deleteProduct);
router.post('/products/:id/stock', protect, authorize('Admin', 'Accountant'), adjustStock);
router.get('/movements', protect, getStockMovements);

module.exports = router;

