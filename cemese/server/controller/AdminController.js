var _ = require("underscore");
var models = require("../models");

module.exports = function (app) {

  function* layout(ctx) {
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
    var modelName = this.params.modelName;
    var Model = models[modelName];

    var item = Model.build();
    var ctx = {
      Model: Model,
      item: item
    };
    yield layout(ctx);
    yield this.render("admin/models/create", ctx);
  });

  app.post("/admin/models/:modelName/create", function *() {
    var modelName = this.params.modelName;
    var Model = models[modelName];
    var item = this.request.body;
    try {
      yield Model.create(item);
      this.redirect("/admin/models/" + modelName)
    } catch(e) {
      this.flash = {error: error, item: item};
      this.redirect(this.request.path);
    }
  });

  app.get("/admin/models/:modelName/:id/edit", function *() {
    var modelName = this.params.modelName;
    var id = this.params.id;
    var Model = models[modelName];

    var associationItems = {};

    for (var key in Model.associations) {
      var value = Model.associations[key];
      var AssociationModelName = value.target.name;
      var AssociationModel = models[AssociationModelName];
      associationItems[AssociationModelName] = yield AssociationModel.findAll();
    }

    var item = yield Model.find(id);
    var ctx = {
      Model: Model,
      item: item,
      associationItems: associationItems
    };
    yield layout(ctx);
    yield this.render("admin/models/edit", ctx);
  });

  app.post("/admin/models/:modelName/:id/edit", function *() {
    var modelName = this.params.modelName;
    var id = this.params.id;
    var Model = models[modelName];

    try {

      var model = yield Model.find(id);

      var attributeNames = _.without(_.keys(Model.rawAttributes), "id", "createdAt", "updatedAt");
      var attributes = _.pick(this.request.body, attributeNames);
      yield model.updateAttributes(attributes);

      for (var associationName in Model.associations) {
        var association = Model.associations[associationName];
        var valueId = this.request.body[associationName];
        var value = yield association.target.find(valueId);
        model[association.accessors.set](value);
      }

      this.redirect("/admin/models/" + modelName)
    } catch(error) {
      this.flash = {error: error};
      this.redirect(this.request.path);
    }
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
      yield Model.destroy({id : id});
      this.redirect("/admin/models/" + modelName)
    } catch(error) {
      this.flash = {error: error, item: item};
      this.redirect(this.request.path);
    }
  });

}