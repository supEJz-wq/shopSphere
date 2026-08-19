const express = require('express');
const reportController = require('../controllers/report.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/authorize.middleware');
const validate = require('../middleware/validate.middleware');
const { createReportSchema } = require('../validations/report.validation');

const router = express.Router();

router.post('/', protect, authorize('customer'), validate(createReportSchema), reportController.createReport);

module.exports = router;