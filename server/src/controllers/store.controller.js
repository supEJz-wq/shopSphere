const storeService = require('../services/store.service');
const asyncHandler = require('../utils/asyncHandler');

const getStore = asyncHandler(async (req, res) => {
  const store = await storeService.getStore(req.params.id);
  res.status(200).json({ success: true, store });
});

module.exports = { getStore };