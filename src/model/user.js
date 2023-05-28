// /models/user.js

const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
  googleId: String,
});

//* This line compiles the model and creates the Registrant class
const User = mongoose.model("User", userSchema);

module.exports = User;
