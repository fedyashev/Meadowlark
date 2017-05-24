// // Import npm modules
// var formidable = require("formidable");
// var validator = require("validator");

// // Import node modules
// var fs = require("fs");

// // Import project modules
// var fortune = require("../lib/fortune.js");

// Import modules
var libs = {
  formidable : require("formidable"),
  validator : require("validator"),
  fortune : require("../lib/fortune.js"),
};

// Import models
var models = {
  Vacation: require("../models/vacation.js"),
  VacationInSeasonListener: require("../models/vacationInSeasonListener.js"),
};

// Router handlers
var main = require("./main.js")(libs);
var newsletter = require("./newsletter.js")(libs);
var tours = require("./tours.js");
var contest = require("./contest.js")(libs);
var vacations = require("./vacations.js")(models);

// Router
module.exports = function(app) {

  app.get("/", main.home);
  app.get("/about", main.about);
  app.get("/header", main.header);
  app.get("/jquery-test", main.jqueryTest);
  app.get("/nursery-rhyme", main.nurseryRhyme);
  app.get("/data/nursery-rhyme", main.nurseryRhymeData);

  app.get("/newsletter", newsletter.formViewer);
  app.post("/newsletter", newsletter.formHandler);
  app.get("/newsletter/archive", newsletter.archive);

  app.post("/process", main.process);
  app.get("/thank-you", main.thankYou);

  app.get("/tours/hood-river", tours.hoodRiver);
  app.get("/tours/oregon-coast", tours.oregonCoast);
  app.get("/tours/request-group-rate", tours.requestGroupRate);

  app.get("/contest/vacation-photo", contest.vacationPhoto);
  app.post("/contest/vacation-photo/:year/:month", contest.vacationPhotoYearMonth);
  app.get("/contest/vacation-photo/entries", contest.vacationPhotoEntries);

  app.get("/error", main.error);

  app.get("/vacations", vacations.vacations);
  app.get("/notify-me-when-in-season", vacations.notifyMeWhenInSeasonFormViewer);
  app.post("/notify-me-when-in-season", vacations.notifyMeWhenInSeasonFormHandler);

  app.use(main.httpStatus404);
  app.use(main.httpStatus500);
};