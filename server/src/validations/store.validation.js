const { z } = require('zod');

const createReviewSchema = z.object({
  rating: z.coerce
    .number({ required_error: 'Rating is required.' })
    .int('Rating must be a whole number.')
    .min(1, 'Rating must be between 1 and 5.')
    .max(5, 'Rating must be between 1 and 5.'),
  comment: z
    .string({ required_error: 'Comment is required.' })
    .trim()
    .min(3, 'Comment must be at least 3 characters.')
    .max(1000, 'Comment must be 1000 characters or fewer.'),
});

module.exports = { createReviewSchema };