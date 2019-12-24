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

//dashboard page
router.get("/dashboard", ensureAuthenticated, (req, res) =>
  res.render("dashboard", {
    user: req.user
  })
);

//Delete user handle
router.get("/deleteuser/:id", (req, res) => {
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

//Edit User Authority
/*
router.post("/edituser/:id", (req, res) => {
  //If chosen user is customer
  //console.log("param "+req.params.id+" body "+req.body.authority);
  let errors = [];
  User.findByIdAndDelete(req.params.id).then(user => {
    if (user) {
      username = user.username;
      fname = user.fname;
      lname = user.lname;
      email = user.email;
      password = user.password;
      birthday = user.birthday;
      gender = user.gender;
      city = user.city;
      address = user.city;

      if (req.body.authority == "admin") {
        const newAdmin = new Admin({
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
        //user.authorization = req.body.authority;
        //save the user

        newAdmin
          .save()
          .then(newadmin => {
            req.flash("success_msg", "Changed Authority!");
            res.redirect("/user/admindashboard");
          })
          .catch(err => console.log(err));
      }
    }
  });

  //If chosen user is admin
  Admin.findByIdAndDelete(req.params.id).then(admin => {
    if (admin) {
      username = admin.username;
      fname = admin.fname;
      lname = admin.lname;
      email = admin.email;
      password = admin.password;
      birthday = admin.birthday;
      gender = admin.gender;
      city = admin.city;
      address = admin.city;

      if (req.body.authority == "customer") {
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
        //user.authorization = req.body.authority;
        //save the user

        newUser
          .save()
          .then(newuser => {
            req.flash("success_msg", "Changed Authority!");
            res.redirect("/user/admindashboard");
          })
          .catch(err => console.log(err));
      }
    }
  });
});*/

//edit user authority
router.post("/edituser/:id", (req, res) => {
  //console.log("param "+req.params.id+" body "+req.body.authority);
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
router.get("/showevents", (req, res) =>
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
  User.find()
    .then(users => {
      res.render("admindashboard", { users: users });
    })
    .catch(err => console.log(err));

  //console.log(req.params.username);
  /*let users = [];
  Admin.find().then(admin => {
    if (admin) {
      for (let i = 0; i < admin.length; i++) {
        //if (admin[i].username != req.user.username) {
        users.push(admin[i]);
        //}
      }
      User.find()
        .then(user => {
          for (let i = 0; i < user.length; i++) {
            //if (user[i].username != req.user.username) {
            users.push(user[i]);
            //}
          }
          console.log(users);
          res.render("admindashboard", { users: users });
        })
        .catch(err => console.log(err));
    }
  });*/
});
// console.log(name)
//reserve handle
router.post("/reserve", (req, res) => {
  let seats = [];
  for (var key in req.body) {
    console.log(key);
    seats.push(key);
  }
  console.log(seats);

  event_name = "lol";
  username = req.user.username;
  const newRes = new Reservation({
    username,
    event_name,
    seats
  });
  console.log(newRes);

  newRes
    .save()
    .then(book => {
      console.log("newRes");

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
  let errors = [];
  time = Date.now();
  /*Reservation.findOne(req.body.id).then(book => {
    if (book) {
      errors.push({ msg: "Already made!" });
    }
  });
  if (errors.length > 0) {
    res.render("reserve", {
      errors,
      username,
      event_name
    });
  } else {
    const newRes = new Reservation({
      username,
      event_name,
      time
    });
    newRes
      .save()
      .then(user => {
        req.flash("success_msg", "Edited!");
        res.redirect("/user/dashboard");
      })
      .catch(err => console.log(err));
  }*/
});

//Home page
router.get("/", (req, res) => res.render("welcome"));

//login page
router.get("/login", (req, res) => res.render("login"));

//resister page
router.get("/register", (req, res) => res.render("register"));

//reservations page
router.get("/reservations", (req, res) => {
  Reservation.find({ username: req.user.username }).then(books => {
    console.log(books);
    res.render("reservation", { books: books });
  });
});
//reserve
router.get("/reserve/:eventId", ensureAuthenticated, (req, res) => {
  //console.log(req.user);
  eventId = req.params.eventId;
  Event.findById(eventId).then(event =>
    Hall.findOne({ hall_no: event.hall_num }).then(hall => {
      res.render("reserve", { hall: hall });
    })
  );
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
router.get("/createevent", (req, res) => res.render("createevent"));

//create halls page
router.get("/createhall", (req, res) => res.render("createhall"));

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
router.post("/createevent", (req, res) => {
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
router.post("/createhall", (req, res) => {
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
router.get("/deleteevent/:id", (req, res) => {
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
