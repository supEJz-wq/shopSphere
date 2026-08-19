const express = require('express');
const productReviewController = require('../controllers/productReview.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/authorize.middleware');
const validate = require('../middleware/validate.middleware');
const { upload } = require('../middleware/upload.middleware');
const { createReviewSchema } = require('../validations/store.validation');

const router = express.Router({ mergeParams: true });

router.get('/', productReviewController.getReviews);

router.get('/me', protect, productReviewController.getMyReview);
router.post(
  '/',
  protect,
  authorize('customer'),
  upload.fields([{ name: 'image', maxCount: 1 }]),
  validate(createReviewSchema),
  productReviewController.upsertReview
);
router.delete('/', protect, authorize('customer'), productReviewController.deleteReview);

module.exports = router;