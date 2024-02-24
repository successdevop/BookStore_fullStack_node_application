const { validateNewUser } = require("../Validations/userValidate");
const { hashPassword } = require("../Helpers/userHelpers");

const registerNewUser = async (req, res) => {
  try {
    const { error, value } = validateNewUser(req.body);
    if (error) {
      console.log(error);
      return res
        .status(400)
        .json({ status: "error", ok: "false", msg: error.details[0].message });
    }
    const newPassword = await hashPassword(req.body.password);
    req.body.password = newPassword;
    console.log(req.body);
    return res.send("Hello register");
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: 500, ok: false, msg: error.message });
  }
};

module.exports = { registerNewUser };
