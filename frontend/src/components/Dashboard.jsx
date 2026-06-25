import React, { useEffect, useState } from 'react';
import { FaPlus } from "react-icons/fa";
import axios from 'axios';
import { BASE_URL } from '../../utils/constants';
import { useNavigate } from 'react-router-dom';
import GroupList from './GroupList';
import { getBalanceSign } from '../../utils/getBalanceSign';

const Dashboard = () => {

  const navigate = useNavigate();

  const [getUserBalance, setGetUserBalance] = useState("");
  const [isLoading, setLoading] = useState(true);

  const getBalances =  async () => {
    try {
    const res = await axios.get(BASE_URL + "/balance/user",{withCredentials: true});    
    setGetUserBalance(res.data);
    setLoading(false);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    getBalances()
  }, []);
  

  return (
    <div>
    <div className="border-b-2 border-b-[#001A28] text-white flex items-center justify-between px-4 pt-4 pb-2">
    <h1 className='text-xl font-semibold'>Dashboard</h1>
    <button className="text-white bg-transparent border b-2 border-[#414C51] rounded-md py-2 px-4 font-semibold cursor-pointer text-lg flex flex-row gap-2 items-center mb-2"><FaPlus />Add Expense</button>
    </div>

    {isLoading ? (<p className="px-4 pt-4 pb-2 mt-4">Loading...</p>) : (<div className="px-4 pt-4 pb-2 mt-4 flex gap-4 w-full">
      <div className="card card-border bg-base-100 flex-1">
        <div className="card-body">
          <h2 className="card-title text-[#C3B09B]">You're owed</h2>
          <p className="text-[#06be65] text-3xl font-bold">₹{getUserBalance.totalOwed}</p>
        </div>
      </div>

      <div className="card card-border bg-base-100 flex-1">
        <div className="card-body">
          <h2 className="card-title text-[#C3B09B]">You owe</h2>
          <p className="text-3xl font-bold text-red-600">₹{getUserBalance.totalYouOwe}</p>
        </div>
      </div>

      <div className="card card-border bg-base-100 flex-1">
        <div className="card-body">
          <h2 className="card-title text-[#C3B09B]">Total Balance</h2>
          <p className={`text-3xl font-bold ${
          getUserBalance.netBalance > 0 ? "text-[#06be65]" : 
          getUserBalance.netBalance < 0 ? "text-red-600" : ""
      }`}>
          {getBalanceSign(getUserBalance.netBalance)}₹{Math.abs(getUserBalance.netBalance)}
        </p>
        </div>
      </div>
    </div>)}

    <div className="mt-4 px-6 flex flex-row items-center justify-between">
      <h3 className="text-[#C3B09B] font-bold text-md">YOUR GROUPS</h3>
      <button onClick={() => navigate("/groups")} className="text-white bg-transparent border b-2 border-[#414C51] rounded-md py-2 px-4 font-semibold cursor-pointer text-lg">All Groups</button>
    </div>

    <GroupList />
    </div>
  )
}

export default Dashboard