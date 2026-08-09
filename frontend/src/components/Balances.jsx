import React,{useEffect, useState} from 'react';
import { BASE_URL } from '../../utils/constants';
import axios from 'axios';
import OutstandingBalances from './OutstandingBalances';


const Balances = () => {
    const[isLoading, setLoading] = useState(true);
    const[getUserBalances, setGetUserBalances] = useState("");

    const getBalances = async() => {
        try {
            const res = await axios.get(BASE_URL + "/balance/user", {withCredentials:true});
            setGetUserBalances(res.data);
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
        <h1 className='text-xl font-semibold'>Balances</h1>
        </div>

        {isLoading ? (<p className="px-4 pt-4 pb-2 mt-4">Loading...</p>) : (<div className="px-4 pt-4 pb-2 mt-4 flex gap-4 w-full">
      <div className="card card-border bg-base-100 flex-1">
        <div className="card-body">
          <h2 className="card-title text-[#C3B09B]">Total owed to you</h2>
          <p className="text-[#06be65] text-3xl font-bold">₹{getUserBalances.totalOwed}</p>
        </div>
      </div>

      <div className="card card-border bg-base-100 flex-1">
        <div className="card-body">
          <h2 className="card-title text-[#C3B09B]">Total you owe</h2>
          <p className="text-3xl font-bold text-red-600">₹{getUserBalances.totalYouOwe}</p>
        </div>
      </div>
        </div>)}

        <OutstandingBalances />
    </div>
  )
}

export default Balances
