const express = require("express");
const router = express.Router();

const {
  createUser,
  ResetUserInfo,
  sortUserByDate,
  sortUserByMoneySpent,
  getUser,
  getAllUsers,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

const { isAdmin } = require("../middlewares/authMiddleware");
const { protect } = require("../middlewares/jwtMiddleware");

// routes
router.post("/create-user", protect, isAdmin, createUser);
router.patch("/Reset-user/:userId", protect, isAdmin, ResetUserInfo);
router.get("/sort-user-time", protect, isAdmin, sortUserByDate);
router.get("/sort-user-money", protect, isAdmin, sortUserByMoneySpent);

router.get("/getUser/:id", protect, getUser);
router.get("/getAllUsers", protect, isAdmin, getAllUsers);
router.patch("/updateUser", protect, updateUser);
router.delete("/deleteUser/:id", protect, isAdmin, deleteUser);

module.exports = router;
