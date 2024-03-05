const Joi = require("joi");

const validateNewBook = (book) => {
  const schema = Joi.object({
    bookName: Joi.string().min(3).max(50).required(),
    bookAuthor: Joi.string().min(3).max(50).required(),
    bookQuantity: Joi.number().required(),
    bookPrice: Joi.number().required(),
    createdBy: Joi.object().id(),
  });
  return schema.validate(book);
};

const updateBook = (book) => {
  const schema = Joi.object({
    bookName: Joi.string().min(3).max(50),
    bookAuthor: Joi.string().min(3).max(50),
    bookQuantity: Joi.number(),
    bookPrice: Joi.number(),
  });
  return schema.validate(book);
};

module.exports = { validateNewBook, updateBook };
