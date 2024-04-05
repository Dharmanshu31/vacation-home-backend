const stripe = require("stripe")(process.env.STRIP_SECRET);
const Booking = require("../models/bookingModel");
const Property = require("../models/propertyModel");
const AsyncHandler = require("../utils/AsyncHandler");
const CustomeError = require("../utils/CustomError");
const factory = require("./factory");

exports.getCheckoutSession = AsyncHandler(async (req, res, next) => {
  const duration = +req.params.duration;
  if (isNaN(duration) || duration <= 0) {
    return next(new CustomeError("Invalid Duration", 400));
  }
  const property = await Property.findById(req.params.propertyId);
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    success_url: `${req.protocol}://${req.get("host")}/booking/success`,
    cancel_url: `${req.protocol}://${req.get("host")}/property/${property.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.propertyId,
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "inr",
          product_data: {
            name: `${property.name} Home`,
            description: property.description,
            images: [
              "https://images.pexels.com/photos/2034335/pexels-photo-2034335.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=650",
            ],
          },
          unit_amount: property.pricePerNight * 100 * duration,
        },
        quantity: 1,
      },
    ],
  });

  if (session) {
    await Booking.create({
      property: req.params.propertyId,
      user: req.user.id,
      totalPrice: property.pricePerNight * duration,
      duration: req.params.duration,
    });
    property.isBooked = true;
    await property.save();
  }
  res.status(200).json({
    status: "Success",
    session: session.url,
  });
});

exports.getAllBookings = factory.GetAll(Booking);
exports.getBookings = factory.GetOne(Booking);
exports.updateBookings = factory.UpdateOne(Booking);
exports.deleteBookings = factory.DeleteOne(Booking);
exports.createBookings = factory.CreateOne(Booking);
