const jwt = require("jsonwebtoken");
const User = require("../Models/UsersModel");
const { StatusCodes } = require("http-status-codes");

const verifyUserToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token || token == undefined) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ status: "error", ok: false, msg: "Invalid credentials" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.id && decoded.email) {
      const user = await User.findOne({ email: decoded.email }).select(
        "-password"
      );
      if (user) {
        if (user.status === "Deleted") {
          return res.status(StatusCodes.UNAUTHORIZED).json({
            status: "error",
            ok: false,
            msg: "Account not found",
          });
        } else if (user.status === "Blocked") {
          return res.status(StatusCodes.UNAUTHORIZED).json({
            status: "error",
            ok: false,
            msg: "Account Blocked, please contact the Admin",
          });
        } else {
          req.user = user;
          next();
        }
      } else {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ status: "error", ok: false, msg: "Invalid credentials" });
      }
    }
  } catch (error) {
    console.log(error);
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ status: "error", ok: false, msg: "User Not Authenticated" });
  }
};

module.exports = { verifyUserToken };
