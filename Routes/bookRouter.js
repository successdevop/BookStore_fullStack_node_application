const express = require("express");
const {
  getAllBooks,
  createANewBook,
  deleteAllBooks,
  getASingleBook,
  updateASingleBook,
  deleteASingleBook,
} = require("../Controllers/bookController");
const bookRoute = express.Router();

bookRoute
  .route("/")
  .get(getAllBooks)
  .post(createANewBook)
  .delete(deleteAllBooks);
bookRoute
  .route("/:id")
  .get(getASingleBook)
  .put(updateASingleBook)
  .delete(deleteASingleBook);
module.exports = bookRoute;
