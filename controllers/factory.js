const AsyncHandler = require("../utils/AsyncHandler");
const CustomeError = require("../utils/CustomError");
const SerchFilter = require("../utils/SearchFilter");

exports.CreateOne = (Model) =>
  AsyncHandler(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: "Success",
      data: doc,
    });
  });
exports.GetOne = (Model, popOption) =>
  AsyncHandler(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOption) {
      query = query.populate(popOption);
    }
    const doc = await query;
    if (!doc) {
      return next(
        new CustomeError(
          "No document found with that ID. Please check the ID and try again.",
          404
        )
      );
    }
    res.status(200).json({
      status: "Success",
      data: doc,
    });
  });
exports.UpdateOne = (Model) =>
  AsyncHandler(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return next(
        new CustomeError(
          "No document found with that ID. Please check the ID and try again.",
          404
        )
      );
    }
    res.status(200).json({
      status: "success",
      data: doc,
    });
  });
exports.DeleteOne = (Model) =>
  AsyncHandler(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(
        new CustomeError(
          "No document found with that ID. Please check the ID and try again.",
          404
        )
      );
    }
    res.status(204).json({
      status: "success",
      data: null,
    });
  });
exports.GetAll = (Model) =>
  AsyncHandler(async (req, res, next) => {
    const filter = new SerchFilter(Model.find(), req.query)
      .filter()
      .sort()
      .limitFileds()
      .page();
    const doc = await filter.query;
    if (doc.length === 0) {
      return res.status(200).json({
        status: "Success",
        message: "Data is Not available at This time",
      });
    }
    res.status(200).json({
      status: "Success",
      result: doc.length,
      data: doc,
    });
  });
