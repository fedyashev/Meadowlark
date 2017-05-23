var formidable = require("formidable");
var validator = require("validator");

var fortune = require("../lib/fortune.js");

exports.home = function(req, res) {
  res.render("home");
};

exports.about = function(req, res) {
  res.render("about", {
    fortune: fortune.getFortune(),
    pageTestScript: "/qa/tests-about.js",
  });
};

exports.header = function(req, res) {
  res.set("Content-Type", "text/plain");
  var s = "";
  for (var name in req.headers) {
    s += name + ": " + req.headers[name] + "\n";
  }
  res.send(s);
};

exports.jqueryTest = function(req, res) {
  res.render("jquery-test");
};

exports.nurseryRhyme = function(req, res) {
  res.render("nursery-rhyme");
};

exports.nurseryRhymeData = function(req, res) {
  res.json({
    animal: "squirel",
    bodyPart: "tail",
    adjective: "bushy",
    noun: "neck"
  });
};

exports.newsletterFormViewer = function(req, res) {
  res.render("newsletter", {csrf: "CSRF token goes here"});
};

exports.newsletterFormHandler = function(req, res) {
  var name = req.body.name || "";
  var email = req.body.email || "";
  if (!validator.isEmail(email)) {
    if (req.xhr) return res.json({error: "Ivalid name email address"});
    req.session.flash = {
      type: "danger",
      intro: "Validation error!",
      message: "The email address you entered has not valid."
    };
    return res.redirect(303, "/newsletter/archive");
  };
  new NewsletterSignup({name: name, email: email}).save(function(err) {
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
};