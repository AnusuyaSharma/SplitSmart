import React from 'react';
import { LuWallet } from "react-icons/lu";
import { LuLayoutDashboard } from "react-icons/lu";
import { MdGroup } from "react-icons/md";
import { GiMoneyStack } from "react-icons/gi";
import { MdDoneOutline } from "react-icons/md";
import { MdAccessTime } from "react-icons/md";
import { useSelector } from 'react-redux';
import getInitials from '../../utils/getInitials';
import { useNavigate } from 'react-router-dom';


const Sidebar = () => {
  const user = useSelector((store) => store.user);
  const navigate = useNavigate();

  return (
    <div className="drawer-side">
      <label htmlFor="my-drawer-1" aria-label="close sidebar" className="drawer-overlay"></label>
      <div className="bg-base-200 min-h-full w-90 p-6 flex flex-col justify-between">
      <div>
      <div className="flex flex-row items-center gap-2 pl-2">
        <LuWallet size={20} color="#AAE502"/>
        <h1 className="font-bold text-xl">SplitSmart</h1>
        </div>
      
      <ul className="menu bg-base-200 cursor-pointer text-white mt-4 w-full p-0 text-base">
        {/* Sidebar content here */}
        <li onClick={() => navigate("/")} className="flex flex-row cursor-pointer border-2 rounded-md border-[#414C51] font-medium hover:bg-[#36454F] mt-2"><button><LuLayoutDashboard />Dashboard</button></li>
        <li onClick={() => navigate("/groups")} className="flex flex-row cursor-pointer border-2 rounded-md border-[#414C51] font-medium hover:bg-[#36454F] mt-2"><button className="p-2"><MdGroup />Groups</button></li>
        <li onClick={() => navigate("/balances")} className="flex flex-row cursor-pointer border-2 rounded-md border-[#414C51] font-medium hover:bg-[#36454F] mt-2"><button className="p-2"><GiMoneyStack />Balances</button></li>
        <li onClick={() => navigate("/settle")} className="flex flex-row cursor-pointer border-2 rounded-md border-[#414C51] font-medium hover:bg-[#36454F] mt-2"><button className="p-2"><MdDoneOutline />Settle Up</button></li>
        <li onClick={() => navigate("/activity")} className="flex flex-row cursor-pointer border-2 rounded-md border-[#414C51] font-medium hover:bg-[#36454F] mt-2"><button className="p-2"><MdAccessTime />Acitivity</button></li>
      </ul>
      </div>
      <div className="flex flex-row items-center gap-2 text-lg">
          <div className="bg-[#003843] rounded-full w-12 h-12 items-center flex justify-center cursor-pointer">{user?.name ? getInitials(user.name) : ''}</div>
          <p>{user?.name}</p>
        </div>
      </div>
    </div>
  )
}

export default Sidebar