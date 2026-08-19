const { z } = require('zod');

const PHONE_REGEX = /^(\+63|0)\d{9,10}$/;

const ID_TYPES = [
  "Driver's License",
  'Passport',
  'National ID',
  'UMID',
  'PhilHealth ID',
  'SSS ID',
  'Postal ID',
  'Voter’s ID',
  'PRC ID',
  'TIN ID',
  'Digitized ID',
];

const idTypeEnum = (label) =>
  z.enum(ID_TYPES, {
    required_error: `Please select a valid ${label} ID type.`,
    invalid_type_error: `Please select a valid ${label} ID type.`,
  });

const applyToSellSchema = z.object({
  storeName: z
    .string({ required_error: 'Store name is required.' })
    .trim()
    .min(2, 'Store name must be at least 2 characters.'),
  businessEmail: z
    .string({ required_error: 'Business email is required.' })
    .trim()
    .email('Please enter a valid email address.'),
  description: z
    .string({ required_error: 'Please tell us about your store.' })
    .trim()
    .min(20, 'Description must be at least 20 characters.'),
  phoneNumber: z
    .string({ required_error: 'Phone number is required.' })
    .trim()
    .regex(PHONE_REGEX, 'Please enter a valid Philippine phone number (e.g. 09171234567).'),
  idType: idTypeEnum('first'),
  idNumber: z
    .string({ required_error: 'First ID number is required.' })
    .trim()
    .min(3, 'Please enter a valid ID number.'),
  secondIdType: idTypeEnum('second'),
  secondIdNumber: z
    .string({ required_error: 'Second ID number is required.' })
    .trim()
    .min(3, 'Please enter a valid ID number.'),
});

const reviewApplicationSchema = z.object({
  status: z.enum(['approved', 'rejected'], {
    required_error: 'Status is required.',
    invalid_type_error: 'Status must be approved or rejected.',
  }),
  reviewNote: z.string().trim().optional(),
});

const createProductSchema = z.object({
  name: z.string({ required_error: 'Product name is required.' }).trim().min(2, 'Name must be at least 2 characters.'),
  description: z
    .string({ required_error: 'Description is required.' })
    .trim()
    .min(10, 'Description must be at least 10 characters.'),
  category: z.string({ required_error: 'Category is required.' }).trim().min(1, 'Category is required.'),
  price: z
    .number({ required_error: 'Price is required.' })
    .positive('Price must be greater than zero.'),
  stock: z
    .number({ required_error: 'Stock is required.' })
    .int('Stock must be a whole number.')
    .min(0, 'Stock cannot be negative.'),
  image: z.string().trim().optional(),
});

const updateProductSchema = z
  .object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters.').optional(),
    description: z.string().trim().min(10, 'Description must be at least 10 characters.').optional(),
    category: z.string().trim().min(1, 'Category is required.').optional(),
    price: z.number().positive('Price must be greater than zero.').optional(),
    stock: z.number().int('Stock must be a whole number.').min(0, 'Stock cannot be negative.').optional(),
    image: z.string().trim().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required to update.',
  });

const updateOrderItemStatusSchema = z.object({
  status: z.enum(['processing', 'shipped', 'cancelled'], {
    required_error: 'Status is required.',
    invalid_type_error: 'Status must be processing, shipped, or cancelled.',
  }),
});

const createAppealSchema = z.object({
  targetType: z.enum(['product', 'shop'], {
    required_error: 'Appeal target is required.',
    invalid_type_error: 'Target must be product or shop.',
  }),
  productId: z.string().trim().optional(),
  reason: z
    .string({ required_error: 'Please explain why this ban should be lifted.' })
    .trim()
    .min(10, 'Please provide at least 10 characters of explanation.')
    .max(1000, 'Explanation cannot exceed 1000 characters.'),
});

const replyToWarningSchema = z.object({
  message: z
    .string({ required_error: 'Please add a reply message.' })
    .trim()
    .min(5, 'Please provide at least 5 characters.')
    .max(500, 'Message cannot exceed 500 characters.'),
});

const createWithdrawalSchema = z.object({
  amount: z
    .number({ required_error: 'Withdrawal amount is required.' })
    .positive('Amount must be greater than zero.'),
  method: z
    .enum(['bank_transfer', 'gcash', 'paypal'], {
      required_error: 'Please choose a withdrawal method.',
      invalid_type_error: 'Please choose a valid withdrawal method.',
    })
    .optional(),
});

module.exports = { applyToSellSchema, reviewApplicationSchema, createProductSchema, updateProductSchema, updateOrderItemStatusSchema, createAppealSchema, replyToWarningSchema, createWithdrawalSchema };