import React,{useEffect, useState} from 'react';
import { BASE_URL } from '../../utils/constants';
import axios from 'axios';
import { useSelector } from 'react-redux';
import getInitials from '../../utils/getInitials';
import Swal from 'sweetalert2';

const OutstandingBalances = () => {
    const[isLoading, setLoading] = useState(true);
    const[getUserBalances, setGetUserBalances] = useState("");
    const[settlingKey, setSettlingKey] = useState(null);
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

    const handleSettle = async(b) => {
        const iOwe = b.from === user._id;
        const confirmMsg = iOwe
            ? `Mark your ₹${b.amount} debt to ${b.toName} as settled across all shared groups?`
            : `Mark ${b.fromName}'s ₹${b.amount} debt to you as collected across all shared groups?`;

        const result = await Swal.fire({
            title: "Confirm Settlement",
            text: confirmMsg,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: iOwe ? "Settle" : "Collect",
            cancelButtonText: "Cancel",
            background: "#00111D",
            color: "#fff",
            confirmButtonColor: "#06be65",
            cancelButtonColor: "#414C51"
        });

        if(!result.isConfirmed) return;

        const key = b.from + b.to;
        setSettlingKey(key);
        try {
            await axios.post(BASE_URL + "/settlement/settle-user",
                { from: b.from, to: b.to },
                { withCredentials: true }
            );
            await getBalances();
            Swal.fire({
                icon: "success",
                title: "Settled!",
                timer: 1500,
                showConfirmButton: false,
                background: "#00111D",
                color: "#fff"
            });
        } catch (error) {
            console.log(error);
            Swal.fire({
                icon: "error",
                title: "Something went wrong",
                text: "Could not settle this balance. Please try again.",
                background: "#00111D",
                color: "#fff",
                confirmButtonColor: "#06be65"
            });
        } finally {
            setSettlingKey(null);
        }
    }

    useEffect(() => {
        getBalances()
      }, []);

  return (
    <div className="mt-4 px-6">
    <h3 className="text-[#C3B09B] font-bold text-md">OUTSTANDING BALANCES</h3>
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
                            <button
                                onClick={() => handleSettle(b)}
                                disabled={settlingKey === b.from + b.to}
                                className="text-white bg-transparent border border-[#414C51] rounded-md py-2 px-4 font-semibold cursor-pointer text-sm disabled:opacity-50 text-xl"
                            >
                                {settlingKey === b.from + b.to ? "..." : iOwe ? "Settle" : "Collect"}
                            </button>
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
  )
}

export default OutstandingBalances
