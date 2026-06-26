import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { BASE_URL } from '../../utils/constants';
import useFetchGroups from '../customHooks/useFetchGroups';

const SettleUp = () => {

    const [selectedGroupId, setSelectedGroupId] = useState('');
    const [selectedTo, setSelectedTo] = useState('');
    const [groupMembers, setGroupMembers] = useState([]);
    const [unpaidExpenses, setUnpaidExpenses] = useState([]);
    const [selectedExpenseIds, setSelectedExpenseIds] = useState([]);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const groups = useSelector(state => state.group) || [];   // fix: state.group not state.groups
    const loggedInUser = useSelector(state => state.user);

    useFetchGroups();

    // When group changes, fetch that group's members and reset everything below
    useEffect(() => {
        setSelectedTo('');
        setGroupMembers([]);
        setUnpaidExpenses([]);
        setSelectedExpenseIds([]);
        setError('');
        setSuccessMsg('');

        if (!selectedGroupId) return;

        fetchGroupMembers();
    }, [selectedGroupId]);

    // When "settle with" person changes, fetch unpaid expenses
    useEffect(() => {
        setUnpaidExpenses([]);
        setSelectedExpenseIds([]);
        setError('');

        if (!selectedGroupId || !selectedTo) return;

        fetchUnpaidExpenses();
    }, [selectedTo]);

    const fetchGroupMembers = async () => {
        try {
            const res = await axios.get(BASE_URL + `/group/${selectedGroupId}`, { withCredentials: true });
            console.log("Members", res);
            const otherMembers = res.data.group.members.filter(m => m._id !== loggedInUser._id);
            setGroupMembers(otherMembers);
        } catch (err) {
            setError('Could not load group members.');
        }
    };

    const fetchUnpaidExpenses = async () => {
        try {
            const res = await axios.get(
                BASE_URL + `/expense/unpaid?groupId=${selectedGroupId}&to=${selectedTo}`,
                { withCredentials: true }
            );
            setUnpaidExpenses(res.data);
        } catch (err) {
            setError('Could not load expenses.');
        }
    };

    const handleToggleExpense = (expenseId) => {
        if (selectedExpenseIds.includes(expenseId)) {
            setSelectedExpenseIds(prev => prev.filter(id => id !== expenseId));
        } else {
            setSelectedExpenseIds(prev => [...prev, expenseId]);
        }
    };

    const handleSelectAll = () => {
        const allIds = unpaidExpenses.map(e => e._id);
        const allSelected = allIds.every(id => selectedExpenseIds.includes(id));
        if (allSelected) {
            setSelectedExpenseIds([]);
        } else {
            setSelectedExpenseIds(allIds);
        }
    };

    const totalAmount = unpaidExpenses
        .filter(e => selectedExpenseIds.includes(e._id))
        .reduce((sum, e) => {
            const myShare = e.splitAmong.find(s => s.user === loggedInUser._id);
            return sum + (myShare ? myShare.amount : 0);
        }, 0);

    const handleConfirmSettlement = async () => {
        if (selectedExpenseIds.length === 0) {
            setError('Select at least one expense to settle.');
            return;
        }
        try {
            await axios.post(
                BASE_URL + '/settlement/settle',
                {
                    from: loggedInUser._id,
                    to: selectedTo,
                    groupId: selectedGroupId,
                    amount: totalAmount,
                    expenseIds: selectedExpenseIds,
                },
                { withCredentials: true }
            );
            setSuccessMsg('Expenses settled successfully!');
            setSelectedExpenseIds([]);
            setUnpaidExpenses([]);
            setSelectedTo('');
            setSelectedGroupId('');
            setError('');
        } catch (err) {
            setError('Error settling expenses. Please try again.');
        }
    };

    return (
        <div>

            {/* Header */}
            <div className="border-b-2 border-b-[#001A28] text-white px-4 pt-4 pb-2">
                <h1 className="text-xl font-semibold">Settle up</h1>
                <p className="text-sm text-[#C3B09B] mt-1">
                    Choose a group, pick the expenses you're clearing, and confirm.
                </p>
            </div>

            <div className="px-4 py-6 flex flex-col gap-5 max-w-xl">

                {/* Group selector */}
                <div>
                    <label className="text-sm text-[#C3B09B] mb-1 block">Group</label>
                    <select
                        value={selectedGroupId}
                        onChange={(e) => setSelectedGroupId(e.target.value)}
                        className="w-full bg-[#001A28] border border-[#414C51] rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:border-[#C3B09B]"
                    >
                        <option value="">Select a group…</option>
                        {groups.map(g => (
                            <option key={g.groupId} value={g.groupId}>{g.groupName}</option>
                        ))}
                    </select>
                </div>

                {/* Settle with selector — shown after group is picked */}
                {selectedGroupId && (
                    <div>
                        <label className="text-sm text-[#C3B09B] mb-1 block">Who are you settling with?</label>
                        <select
                            value={selectedTo}
                            onChange={(e) => setSelectedTo(e.target.value)}
                            className="w-full bg-[#001A28] border border-[#414C51] rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:border-[#C3B09B]"
                        >
                            <option value="">Select person…</option>
                            {groupMembers.map(member => (
                                <option key={member._id} value={member._id}>{member.name}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Expense list — shown after person is picked */}
                {selectedTo && unpaidExpenses.length > 0 && (
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-sm text-[#C3B09B]">Expenses to settle</label>
                            <button
                                onClick={handleSelectAll}
                                className="text-xs text-[#a3e635] cursor-pointer bg-transparent border-none"
                            >
                                {unpaidExpenses.every(e => selectedExpenseIds.includes(e._id)) ? 'Deselect all' : 'Select all'}
                            </button>
                        </div>
                        <div className="bg-[#001A28] border border-[#414C51] rounded-md overflow-hidden">
                            {unpaidExpenses.map((expense, index) => {
                                const isChecked = selectedExpenseIds.includes(expense._id);
                                const myShare = expense.splitAmong.find(s => s.user === loggedInUser._id);
                                return (
                                    <div
                                        key={expense._id}
                                        onClick={() => handleToggleExpense(expense._id)}
                                        className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors
                                            ${index !== unpaidExpenses.length - 1 ? 'border-b border-[#1e2530]' : ''}
                                            ${isChecked ? 'bg-[#0E2C38]' : 'hover:bg-[#001f30]'}
                                        `}
                                    >
                                        {/* Checkbox */}
                                        <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border
                                            ${isChecked ? 'bg-[#a3e635] border-[#a3e635]' : 'border-[#414C51] bg-transparent'}
                                        `}>
                                            {isChecked && (
                                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                                    <polyline points="1.5,5 4,7.5 8.5,2.5" stroke="#111827" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            )}
                                        </div>

                                        {/* Expense name */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-white truncate">{expense.description}</p>
                                        </div>

                                        {/* Amount */}
                                        <p className={`text-sm font-medium flex-shrink-0 ${isChecked ? 'text-[#a3e635]' : 'text-[#f87171]'}`}>
                                            ₹{myShare ? myShare.amount.toLocaleString('en-IN') : 0}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Empty state when person is picked but no expenses */}
                {selectedTo && unpaidExpenses.length === 0 && (
                    <p className="text-sm text-[#414C51] text-center py-4">No unpaid expenses with this person.</p>
                )}

                {/* Total */}
                {selectedExpenseIds.length > 0 && (
                    <div>
                        <label className="text-sm text-[#C3B09B] mb-1 block">Total amount</label>
                        <div className="w-full bg-[#001A28] border border-[#414C51] rounded-md px-3 py-2 text-[#a3e635] text-sm font-semibold">
                            ₹{totalAmount.toLocaleString('en-IN')}
                        </div>
                    </div>
                )}

                {/* Confirm button */}
                {selectedTo && (
                    <button
                        onClick={handleConfirmSettlement}
                        disabled={selectedExpenseIds.length === 0}
                        className={`w-full border-2 rounded-md py-2 px-4 font-semibold text-sm cursor-pointer transition-colors
                            ${selectedExpenseIds.length > 0
                                ? 'border-[#a3e635] text-[#a3e635] bg-[#0E2C38] hover:bg-[#1a3d1a]'
                                : 'border-[#414C51] text-[#414C51] bg-transparent cursor-not-allowed'
                            }
                        `}
                    >
                        Confirm settlement
                    </button>
                )}

                {/* Error / success messages */}
                {error && <p className="text-red-400 text-sm">{error}</p>}
                {successMsg && <p className="text-green-400 text-sm">{successMsg}</p>}

            </div>
        </div>
    );
};

export default SettleUp;