const Joi = require("joi");

const validateNewUser = (user) => {
  const schema = Joi.object({
    userName: Joi.string().alphanum().min(3).max(30).required(),
    firstName: Joi.string().alphanum().min(3).max(30).required(),
    lastName: Joi.string().alphanum().min(3).max(30).required(),
    phoneNumber: Joi.string().max(11).max(15).required(),
    email: Joi.string().email().required(),
    password: Joi.string()
      .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
      .required(),
    confirmPassword: Joi.string()
      .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
      .required(),
    address: Joi.string().required(),
  });

  return schema.validate(user);
};

const validateUserLogin = (user) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
  });

  return schema.validate(user);
};

const validateUpdateUser = (user) => {
  const schema = Joi.object({
    userName: Joi.string().alphanum().min(3).max(30),
    firstName: Joi.string().alphanum().min(3).max(30),
    lastName: Joi.string().alphanum().min(3).max(30),
    phoneNumber: Joi.string().max(11).max(15),
    address: Joi.string(),
  });

  return schema.validate(user);
};

module.exports = { validateNewUser, validateUserLogin, validateUpdateUser };
