import React, { useState } from 'react';
import { X, Wallet, CreditCard, Plus, ArrowUpRight, ArrowDownLeft, Check, Sparkles } from 'lucide-react';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  balance: number;
  onAddMoney: (amount: number) => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  balance,
  onAddMoney
}) => {
  const [customAmount, setCustomAmount] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const quickAmounts = [500, 1000, 2000, 5000];

  const handleAdd = (amount: number) => {
    onAddMoney(amount);
    setSuccessMsg(`₹${amount} added successfully to DriverBee Wallet!`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const code = promoCode.trim().toUpperCase();
    if (code === 'WARANGAL100' || code === 'BENGALURU100') {
      onAddMoney(100);
      setPromoApplied(true);
      setSuccessMsg('Promo code applied! ₹100 added.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } else {
      setSuccessMsg('Invalid promo code. Try "WARANGAL100"');
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-fade-in">
      
      <div 
        className="w-full max-w-[480px] bg-white rounded-3xl border border-navy-200 shadow-modal overflow-hidden transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-navy-100 flex items-center justify-between bg-[#FAFBFD]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-bee-50 text-bee-700 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-bee-700">Instant Payments</span>
              <h3 className="text-lg font-extrabold text-navy-950">DriverBee Wallet</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-navy-100 hover:bg-navy-200 text-navy-700 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Balance Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-navy-950 via-navy-900 to-navy-850 text-white shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-bee-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-navy-300 uppercase tracking-wider">Available Balance</span>
                <div className="text-3xl sm:text-4xl font-black text-white mt-1">
                  ₹{balance.toLocaleString('en-IN')}
                </div>
              </div>
              <span className="text-[11px] font-bold text-bee-400 bg-bee-950/80 border border-bee-500/30 px-2.5 py-1 rounded-full">
                Auto-Deduct Active
              </span>
            </div>
            <div className="relative z-10 mt-4 pt-3 border-t border-navy-800 text-[11px] text-navy-400 flex items-center justify-between">
              <span>Zero cancellation deductions</span>
              <span>100% Instant Refund</span>
            </div>
          </div>

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold animate-fade-in flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Quick Add Money */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-navy-700 mb-2">
              Quick Top-up (UPI / Cards)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  onClick={() => handleAdd(amt)}
                  className="py-2.5 px-2 bg-navy-50 hover:bg-bee-50 hover:border-bee-500 border border-navy-200 rounded-xl text-xs font-bold text-navy-900 transition-colors"
                >
                  +₹{amt}
                </button>
              ))}
            </div>
          </div>

          {/* Promo Code Form */}
          <form onSubmit={handleApplyPromo} className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-navy-700">
              Have a Promo Code?
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Try 'WARANGAL100'"
                className="flex-1 px-3 py-2 text-xs bg-navy-50 border border-navy-200 rounded-xl uppercase tracking-wider font-semibold focus:outline-none focus:ring-2 focus:ring-bee-500/40 text-navy-900"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-navy-900 hover:bg-bee-600 text-white text-xs font-bold rounded-xl transition-colors"
              >
                Apply
              </button>
            </div>
          </form>

          {/* Recent Activity */}
          <div className="space-y-2 pt-2 border-t border-navy-100">
            <span className="text-xs font-bold uppercase tracking-wider text-navy-500 block">
              Recent Transactions
            </span>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-navy-50 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <ArrowDownLeft className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-bold text-navy-950">Wallet Top-up (UPI)</div>
                    <div className="text-[10px] text-navy-400">Today, 09:15 AM</div>
                  </div>
                </div>
                <span className="font-bold text-emerald-600">+₹1,000</span>
              </div>

              <div className="p-2.5 bg-navy-50 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-navy-200 text-navy-700 flex items-center justify-center">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-bold text-navy-950">Ride #3 (Within City)</div>
                    <div className="text-[10px] text-navy-400">Yesterday, 07:30 PM</div>
                  </div>
                </div>
                <span className="font-bold text-navy-900">-₹315</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
