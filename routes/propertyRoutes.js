const express = require("express");
const propertyController = require("../controllers/propertyController");
const authController = require("../controllers/authController");

const router = express.Router();
router
  .route("/")
  .get(propertyController.getAllProperty)
  .post(
    authController.protect,
    authController.roleBaseAuth("admin", "landlord"),
    propertyController.addOwner,
    propertyController.createProperty
  );

router
  .route("/:id")
  .get(propertyController.getProperty)
  .patch(
    authController.protect,
    authController.roleBaseAuth("admin", "landlord"),
    propertyController.updateProperty
  )
  .delete(
    authController.protect,
    authController.roleBaseAuth("admin", "landlord"),
    propertyController.deleteProperty
  );

router
  .route("/property-near/distance/:latlag/unit/:unit")
  .get(propertyController.nearByMe);

module.exports = router;
