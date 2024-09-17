require("dotenv").config();
const express = require("express");
const cors = require("cors");

const { connectMongoDb } = require("./config/db");
const articlesRoutes = require("./routes/articleRoute");

const app = express();
const PORT = process.env.PORT;
const MONGO_URL = process.env.MONGO_URL;

app.use(cors());
app.use(express.json());
connectMongoDb(MONGO_URL);

app.get("/get", (req, res) => {
  res.status(200).json("Test Route for backend");
});

app.use("/article", articlesRoutes);

app.listen(PORT, () => {
  console.log("Listing at port: ", PORT);
});
