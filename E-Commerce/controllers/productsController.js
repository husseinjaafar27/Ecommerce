const Product = require("../models/productModel");

exports.createProduct = async (req, res) => {
  try {
    const {
      productName,
      description,
      quantity,
      image,
      price,
      category,
      // brand,
    } = req.body;
    if (
      !productName ||
      !description ||
      !quantity ||
      !image ||
      !price ||
      !category
      // !brand
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const checkProduct = await Product.findOne({ productName });
    if (checkProduct) {
      return res
        .status(400)
        .json({ message: "Product name is already in use" });
    }
    if (productName.length > 50) {
      return res
        .status(400)
        .json({ message: "Product name should be less than 50 letters" });
    }
    if (description.length > 2000) {
      return res
        .status(400)
        .json({ message: "Description should be less than 2000 letters" });
    }

    const newProduct = await Product.create({
      productName,
      description,
      quantity,
      image,
      price,
      category,
      // brand,
      userID: req.user._id,
    });
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
    return res.status(400).json({ message: "The product ID is required" });
  }
  const { productName, description, quantity, image, price, available } =
    req.body;
  const product = await Product.findById(id);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }
  const productN = await Product.findOne({ productName, _id: { $ne: id } });
  if (productName) {
    if (productN)
      return res
        .status(404)
        .json({ message: "Product name is already in use" });
  }

  try {
    const updateProduct = await Product.findByIdAndUpdate(
      id,
      {
        productName: productName || product.productName,
        description: description || product.description,
        quantity: quantity || product.quantity,
        image: image || product.image,
        price: price || product.price,
        available: available || product.available,
      },
      { new: true }
    );
    return res
      .status(200)
      .json({ message: "Product updated successfully", data: updateProduct });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const allProducts = await Product.find().sort({ createdAt: -1 });
    if (allProducts.length < 1) {
      return res.status(404).json({ message: "No products found" });
    }
    return res
      .status(201)
      .json({ message: "Products found", data: allProducts });
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

    if (quantity) filter.quantity = { $gte: quantity };

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
  if (!id) {
    return res.status(400).json({ message: "The product ID is required" });
  }
  try {
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.status(200).json({ message: "Product deleted successfully" });
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
