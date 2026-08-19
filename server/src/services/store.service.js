const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');

const getStore = async (storeId) => {
  const store = await prisma.user.findUnique({
    where: { id: storeId },
    include: {
      _count: {
        select: { products: true },
      },
      applications: {
        where: { status: 'approved' },
        select: { storeName: true, description: true },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
      products: {
        where: { status: 'active' },
        orderBy: { createdAt: 'asc' },
        take: 4,
        select: {
          id: true,
          name: true,
          image: true,
          price: true,
        },
      },
    },
  });

  if (!store || store.role !== 'seller') {
    throw new AppError('Store not found.', 404);
  }

  if (store.isBanned) {
    throw new AppError('Store not found.', 404);
  }

  const allProducts = await prisma.product.findMany({
    where: { sellerId: storeId, status: 'active' },
    select: { id: true },
  });

  const reviewAggregate = await prisma.productReview.aggregate({
    where: { productId: { in: allProducts.map((product) => product.id) } },
    _avg: { rating: true },
    _count: true,
  });

  const rating = reviewAggregate._avg.rating
    ? Number(reviewAggregate._avg.rating.toFixed(1))
    : 0;

  return {
    id: store.id,
    name: store.applications[0]?.storeName || `${store.firstName} ${store.lastName}`,
    description: store.applications[0]?.description || null,
    productCount: store._count.products,
    rating,
    reviewCount: reviewAggregate._count,
    productNames: store.products.map((product) => ({
      id: product.id,
      name: product.name,
      image: product.image,
      price: Number(product.price),
    })),
  };
};

module.exports = { getStore };