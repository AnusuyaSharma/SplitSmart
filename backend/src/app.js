import express from "express";
import connectDB from "./config/database.js";
import authRouter from "./routes/auth.js";
import cookieParser from "cookie-parser";
import groupRouter from "./routes/group.js";
import expenseRouter from "./routes/expense.js";
import settlementRouter from "./routes/settlement.js";
import balanceRouter from "./routes/balance.js";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin:"http://localhost:5173",
        credentials: true
    })
);

app.use("/", authRouter, groupRouter, expenseRouter, settlementRouter, balanceRouter);

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



