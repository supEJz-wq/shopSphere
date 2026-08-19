const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');

const REASONS = [
  'Spam or misleading content',
  'Fake or counterfeit product',
  'Inappropriate product',
  'Wrong or inaccurate description',
  'Inappropriate review comment',
  'Harassment or abuse',
  'Other',
];

const assertTargetExists = async (targetType, targetId) => {
  if (targetType === 'product') {
    const product = await prisma.product.findUnique({ where: { id: targetId } });
    if (!product) throw new AppError('Product not found.', 404);
  } else if (targetType === 'review') {
    const review = await prisma.productReview.findUnique({ where: { id: targetId } });
    if (!review) throw new AppError('Review not found.', 404);
  } else {
    throw new AppError('Invalid report target.', 400);
  }
};

const serializeReport = (report) => ({
  id: report.id,
  targetType: report.targetType,
  targetId: report.targetId,
  reason: report.reason,
  status: report.status,
  createdAt: report.createdAt,
  handledAt: report.handledAt,
  reporter: {
    id: report.reporter.id,
    firstName: report.reporter.firstName,
    lastName: report.reporter.lastName,
    email: report.reporter.email,
  },
  target: report.target || null,
});

const createReport = async ({ reporterId, targetType, targetId, reason }) => {
  await assertTargetExists(targetType, targetId);

  const existing = await prisma.report.findFirst({
    where: { reporterId, targetType, targetId, status: 'pending' },
  });
  if (existing) {
    throw new AppError('You have already reported this. Our team will review it shortly.', 409);
  }

  const report = await prisma.report.create({
    data: { reporterId, targetType, targetId, reason },
    include: {
      reporter: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
  });

  return serializeReport(report);
};

const getTarget = async (report) => {
  if (report.targetType === 'product') {
    const product = await prisma.product.findUnique({
      where: { id: report.targetId },
      select: { id: true, name: true, image: true, price: true },
    });
    return product ? { data: product } : null;
  }
  if (report.targetType === 'review') {
    const review = await prisma.productReview.findUnique({
      where: { id: report.targetId },
      select: { id: true, comment: true, imageUrl: true, rating: true, userId: true },
    });
    if (!review) return null;
    const author = await prisma.user.findUnique({
      where: { id: review.userId },
      select: { firstName: true, lastName: true },
    });
    return {
      data: {
        id: review.id,
        comment: review.comment,
        imageUrl: review.imageUrl,
        rating: review.rating,
        author: author ? `${author.firstName} ${author.lastName}` : 'Unknown user',
      },
    };
  }
  return null;
};

const listReports = async ({ status } = {}) => {
  const reports = await prisma.report.findMany({
    where: status ? { status } : {},
    include: {
      reporter: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const withTargets = await Promise.all(
    reports.map(async (report) => ({
      ...serializeReport(report),
      target: await getTarget(report),
    }))
  );

  return withTargets;
};

const resolveReport = async ({ reportId, adminId }) => {
  const report = await prisma.report.findUnique({ where: { id: reportId } });
  if (!report) throw new AppError('Report not found.', 404);

  if (report.status === 'resolved' || report.status === 'dismissed') {
    throw new AppError('This report has already been handled.', 409);
  }

  await prisma.$transaction(async (tx) => {
    if (report.targetType === 'product') {
      await tx.product.deleteMany({ where: { id: report.targetId } });
    } else if (report.targetType === 'review') {
      await tx.productReview.deleteMany({ where: { id: report.targetId } });
    }

    await tx.report.update({
      where: { id: reportId },
      data: { status: 'resolved', handledById: adminId, handledAt: new Date() },
    });
  });

  return { status: 'resolved' };
};

const dismissReport = async ({ reportId, adminId }) => {
  const report = await prisma.report.findUnique({ where: { id: reportId } });
  if (!report) throw new AppError('Report not found.', 404);

  if (report.status === 'resolved' || report.status === 'dismissed') {
    throw new AppError('This report has already been handled.', 409);
  }

  await prisma.report.update({
    where: { id: reportId },
    data: { status: 'dismissed', handledById: adminId, handledAt: new Date() },
  });

  return { status: 'dismissed' };
};

module.exports = {
  REASONS,
  createReport,
  listReports,
  resolveReport,
  dismissReport,
};