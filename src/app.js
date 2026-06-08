import express from "express";
import connectDB from "./config/database.js";
import authRouter from "./routes/auth.js";
import cookieParser from "cookie-parser";
import groupRouter from "./routes/group.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/", authRouter, groupRouter);

connectDB()
    .then(() => {
        console.log("Database connected!");
        app.listen(3000, () => {
        console.log("Server is listening on port 3000");
        });
    })
    .catch((error) => {
        console.error("Database cannot be connected" + error);
    })



