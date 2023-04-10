const express = require("express");
const DB = require("./database").connectDB;
const app = express();

const authRoutes = require("./routes/authRoute");
const userRoutes = require("./routes/userRoute");
const productRoutes = require("./routes/productsRoutes");
DB();

app.use(express.json());

port = process.env.PORT || 4050;
app.listen(port, () => {
  console.log(`listening on port: ${port}`);
});

// routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/product", productRoutes);
