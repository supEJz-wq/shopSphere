const AppError = require('../utils/AppError');
const prisma = require('../config/prisma');

const serializeCartItem = (item) => ({
  id: item.id,
  quantity: item.quantity,
  product: {
    id: item.product.id,
    name: item.product.name,
    price: Number(item.product.price),
    image: item.product.image,
    stock: item.product.stock,
  },
});

const getCart = async (userId) => {
  const items = await prisma.cartItem.findMany({
    where: { userId },
    include: { product: true },
    orderBy: { createdAt: 'asc' },
  });

  const itemsWithTotal = items.map((item) => ({
    ...serializeCartItem(item),
    total: Number(item.product.price) * item.quantity,
  }));

  const subtotal = itemsWithTotal.reduce((sum, item) => sum + item.total, 0);

  return {
    items: itemsWithTotal,
    subtotal,
  };
};

const addToCart = async ({ userId, productId, quantity }) => {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    throw new AppError('Product not found.', 404);
  }

  const existing = await prisma.cartItem.findUnique({
    where: { userId_productId: { userId, productId } },
  });

  const newQuantity = (existing ? existing.quantity : 0) + quantity;
  if (newQuantity > product.stock) {
    throw new AppError(
      `Only ${product.stock} unit(s) of "${product.name}" are in stock.`,
      400
    );
  }

  const item = await prisma.cartItem.upsert({
    where: { userId_productId: { userId, productId } },
    update: { quantity: newQuantity },
    create: { userId, productId, quantity },
    include: { product: true },
  });

  return {
    ...serializeCartItem(item),
    total: Number(item.product.price) * item.quantity,
  };
};

const updateCartItem = async ({ userId, cartItemId, quantity }) => {
  const item = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
    include: { product: true },
  });

  if (!item) {
    throw new AppError('Cart item not found.', 404);
  }

  if (item.userId !== userId) {
    throw new AppError('You do not own this cart item.', 403);
  }

  if (quantity > item.product.stock) {
    throw new AppError(
      `Only ${item.product.stock} unit(s) of "${item.product.name}" are in stock.`,
      400
    );
  }

  const updated = await prisma.cartItem.update({
    where: { id: cartItemId },
    data: { quantity },
    include: { product: true },
  });

  return {
    ...serializeCartItem(updated),
    total: Number(updated.product.price) * updated.quantity,
  };
};

const removeCartItem = async ({ userId, cartItemId }) => {
  const item = await prisma.cartItem.findUnique({ where: { id: cartItemId } });

  if (!item) {
    throw new AppError('Cart item not found.', 404);
  }

  if (item.userId !== userId) {
    throw new AppError('You do not own this cart item.', 403);
  }

  await prisma.cartItem.delete({ where: { id: cartItemId } });
};

module.exports = { getCart, addToCart, updateCartItem, removeCartItem };
