const mongoose = require("mongoose");

const database = (url) => {
  return mongoose.connect(url);
};

module.exports = database;
