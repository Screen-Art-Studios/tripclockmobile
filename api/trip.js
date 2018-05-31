var mongoose = require("mongoose");
var TripSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  year: {
    type: Number
  },
  start: {
    latitude: {
      type: String,
      required: true
    },
    longitude: {
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
    hour: {
      type: Number,
      required: true
    },
    minute: {
      type: Number,
      required: true
    },
    second: {
      type: Number,
      required: true
    }
  },
  end: {
    latitude: {
      type: String,
      required: true
    },
    longitude: {
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
    hour: {
      type: Number,
      required: true
    },
    minute: {
      type: Number,
      required: true
    },
    second: {
      type: Number,
      required: true
    }
  },
  distance: {
    type: Number,
    required: true
  }
})

var Trip = mongoose.model("Trip", TripSchema);
module.exports = Trip;
