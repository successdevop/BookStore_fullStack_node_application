const express = require("express");
const router = express.Router();
const {
  getAUser,
  updateAUser,
  deleteAUser,
} = require("../Controllers/userController");

const { verifyUserToken } = require("../Middlewares/verifyUserToken");

router
  .route("/:id")
  .get(verifyUserToken, getAUser)
  .put(verifyUserToken, updateAUser)
  .delete(verifyUserToken, deleteAUser);

module.exports = router;
