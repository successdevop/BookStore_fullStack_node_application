const bycrpt = require("bcrypt");

const hashPassword = (password) => {
  return bycrpt.hash(password, +process.env.SALT_ROUND);
};

module.exports = { hashPassword };
