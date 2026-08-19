const authService = require('../services/auth.service');
const asyncHandler = require('../utils/asyncHandler');

const register = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  const result = await authService.registerUser({
    firstName,
    lastName,
    email,
    password,
  });

  res.status(201).json({ success: true, ...result });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.loginUser({ email, password });

  res.status(200).json({ success: true, ...result });
});

const profile = asyncHandler(async (req, res) => {
  const user = await authService.getUserById(req.user.id);
  res.status(200).json({ success: true, user });
});

module.exports = { register, login, profile };
