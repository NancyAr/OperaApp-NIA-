const mongoose = require("mongoose");

const ReservationSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  event_name: {
    type: String,
    required: true
  },
  date_time: {
    type: Date,
    required: false
  }
});

const Reservation = mongoose.model("Reservation", ReservationSchema);

module.exports = Reservation;
