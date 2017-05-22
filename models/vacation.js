var mongoose = require("mongoose");

var vacationSchema = mongoose.Schema({
  // TODO
});

vacationSchema.methods.getDisplayPrice = function() {
  return "$" + (this.priceInCents / 100).toFixed(2);
};

var Vacation = mongoose.model("Vacation", vacationSchema);

module.exports = Vacation;