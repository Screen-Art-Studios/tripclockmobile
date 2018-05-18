var express = require("express");
var mongodb = require("mongodb");
var _ = require("lodash");
var bodyParser = require("body-parser");
var app = express();
var router = express.Router();
var mongoose = require("mongoose");
var Company = mongoose.model("Company");

app.use(bodyParser.json());

router.post("/", (req,res) => {
  var newCompany = new Company({
    companyId: req.body.companyId,
    companyName: req.body.companyName,
    licenseType: req.body.licenseType
  })

  newCompany.save((err, result) => {
    if(err) {
      res.send(err);
    } else {
      res.send(result);
    }
  });
})

router.get("/:companyId",(req, res) => {
  var companyId = req.params["companyId"];
  Company.find({"companyId": {$regex: '^' + companyId}},function (err, companys) {
    if (err) {
      res.send(err);
    } else {
      res.send(companys);
    }
  })
})

module.exports = router;
