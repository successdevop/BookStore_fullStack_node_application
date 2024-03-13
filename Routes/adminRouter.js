const express = require("express");
const adminRouter = express.Router();
const {
  createNewAdmin,
  loginAdmin,
  getAllUsersByAdmin,
  getASingleUserByAdmin,
  changeUserStatusByAdmin,
} = require("../Controllers/adminController");
const {
  verifySuperAdminToken,
  verifyAdminToken,
} = require("../Middlewares/verifyAdminToken");

adminRouter.route("/").post(verifySuperAdminToken, createNewAdmin);
adminRouter.route("/login").post(loginAdmin);
adminRouter.route("/").get(verifySuperAdminToken, getAllUsersByAdmin);
adminRouter
  .route("/:id")
  .get(verifySuperAdminToken, getASingleUserByAdmin)
  .patch(verifySuperAdminToken, changeUserStatusByAdmin);

module.exports = adminRouter;
