const AppError = require('../utils/AppError');
const prisma = require('../config/prisma');

const serializeProduct = (product) => ({
  id: product.id,
  name: product.name,
  description: product.description,
  category: product.category,
  price: Number(product.price),
  stock: product.stock,
  rating: Number(product.rating),
  reviewCount: product._count?.reviews ?? 0,
  image: product.image,
  images: product.images || [],
  status: product.status || 'active',
  seller: product.seller
    ? {
        id: product.seller.id,
        name: product.seller.storeName || `${product.seller.firstName} ${product.seller.lastName}`,
        storeName: product.seller.storeName || null,
      }
    : null,
  createdAt: product.createdAt,
});

const getProducts = async () => {
  const products = await prisma.product.findMany({
    where: {
      status: 'active',
      OR: [{ sellerId: null }, { seller: { isBanned: false } }],
    },
    include: {
      _count: { select: { reviews: true } },
      seller: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          applications: {
            where: { status: 'approved' },
            select: { storeName: true },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });
  return products.map((product) => ({
    ...product,
    seller: product.seller
      ? {
          id: product.seller.id,
          firstName: product.seller.firstName,
          lastName: product.seller.lastName,
          storeName: product.seller.applications[0]?.storeName || null,
        }
      : null,
  })).map(serializeProduct);
};

const getProductById = async (id) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      _count: { select: { reviews: true } },
      seller: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          isBanned: true,
          applications: {
            where: { status: 'approved' },
            select: { storeName: true },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      },
    },
  });
  if (!product) {
    throw new AppError('Product not found.', 404);
  }
  if (product.status === 'banned') {
    throw new AppError('Product not found.', 404);
  }
  if (product.seller?.isBanned) {
    throw new AppError('Product not found.', 404);
  }
  const normalized = {
    ...product,
    seller: product.seller
      ? {
          id: product.seller.id,
          firstName: product.seller.firstName,
          lastName: product.seller.lastName,
          storeName: product.seller.applications[0]?.storeName || null,
        }
      : null,
  };
  return serializeProduct(normalized);
};

module.exports = { getProducts, getProductById };
