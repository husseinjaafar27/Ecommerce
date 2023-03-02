const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const shippingSchema = new mongoose.Schema(
  {
    shippingID: String,

    orderID: {
      type: Schema.Types.ObjectId,
      ref: "Order",
    },
    shippingMethod: {
      type: String,
      enum: ["land", "air", "sea"],
      default: "air",
    },
    address: {
      id: { type: Schema.Types.ObjectId, ref: "User" },
      name: String,
      details: String,
      phone: Number,
      city: String,
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "cancelled", "completed"],
      default: "Pending",
    },
    shippedDate: {
      type: Date,
      default: Date.now(),
    },

    estimatedDeliveryTime: Date,

    isDelivered: {
      type: Boolean,
      default: false,
    },

    deliveredAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Shipping", shippingSchema);
