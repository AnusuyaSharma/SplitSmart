import express from "express";
import userAuth from "../middlewares/auth.js";
import Group from "../models/group.js";
import getGroupBalances from "../utils/calculateBalance.js";
import populateBalanceNames from "../utils/populateBalanceNames.js";

const balanceRouter = express.Router();

//To get balances of per group for the logged-in user. 
balanceRouter.get("/balance/user/groups", userAuth, async(req,res) => {
    try {
        const currentUser = req.user._id;

        const userGroups = await Group.find({members: currentUser});

        const groupBalances = await Promise.all(
            userGroups.map( async(group) => {
                const balances = await getGroupBalances(group._id);

                let net = 0;
                balances.forEach((balance) => {
                    if(balance.from.toString() === currentUser.toString()) net -= balance.amount;
                    if(balance.to.toString() === currentUser.toString()) net += balance.amount
                });

                return {
                    groupId: group._id,
                    groupName: group.name,
                    netBalance: net,
                    members: group.members.length
                }
            })
        )
        return res.status(200).json({
            message: "Successfully fetched all balances over groups for logged in user",
            groups: groupBalances
    });
    } catch (error) {
        return res.status(500).send(error);
    }
})


balanceRouter.get("/balance/group/:groupId", userAuth, async(req,res) => {
    try {
        const {groupId} = req.params;
        if(!groupId){
            return res.status(400).send("Invalid group Id");
        }

        const group = await Group.findById(groupId);
        if(!group){
            return res.status(404).send("Cant find this group!");
        }
        const isUserAuthorized = group.members.includes(req.user._id);
        if(!isUserAuthorized){
            return res.status(400).send("User not authorized to view balances");
        }
        const balances = await getGroupBalances(groupId);
        const populateBalances = await populateBalanceNames(balances);

        return res.status(200).json({
            message:"Successfully fetched balances of the group!",
            balances: populateBalances
        });
    } catch (error) {
        return res.status(500).send("Error fetching balances of this group!");
    }
})

balanceRouter.get("/balance/user", userAuth, async(req,res) =>{
    try {
        const currentUser = req.user._id;

        const userGroups = await Group.find({members: currentUser}, "_id");
        const groupIds = userGroups.map(group => group._id);

        const allBalances = await Promise.all(
            groupIds.map((id) => getGroupBalances(id))
        );

        const flatBalances = allBalances.flat();
        const myBalances = flatBalances.filter((balance) => 
            balance.from === currentUser.toString() || balance.to === currentUser.toString());

        const netBalanceMap = {};

        myBalances.forEach(b => {
            const iOwe = b.from === currentUser.toString();
            const friendId = iOwe ? b.to : b.from;
            netBalanceMap[friendId] = (netBalanceMap[friendId] || 0) + (iOwe ? b.amount : -b.amount);
        })

        const netBalances = Object.entries(netBalanceMap)
    .filter(([, amount]) => amount !== 0)
    .map(([friendId, amount]) =>
        amount > 0
            ? { from: currentUser.toString(), to: friendId, amount }
            : { from: friendId, to: currentUser.toString(), amount: -amount }
    );

    const populateBalances = await populateBalanceNames(netBalances);
    const totalOwed = netBalances.filter((balance) => balance.to === currentUser.toString()).reduce((sum,balance) => sum+balance.amount,0);
    const totalYouOwe = netBalances.filter((balance) => balance.from === currentUser.toString()).reduce((sum,balance) => sum+balance.amount,0);

        return res.status(200).json({
            message: "Successfully fetched all the balances of this user across all groups!",
            totalOwed,
            totalYouOwe,
            netBalance: totalOwed-totalYouOwe,
            balances:populateBalances
        });
    } catch (error) {
        return res.status(500).send("Error fetching balances for the user!");   
    }
})



export default balanceRouter;