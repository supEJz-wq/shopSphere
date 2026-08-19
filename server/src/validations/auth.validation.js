const { z } = require('zod');

const registerSchema = z.object({
  firstName: z
    .string({ required_error: 'First name is required.' })
    .trim()
    .min(2, 'First name must be at least 2 characters.'),
  lastName: z
    .string({ required_error: 'Last name is required.' })
    .trim()
    .min(2, 'Last name must be at least 2 characters.'),
  email: z
    .string({ required_error: 'Email is required.' })
    .trim()
    .email('Please enter a valid email address.'),
  password: z
    .string({ required_error: 'Password is required.' })
    .min(6, 'Password must be at least 6 characters.'),
  confirmPassword: z
    .string({ required_error: 'Please confirm your password.' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match.',
  path: ['confirmPassword'],
});

const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required.' })
    .trim()
    .email('Please enter a valid email address.'),
  password: z
    .string({ required_error: 'Password is required.' })
    .min(1, 'Password is required.'),
});

module.exports = { registerSchema, loginSchema };
