import express from "express";
import userAuth from "../middlewares/auth.js";
import Group from "../models/group.js";
import Expense from "../models/expense.js";
import Settlement from "../models/settlement.js";
const activityRouter = express.Router();

activityRouter.get("/activity", userAuth, async (req,res) => {
    try {
        const currentUser = req.user._id;

        const userGroups = await Group.find({members: currentUser}).select("_id");
        if(!userGroups || userGroups.length === 0){
            return res.status(404).send("Logged in user is not a part of any group!");
        }

        const userGroupIds = userGroups.map((group) => group._id);

        const userExpenses = await Expense.find({groupId: {$in: userGroupIds}}).populate("paidBy", "name").populate("groupId", "name");

        const userSettlements = await Settlement.find({
            groupId: { $in: userGroupIds },
            $or: [
                {from: currentUser},
                {to: currentUser}
            ]
        }).populate("from to", "name").populate("groupId", "name");

        const expenseActivities = userExpenses.map((expense) => ({
            type: "expense",
            description: expense.description,
            amount: expense.amount,
            paidBy: expense.paidBy.name,
            groupName: expense.groupId.name,
            createdAt: expense.createdAt
        }));

        const settlementActivities = userSettlements.map((settlement) => ({
            type: "settlement",
            fromName: settlement.from.name,
            fromId: settlement.from._id,
            toName: settlement.to.name,
            groupName: settlement.groupId.name,
            toId: settlement.to._id,
            amount: settlement.amount,
            createdAt: settlement.createdAt
        }));

        const allActivities = [...expenseActivities, ...settlementActivities].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));

        return res.status(200).json({
            message: "Successfully fetched user's activity!",
            allActivities});
    } catch (error) {
        return res.status(500).send("Error fetching user's activity!");
    }
})

export default activityRouter;

