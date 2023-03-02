const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new mongoose.Schema(
  {
    productID: String,

    // each product ref to one Admin
    userID: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Admin is required"],
    },
    productName: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: 50,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      maxlength: [2000, "Too long description"],
    },
    image: [
      {
        type: String,
        required: [true, "Product image is required"],
      },
    ],
    price: {
      type: Number,
      required: [true, "Product price is required"],
      trim: true,
      maxlength: [32, "Too long price"],
    },
    priceAfterDiscount: {
      type: Number,
    },
    soldQuantity: {
      type: Number,
      default: 0,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Product must be belong to a category"],
    },
    brand: {
      type: Schema.Types.ObjectId,
      ref: "Brand",
    },
    available: {
      type: Boolean,
      required: true,
      default: true,
    },
    rating: {
      type: Number,
      minLength: 1,
      maxlength: 5,
      default: 1,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    reviews: [String],
    coupon: {
      type: Schema.Types.ObjectId,
      ref: "Coupon",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
