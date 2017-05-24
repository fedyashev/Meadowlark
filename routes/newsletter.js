module.exports = (lib) => {
  return {
  
    formViewer: (req, res) => {
      res.render("newsletter", {csrf: "CSRF token goes here"});  
    },  // formViewer

    formHandler: (req, res) => {
      var name = req.body.name || "";
      var email = req.body.email || "";
      if (!lib.validator.isEmail(email)) {
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
    },  // formHandler

    archive: (req, res) => {
      res.render("newsletter-archive");
    },  // archive

  };
};
{
  
  

};