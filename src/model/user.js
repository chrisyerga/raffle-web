// /models/user.js

const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
  googleId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: false,
    unique: false,
  },
  email: {
    type: String,
    required: false,
    unique: true,
  },
  photo: {
    type: String,
    required: false,
    unique: false,
  },
});

//* This line compiles the model and creates the Registrant class
const User = mongoose.model("User", userSchema);

module.exports = User;
