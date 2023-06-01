require("../util/mongodb");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const drawingSchema = new Schema({
  itemName: {
    type: String,
    required: true,
    unique: false,
  },
  itemImage: {
    type: String,
    required: true,
    unique: false,
  },
  description: {
    type: String,
    required: false,
    unique: false,
  },
  winner: {
    type: String,
    required: false,
    unique: false,
  },
  date: {
    type: String,
    required: false,
    unique: false,
  },
  notes: {
    type: String,
    required: false,
    unique: false,
  },
  complete: {
    type: String,
    required: false,
    unique: false,
  },
});
//* This line compiles the model and creates the Registrant class
const Drawing = mongoose.model("Drawing", drawingSchema);

module.exports = Drawing;
