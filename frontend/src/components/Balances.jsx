import React,{useEffect, useState} from 'react';
import { BASE_URL } from '../../utils/constants';
import axios from 'axios';
import { useSelector } from 'react-redux';
import getInitials from '../../utils/getInitials';


const Balances = () => {
    const[isLoading, setLoading] = useState(true);
    const[getUserBalances, setGetUserBalances] = useState("");
    const user = useSelector((store) => store.user);

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

        <div className="mt-4 px-6">
    <h3 className="text-[#C3B09B] font-bold text-md">OUTSTANDING</h3>
    {isLoading ? (<p className="px-4 pt-4 pb-2 mt-4">Loading...</p>) : (
        <div className="mt-2 rounded-md border-2 border-[#001A28] bg-[#00111D] px-4 py-2">
        {getUserBalances.balances && getUserBalances.balances.length > 0 ? (
            getUserBalances.balances.map((b) => {
                const iOwe = b.from === user._id;
                return (
                    <div key={b.from + b.to} className="flex items-center justify-between py-3 border-b border-[#001A28] last:border-0">
                        <div className="flex items-center gap-3">
                            <div className="avatar placeholder">
                                <div className="bg-neutral text-neutral-content rounded-full flex items-center justify-center w-10">
                                    <span>{iOwe ? getInitials(b.toName) : getInitials(b.fromName)}</span>
                                </div>
                            </div>
                            <p className="text-lg font-semibold">
                                {iOwe ? `You owe ${b.toName}` : `${b.fromName} owes you`}
                            </p>
                        </div>
                        <div className="flex items-center gap-3 text-xl">
                            <p className={`font-bold ${iOwe ? "text-red-400" : "text-green-400"}`}>
                                ₹{b.amount}
                            </p>
                        </div>
                    </div>
                );
            })
        ) : (
            <p>You have 0 balances.</p>
        )}
    </div>
    )}
        </div>
    </div>
  )
}

export default Balances