const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cartSchema = new mongoose.Schema(
  {
    cartOwner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    products: [
      {
        product: { type: Schema.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, default: 1 },
        price: Number,
      },
    ],
    totalCartPrice: { type: Number, default: 0 },
    totalAfterDiscount: Number,
    coupon: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", cartSchema);
