const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;
const crypto = require("crypto");

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
    isVerified: {
      type: Boolean,
      default: false,
    },
    orders: [
      {
        type: Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
    paymentInfo: {
      type: String,
      // enum: ["card", "cash"],
      default: "Card",
    },
    moneySpent: {
      type: Number,
      default: 0,
    },

    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,

    validatedAt: Date,
    validationToken: String,
    validationExpires: Date,
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) {
      return next();
    }
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
  } catch (err) {
    console.log(err);
  }
});

userSchema.methods.checkPassword = async function (
  candidatePassword,
  UserPassword
) {
  return bcrypt.compare(candidatePassword, UserPassword);
};

//function to create random reset Token
userSchema.methods.generatePassword = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  //saved in database in a hashed way
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; //10 min of validity
  return resetToken;
};

userSchema.methods.generateValidity = function () {
  const validityToken = crypto.randomBytes(32).toString("hex");
  //saved in database in a hashed way
  this.validationToken = crypto
    .createHash("sha256")
    .update(validityToken)
    .digest("hex");
  this.validationExpires = Date.now() + 10 * 60 * 1000; //10 min of validity
  return validityToken;
};

//this function will check if the password is changed after the jwt token
userSchema.methods.passwordChangedAfterTokenIssued = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const passwordChangedTime = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return passwordChangedTime > JWTTimestamp;
  }

  return false;
};

module.exports = mongoose.model("User", userSchema);

