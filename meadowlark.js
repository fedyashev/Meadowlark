var express = require("express");
var fortune = require("./lib/fortune.js");

var app = express();

// var fortunes = [
//   "Conquer your fears or they will conquer you.",
//   "Rivers need springs.",
//   "Do not fear what you don't know.",
//   "You will have a pleasant surprise.",
//   "Whenever possible, keep it simple."
// ];

// set up handlebars view engine
var handlebars = require("express3-handlebars").create({defaultLayout: "main"});
app.engine("handlebars", handlebars.engine);
app.set("view engine", "handlebars");

// set up static
app.use(express.static(__dirname + "/public"));

app.set("port", process.env.PORT || 3000);

app.use(function(req, res, next) {
  res.locals.showTests = app.get("env") !== "production" && req.query.test === "1";
  next();
});

app.get("/", function(req, res) {
  res.render("home");
});

app.get("/about", function(req, res) {
  //var randomFortune = fortunes[Math.floor(Math.random() * fortunes.length)];
  res.render("about", {fortune: fortune.getFortune()});
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