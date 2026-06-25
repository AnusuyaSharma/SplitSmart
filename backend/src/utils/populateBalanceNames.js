import User from "../models/user.js";

//To send names of "from" and "to" in Balances array
const populateBalanceNames = async(balances) => {
    const userIds = new Set();
    balances.forEach(b => {
        userIds.add(b.from),
        userIds.add(b.to)
    });


    const users = await User.find({_id: {$in:Array.from(userIds)}}, "name");

    const nameMap = {};
    users.forEach(u => {
        nameMap[u._id.toString()] = u.name;
    });

    return balances.map(b => ({
        from: b.from,
        fromName:  nameMap[b.from],
        to: b.to,
        toName: nameMap[b.to],
        amount: b.amount
    }));
}

export default populateBalanceNames;