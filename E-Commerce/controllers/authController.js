const User = require("../models/userModel");
const sendMail = require("../utils/sendGrid-email").sendMail;
const validator = require("validator");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.signup = async (req, res) => {
  try {
    const emailCheck = await User.findOne({ email: req.body.email });
    if (emailCheck) {
      return res.status(409).json({ message: "The email is already in use" });
    }

    if (!validator.isEmail(req.body.email)) {
      return res.status(400).json({ message: "The email is not valid" });
    }

    if (req.body.password !== req.body.passwordConfirm) {
      return res
        .status(400)
        .json({ message: "password and password confirm don't match" });
    }
    const newUser = await User.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      address: req.body.address,
      phoneNumber: req.body.phoneNumber,
      role: req.body.role,
      moneySpent: req.body.moneySpent,
    });

    // sent verfied email
    const validity = newUser.generateValidity();
    await newUser.save({ validateBeforeSave: false });
    const url = `${req.protocol}://${req.get("host")}/validateUser/${validity}`;
    const msg = `validate your account using this link ${url}`;
    try {
      await sendMail(
        newUser.email,
        "Your validate reset token: (valid for 10 min)",
        msg
      );
    } catch (err) {
      newUser.validationToken = undefined;
      newUser.validationExpires = undefined;
      await newUser.save({ validateBeforeSave: false });
      console.log(err);
      return res.status(500).json({ message: "error occured while sending" });
    }

    return res
      .status(201)
      .json({ success: true, message: "Validation email sent successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
    console.log(err);
  }
};

exports.validateUser = async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");
    console.log(hashedToken);
    const user = await User.findOne({
      validationToken: hashedToken,
      validationExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res
        .status(400)
        .json({ message: "token invalid or expired request a new one" });
    }
    if (req.body.password.length < 8) {
      return res.status(400).json({ message: "Password length is too short" });
    }

    if (req.body.password !== req.body.passwordConfirm) {
      return res
        .status(400)
        .json({ message: "Password & Password Confirm are not the same" });
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.isVerified = true;
    user.validationToken = undefined;
    user.validationExpires = undefined;
    user.validatedAt = Date.now();
    await user.save();
    return res
      .status(200)
      .json({ success: true, message: "Your account has been verified" });
  } catch (err) {
    console.log(err);
  }
};

exports.login = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    } else {
      if (!(await user.checkPassword(req.body.password, user.password))) {
        return res.status(401).json({ message: "Incorrect email or password" });
      }
    }
    if (user.isVerified === false) {
      return res.status(401).json({ message: "Your account is not verified" });
    }
    const { password, ...others } = user._doc;

    createSendToken(others, 201, res);
  } catch (err) {
    console.log(err);
  }
};

// forgot password
exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "user with this email does not exist" });
    }

    const resetToken = user.generatePassword();
    await user.save({ validateBeforeSave: false });

    const url = `${req.protocol}://${req.get(
      "host"
    )}/resetPassword/${resetToken}`;
    const msg = `Forgot password?reset bs visiting this link ${url}`;

    try {
      await sendMail(
        user.email,
        "Your password reset token: (valid for 10 min)",
        msg
      );
      res.status(200).json({ status: "success", message: "reset link sent" });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      res.status(500).json({ message: "error occured while sending" });
      console.log(err);
    }
  } catch (err) {
    console.log(err);
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "The token is invalid, or expired. Please request a new one",
      });
    }

    if (req.body.password.length < 8) {
      return res.status(400).json({ message: "Password length is too short" });
    }

    if (req.body.password !== req.body.passwordConfirm) {
      return res
        .status(400)
        .json({ message: "Password & Password Confirm are not the same" });
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.passwordChangedAt = Date.now();

    await user.save();
    return res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    console.log(err);
  }
};
