const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  property: {
    type: mongoose.Schema.ObjectId,
    ref: "Property",
    required: [true, "Booking Must Belong to Property"],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "Booking Must Belong to User"],
  },
  totalPrice: {
    type: Number,
    required: [true, "Booking Must Have price"],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  paid: {
    type: Boolean,
    default: true,
  },
  duration: {
    type: Number,
    validate: {
      validator: function (days) {
        return days > 0;
      },
      message: "Booking must have a positive duration in days",
    },
    required: [true, "Booking Must Have Duration In Day"],
  },
});

bookingSchema.pre(/^find/, function (next) {
  this.populate("user").populate({
    path: "property",
    select: "name",
  });

  next();
});

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
