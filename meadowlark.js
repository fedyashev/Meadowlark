// Import npm modules
var express = require("express");
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var expressSession = require("express-session");

var mongoose = require("mongoose");
//var MongoSessionStore = require("session-mongoose")(require("connect"));
//var sessionStore = new MongoSessionStore({url: credentials.mongo.connectionString});
//var jqupload = require("jquery-file-upload-middleware");

// Import project modules
var weather = require("./lib/weather.js");
var credentials = require("./credentials.js");
var cartValidation = require("./lib/cartValidation.js");

// Initial seeds in 
//require("./models/initialsSeeds.js")();

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

// Router
var router = require("./routes/index.js")(app);

// run server to listen clients
app.listen(app.get("port"), function() {
  console.log("Express started on http://localhost:" + app.get("port") + "; press CTRL+C to terminate.");
});