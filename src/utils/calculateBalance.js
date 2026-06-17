import Expense from "../models/expense.js";

const getGroupBalances = async(groupId) => {
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
    
    return balances;
}

export default getGroupBalances;