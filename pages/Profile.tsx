
import React, { useState } from 'react';
import { useAuth } from '../App';
import { dbOps, uploadImage } from '../dbService';
import { Link } from 'react-router-dom';

const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      await dbOps.update(`users/${user.uid}`, { name, phone });
      await refreshUser();
      alert('Profile updated successfully!');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setLoading(true);
    try {
      const url = await uploadImage(file);
      await dbOps.update(`users/${user.uid}`, { profilePic: url });
      await refreshUser();
      alert('Photo updated!');
    } catch (err) {
      alert('Photo upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-24 bg-indigo-600"></div>
        <div className="relative z-10">
          <div className="w-32 h-32 mx-auto rounded-full border-4 border-white shadow-xl overflow-hidden bg-gray-200 group relative">
            <img 
              src={user?.profilePic || 'https://picsum.photos/200'} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
            <label className="absolute inset-0 bg-black/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
              <span className="text-xs font-bold">CHANGE</span>
              <input type="file" className="hidden" onChange={handlePhotoUpload} />
            </label>
          </div>
          <h2 className="mt-4 text-3xl font-extrabold text-gray-900">{user?.name}</h2>
          <div className="flex items-center justify-center gap-2 mt-1">
            <p className="text-gray-400 capitalize">{user?.role} Account • Joined {new Date(user?.createdAt || 0).toLocaleDateString()}</p>
            {user?.role === 'admin' && (
              <span className="bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded-full font-bold">OFFICIAL</span>
            )}
          </div>
        </div>
      </div>

      {user?.role === 'admin' && (
        <div className="bg-indigo-600 p-8 rounded-3xl text-white shadow-xl flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold">Admin Privileges Active</h3>
            <p className="text-indigo-100 text-sm">You have full access to the management suite.</p>
          </div>
          <Link to="/admin" className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-all">
            Open Admin Panel
          </Link>
        </div>
      )}

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Personal Information</h3>
        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Full Name</label>
              <input 
                className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Email (Locked)</label>
              <input 
                className="w-full p-4 rounded-xl bg-gray-100 border border-gray-200 outline-none text-gray-400"
                value={user?.email}
                disabled
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Phone Number</label>
            <input 
              className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+8801XXXXXXXXX"
            />
          </div>
          
          <div className="pt-4">
            <button 
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? 'Saving Changes...' : 'Update Profile'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-red-50 p-6 rounded-3xl border border-red-100">
        <h4 className="text-red-700 font-bold mb-2">Account Security</h4>
        <p className="text-sm text-red-600 mb-4">You can request a password reset email to change your credentials.</p>
        <button className="bg-white text-red-600 px-6 py-2.5 rounded-xl text-sm font-bold border border-red-200 hover:bg-red-100 transition-all">
          Reset Password
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
