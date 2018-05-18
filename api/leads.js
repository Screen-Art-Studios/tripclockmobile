var express = require("express");
var mongodb = require("mongodb");
var _ = require("lodash");
var bodyParser = require("body-parser");
var app = express();
var router = express.Router();
var passport = require("passport");
var passportJWT = require("passport-jwt");
var jwt = require('jsonwebtoken');
var mongoose = require("mongoose");
var Lead = mongoose.model("Lead");
var User = mongoose.model("User");
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
  var newLead = new Lead({
    email: req.body.email
  })

  newLead.save((err, result) => {
    if(err) {
      res.send(err);
    } else {
      res.send(result);
    }
  });
})

router.get("/:leadId", passport.authenticate('jwt', { session: false }), (req, res) => {
  var leadId = req.params["leadId"];
  Lead.find({"leadId": {$regex: '^' + leadId}},function (err, leads) {
    if (err) {
      res.send(err);
    } else {
      res.send(leads);
    }
  })
})

router.delete("/:id", passport.authenticate('jwt', { session: false }), (req, res) => {
  var leadid = new mongodb.ObjectID(req.params["id"]);
  Lead.find({_id: leadid}).remove().then(() => {
    res.send("success");
  })
})

module.exports = router;
