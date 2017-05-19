var express = require("express");
var bodyParser = require("body-parser");
var formidable = require("formidable");
//var jqupload = require("jquery-file-upload-middleware");

var fortune = require("./lib/fortune.js");
var weather = require("./lib/weather.js");

// set up handlebars view engine
var handlebars = require("express3-handlebars").create({
  defaultLayout: "main",
  helpers: {
    section: function(name, options) {
      if (!this._sections) this._sections = {};
      this._sections[name] = options.fn(this);
      return null;
    }
  }
});

var app = express();

app.engine("handlebars", handlebars.engine);
app.set("view engine", "handlebars");

app.set("port", process.env.PORT || 3000);

app.use(function(req, res, next) {
  if(!res.locals.partials) res.locals.partials = {};
  res.locals.partials.weather = weather.getWeatherData();
  next();
});

// app.use("/upload", function(req, res, next) {
//   var now = Date.now();
//   jqupload.fileHandler({
//     uploadDir: function() {
//       return __dirname + "/public/uploads/" + now;
//     },
//     uploadUrl: function() {
//       return "/uploads/" + now;
//     },
//   })(req, res, next);
// });

app.use(bodyParser());

// set up static
app.use(express.static(__dirname + "/public"));

app.use(function(req, res, next) {
  res.locals.showTests = app.get("env") !== "production" && req.query.test === "1";
  next();
});

// app.disable("x-powered-by");

// routes
app.get("/", function(req, res) {
  res.render("home");
});

app.get("/header", function(req, res) {
  res.set("Content-Type", "text/plain");
  var s = "";
  for (var name in req.headers) {
    s += name + ": " + req.headers[name] + "\n";
  }
  res.send(s);
});

app.get("/jquery-test", function(req, res) {
  res.render("jquery-test");
});

app.get("/nursery-rhyme", function(req, res) {
  res.render("nursery-rhyme");
});

app.get("/data/nursery-rhyme", function(req, res) {
  res.json({
    animal: "squirel",
    bodyPart: "tail",
    adjective: "bushy",
    noun: "neck"
  });
});

app.get("/newsletter", function(req, res) {
  // TODO
  res.render("newsletter", {csrf: "CSRF token goes here"});
});

app.post("/process", function(req, res) {
  // console.log('Form (from querystring): ' + req.query.form);
  // console.log('CSRF token (from hidden form field): ' + req.body._csrf);
  // console.log('Name (from visible form field): ' + req.body.name);
  // console.log('Email (from visible form field): ' + req.body.email);
  if (req.xhr || req.accepts("json,html")==="json") {
    res.send({success: "true"});
  } else {
    res.redirect(303, "/thank-you");
  }
  //res.redirect(303, '/thank-you');
});

app.get("/thank-you", function(req, res) {
  res.render("thank-you");
});

app.get("/about", function(req, res) {
  res.render("about", {
    fortune: fortune.getFortune(),
    pageTestScript : "/qa/tests-about.js"
  });
});

app.get("/tours/hood-river", function(req, res) {
  res.render("tours/hood-river");
});

app.get("/tours/oregon-coast", function(req, res) {
  res.render("tours/oregon-coast");
});

app.get("/tours/request-group-rate", function(req, res) {
  res.render("tours/request-group-rate");
});

app.get("/contest/vacation-photo", function(req, res) {
  var now = new Date();
  res.render("contest/vacation-photo", {
    year: now.getFullYear(),
    month: now.getMonth(),
  });
});

app.post("/contest/vacation-photo/:year/:month", function(req, res) {
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files) {
    if (err) return res.redirect(303, "/error");
    console.log("recieved fields:");
    console.log(fields);
    console.log("recieved files:");
    console.log(files);
    res.redirect(303, "/thank-you");
  });
});

app.get("/error", function(req, res) {
  res.render("error");
});

// custom 404 page
app.use(function(req, res, next) {
  res.status(404);
  res.render("404");
});

// custom 500 page
app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500);
  res.render("500");
});

// run server to listen clients
app.listen(app.get("port"), function() {
  console.log("Express started on http://localhost:" + app.get("port") + "; press CTRL+C to terminate.");
});