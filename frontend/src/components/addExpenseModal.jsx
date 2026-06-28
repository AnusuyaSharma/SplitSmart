import React, { useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../utils/constants';
import getInitials from '../../utils/getInitials';
import { useSelector } from 'react-redux';

const AddExpenseModal = ({ groupId, members, onClose, onSuccess }) => {
  const user = useSelector((store) => store.user);

  const [desc, setDesc] = useState('');
  const [amt, setAmt] = useState('');
  const [paidBy, setPaidBy] = useState(user._id);
  const [checked, setChecked] = useState(new Set());
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const amount = parseFloat(amt) || 0;
  const share = checked.size > 0 ? Math.round((amount / checked.size) * 100) / 100 : 0;
  const totalShares = Math.round(share * checked.size * 100) / 100;
  const isBalanced = amount > 0 && checked.size > 0 && Math.abs(totalShares - amount) < 0.02;

  const toggleMember = (id) => {
    setChecked(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSubmit = async () => {
    setError('');
    if (!desc.trim()) return setError('Description is required.');
    if (amount <= 0)  return setError('Enter a valid amount.');
    if (checked.size === 0) return setError('Select at least one member.');
    if (!isBalanced)  return setError('Shares must add up to the total amount.');

    const splitAmong = members
      .filter(m => checked.has(m._id))
      .map(m => ({
        user: m._id,
        share,
        isPaid: m._id === paidBy
      }));

    try {
      setLoading(true);
      await axios.post(
        BASE_URL + '/expense/add',
        { groupId, desc, amt: amount, paidBy, splitAmong },
        { withCredentials: true }
      );
      onSuccess();
    } catch (err) {
      setError('Failed to add expense. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#001A28] border border-[#414C51] rounded-md w-[460px] overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#00111D] px-4 py-3 flex items-center justify-between border-b border-[#414C51]">
          <h2 className="text-sm font-semibold text-[#C3B09B]">Add expense</h2>
          <button onClick={onClose} className="text-[#414C51] hover:text-[#C3B09B] text-lg cursor-pointer bg-transparent border-none">✕</button>
        </div>

        {/* Body */}
        <div className="p-4 flex flex-col gap-3">

          {/* Description */}
          <div>
            <label className="text-[11px] font-medium text-[#C3B09B] uppercase tracking-wider block mb-1">Description</label>
            <input
              className="w-full bg-[#00111D] border border-[#414C51] rounded-sm px-3 py-2 text-sm text-[#C3B09B] outline-none focus:border-[#a3e635] placeholder:text-[#2e3d45]"
              placeholder="Hotel stay, dinner, cab…"
              value={desc}
              onChange={e => setDesc(e.target.value)}
            />
          </div>

          {/* Amount + Paid by */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-[#C3B09B] uppercase tracking-wider block mb-1">Amount (₹)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#414C51] text-sm">₹</span>
                <input
                  type="number"
                  className="w-full bg-[#00111D] border border-[#414C51] rounded-sm pl-6 pr-3 py-2 text-sm text-[#C3B09B] outline-none focus:border-[#a3e635]"
                  placeholder="0"
                  value={amt}
                  onChange={e => setAmt(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-medium text-[#C3B09B] uppercase tracking-wider block mb-1">Paid by</label>
              <select
                className="w-full bg-[#00111D] border border-[#414C51] rounded-sm px-3 py-2 text-sm text-[#C3B09B] outline-none focus:border-[#a3e635]"
                value={paidBy}
                onChange={e => setPaidBy(e.target.value)}
              >
                {members.map(m => (
                  <option key={m._id} value={m._id}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Split among */}
          <div>
            <label className="text-[11px] font-medium text-[#C3B09B] uppercase tracking-wider block mb-1">Split among</label>
            <p className="text-[11px] text-[#2e3d45] mb-2">Check members to include in this expense</p>
            <div className="flex flex-col gap-1">
              {members.map(m => {
                const isChecked = checked.has(m._id);
                return (
                  <div
                    key={m._id}
                    onClick={() => toggleMember(m._id)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-sm border cursor-pointer transition-colors
                      ${isChecked ? 'border-[#a3e635] bg-[#00111D]' : 'border-[#414C51] bg-[#00111D] hover:border-[#6b7a82]'}`}
                  >
                    {/* Checkbox */}
                    <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border transition-colors
                      ${isChecked ? 'bg-[#a3e635] border-[#a3e635]' : 'border-[#414C51]'}`}>
                      {isChecked && <span className="text-[#001A28] text-[10px] font-bold">✓</span>}
                    </div>
                    {/* Avatar */}
                    <div className="w-7 h-7 rounded-full bg-[#003843] flex items-center justify-center text-[10px] font-medium text-[#a3e635] flex-shrink-0">
                      {getInitials(m.name)}
                    </div>
                    <span className={`text-sm flex-1 ${isChecked ? 'text-[#C3B09B]' : 'text-[#414C51]'}`}>{m.name}</span>
                    <span className={`text-sm font-medium ${isChecked ? 'text-[#a3e635]' : 'text-[#2e3d45]'}`}>
                      {isChecked ? `₹${share.toFixed(2).replace(/\.00$/, '')}` : '—'}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Total bar */}
            <div className="flex justify-between items-center px-3 py-2 bg-[#00111D] rounded-sm border border-[#414C51] mt-2">
              <span className="text-[11px] text-[#414C51]">Shares total</span>
              <span className={`text-xs font-medium ${isBalanced ? 'text-[#a3e635]' : 'text-[#e0a07a]'}`}>
                {checked.size > 0 ? `₹${totalShares} / ₹${amount}` : `— / ₹${amount || 0}`}
              </span>
            </div>
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}
        </div>

        {/* Footer */}
        <div className="bg-[#00111D] border-t border-[#414C51] px-4 py-3 flex justify-end gap-2">
          <button onClick={onClose} className="border border-[#414C51] text-[#C3B09B] text-sm font-medium px-4 py-2 rounded-sm cursor-pointer bg-transparent hover:border-[#C3B09B]">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isBalanced || loading}
            className="bg-[#a3e635] text-[#001A28] text-sm font-medium px-4 py-2 rounded-sm cursor-pointer disabled:bg-[#1a3020] disabled:text-[#414C51] disabled:cursor-not-allowed"
          >
            {loading ? 'Adding…' : '+ Add expense'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default AddExpenseModal;