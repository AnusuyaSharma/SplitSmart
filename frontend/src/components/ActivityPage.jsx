import React, { useEffect, useState } from 'react'
import { BASE_URL } from '../../utils/constants';
import axios from 'axios';

const ActivityPage = () => {
    const [activities, setActivities] = useState([]);
    const [isLoading, setLoading] = useState(true);

    const fetchAllActivities = async () => {
        try {
            const res = await axios.get(BASE_URL + "/activity", { withCredentials: true });
            setActivities(res.data.allActivities);
            setLoading(false);
        } catch (error) {
            console.log("Error fetching user activities");
        }
    }

    useEffect(() => {
        fetchAllActivities();
    }, []);

    const labels = activities.map((activity) => {
        const time = new Date(activity.createdAt).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
        });

        if (activity.type === "expense") {
            return {
                label: `${activity.paidBy} paid for ${activity.description}`,
                group: activity.groupName,
                amount: activity.amount,
                time,
            };
        } else {
            return {
                label: `${activity.fromName} settled up with ${activity.toName}`,
                group: activity.groupName,
                amount: activity.amount,
                time,
            };
        }
    });

    return (
        <div>
            <div className="border-b-2 border-b-[#001A28] px-4 pt-4 pb-2">
                <h1 className='text-xl font-semibold text-white'>Activity</h1>
                <p className="font-medium text-[#666054]">Recent activities</p>
            </div>

            <div className="px-4 pt-4 pb-2">
            <div className="mt-2 rounded-md border-2 border-[#001A28] bg-[#00111D]">
                {isLoading ? (
                    <p>Loading...</p>
                ) : labels.length > 0 ? (
                    labels.map((item, index) => ( 
                        <div key={index} className="flex justify-between items-center px-4 py-3 border-b border-[#001A28]">
                            <div>
                                <p className="text-white text-base font-bold">{item.label}</p>
                                <p className="text-[#666054] text-xs font-semibold">{item.group} • {item.time}</p>
                            </div>
                            <div>
                                <p className="text-white text-lg font-bold">₹{item.amount}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-[#666054] p-4">You have no activity</p>
                )}
            </div>
            </div>
        </div>
    );
}

export default ActivityPage;