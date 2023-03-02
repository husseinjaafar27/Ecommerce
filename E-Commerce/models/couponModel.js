const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const couponSchema = new mongoose.Schema(
  {
    couponID: String,

    couponCode: {
      type: String,
      required: [true, "Coupon Code is required"],
    },
    discountpercent: {
      type: String,
      required: [true, "Discount percentage is required"],
    },
    discountAmount: {
      type: Number,
      required: [true, "Discount amount is required"],
    },
    expiredAt: {
      type: Date,
      required: [true, "coupon expire time is required"],
    },
    maxUsage: Number,
    minUsage: Number,
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Coupon", couponSchema);
