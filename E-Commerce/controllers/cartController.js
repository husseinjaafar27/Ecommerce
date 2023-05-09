const Cart = require("../models/cartModel");
const User = require("../models/userModel");
const Product = require("../models//productModel");

exports.addToCart = async (req, res) => {
  try {
    const cartOwner = await User.findOne({ _id: req.user._id });
    if (!cartOwner) {
      return res.status(404).json({ message: "A cart should have an owner" });
    }
    if (!req.body.product) {
      return res.status(400).json({ message: "The product ID is required" });
    }
    const cart = await Cart.findOne({ cartOwner: cartOwner._id });
    const product = await Product.findOne({ _id: req.body.product });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.quantity < 1) {
      return res
        .status(409)
        .json({ message: "Sorry we dont have the requested quantity" });
    }

    if (!cart) {
      const newCart = await Cart.create({
        cartOwner: cartOwner._id,
        products: [
          {
            product: req.body.product,
            price: product.price,
          },
        ],
      });
      newCart.totalCartPrice += product.price;
      await newCart.save();
      return res.status(200).json({
        success: true,
        newCart,
      });
    }

    const productIndex = cart.products.findIndex(
      (item) => item.product.toString() === req.body.product
    );

    if (productIndex > -1) {
      if (product.quantity == cart.products[productIndex].quantity) {
        return res
          .status(409)
          .json({ message: "The requested quantity is not available" });
      }
      const cartItem = cart.products[productIndex];
      cartItem.quantity += 1;
      cart.products[productIndex] = cartItem;
    } else {
      cart.products.push({ product: req.body.product, price: product.price });
    }

    cart.totalCartPrice += product.price;
    cart.completed = true;
    await cart.save();
    return res.status(200).json({
      success: true,
      cart,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    if (!req.body.product) {
      return res.status(400).json({ message: "The product ID is required" });
    }
    const cart = await Cart.findOne({ cartOwner: req.user._id });
    const product = await Product.findById(req.body.product);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const productIndex = cart.products.findIndex(
      (item) => item.product.toString() === req.body.product
    );
    if (!cart.products[productIndex]) {
      return res
        .status(401)
        .json({ message: "The product is not exist in cart" });
    }
    if (productIndex > -1) {
      if (cart.products[productIndex].quantity > 1) {
        const cartItem = cart.products[productIndex];
        cartItem.quantity -= 1;
        cart.products[productIndex] = cartItem;
      } else {
        cart.products.splice(productIndex, 1);
      }
    }
    cart.totalCartPrice -= product.price;

    await cart.save();
    return res.status(201).json({
      success: true,
      message: "item removed from cart",
      data: cart,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.checkOutCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ cartOwner: req.user._id }).select(
      "products totalCartPrice"
    );
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    const user = req.user;
    const details = {
      fullName: user.fullName + " " + user.lastName,
      phoneNumber: user.phoneNumber,
      address: user.address,
    };
    return res.status(201).json({
      success: true,
      details,
      cart,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.checkAvailability = async (req, res) => {
  try {
    const Item = req.body.itemId;
    if (!Item) {
      return res.status(400).json({ message: "The product ID is required" });
    }
    const product = await Product.findById(Item);
    if (!product) {
      return res.status(401).json({ message: "Product not exist" });
    }
    return res.status(201).json({
      success: true,
      message: `Product is ${product.available ? "available" : "notAvailable"}`,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
