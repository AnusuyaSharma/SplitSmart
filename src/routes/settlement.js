import express from "express";
import userAuth from "../middlewares/auth.js";
import Group from "../models/group.js";
import Expense from "../models/expense.js";
import Settlement from "../models/settlement.js";

const settlementRouter = express.Router();

settlementRouter.post("/settlement/settle", userAuth, async(req,res) => {
    try {
        const {from,to,groupId,amount,expenseIds}= req.body;
        const group = await Group.findOne({_id: groupId});
        if(!group){
            return res.status(404).send("Group not found!");
        }

        if((!group.members.includes(from) || !group.members.includes(to))){
            return res.status(400).send("Both users must be part of the group!");
        }

        if(from !== req.user._id.toString()){
            return res.status(400).send("Error settling another user's expense");
        }

        const expenses = await Expense.find({
            _id : {$in: expenseIds},
            groupId: groupId,
        });

        if(!expenses){
            return res.status(404).send("Error verifying the expenses!");
        }

        if(expenses.length !== expenseIds.length){
            return res.status(400).send("Some expenses are invalid or dont belong to this group!");
        }

        //To verify if "from" user actually has an updaid share in all expenses
        const allValidExpenses = expenses.filter((expense) => {
            const actualExpense = expense.splitAmong.find(e => e.user.toString() === from);
            return actualExpense && !actualExpense.isPaid;
        });

        if(allValidExpenses.length !== expenseIds.length){
            return res.status(400).send("Some of these expenses are paid!");
        }

        await Expense.updateMany(
            {_id: {$in: expenseIds}},
            {$set: {"splitAmong.$[actualExpense].isPaid": true}},  //actualExpense is the placeholder here
            {arrayFilters: [{"actualExpense.user": from}]}              //defining the placeholder
        );

        const settlement = new Settlement({
            from,
            to,
            groupId,
            amount,
            expenseIds
        });

        await settlement.save();

        return res.status(200).send("Expenses settled!");
    } catch (error) {
        return res.status(400).send("Error settling expenses!");
    }
})

settlementRouter.get("/settlement/group/:groupId", userAuth, async(req,res) => {
    try {
        const {groupId} = req.params;
        if(!groupId){
            return res.status(404).send("Group not found!");
        }
        const group = await Group.findOne({_id: groupId});
        const currentUser = req.user._id;
        if(!group.members.includes(currentUser)){
            return res.status(400).send("Logged in user is not a part of this group!");
        }
        const allExpenses = await Expense.find({
            groupId: groupId,
            "splitAmong.isPaid": false
        });
        const rawDebts = [];

        for(const expense of allExpenses){
            for(const split of expense.splitAmong){
                if(!split.isPaid && split.user.toString() !== expense.paidBy.toString()){            //the paidBy is also a member of splitAmong so need to skip that user
                    rawDebts.push({
                        from: split.user.toString(),
                        to: expense.paidBy.toString(),         
                        amount: split.share
                    })
                }
            }
        }

         const debtMap = {};
        for(const debt of rawDebts){
            const key = `${debt.from}__${debt.to}`;

            debtMap[key] = (debtMap[key] || 0) + debt.amount;
        }

        //Now, need to net out reverse pairs in debtMap ie. A->B and B->A should be one transaction
        const balances = [];
        const seen = new Set();

        for(const key of Object.keys(debtMap)){
            if (seen.has(key)) continue;

            const [from,to] = key.split("__");
            const reverseKey = `${to}__${from}`;

            const forwardAmount = debtMap[key];
            const reverseAmount = debtMap[reverseKey] || 0;

            const net = forwardAmount - reverseAmount;

            if(net > 0){
                balances.push({from,to,amount:net});
            }
            else if(net < 0){
                balances.push({from:to, to:from, amount: Math.abs(net)});
            }

            seen.add(key);
            seen.add(reverseKey);
        }

        const history = await Settlement.find({ groupId}).sort({ createdAt: -1});
        return res.status(200).json({
            message: "Successfully fetched the balances and history of settlements for this group!",
            balances,
            history
        });
    } catch (error) {
        return res.status(500).send("Error fetching net balances and history of all settlements of this group!");
    }
})

settlementRouter.get("/settlement/user", userAuth, async(req,res) => {
    try {
        const userId = req.user._id;
        const settlements = await Settlement.find({
            $or: [{from: userId},
                {to:userId}
            ]
        }).populate("from to", "name emailId");

        if(!settlements){
            return res.status(404).send("Could not find this settlement!");
        }

        return res.status(200).json({
            message: "Successfully fetched all settlements for this user",
            settlements
        });
    } catch (error) {
        return res.status(500).send("Error fetching user's settlements");
    }
})



export default settlementRouter;