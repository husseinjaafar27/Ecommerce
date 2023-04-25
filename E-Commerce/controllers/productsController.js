const User = require("../models/userModel");
const Product = require("../models/productModel");

exports.createProduct = async (req, res) => {
  try {
    const newProduct = await Product.create({
      productName: req.body.productName,
      description: req.body.description,
      quantity: req.body.quantity,
      image: req.body.image,
      price: req.body.price,
      category: req.body.category,
      brand: req.body.brand,
      available: req.body.available,
      userID: req.user._id,
    });
    // newProduct.productID = newProduct._id;
    await newProduct.save();
    return res
      .status(201)
      .json({ message: "Product created", data: newProduct });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(404).json({ message: "The product ID is required" });
  }

  try {
    const updateProduct = await Product.findByIdAndUpdate(
      id,
      {
        productName: req.body.productName,
        description: req.body.description,
        quantity: req.body.quantity,
        image: req.body.image,
        price: req.body.price,
        available: req.body.available,
      },
      { new: true }
    );
    if (!updateProduct) {
      return res.status(404).json({ message: "The product does not exist" });
    }
    return res
      .status(200)
      .json({ message: "Product updated susseffuly", data: updateProduct });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const allProducts = await Product.find();
    return res
      .status(201)
      .json({ message: "Product found", data: allProducts });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

exports.filterItem = async (req, res) => {
  try {
    const { category, price, quantity } = req.body;
    let filter = {};

    if (category && category.length > 0) filter.category = category;

    if (price && price.length)
      filter.price = { $gte: price[0], $lte: price[1] };

    if (quantity && quantity.length) filter.quantity = { $gte: quantity };

    const products = await Product.find(filter);
    if (products.length <= 0) {
      return res.status(404).json("product not found");
    }
    return res.status(200).json({
      products,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    await Product.findByIdAndDelete(id);
    return res.status(200).json({ message: "Product deleted successully" });
  } catch (error) {
    return res.status(400).send(error.message);
  }
};

exports.createMany = async (req, res) => {
  try {
    const manyProducts = await Product.insertMany(req.body, { ordered: true });

    return res
      .status(201)
      .json({ message: "Products created successfuly", data: manyProducts });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};
