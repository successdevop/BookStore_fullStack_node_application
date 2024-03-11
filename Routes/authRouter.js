const express = require("express");
const authRouter = express.Router();
const { registerNewUser, loginUser } = require("../Controllers/auth");

authRouter.route("/register").post(registerNewUser);
authRouter.route("/login").post(loginUser);

module.exports = authRouter;
