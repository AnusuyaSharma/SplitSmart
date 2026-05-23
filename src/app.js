import express from "express";
import connectDB from "./config/database.js";

const app = express();

connectDB()
    .then(() => {
        console.log("Database connected!");
        app.listen(3000, () => {
        console.log("Server is listening on port 3000");
        });
    })
    .catch(() => {
        console.error("Database cannot be connected");
    })



