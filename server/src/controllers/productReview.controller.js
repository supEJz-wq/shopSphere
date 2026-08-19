const productReviewService = require('../services/productReview.service');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const getReviews = asyncHandler(async (req, res) => {
  const data = await productReviewService.getProductReviews(req.params.id);
  res.status(200).json({ success: true, ...data });
});

const getMyReview = asyncHandler(async (req, res) => {
  const review = await productReviewService.getMyReview({
    productId: req.params.id,
    userId: req.user.id,
  });
  res.status(200).json({ success: true, review });
});

const upsertReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const imageFile = req.files?.image?.[0];

  if (rating === undefined || comment === undefined || comment.trim() === '') {
    throw new AppError('Rating and comment are required.', 400);
  }

  const review = await productReviewService.createOrUpdateReview({
    productId: req.params.id,
    userId: req.user.id,
    rating: Number(rating),
    comment: comment.trim(),
    imageUrl: imageFile ? `/uploads/${imageFile.filename}` : null,
  });

  res.status(201).json({ success: true, review });
});

const deleteReview = asyncHandler(async (req, res) => {
  await productReviewService.deleteReview({
    productId: req.params.id,
    userId: req.user.id,
  });
  res.status(200).json({ success: true, message: 'Review deleted.' });
});

module.exports = {
  getReviews,
  getMyReview,
  upsertReview,
  deleteReview,
};