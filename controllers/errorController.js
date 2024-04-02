const CustomeError = require("../utils/CustomError");

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "Error";

  // for duplicate unique key
  if (err.code == 11000) {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    err = new CustomeError(`Duplicate value ${value} please use unique value`, 400);
  }

  //for invalid id
  if (err.name == "CastError") {
    err = new CustomeError(`Invalid ${err.path}:${err.value}`, 404);
  }

  //Invalid Token
  if (err.name == "JsonWebTokenError") {
    err = new CustomeError(`Invalid webToken Login again!!!`, 401);
  }

  //Time Expire
  if (err.name == "TokenExpiredError") {
    err = new CustomeError(`Your token is Expired`, 401);
  }

  ////update data with invalid data
  if (err.name == "ValidationError") {
    const error = Object.values(err.errors).map((el) => el.message);
    err = new CustomeError(`Invalid Input Data. ${error.join(". ")}`, 404);
  }

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};
