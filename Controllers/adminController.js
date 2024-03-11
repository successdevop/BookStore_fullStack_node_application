const {
  validateAdmin,
  validateAdminLogin,
} = require("../Validations/validateAdmin");
const { hashPassword, checkPassword } = require("../Helpers/userHelpers");
const { StatusCodes } = require("http-status-codes");
const Admin = require("../Models/AdminModel");
const {
  generateAdminToken,
  formatAdminResponse,
} = require("../Helpers/adminHelpers");

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

module.exports = { createNewAdmin, loginAdmin };
