import React from 'react'
import { LuWallet } from "react-icons/lu";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { addUser } from '../../utils/userSlice';
import { BASE_URL } from '../../utils/constants';

const Login = () => {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error,setError] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch()

  const handleLoginSubmit = async() => {
    setError("");
    try {
      const response = await axios.post(BASE_URL + "/login",{
        emailId: email,
        password
      },{
        withCredentials:true
      });

      const data = response.data;
      dispatch(addUser(data.user));
      navigate("/");
    } catch (error) {
      setError("Login failed!");
    }
  }
  return (
    <div>
        <div className="bg-base-300 login-page flex flex-col items-center min-h-screen justify-center">
          <div className="flex align-center gap-2 items-center mb-10">
            <LuWallet size={34} color="#AAE502"/>
            <h1 className="font-bold text-4xl">SplitSmart</h1>
          </div>
          <div className="text-center mb-10">
            <h3 className="text-white text-xl">Welcome Back</h3>
            <p>Log in to see your groups and balances</p>
          </div>
          <div className="flex flex-col align-center gap-2  mb-10">
            <p className="text-left">Email</p>
            <input type="text" placeholder="enter email here..." className="input w-120 bg-transparent"  value={email} onChange={(e) => setEmail(e.target.value) } />
            <p>Password</p>
            <input type="password" placeholder="enter password here..." className="input w-120 bg-transparent" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type='submit' className="bg-transparent border-2 border-[#5E5E5E] rounded-sm text-white p-2 mt-2 cursor-pointer" onClick={handleLoginSubmit}>Log in</button>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            <p className="text-center text-sm">Don't have an account? <span className="text-white cursor-pointer">Sign up</span></p>
          </div>
        </div>
    </div>
  )
}

export default Login