const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const hashPassword = (password) => {
  return bcrypt.hash(password, +process.env.SALT_ROUND);
};

const checkPassword = (givenPassword, savedPassword) => {
  return bcrypt.compare(givenPassword, savedPassword);
};

const generateUserToken = (id, email) => {
  return jwt.sign({ id, email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFESPAN,
  });
};

const formatUserResponse = (user, token) => {
  return {
    id: user.id,
    email: user.email,
    token: token,
  };
};

module.exports = {
  hashPassword,
  checkPassword,
  generateUserToken,
  formatUserResponse,
};
