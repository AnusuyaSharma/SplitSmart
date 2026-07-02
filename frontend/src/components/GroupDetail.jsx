import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { BASE_URL } from '../../utils/constants';
import axios from 'axios';
import { FaPlus } from "react-icons/fa";
import getInitials from '../../utils/getInitials';
import { useSelector } from 'react-redux';
import AddExpenseModal from './addExpenseModal';
import { FaMicrophone } from "react-icons/fa";
import useVoiceExpense from '../customHooks/useVoiceExpense'; 

const GroupDetail = () => {

    const {groupId} = useParams();
    const [userGroup, setUserGroup] = useState("");
    const [groupExpenses, setGroupExpenses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [groupBalances, setGroupBalances] = useState([]);
    const [settleModal, setSettleModal] = useState(false);
    const user = useSelector((store) => store.user);
    const [addExpenseModal, setAddExpenseModal] = useState(false);
    const [prefill, setPrefill] = useState(null);

    const { status: voiceStatus, result: voiceResult, error: voiceError, startListening, reset: resetVoice } = useVoiceExpense();

    const fetchGroup = async () => {
        try {
            const res = await axios.get(BASE_URL + `/group/${groupId}`, {withCredentials: true});
            setUserGroup(res.data.group);
        } catch (error) {
            console.log("Error fetching group");
        }
    }

    const fetchGroupExpenses = async () => {
        try {
            const res = await axios.get(BASE_URL + `/expense/group/${groupId}`,{withCredentials:true});
            setGroupExpenses(res.data.expenses);
            setIsLoading(false);
        } catch (error) {
            console.log("Error fetching the group's expenses!");
        }
    }

    const fetchGroupBalances = async () => {
        try {
            const res = await axios.get(BASE_URL + `/balance/group/${groupId}`,{withCredentials:true});
            setGroupBalances(res.data.balances);
            setIsLoading(false);
        } catch (error) {
            console.log("Error fetching group's balances!");
        }
    }


    useEffect(() => {
        fetchGroup();
        fetchGroupExpenses();
        fetchGroupBalances();
    },[]);

    useEffect(() => {
        if (voiceStatus === 'done' && voiceResult) {
            setPrefill(voiceResult);
            setAddExpenseModal(true);
        }
    }, [voiceStatus, voiceResult]);

    const expenseItems = groupExpenses.map((expense) => {
        const myShare = expense.splitAmong.find(split => split.user._id === user._id);
        return {...expense, myShare};
    });
    
    const balanceItems = groupBalances.map((balance) => {
        if(balance.from === user._id){
            return{
                fromId: balance.from,
                toId: balance.to,
                name: balance.toName,
                label: `You owe ${balance.toName}`,
                amount: balance.amount,
                type: "Settle"
            }
        }
        else if(balance.to === user._id){
            return{
                fromId: balance.from,
                toId: balance.to,
                name: balance.fromName,
                label: `${balance.fromName} owes you`,
                amount: balance.amount,
                type: "Collect"
            }
        }
        else{
            return{
                fromId: balance.from,
                toId: balance.to,
                name: balance.fromName,
                label: `${balance.fromName} owes ${balance.toName}`,
                amount: balance.amount,
                type: "None"
            }
        }
    })

    const handleConfirmSettle = async () => {
        const { fromId, toId, type } = settleModal;
        const from = type === "Settle" ? user._id : fromId;
        const to   = type === "Settle" ? toId : user._id;
    
        const relevantExpenses = groupExpenses.filter(expense =>
            expense.paidBy._id === to &&
            expense.splitAmong.some(s => s.user._id === from && !s.isPaid)
        );
    
        const expenseIds = relevantExpenses.map(e => e._id);
        const amount = relevantExpenses.reduce((sum, e) => {
            const share = e.splitAmong.find(s => s.user._id === from);
            return sum + (share ? share.share : 0);
        }, 0);
    
        try {
            await axios.post(BASE_URL + "/settlement/settle",
                { from, to, groupId, amount, expenseIds },
                { withCredentials: true }
            );
            setSettleModal(null);
            fetchGroupBalances();
            fetchGroupExpenses();
        } catch(err) {
            console.log("Error settling!", err);
        }
    };

  return (
    <div>
        <div className="border-b-2 border-b-[#001A28] text-white flex items-center justify-between px-4 pt-4 pb-2">
        <h1 className='text-xl font-semibold'>{userGroup.name}</h1>
        <div className="flex gap-2 items-center">
            <button
                onClick={() => startListening(userGroup.members || [], user)}
                disabled={voiceStatus === 'listening' || voiceStatus === 'processing'}
                className={`text-white bg-transparent border border-[#414C51] rounded-md py-2 px-4 font-semibold cursor-pointer text-lg flex flex-row gap-2 items-center mb-2
                    ${voiceStatus === 'listening' ? 'border-red-500 text-red-400 animate-pulse' : ''}
                    ${voiceStatus === 'processing' ? 'border-yellow-500 text-yellow-400' : ''}
                `}
            >
                <FaMicrophone />
                {voiceStatus === 'listening' && 'Listening...'}
                {voiceStatus === 'processing' && 'Thinking...'}
                {(voiceStatus === 'idle' || voiceStatus === 'done' || voiceStatus === 'error') && 'Voice'}
            </button>

            <button onClick={() => setAddExpenseModal(true)} className="text-white bg-transparent border b-2 border-[#414C51] rounded-md py-2 px-4 font-semibold cursor-pointer text-lg flex flex-row gap-2 items-center mb-2">
                <FaPlus />Add Expense
            </button>
        </div>
        {/* <button onClick={() => setAddExpenseModal(true)} className="text-white bg-transparent border b-2 border-[#414C51] rounded-md py-2 px-4 font-semibold cursor-pointer text-lg flex flex-row gap-2 items-center mb-2"><FaPlus />Add Expense</button> */}
        </div>
        {voiceError && (
            <p className="text-red-400 text-sm px-4 py-2">{voiceError}</p>
        )}
        <div className="flex gap-2 px-4 pt-4 pb-2 text-base font-bold flex-row items-center">
            {userGroup?.members?.map((member) => (
                <div className="rounded-full flex flex-row items-center bg-[#003843] w-12 h-12 justify-center" key={member._id}>{getInitials(member.name)}</div>
            ))}
            <div className="font-medium text-[#5F7284]">
            {userGroup?.members?.map(member => member.name).join(", ")}
            </div>
        </div>

        {/* Group Balances list div */}
        <div className="px-4 pt-4 pb-2 mt-6">
        <h1 className='text-[#C3B09B] font-bold text-md'>BALANCES IN THIS GROUP</h1>
        {isLoading ? (
            <p>Loading...</p>
        ) : balanceItems.length > 0 ? (
            balanceItems.map((balance, idx) => (
                <div key={idx} className="mt-2 py-2 px-4 flex flex-row rounded-md border-2 justify-between border-[#001A28] bg-[#00111D]">
                    <div className="flex gap-2 items-center">
                        <p className="rounded-full flex flex-row items-center bg-[#003843] w-12 h-12 justify-center">{getInitials(balance.name)}</p>
                        <h4>{balance.label}</h4>
                    </div>
                    <div className="flex flex-row items-center gap-2">
                    <p className={`${balance.type === "Collect" ? "text-green-500" : "text-red-500"} font-bold text-lg`}>
                    ₹{balance.amount}
                    </p>
                    {balance.type !== "None" ? <button onClick={() => setSettleModal(balance)} className="text-white bg-transparent border b-2 border-[#414C51] rounded-md py-2 px-4 font-semibold cursor-pointer text-lg flex flex-row gap-2 items-center mb-2">{balance.type}</button> : ""}
                    </div>
                </div>
            ))
        ) : (
            <p>There are 0 balances in this group!</p>
        )}
    </div>
        
        {/* Expenses list div */}
        <div className="px-4 pt-4 pb-2 mt-6">
            <h1 className='text-[#C3B09B] font-bold text-md'>EXPENSES</h1>
            {isLoading ? <p>Loading...</p> : (
                <div>
                {expenseItems && expenseItems.length> 0 ? (
                    expenseItems.map((expense) => (
                        <div key={expense._id} className="bg-base-200 border-2 border-[#414C51] p-3 rounded-md mt-3 flex flex-row justify-between">
                            <div className="flex flex-col">
                                <h4 className="text-xl font-bold">{expense.description}</h4>
                                <p className="text-base font-medium text-[#C3B09B]">Paid by {expense.paidBy.name} | {expense.splitAmong.length} people</p>
                            </div>
                            <div className="flex flex-col">
                                <h2 className="text-xl font-bold">{expense.amount}</h2>
                                {expense.myShare && (<p className="text-base font-medium text-[#C3B09B]">Your share  ₹{expense.myShare.share}</p>)}
                            </div>
                        </div>
                    ))
                ) : (
                    <p>There are 0 expenses in this group!</p>
                )}
                </div>
            )}
        </div>

        {settleModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-[#00111D] border-2 border-[#001A28] rounded-md w-[380px] p-6 flex flex-col gap-4">
                <div>
                    <h2 className="text-lg font-semibold text-white">Settle up with {settleModal.name}</h2>
                    <p className="text-sm text-[#C3B09B] mt-1">Records a settlement and clears this balance.</p>
                </div>
                <div>
                    <p className="text-sm text-[#C3B09B] mb-1">Amount</p>
                    <div className="w-full bg-[#001A28] border border-[#414C51] rounded-md px-3 py-2 text-white text-sm">
                        ₹{settleModal.amount}
                    </div>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleConfirmSettle} className="flex-1 border-2 border-[#414C51] rounded-md py-2 text-white font-semibold cursor-pointer hover:border-[#C3B09B]">Confirm</button>
                    <button onClick={() => setSettleModal(null)} className="flex-1 border-2 border-[#414C51] rounded-md py-2 text-white font-semibold cursor-pointer hover:border-[#C3B09B]">Cancel</button>
                </div>
            </div>
        </div>
    )}

    {/* addExpenseModal */}
    {addExpenseModal && (
    <AddExpenseModal
        groupId={groupId}
        members={userGroup.members || []}
        prefill={prefill}
        onClose={() => {setAddExpenseModal(false);
                    setPrefill(null);
                resetVoice();
        }}
        onSuccess={() => {
        fetchGroupExpenses();
        fetchGroupBalances();
        setAddExpenseModal(false);
        setPrefill(null);
        resetVoice();
        }}
    />
    )}
    </div>
  )
}

export default GroupDetail