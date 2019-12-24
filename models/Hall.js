const mongoose = require("mongoose");

const HallSchema = new mongoose.Schema({
  num_rows: {
    type: String,
    required: true
  },
  num_seats_per_row: {
    type: String,
    required: true
  },
  hall_no: {
    type: String,
    required: true
  }
});

const Hall = mongoose.model("Hall", HallSchema);

module.exports = Hall;
