const Property = require("../models/propertyModel");
const AsyncHandler = require("../utils/AsyncHandler");
const CustomeError = require("../utils/CustomError");
const factory = require("./factory");
const multer = require("multer");
const sharp = require("sharp");
const axios = require("axios");

const multerStoreg = multer.memoryStorage();
const filter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new CustomeError("Not An Image Plz Upload Image!!!!!", 400), false);
  }
};
const uplode = multer({
  storage: multerStoreg,
  fileFilter: filter,
});
exports.uplodePropertyImage = uplode.fields([{ name: "images", maxCount: 5 }]);

exports.resizeImages = AsyncHandler(async (req, res, next) => {
  if (req.files.images) {
    req.body.images = [];
    await Promise.all(
      req.files.images.map(async (file, index) => {
        const filename = `Peoperty-${req.body.name}-${Date.now()}-${index++}.jpeg`;
        await sharp(file.buffer)
          .resize(2000, 1333)
          .toFormat("jpeg")
          .jpeg({ quality: 90 })
          .toFile(`public/property/${filename}`);
        req.body.images.push(filename);
      })
    );
  }
  next();
});

exports.getAllProperty = factory.GetAll(Property);
exports.getProperty = factory.GetOne(Property, {
  path: "reviews",
});

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

  const data = await axios.get(
    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lag}&localityLanguage=en`
  );
  const city = data.data.city;
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
      $match: { city: city },
    },
    {
      $project: {
        distance: 1,
        name: 1,
        city: -1,
      },
    },
  ]);
  res.status(200).json({
    status: "Success",
    data: distance,
  });
});
