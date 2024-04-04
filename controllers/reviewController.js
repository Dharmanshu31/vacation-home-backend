const Review = require("../models/reviewModel");
const factory = require("./factory");

exports.getAllReviews = factory.GetAll(Review);
exports.getReview = factory.GetOne(Review);

exports.setPropertyUserId = (req, res, next) => {
  if (!req.body.property) req.body.property = req.params.propertyId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.createReiew = factory.CreateOne(Review);
exports.updateReiew = factory.UpdateOne(Review);
exports.deleteReiew = factory.DeleteOne(Review);
