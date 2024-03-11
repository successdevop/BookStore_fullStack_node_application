const jwt = require("jsonwebtoken");

const generateAdminToken = (admin) => {
  return jwt.sign(
    { id: admin.id, email: admin.email, role: admin.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_LIFESPAN }
  );
};

const formatAdminResponse = (admin, token) => {
  return {
    id: admin.id,
    email: admin.email,
    role: admin.role,
    token,
  };
};
module.exports = { generateAdminToken, formatAdminResponse };
