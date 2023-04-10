const User = require("../models/userModel.js");
const rateLimit = require("express-rate-limit");

exports.isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user || user.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "You should be admin to do this operation",
      });
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
    return res.status(401).send({
      success: false,
      error,
      message: "Error in admin middelware",
    });
  }
};

exports.createAccountLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 min
  max: 5,
  message:
    "Too many accounts created from this IP, please try again after an 10 min",
  standardHeaders: true,
  legacyHeaders: false,
});
