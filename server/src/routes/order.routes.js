const express = require('express');
const orderController = require('../controllers/order.controller');
const { protect } = require('../middleware/auth.middleware');
const { restrictBuying } = require('../middleware/authorize.middleware');
const validate = require('../middleware/validate.middleware');
const { checkoutSchema } = require('../validations/order.validation');

const router = express.Router();

router.use(protect);
router.use(restrictBuying('seller', 'admin'));

router.post('/checkout', validate(checkoutSchema), orderController.checkout);
router.get('/', orderController.getOrders);
router.get('/:id', orderController.getOrderById);

module.exports = router;