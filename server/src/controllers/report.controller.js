const reportService = require('../services/report.service');
const asyncHandler = require('../utils/asyncHandler');

const createReport = asyncHandler(async (req, res) => {
  const { targetType, targetId, reason } = req.body;
  const report = await reportService.createReport({
    reporterId: req.user.id,
    targetType,
    targetId,
    reason,
  });
  res.status(201).json({ success: true, report });
});

module.exports = { createReport };