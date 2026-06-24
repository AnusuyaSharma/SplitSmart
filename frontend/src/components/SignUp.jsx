import React, { useState } from 'react';
import { LuWallet } from "react-icons/lu";
import { BASE_URL } from '../../utils/constants';
import axios from "axios";
import {useNavigate} from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addUser } from '../../utils/userSlice';

const SignUp = () => {

  const [email, setEmail] = useState("");
  const [name,setName] = useState("");
  const [password, setPassword] = useState("");
  const [error,setError] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSignUp = async () => {
    setError("");
    try {
      const res = await axios.post(BASE_URL + "/signup", {
        name,
        emailId: email,
        password
      },
        {withCredentials: true});
      dispatch(addUser(res.data));
      navigate("/");
    } catch (error) {
      console.log(error);
      setError("SignUp failed!");
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
            <h3 className="text-white text-xl">Create your account</h3>
            <p>Start splitting expenses with friends.</p>
          </div>
          <div className="flex flex-col align-center gap-2  mb-10">
          <p className="text-left">Full Name</p>
          <input type="text" placeholder="enter name here..." className="input w-120 bg-transparent"  value={name} onChange={(e) => setName(e.target.value) } />
            <p className="text-left">Email</p>
            <input type="text" placeholder="enter email here..." className="input w-120 bg-transparent"  value={email} onChange={(e) => setEmail(e.target.value) } />
            <p>Password</p>
            <input type="password" placeholder="enter password here..." className="input w-120 bg-transparent" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type='submit' className="bg-transparent border-2 border-[#5E5E5E] rounded-sm text-white p-2 mt-2 cursor-pointer" onClick={handleSignUp}>Create Account</button>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            <p className="text-center text-sm">Already have an account? <span onClick={() => navigate("/login")} className="text-white cursor-pointer">Log In</span></p>
          </div>
        </div>
    </div>
  )
}

export default SignUp