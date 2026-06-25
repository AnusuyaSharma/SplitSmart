import React, { useState } from 'react';
import { FaPlus } from "react-icons/fa";
import axios from 'axios';
import { GROUP_TYPE } from '../../utils/constants';
import GroupList from './GroupList';
import { BASE_URL } from '../../utils/constants';
import { FaTimes } from "react-icons/fa";
import { useDispatch } from 'react-redux';
import { addGroup } from '../../utils/groupSlice';

const Groups = () => {
   
    const [showAddGroupModal, setShowAddGroupModal] = useState(false);
    const [editNewGroupForm, setEditNewGroupForm] = useState({name: '', members: [], type: 'Other'});
    const [memberToAdd, setMemberToAdd] = useState('');
    const [error, setError] = useState("");

    const dispatch = useDispatch();

    const handleAddMembers = () => {
        const trimmedEmail = memberToAdd.trim();
        if(!trimmedEmail) return;
        if(editNewGroupForm.members.includes(trimmedEmail)){
            setError("This member is already added!");
            return;
        }
        setEditNewGroupForm(prev => ({...prev, members: [...prev.members, trimmedEmail]}));
        setMemberToAdd("");
        setError("");
    }

    const handleCreateNewGroup = async () => {
        if(!editNewGroupForm.name.trim()){
            setError("Group name is required!");
            return;
        }
        try {
            const payload = {
                name: editNewGroupForm.name,
                members: editNewGroupForm.members,
                type: editNewGroupForm.type
            };

            const res = await axios.post(BASE_URL + "/group/create", payload, {withCredentials: true});
            dispatch(addGroup(res.data));
            setEditNewGroupForm("");
            setError("");
            setShowAddGroupModal(false);
        } catch (error) {
            console.log("Error:",error);
            setError("Error creating group!");
        }
    }

    const handleRemoveMember = (email) => {
        setEditNewGroupForm(prev => ({
            ...prev,
            members: prev.members.filter(m => m !== email)
        }));
    };


  return (
    <div>
    
    <div className="border-b-2 border-b-[#001A28] text-white flex items-center justify-between px-4 pt-4 pb-2">
    <h1 className='text-xl font-semibold'>Groups</h1>
    <button onClick={() => setShowAddGroupModal(prev => !prev)} className="text-white bg-transparent border b-2 border-[#414C51] rounded-md py-2 px-4 font-semibold cursor-pointer text-lg flex flex-row gap-2 items-center mb-2"><FaPlus />New Group</button>
    </div>

    <GroupList />

    {showAddGroupModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-[#00111D] border-2 border-[#001A28] rounded-md w-[420px] p-6">
            <h2 className="text-lg font-semibold text-white mb-1">New Group</h2>
            <p className="text-sm text-[#C3B09B] mb-6">Create a new group.</p>

            <div className="flex flex-col gap-4">
                <div>
                <label className="text-sm text-[#C3B09B] mb-1 block">Group Name:</label>
                <input
                    type="text"
                    value={editNewGroupForm.name}
                    onChange={(e) => setEditNewGroupForm({ ...editNewGroupForm, name: e.target.value })}
                    className="w-full bg-[#001A28] border border-[#414C51] rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:border-[#C3B09B]"
                />
                </div>
                
                <div>
                <p className="text-sm text-[#C3B09B] mb-1 block">Type:</p>
                <div className="flex flex-row gap-2">
                {Object.entries(GROUP_TYPE).map(([label, { emoji }]) => (
                <button
                    key={label}
                    onClick={() => setEditNewGroupForm(prev => ({ ...prev, type: label }))}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium border cursor-pointer transition-colors
                        ${editNewGroupForm.type === label
                            ? 'border-[#C3B09B] text-[#C3B09B] font-bold bg-[#0E2C38]'
                            : 'border-[#414C51] text-white'
                        }`}
                >
                    {emoji} {label}
                </button>
                ))}
                </div>
                </div>


                <div>
                <label className="text-sm text-[#C3B09B] mb-1 block">Add Members:</label>
                <div className="flex flex-row gap-2">
                <input
                    type="text"
                    placeholder="Enter member email"
                    value={memberToAdd}
                    onChange={(e) => setMemberToAdd(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddMembers()}
                    className="w-full bg-[#001A28] border border-[#414C51] rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:border-[#C3B09B]"
                />
                <button onClick={handleAddMembers} className="text-white bg-transparent border b-2 border-[#414C51] rounded-md py-2 px-4 font-semibold cursor-pointer text-lg flex flex-row gap-2 items-center"><FaPlus />Add</button>
                </div>
                </div>    
            </div>

            {/* Member chips */}
            {editNewGroupForm.members.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                    {editNewGroupForm.members.map((member) => (
                        <span
                            key={member}
                            className="flex justify-center items-center gap-1 bg-[#001A28] border border-[#414C51] text-white text-xs rounded-full px-3 py-1"
                        >
                            {member}
                            <button
                                onClick={() => handleRemoveMember(member)}
                                className="text-[#C3B09B] hover:text-white cursor-pointer ml-1"
                            >
                                <FaTimes size={9} />
                            </button>
                        </span>
                    ))}
                </div>
            )}

            <div className="flex justify-center gap-3 mt-6">
                <button
                onClick={() => setShowAddGroupModal(false)}
                className="text-white bg-transparent border-2 border-[#414C51] rounded-md py-2 px-4 font-semibold cursor-pointer text-sm"
                >
                Cancel
                </button>
                <button
                onClick={handleCreateNewGroup}
                className="text-white bg-transparent border-2 border-[#414C51] rounded-md py-2 px-4 font-semibold cursor-pointer text-sm hover:border-[#C3B09B]"
                >
                Create group
                </button>
            </div>
            {error && (
                <p className="text-red-400 text-sm mt-2">{error}</p>
                )}
            </div>
        </div>
        )}
    </div>
  )
}

export default Groups