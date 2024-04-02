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

module.exports = router;
