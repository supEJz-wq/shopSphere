const express = require('express');
const sellerController = require('../controllers/seller.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/authorize.middleware');
const validate = require('../middleware/validate.middleware');
const { upload } = require('../middleware/upload.middleware');
const {
  applyToSellSchema,
  createProductSchema,
  updateProductSchema,
  updateOrderItemStatusSchema,
  createAppealSchema,
  replyToWarningSchema,
  createWithdrawalSchema,
} = require('../validations/seller.validation');

const router = express.Router();

router.use(protect);

const idPhotoFields = upload.fields([
  { name: 'idFront', maxCount: 1 },
  { name: 'idBack', maxCount: 1 },
  { name: 'secondIdFront', maxCount: 1 },
  { name: 'secondIdBack', maxCount: 1 },
]);

router.post('/apply', idPhotoFields, validate(applyToSellSchema), sellerController.applyToSell);
router.get('/application', sellerController.getMyApplication);

router.get('/dashboard', authorize('seller'), sellerController.getDashboard);
router.get('/products', authorize('seller'), sellerController.getSellerProducts);
router.get('/wallet', authorize('seller'), sellerController.getWallet);
router.post(
  '/wallet/withdraw',
  authorize('seller'),
  validate(createWithdrawalSchema),
  sellerController.createWithdrawal
);
router.get('/orders', authorize('seller'), sellerController.getOrders);
router.patch(
  '/orders/:itemId/status',
  authorize('seller'),
  validate(updateOrderItemStatusSchema),
  sellerController.updateOrderItemStatus
);
router.post(
  '/appeals',
  authorize('seller'),
  upload.single('proofImage'),
  validate(createAppealSchema),
  sellerController.createAppeal
);
router.post(
  '/warnings/:warningId/reply',
  authorize('seller'),
  upload.single('proofImage'),
  validate(replyToWarningSchema),
  sellerController.replyToWarning
);
router.post(
  '/products',
  authorize('seller', 'admin'),
  upload.array('images', 5),
  validate(createProductSchema),
  sellerController.createProduct
);
router.patch(
  '/products/:productId',
  authorize('seller'),
  upload.array('images', 5),
  validate(updateProductSchema),
  sellerController.updateProduct
);
router.delete(
  '/products/:productId',
  authorize('seller'),
  sellerController.deleteProduct
);

module.exports = router;