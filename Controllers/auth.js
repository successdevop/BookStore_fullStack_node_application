const { StatusCodes } = require("http-status-codes");
const {
  validateNewUser,
  validateUserLogin,
} = require("../Validations/userValidate");
const {
  hashPassword,
  checkPassword,
  generateUserToken,
  formatUserResponse,
} = require("../Helpers/userHelpers");
const User = require("../Models/UsersModel");
const Account = require("../Models/AccountModel");

// == REGISTER NEW USER == //
const registerNewUser = async (req, res) => {
  try {
    const { error, value } = validateNewUser(req.body);
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

    const isEmailExist = await User.findOne({ email: value.email });
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
        msg: "Email Blocked, please contact the Admin",
      });
    }

    if (isEmailExist) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ status: "error", ok: false, msg: "Email already exist!!!" });
    }

    const newPassword = await hashPassword(value.password);
    value.password = newPassword;

    const newUser = new User({ ...value });
    await newUser.save();

    const newAccount = new Account({
      userEmail: newUser.email,
      userId: newUser._id,
    });
    await newAccount.save();
    newUser.password = undefined;

    res.status(StatusCodes.CREATED).json({
      status: "success",
      ok: true,
      msg: "registration successfully",
      data: newUser,
    });
  } catch (error) {
    console.log(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "error", ok: false, msg: error.message });
  }
};

// == LOGIN USER == //
const loginUser = async (req, res) => {
  try {
    const { error, value } = validateUserLogin(req.body);
    if (error) {
      console.log(error);
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ status: "error", ok: false, msg: error.details[0].message });
    }

    const user = await User.findOne({ email: value.email });
    if (!user) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ status: "error", ok: false, msg: "User not found" });
    }

    if (user && user.status === "Deleted") {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        status: "error",
        ok: false,
        msg: "Account not found",
      });
    }

    if (user && user.status === "Blocked") {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        status: "error",
        ok: false,
        msg: "Account Blocked, please contact the Admin",
      });
    }

    const isMatch = await checkPassword(value.password, user.password);
    if (!isMatch) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ status: "error", ok: false, msg: "Invalid Email or Password" });
    }

    const token = generateUserToken(user.id, user.email);
    const response = formatUserResponse(user, token);

    res
      .status(StatusCodes.OK)
      .json({ status: "success", ok: true, msg: "login successful", response });
  } catch (error) {
    console.log(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "error", ok: false, msg: error.message });
  }
};

module.exports = { registerNewUser, loginUser };
