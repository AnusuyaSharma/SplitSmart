import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../utils/constants';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { setGroups } from '../../utils/groupSlice';

const GroupList = () => {
    const [isLoading, setIsLoading] = useState(true);

    const dispatch = useDispatch();

    const group = useSelector((store) => store.group);

    const fetchAllGroupBalances =  async () => {
        try {
            const res = await axios.get(BASE_URL + "/balance/user/groups", {withCredentials: true});
            dispatch(setGroups(res.data.groups));       //No need of localstate, can directly put the fetched groups to redux and since already subscribing we get groups back too
            setIsLoading(false);
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        fetchAllGroupBalances()
    }, []);

  return (
    <div><div className="px-4 pt-4 pb-2">
    {isLoading ? ( <p>Loading...</p> ) : 
    group?.length > 0 ? <div className="mt-2 rounded-md border-2 border-[#001A28] bg-[#00111D]">
        {group.map((group) => (
            <div key={group.groupId} className="p-4 flex flex-row justify-between">
                <div>
                <h5 className="text-lg font-semibold">{group.groupName}</h5>
                <p className='text-[#C3B09B] text-base'>{group.members} members</p>
                </div>
                <div>
                {group.netBalance > 0 ? (
                    <button className="bg-[#002F2A] text-[#06be65] font-bold px-3 py-1 rounded-md">
                    +{group.netBalance}
                    </button>
                ) : group.netBalance < 0 ? (
                    <button className="bg-[#241A25] text-red-600 font-bold px-3 py-1 rounded-md">
                    {group.netBalance}
                    </button>
                ) : (
                    <button className="bg-[#19242B] text-white font-bold px-3 py-1 rounded-md">
                    Settled
                    </button>
                )}
                    
                </div>
            </div>
        ))}
    </div>
    : <p>You are a part of 0 groups at the moment.</p>}
    
        </div></div>
  )
}

export default GroupList