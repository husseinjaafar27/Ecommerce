const User = require("../models/userModel");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");

exports.protect = async (req, res, next) => {
  try {

    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      return res.status(401).json({ message: "You are not logged in" });
    }

    let decoded;
    try {
      decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    } catch (error) {
      console.log(error);
      if (error.name === "JsonWebTokenError") {
        return res.status(401).json("Invalid token");
      } else if (error.name === "TokenExpiredError") {
        return res
          .status(401)
          .json("Your session token has been expired, Login again");
      }
    }

    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res
        .status(401)
        .json({ message: "The token owner no longer exist" });
    }


    if (currentUser.passwordChangedAfterTokenIssued(decoded.iat)) {
      return res.status(401).json({
        message: "Your poassword has been changed, please login again",
      });
    }

    req.user = currentUser;
    next();
  } catch (err) {
    console.log(err);
  }
};