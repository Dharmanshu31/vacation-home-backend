const { mongoose } = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Oops! It looks like you forgot to fill in Name"],
  },
  email: {
    type: String,
    required: [true, "Oops! It looks like you forgot to fill in Email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Pls Enter Valid Email !!!!"],
  },
  photo: {
    type: String,
    default: "default.jpeg",
  },
  password: {
    type: String,
    required: [true, "Please set a password to continue."],
    minlength: 8,
    maxlength: 20,
    validate: {
      validator: function (v) {
        return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/.test(
          v
        );
      },
      message:
        "Password must contain at least one digit, one lowercase letter, one uppercase letter, one special character, and be at least 8 characters long.",
    },
    select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, "Please re-enter your password to confirm."],
    validate: {
      validator: function (v) {
        return v === this.password;
      },
      message: "Passwords do not match. Please make sure your passwords match.",
    },
  },
  role: {
    type: String,
    enum: ["admin", "user", "landlord"],
    default: "user",
  },
  passwordChangeAt: Date,
  passwordResetToken: String,
  ResetExpireTime: Date,
});

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
    this.confirmPassword = undefined;
  }
  next();
});

userSchema.methods.comparePassword = async (candidatePassword, userPassword) => {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changePasswordAfter = function (JWTTimeStemp) {
  if (this.passwordChangeAt) {
    const changeTimestemp = parseInt(this.passwordChangeAt.getTime() / 1000, 10);
    return JWTTimeStemp < changeTimestemp;
  }
};

userSchema.methods.resetPassword = function () {
  const rendomToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto.createHash("sha256").update(rendomToken).digest("hex");
  this.ResetExpireTime = Date.now() + 10 * 60 * 1000;
  return rendomToken;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
