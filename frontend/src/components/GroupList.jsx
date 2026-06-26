import React, {useState } from 'react';
import { useSelector } from 'react-redux';
import useFetchGroups from '../customHooks/useFetchGroups';
import { useNavigate } from 'react-router-dom';

const GroupList = () => {
    const group = useSelector((store) => store.group);
    const navigate = useNavigate();

    const {isLoading} = useFetchGroups();

  return (
    <div><div className="px-4 pt-4 pb-2">
    {isLoading ? ( <p>Loading...</p> ) : 
    group?.length > 0 ? <div className="mt-2 rounded-md border-2 border-[#001A28] bg-[#00111D]">
        {group.map((group) => (
            <div onClick={() => navigate(`/group/${group.groupId}`)} key={group.groupId} className="p-4 flex flex-row justify-between cursor-pointer">
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