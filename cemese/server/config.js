var path = require("path");
var _ = require("underscore");

var defaults = {
  base: {
    port: 3000,
    secret: "123",
    db: {
      username: "root",
      password: "",
      database: "cemese"
    },
    uploadsPath: path.join(__dirname, "../../uploads")
  },
  development: {},
  test: {
    port: 3001
  },
  production: {}
};

function set(configurations) {
  var env = getEnv();
  console.log("Set configuration for environment %s", env);
  exports.current = _.extend(defaults.base, _.defaults[env], configurations.base, configurations[env]);
}

function getEnv () {
  return process.env.NODE_ENV || "development";
}

set(defaults);

exports.set = set;
exports.getEnv = getEnv;
