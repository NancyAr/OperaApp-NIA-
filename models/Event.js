const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
  event_name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  event_poster: {
    data: Buffer,
    type: String,
    required: true
  },
  date_time: {
    type: Date,
    required: true
  },
  hall_num: {
    type: String,
    required: true
  }
});

const Event = mongoose.model("Event", EventSchema);

module.exports = Event;
