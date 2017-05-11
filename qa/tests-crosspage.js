var Browser = require("zombie");
var assert = require("chai").assert;

var browser;

suite("Cross-Page Tests", function() {

  setup(function() {
    browser = new Browser();
  });

  test("requesting a group rate quote from the hood river tour page should populate the referrer field", function(done) {
    var referrer = 'http://192.168.100.5:3000/tours/hood-river';
    try {
      browser.visit(referrer, function() {
        browser.clickLink('.requestGroupRate', function() {
          setTimeout(function() {
            assert(browser.field('referrer').value === referrer);  
          }, 1000);
          done();
        });
      });
    } catch(e) {
      done(e);
    }
  });

  test("requesting a group rate quote from the oregon coast tour page should populate the referrer field", function(done) {
    var referrer = 'http://localhost:3000/tours/oregon-coast';
    try {
      browser.visit(referrer, function() {
        browser.clickLink('.requestGroupRate', function() {
          setTimeout(function() {
            assert(browser.field('referrer').value === referrer);  
          }, 1000);
          done();
        });
      });
    } catch(e) {
      done(e);
    }
  });  

  test("visiting the 'request group rate' page dirctly should result in an empty referrer field", function(done) {
    var referrer = "http://localhost:3000/tours/request-group-rate";
    try {
      browser.visit(referrer, function() {
        //setTimeout(function() {
          assert(browser.field('referrer').value === "");  
        //}, 1000);
        done();
      });
    } catch(e) {
      done(e);
    }
  });

  // test("test visit about page", function(done) {
  //   var referrer = "http://localhost:3000/about";
  //   browser.visit(referrer, function() {
  //     //assert(browser.field("referrer").value === '');
  //     done();
  //   });
  // });

  // test("test visit foo page", function(done) {
  //   var referrer = "http://localhost:3000/foo";
  //   browser.visit(referrer, function() {
  //     done();
  //   });
  // });

});