var _ = require("underscore");
var koa = require("koa");
var router = require("koa-router");
var koa_body = require('koa-body');
var views = require("koa-views");
var serve = require('koa-static');
var mount = require("koa-mount");
var session = require('koa-session');
var flash = require("koa-flash");
var co = require("co");
_.mixin(require('safe-obj'));
var events = require("./events");


var config = require("./config");
var db = require("./db");

var debug = require("debug")("cemese");

var app = koa();

app.use(views('views', {
  default: 'jade'
}));

app.use(loggerMiddleware);

function mountStatic (url, path) {
  var assets = koa();
  assets.use(serve(path));
  app.use(mount(url, assets));
}

//
mountStatic("/assets/libs/marked", __dirname + "/../../node_modules/marked/lib");
mountStatic("/assets/libs/codemirror", __dirname + "/../../node_modules/codemirror");
mountStatic("/assets/libs/jquery", __dirname + "/../../node_modules/jquery/dist");
mountStatic("/assets/client", __dirname + '/../client');

mountStatic("/assets", __dirname + '/../assets');
mountStatic("/uploads", __dirname + '/../../uploads');


app.use(koa_body());
app.keys = ['some secret hurr'];
app.use(session());
app.use(flash());

app.use(function *(next) {
  this.locals = {
    _: _,
    flash: this.flash
  };
  yield *next;
});

app.use(router(app));

//controllers
require("./controller/AdminController")(app);

function* loggerMiddleware (next) {
  var start = new Date();
  yield next;
  var ms = new Date - start;
  debug("%s %s - %s ms", this.method, this.url, ms);
}

var server;

app.start = function* () {
  yield events.emit("beforeStart");
  yield db.syncAllModels();

  var port = config.current.port;
  debug("App listening at %s", port);
  server = app.listen(port);
  yield events.emit("afterStart");
};

app.stop = function* () {
  yield events.emit("beforeStop");
  server.close();
  yield events.emit("afterStop");
};

module.exports = app;


