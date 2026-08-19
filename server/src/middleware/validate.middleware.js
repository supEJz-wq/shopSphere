const { ZodError } = require('zod');
const AppError = require('../utils/AppError');

const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const firstError = error.errors[0];
      return next(
        new AppError(
          firstError.message || 'Validation failed',
          400
        )
      );
    }
    next(error);
  }
};

module.exports = validate;
