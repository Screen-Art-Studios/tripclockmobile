var express = require("express");
var mongodb = require("mongodb");
var _ = require("lodash");
var bodyParser = require("body-parser");
var passport = require("passport");
var passportJWT = require("passport-jwt");
var jwt = require('jsonwebtoken');
var nodemailer = require('nodemailer');
var app = express();
var router = express.Router();
var mongoose = require("mongoose");
var User = mongoose.model("User");
var bcrypt = require('bcryptjs');
var stripe = require("stripe")("");
var ExtractJwt = passportJWT.ExtractJwt;
var JwtStrategy = passportJWT.Strategy;
var transporter = nodemailer.createTransport({
      host: 'smtp.office365.com', // Office 365 server
      port: 587,     // secure SMTP
      ignoreTLS: false,
      requireTLS: true,
      auth: {
          user: 'royce@thumbnailconsulting.com',
          pass: ''
      },
      tls: {
          ciphers: 'SSLv3'
      }
  });

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

router.post("/login", (req, res) => {
  User.findOne({"email": req.body.email}, function (err, users) {
    if (err) throw err;
    if (users !== null) {
      bcrypt.compare(req.body.password, users.password, function(err, isMatch) {
        if (err) return (err);
        if (isMatch === true) {
          var payload = {"id": users.id};
          var token = jwt.sign(payload, jwtOptions.secretOrKey);
          res.json({userId: users.id, token: token, companyId: users.companyId, admin: users.admin});
        } else {
          res.status(401).send(false);
        }
      })
    } else {
      res.status(401).send(false);
    }
  })
})

router.post("/", (req,res) => {
  if (req.body.payment === true) {
    let customer = stripe.customers.create({
      email: req.body.email,
      source: req.body.stripeSource,
    }, function(err, customer) {
      if (err) {
        console.log(err)
      }
      let StripeCustomer = customer.id
      const subscription = stripe.subscriptions.create({
        customer: StripeCustomer,
        items: [{plan: 'plan_Chp8vqhbDhX0AO'}],
      }).then(response => {
        var subscriptionId = response.id;
        createNewUser(StripeCustomer, subscriptionId);
      });

    });
  } else {
    User.findOne({"companyId": req.body.companyId, "payment": true}, function (err, users) {
      const subscription = stripe.subscriptions.create({
        customer: users.stripeCustomer,
        items: [{plan: 'plan_Ck0QWtUB1LiEvf'}],
      })
      .then(response => {
        var subscriptionId = response.id;
        let StripeCustomer = users.stripeCustomer;
        createNewUser(StripeCustomer, subscriptionId);
      })
      .catch(err => {
        console.log(err)
      });
    })
  }

  function createNewUser (StripeCustomer, subscriptionId) {
    var newUser = new User({
    email: req.body.email,
    password: req.body.password,
    name: req.body.name,
    companyId: req.body.companyId,
    admin: req.body.admin,
    payment: req.body.payment,
    stripeSource: req.body.stripeSource,
    stripeCustomer: StripeCustomer,
    stripeSubscription: subscriptionId
    })

    newUser.save((err, result) => {
      if(err) {
        console.log(err);
        res.send(err);
      } else {
        User.findOne({"email": req.body.email}, function (err, users) {
          var payload = {"id": users.id};
          var token = jwt.sign(payload, jwtOptions.secretOrKey);
          if (req.body.emailUser === true) {
            var mailOptions = {
                from: `Trip Clock Mobile <royce@thumbnailconsulting.com>`, // sender address
                to: req.body.email, // list of recipients
                subject: 'Trip Clock Mobile Credentials', // Subject line
                text: `Welcome to Trip Clock Mobile ${req.body.name},
                Your login credentials are as follows;
                Email: ${req.body.email}
                Password: ${req.body.password}`, // plaintext body
                html: `<h2>Welcome to Trip Clock Mobile ${req.body.name}</h2>
                <p>
                  Your login credentials are as follows;
                  Email: ${req.body.email}
                  Password: ${req.body.password}
                </p>` // html body
            };
            transporter.sendMail(mailOptions, function(error, info){
                if(error){
                    return console.log(error);
                    res.send(error);
                }
                console.log('sent')
            });
          }
          res.status(201).json({userId: users.id, token: token, companyId: users.companyId, admin: users.admin});
        })
      }
    })
  }
})

router.post("/trip/:id", passport.authenticate('jwt', { session: false }), (req,res) => {
  var userid = new mongodb.ObjectID(req.params["id"]);
  User.find({"_id": userid},function (err, user) {
    if (err) {
        res.status(500).send(err);
    } else {
        var user = user[0];
        user.tempTrip = req.body.tempTrip || user.tempTrip;
        user.tripStarted = req.body.tripStarted || user.tripStarted;

        user.save(function (err, user) {
            if (err) {
              res.status(500).send(err)
            }
            res.send(user);
        });
      }
  });
})

router.post("/tripclear/:id", passport.authenticate('jwt', { session: false }), (req,res) => {
  var userid = new mongodb.ObjectID(req.params["id"]);
  User.find({"_id": userid},function (err, user) {
    if (err) {
      console.log(err);
      res.status(500).send(err);
    } else {
        var user = user[0];
        user.tempTrip = {
          latitude: '',
          longitude: '',
          month: 0,
          day: 0,
          hour: 0,
          minute: 0,
          second: 0,
        };
        user.tripStarted = false;

        user.save(function (err, user) {
            if (err) {
              console.log(err);
              res.status(500).send(err)
            }
            res.send(user);
        });
      }
  });
})

router.put("/tripclear/:id", passport.authenticate('jwt', { session: false }), (req,res) => {
  var userid = new mongodb.ObjectID(req.params["id"]);
  User.find({"_id": userid},function (err, user) {
    if (err) {
      console.log(err);
      res.status(500).send(err);
    } else {
        var user = user[0];
        user.tempTrip = {
          latitude: '',
          longitude: '',
          month: 0,
          day: 0,
          hour: 0,
          minute: 0,
          second: 0,
        };
        user.tripStarted = false;
        user.stripeSubscription = req.body.stripeSubscription || user.stripeSubscription;

        user.save(function (err, user) {
            if (err) {
              console.log(err);
              res.status(500).send(err)
            }
            res.send(user);
        });
      }
  });
})

router.get("/all/:companyId", passport.authenticate('jwt', { session: false }),(req, res) => {
  var companyId = req.params["companyId"];
  User.find({"companyId": companyId},function (err, users) {
    if (err) {
      res.send(err);
    } else {
      res.send(users);
    }
  })
})

router.get("/:id", passport.authenticate('jwt', { session: false }),(req, res) => {
  var userid = new mongodb.ObjectID(req.params["id"]);
  User.findOne({"_id": userid},function (err, users) {
    if (err) {
      res.send(err);
    } else {
      res.send(users);
    }
  })
})

router.put("/:id", passport.authenticate('jwt', { session: false }), (req, res) => {
  var userid = new mongodb.ObjectID(req.params["id"]);
  User.find({"_id": userid},function (err, user) {
    if (err) {
        res.status(500).send(err);
    } else {
        var user = user[0];
        user.email = req.body.email || user.email;
        user.password = req.body.password || user.password;
        user.name = req.body.name || user.name;
        user.companyId = req.body.companyId || user.companyId;
        user.lastClockType = req.body.lastClockType || user.lastClockType;
        user.admin = req.body.admin || user.admin;
        user.payment = req.body.payment || user.payment;
        user.stripeSource = req.body.stripeSource || user.stripeSource;
        user.stripeCustomer = req.body.stripeCustomer || user.stripeCustomer;
        user.stripeSubscription = req.body.stripeSubscription || user.stripeSubscription;

        user.save(function (err, user) {
            if (err) {
              console.log(err)
              res.status(500).send(err)
            }
            res.send(user);
        });
      }
  });
})

router.delete("/:id", passport.authenticate('jwt', { session: false }), (req, res) => {
  var userid = new mongodb.ObjectID(req.params["id"]);
  User
  .find({_id: userid},function (err, user) {
    stripe.subscriptions.del(user[0].stripeSubscription)
    .catch(err => {
      console.log(err);
    });
  })
  .then(() => {
    User.find({_id: userid}).remove().then(() => {
      res.send("success");
    })
  })
})

module.exports = router;
