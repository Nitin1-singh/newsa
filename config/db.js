const mongoose = require("mongoose");

// const MONGO_URL =
//   "mongodb+srv://nitinforcoding:jNn1i3PIvF70xZfe@cluster0.qsuya.mongodb.net/";
async function connectMongoDb(MONGO_URL) {
  try {
    await mongoose.connect(MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB Connection Success");
  } catch (e) {
    console.log("Mongoose Error", e);
  }
}
module.exports = { connectMongoDb };
