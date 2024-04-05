const express = require("express");
const authController = require("../controllers/authController");
const bookingController = require("../controllers/bookingController");

const router = express.Router();

router.use(authController.protect);

router.get("/:propertyId/:duration/pay", bookingController.getCheckoutSession);

router.use(authController.roleBaseAuth("admin", "landlord"));
router
  .route("/")
  .get(bookingController.getAllBookings)
  .post(bookingController.createBookings);
router
  .route("/:id")
  .get(bookingController.getBookings)
  .patch(bookingController.updateBookings)
  .delete(bookingController.deleteBookings);
module.exports = router;
