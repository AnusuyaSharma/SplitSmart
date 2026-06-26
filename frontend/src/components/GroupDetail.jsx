import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { BASE_URL } from '../../utils/constants';
import axios from 'axios';
import { FaPlus } from "react-icons/fa";
import getInitials from '../../utils/getInitials';
import { useSelector } from 'react-redux';

const GroupDetail = () => {

    const {groupId} = useParams();
    const [userGroup, setUserGroup] = useState("");
    const [groupExpenses, setGroupExpenses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const user = useSelector((store) => store.user);

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


    useEffect(() => {
        fetchGroup();
        fetchGroupExpenses();
    },[]);

    const expenseItems = groupExpenses.map((expense) => {
        const myShare = expense.splitAmong.find(split => split.user._id === user._id);
        return {...expense, myShare};
    })




  return (
    <div>
        <div className="border-b-2 border-b-[#001A28] text-white flex items-center justify-between px-4 pt-4 pb-2">
        <h1 className='text-xl font-semibold'>{userGroup.name}</h1>
        <button className="text-white bg-transparent border b-2 border-[#414C51] rounded-md py-2 px-4 font-semibold cursor-pointer text-lg flex flex-row gap-2 items-center mb-2"><FaPlus />Add Expense</button>
        </div>
        <div className="flex gap-2 px-4 pt-4 pb-2 text-base font-bold flex-row items-center">
            {userGroup?.members?.map((member) => (
                <div className="rounded-full flex flex-row items-center bg-[#003843] w-12 h-12 justify-center" key={member._id}>{getInitials(member.name)}</div>
            ))}
            <div className="font-medium text-[#5F7284]">
            {userGroup?.members?.map(member => member.name).join(", ")}
            </div>
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
    </div>
  )
}

export default GroupDetail