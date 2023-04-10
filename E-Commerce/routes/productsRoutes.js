const express = require("express");
const router = express.Router();
const ProductController = require("../controllers/productsController");
const { isAdmin } = require("../middlewares/authMiddleware");
const { protect } = require("../middlewares/jwtMiddleware");

router.post("/addProduct",protect,isAdmin, ProductController.createProduct);
router.get("/getProducts", ProductController.getAllProducts);
router.patch("/:id/updateProduct",protect,isAdmin, ProductController.updateProduct);
router.delete("/:id/deleteProduct",protect,isAdmin, ProductController.deleteProduct);
router.get("/filterItem", ProductController.filterItem);

router.post("/createManyProducts",protect,isAdmin, ProductController.createMany);

module.exports = router;
