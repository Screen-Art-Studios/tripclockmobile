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
var Trip = mongoose.model("Trip");
var User = mongoose.model("User");
var bcrypt = require('bcryptjs');
var ExtractJwt = passportJWT.ExtractJwt;
var JwtStrategy = passportJWT.Strategy;
var csv_export=require('csv-export');
var fs = require('fs');

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
  console.log(req.body.start.second)
  var newTrip = new Trip({
    userId: req.body.userId,
    year: req.body.year,
    start: {
      latitude: req.body.start.latitude,
      longitude: req.body.start.longitude,
      month: req.body.start.month,
      day: req.body.start.day,
      hour: req.body.start.hour,
      minute: req.body.start.minute,
      second: req.body.start.second
    },
    end: {
      latitude: req.body.end.latitude,
      longitude: req.body.end.longitude,
      month: req.body.end.month,
      day: req.body.end.day,
      hour: req.body.end.hour,
      minute: req.body.end.minute,
      second: req.body.end.second
    },
    distance: req.body.distance
  })

  newTrip.save((err, result) => {
    if(err) {
      res.send(err);
    } else {
      res.send(result);
    }
  });
})

router.get("/:userId", passport.authenticate('jwt', { session: false }),(req, res) => {
  var userId = req.params["userId"];
  Trip.find({"userId": {$regex: '^' + userId}},function (err, trips) {
    if (err) {
      res.send(err);
    } else {
      res.send(trips);
    }
  })
})

router.get("/:userId/:filterParam", passport.authenticate('jwt', { session: false }),(req, res) => {
  var userId = req.params["userId"];
  var filterParam = req.params["filterParam"];
  var today = new Date().getDate()
  var thisMonth = new Date().getMonth();
  var thisYear = new Date().getFullYear();
  var tripArray = [];
  if (filterParam === 'days') {
    Trip.find({"userId": {$regex: '^' + userId}},function (err, trips) {
      if (err) {
        res.send(err);
      } else {
        let i = 0;
        for (i=0; i < trips.length; i++) {
          if (trips[i].start.day === today && trips[i].start.month === thisMonth && trips[i].year === thisYear) {
            tripArray.push(trips[i]);
          }
        }
        res.send(tripArray);
      }
    })
  } else if (filterParam === 'week') {
    Trip.find({"userId": {$regex: '^' + userId}},function (err, trips) {
      if (err) {
        res.send(err);
      } else {
        let i = 0;
        for (i=0; i < trips.length; i++) {
          if (trips[i].start.day >= (today - 6) && trips[i].start.day <= (today) && trips[i].start.month === thisMonth && trips[i].year === thisYear) {
            tripArray.push(trips[i]);
          }
        }
        res.send(tripArray);
      }
    })
  } else if (filterParam === 'month') {
    Trip.find({"userId": {$regex: '^' + userId}},function (err, trips) {
      if (err) {
        res.send(err);
      } else {
        let i = 0;
        for (i=0; i < trips.length; i++) {
          if (trips[i].start.month === thisMonth && trips[i].year === thisYear) {
            tripArray.push(trips[i]);
          }
        }
        res.send(tripArray);
      }
    })
  } else if (filterParam === 'year') {
    Trip.find({"userId": {$regex: '^' + userId}},function (err, trips) {
      if (err) {
        res.send(err);
      } else {
        let i = 0;
        for (i=0; i < trips.length; i++) {
          if (trips[i].year === thisYear) {
            tripArray.push(trips[i]);
          }
        }
        res.send(tripArray);
      }
    })
  } else {
    Trip.find({"userId": {$regex: '^' + userId}},function (err, trips) {
      if (err) {
        res.send(err);
      } else {
        res.send(trips);
      }
    })
  }
})

router.get("/trips/:companyId", passport.authenticate('jwt', { session: false }),(req, res) => {
  var companyId = req.params["companyId"];
  User.find({"companyId": {$regex: '^' + companyId}},function (err, users) {
    if (err) {
      console.log(err);
      res.send(err);
    }
    else {
      console.log(users);
      let i = 0
      let totalTrips = []
      for (i=0; i < users.length; i++) {
        var userId = users[i]._id;
        Trip.find({"userId": {$regex: '^' + userId}},function (err, trips) {
          if (err) {
            res.send(err);
          }
          else {
            let j = 0
            for (j=0; j < trips.length; j++) {
              totalTrips.push(trips[j]);
            }
          }
        });
      }
      console.log(totalTrips);
      csv_export.export(totalTrips,function(buffer){
        let file = fs.writeFileSync('./data.zip',buffer);
        res.sendFile('/var/www/API/data.zip');
      })
    }
  })
})

module.exports = router;
