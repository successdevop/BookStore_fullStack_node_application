const {
  validateAdmin,
  validateAdminLogin,
} = require("../Validations/validateAdmin");
const { hashPassword, checkPassword } = require("../Helpers/userHelpers");
const { StatusCodes } = require("http-status-codes");
const {
  generateAdminToken,
  formatAdminResponse,
} = require("../Helpers/adminHelpers");
const User = require("../Models/UsersModel");
const Admin = require("../Models/AdminModel");
const ChangePrice = require("../Models/ChangePriceModel");
const Book = require("../Models/BooksModel");

// == REGISTER NEW ADMIN == //
const createNewAdmin = async (req, res) => {
  try {
    const { error, value } = validateAdmin(req.body);
    if (error) {
      console.log(error);
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ status: "error", ok: false, msg: error.details[0].message });
    }

    if (value.password !== value.confirmPassword) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ status: "error", ok: false, msg: "Passwords do not match" });
    }

    const isEmailExist = await Admin.findOne({ email: value.email });
    if (isEmailExist && isEmailExist.status === "Deleted") {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        status: "error",
        ok: false,
        msg: "Email unavailable, please try another email",
      });
    }

    if (isEmailExist && isEmailExist.status === "Blocked") {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        status: "error",
        ok: false,
        msg: "Email Blocked, please contact the Super Admin",
      });
    }

    if (isEmailExist) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ status: "error", ok: false, msg: "Email already exist!!!" });
    }

    const newPassword = await hashPassword(value.password);
    value.password = newPassword;

    const newAdmin = new Admin({ ...value });
    await newAdmin.save();

    newAdmin.password = undefined;

    res.status(StatusCodes.CREATED).json({
      status: "success",
      ok: true,
      msg: "Admin created successfully",
      data: newAdmin,
    });
  } catch (error) {
    console.log(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "error", ok: false, msg: error.message });
  }
};
// == LOGIN ADMIN == //
const loginAdmin = async (req, res) => {
  try {
    const { error, value } = validateAdminLogin(req.body);
    if (error) {
      console.log(error);
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ status: "error", ok: false, msg: error.details[0].message });
    }

    const admin = await Admin.findOne({ email: value.email });
    if (!admin) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ status: "error", ok: false, msg: "Account not found" });
    }

    if (admin && admin.status === "Deleted") {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        status: "error",
        ok: false,
        msg: "Account not found",
      });
    }

    if (admin && admin.status === "Blocked") {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        status: "error",
        ok: false,
        msg: "Account Blocked, please contact the Super Admin",
      });
    }

    const isMatch = checkPassword(value.password, admin.password);
    if (!isMatch) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ status: "error", ok: false, msg: "Invalid Email or Password" });
    }

    const token = generateAdminToken(admin);
    const response = formatAdminResponse(admin, token);

    res.status(StatusCodes.OK).json({
      status: "success",
      ok: true,
      msg: "Admin login successfully",
      data: response,
    });
  } catch (error) {
    console.log(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "error", ok: false, msg: error.message });
  }
};

// == GET ALL USERS BY ADMIN == //
const getAllUsersByAdmin = async (req, res) => {
  try {
    if (req.superAdmin.role !== "super_admin") {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        status: "error",
        ok: false,
        msg: "Unauthorized",
      });
    }
    const users = await User.find({});
    res.status(StatusCodes.OK).json({
      status: "success",
      ok: true,
      users,
    });
  } catch (error) {
    console.log(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "error", ok: false, msg: error.message });
  }
};

// == GET A SINGLE USER BY ADMIN == //
const getASingleUserByAdmin = async (req, res) => {
  try {
    if (req.superAdmin.role !== "super_admin") {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        status: "error",
        ok: false,
        msg: "Unauthorized",
      });
    }
    const { id } = req.params;
    if (!id) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ status: "error", ok: false, msg: "Provide a valid user id" });
    }
    const user = await User.findOne({ _id: id });
    if (!user) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ status: "error", ok: false, msg: "User not found" });
    }

    res.status(StatusCodes.OK).json({
      status: "success",
      ok: true,
      user,
    });
  } catch (error) {
    console.log(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "error", ok: false, msg: error.message });
  }
};

// == CHANGE A USER STATUS BY ADMIN == //
const changeUserStatusByAdmin = async (req, res) => {
  try {
    if (req.superAdmin.role !== "super_admin") {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        status: "error",
        ok: false,
        msg: "Unauthorized",
      });
    }
    const { id } = req.params;
    if (!id) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ status: "error", ok: false, msg: "Provide a valid user id" });
    }
    const user = await User.findById(id);
    if (!user) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ status: "error", ok: false, msg: "User not found" });
    }

    if (user && user.status === "Blocked") {
      user.status = "Active";
    } else if (user && user.status === "Active") {
      user.status = "Blocked";
    } else {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ status: "error", ok: false, msg: "Account already deleted" });
    }

    await user.save();

    return res.status(StatusCodes.OK).json({
      status: "success",
      ok: true,
      msg: "User status updated",
    });
  } catch (error) {
    console.log(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "error", ok: false, msg: error.message });
  }
};

// == DELETE A USER BY ADMIN == //
const deleteAUserByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ status: "error", ok: false, msg: "Provide a valid user id" });
    }
    const user = await User.findById(id);
    if (!user) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ status: "error", ok: false, msg: "User not found" });
    }
    if (user && user.status === "Deleted") {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ status: "error", ok: false, msg: "Account already deleted" });
    }

    user.status = "Deleted";
    await user.save();

    return res.status(StatusCodes.OK).json({
      status: "success",
      ok: true,
      msg: "Account deleted",
    });
  } catch (error) {
    console.log(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "error", ok: false, msg: error.message });
  }
};

// == GET ALL BOOK PRICE CHANGE REQUEST BY ADMIN == //
const getAllBookPriceChangeRequestByAdmin = async (req, res) => {
  try {
    const allBookPriceChangeRequest = await ChangePrice.find({});

    if (allBookPriceChangeRequest.length < 1) {
      return res.status(StatusCodes.OK).json({
        status: "success",
        ok: true,
        msg: "No Book Price Change Request yet",
      });
    }

    return res.status(StatusCodes.OK).json({
      status: "success",
      ok: true,
      allBookPriceChangeRequest,
    });
  } catch (error) {
    console.log(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "error", ok: false, msg: error.message });
  }
};

// == ACCEPT BOOK PRICE CHANGE REQUEST BY ADMIN == //
const acceptBookPriceChangeByAdmin = async (req, res) => {
  try {
    const changeBookPriceId = req.params.id;
    if (!changeBookPriceId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: "error",
        ok: false,
        msg: "Provide a valid price change Id",
      });
    }

    const bookChangeRequest = await ChangePrice.findById(changeBookPriceId);
    if (!bookChangeRequest) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: "error",
        ok: false,
        msg: "Book Price Change Request Not Found",
      });
    }

    if (bookChangeRequest.status === "Rejected") {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: "error",
        ok: false,
        msg: "Book Price Change Request Already Rejected",
      });
    }

    if (bookChangeRequest.status === "Accepted") {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: "error",
        ok: false,
        msg: "Book Price Change Request Already Accepted",
      });
    }

    const book = await Book.findOne({ _id: bookChangeRequest.bookId });
    if (!book) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: "error",
        ok: false,
        msg: "Book Not found",
      });
    }

    if (book.bookStatus === "Pending" || book.bookStatus === "Rejected") {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: "error",
        ok: false,
        msg: "Book Price Change Request Can Only Be Made For Published Books",
      });
    }

    book.bookPrice = bookChangeRequest.newPrice;
    await book.save();
    bookChangeRequest.status = "Accepted";
    await bookChangeRequest.save();

    return res.status(StatusCodes.OK).json({
      status: "success",
      ok: true,
      msg: "Book Price Change Request Accepted Successfully",
    });
  } catch (error) {
    console.log(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "error", ok: false, msg: error.message });
  }
};

// == REJECT BOOK PRICE CHANGE REQUEST BY ADMIN == //
const rejectBookPriceChangeByAdmin = async (req, res) => {
  try {
    const changeBookPriceId = req.params.id;
    if (!changeBookPriceId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: "error",
        ok: false,
        msg: "Provide a valid price change Id",
      });
    }

    const bookChangeRequest = await ChangePrice.findById(changeBookPriceId);
    if (!bookChangeRequest) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: "error",
        ok: false,
        msg: "Book Price Change Request Not Found",
      });
    }

    if (bookChangeRequest.status === "Rejected") {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: "error",
        ok: false,
        msg: "Book Price Change Request Already Rejected",
      });
    }

    if (bookChangeRequest.status === "Accepted") {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: "error",
        ok: false,
        msg: "Book Price Change Request Already Accepted",
      });
    }

    const book = await Book.findOne({ _id: bookChangeRequest.bookId });
    if (!book) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: "error",
        ok: false,
        msg: "Book Not found",
      });
    }

    if (book.bookStatus === "Pending" || book.bookStatus === "Rejected") {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: "error",
        ok: false,
        msg: "Book Price Change Request Can Only Be Made For Published Books",
      });
    }

    bookChangeRequest.status = "Rejected";
    await bookChangeRequest.save();

    return res.status(StatusCodes.OK).json({
      status: "success",
      ok: true,
      msg: "Book Price Change Request Rejected",
    });
  } catch (error) {
    console.log(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "error", ok: false, msg: error.message });
  }
};

module.exports = {
  createNewAdmin,
  loginAdmin,
  getAllUsersByAdmin,
  getASingleUserByAdmin,
  changeUserStatusByAdmin,
  deleteAUserByAdmin,
  getAllBookPriceChangeRequestByAdmin,
  acceptBookPriceChangeByAdmin,
  rejectBookPriceChangeByAdmin,
};
