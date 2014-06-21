var _ = require("underscore");
var models = require("../models");

module.exports = function (app) {

  function* layout (ctx) {
    ctx.menuItems = models.all.map(function (model) {
      return {
        title: model.name,
        link: "/admin/models/" + model.name
      }
    });
  }

  app.get("/admin", function* () {
    var ctx = {};
    yield layout(ctx);
    yield this.render("admin/index", ctx);
  });

  app.get("/admin/models/:modelName", function *() {
    var modelName = this.params.modelName;
    var Model = models[modelName];

    var items = yield Model.findAll();
    var ctx = {
      Model: Model,
      items: items
    };
    yield layout(ctx);
    yield this.render("admin/models/index", ctx);
  });

  app.get("/admin/models/:modelName/create", function *() {
    var ctx = yield prepareForm.call(this);
    yield layout(ctx);
    yield this.render("admin/models/create", ctx);
  });

  app.post("/admin/models/:modelName/create", function *() {
    yield createOrUpdateModel.call(this);
  });

  app.get("/admin/models/:modelName/:id/edit", function *() {
    var ctx = yield prepareForm.call(this);
    yield layout(ctx);
    yield this.render("admin/models/edit", ctx);
  });

  app.post("/admin/models/:modelName/:id/edit", function *() {
    var id = this.params.id;
    yield createOrUpdateModel.call(this, id);
  });

  app.get("/admin/models/:modelName/:id/delete", function *() {
    var modelName = this.params.modelName;
    var id = this.params.id;
    var Model = models[modelName];
    var item = yield Model.find(id);

    var ctx = {
      Model: Model,
      item: item
    };

    yield layout(ctx);
    yield this.render("admin/models/delete", ctx);
  });

  app.post("/admin/models/:modelName/:id/delete", function *() {
    var modelName = this.params.modelName;
    var id = this.params.id;
    var Model = models[modelName];
    try {
      yield Model.destroy({id: id});
      this.redirect("/admin/models/" + modelName)
    } catch (error) {
      this.flash = {error: error, item: item};
      this.redirect(this.request.path);
    }
  });

  function *prepareForm () {
    var modelName = this.params.modelName;
    var id = this.params.id;
    var Model = models[modelName];

    var associationItems = {};

    var item;
    if (id) {
      item = yield Model.find(id);
    }

    for (var key in Model.associations) {
      var association = Model.associations[key];
      var associationModelName = association.target.name;
      var associationModel = models[associationModelName];

      var associationItem = {};

      associationItem.all = yield associationModel.findAll();
      if (item) {
        associationItem.selected = yield item[association.accessors.get]();
      }

      associationItems[associationModelName] = associationItem;
    }

    var ctx = {
      Model: Model,
      item: item,
      associationItems: associationItems
    };
    return ctx;
  }

  function* createOrUpdateModel (id) {
    var modelName = this.params.modelName;
    var Model = models[modelName];

    try {

      var attributeNames = _.without(_.keys(Model.rawAttributes), "id", "createdAt", "updatedAt");
      var attributes = _.pick(this.request.body, attributeNames);

      var model;
      if (id) {
        model = yield Model.find(id);
        yield model.updateAttributes(attributes);
      } else {
        model = yield Model.create(attributes);
      }

      for (var associationName in Model.associations) {
        var association = Model.associations[associationName];
        var valueId = this.request.body[associationName];
        var value = yield association.target.find(valueId);
        model[association.accessors.set](value);
      }

      this.redirect("/admin/models/" + modelName)
    } catch (error) {
      this.flash = {error: error};
      this.redirect(this.request.path);
    }
  }

}