const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new mongoose.Schema(
  {
    orderID: String,

    // each order ref to one user
    orderOwner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    cartItems: [
      {
        // type: Schema.Types.ObjectId,
        // ref: "Cart",
        type: {},
        count: { type: Number, default: 1 },
      },
    ],
    totalPrice: {
      type: Number,
      default: 0,
    },
    dateOrdered: {
      type: Date,
      default: Date.now(),
    },
    payment: {
      type: Schema.Types.ObjectId,
      ref: "Payment",
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "cancelled", "completed", "shipped", "delivered"],
      default: "pending",
    },
    deliveredAt: {
      type: Date,
    },
    isDelivered: {
      type: Boolean,
      default: false,
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
    address: {
      id: { type: Schema.Types.ObjectId, ref: "User" },
      name: String,
      details: String,
      phone: Number,
      city: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
