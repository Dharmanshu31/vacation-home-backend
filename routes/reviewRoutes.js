const express = require("express");
const authController = require("../controllers/authController");
const reviewController = require("../controllers/reviewController");

const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
  .route("/")
  .get(reviewController.getAllReviews)
  .post(
    authController.roleBaseAuth("user"),
    reviewController.setPropertyUserId,
    reviewController.createReiew
  );

router
  .route("/:id")
  .get(reviewController.getReview)
  .patch(authController.roleBaseAuth("user", "admin"), reviewController.updateReiew)
  .delete(authController.roleBaseAuth("user", "admin"), reviewController.deleteReiew);
module.exports = router;
