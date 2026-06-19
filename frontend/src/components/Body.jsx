import React from 'react';
import Sidebar from "./Sidebar.jsx";
import { Outlet } from 'react-router-dom';

const Body = () => {
  return (
    <div>
    <Sidebar />
    <Outlet />
    </div>
  )
}

export default Body