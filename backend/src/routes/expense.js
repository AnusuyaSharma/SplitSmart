import express from "express";
import userAuth from "../middlewares/auth.js";
import Group from "../models/group.js";
import Expense from "../models/expense.js";
import mongoose from "mongoose";

const expenseRouter = express.Router();

expenseRouter.post("/expense/add", userAuth, async(req,res) => {
    try {
        const {groupId, desc, amt, paidBy, splitAmong} = req.body;
        if(!groupId){
            return res.status(400).send("Invalid groupId");
        }
        if(!desc || !amt){
            return res.status(400).send("Description and Amount are required!");
        }
        if(!paidBy){
            return res.status(400).send("PaidBy user empty!");
        }
        if(!splitAmong || !Array.isArray(splitAmong)){
            return res.status(400).send("SplitAmong must be a non-empty array")
        }

        const group = await Group.findById(groupId);
        if(!group){
            return res.status(400).send("Group not found!");
        }

        if(!group.members.includes(paidBy)){
            return res.status(400).send("PaidBy user not member of the group!");
        }

        const groupmembers = splitAmong.map(u => u.user);
        const nonGroupMembers = groupmembers.filter((m) => !group.members.includes(m));
        if(nonGroupMembers.length > 0){
            return res.status(400).send("Some members are not part of the group!");
        }

        const totalShare = splitAmong.reduce((acc,curr) => acc+curr.share, 0);
        if(totalShare !== amt){
            return res.status(400).send("Shares must add upto total amount of expense!");
        }

        const expense = new Expense({
            groupId,
            description:desc,
            amount:amt,
            paidBy,
            splitAmong
        });
        await expense.save();
        res.status(200).json({
            message:"Expense added",
            expense
        });        
    } catch (error) {
        res.status(400).send("Error adding expense to the group!");
    }

});

expenseRouter.get("/expense/group/:groupId", userAuth, async(req,res) => {
    try {
        const {groupId} = req.params;

        if(!groupId){
            return res.status(400).send("Invalid groupId!");
        }

        const expenses = await Expense.find({groupId}).populate("paidBy","name").populate("splitAmong.user", "name").sort({createdAt:-1});

        res.status(200).json({
            message:"Successfully fetched all the expenses of this group",
            expenses
        });
    } catch (error) {
        res.status(400).send("Error fetching expenses of this group!");
    }
})

expenseRouter.get("/expense/unpaid", userAuth, async(req,res) => {
    try {
        const {groupId, to} = req.query;
        if(!groupId || !to){
            return res.status(400).send("groupId and to are required!");
        }

        const group = await Group.findById(groupId);
        if(!group){
            return res.status(404).send("Group not found!");
        }

        const from = req.user._id.toString();

        if(!group.members.includes(from) || !group.members.includes(to)){
            return res.status(400).send("Both users must be part of the group!");
        }

        const expenses = await Expense.find({
            groupId,
            paidBy: to,
            splitAmong: {$elemMatch: {user: from, isPaid: false}}
        }).sort({createdAt: -1});

        return res.status(200).json(expenses);
    } catch (error) {
        return res.status(400).send("Error fetching unpaid expenses!");
    }
})

expenseRouter.patch("/expense/:expenseId", userAuth, async(req,res) => {
    try {
        const {expenseId} = req.params;
        const ALLOWED_UPDATES = ["desc","amt","paidBy","splitAmong"];
        const requestedFields = Object.keys(req.body);                                  //created array of the keys of the object
        const isValidUpdate = requestedFields.every((field) => ALLOWED_UPDATES.includes(field));
        if(!isValidUpdate){
            return res.status(400).send("Invalid fields in update operation!");
        }
        const {desc,amt,paidBy,splitAmong } = req.body;
        if(desc !== undefined && !desc.trim()){
            return res.status(400).send("Description cannot be empty!");
        }

        if(amt !== undefined && (typeof amt !== "number" || amt <= 0)){
            return res.status(400).send("Amount must be a positive number");
        }

        // amt and splitAmong must be updated together, or not at all
        if((amt !== undefined) !== (splitAmong !== undefined)){
            return res.status(400).send("amt and splitAmong must be updated together!");
        }
        
        const expense = await Expense.findOne({_id:expenseId});

        if(!expense){
            return res.status(400).send("Expense doc not found!");
        }

        const group = await Group.findOne({_id: expense.groupId});
        if(!group){
            return res.status(400).send("Group not found!");
        }

        if(!group.members.includes(paidBy) && paidBy !== undefined){
            return res.status(400).send("PaidBy user not part of the group!");
        }

        if(splitAmong !== undefined){
            if(!Array.isArray(splitAmong) || splitAmong.length === 0){
                return res.status(400).send("SplitAmong must be a non-empty array!");
            }
            const invalidMembers = splitAmong.filter((m) => !group.members.includes(m.user));
            if(invalidMembers.length > 0){
                return res.status(400).send("Some SplitAmong members not part of this group!");
            }

            const totalShare = splitAmong.reduce((acc,curr) => acc+curr.share,0);
            if(totalShare !== amt){
                return res.status(400).send("Shares dont add upto total amount of expense!");
            }
        }
        const updatedExpense = await Expense.findByIdAndUpdate(
            expenseId,
            { description: desc, amount: amt, paidBy, splitAmong },
            { new: true }
        );

        return res.status(200).json({
            message:"Expense updated successfully!",
            updatedExpense
        });

    } catch (error) {
        return res.status(400).send("Error updating expense!");
    }
})

//For fetching a single expense
expenseRouter.get("/expense/:expenseId", userAuth, async(req,res) => {
    try {
        const {expenseId} = req.params;
        if(!mongoose.Types.ObjectId.isValid(expenseId)){
            return res.status(400).send("Invalid expense Id");
        }
        const expense = await Expense.findById(expenseId);
        if(!expense){
            return res.status(404).send("Could not find this expense!");
        }
        const isUserAuthorized = expense.splitAmong.some((user) => user.user.equals(req.user._id)) || expense.paidBy.equals(req.user._id);
        if(!isUserAuthorized){
            return res.status(400).send("User is not authorized to view this expense!");
        }
        return res.status(200).json({
            message:"Expense fetched successfully!",
            expense
        });
    } catch (error) {
        return res.status(500).send("Error fetching this expense!");
    }
})

expenseRouter.delete("/expense/:expenseId", userAuth, async (req,res) => {
    try {
        const {expenseId}  = req.params;
        const expense = await Expense.findOne({_id: expenseId});
        if(!expense){
            return res.status(400).send("Can't find the expense");
        }

        const deleteDoc = await Expense.findByIdAndDelete(expenseId);
        return res.status(200).send("Successfully deleted the expense");
    } catch (error) {
        return res.status(400).send("Error deleting the expense!");
    }
})

export default expenseRouter;
