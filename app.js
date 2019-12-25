const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
const flash = require("connect-flash");
const session = require("express-session");
const passport = require("passport");
const sass = require("node-sass");
const app = express();

require("express-ws")(app);
//Passport config
require("./config/passport")(passport);

//DB Config
const db = require("./config/keys").MongoURI;

//Connect to Mongo
mongoose
  .connect(db, { useNewUrlParser: true })
  .then(() => console.log("MongoDB Connected..."))
  .catch(err => console.log(err));

//EJS
app.use(expressLayouts);
app.set("view engine", "ejs");

//Bodyparser
app.use(express.urlencoded({ extended: false }));

// Express Session middleware
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true
  })
);

//Passport middleware
app.use(passport.initialize());
app.use(passport.session());

//static
app.use(express.static("images"));

//Connect flash middleware
app.use(flash());

//Global vars
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});
app.use(function(req, res, next) {
  const origin = req.headers["origin"];
  res.header("Access-Control-Allow-Origin", origin);
  res.header("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, Set-Cookie"
  );
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});
/*
app.ws("/showhall", function(ws, req) {
  console.log("LOL");
  ws.on("message", function(msg) {
    console.log(msg);
  });
  console.log("socket", req.testing);
});*/
//Routes
app.use("/", require("./routes/index"));
app.use("/user", require("./routes/user"));
app.use("/admin", require("./routes/admin"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server started on port ${PORT}`));
