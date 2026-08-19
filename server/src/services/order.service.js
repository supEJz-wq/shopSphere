const AppError = require('../utils/AppError');
const prisma = require('../config/prisma');

const FREE_SHIPPING_THRESHOLD = 50;
const SHIPPING_FEE = 5.99;

const serializeOrder = (order) => ({
  id: order.id,
  status: order.status,
  subtotal: Number(order.subtotal),
  shipping: Number(order.shipping),
  total: Number(order.total),
  createdAt: order.createdAt,
  shippingAddress: {
    fullName: order.fullName,
    street: order.street,
    city: order.city,
    postalCode: order.postalCode,
    country: order.country,
  },
  items: order.items.map((item) => ({
    id: item.id,
    quantity: item.quantity,
    price: Number(item.price),
    total: Number(item.price) * item.quantity,
    product: {
      id: item.product.id,
      name: item.product.name,
      image: item.product.image,
    },
  })),
});

const getOrders = async (userId) => {
  const orders = await prisma.order.findMany({
    where: { userId },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return orders.map(serializeOrder);
};

const getOrderById = async ({ userId, orderId }) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } } },
  });

  if (!order) {
    throw new AppError('Order not found.', 404);
  }

  if (order.userId !== userId) {
    throw new AppError('You do not have access to this order.', 403);
  }

  return serializeOrder(order);
};

const checkout = async ({ userId, shippingAddress }) => {
  const cart = await prisma.cartItem.findMany({
    where: { userId },
    include: { product: true },
    orderBy: { createdAt: 'asc' },
  });

  if (cart.length === 0) {
    throw new AppError('Your cart is empty. Add some items before checking out.', 400);
  }

  for (const item of cart) {
    if (item.quantity > item.product.stock) {
      throw new AppError(
        `Only ${item.product.stock} unit(s) of "${item.product.name}" are in stock.`,
        400
      );
    }
  }

  const items = cart.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
    price: item.product.price,
  }));

  const subtotal = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = subtotal + shipping;

  const order = await prisma.$transaction(async (tx) => {
    for (const item of items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    const created = await tx.order.create({
      data: {
        userId,
        subtotal,
        shipping,
        total,
        fullName: shippingAddress.fullName,
        street: shippingAddress.street,
        city: shippingAddress.city,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: { items: { include: { product: true } } },
    });

    await tx.cartItem.deleteMany({ where: { userId } });

    return created;
  });

  return serializeOrder(order);
};

module.exports = { getOrders, getOrderById, checkout };
