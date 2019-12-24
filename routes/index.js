const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../config/auth");

const index = express();
index.use(express.static("images"));

//Event model
const Event = require("../models/Event");

//welcome page
router.get("/", (req, res) => res.render("welcome"));

//events page
router.get("/events", (req, res) =>
  Event.find()
    .then(events => {
      res.render("events", { events: events });
    })
    .catch(err => console.log(err))
);
// console.log(name)
module.exports = router;
