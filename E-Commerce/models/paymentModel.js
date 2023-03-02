const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const paymentSchema = new mongoose.Schema(
  {
    paymentID: String,

    orderID: {
      type:Schema.Types.ObjectId,
      ref:"Order",
      required: [true, "Payment must be belong to a Order"]
    },
    date:{
      type:Date,
      default:Date.now()
    },
    amount:{
      type:Number,
      default:0,
      required:true
    },
    paymentMethodType: {
      type: String,
      enum: ['card', 'cash'],
      default: 'cash',
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ["pending", "cancelled", "completed"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
