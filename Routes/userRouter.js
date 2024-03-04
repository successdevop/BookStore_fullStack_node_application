const express = require("express");
const router = express.Router();
const {
  registerNewUser,
  loginUser,
  getAUser,
  updateAUser,
  deleteAUser,
} = require("../Controllers/userController");

const { verifyUserToken } = require("../Middlewares/verifyUserToken");

router.route("/register").post(registerNewUser);
router.route("/login").post(loginUser);
router
  .route("/:id")
  .get(verifyUserToken, getAUser)
  .put(verifyUserToken, updateAUser)
  .delete(verifyUserToken, deleteAUser);

module.exports = router;
