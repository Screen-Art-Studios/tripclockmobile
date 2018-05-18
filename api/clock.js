var mongoose = require("mongoose");
var ClockSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  clockType: {
    type: String,
    required: true
  },
  month: {
    type: Number,
    required: true
  },
  day: {
    type: Number,
    required: true
  },
  hours: {
    type: Number,
    required: true
  },
  minutes: {
    type: Number,
    required: true
  },
  seconds: {
    type: Number,
    required: true
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  altitude: {
    type: Number,
    required: false
  }
})

var Clock = mongoose.model("Clock", ClockSchema);
module.exports = Clock;
