const express = require('express');
const router = express.Router();

// Serve EJS views
router.get('/', (req, res) => res.render('index'));
router.get('/login', (req, res) => res.render('login'));
router.get('/register', (req, res) => res.render('register'));
router.get('/products', (req, res) => res.render('products'));
router.get('/product/:id', (req, res) => res.render('product-detail', { productId: req.params.id }));
router.get('/post-ad', (req, res) => res.render('post-ad'));
router.get('/messages', (req, res) => res.render('messages'));
router.get('/dashboard', (req, res) => res.render('dashboard'));
router.get('/profile', (req, res) => res.render('profile'));
router.get('/admin', (req, res) => res.render('admin'));
router.get('/admin/users', (req, res) => res.render('admin-users'));
router.get('/admin/products', (req, res) => res.render('admin-products'));

module.exports = router;
