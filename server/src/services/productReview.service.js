const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');

const serializeReview = (review) => ({
  id: review.id,
  rating: review.rating,
  comment: review.comment,
  imageUrl: review.imageUrl,
  createdAt: review.createdAt,
  user: {
    id: review.user.id,
    firstName: review.user.firstName,
    lastName: review.user.lastName,
  },
});

const getProductReviews = async (productId) => {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      reviews: {
        include: {
          user: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!product) {
    throw new AppError('Product not found.', 404);
  }

  const reviews = product.reviews;
  const average = reviews.length
    ? Number((reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1))
    : 0;

  return {
    rating: average,
    reviewCount: reviews.length,
    reviews: reviews.map(serializeReview),
  };
};

const getMyReview = async ({ productId, userId }) => {
  const review = await prisma.productReview.findUnique({
    where: { productId_userId: { productId, userId } },
    include: {
      user: { select: { id: true, firstName: true, lastName: true } },
    },
  });
  return review ? serializeReview(review) : null;
};

const createOrUpdateReview = async ({ productId, userId, rating, comment, imageUrl }) => {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    throw new AppError('Product not found.', 404);
  }
  if (product.sellerId === userId) {
    throw new AppError('You cannot review your own product.', 400);
  }

  const review = await prisma.productReview.upsert({
    where: { productId_userId: { productId, userId } },
    update: { rating, comment, imageUrl },
    create: { productId, userId, rating, comment, imageUrl },
    include: {
      user: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  return serializeReview(review);
};

const deleteReview = async ({ productId, userId }) => {
  await prisma.productReview.deleteMany({ where: { productId, userId } });
};

module.exports = {
  getProductReviews,
  getMyReview,
  createOrUpdateReview,
  deleteReview,
};