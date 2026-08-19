const express = require('express');
const cartController = require('../controllers/cart.controller');
const { protect } = require('../middleware/auth.middleware');
const { restrictBuying } = require('../middleware/authorize.middleware');
const validate = require('../middleware/validate.middleware');
const {
  addToCartSchema,
  updateCartSchema,
} = require('../validations/cart.validation');

const router = express.Router();

router.use(protect);
router.use(restrictBuying('seller', 'admin'));

router.get('/', cartController.getCart);
router.post('/', validate(addToCartSchema), cartController.addToCart);
router.put('/:id', validate(updateCartSchema), cartController.updateCartItem);
router.delete('/:id', cartController.removeCartItem);

module.exports = router;
