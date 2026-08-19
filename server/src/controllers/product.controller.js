const productService = require('../services/product.service');
const asyncHandler = require('../utils/asyncHandler');

const getProducts = asyncHandler(async (req, res) => {
  const products = await productService.getProducts();
  res.status(200).json({ success: true, count: products.length, products });
});

const getProductById = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  res.status(200).json({ success: true, product });
});

module.exports = { getProducts, getProductById };
