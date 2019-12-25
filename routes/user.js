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
//Event model
const Event = require("../models/Event");
//Reservation model
const Reservation = require("../models/Reservation");
//Admin Model
const Hall = require("../models/Hall");

//Home page
router.get("/", (req, res) => res.render("welcome"));

//login page
router.get("/login", (req, res) => res.render("login"));

//resister page
router.get("/register", (req, res) => res.render("register"));

//dashboard page
router.get("/dashboard", ensureAuthenticated, (req, res) =>
  res.render("dashboard", {
    user: req.user
  })
);

//Cancel Reservation
router.get("/deletereservation/:id", ensureAuthenticated, (req, res) => {
  const id = req.params.id;
  let errors = [];
  Reservation.findById(id).then(reservation => {
    nows = Date.now();
    diff = nows - reservation.event_date.getTime();
    diffDays = diff / (1000 * 60 * 60 * 24);

    //console.log("digh", diffDays);
    if (diffDays > 3) {
      Reservation.findOneAndDelete({ _id: id }, (err, result) => {
        if (err) {
          errors.push({ msg: "Something went wrong, Try Again!" });
          res.redirect("/user/dashboard", { errors });
        } else {
          req.flash("success_msg", "Deleted reservation!");
          console.log("id:", id);
          res.redirect("/user/dashboard");
        }
      });
    } else {
      req.flash(
        "error_msg",
        "you can't cancel an event that happens in less than 3 days"
      );
      res.redirect("/user/dashboard");
    }
  });
});

//Delete user handle
router.get("/deleteuser/:id", ensureAuthenticated, (req, res) => {
  const id = req.params.id;
  let errors = [];
  User.findOneAndDelete({ _id: id }, (err, result) => {
    if (err) {
      errors.push({ msg: "Something went wrong, Try Again!" });
      res.redirect("/user/admindashboard", { errors });
    } else {
      req.flash("success_msg", "Deleted User!");
      res.redirect("/user/admindashboard");
    }
  });
});

//edit user authority
router.post("/edituser/:id", ensureAuthenticated, (req, res) => {
  let errors = [];
  User.findById(req.params.id).then(user => {
    user.authorization = req.body.authority;
    //save the user
    user
      .save()
      .then(user => {
        req.flash("success_msg", "Changed Authority!");
        res.redirect("/user/admindashboard");
      })
      .catch(err => console.log(err));
  });
});

//user showevents page
router.get("/showevents", ensureAuthenticated, (req, res) =>
  Event.find()
    .then(events => {
      res.render("showevents", { events: events });
    })
    .catch(err => console.log(err))
);

//manager dashboard page
router.get("/managerdashboard", (req, res) => {
  Event.find()
    .then(events => {
      res.render("managerdashboard", { events: events });
    })
    .catch(err => console.log(err));
});

//admin dashboard page
router.get("/admindashboard", (req, res) => {
  let sentuser = [];
  User.find()
    .then(users => {
      for (let i = 0; i < users.length; i++) {
        if (users[i].username != req.user.username) sentuser.push(users[i]);
      }
      res.render("admindashboard", { users: sentuser });
    })
    .catch(err => console.log(err));
});

//Payment route
router.get(
  "/payment/:username/:event_name/:seats/:event_date",
  ensureAuthenticated,
  (req, res) => {
    let username = req.params.username;
    let event_name = req.params.event_name;
    let seats = req.params.seats;

    let event_date = req.params.event_date;

    res.render("payment", {
      username: username,
      event_name: event_name,
      seats: seats,
      event_date: event_date
    });
  }
);

router.post(
  "/payment/:username/:event_name/:seats/:event_date",
  ensureAuthenticated,
  (req, res) => {
    let username = req.params.username;
    let seats = req.params.seats;
    let event_name = req.params.event_name;
    let event_date = req.params.event_date;
    //console.log("new1", newRes1);
    //console.log(typeof newRes1);
    newRes = new Reservation({
      username,
      event_name,
      seats,
      event_date
    });
    //console.log("new", newRes);

    newRes
      .save()
      .then(book => {
        User.findOne({ username: username }).then(user => {
          if (user.authorization == "admin") {
            req.flash("success_msg", "Booked!");
            res.redirect("/user/admindashboard");
          } else if (user.authorization == "customer") {
            req.flash("success_msg", "Booked!");
            res.redirect("/user/dashboard");
          } else {
            req.flash("success_msg", "Booked!");
            res.redirect("/user/managerdashboard");
          }
        });
      })
      .catch(err => console.log(err));
  }
);
//reserve handle
router.post("/reserve/:eventName", ensureAuthenticated, (req, res) => {
  eventName = req.params.eventName;
  let seats = [];
  //let {booked, card, pin} = req.body;
  console.log(req.body);
  for (var key in req.body) {
    if (key != req.body.card) {
      console.log(key);
      seats.push(key);
    }
  }
  console.log(seats);

  event_name = eventName;
  Event.findOne({ event_name: eventName })
    .then(event => {
      event_date = event.date_time;
      username = req.user.username;
      const newRes = new Reservation({
        username,
        event_name,
        seats,
        event_date
      });
      console.log(newRes);
      req.flash("One Step Left!");
      return res.redirect(
        "/user/payment/" +
          username +
          "/" +
          event_name +
          "/" +
          seats +
          "/" +
          event_date
      );
    })
    .catch(err => console.log(err));
  let errors = [];
  time = Date.now();
});

//reservations page
router.get("/reservations", ensureAuthenticated, (req, res) => {
  Reservation.find({ username: req.user.username }).then(books => {
    console.log(books);
    res.render("reservation", { books: books });
  });
});
//reserve
router.get("/reserve/:eventId", ensureAuthenticated, (req, res) => {
  //console.log(req.user);
  eventId = req.params.eventId;
  Event.findById(eventId).then(event => {
    eventName = event.event_name;
    let occupiedSeats = [];
    Reservation.find({ event_name: eventName }).then(reservation => {
      for (let i = 0; i < reservation.length; i++) {
        for (let j = 0; j < reservation[i].seats.length; j++) {
          occupiedSeats.push(reservation[i].seats[j]);
        }
      }
      console.log("string", occupiedSeats);
    });
    //console.log(eventName);
    Hall.findOne({ hall_no: event.hall_num }).then(hall => {
      res.render("reserve", {
        hall: hall,
        eventName: eventName,
        occupiedSeats: occupiedSeats,
        user: req.user
      });
    });
  });
});

//edit profile page
router.get("/editprofile", ensureAuthenticated, (req, res) =>
  res.render("editprofile", {
    user: req.user
  })
);

//edit profile handle
router.post("/editprofile", ensureAuthenticated, (req, res) => {
  const {
    fname,
    lname,
    password,
    password2,
    birthday,
    gender,
    city,
    address
  } = req.body;
  let errors = [];
  console.log(req.body);
  //check required fields
  if (password && !password2) {
    errors.push({ msg: "Please confirm new password!" });
  }
  if (password && password2) {
    //checking if passwords match
    if (password != password2) {
      errors.push({ msg: "Passwords do not match!" });
    }
    //checking pasword length 8 min
    if (password.length < 8) {
      errors.push({ msg: "Password should be at least 6 character" });
    }
  }

  if (errors.length > 0) {
    res.render("editprofile", {
      errors,
      fname,
      lname,
      password,
      password2,
      birthday,
      gender,
      city,
      address
    });
  } else {
    User.findById(req.user.id).then(user => {
      user.fname = req.body.fname ? req.body.fname : user.fname;
      user.lname = req.body.lname ? req.body.lname : user.lname;
      user.birthday = req.body.birthday ? req.body.birthday : user.birthday;
      user.gender = req.body.gender ? req.body.gender : user.gender;
      user.city = req.body.city ? req.body.city : user.city;
      user.address = req.body.address ? req.body.address : user.address;

      if (password) {
        //Hashing password using salt from bcrypt
        //salt is a random text added to the string to be hashed
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(user.password, salt, (err, hash) => {
            if (err) throw err;
            //set password to the hash generated
            user.password = hash;
          });
        });
      }
      //save the user
      user
        .save()
        .then(user => {
          req.flash("success_msg", "Edited!");
          res.redirect("/user/dashboard");
        })
        .catch(err => console.log(err));
    });
  }
});

//create events page
router.get("/createevent", ensureAuthenticated, (req, res) =>
  res.render("createevent")
);

//create halls page
router.get("/createhall", ensureAuthenticated, (req, res) =>
  res.render("createhall")
);

//register handle
router.post("/register", (req, res) => {
  const {
    username,
    fname,
    lname,
    email,
    password,
    password2,
    birthday,
    gender,
    city,
    address
  } = req.body;
  let errors = [];
  console.log(req.body);
  //check required fields
  if (
    !username ||
    !fname ||
    !lname ||
    !email ||
    !password ||
    !password2 ||
    !city
  ) {
    errors.push({ msg: "Please fill in all fields" });
  }

  //checking if passwords match
  if (password != password2) {
    errors.push({ msg: "Passwords do not match!" });
  }

  //checking pasword length 8 min
  if (password.length < 8) {
    errors.push({ msg: "Password should be at least 6 character" });
  }

  if (errors.length > 0) {
    res.render("register", {
      errors,
      username,
      fname,
      lname,
      email,
      password,
      password2,
      birthday,
      gender,
      city,
      address
    });
  } else {
    //user passed validation
    User.findOne({ email: email } || { username: username }).then(user => {
      if (user) {
        //user already exits (registered)
        errors.push({ msg: "Email already taken." });
        res.render("register", {
          errors,
          username,
          fname,
          lname,
          email,
          password,
          password2,
          birthday,
          gender,
          city,
          address
        });
      } else {
        is_auth = false;
        const newUser = new User({
          username,
          fname,
          lname,
          email,
          password,
          birthday,
          gender,
          city,
          address
        });

        //Hashing password using salt from bcrypt
        //salt is a random text added to the string to be hashed
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            //set password to the hash generated
            newUser.password = hash;

            //save the user
            newUser
              .save()
              .then(user => {
                req.flash("success_msg", "You are now registered! Login!");
                res.redirect("/user/login");
              })
              .catch(err => console.log(err));
          });
        });
      }
    });
  }
});

//Login Handle
router.post("/login", (req, res, next) => {
  let errors = [];
  User.findOne({ email: req.body.email }).then(users => {
    if (!users) {
      passport.authenticate("user-local", {
        successRedirect: "/user/dashboard",
        failureRedirect: "/user/login",
        failureFlash: true
      })(req, res, next);
    }
    if (users.authorization == "customer") {
      passport.authenticate("user-local", {
        successRedirect: "/user/dashboard",
        failureRedirect: "/user/login",
        failureFlash: true
      })(req, res, next);
    } else if (users.authorization == "admin") {
      passport.authenticate("user-local", {
        successRedirect: "/user/admindashboard",
        failureRedirect: "/user/login",
        failureFlash: true
      })(req, res, next);
    } else {
      passport.authenticate("user-local", {
        successRedirect: "/user/managerdashboard",
        failureRedirect: "/user/login",
        failureFlash: true
      })(req, res, next);
    }
  });
});

//Logout Handle
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success_msg", "You are logged out!");
  res.redirect("/");
});

// create event handle
router.post("/createevent", ensureAuthenticated, (req, res) => {
  const {
    event_name,
    description,
    event_poster,
    date_time,
    hall_num
  } = req.body;
  let errors = [];
  console.log(req.body);
  //check required fields
  if (!event_name || !description || !event_poster || !date_time || !hall_num) {
    //    console.log(event_name);
    //  console.log(description, event_poster, date_time, hall_num);
    errors.push({ msg: "Please fill in all fields" });
  }
  if (errors.length > 0) {
    res.render("createevent", {
      errors,
      event_name,
      description,
      event_poster,
      date_time,
      hall_num
    });
  } else {
    //event passed validation
    Event.findOne({ date_time: date_time } && { hall_num: hall_num }).then(
      event => {
        if (event) {
          //hall is busy  or already exists
          errors.push({ msg: "Hall is taken." });
          res.render("createevent", {
            errors,
            event_name,
            description,
            event_poster,
            date_time,
            hall_num
          });
        } else {
          const newEvent = new Event({
            event_name,
            description,
            event_poster,
            date_time,
            hall_num
          });

          newEvent
            .save()
            .then(event => {
              req.flash("success_msg", "Event is added!");
              res.redirect("/user/managerdashboard");
            })
            .catch(err => console.log(err));
        }
      }
    );
  }
});

// create hall handle
router.post("/createhall", ensureAuthenticated, (req, res) => {
  const { num_rows, num_seats_per_row, hall_no } = req.body;
  let errors = [];
  console.log(req.body);
  //check required fields
  if (!num_rows || !num_seats_per_row || !hall_no) {
    errors.push({ msg: "Please fill in all fields" });
  }
  if (errors.length > 0) {
    res.render("createhall", {
      errors,
      num_rows,
      num_seats_per_row,
      hall_no
    });
  } else {
    //hall passed validation
    Hall.findOne({ hall_no: hall_no }).then(hall => {
      if (hall) {
        //hall already exists
        errors.push({ msg: "Hall already exists!" });
        res.render("createhall", {
          errors,
          num_rows,
          num_seats_per_row,
          hall_no
        });
      } else {
        const newHall = new Hall({
          errors,
          num_rows,
          num_seats_per_row,
          hall_no
        });

        newHall
          .save()
          .then(hall => {
            req.flash("success_msg", "Hall is created!");
            res.redirect("/user/managerdashboard");
          })
          .catch(err => console.log(err));
      }
    });
  }
});

//Delete event handle
router.get("/deleteevent/:id", ensureAuthenticated, (req, res) => {
  const id = req.params.id;
  let errors = [];
  Event.findOneAndDelete({ _id: id }, (err, result) => {
    if (err) {
      errors.push({ msg: "Something went wrong, Try Again!" });
      res.redirect("/user/managerdashboard", { errors });
    } else {
      req.flash("success_msg", "Deleted Event!");
      res.redirect("/user/managerdashboard");
    }
  });
});

module.exports = router;
