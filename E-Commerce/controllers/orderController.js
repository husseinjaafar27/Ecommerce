const Order = require("../models/orderModel");
const User = require("../models/userModel");
const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const { sendMailInvoice } = require("../utils/sendGrid-email");
const mongoose = require("mongoose");

exports.createOrder = async (req, res) => {
  try {
    const { details, phone, city } = req.body;
    if (!details || !phone || !city) {
      return res.status(400).json({ message: "All fields are required" });
    }
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
    if (order.status === "shipped") {
      return res.status(400).json({ message: "Order already shipped" });
    }
    if (order.status === "delivered") {
      return res.status(400).json({ message: "Order already delivered" });
    }
    if (order.isVisible === false) {
      return res.status(400).json({ message: "Order is deleted" });
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
    if (!id) {
      return res.status(400).json({ message: "The order ID is required" });
    }
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
    if (order.isVisible === false) {
      return res.status(400).json({ message: "Order is deleted" });
    }
    order.isVisible = false;
    await order.save();

    await Cart.deleteOne({ cartOwner: req.user._id });

    return res.status(200).json({
      message: "order cancelled successfully",
    });
  } catch (err) {
    console.log(err);
  }
};

// If the client complete his order,  he can't update it again
exports.markOrderCompleted = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ message: "The order ID is required" });
    }
    const checkOrder = await Order.findById(id).session(session);
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
    ).session(session);

    for (const item of order.cartItems) {
      const product = await Product.findById(item.product).session(session);
      if (product.quantity < item.quantity) {
        await session.abortTransaction();
        session.endSession();
        return res
          .status(409)
          .json({ message: "Sorry we don't have the requested quantity" });
      }
      order.status = "completed";
      product.quantity -= item.quantity;
      product.soldQuantity += item.quantity;
      await product.save();
      await order.save();
    }
    await Cart.deleteOne({ cartOwner: req.user.id }).session(session);
    await session.commitTransaction();
    session.endSession();
    return res.status(200).json({ message: "Order completed" });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.log(err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

//  Update Order Status by admin
exports.orderStatus = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ message: "The order ID is required" });
    }
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
    if (!req.params.id) {
      return res.status(400).json({ message: "The order ID is required" });
    }
    const checkOrder = await Order.findById(req.params.id).populate(
      "cartItems",
      "products"
    );
    if (!checkOrder) {
      return res.status(404).json({ message: "Order not exist" });
    }
    if (checkOrder.status !== "shipped") {
      return res.status(400).json({ message: "Order is not shipped" });
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
        return `<ul>
                  <li>
                    Product: ${item.product} | Quantity: ${item.quantity} | Price: ${item.price}/pc
                  </li>
                </ul>`;
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
