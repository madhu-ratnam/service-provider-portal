const User = require("../models/User");
const Provider = require("../models/Provider");
const generateToken = require("../utils/generateToken");
const asyncHandler = require("../utils/asyncHandler");

// @desc    Register a new service provider
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Name, email and password are all required");
  }

  if (password.length < 6) {
    res.status(400);
    throw new Error("Password must be at least 6 characters long");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400);
    throw new Error("An account with this email already exists");
  }

  const user = await User.create({ name, email, password, role: "provider" });
  await Provider.create({ user: user._id });

  const token = generateToken(user._id, user.role);

  res.status(201).json({
    success: true,
    message: "Registration successful",
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

// @desc    Login (provider or admin)
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  const token = generateToken(user._id, user.role);

  res.status(200).json({
    success: true,
    message: "Login successful",
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

// @desc    Get currently logged-in user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
});

module.exports = { register, login, getMe };
