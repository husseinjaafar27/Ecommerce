const express = require("express");
const router = express.Router();

const {
  signup,
  login,
  forgotPassword,
  validateUser,
  resetPassword,
} = require("../controllers/authController");
const { createAccountLimiter } = require("../middlewares/authMiddleware");

router.post("/signUp", signup);
router.get("/login", createAccountLimiter, login);
router.patch("/validateUser/:token", validateUser);

router.post("/forgotPassword", forgotPassword);
router.patch("/resetPassword/:token", resetPassword);

module.exports = router;
