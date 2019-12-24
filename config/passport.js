const LocalStrategy = require("passport-local").Strategy; //requiring passport for login
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs"); //to decrypt passwords and check for match

//Load user model
const User = require("../models/User");

//Load admin model
const Admin = require("../models/Admin");

module.exports = function(passport) {
  passport.use(
    "user-local",
    new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
      //Match user
      User.findOne({ email: email })
        .then(user => {
          if (!user) {
            console.log("email not registered");

            return done(null, false, {
              message: "That email is not registered!"
            });
          }

          //Match password
          bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) throw err;

            if (isMatch) {
              return done(null, user);
            } else {
              return done(null, false, {
                message: "Password incorrect! Try again"
              });
            }
          });
        })
        .catch(err => console.log(err));
    })
  );

  passport.use(
    "admin-local",
    new LocalStrategy({ usernameField: "email" }, (email, password, done) =>
      Admin.findOne({ email: email }).then(admin => {
        if (!admin) {
          return done(null, false, {
            message: "That email is not registered!"
          });
        }

        //Match password
        bcrypt.compare(password, admin.password, (err, isMatch) => {
          if (err) throw err;
          if (isMatch) {
            return done(null, admin);
          } else {
            return done(null, false, {
              message: "Password incorrect! Try again"
            });
          }
        });
      })
    )
  );

  //Serializing and deserializing user
  //Check from passport documentation
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  passport.serializeUser((admin, done) => {
    done(null, admin.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, admin) => {
      done(err, admin);
    });
  });
};
