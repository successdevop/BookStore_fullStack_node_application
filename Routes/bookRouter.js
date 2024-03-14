const express = require("express");
const {
  getAllBooks,
  createANewBook,
  deleteAllBooks,
  getASingleBook,
  updateASingleBook,
  deleteASingleBook,
} = require("../Controllers/bookController");
const { verifyUserToken } = require("../Middlewares/verifyUserToken");
const bookRoute = express.Router();

bookRoute
  .route("/")
  .get(getAllBooks)
  .post(verifyUserToken, createANewBook)
  .delete(verifyUserToken, deleteAllBooks);
bookRoute
  .route("/:id")
  .get(getASingleBook)
  .put(updateASingleBook)
  .delete(deleteASingleBook);
module.exports = bookRoute;
