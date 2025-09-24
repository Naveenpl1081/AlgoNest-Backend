import mongoose from "mongoose";

const MONGO_URL = process.env.MONGO_URL;

const connectDb = async () => {
  try {
    if (!MONGO_URL) return;
    await mongoose.connect(MONGO_URL);
    console.log("mongoDB connected successfully");
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

export default connectDb;
