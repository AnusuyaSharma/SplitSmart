import React, {useState} from 'react';
import { useSelector } from 'react-redux';
import getInitials from '../../utils/getInitials';
import { BASE_URL } from '../../utils/constants';
import axios from 'axios';
import { addUser } from '../../utils/userSlice';
import { useDispatch } from 'react-redux';
import {useNavigate} from 'react-router-dom';

const Profile = () => {
    const user = useSelector((store) => store.user);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editForm, setEditForm] = useState({ name: user?.name || '', currentPassword: '', newPassword: '' });
    const [error, setError] = useState("");
    const [deleteModal, setDeleteModal] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();


    const handleEditSubmit = async () => {
        const payload = {};
        
        if(editForm.name && editForm.name.trim() !== user?.name){
            payload.name = editForm.name.trim()
        }


        if(editForm.newPassword && editForm.currentPassword){
            payload.currentPassword = editForm.currentPassword;
            payload.newPassword = editForm.newPassword;
        }

        if(!payload.name && !payload.newPassword){
            setShowEditModal(false);
            return;
        }

        try {
            const res = await axios.patch(BASE_URL + "/profile/edit",payload, {withCredentials: true});
            if(payload.name){
                dispatch(addUser({...user, name: payload.name}));
            }
            setEditForm({
                name: '',
                currentPassword: '',
                newPassword: ''
            });
            setShowEditModal(false);
        } catch (error) {
           setError(error?.response?.data);
        }
    } 
    
    const handleDeleteModal = async () =>{
        try {
            const res = await axios.delete(BASE_URL + "/profile/delete",{withCredentials: true});
            setDeleteModal(false);
            navigate("/login");
        } catch (error) {
            console.log(error);
        }
    }

    const handleLogout = async () => {
        try {
            await axios.post(BASE_URL + "/logout", {withCredentials:true});
            navigate("/login");
        } catch (error) {
            console.error("Error logging out");
        }
    }

  return (
    <div>
        <div className="border-b-2 border-b-[#001A28] pt-2 pb-2 pl-6 text-white">
        <h1 className='text-lg font-semibold'>Profile & Settings</h1>
        </div>
        <div className="flex flex-row items-center py-2 px-6 justify-between">
        <div className="flex flex-row items-center">
        <div className="bg-[#003843] rounded-full w-20 h-20 font-semibold text-2xl items-center flex justify-center cursor-pointer">{user?.name ? getInitials(user.name) : ''}</div>
          <div className="flex flex-col ml-4">
          <p className="text-lg font-medium">{user?.name}</p>
          <p className="text-sm text-[#C3B09B] font-normal">{user?.emailId}</p>
        </div>
        </div>
        <div>
            <button onClick={() => { setError(''); setShowEditModal(true); }} className="text-white bg-transparent border b-2 border-[#414C51] rounded-md py-2 px-4 font-semibold cursor-pointer text-lg">Edit Profile</button>
        </div>
        </div>
        <div className="mt-4 px-6">
            <h3 className="text-[#C3B09B] font-bold text-md">ACCOUNT</h3>
            <div className="mt-2 rounded-md border-2 border-[#001A28] bg-[#00111D]">
            <div className="border-b border-b-[#001A28] px-4 py-2 flex items-center justify-between">
                <h5 className="text-base font-semibold">Name</h5>
                <p className="font-medium">{user?.name}</p>
            </div>
            <div className="border-b border-b-[#001A28] px-4 py-2  flex items-center justify-between">
                <h5 className="text-base font-semibold">Email</h5>
                <p className="text-[#C3B09B]">{user?.emailId}</p>
            </div>
            
            </div>
        </div>
        <div className="mt-4 px-6">
            <h3 className="text-[#C3B09B] font-bold text-md">DELETE ACCOUNT</h3>
            <div className="mt-2 rounded-md border-2 border-[#001A28] bg-[#00111D]">
            <div className="border-b border-b-[#001A28] px-4 py-2 flex items-center justify-between">
                <h5 className="text-base font-semibold">Permanently removes your account and all data.</h5>
                <button onClick={() => setDeleteModal(prev => !prev)} className='text-white bg-transparent border-2 border-[#414C51] rounded-md py-2 px-4 font-semibold cursor-pointer text-lg'>DELETE</button>
            </div>            
            </div>
        </div>
        <div className="flex justify-center">
        <button onClick={handleLogout} className='text-justify text-white bg-transparent border-2 border-[#414C51] rounded-md mt-8 py-4 px-20 font-semibold cursor-pointer text-lg'>Log out</button>
        </div>
        {/* Edit Profile Modal */}
        {showEditModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-[#00111D] border-2 border-[#001A28] rounded-md w-[420px] p-6">
            <h2 className="text-lg font-semibold text-white mb-1">Edit Profile</h2>
            <p className="text-sm text-[#C3B09B] mb-6">Update your name or change your password.</p>

            <div className="flex flex-col gap-4">
                <div>
                <label className="text-sm text-[#C3B09B] mb-1 block">Name</label>
                <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full bg-[#001A28] border border-[#414C51] rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:border-[#C3B09B]"
                />
                </div>
                <div>
                <label className="text-sm text-[#C3B09B] mb-1 block">Current password</label>
                <input
                    type="password"
                    placeholder="Enter current password"
                    value={editForm.currentPassword}
                    onChange={(e) => setEditForm({ ...editForm, currentPassword: e.target.value })}
                    className="w-full bg-[#001A28] border border-[#414C51] rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:border-[#C3B09B]"
                />
                </div>
                <div>
                <label className="text-sm text-[#C3B09B] mb-1 block">New password</label>
                <input
                    type="password"
                    placeholder="Enter new password"
                    value={editForm.newPassword}
                    onChange={(e) => setEditForm({ ...editForm, newPassword: e.target.value })}
                    className="w-full bg-[#001A28] border border-[#414C51] rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:border-[#C3B09B]"
                />
                </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
                <button
                onClick={() => setShowEditModal(false)}
                className="text-white bg-transparent border-2 border-[#414C51] rounded-md py-2 px-4 font-semibold cursor-pointer text-sm"
                >
                Cancel
                </button>
                <button
                onClick={handleEditSubmit}
                className="text-white bg-transparent border-2 border-[#414C51] rounded-md py-2 px-4 font-semibold cursor-pointer text-sm hover:border-[#C3B09B]"
                >
                Save changes
                </button>
            </div>
            {error && (
                <p className="text-red-400 text-sm mt-2">{error}</p>
                )}
            </div>
        </div>
        )}
        {/* Delete Profile Modal */}
        {deleteModal && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-[#00111D] border-2 border-[#001A28] rounded-md w-[420px] p-6">
            <h2 className="text-lg font-semibold text-white mb-1">Delete Account</h2>
            <p className="text-sm text-[#C3B09B] mb-6">Are you sure you want to delete your account?</p>

            <div className="flex justify-end gap-3 mt-6">
                <button
                onClick={() => setDeleteModal(false)}
                className="text-white bg-transparent border-2 border-[#414C51] rounded-md py-2 px-4 font-semibold cursor-pointer text-sm"
                >
                Cancel
                </button>
                <button
                onClick={handleDeleteModal}
                className="text-white bg-transparent border-2 border-[#414C51] rounded-md py-2 px-4 font-semibold cursor-pointer text-sm hover:border-[#C3B09B]"
                >
                Delete
                </button>
            </div>
            </div>
        </div>
        )}
    </div>
  )
}

export default Profile