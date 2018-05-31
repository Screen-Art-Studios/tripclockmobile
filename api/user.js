var mongoose = require("mongoose");
var bcrypt = require('bcryptjs');
var SALT_WORK_FACTOR = 10;

var UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  companyId: {
    type: String,
    required: true
  },
  lastClockType: {
    type: String,
    required: false,
    default: 'out'
  },
  admin: {
    type: Boolean,
    required: false,
    default: false
  },
  payment: {
    type: Boolean,
    required: false,
    default: false
  },
  stripeSource: {
    type: String,
    required: false
  },
  stripeCustomer: {
    type: String,
    required: true
  },
  stripeSubscription: {
    type: String,
    required: true
  },
  tempTrip: {
    latitude: {
      type: String,
      required: false
    },
    longitude: {
      type: String,
      required: false
    },
    month: {
      type: Number,
      required: false
    },
    day: {
      type: Number,
      required: false
    },
    hour: {
      type: Number,
      required: false
    },
    minute: {
      type: Number,
      required: false
    },
    second: {
      type: Number,
      required: false
    }
  },
  tripStarted: {
    type: Boolean,
    required: false
  }
})

UserSchema.pre('save', function(next) {
    var users = this;

    // only hash the password if it has been modified (or is new)
    if (!users.isModified('password')) return next();

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);

        // hash the password along with our new salt
        bcrypt.hash(users.password, salt, function(err, hash) {
            if (err) return next(err);

            // override the cleartext password with the hashed one
            users.password = hash;
            next();
        });
    });
});

var User = mongoose.model("User", UserSchema);

module.exports = User;
