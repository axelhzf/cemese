var _ = require("underscore");

var modules = {
  server: "./server",
  db: "./db",
  config: "./config",
  events: "./events",
  models: "./models"
};

//lazy load to avoid auto initialization
var cemese = {};
_.each(modules, function (path, module) {
  Object.defineProperty(cemese, module, {
    get: function () {
      return require(path);
    }
  })
});

module.exports = cemese;