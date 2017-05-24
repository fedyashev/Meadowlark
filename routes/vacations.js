// import models
//var Vacation = require("../models/vacation.js");
//var VacationInSeasonListener = require("../models/vacationInSeasonListener.js");

module.exports = (models) => {
  return {

    vacations : (req, res) => {
      models.Vacation.find({available: true}, function(err, vacations) {
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
    },

    notifyMeWhenInSeasonFormViewer : (req, res) => {
      res.render("notify-me-when-in-season", {sku: req.query.sku});
    },

    notifyMeWhenInSeasonFormHandler : (req, res) => {
      models.VacationInSeasonListener.update(
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
    },

  };
};

{



};