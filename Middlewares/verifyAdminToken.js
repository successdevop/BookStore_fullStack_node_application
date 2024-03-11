const jwt = require("jsonwebtoken");
const Admin = require("../Models/AdminModel");
const { StatusCodes } = require("http-status-codes");

// == VERIFY ADMIN TOKEN == //
const verifyAdminToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token || token == undefined) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ status: "error", ok: false, msg: "Invalid Token credentials" });
    }
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.id && payload.email && payload.role) {
      const admin = await Admin.findOne({
        _id: payload.id,
        email: payload.email,
        role: payload.role,
      });
      if (admin) {
        if (admin.status === "Deleted") {
          return res.status(StatusCodes.UNAUTHORIZED).json({
            status: "error",
            ok: false,
            msg: "Account not found",
          });
        } else if (admin.status === "Blocked") {
          return res.status(StatusCodes.UNAUTHORIZED).json({
            status: "error",
            ok: false,
            msg: "Account blocked, please contact the Super Admin",
          });
        } else if (admin.role === "admin") {
          return res.status(StatusCodes.UNAUTHORIZED).json({
            status: "error",
            ok: false,
            msg: "You are not authorized to carryout this actions",
          });
        } else {
          req.admin = admin;
          next();
        }
      } else {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          status: "error",
          ok: false,
          msg: "Invalid credentials found",
        });
      }
    } else {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ status: "error", ok: false, msg: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ status: "error", ok: false, msg: "Admin Not Authenticated" });
  }
};

// == VERIFY SUPER ADMIN TOKEN == //
const verifySuperAdminToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token || token === undefined) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ status: "error", ok: false, msg: "Invalid Token credentials" });
    }
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.id && payload.email && payload.role) {
      const superAdmin = await Admin.findOne({
        _id: payload.id,
        email: payload.email,
        role: payload.role,
      });
      if (superAdmin) {
        if (superAdmin.status === "Deleted") {
          return res.status(StatusCodes.UNAUTHORIZED).json({
            status: "error",
            ok: false,
            msg: "Account not found",
          });
        } else if (superAdmin === "Blocked") {
          return res.status(StatusCodes.UNAUTHORIZED).json({
            status: "error",
            ok: false,
            msg: "Account blocked, please contact the Super Admin",
          });
        } else if (superAdmin.role === "super_admin") {
          return res.status(StatusCodes.UNAUTHORIZED).json({
            status: "error",
            ok: false,
            msg: "You are not authorized to carryout this actions",
          });
        } else {
          req.superAdmin = superAdmin;
          next();
        }
      } else {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          status: "error",
          ok: false,
          msg: "Invalid credentials found",
        });
      }
    } else {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ status: "error", ok: false, msg: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({
        status: "error",
        ok: false,
        msg: "Super Admin Not Authenticated",
      });
  }
};

module.exports = { verifyAdminToken, verifySuperAdminToken };
