const express = require('express');
const authRoutes = require('./auth.routes');
const productRoutes = require('./product.routes');
const cartRoutes = require('./cart.routes');
const orderRoutes = require('./order.routes');
const sellerRoutes = require('./seller.routes');
const adminRoutes = require('./admin.routes');
const storeRoutes = require('./store.routes');
const reportRoutes = require('./report.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/seller', sellerRoutes);
router.use('/admin', adminRoutes);
router.use('/stores', storeRoutes);
router.use('/reports', reportRoutes);

module.exports = router;
