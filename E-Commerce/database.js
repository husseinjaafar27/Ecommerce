const mongoose = require("mongoose");
const dotenv = require("dotenv");
mongoose.set('strictQuery', true)
dotenv.config();

exports.connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URL, () => {
      console.log("Connected to database");
    });
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};
