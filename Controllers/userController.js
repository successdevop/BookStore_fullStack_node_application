const {
  validateNewUser,
  userLogin,
  updateUser,
} = require("../Validations/userValidate");

const {
  hashPassword,
  checkPassword,
  generateToken,
  formatResponse,
} = require("../Helpers/userHelpers");
const User = require("../Models/UsersModel");
const { StatusCodes } = require("http-status-codes");

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
    if (isEmailExist && isEmailExist.status === "Blocked") {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        status: "error",
        ok: false,
        msg: "Account Blocked, please contact the Admin",
      });
    }
    if (isEmailExist && isEmailExist.status === "Deleted") {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        status: "error",
        ok: false,
        msg: "Email unavailable, please try another email",
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
    const { error, value } = userLogin(req.body);
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
    if (user.status === "Blocked") {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        status: "error",
        ok: false,
        msg: "Account Blocked, please contact the Admin",
      });
    }
    if (user.status === "Deleted") {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        status: "error",
        ok: false,
        msg: "Account not found",
      });
    }

    const isMatch = await checkPassword(value.password, user.password);
    if (!isMatch) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ status: "error", ok: false, msg: "Invalid Email or Password" });
    }

    const token = generateToken(user.id, user.email);
    const response = formatResponse(user, token);

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

// == GET A USER == //
const getAUser = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ status: "error", ok: false, msg: "Provide a user id" });
    }
    if (id !== req.user.id) {
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
    user.password = undefined;
    user.status = undefined;
    user.__v = undefined;

    res.status(StatusCodes.OK).json({ status: "success", ok: true, user });
  } catch (error) {
    console.log(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "error", ok: false, msg: error.message });
  }
};

// == UPDATE A USER == //
const updateAUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = updateUser(req.body);
    if (error) {
      console.log(error);
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ status: "error", ok: false, msg: error.details[0].message });
    }

    if (!id) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ status: "error", ok: false, msg: "Provide a user id" });
    }
    if (id !== req.user.id) {
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

    const updatedUser = await User.findOneAndUpdate(
      { email: user.email },
      value,
      { new: true, runValidators: true }
    );

    updatedUser.password = undefined;
    updatedUser.status = undefined;
    updatedUser.__v = undefined;

    res.status(StatusCodes.OK).json({
      status: "success",
      ok: true,
      msg: "Profile update successful",
      updatedUser,
    });
  } catch (error) {
    console.log(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "error", ok: false, msg: error.message });
  }
};

// == DELETE A USER == //
const deleteAUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ status: "error", ok: false, msg: "Provide a user id" });
    }
    if (id !== req.user.id) {
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

    await User.findOneAndUpdate(
      { email: user.email },
      { status: "Deleted" },
      { new: true, runValidators: true }
    );

    res.status(StatusCodes.OK).json({
      status: "success",
      ok: true,
      msg: "Account deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "error", ok: false, msg: error.message });
  }
};

module.exports = {
  registerNewUser,
  loginUser,
  getAUser,
  updateAUser,
  deleteAUser,
};
