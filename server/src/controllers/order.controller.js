const orderService = require('../services/order.service');
const asyncHandler = require('../utils/asyncHandler');

const checkout = asyncHandler(async (req, res) => {
  const order = await orderService.checkout({
    userId: req.user.id,
    shippingAddress: req.body.shippingAddress,
  });

  res.status(201).json({ success: true, order });
});

const getOrders = asyncHandler(async (req, res) => {
  const orders = await orderService.getOrders(req.user.id);
  res.status(200).json({ success: true, orders });
});

const getOrderById = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById({
    userId: req.user.id,
    orderId: req.params.id,
  });

  res.status(200).json({ success: true, order });
});

module.exports = { checkout, getOrders, getOrderById };