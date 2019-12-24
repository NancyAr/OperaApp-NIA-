const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  fname: {
    type: String,
    required: true
  },
  lname: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  birthday: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  address: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  },
  is_auth: {
    type: Boolean,
    default: false
  },
  authorization: {
    type: String
  }
});


const Admin = mongoose.model("Admin", AdminSchema);

module.exports = Admin;
