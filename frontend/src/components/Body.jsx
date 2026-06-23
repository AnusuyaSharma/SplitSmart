import React, { useEffect } from 'react';
import Sidebar from "./Sidebar.jsx";
import { Outlet } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { addUser } from '../../utils/userSlice.js';
import { BASE_URL } from '../../utils/constants.js';
import { useSelector } from 'react-redux';

const Body = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((store) => store.user);


  useEffect(() =>{
    const fetchUser = async() => {
      if(user) return;
      try {
        const res = await axios.get(BASE_URL + "/profile/view",{
          withCredentials: true
        });
        dispatch(addUser(res.data));
      } catch (error) {
        if(error.status === 401){
          navigate("/login");
        }
        console.error(error);
      }
    }
    fetchUser();
  }, []);

  return (
    <div className="drawer lg:drawer-open">
    <input id="my-drawer-1" type="checkbox" className="drawer-toggle" />

    <div className="drawer-content bg-base-300">
      <Outlet />
    </div>

    <Sidebar />
  </div>
  )
}

export default Body