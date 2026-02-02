
import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { dbOps } from '../dbService';
import { Transaction, AppConfig } from '../types';

const WalletPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'bKash' | 'Nagad'>('bKash');
  const [history, setHistory] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dbOps.listen('config', setConfig);
    dbOps.listen('transactions', (data) => {
      if (data) {
        const userTxs = Object.keys(data)
          .map(key => ({ id: key, ...data[key] }))
          .filter(tx => tx.uid === user?.uid)
          .sort((a, b) => b.timestamp - a.timestamp);
        setHistory(userTxs);
      }
    });
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !amount || parseInt(amount) < 10) return alert('Enter valid amount (Min ৳10)');
    setLoading(true);
    try {
      await dbOps.push('transactions', {
        uid: user.uid,
        userName: user.name,
        amount: parseInt(amount),
        method,
        type: 'deposit',
        status: 'pending',
        timestamp: Date.now()
      });
      alert('Deposit request submitted! Please send money to the official number below.');
      setAmount('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-10 rounded-3xl text-white shadow-xl flex items-center justify-between">
        <div>
          <p className="text-orange-100 font-semibold uppercase tracking-wider text-sm mb-1">Available Balance</p>
          <h2 className="text-5xl font-extrabold">৳ {user?.balance?.toLocaleString() || 0}</h2>
        </div>
        <div className="hidden md:block text-6xl opacity-30">💰</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
          <h3 className="text-xl font-bold text-gray-800">Add Balance</h3>
          <div className="bg-gray-50 p-6 rounded-2xl space-y-4">
            <p className="text-sm font-semibold text-gray-500">Official Payment Channels:</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100">
                <span className="font-bold text-pink-500">bKash (Personal):</span>
                <span className="font-mono text-gray-700">{config?.bkashNumber || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100">
                <span className="font-bold text-orange-500">Nagad (Personal):</span>
                <span className="font-mono text-gray-700">{config?.nagadNumber || 'N/A'}</span>
              </div>
            </div>
            <p className="text-[10px] text-gray-400 italic">Instruction: Send Money to any number above, then submit the form below with the amount sent.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Select Gateway</label>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  type="button" 
                  onClick={() => setMethod('bKash')}
                  className={`py-3 rounded-xl border-2 font-bold transition-all ${method === 'bKash' ? 'border-pink-500 text-pink-600 bg-pink-50' : 'border-gray-100 text-gray-400'}`}
                >
                  bKash
                </button>
                <button 
                  type="button" 
                  onClick={() => setMethod('Nagad')}
                  className={`py-3 rounded-xl border-2 font-bold transition-all ${method === 'Nagad' ? 'border-orange-500 text-orange-600 bg-orange-50' : 'border-gray-100 text-gray-400'}`}
                >
                  Nagad
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Amount to Add</label>
              <input 
                type="number" 
                required
                className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500 text-lg font-bold"
                placeholder="৳ 500"
                value={amount}
                onChange={e => setAmount(e.target.value)}
              />
            </div>
            <button 
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Notify Payment'}
            </button>
          </form>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Recent History</h3>
          <div className="flex-1 space-y-4 overflow-y-auto max-h-[400px] pr-2">
            {history.length === 0 ? (
              <div className="text-center py-10 text-gray-400">No transactions yet.</div>
            ) : (
              history.map(tx => (
                <div key={tx.id} className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between border border-transparent hover:border-indigo-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${tx.status === 'approved' ? 'bg-green-100 text-green-600' : tx.status === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                      {tx.status === 'approved' ? '✓' : tx.status === 'rejected' ? '✕' : '?'}
                    </div>
                    <div>
                      <p className="font-bold text-gray-700 capitalize">{tx.method} Deposit</p>
                      <p className="text-[10px] text-gray-400">{new Date(tx.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">+৳{tx.amount}</p>
                    <p className={`text-[10px] font-bold uppercase tracking-wider ${tx.status === 'approved' ? 'text-green-500' : tx.status === 'rejected' ? 'text-red-500' : 'text-orange-500'}`}>
                      {tx.status}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletPage;
