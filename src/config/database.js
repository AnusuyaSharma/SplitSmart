import mongoose from "mongoose";

const connectDB = async () => {
    await mongoose.connect("mongodb+srv://anusuya23100_db_user:3gzfAXBMeqH48Thx@splitsmart.npzsrii.mongodb.net/SplitSmart");
};

export default connectDB;
