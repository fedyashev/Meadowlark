var formidable = require("formidable");
var validator = require("validator");
var fs = require("fs");

var main = require("./handlers/main.js");

module.exports = function(app) {

  app.get("/", main.home);
  app.get("/about", main.about);
  app.get("/header", main.header);
  app.get("/jquery-test", main.jqueryTest);
  app.get("/nursery-rhyme", main.nurseryRhyme);
  app.get("/data/nursery-rhyme", main.nurseryRhymeData);
  app.get("/newsletter", main.newsletterFormViewer);
  app.post("/newsletter", main.newsletterFormHandler);

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

  app.get("/vacations", function(req, res) {
    Vacation.find({available: true}, function(err, vacations) {
      var context = {
        vacations: vacations.map(function(vacation) {
          return {
            sku: vacation.sku,
            name: vacation.name,
            description: vacation.description,
            price: vacation.getDisplayPrice(),
            inSeason: vacation.inSeason,
          };
        }),
      };
      res.render("vacations", context);
    });
  });

  app.get("/notify-me-when-in-season", function(req, res) {
    res.render("notify-me-when-in-season", {sku: req.query.sku});
  });

  app.post("/notify-me-when-in-season", function(req, res) {
    VacationInSeasonListener.update(
      {email: req.body.email},
      {$push: {skus: req.body.sku}},
      {upsert: true},
      function(err) {
        if (err) {
          req.session.flash = {
            type: "danger",
            intro: "Ooops!",
            message: "There was an error processing your request.",
          };
          return res.redirect(303, "/vacations");
        }
        req.session.flash = {
          type: "success",
          intro: "Thank you!",
          message: "You will be notified when this vacation is in season."
        };
        return res.redirect(303, "/vacations");
      }
    );
  });
};