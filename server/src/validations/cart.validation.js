const { z } = require('zod');

const addToCartSchema = z.object({
  productId: z.string({ required_error: 'Product is required.' }),
  quantity: z
    .number({ required_error: 'Quantity is required.' })
    .int('Quantity must be a whole number.')
    .min(1, 'Quantity must be greater than zero.'),
});

const updateCartSchema = z.object({
  quantity: z
    .number({ required_error: 'Quantity is required.' })
    .int('Quantity must be a whole number.')
    .min(1, 'Quantity must be greater than zero.'),
});

module.exports = { addToCartSchema, updateCartSchema };
