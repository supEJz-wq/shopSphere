const adminService = require('../services/admin.service');
const reportService = require('../services/report.service');
const asyncHandler = require('../utils/asyncHandler');

const getApplications = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const validStatuses = ['pending', 'approved', 'rejected'];
  const filter = validStatuses.includes(status) ? status : undefined;

  const applications = await adminService.listApplications({ status: filter });
  res.status(200).json({ success: true, count: applications.length, applications });
});

const getApplicationById = asyncHandler(async (req, res) => {
  const application = await adminService.getApplicationById(req.params.id);
  res.status(200).json({ success: true, application });
});

const reviewApplication = asyncHandler(async (req, res) => {
  const { status, reviewNote } = req.body;
  const application = await adminService.reviewApplication({
    applicationId: req.params.id,
    adminId: req.user.id,
    status,
    reviewNote,
  });

  res.status(200).json({ success: true, application });
});

const getReports = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const validStatuses = ['pending', 'resolved', 'dismissed'];
  const filter = validStatuses.includes(status) ? status : undefined;

  const reports = await reportService.listReports({ status: filter });
  res.status(200).json({ success: true, count: reports.length, reports });
});

const resolveReport = asyncHandler(async (req, res) => {
  const result = await reportService.resolveReport({
    reportId: req.params.id,
    adminId: req.user.id,
  });
  res.status(200).json({ success: true, ...result });
});

const dismissReport = asyncHandler(async (req, res) => {
  const result = await reportService.dismissReport({
    reportId: req.params.id,
    adminId: req.user.id,
  });
  res.status(200).json({ success: true, ...result });
});

const getProducts = asyncHandler(async (req, res) => {
  const { search, category, shop, status, from, to } = req.query;
  const products = await adminService.listProducts({ search, category, shop, status, from, to });
  res.status(200).json({ success: true, count: products.length, products });
});

const getSellers = asyncHandler(async (req, res) => {
  const { search, status } = req.query;
  const sellers = await adminService.listSellers({ search, status });
  res.status(200).json({ success: true, count: sellers.length, sellers });
});

const getSellerDetail = asyncHandler(async (req, res) => {
  const seller = await adminService.getSellerDetail({ sellerId: req.params.id });
  res.status(200).json({ success: true, seller });
});

const banProduct = asyncHandler(async (req, res) => {
  const product = await adminService.updateProductStatus({
    productId: req.params.id,
    status: 'banned',
    adminId: req.user.id,
  });
  res.status(200).json({ success: true, product });
});

const unbanProduct = asyncHandler(async (req, res) => {
  const product = await adminService.updateProductStatus({
    productId: req.params.id,
    status: 'active',
    adminId: req.user.id,
  });
  res.status(200).json({ success: true, product });
});

const banSeller = asyncHandler(async (req, res) => {
  const seller = await adminService.updateSellerBanStatus({
    sellerId: req.params.id,
    banned: true,
    adminId: req.user.id,
  });
  res.status(200).json({ success: true, seller });
});

const unbanSeller = asyncHandler(async (req, res) => {
  const seller = await adminService.updateSellerBanStatus({
    sellerId: req.params.id,
    banned: false,
    adminId: req.user.id,
  });
  res.status(200).json({ success: true, seller });
});

const warnSeller = asyncHandler(async (req, res) => {
  const { message } = req.body;
  const warning = await adminService.warnSeller({
    sellerId: req.params.id,
    adminId: req.user.id,
    message,
  });
  res.status(201).json({ success: true, warning });
});

const removeWarning = asyncHandler(async (req, res) => {
  const result = await adminService.removeWarning({
    warningId: req.params.id,
    adminId: req.user.id,
  });
  res.status(200).json({ success: true, ...result });
});

const getHistory = asyncHandler(async (req, res) => {
  const { search, action } = req.query;
  const history = await adminService.listModerationHistory({ search, action });
  res.status(200).json({ success: true, count: history.length, history });
});

const getWithdrawals = asyncHandler(async (req, res) => {
  const { status, search } = req.query;
  const withdrawals = await adminService.listWithdrawals({ status, search });
  res.status(200).json({ success: true, count: withdrawals.length, withdrawals });
});

const approveWithdrawal = asyncHandler(async (req, res) => {
  const result = await adminService.reviewWithdrawal({
    withdrawalId: req.params.id,
    adminId: req.user.id,
    decision: 'completed',
    method: req.body.method,
    adminNote: req.body.adminNote,
  });
  res.status(200).json({ success: true, withdrawal: result });
});

const rejectWithdrawal = asyncHandler(async (req, res) => {
  const result = await adminService.reviewWithdrawal({
    withdrawalId: req.params.id,
    adminId: req.user.id,
    decision: 'rejected',
    adminNote: req.body.adminNote,
  });
  res.status(200).json({ success: true, withdrawal: result });
});

const getAppeals = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const validStatuses = ['pending', 'approved', 'rejected'];
  const filter = validStatuses.includes(status) ? status : undefined;
  const appeals = await adminService.listAppeals({ status: filter });
  res.status(200).json({ success: true, count: appeals.length, appeals });
});

const reviewAppeal = asyncHandler(async (req, res) => {
  const { decision, adminNote } = req.body;
  const appeal = await adminService.reviewAppeal({
    appealId: req.params.id,
    adminId: req.user.id,
    decision,
    adminNote,
  });
  res.status(200).json({ success: true, appeal });
});

module.exports = {
  getApplications,
  getApplicationById,
  reviewApplication,
  getReports,
  resolveReport,
  dismissReport,
  getProducts,
  getSellers,
  getSellerDetail,
  banProduct,
  unbanProduct,
  banSeller,
  unbanSeller,
  warnSeller,
  removeWarning,
  getHistory,
  getWithdrawals,
  approveWithdrawal,
  rejectWithdrawal,
  getAppeals,
  reviewAppeal,
};