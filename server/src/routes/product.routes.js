const express = require('express');
const productController = require('../controllers/product.controller');
const productReviewRoutes = require('./productReview.routes');

const router = express.Router();

router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);

router.use('/:id/reviews', productReviewRoutes);

module.exports = router;
