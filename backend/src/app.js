import "dotenv/config";
import express from "express";
import connectDB from "./config/database.js";
import authRouter from "./routes/auth.js";
import cookieParser from "cookie-parser";
import groupRouter from "./routes/group.js";
import expenseRouter from "./routes/expense.js";
import settlementRouter from "./routes/settlement.js";
import balanceRouter from "./routes/balance.js";
import cors from "cors";
import activityRouter from "./routes/activity.js";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin: process.env.CLIENT_ORIGIN,
        credentials: true
    })
);

app.use("/", authRouter, groupRouter, expenseRouter, settlementRouter, balanceRouter, activityRouter);

const PORT = process.env.PORT || 3000;

connectDB()
    .then(() => {
        console.log("Database connected!");
        app.listen(PORT, () => {
        console.log(`Server is listening on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Database cannot be connected" + error);
    })



