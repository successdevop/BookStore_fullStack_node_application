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

const validateChangeBookPrice = (book) => {
  const schema = Joi.object({
    bookId: Joi.string().min(3).max(200).required(),
    description: Joi.string().min(3).max(2000).required(),
    newPrice: Joi.number().required(),
  });
  return schema.validate(book);
};

const updateBook = (book) => {
  const schema = Joi.object({
    bookQuantity: Joi.number(),
  });
  return schema.validate(book);
};

module.exports = { validateNewBook, updateBook, validateChangeBookPrice };
