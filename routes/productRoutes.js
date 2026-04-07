const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const {
  getProducts, getProduct, createProduct,
  updateProduct, deleteProduct, getMyStats,
  updateTransactionStatus, getProductBuyers, setProductBuyer
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');

// Routes
router.get('/stats/me', protect, getMyStats);
router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', protect, upload.array('images', 6), createProduct);
router.put('/:id', protect, upload.array('images', 6), updateProduct);
router.patch('/:id/transaction-status', protect, updateTransactionStatus);
router.get('/:id/buyers', protect, getProductBuyers);
router.patch('/:id/buyer', protect, setProductBuyer);
router.delete('/:id', protect, deleteProduct);

module.exports = router;
