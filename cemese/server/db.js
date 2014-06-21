var path = require("path");
var fs = require("fs");
var _ = require("underscore");
var Sequelize = require("sequelize");
var config = require("./config");
var debug = require("debug")("cemese:db");


//Define global data types
Sequelize.URL = Sequelize.STRING(2083);


var database = config.current.db.database;
var username = config.current.db.username;
var password = config.current.db.password;
debug("Connecting to %s with username %s", database, username);
var db = new Sequelize(database, username, password, {
  logging: debug
});

module.exports = db;

db.syncAllModels = function (options) {
  options || (options = {});
  return db.sync({force: options.force});
};

function loadModels () {
  //TODO user model path
  var modelPath = path.join(__dirname, "./model");
  var modelFiles = fs.readdirSync(modelPath);

  db.models = [];
  modelFiles.forEach(function (file) {
    var model = require(path.join(modelPath, file));
    db.models.push(model);
  });
}

loadModels();

