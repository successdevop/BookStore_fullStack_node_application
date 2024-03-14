const { StatusCodes } = require("http-status-codes");
const {
  validateNewBook,
  updateBook,
  validateChangeBookPrice,
} = require("../Validations/bookValidate");
const Book = require("../Models/BooksModel");
const ChangePrice = require("../Models/ChangePriceModel");

// == GET ALL BOOKS == //
const getAllBooks = async (req, res) => {
  try {
    if (!req.user._id) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        status: "error",
        ok: false,
        msg: "You are not authorized to access this resources",
      });
    }

    const books = await Book.find({ createdBy: req.user._id });

    if (books.length < 1) {
      return res.status(StatusCodes.OK).json({
        status: StatusCodes.OK,
        ok: true,
        msg: `No books published yet`,
      });
    }

    res.status(StatusCodes.OK).json({
      status: "success",
      ok: true,
      data: { books, counts: books.length },
    });
  } catch (error) {
    console.log(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "error", ok: false, msg: error.message });
  }
};

// == CREATE A NEW BOOK == //
const createANewBook = async (req, res) => {
  try {
    if (!req.user._id) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        status: "error",
        ok: false,
        msg: "You are not authorized to carry out this action",
      });
    }

    req.body.createdBy = req.user._id;
    const { error, value } = validateNewBook(req.body);
    if (error) {
      console.log(error);
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ status: "error", ok: false, msg: error.details[0].message });
    }
    if (value.bookQuantity < 1) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: "error",
        ok: false,
        msg: "Book quantity must be greater than 0",
      });
    }
    if (value.bookPrice < 1) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: "error",
        ok: false,
        msg: "Book price must be greater than 0",
      });
    }
    const book = await Book.findOne({ bookName: value.bookName });
    if (book) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: "error",
        ok: false,
        msg: "Book with name already exist, please enter another name",
      });
    }

    const newBook = new Book({ ...value });
    await newBook.save();

    res.status(StatusCodes.CREATED).json({
      status: "success",
      ok: true,
      msg: "Book added successfully",
      data: newBook,
    });
  } catch (error) {
    console.log(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "error", ok: false, msg: error.message });
  }
};

// == GET A SINGLE BOOK == //
const getASingleBook = async (req, res) => {
  try {
    const jobId = req.params.id;
    if (!jobId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: "error",
        ok: false,
        msg: "Provide a valid book id",
      });
    }

    const userId = req.user._id;
    if (!userId) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        status: "error",
        ok: false,
        msg: "You are not authorized to carry out this action",
      });
    }

    const book = await Book.findOne({ _id: jobId, createdBy: userId });
    if (!book) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: "error",
        ok: false,
        msg: "Book not found",
      });
    }

    book.__v = undefined;

    res.status(StatusCodes.OK).json({
      status: "success",
      ok: true,
      data: book,
    });
  } catch (error) {
    console.log(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "error", ok: false, msg: error.message });
  }
};

// == UPDATE A SINGLE BOOK == //
const updateASingleBook = async (req, res) => {
  try {
    const { error, value } = updateBook(req.body);
    if (error) {
      console.log(error);
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ status: "error", ok: false, msg: error.details[0].message });
    }

    const jobId = req.params.id;
    if (!jobId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: "error",
        ok: false,
        msg: "Provide a valid book id",
      });
    }

    const userId = req.user._id;
    if (!userId) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        status: "error",
        ok: false,
        msg: "You are not authorized to carry out this action",
      });
    }

    const book = await Book.findOne({ _id: jobId, createdBy: userId });
    if (!book) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: "error",
        ok: false,
        msg: "Book not found",
      });
    }

    const newBook = await Book.findOneAndUpdate(
      {
        _id: jobId,
        createdBy: userId,
      },
      { ...value },
      { new: true, runValidators: true }
    );

    newBook.__v = undefined;

    res.status(StatusCodes.OK).json({
      status: "success",
      ok: true,
      data: newBook,
    });
  } catch (error) {
    console.log(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "error", ok: false, msg: error.message });
  }
};

// == DELETE A SINGLE BOOK == //
const deleteASingleBook = async (req, res) => {
  try {
    const jobId = req.params.id;
    if (!jobId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: "error",
        ok: false,
        msg: "Provide a valid book id",
      });
    }

    const userId = req.user._id;
    if (!userId) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        status: "error",
        ok: false,
        msg: "You are not authorized to carry out this action",
      });
    }

    const book = await Book.findOne({ _id: jobId, createdBy: userId });
    if (!book) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: "error",
        ok: false,
        msg: "Book not found",
      });
    }

    await Book.findOneAndUpdate(
      {
        _id: jobId,
        createdBy: userId,
      },
      { bookStatus: "Deleted" },
      { new: true, runValidators: true }
    );

    res.status(StatusCodes.OK).json({
      status: "success",
      ok: true,
      msg: "Book deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "error", ok: false, msg: error.message });
  }
};

// == DELETE ALL BOOKS == //
const deleteAllBooks = async (req, res) => {
  const userId = req.user._id;
  if (!userId) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      status: "error",
      ok: false,
      msg: "You are not authorized to carry out this action",
    });
  }

  await Book.deleteMany({});

  res.status(StatusCodes.OK).json({
    status: "success",
    ok: true,
    msg: "All books deleted successfully",
  });
};

const requestBookPriceChangeByUser = async (req, res) => {
  try {
    const { error, value } = validateChangeBookPrice(req.body);
    if (error) {
      console.log(error);
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ status: "error", ok: false, msg: error.details[0].message });
    }

    if (value.newPrice < 1) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: "error",
        ok: false,
        msg: "Book price must be greater than 0",
      });
    }

    const book = await Book.findById(value.bookId);
    if (!book) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: "error",
        ok: false,
        msg: "Book not found",
      });
    }

    const newPrice = new ChangePrice({
      email: req.user.email,
      userId: req.user._id,
      bookId: book._id,
      newPrice: value.newPrice,
      description: value.description,
    });
    await newPrice.save();

    res.status(StatusCodes.CREATED).json({
      status: "success",
      ok: true,
      msg: "Request for change in price sent, awaiting Admin confirmation",
    });
  } catch (error) {
    console.log(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "error", ok: false, msg: error.message });
  }
};

module.exports = {
  getAllBooks,
  createANewBook,
  getASingleBook,
  updateASingleBook,
  deleteASingleBook,
  deleteAllBooks,
  requestBookPriceChangeByUser,
};
