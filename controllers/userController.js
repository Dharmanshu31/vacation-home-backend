const User = require("../models/userModel");
const multer = require("multer");
const sharp = require("sharp");
const AsyncHandler = require("../utils/AsyncHandler");
const CustomeError = require("../utils/CustomError");
const factory = require("./factory");

const multerStorage = multer.memoryStorage();
const filter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new CustomeError("Not An Image Plz Upload Image!!!!!", 400), false);
  }
};

const uplode = multer({
  storage: multerStorage,
  fileFilter: filter,
});
exports.uploadUserPhoto = uplode.single("photo");
exports.resizeUserPhoto = AsyncHandler(async (req, res, next) => {
  if (!req.file) return next();
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/users/${req.file.filename}`);
  next();
});

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
  if (req.file) filteredBody.photo = req.file.filename;
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
