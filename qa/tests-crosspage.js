var Browser = require("zombie");
var assert = require("chai").assert;

var browser;

suite("Cross-Page Tests", function() {

  setup(function() {
    browser = new Browser();
  });

  test("test1", function(done) {
    var referrer = "http://localhost:3000/tours/hood-river";
    browser.visit(referrer, function() {
      browser.clickLink(".requestGroupRate", function() {
        assert(browser.field("referrer").value === referrer);
        done();
      });
    });
  });

});