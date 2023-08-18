const mongoose = require("mongoose");

const connectDB = async function () {
  try {
    await mongoose.connect(process.env.mongoUrl);
    console.log("db connected");
  } catch (error) {
    console.log(error.message);
  }
};

connectDB();
