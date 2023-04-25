const express = require("express");
const mongoose = require("mongoose");
const Stripe = require("stripe");
require("dotenv").config();
const { v4: uuidv4 } = require("uuid");
const stripe = Stripe(process.env.SECRET_KEY);
const { protect } = require("../middlewares/jwtMiddleware");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const router = express.Router();

router.post("/payment", protect, async (req, res) => {
  const { amount, token } = req.body;
  const idempontencyKey = uuidv4();
  // console.log(req.user);
  const order = await Order.findOne({ orderOwner: req.user.id });

  return stripe.customers
    .create({
      email: req.user.email,
      source: "tok_visa",
    })
    .then((customer) => {
      stripe.charges.create(
        {
          amount: order.totalPrice,
          currency: "usd",
          customer: customer.id,
          receipt_email: req.user.email,
          description: `purphase of {order.cartItems}`,
          // shipping: {
          //   name: token.card.name,
          //   address: {
          //     country: token.card.address_country,
          //   },
          // },
        },
        { idempontencyKey: idempontencyKey }
      );
    })
    .then((result) => res.status(200).json(result))
    .catch((err) => res.json(err));
});

module.exports = router;
