var _ = require("underscore");
var Sequelize = require("sequelize");
var db = require("./db");

exports.all = [];

exports.create = function (modelName, attributes, options) {
  attributes = extendAttributes(attributes);
  var model = db.define(modelName, attributes, options);

  exports.all.push(model);
  exports[modelName] = model;
  return model;
};

function extendAttributes(attributes) {
  _.each(attributes, function (attribute, attributeName) {
    if (attribute.ctype === "text") {
      attribute.type = Sequelize.STRING;
    } else if (attribute.ctype === "markdown") {
      attribute.type = Sequelize.TEXT;
    }
  });
  return attributes;
}