const jwt = require('jsonwebtoken');
const { env } = require('../config/env');
const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Not authorized. Please log in.', 401));
  }

  const token = authHeader.split(' ')[1];

  let decoded;
  try {
    decoded = jwt.verify(token, env.jwtSecret);
  } catch {
    return next(new AppError('Session expired. Please log in again.', 401));
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    select: { id: true, firstName: true, lastName: true, email: true, role: true },
  });

  if (!user) {
    return next(new AppError('User no longer exists.', 401));
  }

  req.user = user;
  next();
});

module.exports = { protect };
