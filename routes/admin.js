const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
const { ensureAuthenticated } = require("../config/auth");
const url = require("url");

const user = express();
user.use(express.static("../images"));

//User model
const User = require("../models/User");

//Admin Model
const Admin = require("../models/Admin");

router.post("/deleteuser", (req, res) => {
  console.log("LOL"+req.params);

  res.render("admindashboard");
});

module.exports = router;
