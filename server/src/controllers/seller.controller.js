const sellerService = require('../services/seller.service');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const applyToSell = asyncHandler(async (req, res) => {
  const { storeName, businessEmail, description, phoneNumber, idType, idNumber, secondIdType, secondIdNumber } = req.body;

  const file = (field) => req.files?.[field]?.[0];
  const toUrl = (f) => (f ? `/uploads/${f.filename}` : null);

  const requiredFields = ['idFront', 'idBack', 'secondIdFront', 'secondIdBack'];
  for (const field of requiredFields) {
    if (!file(field)) {
      throw new AppError(`${field} photo is required.`, 400);
    }
  }

  const application = await sellerService.applyToSell({
    userId: req.user.id,
    storeName,
    businessEmail,
    description,
    phoneNumber,
    idType,
    idNumber,
    idFrontUrl: toUrl(file('idFront')),
    idBackUrl: toUrl(file('idBack')),
    secondIdType,
    secondIdNumber,
    secondIdFrontUrl: toUrl(file('secondIdFront')),
    secondIdBackUrl: toUrl(file('secondIdBack')),
  });

  res.status(201).json({ success: true, application });
});

const getMyApplication = asyncHandler(async (req, res) => {
  const application = await sellerService.getMyApplication(req.user.id);
  res.status(200).json({ success: true, application });
});

const getDashboard = asyncHandler(async (req, res) => {
  const dashboard = await sellerService.getDashboard(req.user.id);
  res.status(200).json({ success: true, ...dashboard });
});

const getSellerProducts = asyncHandler(async (req, res) => {
  const products = await sellerService.getSellerProducts(req.user.id);
  res.status(200).json({ success: true, products });
});

const createProduct = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  const uploadedImages = (req.files || []).map((file) => `/uploads/${file.filename}`);
  if (uploadedImages.length > 0) {
    data.images = uploadedImages;
    data.image = uploadedImages[0];
  }

  const product = await sellerService.createProduct({
    sellerId: req.user.id,
    data,
  });

  res.status(201).json({ success: true, product });
});

const updateProduct = asyncHandler(async (req, res) => {
  const data = { ...req.body };

  const uploadedImages = (req.files || []).map((file) => `/uploads/${file.filename}`);
  if (uploadedImages.length > 0) {
    data.images = uploadedImages;
    data.image = uploadedImages[0];
  }

  const product = await sellerService.updateProduct({
    sellerId: req.user.id,
    productId: req.params.productId,
    data,
  });

  res.status(200).json({ success: true, product });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const result = await sellerService.deleteProduct({
    sellerId: req.user.id,
    productId: req.params.productId,
  });

  res.status(200).json({ success: true, message: 'Product deleted.', ...result });
});

const getWallet = asyncHandler(async (req, res) => {
  const wallet = await sellerService.getSellerWallet(req.user.id);
  res.status(200).json({ success: true, ...wallet });
});

const createWithdrawal = asyncHandler(async (req, res) => {
  const withdrawal = await sellerService.createWithdrawal({
    userId: req.user.id,
    amount: req.body.amount,
    method: req.body.method,
  });
  res.status(201).json({ success: true, withdrawal });
});

const getOrders = asyncHandler(async (req, res) => {
  const orders = await sellerService.getSellerOrders(req.user.id);
  res.status(200).json({ success: true, orders });
});

const updateOrderItemStatus = asyncHandler(async (req, res) => {
  const item = await sellerService.updateOrderItemStatus({
    userId: req.user.id,
    orderItemId: req.params.itemId,
    status: req.body.status,
  });

  res.status(200).json({ success: true, item });
});

const createAppeal = asyncHandler(async (req, res) => {
  const image = req.file ? `/uploads/${req.file.filename}` : null;
  const appeal = await sellerService.createAppeal({
    sellerId: req.user.id,
    targetType: req.body.targetType,
    productId: req.body.productId,
    reason: req.body.reason,
    imageUrl: image,
  });

  res.status(201).json({ success: true, appeal });
});

const replyToWarning = asyncHandler(async (req, res) => {
  const image = req.file ? `/uploads/${req.file.filename}` : null;
  const reply = await sellerService.replyToWarning({
    sellerId: req.user.id,
    warningId: req.params.warningId,
    message: req.body.message,
    imageUrl: image,
  });

  res.status(201).json({ success: true, reply });
});

module.exports = { applyToSell, getMyApplication, getDashboard, getSellerProducts, createProduct, updateProduct, deleteProduct, getOrders, getWallet, createWithdrawal, updateOrderItemStatus, createAppeal, replyToWarning };