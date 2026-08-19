const { Prisma } = require('@prisma/client');
const AppError = require('../utils/AppError');
const { env } = require('../config/env');

const errorHandler = (err, req, res, next) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'A record with the same value already exists.',
      });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'The requested resource was not found.',
      });
    }
  }

  console.error('Unhandled error:', err);

  return res.status(500).json({
    success: false,
    message:
      env.nodeEnv === 'production'
        ? 'Something went wrong on the server.'
        : err.message,
  });
};

module.exports = { errorHandler };
