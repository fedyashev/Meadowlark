/* Import libaries */

// import npm libs
var express = require("express");
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var expressSession = require("express-session");

var mongoose = require("mongoose");
//var MongoSessionStore = require("session-mongoose")(require("connect"));
//var sessionStore = new MongoSessionStore({url: credentials.mongo.connectionString});
//var jqupload = require("jquery-file-upload-middleware");

// import project libs
var weather = require("./lib/weather.js");
var credentials = require("./credentials.js");
var cartValidation = require("./lib/cartValidation.js");

// import models
var Vacation = require("./models/vacation.js");
var VacationInSeasonListener = require("./models/vacationInSeasonListener.js");

Vacation.find(function(err, vacations) {
  if(vacations.length) return;

  new Vacation({
    name: 'Hood River Day Trip',
    slug: 'hood-river-day-trip',
    category: 'Day Trip',
    sku: 'HR199',
    description: 'Spend a day sailing on the Columbia and ' +
      'enjoying craft beers in Hood River!',
    priceInCents: 9995,
    tags: ['day trip', 'hood river', 'sailing', 'windsurfing', 'breweries'],
    inSeason: true,
    maximumGuests: 16,
    available: true,
    packagesSold: 0,
  }).save();

  new Vacation({
    name: 'Oregon Coast Getaway',
    slug: 'oregon-coast-getaway',
    category: 'Weekend Getaway',
    sku: 'OC39',
    description: 'Enjoy the ocean air and quaint coastal towns!',
    priceInCents: 269995,
    tags: ['weekend getaway', 'oregon coast', 'beachcombing'],
    inSeason: false,
    maximumGuests: 8,
    available: true,
    packagesSold: 0,
  }).save();

  new Vacation({
    name: 'Rock Climbing in Bend',
    slug: 'rock-climbing-in-bend',
    category: 'Adventure',
    sku: 'B99',
    description: 'Experience the thrill of climbing in the high desert.',
    priceInCents: 289995,
    tags: ['weekend getaway', 'bend', 'high desert', 'rock climbing'],
    inSeason: true,
    requiresWaiver: true,
    maximumGuests: 4,
    available: false,
    packagesSold: 0,
    notes: 'The tour guide is currently recovering from a skiing accident.',
  }).save();
});

/* Configurate application */

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

app.set("port", process.env.PORT || 3000);

// set up templating engine - Handlebars
app.engine("handlebars", handlebars.engine);
app.set("view engine", "handlebars");

// set up body-parser
app.use(bodyParser.urlencoded({extended: "false"}));
app.use(bodyParser.json());

// set up cookie-parser
app.use(cookieParser(credentials.cookieSecret));

// set up express-session
app.use(expressSession({
  resave: false,
  saveUninitialized: false,
  secret: "secret",
}));

// add partials to Handlebars helpers
app.use(function(req, res, next) {
  if(!res.locals.partials) res.locals.partials = {};
  res.locals.partials.weather = weather.getWeatherData();
  next();
});

// add flash messages to sessions
app.use(function(req, res, next) {
  res.locals.flash = req.session.flash;
  delete req.session.flash;
  next();
});

app.use(cartValidation.checkWaivers);
app.use(cartValidation.checkGuestCounts);

// set up static
app.use(express.static(__dirname + "/public"));

app.use(function(req, res, next) {
  res.locals.showTests = app.get("env") !== "production" && req.query.test === "1";
  next();
});


app.use(function(req, res, next) {
  console.log("[" + (new Date()).toLocaleString() + "]" + " URL: " + req.url + "");
  next();
});

// set up mongoose
var opts = {
  server: {
    socketOptions: {keepAlive: 1},
  },
};

switch(app.get("env")) {
  case "development":
    mongoose.connect(credentials.mongo.development.connectionString, opts);
    break;
  case "production":
    mongoose.connect(credentials.mongo.production.connectionString, opts);
    break;
  default:
    throw new Error("Unknow execution enviroment: " + app.get("env"));
}

var router = require("./routes.js")(app);

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