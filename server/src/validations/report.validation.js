const { z } = require('zod');
const { REASONS } = require('../services/report.service');

const createReportSchema = z.object({
  targetType: z.enum(['product', 'review'], {
    required_error: 'Report target is required.',
  }),
  targetId: z.string({ required_error: 'Report target is required.' }).min(1, 'Report target is required.'),
  reason: z
    .string({ required_error: 'Please select a reason.' })
    .trim()
    .min(1, 'Please select a reason.')
    .max(500, 'Reason must be 500 characters or fewer.')
    .refine((reason) => REASONS.includes(reason), 'Please select a valid reason.'),
});

module.exports = { createReportSchema };