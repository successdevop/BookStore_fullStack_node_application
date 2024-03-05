const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    bookName: {
      type: String,
      trim: true,
      required: true,
    },
    bookAuthor: {
      type: String,
      trim: true,
      required: true,
    },
    bookQuantity: {
      type: Number,
      required: true,
    },
    bookPrice: {
      type: Number,
      required: true,
    },
    bookStatus: {
      type: String,
      required: true,
      default: "Pending",
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Book = mongoose.model("Book", bookSchema);
module.exports = Book;
