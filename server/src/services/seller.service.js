const AppError = require('../utils/AppError');
const prisma = require('../config/prisma');

const assertSellerActive = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isBanned: true },
  });
  if (user?.isBanned) {
    throw new AppError('Your shop has been banned. Contact support for assistance.', 403);
  }
};

const serializeApplication = (application) => ({
  id: application.id,
  storeName: application.storeName,
  businessEmail: application.businessEmail,
  description: application.description,
  phoneNumber: application.phoneNumber,
  idType: application.idType,
  idNumber: application.idNumber,
  idFrontUrl: application.idFrontUrl,
  idBackUrl: application.idBackUrl,
  secondIdType: application.secondIdType,
  secondIdNumber: application.secondIdNumber,
  secondIdFrontUrl: application.secondIdFrontUrl,
  secondIdBackUrl: application.secondIdBackUrl,
  status: application.status,
  reviewNote: application.reviewNote,
  reviewedAt: application.reviewedAt,
  createdAt: application.createdAt,
});

const applyToSell = async ({ userId, storeName, businessEmail, description, phoneNumber, idType, idNumber, idFrontUrl, idBackUrl, secondIdType, secondIdNumber, secondIdFrontUrl, secondIdBackUrl }) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user.role === 'seller') {
    throw new AppError('You are already a seller.', 400);
  }
  if (user.role === 'admin') {
    throw new AppError('Admin accounts cannot apply to be sellers.', 400);
  }

  const existing = await prisma.sellerApplication.findUnique({ where: { userId } });

  if (existing && existing.status === 'pending') {
    throw new AppError('You already have a pending application.', 409);
  }
  if (existing && existing.status === 'approved') {
    throw new AppError('Your seller application was already approved.', 409);
  }

  const application = await prisma.sellerApplication.upsert({
    where: { userId },
    update: {
      storeName,
      businessEmail,
      description,
      phoneNumber,
      idType,
      idNumber,
      idFrontUrl,
      idBackUrl,
      secondIdType,
      secondIdNumber,
      secondIdFrontUrl,
      secondIdBackUrl,
      status: 'pending',
      reviewNote: null,
      reviewedAt: null,
    },
    create: {
      userId,
      storeName,
      businessEmail,
      description,
      phoneNumber,
      idType,
      idNumber,
      idFrontUrl,
      idBackUrl,
      secondIdType,
      secondIdNumber,
      secondIdFrontUrl,
      secondIdBackUrl,
    },
  });

  return serializeApplication(application);
};

const getMyApplication = async (userId) => {
  const application = await prisma.sellerApplication.findUnique({ where: { userId } });
  if (!application) return null;
  return serializeApplication(application);
};

const serializeProduct = (product) => ({
  id: product.id,
  name: product.name,
  description: product.description,
  category: product.category,
  price: Number(product.price),
  stock: product.stock,
  rating: Number(product.rating),
  image: product.image,
  images: product.images || [],
  status: product.status || 'active',
  createdAt: product.createdAt,
});

const getSellerProducts = async (userId) => {
  const products = await prisma.product.findMany({
    where: { sellerId: userId },
    orderBy: { createdAt: 'desc' },
  });
  return products.map(serializeProduct);
};

const createProduct = async ({ sellerId, data }) => {
  await assertSellerActive(sellerId);
  const product = await prisma.product.create({
    data: {
      ...data,
      rating: 0,
      sellerId,
    },
  });
  return serializeProduct(product);
};

const updateProduct = async ({ sellerId, productId, data }) => {
  await assertSellerActive(sellerId);
  const existing = await prisma.product.findUnique({ where: { id: productId } });
  if (!existing || existing.sellerId !== sellerId) {
    throw new AppError('Product not found.', 404);
  }

  const product = await prisma.product.update({
    where: { id: productId },
    data,
  });
  return serializeProduct(product);
};

const deleteProduct = async ({ sellerId, productId }) => {
  await assertSellerActive(sellerId);
  const existing = await prisma.product.findUnique({ where: { id: productId } });
  if (!existing || existing.sellerId !== sellerId) {
    throw new AppError('Product not found.', 404);
  }

  await prisma.product.delete({ where: { id: productId } });
  return { id: productId };
};

const getSellerFeedbacks = async (userId, productIds) => {
  const orderItems = await prisma.orderItem.findMany({
    where: { productId: { in: productIds } },
    include: {
      product: true,
      order: {
        include: {
          user: { select: { id: true, firstName: true, lastName: true } },
          items: { where: { productId: { in: productIds } }, include: { product: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const seen = new Set();
  return orderItems
    .filter((item) => {
      if (seen.has(item.orderId)) return false;
      seen.add(item.orderId);
      return true;
    })
    .map((item) => ({
      orderId: item.order.id,
      customer: {
        name: `${item.order.user?.firstName || ''} ${item.order.user?.lastName || ''}`.trim(),
      },
      total: Number(item.order.total),
      createdAt: item.order.createdAt,
      items: item.order.items.map((oi) => ({
        id: oi.id,
        quantity: oi.quantity,
        price: Number(oi.price),
        productName: oi.product.name,
      })),
    }));
};

const getSellerOrders = async (userId) => {
  await assertSellerActive(userId);
  const productIds = await prisma.product.findMany({
    where: { sellerId: userId },
    select: { id: true },
  }).then((rows) => rows.map((row) => row.id));

  if (productIds.length === 0) return [];

  const orderItems = await prisma.orderItem.findMany({
    where: { productId: { in: productIds } },
    include: {
      product: { select: { id: true, name: true, image: true } },
      order: {
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const grouped = new Map();
  for (const item of orderItems) {
    const key = item.orderId;
    if (!grouped.has(key)) {
      grouped.set(key, {
        id: item.order.id,
        status: item.order.status,
        createdAt: item.order.createdAt,
        customer: {
          name: `${item.order.user?.firstName || ''} ${item.order.user?.lastName || ''}`.trim(),
          email: item.order.user?.email || '',
        },
        shippingAddress: {
          fullName: item.order.fullName,
          street: item.order.street,
          city: item.order.city,
          postalCode: item.order.postalCode,
          country: item.order.country,
        },
        items: [],
      });
    }
    grouped.get(key).items.push({
      id: item.id,
      quantity: item.quantity,
      price: Number(item.price),
      status: item.status || 'processing',
      product: {
        id: item.product.id,
        name: item.product.name,
        image: item.product.image,
      },
    });
  }

  return Array.from(grouped.values());
};

const updateOrderItemStatus = async ({ userId, orderItemId, status }) => {
  await assertSellerActive(userId);
  const item = await prisma.orderItem.findUnique({
    where: { id: orderItemId },
    include: { product: { select: { sellerId: true } } },
  });

  if (!item) {
    throw new AppError('Order item not found.', 404);
  }
  if (item.product.sellerId !== userId) {
    throw new AppError('You do not have permission to update this order item.', 403);
  }

  return prisma.orderItem.update({
    where: { id: orderItemId },
    data: { status },
  });
};

const getSellerWallet = async (userId) => {
  await assertSellerActive(userId);

  const [productIds, withdrawals] = await Promise.all([
    prisma.product
      .findMany({ where: { sellerId: userId }, select: { id: true } })
      .then((rows) => rows.map((row) => row.id)),
    prisma.withdrawal.findMany({
      where: { sellerId: userId },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const serializeWithdrawal = (w) => ({
    id: w.id,
    amount: Number(w.amount),
    fee: Number(w.fee),
    method: w.method,
    status: w.status,
    receiptNumber: w.receiptNumber,
    createdAt: w.createdAt,
    processedAt: w.processedAt,
  });

  const withdrawn = withdrawals
    .filter((w) => w.status !== 'cancelled' && w.status !== 'rejected')
    .reduce((sum, w) => sum + Number(w.amount), 0);

  const base = {
    totals: {
      totalRevenue: 0,
      pending: 0,
      shipped: 0,
      cancelled: 0,
      unitsSold: 0,
      withdrawn,
      balance: 0,
    },
    history: [],
    withdrawals: withdrawals.map(serializeWithdrawal),
  };

  if (productIds.length === 0) {
    return base;
  }

  const orderItems = await prisma.orderItem.findMany({
    where: { productId: { in: productIds } },
    include: {
      product: { select: { id: true, name: true, image: true } },
      order: {
        select: {
          id: true,
          user: { select: { firstName: true, lastName: true, email: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  let pending = 0;
  let shipped = 0;
  let cancelled = 0;
  let unitsSold = 0;

  const history = orderItems.map((item) => {
    const amount = Number(item.price) * item.quantity;
    const status = item.status || 'processing';
    if (status === 'processing') {
      pending += amount;
      unitsSold += item.quantity;
    } else if (status === 'shipped') {
      shipped += amount;
      unitsSold += item.quantity;
    } else if (status === 'cancelled') {
      cancelled += amount;
    }
    return {
      id: item.id,
      orderId: item.orderId,
      quantity: item.quantity,
      price: Number(item.price),
      amount,
      status,
      createdAt: item.createdAt,
      product: {
        id: item.product.id,
        name: item.product.name,
        image: item.product.image,
      },
      customer: {
        name: `${item.order.user?.firstName || ''} ${item.order.user?.lastName || ''}`.trim(),
        email: item.order.user?.email || '',
      },
    };
  });

  const totalRevenue = pending + shipped;

  return {
    totals: {
      totalRevenue,
      pending,
      shipped,
      cancelled,
      unitsSold,
      withdrawn,
      balance: totalRevenue - withdrawn,
    },
    history,
    withdrawals: withdrawals.map(serializeWithdrawal),
  };
};

const WITHDRAWAL_METHODS = new Set(['bank_transfer', 'gcash', 'paypal']);
const WITHDRAWAL_FEE_RATE = 0.02;

const generateReceiptNumber = async () => {
  const date = new Date();
  const stamp = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(
    date.getDate()
  ).padStart(2, '0')}`;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const seq = Math.floor(1000 + Math.random() * 9000);
    const receiptNumber = `WD-${stamp}-${seq}`;
    const existing = await prisma.withdrawal.findUnique({ where: { receiptNumber } });
    if (!existing) return receiptNumber;
  }
  return `WD-${stamp}-${Math.floor(100000 + Math.random() * 900000)}`;
};

const createWithdrawal = async ({ userId, amount, method = 'bank_transfer' }) => {
  await assertSellerActive(userId);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new AppError('Withdrawal amount must be greater than zero.', 400);
  }
  if (!WITHDRAWAL_METHODS.has(method)) {
    throw new AppError('Invalid withdrawal method.', 400);
  }

  const wallet = await getSellerWallet(userId);
  const available = wallet.totals.balance;

  if (amount > available) {
    throw new AppError('Withdrawal amount exceeds your available balance.', 400);
  }

  const fee = Number((amount * WITHDRAWAL_FEE_RATE).toFixed(2));
  const receiptNumber = await generateReceiptNumber();

  const withdrawal = await prisma.withdrawal.create({
    data: { sellerId: userId, amount, fee, method, status: 'processing', receiptNumber },
  });

  return {
    id: withdrawal.id,
    amount: Number(withdrawal.amount),
    fee,
    net: Number((Number(withdrawal.amount) - fee).toFixed(2)),
    method: withdrawal.method,
    status: withdrawal.status,
    receiptNumber: withdrawal.receiptNumber,
    createdAt: withdrawal.createdAt,
    available,
  };
};

const getSellerWithdrawals = async (userId) => {
  await assertSellerActive(userId);
  const withdrawals = await prisma.withdrawal.findMany({
    where: { sellerId: userId },
    orderBy: { createdAt: 'desc' },
  });
  return withdrawals.map((w) => ({
    id: w.id,
    amount: Number(w.amount),
    fee: Number(w.fee),
    method: w.method,
    status: w.status,
    receiptNumber: w.receiptNumber,
    createdAt: w.createdAt,
    processedAt: w.processedAt,
  }));
};

const getDashboard = async (userId) => {
  const application = await getMyApplication(userId);
  const profile = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, firstName: true, lastName: true, email: true, role: true, isBanned: true },
  });

  const warnings = await prisma.sellerWarning.findMany({
    where: { sellerId: userId },
    include: { replies: { orderBy: { createdAt: 'asc' } } },
    orderBy: { createdAt: 'desc' },
  });

  const banAppeals = await prisma.banAppeal.findMany({
    where: { sellerId: userId },
    include: {
      product: { select: { id: true, name: true, image: true, status: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const products = await getSellerProducts(userId);
  const productIds = products.map((product) => product.id);
  const orders =
    productIds.length > 0 ? await getSellerFeedbacks(userId, productIds) : [];

  const soldQuantity = orders.reduce(
    (sum, order) =>
      sum +
      order.items.reduce((s, item) => s + item.quantity, 0),
    0
  );

  return {
    profile,
    application,
    products,
    orders,
    warnings: warnings.map((w) => ({
      id: w.id,
      message: w.message,
      createdAt: w.createdAt,
      replies: w.replies.map((r) => ({
        id: r.id,
        message: r.message,
        imageUrl: r.imageUrl,
        createdAt: r.createdAt,
      })),
    })),
    banAppeals: banAppeals.map((a) => ({
      id: a.id,
      targetType: a.targetType,
      reason: a.reason,
      imageUrl: a.imageUrl || null,
      status: a.status,
      adminNote: a.adminNote,
      reviewedAt: a.reviewedAt,
      createdAt: a.createdAt,
      product: a.product
        ? { id: a.product.id, name: a.product.name, image: a.product.image, status: a.product.status }
        : null,
    })),
    totals: {
      products: products.length,
      orders: orders.length,
      soldQuantity,
    },
  };
};

const serializeAppeal = (appeal) => ({
  id: appeal.id,
  targetType: appeal.targetType,
  reason: appeal.reason,
  imageUrl: appeal.imageUrl || null,
  status: appeal.status,
  adminNote: appeal.adminNote,
  reviewedAt: appeal.reviewedAt,
  createdAt: appeal.createdAt,
});

const createAppeal = async ({ sellerId, targetType, productId, reason, imageUrl }) => {
  let existing = null;

  if (targetType === 'shop') {
    const user = await prisma.user.findUnique({
      where: { id: sellerId },
      select: { isBanned: true },
    });
    if (!user?.isBanned) {
      throw new AppError('Your shop is not banned.', 400);
    }
    existing = await prisma.banAppeal.findFirst({
      where: { sellerId, targetType: 'shop', status: 'pending' },
    });
  } else if (targetType === 'product') {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || product.sellerId !== sellerId) {
      throw new AppError('Product not found.', 404);
    }
    if (product.status !== 'banned') {
      throw new AppError('This product is not banned.', 400);
    }
    existing = await prisma.banAppeal.findFirst({
      where: { sellerId, targetType: 'product', productId, status: 'pending' },
    });
  } else {
    throw new AppError('Invalid appeal target.', 400);
  }

  if (existing) {
    throw new AppError('You already have a pending appeal for this ban.', 409);
  }

  const appeal = await prisma.banAppeal.create({
    data: {
      sellerId,
      targetType,
      productId: targetType === 'product' ? productId : null,
      reason,
      imageUrl: imageUrl || null,
    },
  });

  return serializeAppeal(appeal);
};

const replyToWarning = async ({ sellerId, warningId, message, imageUrl }) => {
  const warning = await prisma.sellerWarning.findUnique({ where: { id: warningId } });
  if (!warning) {
    throw new AppError('Warning not found.', 404);
  }
  if (warning.sellerId !== sellerId) {
    throw new AppError('You can only reply to your own warnings.', 403);
  }

  const reply = await prisma.warningReply.create({
    data: {
      warningId,
      sellerId,
      message,
      imageUrl: imageUrl || null,
    },
  });

  return {
    id: reply.id,
    message: reply.message,
    imageUrl: reply.imageUrl,
    createdAt: reply.createdAt,
  };
};

module.exports = {
  applyToSell,
  getMyApplication,
  getDashboard,
  getSellerWallet,
  getSellerWithdrawals,
  createWithdrawal,
  getSellerProducts,
  getSellerOrders,
  updateOrderItemStatus,
  createProduct,
  updateProduct,
  deleteProduct,
  createAppeal,
  replyToWarning,
  serializeApplication,
};