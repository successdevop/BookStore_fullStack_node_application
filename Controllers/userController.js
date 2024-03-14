const { StatusCodes } = require("http-status-codes");
const { validateUpdateUser } = require("../Validations/userValidate");
const User = require("../Models/UsersModel");

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
    const { error, value } = validateUpdateUser(req.body);
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
  getAUser,
  updateAUser,
  deleteAUser,
};
