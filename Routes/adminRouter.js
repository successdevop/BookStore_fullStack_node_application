const express = require("express");
const { createNewAdmin } = require("../Controllers/adminController");
const { verifySuperAdminToken } = require("../Middlewares/verifyAdminToken");
const adminRouter = express.Router();

adminRouter.route("/").post(verifySuperAdminToken, createNewAdmin);

module.exports = adminRouter;
