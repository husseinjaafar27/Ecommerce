const express = require("express");
const router = express.Router();

const {
  orderStatus,
  createOrder,
  cancelOrder,
  markOrderCompleted,
  updateOrder,
  emailInvoice,
} = require("../controllers/orderController");
const { isAdmin } = require("../middlewares/authMiddleware");
const { protect } = require("../middlewares/jwtMiddleware");

router.post("/create", protect, createOrder);
router.patch("/update/:id", protect, updateOrder);
router.delete("/cancel/:id", protect, cancelOrder);
router.patch("/orderCompleted/:id", protect, markOrderCompleted);

router.patch("/orderStatus/:id", protect, isAdmin, orderStatus);
router.post("/emailInvoice/:id", protect, isAdmin, emailInvoice);

module.exports = router;
