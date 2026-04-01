const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/admin');
const {
  getDashboardStats, getAllUsers, updateUser, deleteUser,
  getAllProducts, updateProduct, deleteProduct, removeProductImage
} = require('../controllers/adminController');

// All routes require admin
router.use(protect, isAdmin);

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/products', getAllProducts);
router.put('/products/:id', upload.array('images', 6), updateProduct);
router.delete('/products/:id', deleteProduct);
router.delete('/products/:id/images/:index', removeProductImage);

module.exports = router;
