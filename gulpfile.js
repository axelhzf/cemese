var Combine = require("stream-combiner");
var gulp = require("gulp");
var gutil = require("gulp-util");
var less = require("gulp-less");
var prefix = require("gulp-autoprefixer");

var folder = {
  src: {
    js: "cemese/client/",
    less: "cemese/assets/less"
  },
  dest: {
    less: "cemese/assets/style",
    js: "cemese/assets/js",
    fonts: "cemese/assets/fonts"
  }
};

gulp.task("less", function () {
  var combined = Combine(
    gulp.src(folder.src.less + "/main.less"),
    less({ paths: ["./node_modules/"]}),
    prefix(),
    gulp.dest(folder.dest.less)
  );
  combined.on("error", gutil.log)
});

gulp.task("watch", ["less"], function () {
  gulp.watch(folder.src.less + "/**/*.less", ["less"]);
});

gulp.task("default", ["less"]);