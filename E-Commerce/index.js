const express = require("express");
const DB = require("./database").connectDB;
const app = express();

DB();

app.use(express.json());

port = process.env.PORT;
app.listen(port, () => {
  console.log(`listening on port: ${port}`);
});
