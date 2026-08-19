const AppError = require('../utils/AppError');

const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Not authorized. Please log in.', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action.', 403));
    }

    next();
  };

// Blocks roles from customer-only actions (buying, cart). Seller and admin
// accounts manage the store but cannot shop on the marketplace.
const restrictBuying =
  (...roles) =>
  (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Not authorized. Please log in.', 401));
    }

    if (roles.includes(req.user.role)) {
      return next(
        new AppError('This account cannot add to cart or make purchases.', 403)
      );
    }

    next();
  };

module.exports = { authorize, restrictBuying };