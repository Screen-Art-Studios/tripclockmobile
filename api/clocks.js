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
    year: req.body.year,
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

router.get("/:userId/:filterParam", passport.authenticate('jwt', { session: false }),(req, res) => {
  var userId = req.params["userId"];
  var filterParam = req.params["filterParam"];
  var today = new Date().getDate()
  var thisMonth = new Date().getMonth();
  var thisYear = new Date().getFullYear();
  var clockArray = [];
  if (filterParam === 'days') {
    Clock.find({"userId": {$regex: '^' + userId}},function (err, clocks) {
      if (err) {
        res.send(err);
      } else {
        let i = 0;
        for (i=0; i < clocks.length; i++) {
          if (clocks[i].day === today && clocks[i].month === thisMonth && clocks[i].year === thisYear) {
            clockArray.push(clocks[i]);
          }
        }
        res.send(clockArray);
      }
    })
  } else if (filterParam === 'week') {
    Clock.find({"userId": {$regex: '^' + userId}},function (err, clocks) {
      if (err) {
        res.send(err);
      } else {
        let i = 0;
        for (i=0; i < clocks.length; i++) {
          if (clocks[i].day >= (today - 6) && clocks[i].day <= (today) && clocks[i].month === thisMonth && clocks[i].year === thisYear) {
            clockArray.push(clocks[i]);
          }
        }
        res.send(clockArray);
      }
    })
  } else if (filterParam === 'month') {
    Clock.find({"userId": {$regex: '^' + userId}},function (err, clocks) {
      if (err) {
        res.send(err);
      } else {
        let i = 0;
        for (i=0; i < clocks.length; i++) {
          if (clocks[i].month === thisMonth && clocks[i].year === thisYear) {
            clockArray.push(clocks[i]);
          }
        }
        res.send(clockArray);
      }
    })
  } else if (filterParam === 'year') {
    Clock.find({"userId": {$regex: '^' + userId}},function (err, clocks) {
      if (err) {
        res.send(err);
      } else {
        let i = 0;
        for (i=0; i < clocks.length; i++) {
          if (clocks[i].year === thisYear) {
            clockArray.push(clocks[i]);
          }
        }
        res.send(clockArray);
      }
    })
  } else {
    Clock.find({"userId": {$regex: '^' + userId}},function (err, clocks) {
      if (err) {
        res.send(err);
      } else {
        res.send(clocks);
      }
    })
  }
})

module.exports = router;
