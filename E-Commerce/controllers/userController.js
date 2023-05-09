const User = require("../models/userModel");
const validator = require("validator");
const bcrypt = require("bcrypt");

// get one user
exports.getUser = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ message: "The user ID is required" });
    }
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(user);
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const user = await User.find({}).sort({ createdAt: -1 });
    if (!user) {
      return res.status(404).json({ message: "Users not found" });
    }

    return res.status(200).json(user);
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { firstName, lastName, address, phoneNumber } = req.body;
    const result = await User.findByIdAndUpdate(
      req.user._id,
      {
        firstName: firstName || req.user.firstName,
        lastName: lastName || req.user.lastName,
        address: address || req.user.address,
        phoneNumber: phoneNumber || req.user.phoneNumber,
      },
      { new: true }
    );

    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ message: "The user ID is required" });
    }
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// create new user by admin
exports.createUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      passwordConfirm,
      address,
      phoneNumber,
      role,
      isVerified,
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !passwordConfirm ||
      !address ||
      !phoneNumber ||
      !role ||
      !isVerified
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const emailCheck = await User.findOne({ email });
    if (emailCheck) {
      return res.status(409).json({ message: "The email is already in use" });
    }
    if (firstName.length < 3 || firstName.length > 30) {
      return res
        .status(400)
        .json({ message: "First name should be between 3 and 30" });
    }
    if (lastName.length < 3 || lastName.length > 30) {
      return res
        .status(400)
        .json({ message: "Last name should be between 3 and 30" });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password should be equal or greater than 8" });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "The email is not valid" });
    }

    if (password !== passwordConfirm) {
      return res
        .status(400)
        .json({ message: "password and password confirm don't match" });
    }

    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password,
      passwordConfirm,
      address,
      phoneNumber,
      role,
      isVerified,
    });

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      newUser,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// reset user profile by admin
exports.ResetUserInfo = async (req, res) => {
  try {
    const { firstName, lastName, password, address, phoneNumber, role } =
      req.body;

    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: "The user ID is required" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // if password is existing
    if (password && password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password is required and 8 character long" });
    }

    const hashedPassword = password
      ? await bcrypt.hash(password, 12)
      : undefined;

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        firstName: firstName || user.firstName,
        lastName: lastName || user.lastName,
        password: hashedPassword || user.password,
        address: address || user.address,
        phoneNumber: phoneNumber || user.phoneNumber,
        role: role || user.role,
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      updatedUser,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// sort users by date joined by admin
exports.sortUserByDate = async (req, res) => {
  try {
    const users = await User.find({ role: "user" }).sort({ createdAt: -1 });
    if (users.length <= 0) {
      return res.status(404).json({ message: "No users found" });
    }

    return res.status(200).json({
      success: true,
      message: "Users sorted successfully",
      users,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// sort user by money spent by admin
exports.sortUserByMoneySpent = async (req, res) => {
  try {
    const { checked } = req.body;
    let user = {};
    if (checked.length)
      user.moneySpent = { $gte: checked[0], $lte: checked[1] };

    const users = await User.find(user)
      .sort({ moneySpent: 1 })
      .select("firstName lastName moneySpent");

    if (users.length <= 0) {
      return res.status(404).json({ message: "No users found" });
    }

    return res.status(200).json({
      success: true,
      message: "Users sorted successfully",
      users,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
