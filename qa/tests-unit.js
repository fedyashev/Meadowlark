var fortune = require("../lib/fortune.js");
var expect = require("chai").expect;

suite("Fortune cookies tests", function() {

  test("'getFortune()' should retrurn a fortune", function() {
    expect(typeof fortune.getFortune() === "string");
  });

});