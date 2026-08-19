const cartService = require('../services/cart.service');
const asyncHandler = require('../utils/asyncHandler');

const getCart = asyncHandler(async (req, res) => {
  const cart = await cartService.getCart(req.user.id);
  res.status(200).json({ success: true, cart });
});

const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const item = await cartService.addToCart({
    userId: req.user.id,
    productId,
    quantity,
  });

  res.status(201).json({ success: true, item });
});

const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const item = await cartService.updateCartItem({
    userId: req.user.id,
    cartItemId: req.params.id,
    quantity,
  });

  res.status(200).json({ success: true, item });
});

const removeCartItem = asyncHandler(async (req, res) => {
  await cartService.removeCartItem({
    userId: req.user.id,
    cartItemId: req.params.id,
  });

  res.status(200).json({ success: true, message: 'Item removed from cart.' });
});

module.exports = { getCart, addToCart, updateCartItem, removeCartItem };
