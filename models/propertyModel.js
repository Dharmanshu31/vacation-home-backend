const mongoose = require("mongoose");
const slugify = require("slugify");
const axios = require("axios");

const propertySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A property must have a name"],
      trim: true,
      maxlength: [100, "Property name must have less or equal than 100 characters"],
      minlength: [10, "Property name must have more or equal than 10 characters"],
    },
    isBooked: {
      type: Boolean,
      default: false,
    },
    slug: String,
    description: {
      type: String,
      required: [true, "A property must have a description"],
      trim: true,
    },
    location: {
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    city: String,
    pricePerNight: {
      type: Number,
      required: [true, "A property must have a price per night"],
    },
    maxGuests: {
      type: Number,
      required: [true, "A property must specify the maximum number of guests"],
    },
    bedrooms: {
      type: Number,
      required: [true, "A property must specify the number of bedrooms"],
    },
    bathrooms: {
      type: Number,
      required: [true, "A property must specify the number of bathrooms"],
    },
    size: {
      type: Number,
      required: [true, "A property must have a size in square feet"],
    },
    amenities: {
      type: [String],
      default: [],
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Rating must be above 1.0"],
      max: [5, "Rating must be below 5.0"],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    images: {
      type: [String],
      required: [true, "Property Must have Images!! pls!! upload"],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    owner: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

propertySchema.index({ location: "2dsphere" });

propertySchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

propertySchema.pre(/^find/, function (next) {
  this.populate({
    path: "owner",
    select: "-__v -passwordChangeAt -role",
  });
  next();
});

propertySchema.virtual("reviews", {
  ref: "Review",
  foreignField: "property",
  localField: "_id",
});

propertySchema.post("save", async function (data) {
  if (data.isModified("location")) {
    const address = await axios.get(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${data.location.coordinates[1]}&longitude=${data.location.coordinates[0]}&localityLanguage=en`
    );
    data.city = address.data.city;
    await data.save({ validateBeforeSave: false });
  }
});

const Property = mongoose.model("Property", propertySchema);

module.exports = Property;
