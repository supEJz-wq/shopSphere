const { z } = require('zod');

const warnSellerSchema = z.object({
  message: z
    .string({ required_error: 'Warning message is required.' })
    .trim()
    .min(5, 'Warning message must be at least 5 characters.')
    .max(500, 'Warning message cannot exceed 500 characters.'),
});

const reviewAppealSchema = z.object({
  decision: z.enum(['approved', 'rejected'], {
    required_error: 'Decision is required.',
    invalid_type_error: 'Decision must be approved or rejected.',
  }),
  adminNote: z.string().trim().max(1000).optional(),
});

const reviewWithdrawalSchema = z.object({
  method: z
    .enum(['bank_transfer', 'gcash', 'paypal'], {
      required_error: 'Please choose a payout method.',
      invalid_type_error: 'Please choose a valid payout method.',
    })
    .optional(),
  adminNote: z.string().trim().max(500).optional(),
});

module.exports = { warnSellerSchema, reviewAppealSchema, reviewWithdrawalSchema };