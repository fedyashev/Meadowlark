module.exports = (lib) => { 
  return {

    home : (req, res) => {
      res.render("home");  
    },

    about : (req, res) => {
      res.render("about", {
        fortune: lib.fortune.getFortune(),
        pageTestScript: "/qa/tests-about.js",
      });
    },

    header : (req, res) => {
      res.set("Content-Type", "text/plain");
      var s = "";
      for (var name in req.headers) {
        s += name + ": " + req.headers[name] + "\n";
      }
      res.send(s);
    },

    jqueryTest : (req, res) => {
      res.render("jquery-test");
    },

    nurseryRhyme : (req, res) => {
      res.render("nursery-rhyme");
    },

    nurseryRhymeData : (req, res) => {
      res.json({
        animal: "squirel",
        bodyPart: "tail",
        adjective: "bushy",
        noun: "neck"
      });
    },

    process : (req, res) => {
      if (req.xhr || req.accepts("json,html")==="json") {
        res.send({success: "true"});
      } else {
        res.redirect(303, "/thank-you");
      }
    },

    thankYou : (req, res) => {
      res.render("thank-you");
    },

    error : (req, res) => {
      res.render("error");
    },

    httpStatus404 : (req, res, next) => {
      res.status(404);
      res.render("404");
    },

    httpStatus500: (err, req, res, next) => {
      console.error(err.stack);
      res.status(500);
      res.render("500");
    },
  };
};





