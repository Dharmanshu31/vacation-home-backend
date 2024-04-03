const User = require("../models/userModel");
const AsyncHandler = require("../utils/AsyncHandler");
const CustomeError = require("../utils/CustomError");
const factory = require("./factory");

const filterObj = (obj, ...allowFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = AsyncHandler(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(new CustomeError("It`s Not for Password Change try any other way", 401));
  }
  const filteredBody = filterObj(req.body, "name", "email");
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: "Success",
    data: updatedUser,
  });
});

exports.deleteMe = AsyncHandler(async (req, res, next) => {
  await User.findByIdAndDelete(req.user.id);
  res.status(204).json({
    status: "Success",
    data: null,
  });
});

exports.getUser = factory.GetOne(User);
exports.getAllUsers = factory.GetAll(User);
exports.updateUser = factory.UpdateOne(User);
exports.deleteUser = factory.DeleteOne(User);
