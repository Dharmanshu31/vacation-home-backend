const Property = require("../models/propertyModel");
const AsyncHandler = require("../utils/AsyncHandler");
const factory = require("./factory");

exports.getAllProperty = factory.GetAll(Property);
exports.getProperty = factory.GetOne(Property);

exports.addOwner = (req, res, next) => {
  req.body.owner = req.user.id;
  next();
};

exports.createProperty = factory.CreateOne(Property);
exports.updateProperty = factory.UpdateOne(Property);
exports.deleteProperty = factory.DeleteOne(Property);

//  api/v1/property/property-near/distance/:latlag/unit/:unit
exports.nearByMe = AsyncHandler(async (req, res, next) => {
  const { latlag, unit } = req.params;
  const [lat, lag] = latlag.split(",");
  const multi = unit === "km" ? 0.001 : 0.000621371;

  const distance = await Property.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [+lag, +lat],
        },
        distanceField: "distance",
        distanceMultiplier: multi,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);
  res.status(200).json({
    status: "Success",
    data: distance,
  });
});
