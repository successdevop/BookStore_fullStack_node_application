const express = require("express");
const adminRouter = express.Router();
const {
  createNewAdmin,
  loginAdmin,
  getAllUsersByAdmin,
  getASingleUserByAdmin,
  changeUserStatusByAdmin,
  deleteAUserByAdmin,
  getAllBookPriceChangeRequestByAdmin,
  acceptBookPriceChangeByAdmin,
} = require("../Controllers/adminController");
const {
  verifySuperAdminToken,
  verifyAdminToken,
} = require("../Middlewares/verifyAdminToken");

adminRouter.route("/login").post(loginAdmin);

// == OPERATIONS OF SUPER ADMIN == //
adminRouter.route("/").post(verifySuperAdminToken, createNewAdmin);
adminRouter.route("/").get(verifySuperAdminToken, getAllUsersByAdmin);
adminRouter
  .route("/bookPriceChange")
  .get(verifyAdminToken, getAllBookPriceChangeRequestByAdmin);
adminRouter
  .route("/bookPriceChange/:id")
  .patch(verifyAdminToken, acceptBookPriceChangeByAdmin);

adminRouter
  .route("/:id")
  .get(verifySuperAdminToken, getASingleUserByAdmin)
  .patch(verifySuperAdminToken, changeUserStatusByAdmin)
  .delete(verifySuperAdminToken, deleteAUserByAdmin);

module.exports = adminRouter;
