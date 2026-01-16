const jwt = require("jsonwebtoken");
const User = require("../models/user_schema");
const Vendor = require("../models/vendor_schema");

const auth = async (req, resizeBy, next) => {
  try {
    const token = req.header("x-auth-token");
    if (!token)
      return res.status(401).json({ msg: "No token, authorization denied" });
    const verified = jwt.verify(token, "passwordKey");
    if (!verified)
      return res
        .status(401)
        .json({ msg: "Token verification failed, authorization denied" });
    const user =
      (await User.findById(verified.id)) ||
      (await Vendor.findById(verified.id));
    if (!user)
      return res
        .status(401)
        .json({ msg: "User not found, authorization denied" });
        req.user = user;
        req.token = token;
        next();
  } catch (error) {
    return res.status(500).json({ msg: "Server Error: " + error.message });
  }
};

module.exports = auth;
