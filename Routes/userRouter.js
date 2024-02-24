const express = require("express");
const router = express.Router();
const { registerNewUser } = require("../Controllers/userController");

router.route("/").post(registerNewUser);

module.exports = router;
