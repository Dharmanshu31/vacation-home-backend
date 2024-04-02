const User = require("../models/userModel");
const { promisify } = require("util");
const AsyncHandler = require("../utils/AsyncHandler");
const CustomeError = require("../utils/CustomError");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");

const getToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXP,
  });
};

const createAndSendToken = (user, statusCode, res) => {
  const token = getToken(user._id);
  user.password = undefined;
  res.status(statusCode).json({
    status: "success",
    token,
    data: { user },
  });
};

exports.signUp = AsyncHandler(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
  });
  createAndSendToken(newUser, 201, res);
});

exports.login = AsyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new CustomeError("Provide Email And Password", 400));
  }
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password, user.password))) {
    return next(new CustomeError("Email or Password is InCorrect", 401));
  }

  createAndSendToken(user, 200, res);
});

exports.protect = AsyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(new CustomeError("You are Not Login!!! login to get access!!!!", 401));
  }

  const tokenVal = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(tokenVal.id);

  if (!currentUser) {
    return next(new CustomeError("User not Exist!! loging to get access", 401));
  }

  if (currentUser.changePasswordAfter(tokenVal.iat)) {
    return next(new CustomeError("User Has Changed Password Login Again!!!!!", 401));
  }

  req.user = currentUser;
  next();
});

exports.roleBaseAuth = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new CustomeError(
          "Access denied. You do not have permission to perform this operation.",
          403
        )
      );
    }
    next();
  };
};

exports.forgetPassword = AsyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new CustomeError(
        "User not found. Please check the email address and try again.",
        404
      )
    );
  }
  const resetToken = user.resetPassword();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;
  const message = `
  <p>You are receiving this email because you (or someone else) has requested the reset of a password. Please click on the following link to complete the process:</p>
  <p><a href="${resetUrl}">${resetUrl}</a></p>
  <p><b>This Token Will Be Expire After 10 Minute So Huryy Up!!!!!!</b></p>
  <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password Reset Request for Home Holiday Hubbub",
      html: message,
    });
    res.status(200).json({
      status: "success",
      message: "Token sent to Email",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.ResetExpireTime = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new CustomeError("There is some problem in system try again", 500));
  }
});

exports.resetPassword = AsyncHandler(async (req, res, next) => {
  const hashToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashToken,
    ResetExpireTime: { $gt: Date.now() },
  });
  if (!user) {
    return next(
      new CustomeError(
        "Invalid token or the reset link has expired. Please request a new password reset link."
      ),
      400
    );
  }
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.ResetExpireTime = undefined;
  user.passwordChangeAt = Date.now() - 1000;

  await user.save();
  createAndSendToken(user, 200, res);
});

exports.updatePassword = AsyncHandler(async (req, res, next) => {
  if (!req.body.currentPassword) {
    return next(
      new CustomeError("Please enter your current password to update your password.")
    );
  }
  const user = await User.findById(req.user.id).select("+password");
  if (!(await user.comparePassword(req.body.currentPassword, user.password))) {
    return next(
      new CustomeError(
        "Incorrect old password. Please enter the correct password or reset your password.",
        401
      )
    );
  }
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  await user.save();
  createAndSendToken(user, 200, res);
});
