const express = require('express');
const adminController = require('../controllers/admin.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/authorize.middleware');
const validate = require('../middleware/validate.middleware');
const { reviewApplicationSchema } = require('../validations/seller.validation');
const { warnSellerSchema, reviewAppealSchema, reviewWithdrawalSchema } = require('../validations/admin.validation');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/applications', adminController.getApplications);
router.get('/applications/:id', adminController.getApplicationById);
router.patch(
  '/applications/:id/review',
  validate(reviewApplicationSchema),
  adminController.reviewApplication
);

router.get('/reports', adminController.getReports);
router.post('/reports/:id/resolve', adminController.resolveReport);
router.post('/reports/:id/dismiss', adminController.dismissReport);

router.get('/products', adminController.getProducts);
router.post('/products/:id/ban', adminController.banProduct);
router.post('/products/:id/unban', adminController.unbanProduct);

router.get('/sellers', adminController.getSellers);
router.get('/sellers/:id', adminController.getSellerDetail);
router.post('/sellers/:id/ban', adminController.banSeller);
router.post('/sellers/:id/unban', adminController.unbanSeller);
router.post('/sellers/:id/warn', validate(warnSellerSchema), adminController.warnSeller);

router.delete('/warnings/:id', adminController.removeWarning);
router.get('/history', adminController.getHistory);
router.get('/withdrawals', adminController.getWithdrawals);
router.post(
  '/withdrawals/:id/approve',
  validate(reviewWithdrawalSchema),
  adminController.approveWithdrawal
);
router.post(
  '/withdrawals/:id/reject',
  validate(reviewWithdrawalSchema),
  adminController.rejectWithdrawal
);

router.get('/appeals', adminController.getAppeals);
router.post(
  '/appeals/:id/review',
  validate(reviewAppealSchema),
  adminController.reviewAppeal
);

module.exports = router;