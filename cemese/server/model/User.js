var Sequelize = require("sequelize");
var db = require("../db");

var User = db.define("User", {
  username: Sequelize.STRING,
  password: Sequelize.STRING
}, {

});

module.exports = User;