const express = require("express");
const globalErrorHandelr = require("./controllers/errorController");
const CustomeError = require("./utils/CustomError");
const userRouter = require("./routes/userRoutes");

const app = express();
app.use(express.json());

app.use("/api/v1/users", userRouter);
app.all("*", (req, res, next) => {
  next(new CustomeError(`This Route ${req.originalUrl} Not Exist `, 404));
});

app.use(globalErrorHandelr);
module.exports = app;
