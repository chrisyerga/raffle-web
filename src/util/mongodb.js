require("dotenv").config();
const mongoose = require("mongoose");

// const mongoOptions = {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// };

const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

module.exports = {
  connect: function (dbName) {
    const uri = `${process.env.MONGODB_BASE_URI}/${dbName}?${process.env.MONGODB_CONNECT_OPTIONS}`;

    mongoose.connect(uri);
  },

  getMongoose: () => mongoose,

  close: (dbName) => {
    dbName;
    return mongoose.disconnect();
  },
};
