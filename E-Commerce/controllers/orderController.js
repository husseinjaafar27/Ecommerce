const Order = require("../models/orderModel");
const User = require("../models/userModel");
const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const { sendMail, sendMailInvoice } = require("../utils/sendGrid-email");
const mongoose = require("mongoose");

exports.createOrder = async (req, res) => {
  try {
    const { status, details, phone, city } = req.body;
    const orderOwner = await User.findOne({ _id: req.user._id }).select(
      "firstName lastName "
    );
    if (!orderOwner) {
      return res.status(404).json({ message: "A cart should have an owner" });
    }

    const cartItems = await Cart.findOne({ carOwner: req.user._id })
      .populate("products", "product quantity price")
      .select("products totalCartPrice");
    if (!cartItems) {
      return res.status(404).json({ message: "Cart not found" });
    }
    if (req.user._id === cartItems.cartOwner) {
      return res.status(401).json({ message: "You are not authorized" });
    }

    const order = await Order.create({
      orderOwner: orderOwner,
      cartItems: cartItems.products,
      dateOrdered: Date.now(),
      address: {
        id: orderOwner._id,
        name: orderOwner.firstName + " " + orderOwner.lastName,
        details,
        phone,
        city,
      },
    });

    order.totalPrice += cartItems.totalCartPrice;
    order.dateOrdered = Date.now();
    await order.save();

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.updateOrder = async (req, res) => {
  try {
    const { name, details, phone, city } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (order.status === "completed") {
      return res.status(400).json({ message: "Order already completed" });
    }
    const updateOrder = await Order.findByIdAndUpdate(
      order._id,
      {
        address: {
          name: name ? name : order.address.name,
          details: details ? details : order.address.details,
          phone: phone ? phone : order.address.phone,
          city: city ? city : order.address.city,
        },
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      updateOrder,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const id = req.params.id;
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (order.status === "completed") {
      return res.status(400).json({ message: "Order already completed" });
    }
    if (order.status === "shipped") {
      return res.status(400).json({ message: "Order already shipped" });
    }
    if (order.status === "delivered") {
      return res.status(400).json({ message: "Order already delivered" });
    }

    await Cart.deleteOne({ cartOwner: req.user._id });

    // ///////////////////////////////
    await Order.deleteOne({ _id: order._id });

    return res.status(200).json({
      message: "order cancelled successfully",
    });
  } catch (err) {
    console.log(err);
  }
};

// If the client complete his order,  he can't update it again
exports.markOrderCompleted = async (req, res) => {
  try {
    const id = req.params.id;
    const checkOrder = await Order.findById(id);
    if (!checkOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (checkOrder.orderOwner._id.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "You are not authorized" });
    }
    if (checkOrder.status === "completed") {
      return res.status(401).json({ message: "Order already completed" });
    }
    const order = await Order.findByIdAndUpdate(
      id,
      { status: req.body.status },
      { new: true }
    );

    order.cartItems.forEach(async (item) => {
      await updateStock(item.product, item.quantity);
    });
    await Cart.deleteOne({ cartOwner: req.user.id });

    return res.status(200).json({ message: "order completed" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
async function updateStock(id, quantity) {
  const product = await Product.findById(id);
  product.quantity -= quantity;
  product.soldQuantity += quantity;
  await product.save({ validateBeforeSave: false });
}

//  Update Order Status by admin
exports.orderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found with this Id" });
    }

    if (order.status === "cancelled") {
      return res.status(400).json({ message: "Order is cancelled" });
    }

    if (order.status === "delivered") {
      return res
        .status(400)
        .json({ message: "You have already delivered this order" });
    }

    if (req.body.status === "shipped") {
      order.status = req.body.status;
    }

    if (req.body.status === "delivered") {
      order.deliveredAt = Date.now();
      order.isDelivered = true;
      order.status = req.body.status;
    }

    await order.save({ validateBeforeSave: false });
    return res.status(200).json({
      success: true,
      message: `The status of the order is: ${order.status}`,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.emailInvoice = async (req, res) => {
  try {
    const checkOrder = await Order.findById(req.params.id).populate(
      "cartItems",
      "products"
    );
    if (!checkOrder) {
      return res.status(404).json({ message: "Order not exist" });
    }
    if (checkOrder.status !== "completed") {
      return res.status(400).json({ message: "Order is not completed" });
    }
    const user = await User.findOne(checkOrder.orderOwner.email);
    // send email
    let items = [];
    const orderItemsIds = await Promise.all(
      checkOrder.cartItems.map(async (orderItem) => {
        const productName = await Product.findById(orderItem.product);
        items.push({
          product: productName.productName,
          quantity: orderItem.quantity,
          price: orderItem.price,
        });
      })
    );

    const email = items
      .map((item) => {
        return `<ul><li>Product:${item.product}  Quality:${
          item.quantity
        }  Price:${item.price * item.quantity}</li></ul>`;
      })
      .join("");

    try {
      await sendMailInvoice(
        user.email,
        user.firstName,
        email,
        checkOrder.totalPrice
      );
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: "error occured while sending" });
    }

    return res.status(200).json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
