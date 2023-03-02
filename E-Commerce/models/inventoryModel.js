const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const inventorySchema = new mongoose.Schema(
  {
    products: [
      {
        productID: {
          type: Schema.Types.ObjectId,
          ref: "Product",
        },
        quantity: {
          type: Number,
          default: 0,
        },
        isAvailable: {
          type: Boolean,
          default: true,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Inventory", inventorySchema);
