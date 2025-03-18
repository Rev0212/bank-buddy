const User = require('../models/userModel');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');
const sendEmail = require('../utils/sendEmail');
const sendSMS = require('../utils/sendSMS');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, phone, password } = req.body;

  // Create user
  const user = await User.create({
    name,
    email,
    phone,
    password
  });

  // Send OTP for verification
  const otp = user.generateOTPToken();
  await user.save({ validateBeforeSave: false });

  // Send OTP to phone/email
  try {
    await sendSMS({
      to: phone,
      message: `Your verification OTP is: ${otp}`
    });

    await sendEmail({
      email: email,
      subject: 'Verification OTP',
      message: `Your verification OTP is: ${otp}`
    });
    
    res.status(200).json({
      success: true,
      message: 'User registered. Please verify your phone/email with the OTP sent.'
    });
  } catch (err) {
    user.otpToken = undefined;
    user.otpExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse('OTP could not be sent', 500));
  }
});

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOTP = asyncHandler(async (req, res, next) => {
  const { email, phone, otp } = req.body;

  // Get user by email or phone
  const user = await User.findOne({
    $or: [{ email }, { phone }],
    otpExpire: { $gt: Date.now() }
  });

  if (!user) {
    return next(new ErrorResponse('Invalid or expired OTP', 400));
  }

  // Check OTP
  const isMatch = await bcrypt.compare(otp, user.otpToken);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid OTP', 400));
  }

  // Update user
  user.otpVerified = true;
  user.isVerified = true;
  user.otpToken = undefined;
  user.otpExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, phone, password } = req.body;

  // Check for email/phone and password
  if ((!email && !phone) || !password) {
    return next(new ErrorResponse('Please provide credentials', 400));
  }

  // Find user by email or phone
  const query = email ? { email } : { phone };
  const user = await User.findOne(query).select('+password');

  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Generate OTP for login
  const otp = user.generateOTPToken();
  await user.save();

  // Send OTP to email/phone
  try {
    if (phone) {
      await sendSMS({
        to: phone,
        message: `Your login OTP is: ${otp}`
      });
    }

    if (email) {
      await sendEmail({
        email: email,
        subject: 'Login OTP',
        message: `Your login OTP is: ${otp}`
      });
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent to your email/phone',
      userId: user._id
    });
  } catch (err) {
    user.otpToken = undefined;
    user.otpExpire = undefined;
    await user.save();

    return next(new ErrorResponse('OTP could not be sent', 500));
  }
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Logout user / clear cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse('Password is incorrect', 401));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token
    });
};