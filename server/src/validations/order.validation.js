const { z } = require('zod');

const checkoutSchema = z.object({
  shippingAddress: z.object({
    fullName: z.string({ required_error: 'Full name is required.' }).min(1, 'Full name is required.'),
    street: z.string({ required_error: 'Street address is required.' }).min(1, 'Street address is required.'),
    city: z.string({ required_error: 'City is required.' }).min(1, 'City is required.'),
    postalCode: z.string({ required_error: 'Postal code is required.' }).min(1, 'Postal code is required.'),
    country: z.string({ required_error: 'Country is required.' }).min(1, 'Country is required.'),
  }),
});

module.exports = { checkoutSchema };
