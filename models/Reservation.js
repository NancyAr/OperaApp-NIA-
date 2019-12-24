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
  seats: {
    type: Array,
    required: true
  },
  event_date: {
    type: Date,
    default: Date.now,
    required: true
  }
});

const Reservation = mongoose.model("Reservation", ReservationSchema);

module.exports = Reservation;
