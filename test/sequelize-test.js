var co = require("co");

co(function* () {
  try {

    var Sequelize = require("sequelize");

    var sequelize = new Sequelize("cemese-blog", "root", "");

    var TableA = sequelize.define("TableA", {
      fieldA: {
        type: Sequelize.STRING
      }
    });

    var TableB = sequelize.define("TableB", {
      fieldB: {
        type: Sequelize.STRING
      }
    });

    TableB.hasOne(TableA, {as: "myTable", foreignKey: "myTableId"});

    yield sequelize.sync({force: true});


    var a1 = yield TableA.create({fieldA: "A"});
    var b1 = yield TableB.create({fieldB: "B"});
    //console.log(a1.values, b1.values);


    yield b1.setMyTable(a1);

    var myTable = yield b1.getMyTable();
    console.log(myTable.values);
    console.log(b1);


  } catch(e) {
    console.trace(e);
  }


})();