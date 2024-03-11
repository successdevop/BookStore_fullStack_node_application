const express = require("express");
const {
  createNewAdmin,
  loginAdmin,
} = require("../Controllers/adminController");
const { verifySuperAdminToken } = require("../Middlewares/verifyAdminToken");
const adminRouter = express.Router();

adminRouter.route("/").post(verifySuperAdminToken, createNewAdmin);
adminRouter.route("/login").post(loginAdmin);

module.exports = adminRouter;
