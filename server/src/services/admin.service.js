const AppError = require('../utils/AppError');
const prisma = require('../config/prisma');

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

const listApplications = async ({ status } = {}) => {
  const applications = await prisma.sellerApplication.findMany({
    where: status ? { status } : {},
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return applications.map((application) => ({
    ...serializeApplication(application),
    user: application.user,
  }));
};

const getApplicationById = async (applicationId) => {
  const application = await prisma.sellerApplication.findUnique({
    where: { id: applicationId },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
  });

  if (!application) {
    throw new AppError('Application not found.', 404);
  }

  return {
    ...serializeApplication(application),
    user: application.user,
  };
};

const reviewApplication = async ({ applicationId, adminId, status, reviewNote }) => {
  const application = await prisma.sellerApplication.findUnique({
    where: { id: applicationId },
  });

  if (!application) {
    throw new AppError('Application not found.', 404);
  }

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.sellerApplication.update({
      where: { id: applicationId },
      data: {
        status,
        reviewNote: reviewNote || null,
        reviewedAt: new Date(),
        reviewedById: adminId,
      },
    });

    if (status === 'approved') {
      await tx.user.update({
        where: { id: application.userId },
        data: { role: 'seller' },
      });
    }

    return result;
  });

  return {
    id: updated.id,
    storeName: updated.storeName,
    status: updated.status,
    reviewNote: updated.reviewNote,
    reviewedAt: updated.reviewedAt,
  };
};

const listProducts = async ({ search, category, shop, status, from, to } = {}) => {
  const where = {
    AND: [],
  };

  if (search) {
    where.AND.push({
      OR: [{ name: { contains: search, mode: 'insensitive' } }, { description: { contains: search, mode: 'insensitive' } }],
    });
  }

  if (shop) {
    where.AND.push({
      seller: {
        applications: {
          some: { storeName: { contains: shop, mode: 'insensitive' } },
        },
      },
    });
  }

  if (category) {
    where.AND.push({ category: { equals: category, mode: 'insensitive' } });
  }

  if (status) {
    where.AND.push({ status });
  }

  if (from || to) {
    const date = {};
    if (from) {
      const fromDate = new Date(from);
      fromDate.setHours(0, 0, 0, 0);
      date.gte = fromDate;
    }
    if (to) {
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);
      date.lte = toDate;
    }
    where.AND.push({ createdAt: date });
  }

  if (where.AND.length === 0) delete where.AND;

  const products = await prisma.product.findMany({
    where,
    include: {
      seller: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          isBanned: true,
          applications: {
            where: { status: 'approved' },
            select: { storeName: true },
            take: 1,
          },
        },
      },
      _count: { select: { reviews: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return products.map((product) => {
    const seller = product.seller;
    const storeName = seller?.applications?.[0]?.storeName || null;
    return {
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
      createdAt: product.createdAt,
      seller: seller
        ? {
            id: seller.id,
            name: storeName || `${seller.firstName} ${seller.lastName}`.trim(),
            email: seller.email || '',
            isBanned: seller.isBanned,
          }
        : null,
    };
  });
};

const listSellers = async ({ search, status } = {}) => {
  const where = {
    role: 'seller',
    AND: [],
  };

  if (search) {
    where.AND.push({
      OR: [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        {
          applications: {
            some: {
              storeName: { contains: search, mode: 'insensitive' },
            },
          },
        },
      ],
    });
  }

  if (status && status !== 'all') {
    where.AND.push({ isBanned: status === 'banned' });
  }

  const sellers = await prisma.user.findMany({
    where,
    include: {
      applications: {
        where: { status: 'approved' },
        select: { storeName: true, businessEmail: true },
        take: 1,
        orderBy: { createdAt: 'desc' },
      },
      warnings: {
        orderBy: { createdAt: 'desc' },
        include: { replies: { orderBy: { createdAt: 'asc' } } },
      },
      _count: {
        select: {
          products: true,
          warnings: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return sellers.map((seller) => {
    const app = seller.applications[0];
    return {
      id: seller.id,
      email: seller.email,
      name: `${seller.firstName} ${seller.lastName}`.trim(),
      storeName: app?.storeName || null,
      businessEmail: app?.businessEmail || seller.email,
      isBanned: seller.isBanned,
      productCount: seller._count?.products ?? 0,
      warningCount: seller._count?.warnings ?? 0,
      createdAt: seller.createdAt,
      warnings: seller.warnings.map((w) => ({
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
    };
  });
};

const getSellerDetail = async ({ sellerId }) => {
  const seller = await prisma.user.findUnique({
    where: { id: sellerId },
    include: {
      applications: {
        where: { status: 'approved' },
        select: { storeName: true, businessEmail: true },
        take: 1,
      },
      products: {
        where: { status: { not: 'banned' } },
        select: { id: true, name: true, price: true, stock: true, status: true },
      },
      warnings: {
        orderBy: { createdAt: 'desc' },
        include: { replies: { orderBy: { createdAt: 'asc' } } },
      },
    },
  });

  if (!seller) {
    throw new AppError('Seller not found.', 404);
  }

  const app = seller.applications[0];
  return {
    id: seller.id,
    email: seller.email,
    name: `${seller.firstName} ${seller.lastName}`.trim(),
    storeName: app?.storeName || null,
    businessEmail: app?.businessEmail || seller.email,
    isBanned: seller.isBanned,
    products: seller.products.map((p) => ({
      id: p.id,
      name: p.name,
      price: Number(p.price),
      stock: p.stock,
      status: p.status || 'active',
    })),
    warnings: seller.warnings.map((w) => ({
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
  };
};

const createModerationLog = async ({
  action,
  targetId,
  sellerId,
  productId,
  warningId,
  message,
  adminId,
}) => {
  return prisma.moderationLog.create({
    data: { action, targetId, sellerId, productId, warningId, message, adminId },
  });
};

const updateProductStatus = async ({ productId, status, adminId }) => {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    throw new AppError('Product not found.', 404);
  }
  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.product.update({
      where: { id: productId },
      data: { status },
    });
    await tx.moderationLog.create({
      data: {
        action: status === 'banned' ? 'ban_product' : 'unban_product',
        targetId: productId,
        sellerId: result.sellerId || null,
        productId,
        message: result.name,
        adminId,
      },
    });
    return result;
  });
  return {
    id: updated.id,
    name: updated.name,
    status: updated.status,
  };
};

const updateSellerBanStatus = async ({ sellerId, banned, adminId }) => {
  const seller = await prisma.user.findUnique({ where: { id: sellerId } });
  if (!seller) {
    throw new AppError('Seller not found.', 404);
  }
  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.user.update({
      where: { id: sellerId },
      data: { isBanned: banned },
    });
    await tx.moderationLog.create({
      data: {
        action: banned ? 'ban' : 'unban',
        targetId: sellerId,
        sellerId,
        message: `${result.firstName} ${result.lastName}`.trim(),
        adminId,
      },
    });
    return result;
  });
  return {
    id: updated.id,
    email: updated.email,
    isBanned: updated.isBanned,
  };
};

const warnSeller = async ({ sellerId, adminId, message }) => {
  const seller = await prisma.user.findUnique({ where: { id: sellerId } });
  if (!seller) {
    throw new AppError('Seller not found.', 404);
  }
  const warning = await prisma.$transaction(async (tx) => {
    const created = await tx.sellerWarning.create({
      data: { sellerId, adminId, message },
    });
    await tx.moderationLog.create({
      data: {
        action: 'warn',
        targetId: sellerId,
        sellerId,
        warningId: created.id,
        message,
        adminId,
      },
    });
    return created;
  });
  return {
    id: warning.id,
    message: warning.message,
    createdAt: warning.createdAt,
  };
};

const removeWarning = async ({ warningId, adminId }) => {
  const warning = await prisma.sellerWarning.findUnique({
    where: { id: warningId },
  });
  if (!warning) {
    throw new AppError('Warning not found.', 404);
  }
  await prisma.$transaction(async (tx) => {
    await tx.sellerWarning.delete({ where: { id: warningId } });
    await tx.moderationLog.create({
      data: {
        action: 'remove_warning',
        targetId: warning.sellerId,
        sellerId: warning.sellerId,
        warningId,
        message: warning.message,
        adminId,
      },
    });
  });
  return { id: warningId, removed: true };
};

const listAppeals = async ({ status } = {}) => {
  const appeals = await prisma.banAppeal.findMany({
    where: status && status !== 'all' ? { status } : {},
    include: {
      seller: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          isBanned: true,
          applications: {
            where: { status: 'approved' },
            select: { storeName: true },
            take: 1,
          },
        },
      },
      product: { select: { id: true, name: true, image: true, status: true } },
      admin: { select: { id: true, firstName: true, lastName: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return appeals.map((appeal) => {
    const app = appeal.seller.applications[0];
    return {
      id: appeal.id,
      targetType: appeal.targetType,
      reason: appeal.reason,
      imageUrl: appeal.imageUrl || null,
      status: appeal.status,
      adminNote: appeal.adminNote,
      reviewedAt: appeal.reviewedAt,
      createdAt: appeal.createdAt,
      seller: {
        id: appeal.seller.id,
        name: `${appeal.seller.firstName} ${appeal.seller.lastName}`.trim(),
        email: appeal.seller.email,
        storeName: app?.storeName || null,
        isBanned: appeal.seller.isBanned,
      },
      product: appeal.product
        ? {
            id: appeal.product.id,
            name: appeal.product.name,
            image: appeal.product.image,
            status: appeal.product.status,
          }
        : null,
      admin: appeal.admin
        ? `${appeal.admin.firstName} ${appeal.admin.lastName}`.trim()
        : null,
    };
  });
};

const reviewAppeal = async ({ appealId, adminId, decision, adminNote }) => {
  const appeal = await prisma.banAppeal.findUnique({ where: { id: appealId } });
  if (!appeal) {
    throw new AppError('Appeal not found.', 404);
  }
  if (appeal.status !== 'pending') {
    throw new AppError('This appeal has already been reviewed.', 400);
  }

  const result = await prisma.$transaction(async (tx) => {
    if (decision === 'approved') {
      if (appeal.targetType === 'product') {
        await tx.product.update({
          where: { id: appeal.productId },
          data: { status: 'active' },
        });
      } else if (appeal.targetType === 'shop') {
        await tx.user.update({
          where: { id: appeal.sellerId },
          data: { isBanned: false },
        });
      }
    }

    return tx.banAppeal.update({
      where: { id: appealId },
      data: {
        status: decision,
        adminId,
        adminNote: adminNote || null,
        reviewedAt: new Date(),
      },
    });
  });

  return {
    id: result.id,
    status: result.status,
    adminNote: result.adminNote,
    reviewedAt: result.reviewedAt,
  };
};

const listModerationHistory = async ({ search, action } = {}) => {
  const where = { AND: [] };

  if (action && action !== 'all') {
    where.AND.push({ action });
  }

  if (search) {
    where.AND.push({
      OR: [
        { message: { contains: search, mode: 'insensitive' } },
        { seller: { email: { contains: search, mode: 'insensitive' } } },
        {
          seller: {
            applications: {
              some: { storeName: { contains: search, mode: 'insensitive' } },
            },
          },
        },
        { product: { name: { contains: search, mode: 'insensitive' } } },
      ],
    });
  }

  if (where.AND.length === 0) delete where.AND;

  const logs = await prisma.moderationLog.findMany({
    where,
    include: {
      seller: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          isBanned: true,
          applications: {
            where: { status: 'approved' },
            select: { storeName: true },
            take: 1,
          },
        },
      },
      product: { select: { id: true, name: true, image: true } },
      admin: { select: { id: true, firstName: true, lastName: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return logs.map((log) => {
    const storeName = log.seller?.applications?.[0]?.storeName || null;
    return {
      id: log.id,
      action: log.action,
      targetId: log.targetId,
      message: log.message || null,
      createdAt: log.createdAt,
      seller: log.seller
        ? {
            id: log.seller.id,
            name: `${log.seller.firstName} ${log.seller.lastName}`.trim(),
            email: log.seller.email,
            storeName,
            isBanned: log.seller.isBanned,
          }
        : null,
      product: log.product
        ? { id: log.product.id, name: log.product.name, image: log.product.image }
        : null,
      admin: log.admin
        ? `${log.admin.firstName} ${log.admin.lastName}`.trim()
        : null,
    };
  });
};

const WITHDRAWAL_METHODS = ['bank_transfer', 'gcash', 'paypal'];

const listWithdrawals = async ({ status, search } = {}) => {
  const where = { AND: [] };

  if (status && status !== 'all') {
    where.AND.push({ status });
  }

  if (search) {
    where.AND.push({
      OR: [
        { receiptNumber: { contains: search, mode: 'insensitive' } },
        { seller: { email: { contains: search, mode: 'insensitive' } } },
        {
          seller: {
            applications: {
              some: { storeName: { contains: search, mode: 'insensitive' } },
            },
          },
        },
      ],
    });
  }

  if (where.AND.length === 0) delete where.AND;

  const withdrawals = await prisma.withdrawal.findMany({
    where,
    include: {
      seller: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          applications: {
            where: { status: 'approved' },
            select: { storeName: true },
            take: 1,
          },
        },
      },
      admin: { select: { id: true, firstName: true, lastName: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return withdrawals.map((w) => {
    const storeName = w.seller?.applications?.[0]?.storeName || null;
    return {
      id: w.id,
      amount: Number(w.amount),
      fee: Number(w.fee),
      net: Number((Number(w.amount) - Number(w.fee)).toFixed(2)),
      method: w.method,
      status: w.status,
      receiptNumber: w.receiptNumber,
      adminNote: w.adminNote || null,
      createdAt: w.createdAt,
      processedAt: w.processedAt,
      seller: w.seller
        ? {
            id: w.seller.id,
            name: `${w.seller.firstName} ${w.seller.lastName}`.trim(),
            email: w.seller.email,
            storeName,
          }
        : null,
      admin: w.admin ? `${w.admin.firstName} ${w.admin.lastName}`.trim() : null,
    };
  });
};

const reviewWithdrawal = async ({ withdrawalId, adminId, decision, method, adminNote }) => {
  const withdrawal = await prisma.withdrawal.findUnique({
    where: { id: withdrawalId },
    include: { seller: { select: { id: true, email: true } } },
  });

  if (!withdrawal) {
    throw new AppError('Withdrawal not found.', 404);
  }
  if (withdrawal.status !== 'processing') {
    throw new AppError('This withdrawal has already been reviewed.', 400);
  }
  if (decision !== 'completed' && decision !== 'rejected') {
    throw new AppError('Invalid decision.', 400);
  }
  if (method && !WITHDRAWAL_METHODS.includes(method)) {
    throw new AppError('Invalid payout method.', 400);
  }

  const updated = await prisma.withdrawal.update({
    where: { id: withdrawalId },
    data: {
      status: decision,
      method: decision === 'completed' && method ? method : withdrawal.method,
      adminId,
      adminNote: adminNote || null,
      processedAt: new Date(),
    },
  });

  return {
    id: updated.id,
    amount: Number(updated.amount),
    fee: Number(updated.fee),
    method: updated.method,
    status: updated.status,
    receiptNumber: updated.receiptNumber,
    adminNote: updated.adminNote,
    processedAt: updated.processedAt,
    sellerEmail: withdrawal.seller?.email,
  };
};

module.exports = {
  listApplications,
  getApplicationById,
  reviewApplication,
  listProducts,
  listSellers,
  getSellerDetail,
  updateProductStatus,
  updateSellerBanStatus,
  warnSeller,
  removeWarning,
  listAppeals,
  reviewAppeal,
  listModerationHistory,
  listWithdrawals,
  reviewWithdrawal,
};