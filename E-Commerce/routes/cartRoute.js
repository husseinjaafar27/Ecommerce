const express = require("express");
const router = express.Router();

const { addToCart, checkAvailability, removeFromCart, checkOutCart } = require("../controllers/cartController");
const { isAdmin } = require("../middlewares/authMiddleware");
const { protect } = require("../middlewares/jwtMiddleware");

router.post("/addToCart",protect, addToCart);
router.post("/removeFromCart",protect, removeFromCart);
router.get("/checkAvailability",protect, checkAvailability);
router.get("/checkOutCart",protect, checkOutCart);

module.exports = router;
