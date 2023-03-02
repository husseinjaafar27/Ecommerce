const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "Please enter your firstName"],
      minLength: 3,
      maxLength: 30,
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Please enter your lastName"],
      minLength: 3,
      maxLength: 30,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
      required: [true, "Please enter your email"],
    },
    password: {
      type: String,
      minLength: 8,
      trim: true,
      required: [true, "Please enter your password"],
    },
    passwordConfirm: {
      type: String,
      minLength: 8,
      trim: true,
      required: [true, "Please confrim your password"],
    },
    address: {
      type: String,
      required: [true, "Please enter your address"],
    },
    phoneNumber: {
      type: Number,
      required: [true, "Please enter your phone number"],
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    orders: [
      {
        type: Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
    paymentInfo: {
      type: String,
      enum: ["card", "cash"],
      default: "Card",
    },

    // passwordChangedAt: Date,
    // passwordResetToken: String,
    // passwordResetExpires: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
