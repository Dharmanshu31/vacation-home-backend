const express = require("express");
const globalErrorHandelr = require("./controllers/errorController");
const CustomeError = require("./utils/CustomError");
const propertyRouter = require("./routes/propertyRoutes");
const userRouter = require("./routes/userRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

const app = express();
app.use(express.json());

app.use("/api/v1/property", propertyRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/review", reviewRouter);
app.use("/api/v1/bookings", bookingRoutes);
app.all("*", (req, res, next) => {
  next(new CustomeError(`This Route ${req.originalUrl} Not Exist `, 404));
});

app.use(globalErrorHandelr);
module.exports = app;
