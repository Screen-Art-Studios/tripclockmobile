var express = require("express");
var mongodb = require("mongodb");
var _ = require("lodash");
var bodyParser = require("body-parser");
var passport = require("passport");
var passportJWT = require("passport-jwt");
var jwt = require('jsonwebtoken');
var app = express();
var router = express.Router();
var mongoose = require("mongoose");
var Clock = mongoose.model("Clock");
var bcrypt = require('bcryptjs');
var ExtractJwt = passportJWT.ExtractJwt;
var JwtStrategy = passportJWT.Strategy;

var jwtOptions = {}
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme("JWT");
jwtOptions.secretOrKey = 'LokisBreath-420';

var strategy = new JwtStrategy(jwtOptions, function(jwt_payload, next) {
  User.findOne({"_id": jwt_payload.id}, function(err, user) {
    if (err) {
          return next(err, false);
      }
      if (user) {
          return next(null, user);
      } else {
          return next(null, false);
      }
  });
});

app.use(passport.initialize());
passport.use(strategy);
app.use(bodyParser.json());

router.post("/", (req,res) => {
  var newClock = new Clock({
    userId: req.body.userId,
    clockType: req.body.clockType,
    month: req.body.month,
    day: req.body.day,
    hours: req.body.hours,
    minutes: req.body.minutes,
    seconds: req.body.seconds,
    latitude: req.body.latitude,
    longitude: req.body.longitude,
    altitude: req.body.altitude
  })

  newClock.save((err, result) => {
    if(err) {
      res.send(err);
    } else {
      res.status(201).send(result);
    }
  });
})

router.get("/:userId", passport.authenticate('jwt', { session: false }),(req, res) => {
  var userId = req.params["userId"];
  Clock.find({"userId": {$regex: '^' + userId}},function (err, clocks) {
    if (err) {
      res.send(err);
    } else {
      res.send(clocks);
    }
  })
})

module.exports = router;
