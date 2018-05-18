var mongoose = require("mongoose");
var LeadSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  }
})

var Lead = mongoose.model("Lead", LeadSchema);
module.exports = Lead;
