const Property = require("../models/propertyModel");
const factory = require("./factory");

exports.getAllProperty = factory.GetAll(Property);
exports.getProperty = factory.GetOne(Property);
exports.createProperty = factory.CreateOne(Property);
exports.updateProperty = factory.UpdateOne(Property);
exports.deleteProperty = factory.DeleteOne(Property);
