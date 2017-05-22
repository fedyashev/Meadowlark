/* Import libaries */

// import npm libs
var express = require("express");
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var expressSession = require("express-session");
var formidable = require("formidable");
var validator = require("validator");
var fs = require("fs");
var mongoose = require("mongoose");
//var jqupload = require("jquery-file-upload-middleware");

// import project libs
var fortune = require("./lib/fortune.js");
var weather = require("./lib/weather.js");
var credentials = require("./credentials.js");
var cartValidation = require("./lib/cartValidation.js");

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
  //cookie: {secure: true}
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

// app.use(require("./lib/tourRequiresWaiver.js"));

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

// set up static
app.use(express.static(__dirname + "/public"));

app.use(function(req, res, next) {
  res.locals.showTests = app.get("env") !== "production" && req.query.test === "1";
  next();
});


app.use(function(req, res, next) {
  console.log("[" + (new Date()).toLocaleString() + "] " + "processing from URL: " + req.url + "");
  next();
});
// app.disable("x-powered-by");

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

// routes
app.get("/", function(req, res) {
  //req.session.userName = 'Anonymous';
  //var colorScheme = req.session.colorScheme || 'dark'; 
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
  res.render("newsletter", {csrf: "CSRF token goes here"});
});

app.post("/newsletter", function(req, res) {
  var name = req.body.name || "";
  var email = req.body.email || "";
  if (!validator.isEmail(email)) {
  //if (!email.match(VALID_EMAIL_REGEX)) {
    if (req.xhr) return res.json({error: "Ivalid name email address"});
    req.session.flash = {
      type: "danger",
      intro: "Validation error!",
      message: "The email address you entered has not valid."
    };
    return res.redirect(303, "/newsletter/archive");
  };
  // function NewsletterSignup(name, email) {
  //   this.name = name;
  //   this.email = email;
  // };
  /*var nls = */new NewsletterSignup({name: name, email: email}).save(function(err) {
    if (err) {
      if (req.xhr) return res.json({error: "Database error."});
      req.session.flash = {
        type: "danger",
        intro: "Database error!",
        message: "There was a database error; Please try again later."
      };
      return res.redirect(303, "/newsletter/archive");
    }
    if (req.xhr) return res.json({success: true});
    req.session.flash = {
      type: "success",
      intro: "Thank you!",
      message: "You have now been signed up for the newsletter."
    };
    return res.redirect(303, "/newsletter/archive");
  });
});

app.get("/newsletter/archive", function(req, res) {
  res.render("newsletter-archive");
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

// make sure data directory exists
var dataDir = __dirname + "/data";
var vacationPhotoDir = dataDir + "/vacation-photo";
fs.existsSync(dataDir) || fs.mkdirSync(dataDir);
fs.existsSync(vacationPhotoDir) || fs.mkdirSync(vacationPhotoDir);

function saveContestEntry(contestName, email, year, month, photoPath) {
  // TODO...this will come later
}

app.post("/contest/vacation-photo/:year/:month", function(req, res) {
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files) {
    if (err) return res.redirect(303, "/error");
    // console.log("recieved fields:");
    // console.log(fields);
    // console.log("recieved files:");
    // console.log(files);
    // res.redirect(303, "/thank-you");
    if (err) {
      res.session.flash = {
        type: "danger",
        intro: "Oops!",
        mesage: "There was an error processing your submission. Please try again."
      };
      res.redirect(303, "/contest/vacation-photo");
    }
    var photo = files.photo;
    var dir = vacationPhotoDir + "/" + Date.now();
    var path = dir + "/" + photo.name;
    fs.mkdirSync(dir);
    fs.renameSync(photo.path, dir + '/' + photo.name);
    saveContestEntry('vacation-photo', fields.email, req.params.year, req.params.month, path);
    req.session.flash = {
      type: "success",
      intro: "Good luck!",
      message: 'You have been entered into the contest.',
    };
    return res.redirect(303, '/contest/vacation-photo/entries');
  });
});

app.get("/contest/vacation-photo/entries", function(req, res) {
  res.render("contest/entries");
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